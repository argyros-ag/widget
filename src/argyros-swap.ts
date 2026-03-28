import { ArgyrosSDK } from "@argyros/sdk";
import type { Chain, QuoteResponse, SwapResponse } from "@argyros/sdk";
import { WIDGET_CSS } from "./ui/styles";
import { Store, createInitialState } from "./state/store";
import type { WidgetState } from "./state/store";
import { shortenAddress } from "./utils/format";

const DEBOUNCE_MS = 400;

const ARROW_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`;
const CHEVRON_SVG = `<svg viewBox="0 0 10 6" width="8" height="5" fill="currentColor"><path d="M1 1l4 4 4-4"/></svg>`;

export class ArgyrosSwapElement extends HTMLElement {
  private shadow: ShadowRoot;
  private sdk!: ArgyrosSDK;
  private store!: Store;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribe: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return [
      "api-key",
      "chain",
      "base-url",
      "default-input-mint",
      "default-output-mint",
      "theme",
    ];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    const apiKey = this.getAttribute("api-key") || "";
    const chain = (this.getAttribute("chain") as Chain) || "solana";
    const baseUrl = this.getAttribute("base-url") || undefined;
    const inputMint = this.getAttribute("default-input-mint") || "";
    const outputMint = this.getAttribute("default-output-mint") || "";

    this.sdk = new ArgyrosSDK({ apiKey, chain, baseUrl });
    this.store = new Store(createInitialState(inputMint, outputMint));
    this.unsubscribe = this.store.subscribe(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  attributeChangedCallback(): void {
    if (!this.store) return;
    const apiKey = this.getAttribute("api-key") || "";
    const chain = (this.getAttribute("chain") as Chain) || "solana";
    const baseUrl = this.getAttribute("base-url") || undefined;
    this.sdk = new ArgyrosSDK({ apiKey, chain, baseUrl });
  }

  private emit(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private async fetchQuote(): Promise<void> {
    const { inputMint, outputMint, inputAmount, slippageBps } = this.store.getState();
    if (!inputMint || !outputMint || !inputAmount || inputAmount === "0") {
      this.store.setState({ quote: null, outputAmount: "", status: "idle" });
      return;
    }

    this.store.setState({ status: "quoting", error: "" });

    try {
      const quote = await this.sdk.quote({
        inputMint,
        outputMint,
        amount: inputAmount,
        swapMode: "ExactIn",
        slippageBps,
      });
      this.store.setState({
        quote,
        outputAmount: quote.amountOut,
        status: "idle",
      });
      this.emit("quote-update", quote);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Quote failed";
      this.store.setState({ status: "error", error: msg, quote: null, outputAmount: "" });
    }
  }

  private debouncedQuote(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.fetchQuote(), DEBOUNCE_MS);
  }

  private async executeSwap(): Promise<void> {
    const { inputMint, outputMint, inputAmount, slippageBps, walletAddress } = this.store.getState();
    if (!walletAddress) {
      this.store.setState({ error: "Connect wallet first" });
      return;
    }

    this.store.setState({ status: "swapping", error: "" });
    this.emit("swap-initiated", { inputMint, outputMint, amount: inputAmount });

    try {
      const result: SwapResponse = await this.sdk.swap({
        userWallet: walletAddress,
        inputMint,
        outputMint,
        amount: inputAmount,
        swapMode: "ExactIn",
        slippageBps,
      });
      this.store.setState({ status: "success" });
      this.emit("swap-complete", result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      this.store.setState({ status: "error", error: msg });
      this.emit("swap-error", { error: msg });
    }
  }

  private handleSwapDirection(): void {
    const { inputMint, outputMint } = this.store.getState();
    this.store.setState({
      inputMint: outputMint,
      outputMint: inputMint,
      inputAmount: "",
      outputAmount: "",
      quote: null,
      status: "idle",
    });
  }

  public setWallet(address: string): void {
    this.store.setState({ walletAddress: address });
  }

  private getButtonText(state: WidgetState): string {
    if (!state.walletAddress) return "Connect Wallet";
    if (state.status === "quoting") return "Fetching Quote...";
    if (state.status === "swapping") return "Swapping...";
    if (!state.inputAmount) return "Enter Amount";
    if (!state.inputMint || !state.outputMint) return "Select Tokens";
    return "Swap";
  }

  private isButtonDisabled(state: WidgetState): boolean {
    if (!state.walletAddress) return false;
    return (
      state.status === "quoting" ||
      state.status === "swapping" ||
      !state.inputAmount ||
      !state.inputMint ||
      !state.outputMint
    );
  }

  private renderQuoteInfo(quote: QuoteResponse): string {
    const impactClass =
      quote.priceImpactSeverity === "high" || quote.priceImpactSeverity === "extreme"
        ? "impact-high"
        : quote.priceImpactSeverity === "moderate"
          ? "impact-warning"
          : "";

    return `
      <div class="route-info">
        <div class="route-info-row">
          <span class="route-info-label">Price Impact</span>
          <span class="${impactClass}">${quote.priceImpactPercent}</span>
        </div>
        <div class="route-info-row">
          <span class="route-info-label">Route</span>
          <span>${quote.hopCount} hop${quote.hopCount > 1 ? "s" : ""} via ${quote.routes.map((r) => r.poolType).join(" → ")}</span>
        </div>
        <div class="route-info-row">
          <span class="route-info-label">Fee</span>
          <span>${(quote.feeBps / 100).toFixed(2)}%</span>
        </div>
        <div class="route-info-row">
          <span class="route-info-label">Min Received</span>
          <span>${quote.otherAmountThreshold}</span>
        </div>
      </div>
    `;
  }

  private render(): void {
    const state = this.store.getState();
    const btnText = this.getButtonText(state);
    const btnDisabled = this.isButtonDisabled(state);
    const showSpinner = state.status === "quoting" || state.status === "swapping";

    this.shadow.innerHTML = `
      <style>${WIDGET_CSS}</style>
      <div class="swap-container">
        <div class="token-panel">
          <div class="token-panel-label">You're selling</div>
          <div class="token-row">
            <input
              class="amount-input"
              type="text"
              inputmode="decimal"
              placeholder="0.00"
              value="${state.inputAmount}"
              data-action="input-amount"
            />
            <div class="token-badge" data-action="select-input">
              ${shortenAddress(state.inputMint || "Select", 3)}
              ${CHEVRON_SVG}
            </div>
          </div>
          <div class="sub-row">
            <span>${state.walletAddress ? shortenAddress(state.walletAddress) : ""}</span>
          </div>
        </div>

        <div class="swap-direction">
          <button class="swap-direction-btn" data-action="swap-direction">${ARROW_SVG}</button>
        </div>

        <div class="token-panel">
          <div class="token-panel-label">To buy</div>
          <div class="token-row">
            <input
              class="amount-input"
              type="text"
              placeholder="0.00"
              value="${state.outputAmount}"
              disabled
            />
            <div class="token-badge" data-action="select-output">
              ${shortenAddress(state.outputMint || "Select", 3)}
              ${CHEVRON_SVG}
            </div>
          </div>
        </div>

        <button
          class="swap-btn"
          ${btnDisabled ? "disabled" : ""}
          data-action="swap"
        >${showSpinner ? '<span class="loading-spinner"></span>' : ""}${btnText}</button>

        ${state.quote ? this.renderQuoteInfo(state.quote) : ""}
        ${state.status === "error" ? `<div class="error-msg">${state.error}</div>` : ""}
        ${state.status === "success" ? `<div class="success-msg">Swap successful!</div>` : ""}
      </div>
    `;

    this.shadow.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement).closest("[data-action]");
      if (!target) return;
      const action = (target as HTMLElement).dataset.action;
      if (action === "swap-direction") this.handleSwapDirection();
      if (action === "swap") {
        if (!state.walletAddress) {
          this.emit("connect-wallet", {});
        } else {
          this.executeSwap();
        }
      }
    });

    const amountInput = this.shadow.querySelector('[data-action="input-amount"]') as HTMLInputElement;
    if (amountInput) {
      amountInput.addEventListener("input", (e) => {
        const val = (e.target as HTMLInputElement).value.replace(/[^0-9.]/g, "");
        this.store.setState({ inputAmount: val });
        this.debouncedQuote();
      });
    }
  }
}

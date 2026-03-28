class ArgyrosError extends Error {
    constructor(message, statusCode, body) {
        super(message);
        this.statusCode = statusCode;
        this.body = body;
        this.name = "ArgyrosError";
    }
}
class RateLimitError extends ArgyrosError {
    constructor(body) {
        super("Rate limit exceeded", 429, body);
        this.name = "RateLimitError";
    }
}
class NoRouteError extends ArgyrosError {
    constructor(body) {
        super("No route found", 404, body);
        this.name = "NoRouteError";
    }
}
class BadRequestError extends ArgyrosError {
    constructor(message, body) {
        super(message, 400, body);
        this.name = "BadRequestError";
    }
}
class AuthError extends ArgyrosError {
    constructor(body) {
        super("Invalid or missing API key", 401, body);
        this.name = "AuthError";
    }
}
class ServerError extends ArgyrosError {
    constructor(message, body) {
        super(message, 500, body);
        this.name = "ServerError";
    }
}

const DEFAULT_BASE_URL = "https://api.argyros.trade";
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 2;
class ArgyrosSDK {
    constructor(config) {
        if (!config.apiKey)
            throw new Error("apiKey is required");
        this.apiKey = config.apiKey;
        this.chain = config.chain ?? "solana";
        this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
        this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
        this.retries = config.retries ?? DEFAULT_RETRIES;
    }
    async quote(params) {
        const qs = new URLSearchParams({
            inputMint: params.inputMint,
            outputMint: params.outputMint,
            amount: params.amount,
            swapMode: params.swapMode,
        });
        if (params.slippageBps !== undefined) {
            qs.set("slippageBps", String(params.slippageBps));
        }
        return this.request("GET", `/api/v1/quote?${qs}`);
    }
    async swap(params) {
        return this.request("POST", "/api/v1/swap", params);
    }
    async instructions(params) {
        return this.request("POST", "/api/v1/instructions", params);
    }
    async request(method, path, body) {
        const separator = path.includes("?") ? "&" : "?";
        const url = `${this.baseUrl}${path}${separator}chain=${this.chain}`;
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "application/json",
        };
        if (body) {
            headers["Content-Type"] = "application/json";
        }
        let lastError;
        for (let attempt = 0; attempt <= this.retries; attempt++) {
            if (attempt > 0) {
                await sleep(Math.min(1000 * 2 ** (attempt - 1), 8000));
            }
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), this.timeout);
                const res = await fetch(url, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                });
                clearTimeout(timer);
                if (res.ok) {
                    return (await res.json());
                }
                const errBody = await res.json().catch(() => ({}));
                const errMsg = errBody?.error ?? res.statusText;
                switch (res.status) {
                    case 401:
                    case 403:
                        throw new AuthError(errBody);
                    case 400:
                        throw new BadRequestError(errMsg, errBody);
                    case 404:
                        throw new NoRouteError(errBody);
                    case 429:
                        lastError = new RateLimitError(errBody);
                        continue;
                    default:
                        if (res.status >= 500) {
                            lastError = new ServerError(errMsg, errBody);
                            continue;
                        }
                        throw new ArgyrosError(errMsg, res.status, errBody);
                }
            }
            catch (err) {
                if (err instanceof AuthError ||
                    err instanceof BadRequestError ||
                    err instanceof NoRouteError ||
                    err instanceof ArgyrosError) {
                    throw err;
                }
                lastError = err;
            }
        }
        throw lastError ?? new Error("request failed");
    }
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const CSS_VARS = {
    "--argyros-bg": "#0a0a0f",
    "--argyros-surface": "#141419",
    "--argyros-surface-hover": "#1c1c24",
    "--argyros-border": "#2a2a35",
    "--argyros-text": "#e8e8ed",
    "--argyros-text-secondary": "#8b8b9a",
    "--argyros-accent": "#c8ff00",
    "--argyros-accent-hover": "#d4ff33",
    "--argyros-error": "#ff4d6a",
    "--argyros-warning": "#ffaa00",
    "--argyros-success": "#00d68f",
    "--argyros-radius": "16px",
    "--argyros-radius-sm": "10px",
    "--argyros-font": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const defaultVars = Object.entries(CSS_VARS)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n  ");
const WIDGET_CSS = `
:host {
  ${defaultVars}
  display: block;
  font-family: var(--argyros-font);
  color: var(--argyros-text);
  box-sizing: border-box;
}

:host([theme="light"]) {
  --argyros-bg: #ffffff;
  --argyros-surface: #f5f5f7;
  --argyros-surface-hover: #ebebef;
  --argyros-border: #d4d4dc;
  --argyros-text: #1a1a2e;
  --argyros-text-secondary: #6b6b7a;
  --argyros-accent: #1a1a2e;
  --argyros-accent-hover: #2d2d45;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.swap-container {
  background: var(--argyros-bg);
  border-radius: var(--argyros-radius);
  padding: 16px;
  max-width: 420px;
  width: 100%;
  border: 1px solid var(--argyros-border);
}

.token-panel {
  background: var(--argyros-surface);
  border-radius: var(--argyros-radius-sm);
  padding: 16px;
  margin-bottom: 4px;
  position: relative;
}

.token-panel-label {
  font-size: 13px;
  color: var(--argyros-text-secondary);
  margin-bottom: 8px;
}

.token-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.amount-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 600;
  color: var(--argyros-text);
  font-family: var(--argyros-font);
  min-width: 0;
}

.amount-input::placeholder {
  color: var(--argyros-text-secondary);
  opacity: 0.5;
}

.amount-input:disabled {
  opacity: 0.7;
}

.token-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--argyros-surface-hover);
  border: 1px solid var(--argyros-border);
  border-radius: 20px;
  padding: 6px 12px 6px 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: var(--argyros-text);
  white-space: nowrap;
  transition: background 0.15s;
}

.token-badge:hover {
  background: var(--argyros-border);
}

.token-badge svg {
  width: 8px;
  height: 8px;
  opacity: 0.5;
}

.sub-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--argyros-text-secondary);
}

.swap-direction {
  display: flex;
  justify-content: center;
  margin: -8px 0;
  position: relative;
  z-index: 1;
}

.swap-direction-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid var(--argyros-bg);
  background: var(--argyros-surface);
  color: var(--argyros-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.2s;
}

.swap-direction-btn:hover {
  background: var(--argyros-surface-hover);
  transform: rotate(180deg);
}

.swap-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--argyros-radius-sm);
  background: var(--argyros-accent);
  color: var(--argyros-bg);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
  font-family: var(--argyros-font);
  transition: background 0.15s, opacity 0.15s;
}

.swap-btn:hover:not(:disabled) {
  background: var(--argyros-accent-hover);
}

.swap-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.route-info {
  margin-top: 12px;
  padding: 12px;
  background: var(--argyros-surface);
  border-radius: var(--argyros-radius-sm);
  font-size: 12px;
  color: var(--argyros-text-secondary);
}

.route-info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.route-info-label {
  opacity: 0.7;
}

.impact-warning {
  color: var(--argyros-warning);
}

.impact-high {
  color: var(--argyros-error);
}

.error-msg {
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(255, 77, 106, 0.1);
  border: 1px solid rgba(255, 77, 106, 0.2);
  border-radius: var(--argyros-radius-sm);
  color: var(--argyros-error);
  font-size: 13px;
}

.success-msg {
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(0, 214, 143, 0.1);
  border: 1px solid rgba(0, 214, 143, 0.2);
  border-radius: var(--argyros-radius-sm);
  color: var(--argyros-success);
  font-size: 13px;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--argyros-text-secondary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.half-max-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.half-max-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--argyros-border);
  background: transparent;
  color: var(--argyros-text-secondary);
  cursor: pointer;
  font-family: var(--argyros-font);
  transition: background 0.15s;
}

.half-max-btn:hover {
  background: var(--argyros-surface-hover);
}
`;

function createInitialState(inputMint, outputMint) {
    return {
        inputMint,
        outputMint,
        inputAmount: "",
        outputAmount: "",
        slippageBps: 50,
        quote: null,
        status: "idle",
        error: "",
        walletAddress: "",
    };
}
class Store {
    constructor(initial) {
        this.listeners = new Set();
        this.state = { ...initial };
    }
    getState() {
        return this.state;
    }
    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.listeners.forEach((fn) => fn(this.state));
    }
    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }
}

function shortenAddress(addr, chars = 4) {
    if (addr.length <= chars * 2 + 3)
        return addr;
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

const DEBOUNCE_MS = 400;
const ARROW_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`;
const CHEVRON_SVG = `<svg viewBox="0 0 10 6" width="8" height="5" fill="currentColor"><path d="M1 1l4 4 4-4"/></svg>`;
class ArgyrosSwapElement extends HTMLElement {
    static get observedAttributes() {
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
        this.debounceTimer = null;
        this.unsubscribe = null;
        this.shadow = this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
        const apiKey = this.getAttribute("api-key") || "";
        const chain = this.getAttribute("chain") || "solana";
        const baseUrl = this.getAttribute("base-url") || undefined;
        const inputMint = this.getAttribute("default-input-mint") || "";
        const outputMint = this.getAttribute("default-output-mint") || "";
        this.sdk = new ArgyrosSDK({ apiKey, chain, baseUrl });
        this.store = new Store(createInitialState(inputMint, outputMint));
        this.unsubscribe = this.store.subscribe(() => this.render());
        this.render();
    }
    disconnectedCallback() {
        this.unsubscribe?.();
        if (this.debounceTimer)
            clearTimeout(this.debounceTimer);
    }
    attributeChangedCallback() {
        if (!this.store)
            return;
        const apiKey = this.getAttribute("api-key") || "";
        const chain = this.getAttribute("chain") || "solana";
        const baseUrl = this.getAttribute("base-url") || undefined;
        this.sdk = new ArgyrosSDK({ apiKey, chain, baseUrl });
    }
    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
    async fetchQuote() {
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Quote failed";
            this.store.setState({ status: "error", error: msg, quote: null, outputAmount: "" });
        }
    }
    debouncedQuote() {
        if (this.debounceTimer)
            clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.fetchQuote(), DEBOUNCE_MS);
    }
    async executeSwap() {
        const { inputMint, outputMint, inputAmount, slippageBps, walletAddress } = this.store.getState();
        if (!walletAddress) {
            this.store.setState({ error: "Connect wallet first" });
            return;
        }
        this.store.setState({ status: "swapping", error: "" });
        this.emit("swap-initiated", { inputMint, outputMint, amount: inputAmount });
        try {
            const result = await this.sdk.swap({
                userWallet: walletAddress,
                inputMint,
                outputMint,
                amount: inputAmount,
                swapMode: "ExactIn",
                slippageBps,
            });
            this.store.setState({ status: "success" });
            this.emit("swap-complete", result);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Swap failed";
            this.store.setState({ status: "error", error: msg });
            this.emit("swap-error", { error: msg });
        }
    }
    handleSwapDirection() {
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
    setWallet(address) {
        this.store.setState({ walletAddress: address });
    }
    getButtonText(state) {
        if (!state.walletAddress)
            return "Connect Wallet";
        if (state.status === "quoting")
            return "Fetching Quote...";
        if (state.status === "swapping")
            return "Swapping...";
        if (!state.inputAmount)
            return "Enter Amount";
        if (!state.inputMint || !state.outputMint)
            return "Select Tokens";
        return "Swap";
    }
    isButtonDisabled(state) {
        if (!state.walletAddress)
            return false;
        return (state.status === "quoting" ||
            state.status === "swapping" ||
            !state.inputAmount ||
            !state.inputMint ||
            !state.outputMint);
    }
    renderQuoteInfo(quote) {
        const impactClass = quote.priceImpactSeverity === "high" || quote.priceImpactSeverity === "extreme"
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
    render() {
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
            const target = e.target.closest("[data-action]");
            if (!target)
                return;
            const action = target.dataset.action;
            if (action === "swap-direction")
                this.handleSwapDirection();
            if (action === "swap") {
                if (!state.walletAddress) {
                    this.emit("connect-wallet", {});
                }
                else {
                    this.executeSwap();
                }
            }
        });
        const amountInput = this.shadow.querySelector('[data-action="input-amount"]');
        if (amountInput) {
            amountInput.addEventListener("input", (e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                this.store.setState({ inputAmount: val });
                this.debouncedQuote();
            });
        }
    }
}

if (typeof customElements !== "undefined" && !customElements.get("argyros-swap")) {
    customElements.define("argyros-swap", ArgyrosSwapElement);
}

export { ArgyrosSwapElement };
//# sourceMappingURL=index.esm.js.map

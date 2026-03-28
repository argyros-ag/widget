import { QuoteResponse } from '@argyros/sdk';

declare class ArgyrosSwapElement extends HTMLElement {
    private shadow;
    private sdk;
    private store;
    private debounceTimer;
    private unsubscribe;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    private emit;
    private fetchQuote;
    private debouncedQuote;
    private executeSwap;
    private handleSwapDirection;
    setWallet(address: string): void;
    private getButtonText;
    private isButtonDisabled;
    private renderQuoteInfo;
    private render;
}

type WidgetStatus = "idle" | "quoting" | "swapping" | "success" | "error";
interface WidgetState {
    inputMint: string;
    outputMint: string;
    inputAmount: string;
    outputAmount: string;
    slippageBps: number;
    quote: QuoteResponse | null;
    status: WidgetStatus;
    error: string;
    walletAddress: string;
}

export { ArgyrosSwapElement };
export type { WidgetState, WidgetStatus };

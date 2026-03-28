export declare class ArgyrosSwapElement extends HTMLElement {
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

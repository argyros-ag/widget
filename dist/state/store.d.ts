import type { QuoteResponse } from "@argyros/sdk";
export type WidgetStatus = "idle" | "quoting" | "swapping" | "success" | "error";
export interface WidgetState {
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
export type Listener = (state: WidgetState) => void;
export declare function createInitialState(inputMint: string, outputMint: string): WidgetState;
export declare class Store {
    private state;
    private listeners;
    constructor(initial: WidgetState);
    getState(): WidgetState;
    setState(partial: Partial<WidgetState>): void;
    subscribe(fn: Listener): () => void;
}

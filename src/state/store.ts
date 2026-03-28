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

export function createInitialState(
  inputMint: string,
  outputMint: string
): WidgetState {
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

export class Store {
  private state: WidgetState;
  private listeners: Set<Listener> = new Set();

  constructor(initial: WidgetState) {
    this.state = { ...initial };
  }

  getState(): WidgetState {
    return this.state;
  }

  setState(partial: Partial<WidgetState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

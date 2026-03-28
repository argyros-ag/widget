export declare function getNativeBalance(rpcUrl: string, wallet: string): Promise<string>;
export declare function getTokenBalances(rpcUrl: string, wallet: string): Promise<Map<string, {
    amount: string;
    decimals: number;
}>>;
export declare const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

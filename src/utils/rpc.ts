const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result: T;
  error?: { code: number; message: string };
}

interface GetBalanceResult {
  value: number;
}

interface TokenAccountInfo {
  mint: string;
  tokenAmount: { amount: string; decimals: number; uiAmountString: string };
}

interface TokenAccount {
  pubkey: string;
  account: { data: { parsed: { info: TokenAccountInfo } } };
}

interface GetTokenAccountsResult {
  value: TokenAccount[];
}

async function rpcCall<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await res.json()) as JsonRpcResponse<T>;
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function getNativeBalance(rpcUrl: string, wallet: string): Promise<string> {
  const result = await rpcCall<GetBalanceResult>(rpcUrl, "getBalance", [wallet]);
  return String(result.value);
}

export async function getTokenBalances(
  rpcUrl: string,
  wallet: string
): Promise<Map<string, { amount: string; decimals: number }>> {
  const result = await rpcCall<GetTokenAccountsResult>(
    rpcUrl,
    "getTokenAccountsByOwner",
    [
      wallet,
      { programId: TOKEN_PROGRAM },
      { encoding: "jsonParsed" },
    ]
  );

  const balances = new Map<string, { amount: string; decimals: number }>();
  for (const acct of result.value) {
    const info = acct.account.data.parsed.info;
    balances.set(info.mint, {
      amount: info.tokenAmount.amount,
      decimals: info.tokenAmount.decimals,
    });
  }
  return balances;
}

export const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

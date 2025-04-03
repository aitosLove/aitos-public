import Panora, { PanoraConfig } from "@panoraexchange/swap-sdk";

/**
 * Configuration function for Panora client
 * @param apiKey - Panora API key
 * @returns Panora client instance
 */
export const configurePanora = (apiKey: string): Panora => {
  const config: PanoraConfig = {
    apiKey,
  };
  return new Panora(config);
};

/**
 * Interface for swap parameters
 */
export interface SwapParams {
  chainId: string;
  src: `0x${string}`; // Source token address
  dst: `0x${string}`; // Destination token address
  amount: string;
  walletAddress: `0x${string}`;
  privateKey: string;
  slippagePercentage?: string;
  integratorFeeAddress?: `0x${string}`;
  integratorFeePercentage?: string;
}

/**
 * Get swap quote from Panora
 * @param client - Panora client instance
 * @param params - Swap parameters
 * @returns Swap quote response
 */
export const getSwapQuote = async (
  client: Panora,
  params: Omit<SwapParams, "privateKey">
): Promise<any> => {
  const response = await client.SwapQuote({
    chainId: params.chainId,
    fromTokenAddress: params.src,
    toTokenAddress: params.dst,
    fromTokenAmount: params.amount,
    toWalletAddress: params.walletAddress,
    slippagePercentage: params.slippagePercentage || "5",
    integratorFeeAddress: params.integratorFeeAddress || params.walletAddress,
    integratorFeePercentage: params.integratorFeePercentage || "0",
    getTransactionData: "rawTransaction",
  });

  return response;
};

/**
 * Execute swap on Panora
 * @param client - Panora client instance
 * @param params - Swap parameters
 * @returns Swap execution response
 */
export const swap_on_panora = async (
  client: Panora,
  params: SwapParams
): Promise<any> => {
  try {
    const response = await client.Swap(
      {
        chainId: params.chainId,
        fromTokenAddress: params.src,
        toTokenAddress: params.dst,
        fromTokenAmount: params.amount,
        toWalletAddress: params.walletAddress,
        slippagePercentage: params.slippagePercentage || "5",
        integratorFeeAddress:
          params.integratorFeeAddress || params.walletAddress,
        integratorFeePercentage: params.integratorFeePercentage || "0",
      },
      params.privateKey
    );

    return {
      success: true,
      hash: response.hash,
      data: response,
    };
  } catch (error) {
    console.error(`Error swapping from ${params.src} to ${params.dst}:`, error);
    return {
      success: false,
      error,
    };
  }
};

/**
 * Execute multiple swaps sequentially
 * @param client - Panora client instance
 * @param baseParams - Base swap parameters
 * @param destinations - Array of destination tokens
 * @param delayMs - Delay between swaps in milliseconds
 * @returns Array of swap results
 */
export const batchSwapSequentially = async (
  client: Panora,
  baseParams: Omit<SwapParams, "dst">,
  destinations: Array<`0x${string}`>,
  delayMs: number = 1000
): Promise<any[]> => {
  const results = [];

  for (const dst of destinations) {
    const swapParams = {
      ...baseParams,
      dst,
    };

    const result = await swap_on_panora(client, swapParams);
    results.push(result);

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
};

// Example usage:
/*
import { account } from "./your-account-file";
import { APT, USDC, zUSDC } from "./your-tokens-file";

// Initialize client
const client = configurePanora("your-api-key");

// Single swap
const swapResult = await swap_on_panora(client, {
  chainId: "1",
  src: APT.coinType as `0x${string}`,
  dst: USDC.coinType as `0x${string}`,
  amount: "0.1",
  walletAddress: account.accountAddress.toString(),
  privateKey: account.privateKey.toString()
});

// Multiple sequential swaps
const coinList = [USDC.coinType, zUSDC.coinType] as Array<`0x${string}`>;

const batchResults = await batchSwapSequentially(
  client,
  {
    chainId: "1",
    src: APT.coinType as `0x${string}`,
    amount: "0.1",
    walletAddress: account.accountAddress.toString(),
    privateKey: account.privateKey.toString()
  },
  coinList,
  2000 // 2 second delay between swaps
);
*/

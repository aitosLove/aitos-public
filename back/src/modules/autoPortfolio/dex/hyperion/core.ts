import { Network, Account } from "@aptos-labs/ts-sdk";
import { initHyperionSDK, FeeTierIndex } from "@hyperionxyz/sdk";
// import { APTCoin } from "@/src/modules/use-v2/config/apt/coin";
import { OnChainCoin } from "../../type";
import { AptosAccountManager } from "../../chain/apt/account";

/**
 * Interface for Hyperion swap parameters
 */
export interface HyperionSwapParams {
  from: string;
  to: string;
  amount: number;
  walletAddress: string;
  slippagePercentage?: number;
  recipient?: string;
  fromDecimals: number;
}

/**
 * Initialize Hyperion SDK
 * @param network - Network to use
 * @returns Hyperion SDK instance
 */
export const configureHyperion = (network: Network = Network.MAINNET) => {
  return initHyperionSDK({ network: Network.MAINNET });
};

/**
 * Get swap payload from Hyperion
 * @param sdk - Hyperion SDK instance
 * @param params - Swap parameters
 * @returns Swap payload
 */
export const getHyperionSwapPayload = async (
  sdk: ReturnType<typeof initHyperionSDK>,
  params: HyperionSwapParams
): Promise<any> => {
  const inputAmount = Math.floor(params.amount * 10 ** params.fromDecimals);

  const fromAddress =
    params.from === "0x1::aptos_coin::AptosCoin" ? "0xa" : params.from;
  const toAddress =
    params.to === "0x1::aptos_coin::AptosCoin" ? "0xa" : params.to;

  const { amountOut: currencyBAmount, path: poolRoute } =
    await sdk.Swap.estToAmount({
      amount: inputAmount,
      from: fromAddress,
      to: toAddress,
    });

  const swapParams = {
    currencyA: fromAddress,
    currencyB: toAddress,
    currencyAAmount: inputAmount,
    currencyBAmount,
    slippage: params.slippagePercentage || 1,
    poolRoute,
    recipient: params.recipient || params.walletAddress,
  };

  return await sdk.Swap.swapTransactionPayload(swapParams);
};

/**
 * Execute swap on Hyperion
//  * @param sdk - Hyperion SDK instance
//  * @param aptosClient - Aptos client instance
//  * @param account - Aptos account
 * @
 * @param params - Swap parameters
 * @returns Swap execution response
 */
export const swap_on_hyperion = async (
  // sdk: ReturnType<typeof initHyperionSDK>,
  // aptosClient: any,
  // account: Account,
  aptosManager: AptosAccountManager,
  params: HyperionSwapParams
): Promise<any> => {
  const sdk = aptosManager.hyperionSdk;
  const aptosClient = aptosManager.aptosClient;
  const account = aptosManager.account;

  try {
    // Get swap payload
    const payload = await getHyperionSwapPayload(sdk, params);

    // Build the transaction
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress.toString(),
      data: payload,
    });

    // Simulate the transaction
    const [userTransactionResponse] =
      await aptosClient.transaction.simulate.simple({
        signerPublicKey: account.publicKey,
        transaction,
      });

    if (!userTransactionResponse.success) {
      throw new Error(
        `Transaction simulation failed: ${JSON.stringify(
          userTransactionResponse.vm_status
        )}`
      );
    }

    // Sign the transaction
    const senderAuthenticator = aptosClient.transaction.sign({
      signer: account,
      transaction,
    });

    // Submit the transaction
    const committedTransaction = await aptosClient.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });

    // Wait for transaction completion
    const executedTransaction = await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });

    return {
      success: true,
      hash: committedTransaction.hash,
      data: executedTransaction,
    };
  } catch (error) {
    console.error(`Error swapping from ${params.from} to ${params.to}:`);
    
    return {
      success: false,
      error,
    };
  }
};

// Example usage:
/*
import { account, aptosClient } from "@/src/modules/use-v2/config/apt/account";
import { APT, USDC } from "@/src/modules/use-v2/config/apt/coin";
import { Network } from "@aptos-labs/ts-sdk";

// Initialize SDK
const sdk = configureHyperion(Network.MAINNET);

// Single swap
const swapResult = await swap_on_hyperion(sdk, aptosClient, account, {
  from: USDC,
  to: APT,
  amount: 1,
  walletAddress: account.accountAddress.toString(),
  slippagePercentage: 0.5
})

*/

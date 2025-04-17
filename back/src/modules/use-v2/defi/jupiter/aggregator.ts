import * as dotenv from "dotenv";

dotenv.config();

import axios from "axios";
import {
  VersionedTransaction,
  sendAndConfirmTransaction,
  sendAndConfirmRawTransaction,
  Transaction,
} from "@solana/web3.js";
import { accountSOL, connection } from "../../config/sol/account";

// 定义请求参数接口
interface QuoteRequestParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
  restrictIntermediateTokens?: boolean;
}

// 定义路由计划中swap信息的接口
interface SwapInfo {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
}

// 定义路由计划接口
interface RoutePlan {
  swapInfo: SwapInfo;
  percent: number;
}

// 定义响应接口
interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null | any;
  priceImpactPct: string;
  routePlan: RoutePlan[];
  contextSlot: number;
  timeTaken: number;
}

// Jupiter API基础URL
const JUPITER_API_URL = "https://lite-api.jup.ag/swap/v1";

/**
 * 获取交易对报价
 * @param params 请求参数
 * @returns Promise<QuoteResponse> 报价响应
 */
export async function getJupiterQuote(
  params: QuoteRequestParams
): Promise<QuoteResponse> {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append("inputMint", params.inputMint);
    queryParams.append("outputMint", params.outputMint);
    queryParams.append("amount", params.amount);
    queryParams.append("slippageBps", params.slippageBps.toString());

    if (params.restrictIntermediateTokens !== undefined) {
      queryParams.append(
        "restrictIntermediateTokens",
        params.restrictIntermediateTokens.toString()
      );
    }

    // 发送请求并返回类型化响应
    const response = await axios.get<QuoteResponse>(
      `${JUPITER_API_URL}/quote?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Jupiter API error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    }
    throw new Error(`Failed to get Jupiter quote: ${error}`);
  }
}

// 优先级类型定义
interface PriorityLevel {
  maxLamports: number;
  priorityLevel: "low" | "medium" | "high" | "veryHigh" | "max";
}

interface PrioritizationFeeLamports {
  priorityLevelWithMaxLamports: PriorityLevel;
}

interface ComputeBudget {
  microLamports: number;
  estimatedMicroLamports: number;
}

interface PrioritizationType {
  computeBudget: ComputeBudget;
}

interface DynamicSlippageReport {
  slippageBps: number;
  otherAmount: number;
  simulatedIncurredSlippageBps: number;
  amplificationRatio: string;
  categoryName: string;
  heuristicMaxSlippageBps: number;
}

// Swap请求参数接口
interface SwapRequestParams {
  quoteResponse: QuoteResponse;
  userPublicKey: string;
  dynamicComputeUnitLimit?: boolean;
  dynamicSlippage?: boolean;
  prioritizationFeeLamports?: PrioritizationFeeLamports;
}

// Swap响应接口
interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  prioritizationType: PrioritizationType;
  dynamicSlippageReport: DynamicSlippageReport;
  simulationError: null | string;
}

/**
 * 构建Jupiter交换交易
 * @param params 交换请求参数
 * @returns Promise<SwapResponse> 交换响应
 */
export async function buildJupiterTransaction(
  params: SwapRequestParams
): Promise<SwapResponse> {
  try {
    const response = await axios.post<SwapResponse>(
      `${JUPITER_API_URL}/swap`,
      params,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Jupiter API error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    }
    throw new Error(`Failed to build Jupiter transaction: ${error}`);
  }
}

/**
 * 构建SOL到USDC的交换交易
 * @param quoteResponse 报价响应
 * @param walletPublicKey 钱包公钥
 * @returns Promise<SwapResponse> 交换响应
 */
export async function buildSolToUsdcTransaction(
  quoteResponse: QuoteResponse,
  walletPublicKey: string
): Promise<SwapResponse> {
  return buildJupiterTransaction({
    quoteResponse,
    userPublicKey: walletPublicKey,
    dynamicComputeUnitLimit: true,
    dynamicSlippage: true,
    prioritizationFeeLamports: {
      priorityLevelWithMaxLamports: {
        maxLamports: 1000000,
        priorityLevel: "veryHigh",
      },
    },
  });
}
/**
 * Swap tokens on Jupiter
 * @param srcCoinType Input mint address
 * @param dstCoinType Output mint address
 * @param amount Original amount (no decimal processing needed)
 * @param walletAddress Wallet address for the transaction
 * @param privateKey Private key for signing the transaction
 * @param slippage Slippage tolerance in basis points (1 = 0.01%)
 * @returns Transaction signature URL
 */
export async function swap_on_jupiter({
  srcCoinType,
  dstCoinType,
  amount,
  slippage = 50, // Default to 0.5% slippage
}: {
  srcCoinType: string;
  dstCoinType: string;
  amount: string;
  slippage?: number;
}): Promise<string> {
  const walletAddress = accountSOL.publicKey.toBase58();
  try {
    // 1. Get quote
    const quote = await getJupiterQuote({
      inputMint: srcCoinType,
      outputMint: dstCoinType,
      amount: amount,
      slippageBps: slippage,
      restrictIntermediateTokens: true,
    });

    // 2. Build transaction
    const swapResponse = await buildJupiterTransaction({
      quoteResponse: quote,
      userPublicKey: walletAddress,
      dynamicComputeUnitLimit: true,
      dynamicSlippage: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          maxLamports: 1000000,
          priorityLevel: "veryHigh",
        },
      },
    });

    // 3. Deserialize and sign transaction
    const transactionBase64 = swapResponse.swapTransaction;
    const transaction = VersionedTransaction.deserialize(
      Buffer.from(transactionBase64, "base64")
    );

    transaction.sign([accountSOL]);

    // 4. Send and confirm transaction
    const transactionBinary = transaction.serialize();

    const signature = await connection.sendRawTransaction(transactionBinary, {
      maxRetries: 4,
      skipPreflight: true,
    });

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const confirmation = await connection.confirmTransaction(
      {
        signature: signature,
        blockhash,
        lastValidBlockHeight,
      },
      "finalized"
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(
          confirmation.value.err
        )}\nhttps://solscan.io/tx/${signature}/`
      );
    }

    // 5. Return transaction URL
    console.log(`Transaction successful: https://solscan.io/tx/${signature}/`);

    return `https://solscan.io/tx/${signature}/`;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Jupiter API error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    }
    throw new Error(`Swap failed: ${error}`);
  }
}

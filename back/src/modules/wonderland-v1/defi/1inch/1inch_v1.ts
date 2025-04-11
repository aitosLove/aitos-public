import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import {
  walletAddress,
  publicClient,
  walletClient,
} from "../../config/bsc/account";
import { CHAIN_CONFIG } from "../../config";

const API_KEY = process.env.ONE_INCH_API_KEY;

// API配置
const API_CONFIG = {
  baseUrl: `https://api.1inch.dev/swap/v6.0/${CHAIN_CONFIG.chainId}`,
  broadcastUrl: `https://api.1inch.dev/tx-gateway/v1.1/${CHAIN_CONFIG.chainId}/broadcast`,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    accept: "application/json",
  },
};

// 辅助函数：构建API请求URL
function buildApiUrl({
  methodName,
  queryParams,
}: {
  methodName: string;
  queryParams: Record<string, string>;
}): string {
  const url = `${API_CONFIG.baseUrl}${methodName}?${new URLSearchParams(
    queryParams
  ).toString()}`;
  console.log(`
    Use : ${url}`);
  return url;
}

// 检查代币授权 - 使用 axios 替代 fetch
async function checkAllowance(tokenAddress: string): Promise<string> {
  const url = buildApiUrl({
    methodName: "/approve/allowance",
    queryParams: {
      tokenAddress,
      walletAddress,
    },
  });

  try {
    const response = await axios.get(url, { headers: API_CONFIG.headers });
    const data = response.data;
    console.log("代币授权数量:", data);
    return data.allowance;
  } catch (error) {
    console.error("检查授权失败:", error);
    throw error;
  }
}

// 构建授权交易 - 使用 axios 替代 fetch
async function buildApprovalTransaction(tokenAddress: string, amount?: string) {
  const url = buildApiUrl({
    methodName: "/approve/transaction",
    queryParams: amount ? { tokenAddress, amount } : { tokenAddress },
  });

  try {
    const response = await axios.get(url, { headers: API_CONFIG.headers });
    const transaction = response.data;

    const gasLimit = await publicClient.estimateGas({
      data: transaction.data,
      to: transaction.to,
      value: BigInt(transaction.value),
      account: walletAddress,
    });

    return {
      data: transaction.data,
      to: transaction.to,
      value: BigInt(transaction.value),
      gas: gasLimit,
      gasPrice: BigInt(transaction.gasPrice),
    };
  } catch (error) {
    console.error("构建授权交易失败:", error);
    throw error;
  }
}

// 构建交换交易 - 已经使用了 axios
async function buildSwapTransaction(swapParams: Record<string, any>) {
  const url = buildApiUrl({
    methodName: "/swap",
    queryParams: swapParams,
  });

  try {
    const response = await axios.get(url, { headers: API_CONFIG.headers });
    const { tx, dstAmount } = response.data;

    console.log("目标代币数量:", dstAmount);

    return {
      data: tx.data,
      to: tx.to,
      value: BigInt(tx.value),
      gas: BigInt(tx.gas),
      gasPrice: BigInt(tx.gasPrice),
    };
  } catch (error) {
    console.error("获取交换交易失败:", error);
    throw error;
  }
}

// 发送交易
async function sendTransaction(transaction: any): Promise<`0x${string}`> {
  try {
    const hash = await walletClient.sendTransaction({
      ...transaction,
    });
    return hash;
  } catch (error) {
    console.error("发送交易失败:", error);
    throw error;
  }
}

// 广播原始交易 - 使用 axios 替代 fetch
async function broadcastRawTransaction(rawTransaction: any): Promise<string> {
  try {
    const response = await axios.post(
      API_CONFIG.broadcastUrl,
      { rawTransaction },
      { headers: API_CONFIG.headers }
    );
    return response.data.transactionHash;
  } catch (error) {
    console.error("广播交易失败:", error);
    throw error;
  }
}

export async function swap({
  src,
  dst,
  amount,
  slippage = "10",
}: {
  src: string;
  dst: string;
  amount: bigint;
  slippage?: string;
}) {
  console.log(`交换 ${amount} 从 ${src} 到 ${dst}`);

  // 准备交换参数
  const swapParams = {
    src,
    dst,
    amount: amount.toString(),
    from: walletAddress,
    origin: walletAddress,
    slippage,
    disableEstimate: false,
    allowPartialFill: false,
  };

  try {
    // 1. 检查代币授权
    const allowance = await checkAllowance(src);
    console.log(`当前授权: ${allowance}`);

    // 等待 3 秒
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 2. 如果需要授权，进行授权操作
    if (BigInt(allowance) < amount) {
      console.log("需要授权代币...");
      const approvalTx = await buildApprovalTransaction(src);
      const approvalTxHash = await sendTransaction(approvalTx);
      console.log("授权交易哈希:", approvalTxHash);

      // 等待授权确认
      console.log("等待授权确认...");
      await publicClient.waitForTransactionReceipt({ hash: approvalTxHash });
      console.log("授权已确认");
    } else {
      console.log("代币已有足够授权");
    }

    // 等待 3 秒
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 3. 执行代币交换
    console.log("准备执行代币交换...");
    const swapTx = await buildSwapTransaction(swapParams);
    const swapTxHash = await sendTransaction(swapTx);
    console.log("交换交易哈希:", swapTxHash);

    // 等待交换确认
    console.log("等待交换确认...");
    await publicClient.waitForTransactionReceipt({ hash: swapTxHash });
    console.log("交换完成!");

    return swapTxHash;
  } catch (error) {
    console.error("交换过程中出错:", error);
    throw error;
  }
}

// try {
//   // 示例调用
//   swap({
//     src: "0x111111111117dc0aa78b770fa6a738034120c302", // 1INCH
//     dst: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", // DAI
//     amount: parseEther("1"), // 1 1INCH
//     slippage: "10", // 10% slippage
//   });
// } catch (e) {
//   console.error("交换失败:", e);
// }

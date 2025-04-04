import { createPublicClient, http, parseEther } from "viem";
import { bsc } from "viem/chains";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

// 环境变量配置
const privateKey = process.env.EVM_PRIVATE_KEY as `0x${string}`;
export const walletAddress = process.env.EVM_ADDRESS as `0x${string}`;

// 初始化客户端
export const account = privateKeyToAccount(privateKey);
export const publicClient = createPublicClient({
  chain: bsc,
  transport: http(),
});

export const walletClient = createWalletClient({
  account,
  chain: bsc,
  transport: http(),
});

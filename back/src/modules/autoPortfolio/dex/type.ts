export interface SwapParams {
  inputAmount: number; // 输入金额
  fromCoinAddress: string; // 源代币地址
  toCoinAddress: string; // 目标代币地址
  fromDecimals: number; // 源代币的小数位数
  fromName?: string; // 源代币名称
  toName?: string; // 目标代币名称
}

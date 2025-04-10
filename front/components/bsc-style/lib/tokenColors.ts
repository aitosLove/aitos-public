// src/lib/tokenColors.ts

// Define a consistent fallback color palette for tokens without specific brand colors
const COLORS: readonly string[] = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#84CC16", // Lime
  "#06B6D4", // Cyan
] as const;

// Common tokens with official brand colors
const TOKEN_FIXED_COLORS: Record<string, string> = {
  BTC: "#F7931A",  // Bitcoin - Official Bitcoin orange
  ETH: "#3C3C3D",  // Ethereum - Official dark gray from Ethereum branding
  USDC: "#2775CA", // USDC - Circle's official blue
  USDT: "#50AF95", // Tether - Official Tether green (updated from #26A17B)
  SOL: "#DC1FFF",  // Solana - Official purple from Solana branding
  SUI: "#4FBAFF",  // Sui - Official light blue from Sui Foundation
  DEEP: "#8B5CF6", // Keeping purple as no official color found
  CETUS: "#EC4899", // Keeping pink as no official Cetus Protocol color found
  NAVX: "#F59E0B",  // Keeping amber as no official color found
  SEND: "#10B981", // Keeping green as no official color found
  NS: "#14B8A6",   // Keeping teal as no official color found
  APT: "#00B4A2",  // Aptos - Official teal from Aptos branding
  AMI: "#FF5733",  // Keeping orange-red as no official color found
  PROPS: "#7C3AED", // Keeping purple-violet as no official color found
  THL: "#059669",  // Keeping emerald green as no official color found
};

const tokenColorMap = new Map<string, string>();
let colorIndex = 0;

/**
* Get a consistent color for a token symbol
* @param tokenSymbol - The token symbol (e.g., "BTC", "ETH")
* @returns Hex color code
*/
export const getTokenColor = (tokenSymbol: string): string => {
  const normalizedSymbol = tokenSymbol.toUpperCase();
  
  if (TOKEN_FIXED_COLORS[normalizedSymbol]) {
      return TOKEN_FIXED_COLORS[normalizedSymbol];
  }
  
  if (tokenColorMap.has(normalizedSymbol)) {
      return tokenColorMap.get(normalizedSymbol)!;
  }
  
  const color = COLORS[colorIndex % COLORS.length];
  tokenColorMap.set(normalizedSymbol, color);
  colorIndex++;
  
  return color;
};

/**
* Assigns colors to all tokens in an array
* @param tokens - Array of objects containing a token symbol property
* @param symbolKey - The property name for the token symbol (default: "token")
* @returns The original array with color properties added
*/
export const assignTokenColors = <T extends Record<string, unknown>>(
  tokens: T[],
  symbolKey: string = "token"
): (T & { color: string })[] => {
  return tokens.map((item) => ({
      ...item,
      color: getTokenColor(String(item[symbolKey])),
  }));
};

/**
* Get color for "Others" category
* @returns Light slate color
*/
export const getOthersColor = (): string => "#CBD5E1";
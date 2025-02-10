// 定义地址映射的接口
interface IndexMapping {
  [key: string]: string;
}

interface AddressMapping {
  addressToIndex: IndexMapping; // 地址到索引的映射
  indexToAddress: IndexMapping; // 索引到地址的映射
}

export class EVMAddressExtractor {
  private static ADDRESS_REGEX = /\b0x[a-fA-F0-9]{40}\b/g;
  private static INDEX_PREFIX = "@addr_";

  /**
   * 从文本中提取EVM地址并创建地址映射
   * @param text 输入文本
   * @returns 包含地址映射和处理后文本的结果对象
   */
  static extract(text: string): {
    mapping: AddressMapping;
    processedText: string;
    hasAddresses: boolean;
  } {
    const addresses = text.match(this.ADDRESS_REGEX) || [];
    const uniqueAddresses = [...new Set(addresses)];

    const mapping: AddressMapping = {
      addressToIndex: {},
      indexToAddress: {},
    };

    // 为每个唯一地址创建映射
    uniqueAddresses.forEach((address, index) => {
      const indexKey = `${this.INDEX_PREFIX}${index + 1}`;
      mapping.addressToIndex[address] = indexKey;
      mapping.indexToAddress[indexKey] = address;
    });

    // 替换文本中的地址
    let processedText = text;
    uniqueAddresses.forEach((address) => {
      const indexKey = mapping.addressToIndex[address];
      processedText = processedText.split(address).join(indexKey);
    });

    return {
      mapping,
      processedText,
      hasAddresses: uniqueAddresses.length > 0,
    };
  }

  /**
   * 根据索引获取对应的地址
   * @param index 地址索引（例如 "@addr_1"）
   * @param mapping 地址映射
   * @returns 对应的地址，如果索引不存在则返回null
   */
  static getAddressByIndex(
    index: string,
    mapping: AddressMapping
  ): string | null {
    return mapping.indexToAddress[index] || null;
  }

  /**
   * 将处理后的文本恢复原始地址
   * @param processedText 处理后的文本
   * @param mapping 地址映射
   * @returns 恢复后的文本
   */
  static restore(processedText: string, mapping: AddressMapping): string {
    let restoredText = processedText;
    Object.entries(mapping.indexToAddress).forEach(([index, address]) => {
      restoredText = restoredText.split(index).join(address);
    });
    return restoredText;
  }
}

// 使用示例
const sampleText = `
Alice的钱包地址是0x742d35Cc6634C0532925a3b844Bc454e4438f44e，
她向Bob的地址0x123f681646d4a755815f9cb19e1acc8565a0c2ac转账了5 ETH。
之后Alice又用相同的钱包地址0x742d35Cc6634C0532925a3b844Bc454e4438f44e
向Charlie的地址0x9876543210abcdef9876543210abcdef98765432转账了2 ETH。
`;

// 提取地址并创建映射
const result = EVMAddressExtractor.extract(sampleText);
console.log("地址映射:", result.mapping);
console.log("处理后的文本:", result.processedText);
console.log("是否包含地址:", result.hasAddresses);

// 根据索引获取地址
const address1 = EVMAddressExtractor.getAddressByIndex(
  "@addr_1",
  result.mapping
);
console.log("地址1:", address1);

// 恢复原始文本
const restored = EVMAddressExtractor.restore(
  result.processedText,
  result.mapping
);
console.log("恢复后的文本:", restored);

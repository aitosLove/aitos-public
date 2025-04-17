"use client";

import React from "react";
import { InstructPanel } from "./panel";
import {
  getNewestDefiInstruct,
  getNewestMarketInstruct,
  getNewestTradingInstruct,
  addDefiInstruct,
  addMarketInstruct,
  addTradingInstruct,
} from "@/db/getInstruct";

// DeFi 指令面板
export const DefiInstructPanel = () => {
  // DeFi 默认指令
  // const defaultInstruct = `You are an expert in decentralized finance (DeFi) strategies. Your task is to formulate a DeFi strategy tailored to the user's current holdings using the provided information about various DeFi protocol pools.`;
  const defaultInstruct = "Loading instruct...";

  // DeFi 特定的获取指令函数
  const fetchDefiInstruct = async (): Promise<string> => {
    // 在实际应用中，这里会从API或存储中获取数据
    // 模拟API调用延迟
    // await new Promise((resolve) => setTimeout(resolve, 500));

    // // 这里可以替换为实际的API调用
    // // 例如: const response = await fetch('/api/defi-instruct');
    // // 返回 await response.text();

    // // 现在我们只是返回一个模拟值或本地存储的值
    // const savedInstruct = localStorage.getItem("defi-instruct");
    const savedInstruct = await getNewestDefiInstruct();

    return savedInstruct || defaultInstruct;
  };

  // DeFi 特定的更新指令函数
  const updateDefiInstruct = async (instruct: string): Promise<void> => {
    // 在实际应用中，这里会将数据发送到API或存储
    // 模拟API调用延迟
    // await new Promise((resolve) => setTimeout(resolve, 700));

    // 这里可以替换为实际的API调用
    // 例如: await fetch('/api/defi-instruct', {
    //   method: 'POST',
    //   body: JSON.stringify({ instruct }),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // 现在我们只是将值存储在本地存储中
    // localStorage.setItem("defi-instruct", instruct);
    await addDefiInstruct({ instruct });
  };

  return (
    <InstructPanel
      title="DeFi Instruct Panel"
      initialInstruct={defaultInstruct}
      fetchInstruct={fetchDefiInstruct}
      updateInstruct={updateDefiInstruct}
    />
  );
};

// AI 指令面板
export const MarketInstructPanel = () => {
  // AI 默认指令
  // const defaultInstruct = `You are an AI assistant specializing in machine learning and artificial intelligence. Analyze the provided dataset and recommend the best AI model architecture for this specific problem.`;
  const defaultInstruct = "Loading instruct...";

  // AI 特定的获取指令函数
  const fetchMarketInstruct = async (): Promise<string> => {
    // // 模拟API调用延迟
    // await new Promise((resolve) => setTimeout(resolve, 600));

    // // 这里会是AI特定的获取逻辑
    // const savedInstruct = sessionStorage.getItem("ai-instruct");
    const savedInstruct = await getNewestMarketInstruct();
    return savedInstruct || defaultInstruct;
  };

  // AI 特定的更新指令函数
  const updateMarketInstruct = async (instruct: string): Promise<void> => {
    // // 模拟API调用延迟
    // await new Promise((resolve) => setTimeout(resolve, 800));

    // // 这里会是AI特定的更新逻辑
    // sessionStorage.setItem("ai-instruct", instruct);
    await addMarketInstruct({ instruct });
  };

  return (
    <InstructPanel
      title="Analysis Instruct Panel"
      initialInstruct={defaultInstruct}
      fetchInstruct={fetchMarketInstruct}
      updateInstruct={updateMarketInstruct}
    />
  );
};

// Crypto 指令面板
export const TradingInstructPanel = () => {
  // Crypto 默认指令
  // const defaultInstruct = `You are a cryptocurrency analysis expert. Evaluate the current market conditions and provide trading recommendations based on technical and fundamental analysis.`;
  const defaultInstruct = "Loading instruct...";

  // Crypto 特定的获取指令函数
  const fetchTradingInstruct = async (): Promise<string> => {
    // 模拟API调用延迟
    // await new Promise((resolve) => setTimeout(resolve, 550));

    // 这里会是Crypto特定的获取逻辑
    try {
      // 假设我们从不同的API端点获取Crypto指令
      // const response = await fetch('/api/crypto/instructions');
      // return await response.text();

      // const savedInstruct = localStorage.getItem("crypto-instruct");
      const savedInstruct = await getNewestTradingInstruct();
      console.log(savedInstruct)
      return savedInstruct || defaultInstruct;
    } catch (error) {
      console.error("Error fetching crypto instruct:", error);
      throw error;
    }
  };

  // Crypto 特定的更新指令函数
  const updateTradingInstruct = async (instruct: string): Promise<void> => {
    // 模拟API调用延迟
    // await new Promise((resolve) => setTimeout(resolve, 750));

    // 这里会是Crypto特定的更新逻辑
    try {
      // 假设我们向不同的API端点发送Crypto指令更新
      // await fetch('/api/crypto/instructions', {
      //   method: 'PUT',
      //   body: JSON.stringify({ content: instruct }),
      //   headers: { 'Content-Type': 'application/json' }
      // });

      // localStorage.setItem("crypto-instruct", instruct);
      await addTradingInstruct({ instruct });
    } catch (error) {
      console.error("Error updating crypto instruct:", error);
      throw error;
    }
  };

  return (
    <InstructPanel
      title="Investment Strategy Instruct"
      initialInstruct={defaultInstruct}
      fetchInstruct={fetchTradingInstruct}
      updateInstruct={updateTradingInstruct}
    />
  );
};

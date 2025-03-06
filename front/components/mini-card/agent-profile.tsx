"use client";

import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Check, Copy } from "lucide-react";
// Agent Avatar

export function AgentProfile() {
  const [copied, setCopied] = useState(false);
  const address =
    "0xb187b074ba8fe02ef8ba86a42ccb09f824e29e3decdee3f5793be9feedc431ef";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Watermelon works...
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-48 h-48 mt-12 rounded-xl overflow-hidden">
            <img
              src="/suikai.png"
              alt="Agent Suikai"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">Suikai</h2>
            <p className="text-muted-foreground">
              All in Suikai, All in Sui&AI
            </p>
          </div>
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={handleCopy}
                >
                  <span className="text-sm font-medium text-gray-600">
                    {shortenAddress(address)}
                  </span>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : "Click to copy address"}</p>
              </TooltipContent>
            </ShadcnTooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

// components/AgentProfile.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Copy,
  ExternalLink,
  Bell,
  Shield,
  Settings,
  ChevronDown,
  Cpu,
  Activity,
  Clock,
} from "lucide-react";
import ThemedLogo from "@/app/themed-logo";

export default function AgentProfile() {
  const [copied, setCopied] = useState(false);
  const address =
    process.env.NEXT_PUBLIC_APTOS_ADDRESS ||
    "No address set. It wont influnce backend";
  const agentStatus = "Active";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-card-background rounded-xl border border-border shadow-sm mb-6 overflow-hidden">
      <div className="p-6 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Logo/Avatar */}
            <div className="h-16 w-16 relative bg-primary/5 rounded-xl flex items-center justify-center">
              <ThemedLogo />
            </div>

            {/* Agent Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-primary">
                  AITOS
                </h1>
                <div className="flex gap-1.5">
                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 text-xs rounded-full border border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {agentStatus}
                  </span>
                  <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 text-xs rounded-full border border-blue-200 dark:border-blue-800 font-medium">
                    Agent
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Blockchain Intelligence, Simplified
              </p>

              {/* Address with copy functionality */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="mt-2 flex items-center gap-1.5 cursor-pointer group"
                      onClick={handleCopy}
                    >
                      <span className="font-mono text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                        {shortenAddress(address)}
                      </span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary text-primary-foreground border-border text-xs py-1 px-2">
                    <p>{copied ? "Copied!" : "Copy full address"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

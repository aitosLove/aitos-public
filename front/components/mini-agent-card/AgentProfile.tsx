// components/AgentProfile.tsx
"use client"
import { useState } from "react"
import Image from "next/image"
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Check, Copy } from "lucide-react"

export default function AgentProfile() {
  const [copied, setCopied] = useState(false)
  const address = "0xb187b074ba8fe02ef8ba86a42ccb09f824e29e3decdee3f5793be9feedc431ef"

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex-1 flex items-center gap-8">
      <div className="h-20 w-20 rounded-full overflow-hidden relative">
        <Image
          className="absolute inset-0 object-cover"
          alt="Agent Suikai"
          src="/suikai.png"
          width={80}
          height={80}
          priority
        />
      </div>
      <div className="flex flex-col">
        <h2 className="font-semibold text-2xl mb-0.5">Suikai</h2>
        <p className="text-muted-foreground text-sm line-clamp-1">
          All in Suikai, All in Sui&AI
        </p>
        <TooltipProvider>
          <ShadcnTooltip>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-1.5 group cursor-pointer"
                onClick={handleCopy}
              >
                <span className="text-xs font-mono text-muted-foreground">
                  {shortenAddress(address)}
                </span>
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Click to copy full address"}</p>
            </TooltipContent>
          </ShadcnTooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

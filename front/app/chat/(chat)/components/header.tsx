import { cn } from "@/app/chat/(chat)/lib/utils";
import React from "react";
import HistoryContainer from "./history-container";
import { ModeToggle } from "./mode-toggle";
import { IconLogo } from "@/components//ui/icons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function Header() {
  return (
    <header className="w-full fixed w-2xl p-2 flex justify-right items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent">
      {/* <ModeToggle /> */}

      <Link href="/chat">
        <ArrowLeft className="size-6" />
      </Link>
      <HistoryContainer />
    </header>
  );
}

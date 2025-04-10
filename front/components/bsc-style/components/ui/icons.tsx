"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

function IconLogo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Image
      src="/logo.png"
      alt="S"
      width={30}
      height={30}
      className={cn(className)}
    />
  );
}

export { IconLogo };

"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger
// } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { History as HistoryIcon, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useTransition } from "react";
import { HistorySkeleton } from "./history-skeleton";



export function History({ children }:Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onOpenChange = (open: boolean) => {
    if (open) {
      startTransition(() => {
        router.refresh();
      });
    }
  };

  // return (
  //   <Sheet onOpenChange={onOpenChange}>
  //     <SheetTrigger asChild>
  //       <Button variant="ghost" size="icon">
  //         <Menu />
  //       </Button>
  //     </SheetTrigger>
  //     <SheetContent className="w-64 rounded-tl-xl rounded-bl-xl">
  //       <SheetHeader>
  //         <SheetTitle className="flex items-center gap-1 text-sm font-normal mb-2">
  //           <HistoryIcon size={14} />
  //           History
  //         </SheetTitle>
  //       </SheetHeader>
  //       <div className="my-2 h-full pb-12 md:pb-10">
  //         <Suspense fallback={<HistorySkeleton />}>{children}</Suspense>
  //       </div>
  //     </SheetContent>
  //   </Sheet>
  // )

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent className=" rounded-tl-xl rounded-bl-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1 text-sm font-normal mb-2">
            <HistoryIcon size={14} />
            History
          </DialogTitle>
        </DialogHeader>
        <div className="my-2 h-full pb-12 md:pb-10">
          <Suspense fallback={<HistorySkeleton />}>{children}</Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}

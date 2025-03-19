import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Bot,
  MessageCircle,
  Wallet,
  Blocks,
  ChevronsLeftRightEllipsis,
  MessageCircleMore,
  Anchor,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { ModeToggle as ThemeButton } from "./theme-button";

// // Menu items.
// const items = [
//   {
//     title: "Agent",
//     url: "/agent",
//     icon: Home,
//   },
//   {
//     title: "Portfolio",
//     url: "/portfolio",
//     icon: Inbox,
//   },
//   {
//     title: "Chat",
//     url: "/chat",
//     icon: Calendar,
//   },
// ];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center space-x-2">
                <Image src="/suikai.png" alt="S" width={32} height={32} />
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem className="mt-4">
              <ThemeButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Route</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* About */}
              <SidebarMenuItem key={"about"}>
                <SidebarMenuButton asChild>
                  <a href={`/`}>
                    <ChevronsLeftRightEllipsis />
                    <span>{`About`}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Agent */}
              <SidebarMenuItem key={"agent"}>
                <SidebarMenuButton asChild>
                  <a href={`/agent`}>
                    <Bot />
                    <span>{`Agent`}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Chat */}
              <SidebarMenuItem key={"chat"}>
                <SidebarMenuButton asChild>
                  <a href={`/chat`}>
                    <MessageCircle />
                    <span>{`Chat`}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Blueprint */}
              <SidebarMenuItem key={"blueprint"}>
                <SidebarMenuButton asChild>
                  <div>
                    <Inbox />
                    <span>{`Blueprints`}</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {/* Sui Market */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/sui-market`}>
                        <Blocks />
                        <span>{`Sui Analysis`}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  {/* Portfolio */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/portfolio`}>
                        <Wallet />
                        <span>{`AI Portfolio`}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  {/* Telegram */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/telegram`}>
                        <MessageCircleMore />
                        <span>{`Telegram`}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  {/* Defi */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/defi`}>
                        <Anchor />
                        <span>{`Defi Strategy`}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  {/* NFT */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild aria-disabled>
                      <div>
                        <Settings />
                        <span>{`NFT (Coming Soon)`}</span>
                      </div>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>

              {/* Modules */}
              <SidebarMenuItem key={"modules"}>
                <SidebarMenuButton asChild aria-disabled>
                  <div>
                    <Search />
                    <span>{`Modules`}</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {/* CoinInfo */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild aria-disabled>
                      <div>
                        <Blocks />
                        <span>{`Coin Info`}</span>
                      </div>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  {/* Swap */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild aria-disabled>
                      <div>
                        <Blocks />
                        <span>{`Swap Coin on Sui`}</span>
                      </div>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  {/* NFT */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild aria-disabled>
                      <div>
                        <Blocks />
                        <span>{`NFT Trading`}</span>
                      </div>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

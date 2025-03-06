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
            <SidebarMenuItem>
              <ThemeButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Route</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
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
              {/* Modules */}
              <SidebarMenuItem key={"Modules"}>
                <SidebarMenuButton asChild>
                  <div>
                    <Inbox />
                    <span>{`Modules`}</span>
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

                  {/* Defi */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild aria-disabled>
                      <div>
                        <Settings />
                        <span>{`Defi (Coming Soon)`}</span>
                      </div>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

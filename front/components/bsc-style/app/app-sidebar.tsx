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
  SidebarMenu,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { ModeToggle as ThemeButton } from "./theme-button";
import ThemedLogo from "./themed-logo";

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border bg-sidebar-background text-sidebar-foreground w-64 shadow-lg rounded-none overflow-hidden">
      <SidebarContent className="flex flex-col h-full">
        {/* Header with Logo and Title */}
        <SidebarHeader className="p-5 border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center space-x-3 py-2">
                <div className="pb-2 px-2 flex items-center justify-center">
                  <ThemedLogo size="small" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-accent to-accent/70 text-transparent bg-clip-text">BSCAI</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Main Menu Items */}
        <SidebarGroup className="flex-grow">
          <SidebarGroupContent className="py-6 px-3">
            <SidebarMenu className="space-y-2">
              {/* About */}
              <SidebarMenuItem key="about">
                <SidebarMenuButton
                  asChild
                  className="transition-all duration-200 ease-in-out rounded-xl hover:bg-sidebar-accent group w-full"
                >
                  <a href="/" className="flex items-center py-3 px-4">
                    <div className="p-2 rounded-lg bg-sidebar-accent/30 mr-3 ">
                      <ChevronsLeftRightEllipsis size={18} className="" />
                    </div>
                    <span className="font-medium ">About</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Agent */}
              <SidebarMenuItem key="agent">
                <SidebarMenuButton
                  asChild
                  className="transition-all duration-200 ease-in-out rounded-xl hover:bg-sidebar-accent group w-full"
                >
                  <a href="/agent" className="flex items-center py-3 px-4">
                    <div className="p-2 rounded-lg bg-sidebar-accent/30 mr-3 ">
                      <Bot size={18} className="" />
                    </div>
                    <span className="font-medium ">Agent</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Blueprint Category */}
              <div className="pt-6 pb-2 space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold mb-3 px-4 text-accent/80">
                  Blueprints
                </h3>

                {/* BSC Market */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="transition-all duration-200 ease-in-out rounded-xl hover:bg-sidebar-accent group w-full"
                  >
                    <a href="/bsc-market" className="flex items-center py-3 px-4">
                      <div className="p-2 rounded-lg bg-sidebar-accent/30 mr-3 ">
                        <Blocks size={16} className="" />
                      </div>
                      <span className="font-medium ">BSC Analysis</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Portfolio */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="transition-all duration-200 ease-in-out rounded-xl hover:bg-sidebar-accent group w-full"
                  >
                    <a href="/portfolio" className="flex items-center py-3 px-4">
                      <div className="p-2 rounded-lg bg-sidebar-accent/30 mr-3 ">
                        <Wallet size={16} className="" />
                      </div>
                      <span className="font-medium ">AI Portfolio</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Telegram */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="transition-all duration-200 ease-in-out rounded-xl hover:bg-sidebar-accent group w-full"
                  >
                    <a href="/telegram" className="flex items-center py-3 px-4">
                      <div className="p-2 rounded-lg bg-sidebar-accent/30 mr-3 ">
                        <MessageCircleMore size={16} className="" />
                      </div>
                      <span className="font-medium ">Telegram</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer with Theme Toggle */}
        <SidebarFooter className="p-5 border-t border-sidebar-border bg-sidebar-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium text-sidebar-foreground/80">Theme Setting</span>
            <div className="bg-sidebar-accent p-1 rounded-lg">
              <ThemeButton />
            </div>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
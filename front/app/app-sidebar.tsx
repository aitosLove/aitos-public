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
  XIcon,
  TableOfContentsIcon,
  SearchIcon,
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
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 shadow-none rounded-none w-64">
      <SidebarContent className="flex flex-col h-full">
        {/* Header with Logo and Title */}
        <SidebarHeader className="p-6 border-b border-gray-200 dark:border-gray-800">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center space-x-3">
                <ThemedLogo size="small" />
                <span className="font-bold text-xl tracking-tight">AITOS</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Main Menu Items */}
        <SidebarGroup className="flex-grow">
          <SidebarGroupContent className="py-4">
            <SidebarMenu className="space-y-1">
              {/* About */}
              <SidebarMenuItem key="about" className="px-4">
                <SidebarMenuButton
                  asChild
                  className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                >
                  <a href="/" className="flex items-center py-3 px-2">
                    <ChevronsLeftRightEllipsis className="mr-3" size={18} />
                    <span className="font-medium">About</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Agent */}
              <SidebarMenuItem key="agent" className="px-4">
                <SidebarMenuButton
                  asChild
                  className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                >
                  <a href="/agent" className="flex items-center py-3 px-2">
                    <Bot className="mr-3" size={18} />
                    <span className="font-medium">Agent</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Blueprint Category */}
              <div className="px-4 py-2 mt-4 space-y-1">
                <h3 className="text-xs uppercase tracking-wider font-semibold mb-2 px-2">
                  Blueprints
                </h3>

                {/* Aptos Market */}
                <SidebarMenuItem className="ml-2">
                  <SidebarMenuButton
                    asChild
                    className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                  >
                    <a
                      href="/aptos-market"
                      className="flex items-center py-2 px-2"
                    >
                      <Blocks className="mr-3" size={16} />
                      <span>Aptos Analysis</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Portfolio */}
                <SidebarMenuItem className="ml-2">
                  <SidebarMenuButton
                    asChild
                    className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                  >
                    <a
                      href="/portfolio"
                      className="flex items-center py-2 px-2"
                    >
                      <Wallet className="mr-3" size={16} />
                      <span>AI Portfolio</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="ml-2">
                  <SidebarMenuButton
                    asChild
                    className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                  >
                    <a href="/telegram" className="flex items-center py-2 px-2">
                      <MessageCircleMore className="mr-3" size={16} />
                      <span>Telegram</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* X */}

                    <SidebarMenuItem className="ml-2">
                  <SidebarMenuButton
                    asChild
                    className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                  >
                    <a href="/x" className="flex items-center py-2 px-2">
                      <XIcon className="mr-3" size={16} />
                      <span>X Posts</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>


              <SidebarMenuItem className="ml-2">
                  <SidebarMenuButton
                    asChild
                    className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                  >
                    <a href="/content-evaluation" className="flex items-center py-2 px-2">
                      <TableOfContentsIcon className="mr-3" size={16} />
                      <span>Content Evaluation</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                 <SidebarMenuItem className="ml-2">
                  <SidebarMenuButton
                    asChild
                    className="rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-800 w-full"
                  >
                    <a href="/deep-research" className="flex items-center py-2 px-2">
                      <SearchIcon className="mr-3" size={16} />
                      <span>Deep Research</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>


              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer with Theme Toggle */}
        <SidebarFooter className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <ThemeButton />
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

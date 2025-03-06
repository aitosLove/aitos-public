import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

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
} from "@/components/ui/sidebar";
import Image from "next/image";

// Menu items.
const items = [
  {
    title: "Agent",
    url: "/agent",
    icon: Home,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: Inbox,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: Calendar,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center space-x-2">
                  <Image src="/suikai.png" alt="S" width={32} height={32} />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarGroupLabel>Route</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

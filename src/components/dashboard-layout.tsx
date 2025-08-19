"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Feather, FileText, GitFork, Home, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

const menuItems = [
  {
    href: "/document-generator",
    icon: FileText,
    label: "Documents",
  },
  {
    href: "/flowchart-generator",
    icon: GitFork,
    label: "Flowcharts",
  },
  {
    href: "/wireframe-generator",
    icon: LayoutTemplate,
    label: "Wireframes",
  },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <SidebarTrigger />
            </Button>
            <Feather className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold font-headline">ArtifactForge</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
                <Link href="/home" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Back to Home">
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavFooter() {
    const router = useRouter();

    return (
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip="System Settings"
                        onClick={() => router.push("/systems-settings")}
                    >
                        <Settings className="h-4 w-4" />
                        <span>System Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Documents">
                        <FileText className="h-4 w-4" />
                        <span>Documents</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}

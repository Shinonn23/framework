"use client";

import React, { useState, useEffect, ComponentProps } from "react";

import { SidebarControlOptions } from "./type";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    useSidebar,
} from "@/components/ui/sidebar";
import NavSidebarControl from "./nav-control";
import { useLocalStorage } from "@/hooks/use-localStorage";
import AppHeader from "../header/app-header";
import { SidebarData } from "./const";
import { NavFooter } from "./nav-footer";

// This is sample data.

export function AppSidebar({
    children,
    ...props
}: ComponentProps<typeof Sidebar>) {
    const { setOpen, isMobile } = useSidebar();

    // Sidebar state management [EXPANDED, COLLAPSED, EXPAND_ON_HOVER]
    const [sideBarState, setSideBarState] =
        useLocalStorage<SidebarControlOptions>(
            "sidebar-control-option",
            SidebarControlOptions.EXPANDED,
        );
    const [isHovering, setIsHovering] = useState(false);
    const [hasOpenDropdown, setHasOpenDropdown] = useState(false);

    // Update sidebar open state based on control option and dropdown state
    useEffect(() => {
        if (isMobile) return;

        // If there's an open dropdown and we're in EXPAND_ON_HOVER mode, force expand
        if (
            hasOpenDropdown &&
            sideBarState === SidebarControlOptions.EXPAND_ON_HOVER
        ) {
            setOpen(true);
            return;
        }

        switch (sideBarState) {
            case SidebarControlOptions.EXPANDED:
                setOpen(true);
                break;
            case SidebarControlOptions.COLLAPSED:
                setOpen(false);
                break;
            case SidebarControlOptions.EXPAND_ON_HOVER:
                setOpen(isHovering);
                break;
        }
    }, [sideBarState, isHovering, hasOpenDropdown, isMobile, setOpen]);

    const handleSidebarStateChange = (option: SidebarControlOptions) => {
        setSideBarState(option);
    };

    return (
        <>
            <Sidebar
                {...props}
                collapsible="icon"
                variant="floating"
                onMouseEnter={() => {
                    if (
                        sideBarState ===
                            SidebarControlOptions.EXPAND_ON_HOVER &&
                        !isMobile
                    ) {
                        setIsHovering(true);
                    }
                }}
                onMouseLeave={() => {
                    if (
                        sideBarState ===
                            SidebarControlOptions.EXPAND_ON_HOVER &&
                        !isMobile
                    ) {
                        setIsHovering(false);
                    }
                }}
            >
                <SidebarHeader>
                    <TeamSwitcher
                        teams={SidebarData.teams}
                        onOpenChange={setHasOpenDropdown}
                    />
                </SidebarHeader>
                <SidebarContent className="flex justify-between">
                    <div>
                        <NavMain items={SidebarData.navMain} />
                        <NavProjects projects={SidebarData.projects} />
                    </div>
                    <NavFooter />
                </SidebarContent>
                <SidebarFooter>
                    <NavSidebarControl
                        onStateChange={handleSidebarStateChange}
                        onOpenChange={setHasOpenDropdown}
                    />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </>
    );
}

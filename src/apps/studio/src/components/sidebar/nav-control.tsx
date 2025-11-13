import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PanelLeftDashed } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarControlOptions } from "./type";

export default function NavSidebarControl({
    onStateChange,
    onOpenChange,
}: {
    onStateChange?: (option: SidebarControlOptions) => void;
    onOpenChange?: (open: boolean) => void;
}) {
    return (
        <DropdownMenu onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-0 max-w-8">
                    <PanelLeftDashed />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Sidebar Control</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(SidebarControlOptions).map((option) => (
                    <DropdownMenuItem
                        key={option}
                        onClick={() => onStateChange?.(option)}
                    >
                        {option}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

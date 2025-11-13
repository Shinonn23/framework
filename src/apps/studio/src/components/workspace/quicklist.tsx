import React from "react";
import { HelpCircle } from "lucide-react";
import WorkspaceShortcut from "./shortcut";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

interface WorkspaceQuicklistProps {
    title?: string;
    description?: string;
    items: {
        label: string;
        icon?: string;
        href: string;
    }[];
}

function WorkspaceQuicklist({
    title,
    description,
    items,
}: WorkspaceQuicklistProps) {
    return (
        <div>
            {title && (
                <div className="mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-medium text-muted-foreground">
                            {title}
                        </h2>
                        {description && (
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                    <p className="text-sm">{description}</p>
                                </HoverCardContent>
                            </HoverCard>
                        )}
                    </div>
                </div>
            )}
            <div className="flex flex-col space-y-0">
                {items.map((item, index) => (
                    <WorkspaceShortcut
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        href={item.href}
                    />
                ))}
            </div>
        </div>
    );
}

export default WorkspaceQuicklist;

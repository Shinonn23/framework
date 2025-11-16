import React from "react";
import { HelpCircle } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

interface WorkspaceTextProps {
    content: string;
    align?: "left" | "center" | "right";
    variant?: "body" | "subtitle" | "caption" | "section-header";
    helpIcon?: boolean;
    helpContent?: string;
}

function WorkspaceText({
    content,
    align = "left",
    variant = "body",
    helpIcon = false,
    helpContent,
}: WorkspaceTextProps) {
    const alignClass = `text-${align}`;

    if (variant === "section-header") {
        return (
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-medium text-muted-foreground">
                        {content}
                    </h2>
                    {helpIcon && (
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <p className="text-sm">
                                    {helpContent || `Help information for ${content}`}
                                </p>
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>
            </div>
        );
    }

    const variantClass =
        variant === "subtitle"
            ? "text-lg font-medium"
            : variant === "caption"
              ? "text-sm text-muted-foreground"
              : "text-base";

    return <p className={`${alignClass} ${variantClass} line-clamp-3`}>{content}</p>;
}

export default WorkspaceText;

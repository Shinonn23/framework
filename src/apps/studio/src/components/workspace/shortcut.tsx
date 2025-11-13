import React from "react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface WorkspaceShortcutProps {
    label: string;
    icon?: string;
    href: string;
}

function WorkspaceShortcut({ label, icon, href }: WorkspaceShortcutProps) {
    // Get icon component from lucide-react by name
    const IconComponent = icon ? (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon) : null;
    
    return (
        <a 
            href={href}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 group"
        >
            {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
            <span>{label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    );
}

export default WorkspaceShortcut;
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Icon, IconName } from "@/components/ui/icon-picker";

interface WorkspaceShortcutProps {
    label: string;
    icon?: string;
    href: string;
}

const WorkspaceShortcut = React.forwardRef<
    HTMLAnchorElement,
    WorkspaceShortcutProps
>(({ label, icon, href }, ref) => {
    return (
        <a
            ref={ref}
            href={href}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 group"
        >
            {icon && <Icon name={icon as IconName} className="h-4 w-4 shrink-0" />}
            <span className="truncate">{label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    );
});

WorkspaceShortcut.displayName = "WorkspaceShortcut";

export default WorkspaceShortcut;

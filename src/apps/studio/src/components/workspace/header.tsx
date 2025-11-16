import React from "react";

interface WorkspaceHeaderProps {
    title: string;
    subtitle?: string;
}

const WorkspaceHeader = React.forwardRef<HTMLDivElement, WorkspaceHeaderProps>(
    ({ title, subtitle }, ref) => {
        return (
            <div ref={ref} className="border-b pb-4">
                <h1 className="text-3xl font-bold truncate">{title}</h1>
                {subtitle && (
                    <p className="text-muted-foreground mt-1 truncate">
                        {subtitle}
                    </p>
                )}
            </div>
        );
    },
);

WorkspaceHeader.displayName = "WorkspaceHeader";

export default WorkspaceHeader;

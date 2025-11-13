import React from "react";

interface WorkspaceHeaderProps {
    title: string;
    subtitle?: string;
}

function WorkspaceHeader({ title, subtitle }: WorkspaceHeaderProps) {
    return (
        <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
    );
}

export default WorkspaceHeader;

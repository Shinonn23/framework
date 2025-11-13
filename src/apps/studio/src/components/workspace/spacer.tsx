import React from "react";

interface WorkspaceSpacerProps {
    height?: number;
}

function WorkspaceSpacer({ height = 20 }: WorkspaceSpacerProps) {
    return <div style={{ height: `${height}px` }} aria-hidden="true" />;
}

export default WorkspaceSpacer;
import React from "react";

const WorkspaceSpacer = React.forwardRef<HTMLDivElement>((props, ref) => {
    return <div {...props} ref={ref} aria-hidden="true" />;
});

WorkspaceSpacer.displayName = "WorkspaceSpacer";

export default WorkspaceSpacer;

import React from "react";
import { WorkspaceMeta } from "@/types/workspace/meta";
import WorkspaceHeader from "@/components/workspace/header";
import WorkspaceText from "@/components/workspace/text";
import WorkspaceCard from "@/components/workspace/card";
import WorkspaceShortcut from "@/components/workspace/shortcut";
import WorkspaceSpacer from "@/components/workspace/spacer";
import WorkspaceQuicklist from "@/components/workspace/quicklist";

// Components map for standard types
const componentsMap: Record<string, React.ComponentType<any>> = {
    header: WorkspaceHeader,
    text: WorkspaceText,
    card: WorkspaceCard,
    shortcut: WorkspaceShortcut,
    spacer: WorkspaceSpacer,
    quicklist: WorkspaceQuicklist,
};

async function WorkSpacePage({
    params,
}: {
    params: Promise<{ slug?: string[] }>;
}) {
    const { slug } = await params;
    const slugPath = slug?.join("/") || "dashboard";

    // Load JSON metadata
    let metadata: WorkspaceMeta;
    try {
        metadata = await import(`../(meta)/${slugPath}.json`).then(
            (mod) => mod.default
        );
    } catch (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Workspace not found</h1>
                <p className="text-muted-foreground mt-2">
                    Could not load workspace: {slugPath}
                </p>
            </div>
        );
    }

    const { grid, components } = metadata;
    const gridCols = `grid-cols-${grid.columns}`;
    const gapClass = `gap-${grid.gap}`;

    return (
        <div className={`grid ${gridCols} ${gapClass} p-6`}>
            {components.map((component) => {
                const { id, type, layout, props } = component;
                const Component = componentsMap[type];

                if (!Component) {
                    return (
                        <div
                            key={id}
                            style={{
                                gridColumnStart: layout.x + 1,
                                gridColumnEnd: layout.x + layout.w + 1,
                                gridRowStart: layout.y + 1,
                            }}
                            className="border border-dashed p-4 rounded"
                        >
                            <p className="text-muted-foreground">
                                Unknown component type: {type}
                            </p>
                        </div>
                    );
                }

                return (
                    <div
                        key={id}
                        style={{
                            gridColumnStart: layout.x + 1,
                            gridColumnEnd: layout.x + layout.w + 1,
                            gridRowStart: layout.y + 1,
                        }}
                    >
                        <Component {...props} />
                    </div>
                );
            })}
        </div>
    );
}

export default WorkSpacePage;

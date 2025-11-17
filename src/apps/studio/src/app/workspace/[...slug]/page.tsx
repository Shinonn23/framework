"use client";

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { WorkspaceMeta, WorkspaceComponent } from "@/types/workspace/meta";
import WorkspaceHeader from "@/components/workspace/header";
import WorkspaceText from "@/components/workspace/text";
import WorkspaceCard from "@/components/workspace/card";
import WorkspaceShortcut from "@/components/workspace/shortcut";
import WorkspaceSpacer from "@/components/workspace/spacer";
import WorkspaceQuicklist from "@/components/workspace/quicklist";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Undo2, Redo2 } from "lucide-react";
import {
    HeaderEditDialog,
    TextEditDialog,
    CardEditDialog,
    ShortcutEditDialog,
    SpacerEditDialog,
    QuicklistEditDialog,
} from "@/components/workspace/edit-dialogs";
import { useLayoutHistory } from "@/hooks/use-layout-history";
import {
    DisableInteractions,
    generateResponsiveLayouts,
    syncLayoutToComponents,
    WorkspaceSkeleton,
    resolveLayoutOverlaps,
} from "@/components/workspace/utils";
import { useSize } from "ahooks";
import "@/styles/workspace-grid.css";
import {
    BREAKPOINTS,
    COLS,
    CONTAINER_PADDING,
    MARGIN,
    ROW_HEIGHT,
} from "@/components/workspace/const";
import WorkspaceError from "@/components/workspace/error";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Components map for standard types
const componentsMap: Record<string, React.ComponentType<any>> = {
    header: WorkspaceHeader,
    text: WorkspaceText,
    card: WorkspaceCard,
    shortcut: WorkspaceShortcut,
    spacer: WorkspaceSpacer,
    quicklist: WorkspaceQuicklist,
};

// Main Component
function WorkSpacePage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const $container = useRef(null);
    const size = useSize($container);
    const contentRefs = useRef<Record<string, HTMLElement | null>>({});
    const [slugPath, setSlugPath] = useState<string>("");
    const [metadata, setMetadata] = useState<WorkspaceMeta | null>(null);
    const [components, setComponents] = useState<WorkspaceComponent[]>([]);
    const [originalComponents, setOriginalComponents] = useState<
        WorkspaceComponent[]
    >([]);
    const [currentLayouts, setCurrentLayouts] = useState<Layout[]>([]);
    const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("lg");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingComponent, setEditingComponent] =
        useState<WorkspaceComponent | null>(null);

    // Layout history for undo/redo
    const {
        pushHistory,
        undo,
        redo,
        reset: resetHistory,
        setSkipNext,
        canUndo,
        canRedo,
    } = useLayoutHistory(currentLayouts);

    // Update layout based on content height using ResizeObserver
    const updateLayout = useCallback(() => {
        setSkipNext(); // Skip history recording for auto-height updates
  
        setCurrentLayouts((prevLayout) => {
            return prevLayout.map((item) => {
                const contentEl = contentRefs.current[item.i];
                let calculatedH = item.h;

                if (contentEl && contentEl.offsetHeight > 0) {
                    calculatedH = Math.ceil(contentEl.offsetHeight / ROW_HEIGHT);
                }

                return {
                    ...item,
                    h: calculatedH > 0 ? calculatedH : item.h,
                };
            });
        });
    }, [setSkipNext]);

    // Load params
    useEffect(() => {
        Promise.resolve(params).then((p) => {
            setSlugPath(p.slug?.join("/") || "dashboard");
        });
    }, [params]);

    // Load metadata function
    const loadMetadata = async () => {
        if (!slugPath) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await import(`../(meta)/${slugPath}.json`).then(
                (mod) => mod.default as WorkspaceMeta,
            );
            setMetadata(data);
            setComponents(data.components);
            setOriginalComponents(data.components);

            // Initialize layouts
            const initialLayouts = generateResponsiveLayouts(data.components, size?.height);
            setCurrentLayouts(initialLayouts.lg);
            resetHistory(initialLayouts.lg);
        } catch (err) {
            setError(`Could not load workspace: ${slugPath}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Load metadata when slugPath changes
    useEffect(() => {
        loadMetadata();
    }, [slugPath]);

    // Setup ResizeObserver for dynamic height calculation
    useEffect(() => {
        if (!components.length) return;

        // Use setTimeout to ensure refs are set after render
        const timeoutId = setTimeout(() => {
            updateLayout();

            // Use ResizeObserver to watch content size changes
            const observer = new ResizeObserver(() => {
                // Debounce the update to avoid too many recalculations
                requestAnimationFrame(() => updateLayout());
            });

            // Observe all content elements
            Object.values(contentRefs.current).forEach((el) => {
                if (el) observer.observe(el);
            });

            return () => observer.disconnect();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [components, updateLayout]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        if (!isEditMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "y" || (e.key === "z" && e.shiftKey))
            ) {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditMode, canUndo, canRedo]);

    // Event Handlers
    const handleEditClick = () => {
        setOriginalComponents([...components]);
        setIsEditMode(true);
    };

    const handleLayoutChange = useCallback(
        (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
            if (!isEditMode) return;

            const resolvedLayout = resolveLayoutOverlaps(
                layout,
                COLS[currentBreakpoint as keyof typeof COLS] || COLS.lg,
            );

            setCurrentLayouts(resolvedLayout);
            pushHistory(resolvedLayout);

            const updatedComponents = syncLayoutToComponents(
                resolvedLayout,
                components,
            );
            setComponents(updatedComponents);
        },
        [isEditMode, components, pushHistory, currentBreakpoint],
    );

    const handleBreakpointChange = useCallback((breakpoint: string) => {
        setCurrentBreakpoint(breakpoint);
    }, []);

    const handleUndo = () => {
        const previousLayouts = undo();
        if (previousLayouts) {
            setCurrentLayouts(previousLayouts);
            const updatedComponents = syncLayoutToComponents(
                previousLayouts,
                components,
            );
            setComponents(updatedComponents);
            setTimeout(() => updateLayout(), 100);
        }
    };

    const handleRedo = () => {
        const nextLayouts = redo();
        if (nextLayouts) {
            setCurrentLayouts(nextLayouts);
            const updatedComponents = syncLayoutToComponents(
                nextLayouts,
                components,
            );
            setComponents(updatedComponents);
            setTimeout(() => updateLayout(), 100);
        }
    };

    const handleSaveWorkspace = () => {
        // Sync final layouts to components
        const finalComponents = syncLayoutToComponents(
            currentLayouts,
            components,
        );

        const payload = {
            version: metadata!.version,
            grid: metadata!.grid,
            components: finalComponents,
            responsiveLayouts: generateResponsiveLayouts(finalComponents, size?.height),
        };

        console.log("Mock API Save:", payload);
        // TODO: await fetch(`/api/workspace/${slugPath}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });

        setComponents(finalComponents);
        setOriginalComponents(finalComponents);
        setIsEditMode(false);
    };

    const handleCancelEdit = () => {
        setComponents([...originalComponents]);
        const cancelLayouts = generateResponsiveLayouts(originalComponents, size?.height);
        setCurrentLayouts(cancelLayouts.lg);
        resetHistory(cancelLayouts.lg);
        setIsEditMode(false);
    };

    const handleUpdateComponent = (componentId: string, updatedProps: any) => {
        setComponents((prevComponents) =>
            prevComponents.map((comp) =>
                comp.id === componentId
                    ? { ...comp, props: { ...comp.props, ...updatedProps } }
                    : comp,
            ),
        );
    };

    const handleEditComponent = (component: WorkspaceComponent) => {
        setEditingComponent(component);
    };

    // Render loading state
    if (isLoading) {
        return <WorkspaceSkeleton />;
    }

    // Render error state
    if (error || !metadata) {
        return (
            <WorkspaceError
                error={error || "Unknown error"}
                onRetry={loadMetadata}
            />
        );
    }

    // console.log("[DEBUG] components:", components);
    // console.log("[DEBUG] responsiveLayouts:", responsiveLayouts);

    return (
        <div ref={$container} style={{ height: "100%" }}>
            {/* Toolbar */}
            <div className="flex justify-between items-center gap-2 mb-4 px-6 pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isEditMode && (
                        <span>
                            Breakpoint:{" "}
                            <span className="font-medium">
                                {currentBreakpoint.toUpperCase()}
                            </span>
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                        New
                    </Button>
                    {!isEditMode ? (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleEditClick}
                        >
                            Edit
                        </Button>
                    ) : (
                        <TooltipProvider>
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleUndo}
                                            disabled={!canUndo}
                                        >
                                            <Undo2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Undo (Ctrl+Z)</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRedo}
                                            disabled={!canRedo}
                                        >
                                            <Redo2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Redo (Ctrl+Y)</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSaveWorkspace}
                                >
                                    Save
                                </Button>
                            </>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            {/* Grid Container with React-Grid-Layout */}
            <div className="px-6 pb-6">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: currentLayouts }}
                    breakpoints={BREAKPOINTS}
                    cols={COLS}
                    rowHeight={ROW_HEIGHT}
                    margin={MARGIN}
                    containerPadding={CONTAINER_PADDING}
                    isDraggable={isEditMode}
                    isResizable={isEditMode}
                    onLayoutChange={handleLayoutChange}
                    onBreakpointChange={handleBreakpointChange}
                    preventCollision={false}
                    compactType={"vertical"}
                    useCSSTransforms={false}
                >
                    {components.map((component) => {
                        const { id, type, props } = component;
                        const Component = componentsMap[type];

                        if (!Component) {
                            return (
                                <div
                                    key={id}
                                    className={`${isEditMode ? "border-2 border-dashed border-muted-foreground/20 rounded-lg p-4" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-muted-foreground text-sm">
                                            Unknown component: {type}
                                        </p>
                                        {isEditMode && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEditComponent(
                                                        component,
                                                    )
                                                }
                                                className="p-1 bg-background/80 rounded hover:bg-accent transition-all"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={id}
                                className={`${isEditMode ? "border-2 border-primary/20 rounded-lg p-2 hover:border-primary/40 transition-all" : ""}`}
                            >
                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEditComponent(component)
                                        }
                                        className="absolute top-2 right-2 z-10 p-1 bg-background/90 rounded hover:bg-accent hover:scale-110 transition-all shadow-sm"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                )}
                                <DisableInteractions disabled={isEditMode}>
                                    <Component
                                        {...props}
                                        ref={(el: HTMLElement | null) => {
                                            contentRefs.current[id] = el;
                                        }}
                                    />
                                </DisableInteractions>
                            </div>
                        );
                    })}
                </ResponsiveGridLayout>
            </div>

            {/* Edit Dialogs */}
            {editingComponent && editingComponent.type === "header" && (
                <HeaderEditDialog
                    open={!!editingComponent}
                    onOpenChange={(open) => !open && setEditingComponent(null)}
                    component={editingComponent}
                    onSave={(props) =>
                        handleUpdateComponent(editingComponent.id, props)
                    }
                />
            )}

            {editingComponent && editingComponent.type === "text" && (
                <TextEditDialog
                    open={!!editingComponent}
                    onOpenChange={(open) => !open && setEditingComponent(null)}
                    component={editingComponent}
                    onSave={(props) =>
                        handleUpdateComponent(editingComponent.id, props)
                    }
                />
            )}

            {editingComponent && editingComponent.type === "card" && (
                <CardEditDialog
                    open={!!editingComponent}
                    onOpenChange={(open) => !open && setEditingComponent(null)}
                    component={editingComponent}
                    onSave={(props) =>
                        handleUpdateComponent(editingComponent.id, props)
                    }
                />
            )}

            {editingComponent && editingComponent.type === "shortcut" && (
                <ShortcutEditDialog
                    open={!!editingComponent}
                    onOpenChange={(open) => !open && setEditingComponent(null)}
                    component={editingComponent}
                    onSave={(props) =>
                        handleUpdateComponent(editingComponent.id, props)
                    }
                />
            )}

            {editingComponent && editingComponent.type === "spacer" && (
                <SpacerEditDialog
                    open={!!editingComponent}
                    onOpenChange={(open) => !open && setEditingComponent(null)}
                    component={editingComponent}
                    onSave={(props) =>
                        handleUpdateComponent(editingComponent.id, props)
                    }
                />
            )}

            {editingComponent && editingComponent.type === "quicklist" && (
                <QuicklistEditDialog
                    open={!!editingComponent}
                    onOpenChange={(open) => !open && setEditingComponent(null)}
                    component={editingComponent}
                    onSave={(props) =>
                        handleUpdateComponent(editingComponent.id, props)
                    }
                />
            )}
        </div>
    );
}

export default WorkSpacePage;

import { WorkspaceComponent } from "@/types/workspace/meta";
import React, { FC, ReactNode } from "react";
import { Layout } from "react-grid-layout";
import { COMPONENT_SPECS, COLS, ROW_HEIGHT, MARGIN } from "./const";

const DisableInteractions: FC<{
    disabled: boolean;
    children: ReactNode;
}> = ({ disabled, children }) => (
    <div className={disabled ? "pointer-events-none select-none" : ""}>
        {children}
    </div>
);

// Loading Skeleton Component
function WorkspaceSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-32 bg-muted animate-pulse rounded" />
                <div className="h-32 bg-muted animate-pulse rounded" />
                <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-8 bg-muted animate-pulse rounded" />
        </div>
    );
}

/**
 * Compact layout vertically to remove empty gaps
 * Moves all items upward to fill any empty space
 */
function compactLayoutVertically(layout: Layout[], cols: number): Layout[] {
    // Sort items by y position, then x position
    const sorted = [...layout].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
    });

    const result: Layout[] = [];

    /**
     * Check if a position collides with any existing item in result
     */
    const hasCollision = (testItem: Layout): boolean => {
        return result.some((item) => {
            return !(
                testItem.x + testItem.w <= item.x ||
                item.x + item.w <= testItem.x ||
                testItem.y + testItem.h <= item.y ||
                item.y + item.h <= testItem.y
            );
        });
    };

    /**
     * Find the highest available y position for an item at given x
     */
    const findHighestAvailableY = (item: Layout): number => {
        let testY = 0;

        // Try placing from y=0 and move down until no collision
        while (testY < 1000) {
            const testItem = { ...item, y: testY };
            if (!hasCollision(testItem)) {
                return testY;
            }
            testY++;
        }

        return testY;
    };

    // Place each item at the highest available position
    for (const item of sorted) {
        const optimalY = findHighestAvailableY(item);
        result.push({ ...item, y: optimalY });
    }

    return result;
}

/**
 * Resolves layout overlaps by moving conflicting components to next available positions
 * Uses a cascade/push mechanism - when a component is placed on top of another,
 * the existing component is automatically moved to the nearest free slot
 */
function resolveLayoutOverlaps(layout: Layout[], cols: number): Layout[] {
    const result = [...layout];
    const maxSearchRows = 200;

    /**
     * Check if two layout items overlap
     */
    const isOverlapping = (item1: Layout, item2: Layout): boolean => {
        return !(
            item1.x + item1.w <= item2.x ||
            item2.x + item2.w <= item1.x ||
            item1.y + item1.h <= item2.y ||
            item2.y + item2.h <= item1.y
        );
    };

    /**
     * Check if a position is available (doesn't overlap with any other item)
     */
    const isPositionAvailable = (
        testItem: Layout,
        excludeId: string,
        currentLayout: Layout[],
    ): boolean => {
        if (testItem.x < 0 || testItem.x + testItem.w > cols) {
            return false;
        }

        return !currentLayout.some(
            (item) =>
                item.i !== excludeId &&
                item.i !== testItem.i &&
                isOverlapping(testItem, item),
        );
    };

    /**
     * Find next available position for an item
     */
    const findNextAvailablePosition = (
        item: Layout,
        currentLayout: Layout[],
    ): { x: number; y: number } | null => {
        // Try positions row by row, column by column
        for (let y = 0; y < maxSearchRows; y++) {
            for (let x = 0; x <= cols - item.w; x++) {
                const testItem = { ...item, x, y };
                if (isPositionAvailable(testItem, item.i, currentLayout)) {
                    return { x, y };
                }
            }
        }
        return null;
    };

    /**
     * Recursively resolve overlaps
     */
    const resolveConflict = (
        movedItemId: string,
        currentLayout: Layout[],
    ): Layout[] => {
        const movedItem = currentLayout.find((item) => item.i === movedItemId);
        if (!movedItem) return currentLayout;

        // Find all items that overlap with the moved item
        const conflicts = currentLayout.filter(
            (item) => item.i !== movedItemId && isOverlapping(item, movedItem),
        );

        if (conflicts.length === 0) {
            return currentLayout;
        }

        let updatedLayout = [...currentLayout];

        // Move each conflicting item to next available position
        for (const conflict of conflicts) {
            const newPosition = findNextAvailablePosition(
                conflict,
                updatedLayout,
            );

            if (newPosition) {
                // Update the conflicting item's position
                updatedLayout = updatedLayout.map((item) =>
                    item.i === conflict.i
                        ? { ...item, x: newPosition.x, y: newPosition.y }
                        : item,
                );

                // Recursively resolve any new conflicts caused by this move
                updatedLayout = resolveConflict(conflict.i, updatedLayout);
            }
        }

        return updatedLayout;
    };

    // Process each item and resolve conflicts
    for (let i = 0; i < result.length; i++) {
        const resolvedLayout = resolveConflict(result[i].i, result);
        result.splice(0, result.length, ...resolvedLayout);
    }

    // After resolving overlaps, compact the layout to remove gaps
    return compactLayoutVertically(result, cols);
}

/**
 * Helper function to recalculate layout positions for a different column count
 * Uses bin-packing algorithm for optimal space utilization
 */
function recalculateLayoutForBreakpoint(
    sourceLayout: Layout[],
    sourceCols: number,
    targetCols: number,
): Layout[] {
    // Sort by y position, then x position to maintain visual order
    const sorted = [...sourceLayout].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
    });

    const result: Layout[] = [];

    // Track occupied cells in the grid
    // Key: "x,y", Value: true if occupied
    const occupiedCells = new Set<string>();

    /**
     * Check if a position is available for an item
     */
    const isPositionAvailable = (
        x: number,
        y: number,
        w: number,
        h: number,
    ): boolean => {
        if (x + w > targetCols) return false;

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (occupiedCells.has(`${x + dx},${y + dy}`)) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Mark cells as occupied
     */
    const markOccupied = (x: number, y: number, w: number, h: number): void => {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                occupiedCells.add(`${x + dx},${y + dy}`);
            }
        }
    };

    /**
     * Find the best position for an item using bin-packing strategy
     */
    const findBestPosition = (
        w: number,
        h: number,
    ): { x: number; y: number } => {
        // Try to find the topmost, leftmost available position
        let bestY = 0;
        let maxSearchRows = 100; // Prevent infinite loop

        for (let y = 0; y < maxSearchRows; y++) {
            for (let x = 0; x <= targetCols - w; x++) {
                if (isPositionAvailable(x, y, w, h)) {
                    return { x, y };
                }
            }
        }

        // Fallback: place at the bottom
        return { x: 0, y: maxSearchRows };
    };

    for (const item of sorted) {
        // Scale width proportionally, ensuring it fits within target columns
        let scaledW = Math.min(
            Math.ceil((item.w / sourceCols) * targetCols),
            targetCols,
        );

        // Find the best position using bin-packing
        const { x, y } = findBestPosition(scaledW, item.h);

        // Create new layout item with optimized position
        const newItem: Layout = {
            ...item,
            x,
            y,
            w: scaledW,
            // Keep original height - it's already in grid units
        };

        result.push(newItem);

        // Mark cells as occupied
        markOccupied(x, y, scaledW, item.h);
    }

    return result;
}

function generateResponsiveLayouts(
    components: WorkspaceComponent[],
    containerHeight?: number,
): {
    lg: Layout[];
    md: Layout[];
    sm: Layout[];
    xs: Layout[];
    xxs: Layout[];
} {
    const lg: Layout[] = components.map((comp) => {
        const spec = COMPONENT_SPECS[comp.type] || { w: 12, h: 3 };

        // Calculate dynamic height if containerHeight is provided and component doesn't have h
        let calculatedH = comp.layout.h || spec.h;

        if (!comp.layout.h && containerHeight) {
            // Calculate h based on container height similar to the example
            const totalGridHeight = containerHeight / (ROW_HEIGHT + MARGIN[1]);
            calculatedH = Math.ceil(totalGridHeight / components.length);
        }

        return {
            i: comp.id,
            x: comp.layout.x,
            y: comp.layout.y,
            w: comp.layout.w || spec.w,
            h: calculatedH,
            minW: comp.layout.minW || spec.minW,
            maxW: comp.layout.maxW || spec.maxW,
            minH: comp.layout.minH || spec.minH,
            maxH: comp.layout.maxH || spec.maxH,
            static: comp.layout.isStatic || false,
        };
    });

    // Generate responsive layouts using sequential placement
    const md: Layout[] = recalculateLayoutForBreakpoint(lg, COLS.lg, COLS.md);
    const sm: Layout[] = recalculateLayoutForBreakpoint(lg, COLS.lg, COLS.sm);
    const xs: Layout[] = recalculateLayoutForBreakpoint(lg, COLS.lg, COLS.xs);
    const xxs: Layout[] = recalculateLayoutForBreakpoint(lg, COLS.lg, COLS.xxs);

    return { lg, md, sm, xs, xxs };
}

function syncLayoutToComponents(
    layouts: Layout[],
    components: WorkspaceComponent[],
): WorkspaceComponent[] {
    return components.map((comp) => {
        const layoutItem = layouts.find((l) => l.i === comp.id);
        if (!layoutItem) return comp;

        return {
            ...comp,
            layout: {
                ...comp.layout,
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
            },
        };
    });
}

export {
    generateResponsiveLayouts,
    DisableInteractions,
    WorkspaceSkeleton,
    syncLayoutToComponents,
    resolveLayoutOverlaps,
};

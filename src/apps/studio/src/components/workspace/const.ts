import { GridLayout } from "@/types/workspace/meta";

const COMPONENT_SPECS: Record<
    string,
    Omit<GridLayout, "x" | "y" | "isResizable" | "isStatic">
> = {
    header: {
        w: 12,
        h: 3,
        minW: 6,
        maxW: 12,
        minH: 3,
        maxH: 4,
    },
    text: { w: 12, h: 3, minW: 4, maxW: 12, minH: 3, maxH: 5 },
    card: { w: 4, h: 6, minW: 3, maxW: 6, minH: 4, maxH: 8 },
    shortcut: { w: 3, h: 3, minW: 2, maxW: 6, minH: 2, maxH: 4 },
    spacer: { w: 12, h: 2, minW: 4, maxW: 12, minH: 2, maxH: 3 },
    quicklist: { w: 4, h: 8, minW: 3, maxW: 6, minH: 6, maxH: 12 },
};

// Responsive breakpoints
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// Grid configuration
const ROW_HEIGHT = 30; // Base height in pixels
const MARGIN: [number, number] = [4, 4]; // margin between grid items
const CONTAINER_PADDING: [number, number] = [0, 0]; // container padding

export {
    COMPONENT_SPECS,
    BREAKPOINTS,
    COLS,
    ROW_HEIGHT,
    MARGIN,
    CONTAINER_PADDING,
};

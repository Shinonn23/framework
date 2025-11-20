// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useLayoutHistory } from "../use-layout-history";
import type { Layout } from "react-grid-layout";

describe("useLayoutHistory", () => {
    const mockLayout1: Layout[] = [
        { i: "1", x: 0, y: 0, w: 2, h: 2 },
        { i: "2", x: 2, y: 0, w: 2, h: 2 },
    ];

    const mockLayout2: Layout[] = [
        { i: "1", x: 0, y: 0, w: 3, h: 2 },
        { i: "2", x: 3, y: 0, w: 2, h: 2 },
    ];

    const mockLayout3: Layout[] = [
        { i: "1", x: 0, y: 0, w: 3, h: 3 },
        { i: "2", x: 3, y: 0, w: 3, h: 2 },
    ];

    it("should initialize with initial layouts", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        expect(result.current.currentIndex).toBe(0);
        expect(result.current.historySize).toBe(1);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.getCurrentLayouts()).toEqual(mockLayout1);
    });

    it("should push new layout to history", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
        });

        expect(result.current.currentIndex).toBe(1);
        expect(result.current.historySize).toBe(2);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it("should not push duplicate layouts", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout1);
        });

        expect(result.current.currentIndex).toBe(0);
        expect(result.current.historySize).toBe(1);
    });

    it("should ignore 'moved' property when comparing layouts", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        const layoutWithMoved: Layout[] = [
            { i: "1", x: 0, y: 0, w: 2, h: 2, moved: true },
            { i: "2", x: 2, y: 0, w: 2, h: 2, moved: false },
        ];

        act(() => {
            result.current.pushHistory(layoutWithMoved);
        });

        // Should not add to history since layouts are same except 'moved'
        expect(result.current.historySize).toBe(1);
    });

    it("should perform undo operation", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
            result.current.pushHistory(mockLayout3);
        });

        expect(result.current.currentIndex).toBe(2);

        let previousLayout: Layout[] | null = null;
        act(() => {
            previousLayout = result.current.undo();
        });

        expect(result.current.currentIndex).toBe(1);
        expect(previousLayout).toEqual(mockLayout2);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(true);
    });

    it("should perform redo operation", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
            result.current.pushHistory(mockLayout3);
            result.current.undo();
        });

        expect(result.current.currentIndex).toBe(1);

        let nextLayout: Layout[] | null = null;
        act(() => {
            nextLayout = result.current.redo();
        });

        expect(result.current.currentIndex).toBe(2);
        expect(nextLayout).toEqual(mockLayout3);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it("should not undo when at the beginning", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        let previousLayout: Layout[] | null = null;
        act(() => {
            previousLayout = result.current.undo();
        });

        expect(previousLayout).toBeNull();
        expect(result.current.currentIndex).toBe(0);
    });

    it("should not redo when at the end", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        let nextLayout: Layout[] | null = null;
        act(() => {
            nextLayout = result.current.redo();
        });

        expect(nextLayout).toBeNull();
        expect(result.current.currentIndex).toBe(0);
    });

    it("should clear forward history when pushing after undo", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
            result.current.pushHistory(mockLayout3);
            result.current.undo();
            // Consume skip
            result.current.pushHistory(mockLayout2);
            result.current.undo();
            // Consume skip
            result.current.pushHistory(mockLayout1);
        });

        expect(result.current.currentIndex).toBe(0);
        expect(result.current.historySize).toBe(3);

        const newLayout: Layout[] = [
            { i: "1", x: 0, y: 0, w: 4, h: 4 },
            { i: "2", x: 4, y: 0, w: 4, h: 4 },
        ];

        act(() => {
            result.current.pushHistory(newLayout);
        });

        expect(result.current.currentIndex).toBe(1);
        expect(result.current.historySize).toBe(2);
        expect(result.current.canRedo).toBe(false);
    });

    it("should skip push when setSkipNext is called", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.setSkipNext();
            result.current.pushHistory(mockLayout2);
        });

        expect(result.current.historySize).toBe(1);
        expect(result.current.currentIndex).toBe(0);
    });

    it("should skip push after undo", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
            result.current.undo();
            // Next push after undo should be skipped
            result.current.pushHistory(mockLayout2);
        });

        expect(result.current.historySize).toBe(2);
        expect(result.current.currentIndex).toBe(0);
    });

    it("should skip push after redo", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
            result.current.undo();
            result.current.redo();
            // Next push after redo should be skipped
            result.current.pushHistory(mockLayout2);
        });

        expect(result.current.historySize).toBe(2);
        expect(result.current.currentIndex).toBe(1);
    });

    it("should reset history", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
            result.current.pushHistory(mockLayout3);
        });

        expect(result.current.historySize).toBe(3);

        act(() => {
            result.current.reset(mockLayout1);
        });

        expect(result.current.historySize).toBe(1);
        expect(result.current.currentIndex).toBe(0);
        expect(result.current.getCurrentLayouts()).toEqual(mockLayout1);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it("should limit history size to MAX_HISTORY_SIZE", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        // Push 51 layouts (1 initial + 50 pushes)
        act(() => {
            for (let i = 0; i < 51; i++) {
                const layout: Layout[] = [
                    { i: "1", x: 0, y: 0, w: i + 1, h: 2 },
                    { i: "2", x: i + 1, y: 0, w: 2, h: 2 },
                ];
                result.current.pushHistory(layout);
            }
        });

        // Should be capped at 50
        expect(result.current.historySize).toBe(50);
        expect(result.current.currentIndex).toBe(49);
    });

    it("should handle multiple undo/redo operations", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        act(() => {
            result.current.pushHistory(mockLayout2);
            result.current.pushHistory(mockLayout3);
        });

        // Undo twice
        act(() => {
            result.current.undo();
            result.current.undo();
        });

        expect(result.current.currentIndex).toBe(0);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(true);

        // Redo twice
        act(() => {
            result.current.redo();
            result.current.redo();
        });

        expect(result.current.currentIndex).toBe(2);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it("should return correct current layouts", () => {
        const { result } = renderHook(() => useLayoutHistory(mockLayout1));

        expect(result.current.getCurrentLayouts()).toEqual(mockLayout1);

        act(() => {
            result.current.pushHistory(mockLayout2);
        });

        expect(result.current.getCurrentLayouts()).toEqual(mockLayout2);

        act(() => {
            result.current.undo();
        });

        expect(result.current.getCurrentLayouts()).toEqual(mockLayout1);
    });
});

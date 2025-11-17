import { useState, useCallback, useRef } from "react";
import type { Layout } from "react-grid-layout";

const MAX_HISTORY_SIZE = 50;

interface LayoutHistoryState {
    layouts: Layout[];
    timestamp: number;
}

// Helper to compare layouts ignoring 'moved' property
function areLayoutsEqual(layouts1: Layout[], layouts2: Layout[]): boolean {
    if (layouts1.length !== layouts2.length) return false;
    
    const normalize = (layout: Layout) => {
        const { moved, ...rest } = layout;
        return rest;
    };
    
    return JSON.stringify(layouts1.map(normalize)) === JSON.stringify(layouts2.map(normalize));
}

export function useLayoutHistory(initialLayouts: Layout[]) {
    const [history, setHistory] = useState<LayoutHistoryState[]>([
        { layouts: initialLayouts, timestamp: Date.now() },
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const skipNextPush = useRef(false);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const pushHistory = useCallback(
        (newLayouts: Layout[]) => {
            // Skip if flag is set (undo/redo or auto-height update)
            if (skipNextPush.current) {
                skipNextPush.current = false;
                return;
            }

            setHistory((prev) => {
                const currentLayouts = prev[currentIndex]?.layouts;
                
                // Skip if layouts haven't actually changed
                if (currentLayouts && areLayoutsEqual(currentLayouts, newLayouts)) {
                    return prev;
                }

                // Remove forward history
                const newHistory = prev.slice(0, currentIndex + 1);

                // Add new state
                newHistory.push({
                    layouts: newLayouts,
                    timestamp: Date.now(),
                });

                // Limit history size
                if (newHistory.length > MAX_HISTORY_SIZE) {
                    newHistory.shift();
                    setCurrentIndex((idx) => Math.max(0, idx - 1));
                    return newHistory;
                }

                setCurrentIndex(newHistory.length - 1);
                return newHistory;
            });
        },
        [currentIndex],
    );

    const undo = useCallback(() => {
        if (!canUndo) return null;
        
        skipNextPush.current = true;
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        return history[newIndex].layouts;
    }, [canUndo, currentIndex, history]);

    const redo = useCallback(() => {
        if (!canRedo) return null;
        
        skipNextPush.current = true;
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        return history[newIndex].layouts;
    }, [canRedo, currentIndex, history]);

    const reset = useCallback((newLayouts: Layout[]) => {
        skipNextPush.current = true;
        setHistory([{ layouts: newLayouts, timestamp: Date.now() }]);
        setCurrentIndex(0);
    }, []);

    const getCurrentLayouts = useCallback(() => {
        return history[currentIndex]?.layouts || [];
    }, [history, currentIndex]);

    const setSkipNext = useCallback(() => {
        skipNextPush.current = true;
    }, []);

    return {
        pushHistory,
        undo,
        redo,
        reset,
        canUndo,
        canRedo,
        getCurrentLayouts,
        setSkipNext,
        historySize: history.length,
        currentIndex,
    };
}

import { useState, useCallback, useRef, useEffect } from "react";
import type { Layout } from "react-grid-layout";

const MAX_HISTORY_SIZE = 50;

interface LayoutHistoryState {
    layouts: Layout[];
    timestamp: number;
}

export function useLayoutHistory(initialLayouts: Layout[]) {
    const [history, setHistory] = useState<LayoutHistoryState[]>([
        { layouts: initialLayouts, timestamp: Date.now() },
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const isUndoRedoAction = useRef(false);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const pushHistory = useCallback(
        (newLayouts: Layout[]) => {
            // Don't record history if this is an undo/redo action
            if (isUndoRedoAction.current) {
                isUndoRedoAction.current = false;
                return;
            }

            setHistory((prev) => {
                // Remove any forward history when making a new change
                const newHistory = prev.slice(0, currentIndex + 1);

                // Add new state
                newHistory.push({
                    layouts: newLayouts,
                    timestamp: Date.now(),
                });

                // Limit history size
                if (newHistory.length > MAX_HISTORY_SIZE) {
                    newHistory.shift();
                    setCurrentIndex((idx) => idx - 1);
                } else {
                    setCurrentIndex(newHistory.length - 1);
                }

                return newHistory;
            });
        },
        [currentIndex],
    );

    const undo = useCallback(() => {
        if (canUndo) {
            isUndoRedoAction.current = true;
            setCurrentIndex((idx) => idx - 1);
            return history[currentIndex - 1].layouts;
        }
        return null;
    }, [canUndo, currentIndex, history]);

    const redo = useCallback(() => {
        if (canRedo) {
            isUndoRedoAction.current = true;
            setCurrentIndex((idx) => idx + 1);
            return history[currentIndex + 1].layouts;
        }
        return null;
    }, [canRedo, currentIndex, history]);

    const reset = useCallback((newLayouts: Layout[]) => {
        setHistory([{ layouts: newLayouts, timestamp: Date.now() }]);
        setCurrentIndex(0);
    }, []);

    const getCurrentLayouts = useCallback(() => {
        return history[currentIndex]?.layouts || [];
    }, [history, currentIndex]);

    return {
        pushHistory,
        undo,
        redo,
        reset,
        canUndo,
        canRedo,
        getCurrentLayouts,
        historySize: history.length,
        currentIndex,
    };
}

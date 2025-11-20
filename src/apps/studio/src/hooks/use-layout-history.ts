import { useState, useCallback, useRef } from "react";
import type { Layout } from "react-grid-layout";

const MAX_HISTORY_SIZE = 50;

interface LayoutHistoryState {
    layouts: Layout[];
    timestamp: number;
}

interface State {
    history: LayoutHistoryState[];
    currentIndex: number;
}

// Helper to compare layouts ignoring 'moved' property
function areLayoutsEqual(layouts1: Layout[], layouts2: Layout[]): boolean {
    if (layouts1.length !== layouts2.length) return false;

    const normalize = (layout: Layout) => {
        const { moved, ...rest } = layout;
        return rest;
    };

    return (
        JSON.stringify(layouts1.map(normalize)) ===
        JSON.stringify(layouts2.map(normalize))
    );
}

export function useLayoutHistory(initialLayouts: Layout[]) {
    const initialState = {
        history: [{ layouts: initialLayouts, timestamp: Date.now() }],
        currentIndex: 0,
    };

    const [state, setState] = useState<State>(initialState);
    const stateRef = useRef<State>(initialState);
    const skipNextPush = useRef(false);

    const pushHistory = useCallback((newLayouts: Layout[]) => {
        if (skipNextPush.current) {
            skipNextPush.current = false;
            return;
        }

        const prev = stateRef.current;
        const currentLayouts = prev.history[prev.currentIndex]?.layouts;

        if (currentLayouts && areLayoutsEqual(currentLayouts, newLayouts)) {
            return;
        }

        const newHistory = prev.history.slice(0, prev.currentIndex + 1);
        newHistory.push({
            layouts: newLayouts,
            timestamp: Date.now(),
        });

        let newIndex = newHistory.length - 1;

        if (newHistory.length > MAX_HISTORY_SIZE) {
            newHistory.shift();
            newIndex--;
        }

        const nextState = {
            history: newHistory,
            currentIndex: newIndex,
        };

        stateRef.current = nextState;
        setState(nextState);
    }, []);

    const undo = useCallback(() => {
        const prev = stateRef.current;
        if (prev.currentIndex <= 0) return null;

        skipNextPush.current = true;
        const newIndex = prev.currentIndex - 1;

        const nextState = {
            ...prev,
            currentIndex: newIndex,
        };

        stateRef.current = nextState;
        setState(nextState);

        return nextState.history[newIndex].layouts;
    }, []);

    const redo = useCallback(() => {
        const prev = stateRef.current;
        if (prev.currentIndex >= prev.history.length - 1) return null;

        skipNextPush.current = true;
        const newIndex = prev.currentIndex + 1;

        const nextState = {
            ...prev,
            currentIndex: newIndex,
        };

        stateRef.current = nextState;
        setState(nextState);

        return nextState.history[newIndex].layouts;
    }, []);

    const reset = useCallback((newLayouts: Layout[]) => {
        skipNextPush.current = true;
        const nextState = {
            history: [{ layouts: newLayouts, timestamp: Date.now() }],
            currentIndex: 0,
        };
        stateRef.current = nextState;
        setState(nextState);
    }, []);

    const getCurrentLayouts = useCallback(() => {
        return state.history[state.currentIndex]?.layouts || [];
    }, [state.history, state.currentIndex]);

    const setSkipNext = useCallback(() => {
        skipNextPush.current = true;
    }, []);

    return {
        pushHistory,
        undo,
        redo,
        reset,
        canUndo: state.currentIndex > 0,
        canRedo: state.currentIndex < state.history.length - 1,
        getCurrentLayouts,
        setSkipNext,
        historySize: state.history.length,
        currentIndex: state.currentIndex,
    };
}

// Test setup file for Bun
// This file is preloaded before running tests
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor(callback: any) {
        (this as any).callback = callback;
    }
    observe() {
        // Mock implementation
    }
    unobserve() {
        // Mock implementation
    }
    disconnect() {
        // Mock implementation
    }
};

console.log("Test environment initialized");

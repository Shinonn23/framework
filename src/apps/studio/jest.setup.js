// jest.setup.js
import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
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


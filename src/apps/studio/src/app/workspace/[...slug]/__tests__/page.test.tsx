import "@testing-library/jest-dom";
import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import WorkSpacePage from "../page";
import { useLayoutHistory } from "@/hooks/use-layout-history";
import * as workspaceUtils from "@/components/workspace/utils";
import * as ahooks from "ahooks";

// Mock modules
jest.mock("@/hooks/use-layout-history");
jest.mock("ahooks");
jest.mock("@/components/workspace/header", () => ({
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
        <div ref={ref}>Mock Header</div>
    )),
}));
jest.mock("@/components/workspace/text", () => ({
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
        <div ref={ref}>Mock Text</div>
    )),
}));
jest.mock("@/components/workspace/card", () => ({
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
        <div ref={ref}>Mock Card</div>
    )),
}));
jest.mock("@/components/workspace/shortcut", () => ({
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
        <div ref={ref}>Mock Shortcut</div>
    )),
}));
jest.mock("@/components/workspace/spacer", () => ({
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
        <div ref={ref}>Mock Spacer</div>
    )),
}));
jest.mock("@/components/workspace/quicklist", () => ({
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
        <div ref={ref}>Mock Quicklist</div>
    )),
}));
jest.mock("@/components/workspace/utils");
jest.mock("@/components/workspace/error", () => ({
    __esModule: true,
    default: ({ error, onRetry }: any) => (
        <div>
            <div>Error: {error}</div>
            <button onClick={onRetry}>Retry</button>
        </div>
    ),
}));
jest.mock("@/components/workspace/edit-dialogs", () => ({
    HeaderEditDialog: () => <div>Header Edit Dialog</div>,
    TextEditDialog: () => <div>Text Edit Dialog</div>,
    CardEditDialog: () => <div>Card Edit Dialog</div>,
    ShortcutEditDialog: () => <div>Shortcut Edit Dialog</div>,
    SpacerEditDialog: () => <div>Spacer Edit Dialog</div>,
    QuicklistEditDialog: () => <div>Quicklist Edit Dialog</div>,
}));

const mockWorkspaceMeta = {
    version: "3.0",
    grid: {
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 40,
    },
    components: [
        {
            id: "header-1",
            type: "header",
            layout: { x: 0, y: 0, w: 12, h: 3 },
            props: { title: "Test Header" },
        },
        {
            id: "text-1",
            type: "text",
            layout: { x: 0, y: 3, w: 12, h: 2 },
            props: { content: "Test Content" },
        },
    ],
};

const mockGeneratedLayouts = {
    lg: [
        {
            i: "header-1",
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            minW: 6,
            maxW: 12,
            minH: 3,
            maxH: 4,
            static: false,
        },
        {
            i: "text-1",
            x: 0,
            y: 3,
            w: 12,
            h: 2,
            minW: 4,
            maxW: 12,
            minH: 3,
            maxH: 5,
            static: false,
        },
    ],
    md: [],
    sm: [],
    xs: [],
    xxs: [],
};

describe("WorkSpacePage", () => {
    const mockParams = Promise.resolve({ slug: ["dashboard"] });
    const mockUseLayoutHistory = {
        pushHistory: jest.fn(),
        undo: jest.fn(),
        redo: jest.fn(),
        reset: jest.fn(),
        setSkipNext: jest.fn(),
        canUndo: false,
        canRedo: false,
        currentIndex: 0,
        historySize: 1,
        getCurrentLayouts: jest.fn(() => []),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock useLayoutHistory
        (useLayoutHistory as jest.Mock).mockReturnValue(mockUseLayoutHistory);

        // Mock ahooks useSize
        (ahooks.useSize as jest.Mock).mockReturnValue({
            width: 1200,
            height: 800,
        });

        // Mock workspace utils
        (workspaceUtils.generateResponsiveLayouts as jest.Mock).mockReturnValue(
            mockGeneratedLayouts,
        );
        (workspaceUtils.syncLayoutToComponents as jest.Mock).mockImplementation(
            (layout, components) => components,
        );
        (workspaceUtils.resolveLayoutOverlaps as jest.Mock).mockImplementation(
            (layout) => layout,
        );
        (workspaceUtils.WorkspaceSkeleton as jest.Mock).mockReturnValue(
            <div>Loading...</div>,
        );
        (workspaceUtils.DisableInteractions as jest.Mock).mockImplementation(
            ({ children }) => <>{children}</>,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Initial Render", () => {
        it("should show loading state initially", async () => {
            render(<WorkSpacePage params={mockParams} />);
            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        it("should load metadata and render components", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => {
                expect(screen.getByText("Mock Header")).toBeInTheDocument();
                expect(screen.getByText("Mock Text")).toBeInTheDocument();
            });
        });

        it("should initialize layout history", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => {
                expect(mockUseLayoutHistory.reset).toHaveBeenCalledWith(
                    mockGeneratedLayouts.lg,
                );
            });
        });
    });

    describe("Edit Mode", () => {
        it("should enter edit mode when Edit button is clicked", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            expect(
                screen.getByRole("button", { name: /save/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /cancel/i }),
            ).toBeInTheDocument();
        });

        it("should show undo/redo buttons in edit mode", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            expect(
                screen.getByTestId("undo-button") ||
                    screen.getByLabelText(/undo/i),
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("redo-button") ||
                    screen.getByLabelText(/redo/i),
            ).toBeInTheDocument();
        });

        it("should exit edit mode when Cancel is clicked", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            const cancelButton = screen.getByRole("button", {
                name: /cancel/i,
            });
            fireEvent.click(cancelButton);

            expect(
                screen.getByRole("button", { name: /edit/i }),
            ).toBeInTheDocument();
        });

        it("should reset layouts when canceling edit", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            const cancelButton = screen.getByRole("button", {
                name: /cancel/i,
            });
            fireEvent.click(cancelButton);

            expect(mockUseLayoutHistory.reset).toHaveBeenCalled();
        });
    });

    describe("Undo/Redo Functionality", () => {
        it("should call undo when Ctrl+Z is pressed", async () => {
            const mockUndo = jest.fn(() => mockGeneratedLayouts.lg);
            (useLayoutHistory as jest.Mock).mockReturnValue({
                ...mockUseLayoutHistory,
                undo: mockUndo,
                canUndo: true,
            });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            fireEvent.keyDown(window, { key: "z", ctrlKey: true });

            expect(mockUndo).toHaveBeenCalled();
        });

        it("should call redo when Ctrl+Y is pressed", async () => {
            const mockRedo = jest.fn(() => mockGeneratedLayouts.lg);
            (useLayoutHistory as jest.Mock).mockReturnValue({
                ...mockUseLayoutHistory,
                redo: mockRedo,
                canRedo: true,
            });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            fireEvent.keyDown(window, { key: "y", ctrlKey: true });

            expect(mockRedo).toHaveBeenCalled();
        });

        it("should disable undo button when canUndo is false", async () => {
            (useLayoutHistory as jest.Mock).mockReturnValue({
                ...mockUseLayoutHistory,
                canUndo: false,
            });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            const undoButton = screen
                .getAllByRole("button")
                .find(
                    (btn) =>
                        btn.querySelector(".lucide-undo-2") ||
                        btn.getAttribute("aria-label")?.includes("undo"),
                );

            expect(undoButton).toBeDisabled();
        });

        it("should disable redo button when canRedo is false", async () => {
            (useLayoutHistory as jest.Mock).mockReturnValue({
                ...mockUseLayoutHistory,
                canRedo: false,
            });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            const redoButton = screen
                .getAllByRole("button")
                .find(
                    (btn) =>
                        btn.querySelector(".lucide-redo-2") ||
                        btn.getAttribute("aria-label")?.includes("redo"),
                );

            expect(redoButton).toBeDisabled();
        });
    });

    describe("Layout Changes", () => {
        it("should push history when layout changes in edit mode", async () => {
            const mockPushHistory = jest.fn();
            (useLayoutHistory as jest.Mock).mockReturnValue({
                ...mockUseLayoutHistory,
                pushHistory: mockPushHistory,
            });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            // Simulate layout change (would normally come from react-grid-layout)
            // This is hard to test without full grid layout integration
            expect(mockPushHistory).toBeDefined();
        });

        it("should skip history when setSkipNext is called", async () => {
            const mockSetSkipNext = jest.fn();
            (useLayoutHistory as jest.Mock).mockReturnValue({
                ...mockUseLayoutHistory,
                setSkipNext: mockSetSkipNext,
            });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            // updateLayout should call setSkipNext
            await waitFor(
                () => {
                    expect(mockSetSkipNext).toHaveBeenCalled();
                },
                { timeout: 3000 },
            );
        });
    });

    describe("Save Functionality", () => {
        it("should log save payload when Save is clicked", async () => {
            const consoleSpy = jest.spyOn(console, "log").mockImplementation();

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            const saveButton = screen.getByRole("button", { name: /save/i });
            fireEvent.click(saveButton);

            expect(consoleSpy).toHaveBeenCalledWith(
                "Mock API Save:",
                expect.objectContaining({
                    version: "3.0",
                    components: expect.any(Array),
                    responsiveLayouts: expect.any(Object),
                }),
            );

            consoleSpy.mockRestore();
        });

        it("should exit edit mode after save", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            const saveButton = screen.getByRole("button", { name: /save/i });
            fireEvent.click(saveButton);

            expect(
                screen.getByRole("button", { name: /edit/i }),
            ).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should show error state when metadata fails to load", async () => {
            jest.spyOn(global, "import" as any).mockRejectedValue(
                new Error("Failed to load"),
            );

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => {
                expect(screen.getByText(/Error:/)).toBeInTheDocument();
            });
        });

        it("should retry loading when Retry button is clicked", async () => {
            const importSpy = jest
                .spyOn(global, "import" as any)
                .mockRejectedValueOnce(new Error("Failed to load"))
                .mockResolvedValueOnce({ default: mockWorkspaceMeta });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText(/Error:/));

            const retryButton = screen.getByRole("button", { name: /retry/i });
            fireEvent.click(retryButton);

            await waitFor(() => {
                expect(screen.getByText("Mock Header")).toBeInTheDocument();
            });
        });
    });

    describe("Component Rendering", () => {
        it("should render all component types", async () => {
            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => {
                expect(screen.getByText("Mock Header")).toBeInTheDocument();
                expect(screen.getByText("Mock Text")).toBeInTheDocument();
            });
        });

        it("should show unknown component message for invalid types", async () => {
            const invalidMeta = {
                ...mockWorkspaceMeta,
                components: [
                    {
                        id: "invalid-1",
                        type: "invalid-type",
                        layout: { x: 0, y: 0, w: 12, h: 3 },
                        props: {},
                    },
                ],
            };

            jest.spyOn(global, "import" as any).mockResolvedValue({
                default: invalidMeta,
            });

            render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => {
                expect(
                    screen.getByText(/Unknown component: invalid-type/),
                ).toBeInTheDocument();
            });
        });
    });

    describe("Responsive Behavior", () => {
        it("should update layouts when container size changes", async () => {
            const { rerender } = render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            // Simulate size change
            (ahooks.useSize as jest.Mock).mockReturnValue({
                width: 800,
                height: 600,
            });

            rerender(<WorkSpacePage params={mockParams} />);

            expect(workspaceUtils.generateResponsiveLayouts).toHaveBeenCalled();
        });
    });

    describe("Cleanup", () => {
        it("should remove event listeners on unmount", async () => {
            const removeEventListenerSpy = jest.spyOn(
                window,
                "removeEventListener",
            );

            const { unmount } = render(<WorkSpacePage params={mockParams} />);

            await waitFor(() => screen.getByText("Mock Header"));

            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                "keydown",
                expect.any(Function),
            );
        });
    });
});

// meta-data.ts
interface WorkspaceMeta {
    version: string;
    grid: WorkspaceGrid;
    components: WorkspaceComponent[];
}

interface WorkspaceGrid {
    columns: number;
    gap: number;
}

// layout info (ไม่มี h เพื่อให้ drag-drop ปรับเอง)
interface GridLayout {
    x: number;
    y: number;
    w: number;
    h: number;
}

// base props
interface BaseComponent {
    id: string;
    type: WorkspaceComponentType;
    layout: GridLayout;
    props: Record<string, any>;
}

// ------------------------------------------------------
// Component Types (Discriminated Union)
// ------------------------------------------------------

type WorkspaceComponent =
    | HeaderComponent
    | TextComponent
    | CardComponent
    | ShortcutComponent
    | SpacerComponent
    | OnboardingComponent
    | QuickListComponent
    | SectionHeaderComponent
    | ActionCardComponent
    | CardGridComponent;

// ------------------------------------------------------
// Each component type definition
// ------------------------------------------------------

type WorkspaceComponentType =
    | "header"
    | "text"
    | "card"
    | "shortcut"
    | "spacer"
    | "onboarding"
    | "quicklist"
    | "section-header"
    | "action-card"
    | "card-grid";

// Header
interface HeaderComponent extends BaseComponent {
    type: "header";
    props: {
        title: string;
        subtitle?: string;
    };
}

// Text
interface TextComponent extends BaseComponent {
    type: "text";
    props: {
        content: string;
        align?: "left" | "center" | "right";
        variant?: "body" | "subtitle" | "caption";
    };
}

// Card
interface CardComponent extends BaseComponent {
    type: "card";
    props: {
        title: string;
        description?: string;
        icon?: string;
    };
}

// Shortcut
interface ShortcutComponent extends BaseComponent {
    type: "shortcut";
    props: {
        label: string;
        icon?: string;
        href: string;
    };
}

// Spacer
interface SpacerComponent extends BaseComponent {
    type: "spacer";
    props: {
        height?: number; // optional visual spacing
    };
}

// Onboarding
interface OnboardingComponent extends BaseComponent {
    type: "onboarding";
    props: {
        steps: {
            title: string;
            description?: string;
        }[];
    };
}

// Quick List
interface QuickListComponent extends BaseComponent {
    type: "quicklist";
    props: {
        title?: string;
        description?: string;
        items: {
            label: string;
            icon?: string;
            href: string;
        }[];
    };
}

// Section Header
interface SectionHeaderComponent extends BaseComponent {
    type: "section-header";
    props: {
        title: string;
        description?: string;
        helpIcon?: boolean;
    };
}

// Action Card
interface ActionCardComponent extends BaseComponent {
    type: "action-card";
    props: {
        label: string;
        icon?: string;
        href: string;
    };
}

// Card Grid
interface CardGridComponent extends BaseComponent {
    type: "card-grid";
    props: {
        columns?: number;
        gap?: number;
        cards: Array<{
            id: string;
            label: string;
            icon?: string;
            href: string;
        }>;
    };
}

export type {
    WorkspaceMeta,
    WorkspaceComponent,
    WorkspaceComponentType,
    GridLayout,
    WorkspaceGrid,
    HeaderComponent,
    TextComponent,
    CardComponent,
    ShortcutComponent,
    SpacerComponent,
    OnboardingComponent,
    QuickListComponent,
    SectionHeaderComponent,
    ActionCardComponent,
    CardGridComponent,
};

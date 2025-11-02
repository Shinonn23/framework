import { z } from "zod";

// Builder-specific types
export interface BuilderComponent {
    id: string;
    type: string;
    props: Record<string, any>;
    children?: BuilderComponent[];
}

export interface BuilderPage {
    id: string;
    name: string;
    path: string;
    components: BuilderComponent[];
}

export const BuilderComponentSchema = z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any()),
    children: z.array(z.lazy(() => BuilderComponentSchema)).optional(),
});

export const BuilderPageSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    components: z.array(BuilderComponentSchema),
});

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, ArrowRight } from "lucide-react";

// Import all workspace metadata files
async function getPublicWorkspaces() {
    const workspaces: Array<{
        slug: string;
        title: string;
        description?: string;
        componentsCount: number;
    }> = [];

    // Define workspace files to check
    const workspaceFiles = ["build"];

    for (const file of workspaceFiles) {
        try {
            const metadata = await import(`@/app/workspace/(meta)/${file}.json`).then(
                (mod) => mod.default
            );

            // Only include public workspaces
            if (metadata.public) {
                // Get title from first header component
                const headerComponent = metadata.components.find(
                    (c: any) => c.type === "header"
                );

                workspaces.push({
                    slug: file,
                    title: headerComponent?.props?.title || file,
                    description: headerComponent?.props?.subtitle,
                    componentsCount: metadata.components.length,
                });
            }
        } catch (error) {
            // Skip if file doesn't exist or can't be loaded
            console.error(`Failed to load workspace: ${file}`, error);
        }
    }

    return workspaces;
}

export default async function WorkspacePage() {
    const workspaces = await getPublicWorkspaces();

    return (
        <div className="container mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Workspaces</h1>
                <p className="text-muted-foreground">
                    Browse and access all available workspaces
                </p>
            </div>

            {workspaces.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <LayoutDashboard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No public workspaces available
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((workspace) => (
                        <Link
                            key={workspace.slug}
                            href={`/workspace/${workspace.slug}`}
                            className="group"
                        >
                            <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                                <LayoutDashboard className="h-5 w-5" />
                                                {workspace.title}
                                            </CardTitle>
                                            {workspace.description && (
                                                <CardDescription className="mt-2">
                                                    {workspace.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {workspace.componentsCount} component
                                        {workspace.componentsCount !== 1 ? "s" : ""}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

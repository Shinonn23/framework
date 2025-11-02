import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function projectsPage() {
    const projects = [
        {
            id: 1,
            title: "E-commerce Dashboard",
            description: "Modern dashboard for online store management",
            createdAt: "2024-01-15",
            lastEdited: "2024-01-20",
            status: "Published",
        },
        {
            id: 2,
            title: "Portfolio Website",
            description: "Personal portfolio with dark mode support",
            createdAt: "2024-01-10",
            lastEdited: "2024-01-18",
            status: "Draft",
        },
        {
            id: 3,
            title: "Blog Platform",
            description: "Multi-user blogging platform with CMS",
            createdAt: "2024-01-05",
            lastEdited: "2024-01-17",
            status: "Published",
        },
        {
            id: 4,
            title: "Landing Page",
            description: "SaaS product landing page with animations",
            createdAt: "2023-12-28",
            lastEdited: "2024-01-16",
            status: "Published",
        },
        {
            id: 5,
            title: "Admin Panel",
            description: "Complete admin dashboard template",
            createdAt: "2023-12-20",
            lastEdited: "2024-01-14",
            status: "Draft",
        },
        {
            id: 6,
            title: "Restaurant Website",
            description: "Online menu and reservation system",
            createdAt: "2023-12-15",
            lastEdited: "2024-01-10",
            status: "Published",
        },
    ];

    return (
        <ScrollArea className="h-full w-full pb-12">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">My Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and edit your web builder projects
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-card"
                        >
                            <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                                <span className="text-muted-foreground text-sm">
                                    Preview
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg mb-1">
                                {project.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {project.description}
                            </p>

                            <div className="space-y-1 text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Created:</span>
                                    <span>
                                        {new Date(
                                            project.createdAt,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last edited:</span>
                                    <span>
                                        {new Date(
                                            project.lastEdited,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        project.status === "Published"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    }`}
                                >
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ScrollArea>
    );
}

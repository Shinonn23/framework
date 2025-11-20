import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FilePlus,
    FileText,
    FolderOpen,
    Palette,
    Plus,
    Settings,
    Users,
    Zap,
} from "lucide-react";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
    return (
        <ScrollArea className="h-[calc(100vh-4.975rem)] pb-12">
            <div className="flex min-h-screen flex-col items-center justify-between p-8">
                <div className="container max-w-6xl">
                    <div className="flex flex-col items-center text-center mb-12 mt-8">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                            Framework Studio
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Create and manage your projects easily with powerful
                            tools
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FilePlus className="h-5 w-5" />
                                    New Project
                                </CardTitle>
                                <CardDescription>
                                    Start a new project with various templates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderOpen className="h-5 w-5" />
                                    All Projects
                                </CardTitle>
                                <CardDescription>
                                    Manage and view all existing projects
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    View All
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Settings
                                </CardTitle>
                                <CardDescription>
                                    Customize settings and security
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="border rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">
                            Recent Projects
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Project A</p>
                                        <p className="text-sm text-muted-foreground">
                                            Last edited 2 hours ago
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    Open
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Project B</p>
                                        <p className="text-sm text-muted-foreground">
                                            Last edited 1 day ago
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    Open
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Project C</p>
                                        <p className="text-sm text-muted-foreground">
                                            Last edited 3 days ago
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    Open
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}

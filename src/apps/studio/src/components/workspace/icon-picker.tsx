"use client";

import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IconPickerProps {
    value?: string;
    onSelect: (iconName: string) => void;
    trigger?: React.ReactNode;
}

export function IconPicker({ value, onSelect, trigger }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Get all icon names from lucide-react
    const allIcons = useMemo(() => {
        return Object.keys(LucideIcons).filter(
            (key) =>
                key !== "createLucideIcon" &&
                key !== "default" &&
                typeof LucideIcons[key as keyof typeof LucideIcons] ===
                    "function",
        );
    }, []);

    // Filter icons based on search
    const filteredIcons = useMemo(() => {
        if (!search) return allIcons;
        return allIcons.filter((name) =>
            name.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search, allIcons]);

    const handleSelect = (iconName: string) => {
        onSelect(iconName);
        setOpen(false);
        setSearch("");
    };

    // Get current icon component
    const CurrentIcon = value
        ? (LucideIcons[
              value as keyof typeof LucideIcons
          ] as React.ComponentType<any>)
        : null;

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="w-full justify-start"
                >
                    {CurrentIcon ? (
                        <>
                            <CurrentIcon className="mr-2 h-4 w-4" />
                            {value}
                        </>
                    ) : (
                        "Select icon..."
                    )}
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Select Icon</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />

                        <ScrollArea className="h-[400px]">
                            <div className="grid grid-cols-6 gap-2 p-2">
                                {filteredIcons.map((iconName) => {
                                    const IconComponent = LucideIcons[
                                        iconName as keyof typeof LucideIcons
                                    ] as React.ComponentType<any>;

                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() =>
                                                handleSelect(iconName)
                                            }
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-accent hover:border-primary ${
                                                value === iconName
                                                    ? "border-primary bg-accent"
                                                    : "border-transparent"
                                            }`}
                                            title={iconName}
                                        >
                                            <IconComponent className="h-6 w-6" />
                                            <span className="text-xs mt-1 truncate w-full text-center">
                                                {iconName}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredIcons.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No icons found
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

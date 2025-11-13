"use client";

import React, { useEffect, useState } from "react";
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
} from "@/components/ui/command";
import { Grid2x2, Search } from "lucide-react";

import { Button } from "../ui/button";
import { searchFunctionsMockup } from "./const";
import { SearchFunction } from "./type";

export default function QuickSearchDialog() {
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedFunction, setSelectedFunction] =
        useState<SearchFunction | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState<SearchFunction[]>([]);

    // Toggle command palette with Ctrl+I or Cmd+I
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "i" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelectFunction = (func: SearchFunction) => {
        setSelectedFunction(func);
        setSearchOpen(false);
        setSearchQuery(func.label);

        // Add to recent searches
        setRecentSearches((prev) => {
            const filtered = prev.filter((f) => f.value !== func.value);
            return [func, ...filtered].slice(0, 5);
        });
    };

    const handleInputChange = (value: string) => {
        setSearchQuery(value);
        if (value && !searchOpen) {
            setSearchOpen(true);
        }
    };

    const handleInputFocus = () => {
        setSearchOpen(true);
    };
    return (
        <>
            {/* Search Combobox */}
            <div className="ml-auto flex items-center gap-2">
                {/* Quick action button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(true)}
                    className="gap-2"
                >
                    <Search className="h-4 w-4" />
                    <span className="hidden md:inline">Quick Search</span>
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>{" "}
                        <span className="text-xs">I</span>
                    </kbd>
                </Button>
            </div>

            {/* Command Dialog for Quick Actions */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Search">
                        {searchFunctionsMockup
                            .filter((func) => func.value.includes("search"))
                            .map((func) => (
                                <CommandItem
                                    key={func.value}
                                    onSelect={() => {
                                        handleSelectFunction(func);
                                        setOpen(false);
                                    }}
                                >
                                    <func.icon className="mr-2 h-4 w-4" />
                                    <span>{func.label}</span>
                                    {func.description && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {func.description}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Tools">
                        {searchFunctionsMockup
                            .filter((func) => !func.value.includes("search"))
                            .map((func) => (
                                <CommandItem
                                    key={func.value}
                                    onSelect={() => {
                                        handleSelectFunction(func);
                                        setOpen(false);
                                    }}
                                >
                                    <func.icon className="mr-2 h-4 w-4" />
                                    <span>{func.label}</span>
                                    {func.description && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {func.description}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}

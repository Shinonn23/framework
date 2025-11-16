"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "../ui/breadcrumb";
import QuickSearchDialog from "./quick-search";
import { NavUser } from "./nav-user";

export default function AppHeader() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sticky top-0 z-50">
            <Breadcrumb>
                <BreadcrumbList>
                    {segments.map((segment, index) => {
                        const isLast = index === segments.length - 1;
                        const href =
                            "/" + segments.slice(0, index + 1).join("/");

                        // Convert kebab-case or snake_case to readable format
                        const label = segment
                            .split(/[-_]/)
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                            )
                            .join(" ");

                        return (
                            <React.Fragment key={segment}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={href}>
                                            {label}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator />}
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>

            <QuickSearchDialog />
            <NavUser
                user={{
                    name: "John Doe",
                    email: "john.doe@example.com",
                    avatar: "/path/to/avatar.jpg",
                }}
            />
        </header>
    );
}

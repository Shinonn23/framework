"use client";

import * as React from "react";
import { Command } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { data } from "@/components/sidebar/data";
import { Label } from "@/components/ui/label";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "../ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";

import { useRouter } from "next/navigation";

export function AppSidebar({
    children,
    ...props
}: React.ComponentProps<typeof Sidebar> & {
    children: React.ReactNode;
}) {
    const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
    const { setOpen } = useSidebar();
    const pathname = usePathname();

    const router = useRouter()
    
    // แปลง pathname เป็น breadcrumb segments
    const breadcrumbs = React.useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        return segments.map((segment, index) => ({
            label:
                segment.charAt(0).toUpperCase() +
                segment.slice(1).replace(/-/g, " "),
            href: "/" + segments.slice(0, index + 1).join("/"),
            isLast: index === segments.length - 1,
        }));
    }, [pathname]);

    React.useEffect(() => {
        if (!activeItem.hasSubSidebar) {
            setOpen(false);
        }
    }, [activeItem]);

    return (
        <>
            <Sidebar
                collapsible="icon"
                variant="floating"
                className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
                sidebarInnerClassName="group-data-[variant=floating]:border-0! group-data-[variant=floating]:shadow-none!"
                {...props}
            >
                <Sidebar
                    collapsible="none"
                    className="w-[calc(var(--sidebar-width-icon)+3px)]! border rounded-lg"
                >
                    <SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    asChild
                                    className="md:h-8 md:p-0"
                                >
                                    <Link href="/">
                                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                            <Command className="size-4" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">
                                                Acme Inc
                                            </span>
                                            <span className="truncate text-xs">
                                                Enterprise
                                            </span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent className="px-1.5 md:px-0">
                                <SidebarMenu>
                                    {data.navMain.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                tooltip={{
                                                    children: item.title,
                                                    hidden: false,
                                                }}
                                                onClick={() => {
                                                    setActiveItem(item);
                                                    if (
                                                        activeItem.hasSubSidebar
                                                    ) {
                                                        setOpen(true);
                                                    }
                                                    router.push(item.url);
                                                }}
                                                isActive={
                                                    activeItem?.title ===
                                                    item.title
                                                }
                                                className="px-2.5 md:px-2"
                                            >
                                                <item.icon className="text-2xl" />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        {/*<NavUser user={data.user} />*/}
                    </SidebarFooter>
                </Sidebar>

                {activeItem.hasSubSidebar && (
                    <Sidebar
                        collapsible="none"
                        className="hidden flex-1 md:flex overflow-hidden border rounded-lg ml-2"
                    >
                        <SidebarHeader className="gap-3.5 border-b p-4">
                            <div className="flex w-full items-center justify-between">
                                <div className="text-foreground text-base font-medium">
                                    {activeItem?.title}
                                </div>
                                <Label className="flex items-center gap-2 text-sm">
                                    <span>Unreads</span>
                                    <Switch className="shadow-none" />
                                </Label>
                            </div>
                            <SidebarInput placeholder="Type to search..." />
                        </SidebarHeader>
                        <SidebarContent>
                            <SidebarGroup className="px-0">
                                <SidebarGroupContent></SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                )}
            </Sidebar>
            <SidebarInset className="border rounded-lg h-[calc(100vh-1rem)] flex my-2 overflow-hidden">
                <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 h-12">
                    {activeItem.hasSubSidebar && (
                        <>
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                        </>
                    )}
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.length === 0 ? (
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Home</BreadcrumbPage>
                                </BreadcrumbItem>
                            ) : (
                                breadcrumbs.map((crumb, index) => (
                                    <React.Fragment key={crumb.href}>
                                        <BreadcrumbItem
                                            className={
                                                index === 0
                                                    ? "hidden md:block"
                                                    : ""
                                            }
                                        >
                                            {crumb.isLast ? (
                                                <BreadcrumbPage>
                                                    {crumb.label}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink
                                                    href={crumb.href}
                                                >
                                                    {crumb.label}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!crumb.isLast && (
                                            <BreadcrumbSeparator
                                                className={
                                                    index === 0
                                                        ? "hidden md:block"
                                                        : ""
                                                }
                                            />
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                {children}
            </SidebarInset>
        </>
    );
}

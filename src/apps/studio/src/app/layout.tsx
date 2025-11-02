import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
    SidebarProvider,
} from "@/components/ui/sidebar";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "My App Studio",
    description: "Builder UI for My App",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={GeistMono.className}>
            <body>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "350px",
                        } as React.CSSProperties
                    }
                    defaultOpen={false}
                >
                    <AppSidebar>{children}</AppSidebar>
                </SidebarProvider>
            </body>
        </html>
    );
}

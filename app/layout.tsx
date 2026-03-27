import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Think Board",
  description: "A writing-first workspace that combines Kanban execution with living documentation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen md:grid md:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar />
          <main className="min-h-screen px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

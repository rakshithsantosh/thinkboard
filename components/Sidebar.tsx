"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpenText, KanbanSquare, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/board",
    label: "Kanban Board",
    description: "Move work from ideation to launch.",
    icon: KanbanSquare,
  },
  {
    href: "/documents",
    label: "Documentation",
    description: "Capture durable thinking and reference pages.",
    icon: BookOpenText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="sticky top-0 z-20 mb-4 rounded-[28px] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl tracking-tight text-slate-950">Think Board</p>
            <p className="text-xs text-slate-500">Tasks and knowledge in one flow.</p>
          </div>
          <div className="flex items-center gap-2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-stone-100 text-slate-600 hover:bg-stone-200"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="hidden border-r border-white/70 bg-white/70 px-6 py-8 backdrop-blur md:flex md:min-h-screen md:flex-col">
        <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(253,246,236,0.9))] p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="font-display text-3xl tracking-tight text-slate-950">Think Board</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A calm workspace for moving ideas into execution without losing the notes that made them valuable.
          </p>
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative block overflow-hidden rounded-[24px] border px-4 py-4 transition-all",
                  isActive
                    ? "border-orange-200 bg-orange-50 text-slate-950 shadow-[0_16px_40px_rgba(234,88,12,0.10)]"
                    : "border-transparent bg-transparent text-slate-600 hover:border-white/80 hover:bg-white/70 hover:text-slate-900"
                )}
              >
                {isActive ? (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-[24px] border border-orange-200"
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  />
                ) : null}
                <div className="relative flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 rounded-2xl p-2.5",
                      isActive ? "bg-white text-orange-600" : "bg-stone-100 text-slate-500"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[28px] border border-dashed border-stone-300 bg-stone-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Workflow cue</p>
          <p className="mt-3 font-display text-2xl tracking-tight text-slate-900">Write inside the work.</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Treat every task detail panel like a thinking room, then move distilled decisions into documentation.
          </p>
        </div>
      </aside>
    </>
  );
}

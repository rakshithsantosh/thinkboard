import Link from "next/link";
import { Compass, Home, KanbanSquare } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(251,247,239,0.94))] p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-slate-700">
          <Compass className="h-4 w-4" />
          <span>Page not found</span>
        </div>

        <h1 className="mt-5 font-display text-4xl tracking-tight text-slate-950">
          This Think Board page does not exist.
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          If you ever see Vercel&apos;s plain white <code>404: NOT_FOUND</code> screen
          instead of this page, that means the deployment itself was unavailable,
          not that an in-app route was missing.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/board">
            <Button className="rounded-full">
              <KanbanSquare className="mr-2 h-4 w-4" />
              Go to board
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="rounded-full">
              <Home className="mr-2 h-4 w-4" />
              Back home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

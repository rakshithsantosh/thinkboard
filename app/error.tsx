"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorBoundary({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(251,247,239,0.94))] p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>Workspace temporarily unavailable</span>
        </div>

        <h1 className="mt-5 font-display text-4xl tracking-tight text-slate-950">
          Think Board hit a server-side setup issue.
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          If this is a fresh deployment, confirm that <code>DATABASE_URL</code> is
          set in Vercel and that your Neon database has already been initialized
          with the Think Board Prisma schema.
        </p>

        <div className="mt-6 rounded-[24px] border border-stone-200 bg-white/85 p-5 text-sm leading-7 text-slate-600">
          <p className="font-semibold text-slate-900">Quick recovery checklist</p>
          <p className="mt-2">1. Verify Vercel has a production deployment in the Ready state.</p>
          <p>2. Confirm the environment key is exactly <code>DATABASE_URL</code>.</p>
          <p>3. Run <code>npx prisma migrate deploy</code> or <code>npx prisma db push</code> against the production Neon database.</p>
          {error.digest ? (
            <p className="mt-3 text-xs text-slate-400">Error digest: {error.digest}</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" className="rounded-full" onClick={() => reset()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FileText, FolderTree } from "lucide-react";
import { motion } from "framer-motion";

import type { DocumentTreeNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DocumentTreeProps {
  nodes: DocumentTreeNode[];
  selectedId: string | null;
  onSelect: (documentId: string) => void;
  level?: number;
}

export function DocumentTree({
  nodes,
  selectedId,
  onSelect,
  level = 0,
}: DocumentTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        const isActive = node.id === selectedId;

        return (
          <motion.div key={node.id} layout>
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-[20px] px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-orange-50 text-slate-950"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
              )}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              {node.children.length > 0 ? (
                <FolderTree className="h-4 w-4 shrink-0 text-orange-600" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              )}
              <span className="truncate text-sm font-medium">{node.title}</span>
            </button>
            {node.children.length > 0 ? (
              <DocumentTree
                nodes={node.children}
                selectedId={selectedId}
                onSelect={onSelect}
                level={level + 1}
              />
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}

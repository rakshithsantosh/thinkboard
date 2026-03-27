"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { format } from "date-fns";
import { BookOpenText, Plus, Search, Trash2 } from "lucide-react";

import {
  createDocumentAction,
  deleteDocumentAction,
  updateDocumentAction,
} from "@/actions/documents";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildDocumentTree, EMPTY_RICH_TEXT_DOCUMENT, getWordCount } from "@/lib/editor";
import type { DocumentRecord, DocumentTreeNode, RichTextDocument } from "@/lib/types";

interface DocumentsWorkspaceProps {
  initialDocuments: DocumentRecord[];
}

function filterTree(nodes: DocumentTreeNode[], query: string): DocumentTreeNode[] {
  if (!query) {
    return nodes;
  }

  return nodes.flatMap((node) => {
    const children = filterTree(node.children, query);
    const matches = node.title.toLowerCase().includes(query);

    if (matches || children.length > 0) {
      return [{ ...node, children }];
    }

    return [];
  });
}

export function DocumentsWorkspace({ initialDocuments }: DocumentsWorkspaceProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState<string | null>(initialDocuments[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<RichTextDocument>(EMPTY_RICH_TEXT_DOCUMENT);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(initialDocuments);
    setSelectedId((currentSelectedId) => currentSelectedId ?? initialDocuments[0]?.id ?? null);
  }, [initialDocuments]);

  const selectedDocument = documents.find((document) => document.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedDocument) {
      setTitle("");
      setContent(EMPTY_RICH_TEXT_DOCUMENT);
      return;
    }

    setTitle(selectedDocument.title);
    setContent(selectedDocument.content ?? EMPTY_RICH_TEXT_DOCUMENT);
    setError(null);
  }, [selectedDocument]);

  useEffect(() => {
    if (!selectedId && documents.length > 0) {
      setSelectedId(documents[0].id);
      return;
    }

    if (selectedId && !documents.some((document) => document.id === selectedId)) {
      setSelectedId(documents[0]?.id ?? null);
    }
  }, [documents, selectedId]);

  const tree = buildDocumentTree(documents);
  const filteredTree = filterTree(tree, deferredSearch);

  const handleCreateDocument = (parentId: string | null) => {
    setIsPending(true);
    setError(null);

    void (async () => {
      try {
        const document = await createDocumentAction({
          title: parentId ? "Untitled child page" : "Untitled page",
          parentId,
        });

        setDocuments((currentDocuments) => [...currentDocuments, document]);
        setSelectedId(document.id);
      } catch (actionError) {
        const message =
          actionError instanceof Error ? actionError.message : "Unable to create a page right now.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    })();
  };

  const handleSaveDocument = () => {
    if (!selectedDocument) {
      return;
    }

    setIsPending(true);
    setError(null);

    void (async () => {
      try {
        const updated = await updateDocumentAction({
          id: selectedDocument.id,
          title,
          content,
        });

        setDocuments((currentDocuments) =>
          currentDocuments.map((document) => (document.id === updated.id ? updated : document))
        );
      } catch (actionError) {
        const message =
          actionError instanceof Error ? actionError.message : "Unable to save the page right now.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    })();
  };

  const handleDeleteDocument = () => {
    if (!selectedDocument) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this page? Child pages will be kept and moved to the top level."
    );
    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setError(null);

    void (async () => {
      try {
        await deleteDocumentAction(selectedDocument.id);
        setDocuments((currentDocuments) =>
          currentDocuments
            .filter((document) => document.id !== selectedDocument.id)
            .map((document) =>
              document.parentId === selectedDocument.id
                ? { ...document, parentId: null }
                : document
            )
        );
      } catch (actionError) {
        const message =
          actionError instanceof Error ? actionError.message : "Unable to delete the page right now.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    })();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[34px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(246,242,233,0.95))] p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Documentation</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-slate-950">Living knowledge base</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Capture playbooks, reference notes, and polished thinking that should outlive the task board.
          </p>
          <Button
            className="mt-5 w-full rounded-full"
            onClick={() => handleCreateDocument(null)}
            disabled={isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            New page
          </Button>
        </div>

        <div className="mt-5 rounded-[26px] border border-stone-200 bg-stone-50/70 p-4">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search pages</label>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Product strategy"
              className="h-11 rounded-2xl border-stone-200 bg-white pl-10 focus-visible:ring-orange-200"
            />
          </div>
        </div>

        <div className="mt-5 max-h-[calc(100vh-300px)] overflow-y-auto rounded-[26px] border border-stone-200 bg-white/85 p-3">
          {filteredTree.length > 0 ? (
            <DocumentTree nodes={filteredTree} selectedId={selectedId} onSelect={setSelectedId} />
          ) : (
            <div className="px-3 py-8 text-center text-sm leading-6 text-slate-500">
              No pages match that search yet.
            </div>
          )}
        </div>
      </aside>

      <section className="rounded-[34px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur">
        {selectedDocument ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(251,247,239,0.94))] p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  <BookOpenText className="h-3.5 w-3.5" />
                  <span>Document editor</span>
                </div>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-4 h-14 border-none bg-transparent px-0 text-3xl font-semibold tracking-tight text-slate-950 shadow-none focus-visible:ring-0"
                />
                <p className="text-sm leading-7 text-slate-600">
                  Last updated {format(new Date(selectedDocument.updatedAt), "PPP p")} with {getWordCount(content)} words.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => handleCreateDocument(selectedDocument.id)}
                  disabled={isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New child page
                </Button>
                <Button className="rounded-full" onClick={handleSaveDocument} disabled={isPending || !title.trim()}>
                  {isPending ? "Saving..." : "Save page"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                  onClick={handleDeleteDocument}
                  disabled={isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write the durable version of your thinking here. Use headings, bullets, and decision notes the rest of the team can return to later."
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        ) : (
          <div className="flex min-h-[520px] items-center justify-center rounded-[28px] border border-dashed border-stone-300 bg-stone-50/70 p-8 text-center">
            <div className="max-w-md">
              <p className="font-display text-4xl tracking-tight text-slate-950">Start a document</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Create a page for principles, architecture notes, or the polished version of a task once it becomes shared knowledge.
              </p>
              <Button className="mt-6 rounded-full" onClick={() => handleCreateDocument(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Create first page
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

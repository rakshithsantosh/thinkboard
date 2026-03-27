import type { DocumentRecord, DocumentTreeNode, RichTextDocument, RichTextNode, TaskRecord } from "@/lib/types";

export const EMPTY_RICH_TEXT_DOCUMENT: RichTextDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function ensureRichTextDocument(content: unknown): RichTextDocument {
  if (
    content &&
    typeof content === "object" &&
    "type" in content &&
    (content as { type?: string }).type === "doc"
  ) {
    const candidate = content as RichTextDocument;
    return {
      type: "doc",
      content: Array.isArray(candidate.content) ? candidate.content : [],
    };
  }

  return EMPTY_RICH_TEXT_DOCUMENT;
}

export function extractPlainText(content: unknown): string {
  const document = ensureRichTextDocument(content);
  const fragments: string[] = [];

  const visit = (node: RichTextNode) => {
    if (typeof node.text === "string") {
      fragments.push(node.text);
    }

    node.content?.forEach(visit);
  };

  document.content.forEach(visit);

  return fragments.join(" ").replace(/\s+/g, " ").trim();
}

export function getWordCount(content: unknown): number {
  const plainText = extractPlainText(content);
  return plainText ? plainText.split(/\s+/).length : 0;
}

export function serializeTask(task: {
  id: string;
  title: string;
  summary: string | null;
  content: unknown;
  status: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): TaskRecord {
  return {
    id: task.id,
    title: task.title,
    summary: task.summary,
    content: ensureRichTextDocument(task.content),
    status: task.status as TaskRecord["status"],
    order: task.order,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function serializeDocument(document: {
  id: string;
  title: string;
  content: unknown;
  parentId: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}): DocumentRecord {
  return {
    id: document.id,
    title: document.title,
    content: ensureRichTextDocument(document.content),
    parentId: document.parentId,
    position: document.position,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export function buildDocumentTree(documents: DocumentRecord[]): DocumentTreeNode[] {
  const byId = new Map<string, DocumentTreeNode>();
  const roots: DocumentTreeNode[] = [];

  for (const document of documents) {
    byId.set(document.id, { ...document, children: [] });
  }

  for (const document of documents) {
    const node = byId.get(document.id);
    if (!node) continue;

    if (document.parentId) {
      const parent = byId.get(document.parentId);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  const sortTree = (nodes: DocumentTreeNode[]) => {
    nodes.sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });

    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(roots);
  return roots;
}

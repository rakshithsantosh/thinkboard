import type { TaskStatusValue } from "@/lib/constants";

export type RichTextMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type RichTextNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  text?: string;
  marks?: RichTextMark[];
};

export type RichTextDocument = {
  type: "doc";
  content: RichTextNode[];
};

export type TaskRecord = {
  id: string;
  title: string;
  summary: string | null;
  content: RichTextDocument;
  status: TaskStatusValue;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentRecord = {
  id: string;
  title: string;
  content: RichTextDocument;
  parentId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentTreeNode = DocumentRecord & {
  children: DocumentTreeNode[];
};

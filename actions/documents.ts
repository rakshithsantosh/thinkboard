"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { EMPTY_RICH_TEXT_DOCUMENT, serializeDocument } from "@/lib/editor";
import { prisma } from "@/lib/prisma";

function normalizeTitle(title: string) {
  const normalized = title.trim();

  if (!normalized) {
    throw new Error("A document title is required.");
  }

  return normalized.slice(0, 180);
}

export async function createDocumentAction(input: { title: string; parentId?: string | null }) {
  const title = normalizeTitle(input.title);

  const lastSibling = await prisma.document.findFirst({
    where: { parentId: input.parentId ?? null },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const document = await prisma.document.create({
    data: {
      title,
      parentId: input.parentId ?? null,
      position: (lastSibling?.position ?? -1) + 1,
      content: EMPTY_RICH_TEXT_DOCUMENT as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/documents");
  return serializeDocument(document);
}

export async function updateDocumentAction(input: {
  id: string;
  title: string;
  content: unknown;
}) {
  const title = normalizeTitle(input.title);

  const document = await prisma.document.update({
    where: { id: input.id },
    data: {
      title,
      content: (input.content ?? EMPTY_RICH_TEXT_DOCUMENT) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/documents");
  return serializeDocument(document);
}

export async function deleteDocumentAction(id: string) {
  await prisma.$transaction([
    prisma.document.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    }),
    prisma.document.delete({
      where: { id },
    }),
  ]);

  revalidatePath("/documents");
}

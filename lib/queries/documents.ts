import { prisma } from "@/lib/prisma";
import { serializeDocument } from "@/lib/editor";

export async function getDocuments() {
  const documents = await prisma.document.findMany({
    orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
  });

  return documents.map(serializeDocument);
}

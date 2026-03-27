import { DocumentsWorkspace } from "@/components/documents/DocumentsWorkspace";
import { getDocuments } from "@/lib/queries/documents";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return <DocumentsWorkspace initialDocuments={documents} />;
}

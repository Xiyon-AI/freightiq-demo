import { DocumentsShell } from "@/components/documents/documents-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Manage your AI voice agent's knowledge base and training documents",
};

export default function KnowledgePage() {
  return <DocumentsShell />;
}

import { DocumentsShell } from "@/components/documents/documents-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
  description: "Upload, review, and manage freight documents",
};

export default function DocumentsPage() {
  return <DocumentsShell />;
}

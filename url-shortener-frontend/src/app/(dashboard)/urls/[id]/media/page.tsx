import { UrlMediaManager } from "@/features/urls/components/UrlMediaManager";

export default async function UrlMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = Number.parseInt(resolvedParams.id, 10);

  return <UrlMediaManager id={idNum} />;
}

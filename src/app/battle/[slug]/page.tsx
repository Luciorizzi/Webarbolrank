import { PlaceholderPage } from "@/components/common/PlaceholderPage";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <PlaceholderPage eyebrow="Batalla" title={slug.replaceAll("-", " vs ")} description="La mecánica de batallas entre comunidades está prevista, pero no forma parte de esta etapa." />; }

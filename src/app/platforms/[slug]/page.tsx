import PlatformDetail from '@/components/PlatformDetail'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const name = decodeURIComponent(slug).replace(/-/g, ' ').toUpperCase()
  return {
    title: `${name} :: GAMESCOPE`,
    description: `// Platform: ${name} — all available games`,
  }
}

export default async function PlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PlatformDetail slug={slug} />
}

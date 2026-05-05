import GameDetailClient from '@/components/GameDetail'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return {
    title: `${decodeURIComponent(slug)} | GameScope`,
    description: `Información detallada sobre el juego ${decodeURIComponent(slug)}`,
  }
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <GameDetailClient slug={slug} />
}
import { NextResponse } from 'next/server'

export async function GET() {
  const news = [
    {
      id: 1,
      title: "PlayStation 6 Rumors: What We Know So Far",
      excerpt: "Next-gen console specs leaked? Inside the latest rumors surrounding Sony's upcoming hardware.",
      imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200&auto=format&fit=crop",
      date: new Date().toISOString(),
      category: "Hardware",
    },
    {
      id: 2,
      title: "The Return of Classic RPGs in 2024",
      excerpt: "Why developers are going back to their roots with turn-based combat and deep storytelling.",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      date: new Date(Date.now() - 86400000).toISOString(),
      category: "Editorial",
    },
    {
      id: 3,
      title: "E-Sports Olympics: A New Era Begins",
      excerpt: "The IOC officially announces the inclusion of competitive gaming in the upcoming global event.",
      imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200&auto=format&fit=crop",
      date: new Date(Date.now() - 172800000).toISOString(),
      category: "Esports",
    },
    {
      id: 4,
      title: "Indie Spotlight: Exploring Hollow Horizons",
      excerpt: "We sit down with the creators of the year's most anticipated metroidvania.",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
      date: new Date(Date.now() - 259200000).toISOString(),
      category: "Indie",
    }
  ]

  return NextResponse.json(news)
}

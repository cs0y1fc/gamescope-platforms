'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type NewsItem = {
  id: number
  title: string
  excerpt: string
  imageUrl: string
  date: string
  category: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (!loading && news.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-wide">
            Últimas <span className="text-gradient">Noticias</span>
          </h2>
        </div>
        <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Ver todas &rarr;
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {news.map((item, i) => (
            <article
              key={item.id}
              className="group relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden card-ring cursor-pointer card-enter"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 bg-white">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              {/* Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-600 backdrop-blur-md rounded-md">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {formatDate(item.date)}
                  </span>
                </div>
                
                <h3 className="text-lg font-display font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors duration-300 drop-shadow-sm">
                  {item.title}
                </h3>
                
                <div className="overflow-hidden h-0 group-hover:h-12 transition-all duration-300 ease-out">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

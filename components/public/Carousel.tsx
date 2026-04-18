'use client'

import React, { useState, useEffect } from 'react'

export default function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)
  const total = images.length

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 5000)
    return () => clearInterval(id)
  }, [total])

  return (
    <div className="relative overflow-hidden rounded-sm">
      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
        {images.map((src, idx) => (
          <div key={idx} className="min-w-full flex-shrink-0">
            <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-96 object-cover" />
          </div>
        ))}
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <button onClick={() => setCurrent((current - 1 + total) % total)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center">◀</button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button onClick={() => setCurrent((current + 1) % total)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center">▶</button>
      </div>
    </div>
  )
}

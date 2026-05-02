"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"

export default function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)
  const total = images.length

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 5000)
    return () => clearInterval(id)
  }, [total])

  return (
    <div className="relative overflow-hidden rounded-sm">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="min-w-full flex-shrink-0">
            <Image
              src={src}
              alt={`Gallery ${idx + 1}`}
              className="h-190 w-full object-cover"
              width={1920}
              height={1080}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-1/2 left-4 -translate-y-1/2">
        <button
          onClick={() => setCurrent((current - 1 + total) % total)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
        >
          ◀
        </button>
      </div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <button
          onClick={() => setCurrent((current + 1) % total)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
        >
          ▶
        </button>
      </div>
    </div>
  )
}

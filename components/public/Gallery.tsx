import React from 'react'
import Carousel from './Carousel'

export default function Gallery(): JSX.Element {
  const images = ['/images/gallery-1.svg', '/images/gallery-2.svg', '/images/gallery-3.svg']
  return (
    <section className="py-12 bg-surface-container-lowest">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-6">
          <h2 className="text-3xl font-serif font-black">Galería de Excelencia</h2>
          <p className="text-on-surface-variant">Patrimonio en movimiento.</p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Carousel images={images} />
        </div>
      </div>
    </section>
  )
}

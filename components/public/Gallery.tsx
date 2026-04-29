import ClientCarousel from "@/components/public/ClientCarousel"

export default function Gallery() {
  const images = [
    "/images/gallery-1.webp",
    "/images/gallery-2.webp",
    "/images/gallery-3.webp",
  ]
  return (
    <section className="bg-surface-container-lowest py-12">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-6">
          <h2 className="font-serif text-3xl font-black">
            Galería de Excelencia
          </h2>
          <p className="text-on-surface-variant">Patrimonio en movimiento.</p>
        </div>

        <div className="mx-auto max-w-7xl">
          <ClientCarousel images={images} />
        </div>
      </div>
    </section>
  )
}

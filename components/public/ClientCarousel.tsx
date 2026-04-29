"use client"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"

type Props = {
  images?: string[]
}

export default function ClientCarousel({ images = [] }: Props) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
        }),
      ]}
    >
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="h-140 w-full overflow-hidden">
              <Image
                src={src}
                alt={`Imagen de la galería ${index + 1}`}
                className="h-full w-full object-cover"
                width={1920}
                height={1080}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

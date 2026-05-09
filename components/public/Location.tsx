"use client"

import Link from "next/link"
import { CalendarBlank, MapPin } from "@phosphor-icons/react"

export default function Location() {
  return (
    <section className="relative bg-background py-24" id="ubicacion">
      <div className="container mx-auto grid items-center gap-8 px-6 md:grid-cols-2 md:px-12">
        <div className="space-y-8">
          <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
            El Destino
          </span>
          <h2 className="font-serif text-3xl leading-none font-black tracking-tighter md:text-4xl">
            Villa de la Robla,{" "}
            <span className="text-muted-foreground italic">León.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            El punto de encuentro será la Plaza de la Constitución, un marco
            incomparable para lucir la ingeniería clásica.
          </p>

          <div className="flex items-center gap-4 rounded-lg border border-border bg-muted p-4">
            <MapPin className="text-3xl text-primary" weight="fill" />
            <div>
              <p className="text-xs font-bold tracking-tight uppercase">
                Coordenadas del Evento
              </p>
              <p className="text-sm text-muted-foreground">
                42°51′00″N 5°37′00″O
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-border bg-muted p-4">
            <CalendarBlank className="text-3xl text-primary" weight="fill" />
            <div>
              <p className="text-xs font-bold tracking-tight uppercase">
                Fecha del Evento
              </p>
              <p className="text-sm text-muted-foreground">
                Sábado, 12 de septiembre de 2026
              </p>
            </div>
          </div>

          <Link
            href="https://www.google.com/maps/dir/?api=1&destination=Pl.+la+Constituci%C3%B3n,+24640+La+Robla,+Le%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="rounded-sm border-2 border-primary bg-background px-8 py-3 text-xs font-bold tracking-widest text-primary uppercase transition-all hover:bg-primary hover:text-primary-foreground">
              Cómo Llegar
            </button>
          </Link>
        </div>

        <div className="relative h-125 w-full overflow-hidden rounded-xl border-4 border-background bg-muted shadow-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d443.03944523207053!2d-5.629341992044571!3d42.80344525817155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd37a3f5fa061965%3A0xa4d8d9c2928c8c31!2sPl.%20la%20Constituci%C3%B3n%2C%2024640%20La%20Robla%2C%20Le%C3%B3n!5e0!3m2!1ses!2ses!4v1776528435353!5m2!1ses!2ses"
            className="h-full w-full border-0"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  )
}

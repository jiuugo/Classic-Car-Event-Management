import React from "react"
import Hero from "@/components/public/Hero"
import Gallery from "@/components/public/Gallery"
import Program from "@/components/public/Program"
import Participate from "@/components/public/Participate"
import Location from "@/components/public/Location"
import Sponsors from "@/components/public/Sponsors"

export default function Home() {
  return (
    <>
      <Hero />
      <Gallery />
      <Program />
      <Participate />
      <Location />
      <Sponsors />
    </>
  )
}

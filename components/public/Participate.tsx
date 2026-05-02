"use client"

import { User, Car, CheckCircle, CreditCard } from "@phosphor-icons/react"

export default function Participate() {
  const steps = [
    {
      num: "01",
      title: "Tus Datos",
      desc: "Completa tu nombre, email y DNI/NIE.",
      icon: User,
    },
    {
      num: "02",
      title: "Tus Vehículos",
      desc: "Añade marca, modelo y matrícula de cada coche.",
      icon: Car,
    },
    {
      num: "03",
      title: "Revisión",
      desc: "Revisa los datos y acepta los términos del evento.",
      icon: CheckCircle,
    },
    {
      num: "04",
      title: "Pago Seguro",
      desc: "Abona la cuota y finaliza tu inscripción por Stripe.",
      icon: CreditCard,
    },
  ]

  return (
    <section className="bg-muted py-24" id="participar">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="mb-2 font-serif text-3xl font-black tracking-tighter md:text-4xl">
            Proceso de Inscripción
          </h2>
          <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Cuatro pasos para asegurar tu plaza
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="rounded-sm border-t-4 border-primary bg-card p-10 text-center shadow-sm"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" weight="bold" />
                  </div>
                </div>
                <span className="mb-2 block font-serif text-4xl font-bold text-muted-foreground/40 italic">
                  {step.num}
                </span>
                <h5 className="mb-2 font-bold tracking-tight uppercase">
                  {step.title}
                </h5>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="/register"
            className="rounded-sm bg-primary px-12 py-4 text-sm font-black tracking-widest text-primary-foreground uppercase shadow-2xl transition-colors hover:bg-primary/90"
          >
            Comenzar Inscripción Ahora
          </a>
        </div>
      </div>
    </section>
  )
}

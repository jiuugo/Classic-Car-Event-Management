"use client"

import { useState, useTransition, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ParticipantStepSchema,
  VehicleStepSchema,
  TermsStepSchema,
} from "@/lib/validation/registration.schema"
import { ZodError } from "zod"
import {
  User,
  Car,
  CheckCircle,
  Plus,
  Trash,
  CreditCard,
  Envelope,
  IdentificationCard,
  CarSimple,
} from "@phosphor-icons/react"

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type Vehicle = { brand: string; model: string; license_plate: string }
type FieldErrors = Record<string, string>

const PRICE_PER_VEHICLE = 10
const MAX_VEHICLES = 5

const STEPS = [
  { id: 1, title: "Tus Datos", icon: User },
  { id: 2, title: "Tus Vehículos", icon: Car },
  { id: 3, title: "Confirmación", icon: CheckCircle },
]

const MAX_LENGTHS: Record<string, number> = {
  full_name: 50,
  email: 100,
  national_id: 12,
  brand: 50,
  model: 50,
  license_plate: 10,
}

const emptyVehicle = (): Vehicle => ({
  brand: "",
  model: "",
  license_plate: "",
})

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function InscriptionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  )

  const [participant, setParticipant] = useState({
    full_name: "",
    email: "",
    national_id: "",
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([emptyVehicle()])
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Show toast if user cancelled Stripe
  useEffect(() => {
    if (searchParams.get("cancelled") === "true") {
      toast.error("Pago cancelado. Puedes intentarlo de nuevo.")
      // Clean URL
      window.history.replaceState({}, "", "/register")
    }
  }, [searchParams])

  const totalPrice = vehicles.length * PRICE_PER_VEHICLE

  /* ---- validation helpers ---- */

  const validateParticipant = (data?: typeof participant) => {
    const d = data ?? participant
    try {
      ParticipantStepSchema.parse(d)
      setFieldErrors((prev) => {
        const n = { ...prev }
        delete n.full_name
        delete n.email
        delete n.national_id
        return n
      })
      return true
    } catch (err) {
      if (err instanceof ZodError) {
        const errs: FieldErrors = {}
        err.issues.forEach((i) => {
          errs[i.path[0] as string] ??= i.message
        })
        setFieldErrors((prev) => {
          const n = { ...prev }
          delete n.full_name
          delete n.email
          delete n.national_id
          return { ...n, ...errs }
        })
      }
      return false
    }
  }

  const validateVehicles = (list?: Vehicle[]) => {
    const v = list ?? vehicles
    let allValid = true
    const newErrors: FieldErrors = {}

    // Clear old vehicle errors
    setFieldErrors((prev) => {
      const n = { ...prev }
      Object.keys(n).forEach((k) => {
        if (k.startsWith("vehicles[")) delete n[k]
      })
      return n
    })

    v.forEach((vehicle, idx) => {
      try {
        VehicleStepSchema.parse(vehicle)
      } catch (err) {
        allValid = false
        if (err instanceof ZodError) {
          err.issues.forEach((i) => {
            const key = `vehicles[${idx}].${String(i.path[0])}`
            newErrors[key] ??= i.message
          })
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...newErrors }))
    }
    return allValid
  }

  const validateTerms = () => {
    try {
      TermsStepSchema.parse({ accept_terms: acceptTerms })
      setFieldErrors((prev) => {
        const n = { ...prev }
        delete n.accept_terms
        return n
      })
      return true
    } catch (err) {
      if (err instanceof ZodError) {
        setFieldErrors((prev) => ({
          ...prev,
          accept_terms: err.issues[0]?.message ?? "Requerido",
        }))
      }
      return false
    }
  }

  const isStepValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        participant.full_name.trim().length >= 2 &&
        participant.email.includes("@") &&
        participant.email.includes(".") &&
        participant.national_id.trim().length >= 2
      )
    }
    if (currentStep === 2) {
      return vehicles.every(
        (v) =>
          v.brand.trim().length > 0 &&
          v.model.trim().length > 0 &&
          v.license_plate.trim().length > 0
      )
    }
    return acceptTerms
  }, [currentStep, participant, vehicles, acceptTerms])

  /* ---- field updaters ---- */

  const updateParticipant = (field: string, value: string) => {
    const max = MAX_LENGTHS[field]
    const v = max ? value.slice(0, max) : value
    setParticipant((prev) => {
      const next = { ...prev, [field]: v }
      if (touchedFields[field]) validateParticipant(next)
      return next
    })
    setError(null)
  }

  const updateVehicle = (idx: number, field: string, value: string) => {
    const max = MAX_LENGTHS[field]
    const v = max ? value.slice(0, max) : value
    setVehicles((prev) => {
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        [field]: field === "license_plate" ? v.toUpperCase() : v,
      }
      const key = `vehicles[${idx}].${field}`
      if (touchedFields[key]) validateVehicles(next)
      return next
    })
    setError(null)
  }

  const addVehicle = () => {
    if (vehicles.length < MAX_VEHICLES) {
      setVehicles((prev) => [...prev, emptyVehicle()])
    }
  }

  const removeVehicle = (idx: number) => {
    if (vehicles.length > 1) {
      setVehicles((prev) => prev.filter((_, i) => i !== idx))
      // clear related errors
      setFieldErrors((prev) => {
        const n = { ...prev }
        Object.keys(n).forEach((k) => {
          if (k.startsWith(`vehicles[${idx}]`)) delete n[k]
        })
        return n
      })
    }
  }

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    if (currentStep === 1) validateParticipant()
    if (currentStep === 2) validateVehicles()
  }

  const handleVehicleBlur = (idx: number, field: string) => {
    const key = `vehicles[${idx}].${field}`
    setTouchedFields((prev) => ({ ...prev, [key]: true }))
    validateVehicles()
  }

  const getFieldError = (field: string): string | undefined => {
    if (!touchedFields[field]) return undefined
    return fieldErrors[field]
  }

  const getVehicleError = (idx: number, field: string): string | undefined => {
    const key = `vehicles[${idx}].${field}`
    if (!touchedFields[key]) return undefined
    return fieldErrors[key]
  }

  /* ---- step navigation ---- */

  const nextStep = () => {
    if (currentStep === 1) {
      ;["full_name", "email", "national_id"].forEach((f) =>
        setTouchedFields((prev) => ({ ...prev, [f]: true }))
      )
      if (!validateParticipant()) return
    }
    if (currentStep === 2) {
      vehicles.forEach((_, idx) => {
        ;["brand", "model", "license_plate"].forEach((f) =>
          setTouchedFields((prev) => ({
            ...prev,
            [`vehicles[${idx}].${f}`]: true,
          }))
        )
      })
      if (!validateVehicles()) return
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  /* ---- submit → Stripe ---- */

  const handleSubmit = async () => {
    setTouchedFields((prev) => ({ ...prev, accept_terms: true }))
    if (!validateTerms()) return

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: participant.full_name,
            email: participant.email,
            national_id: participant.national_id,
            vehicles,
            accept_terms: acceptTerms,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Error al iniciar el pago")
          toast.error(data.error || "Error al iniciar el pago")
          return
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido"
        setError(msg)
        toast.error(msg)
      }
    })
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="mx-auto max-w-2xl">
      {/* ---- Stepper ---- */}
      <div className="mb-10 flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isCompleted = currentStep > step.id
          const isActive = currentStep === step.id
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-zinc-300 text-zinc-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle weight="bold" className="h-5 w-5" />
                  ) : (
                    <Icon
                      weight={isActive ? "bold" : "regular"}
                      className="h-5 w-5"
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-primary/70"
                        : "text-zinc-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-3 h-0.5 w-10 transition-colors duration-500 sm:w-20 md:mx-5 md:w-28 ${
                    isCompleted ? "bg-primary" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ---- Price badge ---- */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <Badge
          variant="secondary"
          className="gap-1 px-3 py-1 text-sm font-semibold"
        >
          <CarSimple weight="fill" className="h-4 w-4" />
          {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"}
        </Badge>
        <Badge className="gap-1 px-3 py-1 text-sm font-bold">
          <CreditCard weight="fill" className="h-4 w-4" />
          {totalPrice} €
        </Badge>
      </div>

      {/* ---- Card ---- */}
      <Card className="border-zinc-200 shadow-md">
        <CardContent className="p-6 pt-6 md:p-8">
          {/* === STEP 1 === */}
          {currentStep === 1 && (
            <div className="grid animate-in gap-5 duration-300 fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-xl font-bold">Datos del Participante</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Introduce tus datos personales para la inscripción.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="full_name"
                  className="flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Nombre completo
                </Label>
                <Input
                  id="full_name"
                  value={participant.full_name}
                  maxLength={MAX_LENGTHS.full_name}
                  onChange={(e) =>
                    updateParticipant("full_name", e.target.value)
                  }
                  onBlur={() => handleBlur("full_name")}
                  placeholder="Juan García García"
                  aria-invalid={!!getFieldError("full_name")}
                />
                {getFieldError("full_name") && (
                  <p className="animate-in text-xs font-medium text-destructive duration-200 fade-in">
                    {getFieldError("full_name")}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Envelope className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={participant.email}
                  maxLength={MAX_LENGTHS.email}
                  onChange={(e) => updateParticipant("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="juan@email.com"
                  aria-invalid={!!getFieldError("email")}
                />
                {getFieldError("email") && (
                  <p className="animate-in text-xs font-medium text-destructive duration-200 fade-in">
                    {getFieldError("email")}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="national_id"
                  className="flex items-center gap-1.5"
                >
                  <IdentificationCard className="h-3.5 w-3.5 text-muted-foreground" />
                  DNI / NIE
                </Label>
                <Input
                  id="national_id"
                  value={participant.national_id}
                  maxLength={MAX_LENGTHS.national_id}
                  onChange={(e) =>
                    updateParticipant("national_id", e.target.value)
                  }
                  onBlur={() => handleBlur("national_id")}
                  placeholder="12345678A"
                  aria-invalid={!!getFieldError("national_id")}
                />
                {getFieldError("national_id") && (
                  <p className="animate-in text-xs font-medium text-destructive duration-200 fade-in">
                    {getFieldError("national_id")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* === STEP 2 === */}
          {currentStep === 2 && (
            <div className="grid animate-in gap-5 duration-300 fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-xl font-bold">Tus Vehículos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Añade los vehículos que participarán. Cada vehículo tiene un
                  coste de <strong>{PRICE_PER_VEHICLE} €</strong>.
                </p>
              </div>

              {vehicles.map((vehicle, idx) => (
                <div
                  key={idx}
                  className="relative animate-in rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 transition-all duration-200 fade-in slide-in-from-bottom-2"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <CarSimple
                        weight="fill"
                        className="h-4 w-4 text-primary"
                      />
                      Vehículo {idx + 1}
                    </span>
                    {vehicles.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVehicle(idx)}
                        className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label htmlFor={`brand-${idx}`} className="text-xs">
                        Marca
                      </Label>
                      <Input
                        id={`brand-${idx}`}
                        value={vehicle.brand}
                        maxLength={MAX_LENGTHS.brand}
                        onChange={(e) =>
                          updateVehicle(idx, "brand", e.target.value)
                        }
                        onBlur={() => handleVehicleBlur(idx, "brand")}
                        placeholder="Seat"
                        aria-invalid={!!getVehicleError(idx, "brand")}
                      />
                      {getVehicleError(idx, "brand") && (
                        <p className="text-xs font-medium text-destructive">
                          {getVehicleError(idx, "brand")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`model-${idx}`} className="text-xs">
                        Modelo
                      </Label>
                      <Input
                        id={`model-${idx}`}
                        value={vehicle.model}
                        maxLength={MAX_LENGTHS.model}
                        onChange={(e) =>
                          updateVehicle(idx, "model", e.target.value)
                        }
                        onBlur={() => handleVehicleBlur(idx, "model")}
                        placeholder="Ibiza"
                        aria-invalid={!!getVehicleError(idx, "model")}
                      />
                      {getVehicleError(idx, "model") && (
                        <p className="text-xs font-medium text-destructive">
                          {getVehicleError(idx, "model")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`plate-${idx}`} className="text-xs">
                        Matrícula
                      </Label>
                      <Input
                        id={`plate-${idx}`}
                        value={vehicle.license_plate}
                        maxLength={MAX_LENGTHS.license_plate}
                        onChange={(e) =>
                          updateVehicle(idx, "license_plate", e.target.value)
                        }
                        onBlur={() => handleVehicleBlur(idx, "license_plate")}
                        placeholder="1234 ABC"
                        aria-invalid={!!getVehicleError(idx, "license_plate")}
                      />
                      {getVehicleError(idx, "license_plate") && (
                        <p className="text-xs font-medium text-destructive">
                          {getVehicleError(idx, "license_plate")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {vehicles.length < MAX_VEHICLES && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addVehicle}
                  className="w-full gap-2 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Añadir otro vehículo
                </Button>
              )}
            </div>
          )}

          {/* === STEP 3 === */}
          {currentStep === 3 && (
            <div className="grid animate-in gap-5 duration-300 fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-xl font-bold">Resumen de tu inscripción</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revisa los datos antes de proceder al pago.
                </p>
              </div>

              {/* Participant summary */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <User weight="bold" className="h-4 w-4 text-primary" />
                  Participante
                </h4>
                <div className="grid gap-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      {participant.full_name}
                    </span>
                  </p>
                  <p>{participant.email}</p>
                  <p>DNI/NIE: {participant.national_id}</p>
                </div>
              </div>

              {/* Vehicles summary */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Car weight="bold" className="h-4 w-4 text-primary" />
                  Vehículos ({vehicles.length})
                </h4>
                <div className="divide-y divide-zinc-200">
                  {vehicles.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm">
                        <span className="font-medium text-foreground">
                          {v.brand} {v.model}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          ({v.license_plate})
                        </span>
                      </span>
                      <span className="text-sm font-semibold">
                        {PRICE_PER_VEHICLE} €
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-300 pt-3">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-lg font-black text-primary">
                    {totalPrice} €
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="accept_terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => {
                    setAcceptTerms(checked === true)
                    if (touchedFields.accept_terms) validateTerms()
                  }}
                  className="mt-0.5"
                />
                <label
                  htmlFor="accept_terms"
                  className="cursor-pointer text-sm leading-snug text-muted-foreground"
                >
                  Acepto los{" "}
                  <span className="font-medium text-foreground underline underline-offset-2">
                    términos y condiciones
                  </span>{" "}
                  del evento*
                </label>
              </div>
              {getFieldError("accept_terms") && (
                <p className="animate-in text-xs font-medium text-destructive duration-200 fade-in">
                  {getFieldError("accept_terms")}
                </p>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ---- Navigation buttons ---- */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isPending}
            >
              Atrás
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid || isPending}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepValid || isPending}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Redirigiendo…
                  </>
                ) : (
                  <>
                    <CreditCard weight="bold" className="h-4 w-4" />
                    Pagar {totalPrice} € con Stripe
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

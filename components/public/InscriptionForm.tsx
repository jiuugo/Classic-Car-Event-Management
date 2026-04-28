"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { InscriptionResult } from "@/app/actions/inscription.server"
import {
  ParticipantStepSchema,
  VehicleStepSchema,
  TermsStepSchema,
} from "@/lib/validation/registration.schema"
import { ZodError } from "zod"

const steps = [
  { id: 1, title: "Tus Datos" },
  { id: 2, title: "Tu Vehículo" },
  { id: 3, title: "Confirmación" },
]

type FieldErrors = Record<string, string>

export default function InscriptionForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  )
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    national_id: "",
    brand: "",
    model: "",
    license_plate: "",
    accept_terms: false,
  })

  const MAX_LENGTHS: Record<string, number> = {
    full_name: 50,
    email: 100,
    national_id: 12,
    brand: 50,
    model: 50,
    license_plate: 10,
  }

  const validateAndUpdateErrors = useMemo(() => {
    return (
      step: number,
      field?: string,
      dataOverride?: Record<string, any>
    ) => {
      try {
        let schema
        let data
        const source = dataOverride ?? formData

        const stepFields =
          step === 1
            ? ["full_name", "email", "national_id"]
            : step === 2
              ? ["brand", "model", "license_plate"]
              : ["accept_terms"]

        if (step === 1) {
          schema = ParticipantStepSchema
          data = {
            full_name: source.full_name,
            email: source.email,
            national_id: source.national_id,
          }
        } else if (step === 2) {
          schema = VehicleStepSchema
          data = {
            brand: source.brand,
            model: source.model,
            license_plate: source.license_plate,
          }
        } else {
          schema = TermsStepSchema
          data = { accept_terms: source.accept_terms }
        }

        schema.parse(data)
        setFieldErrors((prev) => {
          const newErrors = { ...prev }
          stepFields.forEach((f) => delete newErrors[f])
          return newErrors
        })
        return true
      } catch (err) {
        if (err instanceof ZodError) {
          const newErrors: FieldErrors = {}
          err.issues.forEach((issue) => {
            const path = issue.path[0] as string
            if (!newErrors[path]) {
              newErrors[path] = issue.message
            }
          })

          const stepFields =
            step === 1
              ? ["full_name", "email", "national_id"]
              : step === 2
                ? ["brand", "model", "license_plate"]
                : ["accept_terms"]

          setFieldErrors((prev) => {
            const next = { ...prev }
            stepFields.forEach((f) => delete next[f])
            return { ...next, ...newErrors }
          })
        }
        return false
      }
    }
  }, [formData])

  const isStepValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        formData.full_name.trim().length >= 2 &&
        formData.email.includes("@") &&
        formData.email.includes(".") &&
        formData.national_id.trim().length >= 2
      )
    }
    if (currentStep === 2) {
      return (
        formData.brand.trim().length > 0 &&
        formData.model.trim().length > 0 &&
        formData.license_plate.trim().length > 0
      )
    }
    return formData.accept_terms
  }, [currentStep, formData])

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      let newValue: any = value
      if (typeof value === "string") {
        const max = MAX_LENGTHS[field]
        if (typeof max === "number") {
          newValue = value.slice(0, max)
        }
      }

      const next = { ...prev, [field]: newValue }
      if (touchedFields[field]) {
        validateAndUpdateErrors(currentStep, field, next)
      }
      return next
    })
    setError(null)
  }

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    validateAndUpdateErrors(currentStep, field)
  }

  const nextStep = () => {
    const allFieldsTouched = getStepFields(currentStep).reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    )
    setTouchedFields((prev) => ({ ...prev, ...allFieldsTouched }))

    const isValid = validateAndUpdateErrors(currentStep)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 1:
        return ["full_name", "email", "national_id"]
      case 2:
        return ["brand", "model", "license_plate"]
      case 3:
        return ["accept_terms"]
      default:
        return []
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setTouchedFields({
      full_name: true,
      email: true,
      national_id: true,
      brand: true,
      model: true,
      license_plate: true,
      accept_terms: true,
    })

    const isValid = validateAndUpdateErrors(3)
    if (!isValid) return

    startTransition(async () => {
      try {
        const res = await fetch("/api/inscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data: InscriptionResult = await res.json()

        if (!res.ok || !data.success) {
          setError(data.error || "Error al enviar el formulario")
          toast.error(data.error || "Error al enviar el formulario")
          return
        }

        toast.success("Inscripción enviada correctamente")
        router.push("/register/success")
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error desconocido"
        setError(errorMsg)
        toast.error(errorMsg)
      }
    })
  }

  const getFieldError = (field: string): string | undefined => {
    if (!touchedFields[field]) return undefined
    return fieldErrors[field]
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold ${
                currentStep >= step.id
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-300 text-zinc-400"
              }`}
            >
              {step.id}
            </div>
            <span
              className={`ml-2 hidden text-sm font-medium md:block ${
                currentStep >= step.id ? "text-primary" : "text-zinc-400"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`ml-4 h-0.5 w-8 md:w-16 ${
                  currentStep > step.id ? "bg-primary" : "bg-zinc-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        {currentStep === 1 && (
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Datos del Participante</h3>
            <div>
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                maxLength={MAX_LENGTHS.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                onBlur={() => handleBlur("full_name")}
                placeholder="Juan García García"
                aria-invalid={!!getFieldError("full_name")}
              />
              {getFieldError("full_name") && (
                <p className="mt-1 text-xs text-red-500">
                  {getFieldError("full_name")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                maxLength={MAX_LENGTHS.email}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="juan@email.com"
                aria-invalid={!!getFieldError("email")}
              />
              {getFieldError("email") && (
                <p className="mt-1 text-xs text-red-500">
                  {getFieldError("email")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="national_id">DNI / NIE</Label>
              <Input
                id="national_id"
                value={formData.national_id}
                maxLength={MAX_LENGTHS.national_id}
                onChange={(e) => updateField("national_id", e.target.value)}
                onBlur={() => handleBlur("national_id")}
                placeholder="12345678A"
                aria-invalid={!!getFieldError("national_id")}
              />
              {getFieldError("national_id") && (
                <p className="mt-1 text-xs text-red-500">
                  {getFieldError("national_id")}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Datos del Vehículo</h3>
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                maxLength={MAX_LENGTHS.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                onBlur={() => handleBlur("brand")}
                placeholder="Seat"
                aria-invalid={!!getFieldError("brand")}
              />
              {getFieldError("brand") && (
                <p className="mt-1 text-xs text-red-500">
                  {getFieldError("brand")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                maxLength={MAX_LENGTHS.model}
                onChange={(e) => updateField("model", e.target.value)}
                onBlur={() => handleBlur("model")}
                placeholder="Ibiza"
                aria-invalid={!!getFieldError("model")}
              />
              {getFieldError("model") && (
                <p className="mt-1 text-xs text-red-500">
                  {getFieldError("model")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="license_plate">Matrícula</Label>
              <Input
                id="license_plate"
                value={formData.license_plate}
                maxLength={MAX_LENGTHS.license_plate}
                onChange={(e) =>
                  updateField("license_plate", e.target.value.toUpperCase())
                }
                onBlur={() => handleBlur("license_plate")}
                placeholder="1234 ABC"
                aria-invalid={!!getFieldError("license_plate")}
              />
              {getFieldError("license_plate") && (
                <p className="mt-1 text-xs text-red-500">
                  {getFieldError("license_plate")}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Resumen</h3>
            <div className="rounded bg-zinc-50 p-4 text-sm">
              <p>
                <strong>Participante:</strong> {formData.full_name}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>DNI/NIE:</strong> {formData.national_id}
              </p>
              <p className="mt-2">
                <strong>Vehículo:</strong> {formData.brand} {formData.model}
              </p>
              <p>
                <strong>Matrícula:</strong> {formData.license_plate}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="accept_terms"
                checked={formData.accept_terms}
                onCheckedChange={(checked) =>
                  updateField("accept_terms", checked === true)
                }
              />
              <label
                htmlFor="accept_terms"
                className="cursor-pointer text-sm text-zinc-600"
              >
                Acepto los términos y condiciones del evento*
              </label>
            </div>
            {getFieldError("accept_terms") && (
              <p className="text-xs text-red-500">
                {getFieldError("accept_terms")}
              </p>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        <div className="mt-6 flex justify-between">
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
            >
              {isPending ? "Enviando..." : "Confirmar Inscripción"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

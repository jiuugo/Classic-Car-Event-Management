import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export type ConfirmationEmailData = {
  to: string
  subject: string
  html: string
  idempotencyKey: string
}

export async function sendEmail(data: ConfirmationEmailData): Promise<{
  success: boolean
  error?: string
}> {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) {
    console.error("[email] Missing RESEND_FROM_EMAIL environment variable")
    return { success: false, error: "Email sender not configured" }
  }

  const { data: result, error } = await resend.emails.send(
    {
      from,
      to: [data.to],
      subject: data.subject,
      html: data.html,
    },
    { idempotencyKey: data.idempotencyKey }
  )

  if (error) {
    console.error("[email] Resend error:", error.message)
    return { success: false, error: error.message }
  }

  console.log("[email] Sent:", result?.id)
  return { success: true }
}

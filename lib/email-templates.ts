export type EmailVehicle = {
  brand: string
  model: string
  license_plate: string
  entry_number: number | null
}

export type ConfirmationTemplateData = {
  participantName: string
  email: string
  nationalId: string
  qrImageUrl: string
  vehicles: EmailVehicle[]
  totalPaid: string
  registrationId: string
}

export function generateConfirmationEmailHtml(
  data: ConfirmationTemplateData
): string {

  const vehiclesHtml = data.vehicles
    .map(
      (v) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">
        ${v.brand} ${v.model}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">
        ${v.license_plate}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;text-align:center;">
        ${v.entry_number ?? "—"}
      </td>
    </tr>
  `
    )
    .join("")

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inscripción Confirmada</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:32px 24px;text-align:center;">
              <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
                II Concentración de coches clásicos
              </h1>
              <p style="margin:0;font-size:16px;color:#c4b5fd;font-style:italic;">
                Villa de la Robla
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
                Hola <strong>${escapeHtml(data.participantName)}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
                ¡Tu inscripción ha sido confirmada! Gracias por formar parte de esta edición. A continuación encontrarás los detalles de tu inscripción y tu código QR para el día del evento.
              </p>

              <!-- QR Code -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:24px;background:#f9fafb;border-radius:8px;">
                    <img src="${escapeHtml(data.qrImageUrl)}" alt="Código QR" width="200" height="200" style="display:block;border-radius:8px;border:1px solid #e5e7eb;" />
                    <p style="margin:12px 0 0;font-size:12px;color:#6b7280;">
                      Presenta este código QR en la entrada del evento
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Participant Details -->
              <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.05em;">
                Datos del participante
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;width:120px;">Nombre</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml(data.participantName)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Email</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">${escapeHtml(data.email)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">DNI/NIE</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">${escapeHtml(data.nationalId)}</td>
                </tr>
              </table>

              <!-- Vehicles -->
              <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.05em;">
                Vehículos inscritos
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;border-collapse:collapse;">
                <thead>
                  <tr style="background:#f3f4f6;">
                    <th align="left" style="padding:10px 12px;font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e5e7eb;">Vehículo</th>
                    <th align="left" style="padding:10px 12px;font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e5e7eb;">Matrícula</th>
                    <th align="center" style="padding:10px 12px;font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e5e7eb;">Dorsal</th>
                  </tr>
                </thead>
                <tbody>
                  ${vehiclesHtml}
                </tbody>
              </table>

              <!-- Payment -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:16px;background:#1a1a2e;border-radius:8px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#c4b5fd;text-transform:uppercase;letter-spacing:0.05em;">Total pagado</p>
                    <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">${data.totalPaid} €</p>
                  </td>
                </tr>
              </table>

              <!-- Event Info -->
              <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.05em;">
                Información del evento
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;width:120px;">Fecha</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">Sábado, 12 de septiembre de 2026</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Lugar</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">Plaza de la Constitución, 24640 La Robla, León</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;vertical-align:top;">Horario</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">
                    09:30 — Recepción y verificaciones<br/>
                    11:00 — Salida de ruta turística<br/>
                    14:30 — Almuerzo de hermandad
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:16px;color:#374151;line-height:1.6;">
                Guarda este email y muestra tu código QR en la entrada. ¡Nos vemos en La Robla!
              </p>
              <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;font-style:italic;">
                Que rule el motor y brille el cromo. 🚗✨
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                II Concentración de coches clásicos Villa de la Robla
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Si tienes alguna duda, contacta con la organización.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

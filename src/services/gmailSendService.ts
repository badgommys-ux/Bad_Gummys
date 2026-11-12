/**
 * Servicio de Envío Real de Correos mediante la API oficial de Gmail (Workspace)
 * Permite enviar ofertas, cupones, novedades y confirmaciones de pedidos directamente
 * a los correos reales de los clientes de BadGommys.
 */

export interface GmailSendPayload {
  to: string;
  recipientName?: string;
  subject: string;
  headline: string;
  preheader?: string;
  bodyText: string;
  campaignType: 'oferta' | 'anuncio' | 'pedido' | 'novedad';
  couponCode?: string;
  couponDiscount?: number | string;
  couponValidity?: string;
  ctaText?: string;
  ctaUrl?: string;
  orderDetails?: {
    orderId?: string;
    total?: number;
    itemsCount?: number;
    trackingCode?: string;
  };
}

export interface GmailSendResult {
  success: boolean;
  to: string;
  messageId?: string;
  error?: string;
}

/**
 * Encode string to Base64URL (RFC 4648 safe for Gmail raw parameter)
 */
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * UTF-8 Subject encoder for RFC 2822
 */
function encodeRfc2047Subject(subject: string): string {
  // If ASCII only, return as is; otherwise encode in UTF-8 base64
  const isAscii = /^[\x00-\x7F]*$/.test(subject);
  if (isAscii) return subject;
  const utf8Bytes = new TextEncoder().encode(subject);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

/**
 * Genera la plantilla HTML responsive y atractiva para el correo con la identidad de BadGommys
 */
export function buildBadGommysEmailHtml(payload: GmailSendPayload): string {
  const currentYear = new Date().getFullYear();
  const ctaButtonText = payload.ctaText || 'Ir a la Tienda BadGommys';
  const ctaButtonUrl = payload.ctaUrl || 'https://badgommys.com';
  
  // Format body paragraphs
  const paragraphs = payload.bodyText
    .split('\n')
    .filter(p => p.trim().length > 0)
    .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.6; font-size: 15px; color: #374151;">${p}</p>`)
    .join('');

  // Coupon badge markup if available
  let couponSection = '';
  if (payload.campaignType === 'oferta' && payload.couponCode) {
    couponSection = `
      <div style="background: linear-gradient(135deg, #FFF1F2 0%, #FDF2F8 100%); border: 2px dashed #F43F5E; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="display: inline-block; background-color: #FFE4E6; color: #E11D48; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Cupón Exclusivo</span>
        <h3 style="margin: 4px 0 12px 0; color: #881337; font-size: 24px; font-weight: 900;">${payload.couponDiscount ? `${payload.couponDiscount}% DE DESCUENTO` : 'DESCUENTO ESPECIAL'}</h3>
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #4B5563;">Aplica este código al momento de realizar tu compra en nuestra tienda en línea:</p>
        <div style="display: inline-block; background-color: #0F172A; color: #38BDF8; font-family: monospace; font-size: 22px; font-weight: 800; padding: 10px 24px; border-radius: 10px; letter-spacing: 0.15em; border: 1px solid #334155;">
          ${payload.couponCode}
        </div>
        ${payload.couponValidity ? `<p style="margin: 12px 0 0 0; font-size: 12px; color: #64748B;">⏳ ${payload.couponValidity}</p>` : ''}
      </div>
    `;
  }

  // Order status section if applicable
  let orderSection = '';
  if (payload.orderDetails && payload.orderDetails.orderId) {
    orderSection = `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748B; padding: 4px 0;">Número de Pedido:</td>
            <td style="text-align: right; font-weight: 700; color: #0F172A;">${payload.orderDetails.orderId}</td>
          </tr>
          ${payload.orderDetails.trackingCode ? `
          <tr>
            <td style="color: #64748B; padding: 4px 0;">Código de Rastreo:</td>
            <td style="text-align: right; font-weight: 700; color: #4F46E5;">${payload.orderDetails.trackingCode}</td>
          </tr>` : ''}
          ${payload.orderDetails.total ? `
          <tr>
            <td style="color: #64748B; padding: 4px 0;">Total de la Orden:</td>
            <td style="text-align: right; font-weight: 700; color: #059669;">$${payload.orderDetails.total} MXN</td>
          </tr>` : ''}
        </table>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px 12px;">
    
    <!-- Preheader preview text (hidden visually) -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
      ${payload.preheader || payload.headline || 'Novedades exclusivas de BadGommys'}
    </div>

    <!-- Main Container Card -->
    <div style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);">
      
      <!-- Header Gradient & Brand -->
      <div style="background: linear-gradient(135deg, #1E1B4B 0%, #4C1D95 50%, #831843 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #EC4899;">
        <h1 style="margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF;">
          🍬 Bad<span style="color: #F43F5E;">Gommys</span>
        </h1>
        <p style="margin: 6px 0 0 0; color: #FBCFE8; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
          Confitería Artesanal & Gomitas Enchiladas CDMX
        </p>
      </div>

      <!-- Content Area -->
      <div style="padding: 32px 28px;">
        ${payload.recipientName ? `
          <p style="margin: 0 0 14px 0; font-size: 15px; color: #6B7280;">
            ¡Hola, <strong style="color: #111827;">${payload.recipientName}</strong>! 👋
          </p>
        ` : ''}

        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #111827; line-height: 1.3;">
          ${payload.headline}
        </h2>

        ${paragraphs}

        ${couponSection}

        ${orderSection}

        <!-- Call to action button -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${ctaButtonUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4); letter-spacing: 0.02em;">
            ${ctaButtonText} &rarr;
          </a>
        </div>

        <p style="margin: 24px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center;">
          ¿Tienes preguntas o deseas un pedido personalizado? Escríbenos a 
          <a href="mailto:badgommys@gmail.com" style="color: #E11D48; text-decoration: none; font-weight: 600;">badgommys@gmail.com</a>
        </p>
      </div>

      <!-- Footer Info -->
      <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px; text-align: center; font-size: 12px; color: #64748B; line-height: 1.5;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">
          BadGommys México • Taller Artesanal
        </p>
        <p style="margin: 0 0 8px 0;">
          Naranjos, Amatlan, Veracruz • Tel: +52 768 104-6796
        </p>
        <p style="margin: 0; color: #94A3B8; font-size: 11px;">
          Recibes este correo porque eres cliente registrado o te suscribiste a nuestro boletín de noticias en badgommys.com.<br>
          © ${currentYear} BadGommys. Todos los derechos reservados.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Envía un correo real utilizando la API oficial de Gmail
 */
export async function sendEmailViaGmail(
  accessToken: string,
  payload: GmailSendPayload
): Promise<GmailSendResult> {
  const fromHeader = `BadGommys <badgommys@gmail.com>`;
  const toHeader = payload.recipientName 
    ? `${payload.recipientName} <${payload.to}>`
    : payload.to;
  const encodedSubject = encodeRfc2047Subject(payload.subject);
  const htmlBody = buildBadGommysEmailHtml(payload);

  // Construct MIME RFC 2822 message explicitly setting badgommys@gmail.com as From, Reply-To and Sender
  const mimeLines = [
    `From: ${fromHeader}`,
    `Reply-To: BadGommys <badgommys@gmail.com>`,
    `Sender: badgommys@gmail.com`,
    `Return-Path: <badgommys@gmail.com>`,
    `To: ${toHeader}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    `X-Mailer: BadGommys Official Mailer v2`,
    ``,
    htmlBody,
  ];

  const rawMessage = mimeLines.join('\r\n');
  const base64UrlMessage = base64UrlEncode(rawMessage);

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: base64UrlMessage,
      }),
    });

    if (!res.ok) {
      let errDetails = '';
      try {
        const errorJson = await res.json();
        errDetails = errorJson.error?.message || JSON.stringify(errorJson);
      } catch {
        errDetails = `HTTP ${res.status}: ${res.statusText}`;
      }
      return {
        success: false,
        to: payload.to,
        error: errDetails,
      };
    }

    const data = await res.json();
    return {
      success: true,
      to: payload.to,
      messageId: data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      to: payload.to,
      error: err.message || 'Error de conexión con la API de Gmail',
    };
  }
}

/**
 * Envío de campaña por lotes con notificación de progreso
 */
export async function sendCampaignBatchViaGmail(
  accessToken: string,
  recipients: Array<{ email: string; name?: string }>,
  campaignData: Omit<GmailSendPayload, 'to' | 'recipientName'>,
  onProgress?: (progress: { current: number; total: number; email: string; success: boolean }) => void
): Promise<{
  totalSent: number;
  totalFailed: number;
  results: GmailSendResult[];
}> {
  const results: GmailSendResult[] = [];
  let totalSent = 0;
  let totalFailed = 0;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const payload: GmailSendPayload = {
      ...campaignData,
      to: recipient.email,
      recipientName: recipient.name,
    };

    const result = await sendEmailViaGmail(accessToken, payload);
    results.push(result);

    if (result.success) {
      totalSent++;
    } else {
      totalFailed++;
    }

    onProgress?.({
      current: i + 1,
      total: recipients.length,
      email: recipient.email,
      success: result.success,
    });

    // Slight delay between sends to respect rate limits
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  }

  return { totalSent, totalFailed, results };
}

import { ContactMessage } from '../types';

/**
 * Motor de Respuestas Inteligentes del Chatbot GommyBot / Copilot
 * Genera respuestas personalizadas, empáticas y contextuales según el tema de la consulta.
 */
export function generateSmartBotReply(message: ContactMessage): string {
  const text = `${message.subject || ''} ${message.message || ''}`.toLowerCase();
  const firstName = message.name ? message.name.trim().split(' ')[0] : 'amigo/a';

  // 1. Preguntas sobre envíos, tiempos de entrega y cobertura
  if (
    text.includes('envio') || 
    text.includes('envío') || 
    text.includes('cuanto tarda') || 
    text.includes('cuánto tarda') || 
    text.includes('reparto') || 
    text.includes('entrega') || 
    text.includes('domicilio') ||
    text.includes('paqueteria') ||
    text.includes('guia') ||
    text.includes('guía')
  ) {
    return `¡Hola ${firstName}! 🍬 Gracias por contactar al taller de BadGommys.

Te confirmamos que contamos con servicio de Envíos Express en motocicleta en la Ciudad de México y área metropolitana. 
• Tiempos de entrega habituales: de 24 a 48 horas hábiles tras elaborar artesanalmente tu pedido.
• Rastreo en tiempo real: Si ya realizaste tu orden, puedes monitorear el avance y código de guía directamente en la pestaña "Mis Pedidos" de tu perfil.

Cualquier especificación especial para el repartidor (tocar timbre, dejar en recepción), estamos a tus órdenes. 🚚✨`;
  }

  // 2. Preguntas sobre picante, chiles, chamoy y nivel de fuego
  if (
    text.includes('picante') || 
    text.includes('picosa') || 
    text.includes('fuego') || 
    text.includes('chile') || 
    text.includes('chamoy') || 
    text.includes('salsa') || 
    text.includes('tajin') ||
    text.includes('tajín') ||
    text.includes('habanero') ||
    text.includes('tamarindo')
  ) {
    return `¡Hola ${firstName}! 🔥 ¡Nos alegra mucho que preguntes por nuestra sazón casera!

En BadGommys preparamos nuestra propia salsa de chamoy artesanal con pulpa de ciruela ácida, flor de jamaica natural y tamarindo dulce, combinada con mezclas de chiles secos (Tajín, piquín y toque de chiltepín).
• Si buscas picor ligero y frutal: te sugerimos los "Aros de Durazno Enchilados".
• Si buscas el auténtico fuego mexicano: las "Gomitas Fuego Chamoy" y el "Mango Enchilado Extremo" son las favoritas de nuestros clientes. 🌶️🤤

¡Te aseguramos que están fresquecitas y adictivas!`;
  }

  // 3. Mayoreo, eventos, fiestas, bodas y cotizaciones
  if (
    text.includes('mayoreo') || 
    text.includes('evento') || 
    text.includes('fiesta') || 
    text.includes('boda') || 
    text.includes('cumpleaños') || 
    text.includes('cotiza') || 
    text.includes('descuento') ||
    text.includes('paquete') ||
    text.includes('cajas') ||
    text.includes('volumen')
  ) {
    return `¡Hola ${firstName}! 🎉 ¡Qué excelente idea incluir a BadGommys en tu evento o negocio!

Ofrecemos precios preferenciales de mayoreo y personalización de bolsas a partir de 25 piezas:
• Paquetes para mesas de dulces y eventos sociales en CDMX.
• Precios escalonados para distribuidores y tienditas.
• Envío seguro garantizado con empaque sellado herméticamente.

Uno de nuestros asesores comerciales se pondrá en contacto contigo a tu teléfono o correo registrado para enviarte el catálogo mayorista con precios especiales. 📦✨`;
  }

  // 4. Métodos de pago, transferencias, OXXO y facturación fiscal
  if (
    text.includes('pago') || 
    text.includes('oxxo') || 
    text.includes('transferencia') || 
    text.includes('spei') || 
    text.includes('tarjeta') || 
    text.includes('factura') || 
    text.includes('cfdi') ||
    text.includes('recibo') ||
    text.includes('fiscal')
  ) {
    return `¡Hola ${firstName}! 💳 Te brindamos la información sobre nuestros métodos de pago:

• Métodos aceptados en línea: Tarjeta de crédito/débito (Visa, Mastercard, AMEX), Transferencia SPEI inmediata y Pago en efectivo en tiendas OXXO con referencia de 14 dígitos.
• Facturación CFDI: Si requieres factura fiscal, con gusto te la emitimos. Solo indícanos tus datos fiscales (RFC, Razón Social, Régimen y Uso de CFDI) y te la haremos llegar en menos de 24 horas hábiles a tu correo. 🧾✅`;
  }

  // 5. Ubicación, tienda física o retiro en punto
  if (
    text.includes('ubicacion') || 
    text.includes('ubicación') || 
    text.includes('donde estan') || 
    text.includes('dónde están') || 
    text.includes('tienda') || 
    text.includes('taller') || 
    text.includes('recoger') || 
    text.includes('roma') || 
    text.includes('condesa')
  ) {
    return `¡Hola ${firstName}! 📍 Nuestro taller central y punto de entrega oficial se encuentra en la zona de Roma Norte / Cuauhtémoc en la Ciudad de México.

Puedes elegir la opción de "Entrega Express a Domicilio" en el carrito o bien solicitar "Retiro en Taller Oficial" para pasar por tu pedido recién escarchado sin costo de envío. ¡Estaremos encantados de recibirte! 🏠🍬`;
  }

  // 6. Respuesta por defecto cordial y orientada a servicio
  return `¡Hola ${firstName}! 🍬 Muchas gracias por escribirnos al canal de atención de BadGommys.

Hemos recibido tu consulta detalladamente: "${message.message.slice(0, 100)}${message.message.length > 100 ? '...' : ''}". Nuestro equipo de maestros dulceros y soporte al cliente atiende cada mensaje con la máxima dedicación. 

Si necesitas asistencia inmediata sobre un pedido en curso, también puedes escribirnos directamente a nuestro WhatsApp oficial o consultar el estatus en tu perfil de cliente. ¡Que disfrutes un día increíble y lleno de sabor! 🔥🍬`;
}

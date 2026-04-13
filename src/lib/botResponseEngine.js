/**
 * Bot Response Engine
 * Sistema avanzado de respuestas para múltiples intenciones
 */

import { parseIntent, extractParams, INTENTS } from './intentParser';

// Base de conocimiento del bot
const KNOWLEDGE_BASE = {
  // Información sobre películas
  movies: {
    common_questions: {
      'sinopsis': 'Para ver la sinopsis, escribe el nombre de la película',
      'género': 'Todas nuestras películas están categorizadas por género',
      'duración': 'Las películas tienen duraciones de 90 a 180 minutos',
      'edad': 'Verificamos la clasificación por edad de cada película'
    }
  },

  // Precios
  pricing: {
    general: 15000,
    preferential: 22000,
    student: 12000,
    senior: 12000,
    child: 10000,
    currency: 'COP'
  },

  // Promociones
  promotions: [
    {
      name: 'SENA 20%',
      description: 'Descuento 20% para aprendices y estudiantes SENA',
      requirement: 'Carnet de aprendiz vigente'
    },
    {
      name: '2x1 Miércoles',
      description: 'Compra una entrada, llevas dos',
      time: 'Miércoles 6 PM - 9 PM'
    },
    {
      name: 'Combo Familia 15%',
      description: '15% de descuento en combos para 4+ personas',
      min_people: 4
    },
    {
      name: 'Birthday Special',
      description: 'Entrada gratis en tu cumpleaños',
      requirement: 'Documento de identidad con fecha de cumpleaños'
    }
  ],

  // Horarios
  schedule: {
    weekday: '12:00 PM - 12:00 AM',
    weekend: '10:00 AM - 1:00 AM',
    days: {
      'lunes': '12:00 PM - 12:00 AM',
      'martes': '12:00 PM - 12:00 AM',
      'miércoles': '12:00 PM - 12:00 AM',
      'miercoles': '12:00 PM - 12:00 AM',
      'jueves': '12:00 PM - 12:00 AM',
      'viernes': '12:00 PM - 1:00 AM',
      'sábado': '10:00 AM - 1:00 AM',
      'sabado': '10:00 AM - 1:00 AM',
      'domingo': '10:00 AM - 12:00 AM'
    }
  },

  // Ubicación
  location: {
    name: 'CinemaHub - Centro Comercial Viva',
    address: 'Carrera 65 #20-50, Barranquilla',
    city: 'Barranquilla',
    country: 'Colombia',
    phone: '+57 5 1234567',
    email: 'info@cinemahub.co',
    whatsapp: '+57 3001234567'
  },

  // FAQs
  faq: [
    {
      question: '¿Cómo compro boletas?',
      answer: 'Puedes comprar boletas directamente en el chat, en nuestra web o en la taquilla.'
    },
    {
      question: '¿Puedo cambiar o cancelar mi compra?',
      answer: 'Sí, puedes cancelar hasta 24 horas antes de la película.'
    },
    {
      question: '¿Hay descuentos para estudiantes?',
      answer: 'Sí, aplicamos promociones SENA y descuentos especiales para estudiantes.'
    },
    {
      question: '¿Ofrecen sala VIP?',
      answer: 'Sí, contamos con salas premium con mejor sonido y pantalla.'
    },
    {
      question: '¿Aceptan efectivo?',
      answer: 'Sí, efectivo, tarjeta débito/crédito y transferencias bancarias.'
    }
  ]
};

/**
 * Genera respuesta contextual del bot
 */
export async function generateBotResponse(query, movies = [], context = {}) {
  const { intent, confidence, query: normalized } = parseIntent(query);
  const params = extractParams(query, intent);

  // Si no hay confianza suficiente
  if (confidence < 0.2) {
    return {
      text: '🤔 No entendí bien tu pregunta. Puedo ayudarte con:\n• Cartelera de películas\n• Precios y promociones\n• Ubicación y horarios\n• Compra de boletas\n\n¿En qué puedo ayudarte?',
      intent: INTENTS.AYUDA,
      confidence,
      options: getQuickOptions()
    };
  }

  // Procesar según intención
  switch (intent) {
    case INTENTS.CARTELERA:
      return handleCartelera(movies);

    case INTENTS.BUSCAR_PELICULA:
      return handleBuscarPelicula(query, params, movies);

    case INTENTS.DETALLES_PELICULA:
      return handleDetallesPelicula(params, movies);

    case INTENTS.PRECIOS:
      return handlePrecios();

    case INTENTS.PROMOCIONES:
      return handlePromociones();

    case INTENTS.HORARIOS:
      return handleHorarios();

    case INTENTS.UBICACION:
      return handleUbicacion();

    case INTENTS.CONTACTO:
      return handleContacto();

    case INTENTS.COMPRAR_BOLETA:
      return handleComprarBoleta(params, movies);

    case INTENTS.CONFIRMAR_COMPRA:
      return handleConfirmar(context);

    case INTENTS.CANCELAR_COMPRA:
      return handleCancelar();

    case INTENTS.MIS_BOLETAS:
      return handleMisBoletas(context);

    case INTENTS.AYUDA:
      return handleAyuda();

    case INTENTS.FAQPREGUNTAS:
      return handleFAQ();

    default:
      return handleDesconocido();
  }
}

/**
 * Handlers de intenciones
 */

function handleCartelera(movies) {
  if (!movies || movies.length === 0) {
    return {
      text: '🎬 No hay películas disponibles en este momento. Por favor, intenta más tarde.',
      options: getQuickOptions()
    };
  }

  const movieList = movies
    .slice(0, 10)
    .map((m, i) => `${i + 1}. ${m.titulo} (${m.genero})`)
    .join('\n');

  return {
    text: `🎬 *PELÍCULAS EN CARTELERA* (${movies.length} disponibles)\n\n${movieList}\n\n¿Cuál te gustaría ver?`,
    movies: movies.slice(0, 10),
    options: movies.slice(0, 5).map(m => ({
      label: m.titulo,
      action: 'select_movie',
      value: m.id
    }))
  };
}

function handleBuscarPelicula(query, params, movies) {
  const movieName = params.movieName || params.movieTitle;

  if (!movieName) {
    return {
      text: '¿Cuál película te gustaría buscar? 🍿',
      options: getQuickOptions()
    };
  }

  const found = movies.find(m =>
    m.titulo.toLowerCase().includes(movieName.toLowerCase()) ||
    movieName.toLowerCase().includes(m.titulo.toLowerCase())
  );

  if (found) {
    return {
      text: `✅ *Encontré la película:*\n\n🎬 *${found.titulo}*\nGénero: ${found.genero}\nPrecio: $${found.precio_general || 15000}\n\n¿Te gustaría comprar boletas?`,
      movie: found,
      options: [
        { label: '🎫 Comprar Boletas', action: 'buy', value: found.id },
        { label: 'Ver Más Detalles', action: 'details', value: found.id },
        { label: 'Otra Película', action: 'search_another' }
      ]
    };
  }

  const suggestions = movies
    .filter(m => m.titulo.toLowerCase().includes(movieName.slice(0, 3).toLowerCase()))
    .slice(0, 3);

  if (suggestions.length > 0) {
    const suggestionList = suggestions
      .map(m => `• ${m.titulo}`)
      .join('\n');

    return {
      text: `❌ No encontré "${movieName}"\n\n¿Quisiste decir:\n${suggestionList}?`,
      options: suggestions.map(m => ({
        label: m.titulo,
        action: 'select_movie',
        value: m.id
      }))
    };
  }

  return {
    text: `❌ No encontré "${movieName}" en nuestras películas.\n\nPuedo mostrarte la cartelera completa. ¿Quieres verla?`,
    options: [
      { label: '📋 Ver Cartelera', action: 'show_cartelera' },
      { label: 'Buscar Otra', action: 'search_another' }
    ]
  };
}

function handleDetallesPelicula(params, movies) {
  const movieName = params.movieName || params.movieTitle;

  if (!movieName) {
    return {
      text: '¿Qué película te interesa conocer más? 🎬',
      options: getQuickOptions()
    };
  }

  const movie = movies.find(m =>
    m.titulo.toLowerCase().includes(movieName.toLowerCase())
  );

  if (!movie) {
    return {
      text: `❌ No encontré detalles de "${movieName}". ¿Quieres ver la sinopsis de otra?`,
      options: [
        { label: 'Ver Cartelera', action: 'show_cartelera' }
      ]
    };
  }

  const details = `
*${movie.titulo}*
───────────────
📽️ Género: ${movie.genero}
⏱️ Duración: ${movie.duracion || 'Consulta'}
📊 Clasificación: ${movie.clasificacion || 'General'}
💰 Precio: $${movie.precio_general || 15000}

📝 Sinopsis:
${movie.sinopsis || 'Consulta detalles en nuestras salas'}
  `.trim();

  return {
    text: details,
    movie,
    options: [
      { label: '🎫 Comprar Boletas', action: 'buy', value: movie.id },
      { label: 'Otra Película', action: 'show_cartelera' }
    ]
  };
}

function handlePrecios() {
  const precios = `
*💰 TABLA DE PRECIOS*
───────────────
🎟️ Entrada General: $${KNOWLEDGE_BASE.pricing.general}
🎟️ Entrada Preferencial: $${KNOWLEDGE_BASE.pricing.preferential}
👤 Estudiante/Jubilado: $${KNOWLEDGE_BASE.pricing.student}
🧒 Infantil: $${KNOWLEDGE_BASE.pricing.child}

*Formas de Pago:*
✅ Efectivo
✅ Tarjeta Débito/Crédito
✅ Transferencia Bancaria
✅ Billetera Digital
  `.trim();

  return {
    text: precios,
    options: [
      { label: '🎁 Ver Promociones', action: 'show_promos' },
      { label: 'Comprar Boleta', action: 'show_cartelera' }
    ]
  };
}

function handlePromociones() {
  const promoList = KNOWLEDGE_BASE.promotions
    .map(p => `🎁 *${p.name}*\n   ${p.description}`)
    .join('\n\n');

  const text = `
*🎁 PROMOCIONES ESPECIALES*
───────────────
${promoList}

¿Te interesa alguna promoción?
  `.trim();

  return {
    text,
    promotions: KNOWLEDGE_BASE.promotions,
    options: [
      { label: 'Comprar con Descuento', action: 'show_cartelera' },
      { label: 'Ver Precios', action: 'show_precios' }
    ]
  };
}

function handleHorarios() {
  const text = `
*⏰ HORARIOS DE ATENCIÓN*
───────────────
Lunes - Jueves: ${KNOWLEDGE_BASE.schedule.days.lunes}
Viernes: ${KNOWLEDGE_BASE.schedule.days.viernes}
Sábado: ${KNOWLEDGE_BASE.schedule.days.sabado}
Domingo: ${KNOWLEDGE_BASE.schedule.days.domingo}

*Funciones de películas:*
Sesión Matinal: 12:00 PM - 3:00 PM
Sesión Vespertina: 4:00 PM - 7:00 PM
Sesión Nocturna: 8:00 PM - 12:00 AM
  `.trim();

  return {
    text,
    options: [
      { label: '📍 Ubicación', action: 'show_ubicacion' },
      { label: 'Comprar Boleta', action: 'show_cartelera' }
    ]
  };
}

function handleUbicacion() {
  const loc = KNOWLEDGE_BASE.location;
  const text = `
*📍 ¿DÓNDE ESTAMOS?*
───────────────
${loc.name}
${loc.address}
${loc.city}, ${loc.country}

*Contacto:*
📞 ${loc.phone}
📧 ${loc.email}
💬 WhatsApp: ${loc.whatsapp}

*¿Cómo llegar?*
• En bus: Líneas 1, 5, 8 (Parada Centro Comercial Viva)
• En carro: Parqueadero disponible
• A pie: Centro de Barranquilla
  `.trim();

  return {
    text,
    location: loc,
    options: [
      { label: '📱 Contactar', action: 'show_contacto' },
      { label: 'Ver Horarios', action: 'show_horarios' }
    ]
  };
}

function handleContacto() {
  const loc = KNOWLEDGE_BASE.location;
  return {
    text: `
*📱 CONTACTO*
───────────────
📞 Teléfono: ${loc.phone}
📧 Email: ${loc.email}
💬 WhatsApp: ${loc.whatsapp}

¿Necesitas ayuda con algo específico?
    `.trim(),
    options: [
      { label: 'Llamar', action: 'call', value: loc.phone },
      { label: 'WhatsApp', action: 'whatsapp', value: loc.whatsapp }
    ]
  };
}

function handleComprarBoleta(params, movies) {
  const movieName = params.movieName || params.movieTitle;

  if (!movieName) {
    return {
      text: '¿Qué película deseas comprar? 🎬',
      options: getQuickOptions()
    };
  }

  const movie = movies.find(m =>
    m.titulo.toLowerCase().includes(movieName.toLowerCase())
  );

  if (!movie) {
    return {
      text: `No encontré "${movieName}". ¿Quieres ver la cartelera?`,
      options: [{ label: 'Ver Cartelera', action: 'show_cartelera' }]
    };
  }

  return {
    text: `✅ ¿Confirmas compra de boletas para:\n\n🎬 *${movie.titulo}*\nPrecio: $${movie.precio_general}`,
    movie,
    options: [
      { label: 'Sí, Comprar', action: 'confirm_buy', value: movie.id },
      { label: 'Cancelar', action: 'cancel' }
    ]
  };
}

function handleConfirmar(context) {
  return {
    text: '✅ ¡Excelente! Serás redirigido a completar tu compra.\n\n🎫 Tu boleta digital te llegará por email.',
    options: [
      { label: '📋 Ver Cartelera', action: 'show_cartelera' }
    ]
  };
}

function handleCancelar() {
  return {
    text: '❌ Operación cancelada.\n\n¿En qué más puedo ayudarte?',
    options: getQuickOptions()
  };
}

function handleMisBoletas(context) {
  return {
    text: '📋 Accediendo a tus boletas compradas...\n\nNecesitarás iniciar sesión para ver tus boletas.',
    options: [
      { label: '🔐 Iniciar Sesión', action: 'login' },
      { label: 'Volver', action: 'back' }
    ]
  };
}

function handleAyuda() {
  return {
    text: `
*🆘 CENTRO DE AYUDA*
───────────────
Puedo ayudarte con:
✅ Información de películas
✅ Precios y promociones
✅ Ubicación y horarios
✅ Compra de boletas
✅ Preguntas frecuentes

¿Qué necesitas?
    `.trim(),
    options: getQuickOptions()
  };
}

function handleFAQ() {
  const faqList = KNOWLEDGE_BASE.faq
    .map((f, i) => `${i + 1}. ${f.question}\n   → ${f.answer}`)
    .join('\n\n');

  return {
    text: `
*❓ PREGUNTAS FRECUENTES*
───────────────
${faqList}

¿Tienes otra pregunta?
    `.trim(),
    faq: KNOWLEDGE_BASE.faq,
    options: getQuickOptions()
  };
}

function handleDesconocido() {
  return {
    text: '🤖 No entendí bien. Intenta de otra forma o usa los botones rápidos.',
    options: getQuickOptions()
  };
}

/**
 * Opciones rápidas
 */
export function getQuickOptions() {
  return [
    { label: '🎬 Cartelera', action: 'show_cartelera' },
    { label: '💰 Precios', action: 'show_precios' },
    { label: '🎁 Promos', action: 'show_promos' },
    { label: '📍 Ubicación', action: 'show_ubicacion' }
  ];
}

/**
 * Procesar acciones
 */
export function processAction(action, value, stateHandler) {
  switch (action) {
    case 'show_cartelera':
      return { intent: INTENTS.CARTELERA };
    case 'show_precios':
      return { intent: INTENTS.PRECIOS };
    case 'show_promos':
      return { intent: INTENTS.PROMOCIONES };
    case 'show_ubicacion':
      return { intent: INTENTS.UBICACION };
    case 'show_horarios':
      return { intent: INTENTS.HORARIOS };
    case 'show_contacto':
      return { intent: INTENTS.CONTACTO };
    case 'select_movie':
      return { intent: 'movie_selected', movieId: value };
    case 'buy':
      return { intent: INTENTS.COMPRAR_BOLETA, movieId: value };
    case 'confirm_buy':
      return { intent: 'purchase_confirmed', movieId: value };
    case 'login':
      return { redirect: '/login' };
    default:
      return null;
  }
}

/**
 * Parser de Intenciones Avanzado
 * Reconoce y clasifica la intención del usuario de múltiples maneras
 */

export const INTENTS = {
  // Consultas generales
  CARTELERA: 'cartelera',
  BUSCAR_PELICULA: 'buscar_pelicula',
  DETALLES_PELICULA: 'detalles_pelicula',
  
  // Información comercial
  PRECIOS: 'precios',
  PROMOCIONES: 'promociones',
  HORARIOS: 'horarios',
  UBICACION: 'ubicacion',
  CONTACTO: 'contacto',
  
  // Compra
  COMPRAR_BOLETA: 'comprar_boleta',
  CONFIRMAR_COMPRA: 'confirmar',
  CANCELAR_COMPRA: 'cancelar',
  
  // Usuario
  MIS_BOLETAS: 'mis_boletas',
  HISTORIAL: 'historial',
  PERFIL: 'perfil',
  
  // Ayuda
  AYUDA: 'ayuda',
  FAQPREGUNTAS: 'faq',
  
  // Sin clasificar
  DESCONOCIDO: 'desconocido'
};

const intentPatterns = {
  [INTENTS.CARTELERA]: {
    keywords: ['cartelera', 'películas', 'peliculas', 'que hay', 'estrenos', 'exhibiendo', 'ahora', 'disponible', 'en cartelera'],
    patterns: [/^(?:cuéntame|dime|muéstrame|dame)\s*(la)?\s*cartelera/i, /¿?qué\s+(películas|peliculas)\s+(hay|puedo ver)/i]
  },
  
  [INTENTS.BUSCAR_PELICULA]: {
    keywords: ['buscar', 'encontrar', 'dime', 'cuál', 'cual', 'tenéis', 'tienen', 'tienes'],
    patterns: [/¿?tienes\s+(.+)/i, /¿?tienen\s+la\s+película\s+"?(.+?)"?/i, /buscas?\s+la\s+película\s+(.+)/i]
  },
  
  [INTENTS.DETALLES_PELICULA]: {
    keywords: ['sinopsis', 'resumen', 'trama', 'género', 'genero', 'director', 'actores', 'duración', 'duracion', 'clasificación', 'clasificacion', 'elenco', 'reparto'],
    patterns: [/¿?cuéntame\s+(más|mas)\s+de\s+(.+)/i, /detalles\s+de\s+(.+)/i]
  },
  
  [INTENTS.PRECIOS]: {
    keywords: ['precio', 'precios', 'costo', 'cuánto', 'cuanto', 'tarifa', 'vale', 'cuesta', 'general', 'preferencial', 'premium', 'vip', 'infantil', 'niño'],
    patterns: [/¿?cuánto\s+cuesta/i, /¿?cuál\s+es\s+el\s+precio/i, /precios\s+de\s+entradas/i, /¿?cuánto\s+vale/i]
  },
  
  [INTENTS.PROMOCIONES]: {
    keywords: ['promo', 'promoción', 'promociones', 'descuento', 'oferta', 'sena', 'aprendiz', 'combo', '2x1', 'descuento', 'especial', 'familiar', 'estudiante', 'jubilado'],
    patterns: [/¿?qué\s+promociones?\s+hay/i, /¿?tienes\s+promociones?\s+o\s+ofertas\s+(hoy|disponibles)/i, /promociones?\s+sena/i]
  },
  
  [INTENTS.HORARIOS]: {
    keywords: ['horario', 'horarios', 'función', 'funciones', 'sesión', 'sesiones', 'hora', 'qué hora', 'a qué hora', 'cuándo', 'cuando', 'mañana', 'tarde', 'noche', 'abierto', 'abre', 'cierra'],
    patterns: [/¿?a\s+qué\s+hora\s+(.+)/i, /¿?cuál\s+es\s+el\s+horario/i, /¿?cuándo\s+puedo\s+ir/i, /funciones?\s+de\s+(.+)/i]
  },
  
  [INTENTS.UBICACION]: {
    keywords: ['ubicación', 'ubicacion', 'dirección', 'direccion', 'dónde', 'donde', 'cómo llego', 'como llego', 'localidad', 'barrio', 'sector', 'zona', 'piso', 'edificio', 'local'],
    patterns: [/¿?dónde\s+(está|estás|están)/i, /¿?cuál\s+es\s+(tu\s+)?ubicación/i, /¿?cómo\s+llego/i]
  },
  
  [INTENTS.CONTACTO]: {
    keywords: ['teléfono', 'telefono', 'email', 'correo', 'contacto', 'llamar', 'mensaje', 'whatsapp', 'contactarme', 'escribir', 'llamada'],
    patterns: [/¿?cuál\s+es\s+tu\s+teléfono/i, /¿?cómo\s+te\s+contacto/i, /dame\s+tu\s+(teléfono|email|contacto)/i]
  },
  
  [INTENTS.COMPRAR_BOLETA]: {
    keywords: ['comprar', 'boleta', 'entrada', 'entradas', 'ticket', 'tickets', 'reservar', 'reserva', 'quiero ir', 'necesito', 'dame'],
    patterns: [/quiero\s+comprar\s+(.+)/i, /¿?cómo\s+compro\s+(.+)/i, /me\s+gustaría\s+ir\s+a\s+ver\s+(.+)/i, /reservar?\s+entradas?\s+para\s+(.+)/i]
  },
  
  [INTENTS.CONFIRMAR_COMPRA]: {
    keywords: ['sí', 'si', 'yes', 'claro', 'dale', 'ok', 'okay', 'listo', 'adelante', 'procede', 'confirmo'],
    patterns: [/^(sí|si|yes|claro|dale|ok|listo|adelante)$/i]
  },
  
  [INTENTS.CANCELAR_COMPRA]: {
    keywords: ['no', 'nope', 'nada', 'cancel', 'atrás', 'atras', 'volver', 'otro', 'salir'],
    patterns: [/^(no|nope|otro|atrás|atras)$/i]
  },
  
  [INTENTS.MIS_BOLETAS]: {
    keywords: ['mis', 'mis boletas', 'mis entradas', 'mis tickets', 'compradas', 'mis compras', 'historial', 'boletas compradas'],
    patterns: [/mis\s+(boletas|entradas|tickets|compras)/i, /¿?qué\s+boletas\s+he\s+comprado/i]
  },
  
  [INTENTS.AYUDA]: {
    keywords: ['ayuda', 'ayúdame', 'ayudame', 'necesito', 'no sé', 'no se', 'cómo', 'como', 'dudas', 'problema', 'error'],
    patterns: [/¿?necesito\s+ayuda/i, /¿?puedo\s+hacer/i, /¿?cómo\s+funciona/i]
  },
  
  [INTENTS.FAQPREGUNTAS]: {
    keywords: ['preguntas', 'preguntas frecuentes', 'faq', 'dudas', 'problemas', 'cómo funciona'],
    patterns: [/preguntas?\s+frecuentes/i, /¿?qué\s+preguntas\s+frecuentes/i]
  }
};

/**
 * Parsea la intención del usuario
 * @param {string} query - Texto del usuario
 * @returns {object} { intent, confidence, data }
 */
export function parseIntent(query) {
  if (!query || typeof query !== 'string') {
    return { intent: INTENTS.DESCONOCIDO, confidence: 0, data: {} };
  }

  const normalized = query.toLowerCase().trim();
  let bestMatch = { intent: INTENTS.DESCONOCIDO, confidence: 0, matches: 0 };

  // Análisis de patrones y keywords
  for (const [intent, config] of Object.entries(intentPatterns)) {
    let intentScore = 0;
    let keywordMatches = 0;

    // Búsqueda de keywords
    for (const keyword of config.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        intentScore += 0.3;
        keywordMatches++;
      }
    }

    // Búsqueda de patrones regex
    for (const pattern of config.patterns) {
      if (pattern.test(query)) {
        intentScore += 0.7;
        break;
      }
    }

    // Normalización del score
    const confidence = Math.min(intentScore, 1);

    if (confidence > bestMatch.confidence) {
      bestMatch = { 
        intent, 
        confidence,
        matches: keywordMatches,
        query: normalized
      };
    }
  }

  // Si no hay match claro, pero tiene palabras de película
  if (bestMatch.confidence < 0.3) {
    const movieKeywords = ['ver', 'película', 'pelicula', 'avatar', 'titanic', 'superman'];
    if (movieKeywords.some(kw => normalized.includes(kw))) {
      bestMatch.intent = INTENTS.BUSCAR_PELICULA;
      bestMatch.confidence = 0.5;
    }
  }

  return bestMatch;
}

/**
 * Extrae parámetros de la query
 */
export function extractParams(query, intent) {
  const params = {};

  const match = query.match(/(?:de|la|el|que|se\s+llama|titulada?|más\s+(?:info|detalles).*?(?:de|sobre)\s+)?(.+?)(?:\s+(?:por\s+favor|por\s+fa|plz))?$/i);
  
  if (match && match[1]) {
    params.movieName = match[1].trim();
  }

  // Buscar película específica
  const movieMatch = query.match(/(?:ver|comprar|información|info|sobre|de|la\s+película\s+)["']?([^"'\n]+?)["']?(?:\s|$)/i);
  if (movieMatch) {
    params.movieTitle = movieMatch[1].trim();
  }

  return params;
}

/**
 * Clasifica un query como relevante o no
 */
export function isRelevantQuery(query) {
  const { confidence } = parseIntent(query);
  return confidence > 0.2;
}

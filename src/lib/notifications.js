/**
 * Sistema de Notificaciones Profesional con Sonner
 */

import { toast } from 'sonner';

// Tipos de notificaciones disponibles
export const notificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  LOADING: 'loading'
};

/**
 * Mostrar notificación de éxito
 */
export function notifySuccess(message, description = '') {
  return toast.success(message, {
    description,
    duration: 4000,
    position: 'bottom-right'
  });
}

/**
 * Mostrar notificación de error
 */
export function notifyError(message, description = '') {
  return toast.error(message, {
    description,
    duration: 5000,
    position: 'bottom-right'
  });
}

/**
 * Mostrar notificación informativa
 */
export function notifyInfo(message, description = '') {
  return toast.info(message, {
    description,
    duration: 3000,
    position: 'bottom-right'
  });
}

/**
 * Mostrar notificación de advertencia
 */
export function notifyWarning(message, description = '') {
  return toast.warning(message, {
    description,
    duration: 4000,
    position: 'bottom-right'
  });
}

/**
 * Mostrar notificación de carga
 */
export function notifyLoading(message) {
  return toast.loading(message, {
    position: 'bottom-right'
  });
}

/**
 * Actualizar notificación (para promesas)
 */
export function updateNotification(id, message, type = 'success') {
  toast.success(message, {
    duration: 4000,
    position: 'bottom-right'
  });
}

/**
 * Notificación de promesa
 * Uso: notifyPromise(promise, {loading: '...', success: '...', error: '...'})
 */
export function notifyPromise(promise, messages) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: 4000,
    position: 'bottom-right'
  });
}

/**
 * Notificaciones contextuales del CineBot
 */
export const cineBotNotifications = {
  // Películas
  movieFound: (title) =>
    notifySuccess(`¡Encontré la película!`, `${title} está disponible`),
  
  movieNotFound: (title) =>
    notifyWarning(`No encontré ${title}`, 'Intenta con otro nombre'),
  
  carteleraLoaded: (count) =>
    notifyInfo(`Cartelera cargada`, `${count} películas disponibles`),
  
  // Compra
  purchaseConfirmed: (title) =>
    notifySuccess(`¡Compra confirmada!`, `Boleta para ${title}`),
  
  purchaseFailed: (reason = '') =>
    notifyError(`Error en la compra`, reason || 'Intenta de nuevo'),
  
  // Validación
  invalidInput: () =>
    notifyWarning(`Entrada inválida`, 'Mínimo 2 caracteres'),
  
  rateLimited: () =>
    notifyWarning(`Espera un momento`, 'Máximo 20 mensajes por minuto'),
  
  // Sistema
  errorLoadingMovies: () =>
    notifyError(`Error al cargar`, 'No pudimos cargar las películas'),
  
  botReady: () =>
    notifyInfo(`CineBot listo`, 'Pregúntame lo que necesites'),
  
  botError: () =>
    notifyError(`Algo salió mal`, 'Intenta de nuevo en un momento'),
  
  // Acciones
  clipboardCopied: () =>
    notifySuccess(`Copiado`, 'Se copió al portapapeles'),
  
  phoneCallInitiated: (phone) =>
    notifyInfo(`Llamando...`, phone),
  
  whatsappOpened: () =>
    notifyInfo(`WhatsApp abierto`, 'Envíanos un mensaje'),
  
  chatCleared: () =>
    notifySuccess(`Chat limpiado`, 'Nueva conversación iniciada')
};

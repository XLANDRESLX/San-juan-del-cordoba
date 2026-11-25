// Formularios públicos conectados al Web App existente de Google Apps Script.
(function () {
  'use strict';

  function mostrarMensaje(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.textContent = texto || (tipo === 'success' ? 'Operación completada.' : 'No fue posible completar la operación.');
    elemento.className = 'msg' + (tipo === 'success' ? ' msg--ok' : tipo === 'info' ? ' msg--info' : ' msg--error');
  }

  async function procesarFormulario(form, apiMethod, messageId, fallbackError) {
    const msg = document.getElementById(messageId);
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalText = button ? button.textContent.trim() : '';
    if (button) {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.textContent = 'Enviando…';
    }
    mostrarMensaje(msg, 'Enviando…', 'info');

    try {
      if (!window.sanjuanAPI || typeof window.sanjuanAPI[apiMethod] !== 'function') {
        throw new Error('El servicio de formularios no está disponible.');
      }
      const data = Object.fromEntries(new FormData(form));
      const response = await window.sanjuanAPI[apiMethod](data);
      const success = response && response.status === 'success';
      mostrarMensaje(msg, response && response.message, success ? 'success' : 'error');
      if (success) form.reset();
    } catch (error) {
      mostrarMensaje(msg, fallbackError, 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.textContent = originalText;
      }
    }
  }

  const formContacto = document.getElementById('formContacto');
  if (formContacto) {
    formContacto.addEventListener('submit', (event) => {
      event.preventDefault();
      procesarFormulario(formContacto, 'enviarContacto', 'contactoMsg', 'No fue posible enviar el mensaje. Comprueba tu conexión e inténtalo de nuevo.');
    });
  }

  const formNewsletter = document.getElementById('formNewsletter');
  if (formNewsletter) {
    formNewsletter.addEventListener('submit', (event) => {
      event.preventDefault();
      procesarFormulario(formNewsletter, 'suscribirNewsletter', 'newsletterMsg', 'No fue posible completar la suscripción. Inténtalo nuevamente.');
    });
  }
})();

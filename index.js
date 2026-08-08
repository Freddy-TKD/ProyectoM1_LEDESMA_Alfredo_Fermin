// Este archivo tiene un flujo simple para crear una paleta de colores.
// Cada parte del código hace una tarea clara: generar, mostrar, bloquear y copiar.

// ¿Qué hace esta parte? Busca los elementos del HTML para poder trabajar con ellos.
const btnGenerar = document.getElementById('generarPaletas');
const inputCantidad = document.getElementById('cantidadColores');
const switchTipo = document.getElementById('tipoColorSwitch');
const zona = document.getElementById('paletas');
const cartel = document.getElementById('toast');
const btnIngresar = document.getElementById('btnIngresar');

// ¿Por qué se usa esta variable? Guarda el formato actual de los colores: HEX o HSL.
let formato = 'hex';

// ¿Por qué se usa esta variable? Guarda la lista de colores que se muestran en pantalla.
let colores = [];

// ¿Por qué se usa esta variable? Controla el mensaje pequeño que aparece al copiar o cambiar algo.
let tiempoToast = null;

// ¿Qué hace esta función? Genera un color aleatorio en formato HEX.
function generarColorHEX() {
  const numero = Math.floor(Math.random() * 16777215);
  let hex = numero.toString(16);

  while (hex.length < 6) {
    hex = '0' + hex;
  }

  return '#' + hex.toUpperCase();
}

// ¿Qué hace esta función? Convierte un color HEX a HSL para mostrarlo de otra forma.
function convertirHEXaHSL(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }

    h = Math.round(h * 60);
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  }

  s = Math.round(s * 100);
  const luminosidad = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${luminosidad}%)`;
}

// ¿Qué hace esta función? Devuelve el texto del color según el formato elegido.
function obtenerTextoColor(hex) {
  return formato === 'hex' ? hex : convertirHEXaHSL(hex);
}

// ¿Qué hace esta función? Crea una nueva paleta de colores y la muestra en pantalla.
function generarPaleta(mostrarMensaje = false) {
  const cantidad = Number(inputCantidad?.value) || 6;
  const coloresViejos = colores;
  colores = [];

  for (let i = 0; i < cantidad; i++) {
    const viejo = coloresViejos[i];

    if (viejo && viejo.bloqueado) {
      colores.push(viejo);
    } else {
      colores.push({ hex: generarColorHEX(), bloqueado: false });
    }
  }

  mostrarPaleta();

  if (mostrarMensaje) {
    mostrarToast('Nueva paleta generada');
  }
}

// ¿Qué hace esta función? Dibuja las tarjetas de colores en la página.
function mostrarPaleta() {
  zona.innerHTML = '';

  colores.forEach((color, index) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = color.bloqueado ? 'color-card color-card-bloqueada' : 'color-card';

    const display = document.createElement('div');
    display.className = 'color-display';
    display.style.backgroundColor = color.hex;

    const boton = document.createElement('button');
    boton.className = 'color-lock-button';
    boton.type = 'button';
    boton.textContent = color.bloqueado ? '🔒' : '🔓';

    const copia = document.createElement('span');
    copia.className = 'color-copy-message';
    copia.textContent = 'Click para COPIAR';

    const valor = document.createElement('div');
    valor.className = 'color-value';
    valor.textContent = obtenerTextoColor(color.hex);

    // ¿Qué pasa cuando el usuario hace clic? Se copia el color al portapapeles.
    tarjeta.addEventListener('click', () => {
      copiarAlPortapapeles(valor.textContent);
    });

    // ¿Qué pasa cuando el usuario hace clic? Se cambia el estado de bloqueo del color.
    boton.addEventListener('click', (event) => {
      event.stopPropagation();
      cambiarBloqueo(index);
    });

    display.appendChild(boton);
    display.appendChild(copia);
    tarjeta.appendChild(display);
    tarjeta.appendChild(valor);
    zona.appendChild(tarjeta);
  });
}

// ¿Qué hace esta función? Cambia si un color queda bloqueado o no.
function cambiarBloqueo(index) {
  if (!colores[index]) return;

  colores[index].bloqueado = !colores[index].bloqueado;
  mostrarPaleta();

  const texto = obtenerTextoColor(colores[index].hex);
  const estado = colores[index].bloqueado ? 'bloqueado' : 'desbloqueado';
  mostrarToast(`Color ${texto} ${estado}`);
}

// ¿Qué hace esta función? Copia el texto del color al portapapeles del usuario.
function copiarAlPortapapeles(texto) {
  if (!navigator.clipboard) {
    mostrarToast('Copiar no está soportado');
    return;
  }

  navigator.clipboard.writeText(texto)
    .then(() => mostrarToast(`Color ${texto} copiado`))
    .catch(() => mostrarToast('No se pudo copiar'));
}

// ¿Qué hace esta función? Muestra un mensaje pequeño en pantalla para confirmar una acción.
function mostrarToast(mensaje) {
  cartel.textContent = mensaje;
  clearTimeout(tiempoToast);
  cartel.classList.add('mostrar');
  tiempoToast = setTimeout(() => cartel.classList.remove('mostrar'), 2000);
}

// ¿Qué pasa cuando el usuario hace clic? Se genera una nueva paleta.
btnGenerar?.addEventListener('click', () => generarPaleta(true));

// ¿Qué pasa cuando el usuario hace clic? Se muestra la aplicación principal.
btnIngresar?.addEventListener('click', () => {
  document.body.classList.add('mostrar-app');
  generarPaleta(true);
});

// ¿Qué pasa cuando el usuario cambia el selector? Se muestran más o menos colores.
inputCantidad?.addEventListener('change', () => {
  generarPaleta(false);
  mostrarToast(`Ahora se muestran ${inputCantidad.value} colores`);
});

// ¿Qué pasa cuando el usuario cambia el interruptor? Se cambia el formato de visualización.
switchTipo?.addEventListener('change', () => {
  formato = switchTipo.checked ? 'hex' : 'hsl';
  mostrarPaleta();
  mostrarToast(`Formato cambiado a ${formato.toUpperCase()}`);
});

// ¿Qué hace esta parte? Cuando carga la página, muestra la paleta inicial.
window.addEventListener('load', () => {
  generarPaleta();
});


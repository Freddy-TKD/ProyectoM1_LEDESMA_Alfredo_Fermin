// Busca en el HTML el boton que dice "Generar Paleta" y lo guarda en una constante.
const generarBtn = document.getElementById('generarPaletas');

// Busca en el HTML la lista desplegable donde se elige 6, 8 o 9 colores.
const cantidadSelect = document.getElementById('cantidadColores');

// Busca el switch que permite elegir entre HSL y HEX.
const tipoColorSwitch = document.getElementById('tipoColorSwitch');

// Busca la seccion vacia donde despues se van a dibujar las tarjetas de colores.
const paletasSection = document.getElementById('paletas');

// Busca el cartelito que avisa "Color copiado!".
const toast = document.getElementById('toast');

// Guarda que formato de color se esta usando ahora; arranca en hexadecimal.
let tipoColorActual = 'hex';

// Guarda los colores actuales de la pantalla y si cada uno esta bloqueado o no.
let coloresActuales = [];

// Guarda el temporizador del toast para poder reiniciarlo si aparece otro mensaje rapido.
let temporizadorToast;

// Cuando el usuario hace click en el boton, se ejecuta la funcion generarPaleta.
generarBtn.addEventListener('click', () => generarPaleta(true));

// Cuando el usuario cambia la cantidad de colores, ahi si se vuelve a generar la paleta.
cantidadSelect.addEventListener('change', () => {
  // Genera una nueva paleta con la cantidad elegida.
  generarPaleta(false);

  // Muestra un aviso con la nueva cantidad de colores.
  mostrarToast(`Ahora se muestran ${cantidadSelect.value} colores`);
});

// Cuando el usuario mueve el switch, cambia el formato mostrado.
tipoColorSwitch.addEventListener('change', () => {
  // Si el switch esta encendido, usa HEX; si esta apagado, usa HSL.
  tipoColorActual = tipoColorSwitch.checked ? 'hex' : 'hsl';

  // Muestra de nuevo las mismas tarjetas, pero cambiando el texto del formato.
  mostrarPaleta();

  // Muestra un aviso indicando el formato elegido.
  mostrarToast(`Formato cambiado a ${tipoColorActual.toUpperCase()}`);
});

// Funcion que arma un color hexadecimal al azar, por ejemplo #3FA9F5.
function generarColorHEX() {
  // Math.random da un numero al azar entre 0 y 1; multiplicado por 16777215 cubre colores RGB.
  // Math.floor le saca los decimales para quedarse con un numero entero.
  // toString(16) convierte ese numero a hexadecimal.
  // padStart completa con ceros si el codigo queda corto.
  // toUpperCase pone las letras en mayuscula.
  return '#' + Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase();
}

// Funcion que convierte un color HEX a HSL sin cambiar el color visual.
function convertirHEXaHSL(hex) {
  // Saca el # del principio para poder trabajar solo con los numeros y letras del color.
  const codigo = hex.replace('#', '');

  // Toma los dos primeros caracteres del HEX y los convierte en rojo de 0 a 255.
  let r = parseInt(codigo.substring(0, 2), 16);

  // Toma los dos caracteres del medio del HEX y los convierte en verde de 0 a 255.
  let g = parseInt(codigo.substring(2, 4), 16);

  // Toma los dos ultimos caracteres del HEX y los convierte en azul de 0 a 255.
  let b = parseInt(codigo.substring(4, 6), 16);

  // Convierte rojo, verde y azul a valores entre 0 y 1 porque asi se calcula HSL.
  r /= 255;

  // Convierte el verde a valor entre 0 y 1.
  g /= 255;

  // Convierte el azul a valor entre 0 y 1.
  b /= 255;

  // Busca el valor mas alto entre rojo, verde y azul.
  const max = Math.max(r, g, b);

  // Busca el valor mas bajo entre rojo, verde y azul.
  const min = Math.min(r, g, b);

  // Prepara hue/tono y saturacion en cero para calcularlos despues.
  let h = 0;

  // Prepara la saturacion en cero para calcularla despues.
  let s = 0;

  // La luminosidad sale del promedio entre el valor mas claro y el mas oscuro.
  const l = (max + min) / 2;

  // Calcula la diferencia entre el valor mas alto y el mas bajo.
  const diferencia = max - min;

  // Si no hay diferencia, el color es gris, blanco o negro y no tiene tono fuerte.
  if (diferencia !== 0) {
    // Calcula la saturacion segun si el color es mas claro u oscuro.
    s = l > 0.5 ? diferencia / (2 - max - min) : diferencia / (max + min);

    // Si el rojo es el valor mas alto, calcula el tono partiendo desde rojo.
    if (max === r) {
      // Formula para sacar el tono cuando domina el rojo.
      h = (g - b) / diferencia + (g < b ? 6 : 0);

    // Si el verde es el valor mas alto, calcula el tono partiendo desde verde.
    } else if (max === g) {
      // Formula para sacar el tono cuando domina el verde.
      h = (b - r) / diferencia + 2;

    // Si no domino rojo ni verde, domina azul.
    } else {
      // Formula para sacar el tono cuando domina el azul.
      h = (r - g) / diferencia + 4;
    }

    // Convierte el tono a grados de 0 a 360.
    h *= 60;
  }

  // Redondea el tono para que no tenga decimales raros.
  h = Math.round(h);

  // Convierte saturacion a porcentaje y la redondea.
  s = Math.round(s * 100);

  // Convierte luminosidad a porcentaje y la redondea.
  const luminosidad = Math.round(l * 100);

  // Devuelve el texto con formato HSL para mostrarlo o copiarlo.
  return `hsl(${h}, ${s}%, ${luminosidad}%)`;
}

// Funcion que decide que texto mostrar segun el formato elegido.
function obtenerTextoDelColor(colorHEX) {
  // Si el formato actual es hex, devuelve el color como esta.
  if (tipoColorActual === 'hex') {
    // Devuelve algo como #A1B2C3.
    return colorHEX;
  }

  // Si el formato actual no es hex, lo convierte a HSL.
  return convertirHEXaHSL(colorHEX);
}

// Funcion principal: genera colores nuevos y despues los muestra.
function generarPaleta(mostrarFeedback = false) {
  // Lee la cantidad elegida en el select y la convierte de texto a numero.
  const cantidad = parseInt(cantidadSelect.value);

  // Le avisa al CSS cuantos colores hay para acomodar mejor la grilla.
  paletasSection.dataset.cantidad = cantidad;

  // Guarda una copia de la paleta actual antes de generar la nueva.
  const coloresAnteriores = coloresActuales;

  // Vacia la lista de colores actuales para cargar una paleta nueva.
  coloresActuales = [];

  // Repite el bloque de adentro tantas veces como colores se pidieron.
  for (let i = 0; i < cantidad; i++) {
    // Busca si en esta posicion ya habia un color antes.
    const colorAnterior = coloresAnteriores[i];

    // Si el color anterior estaba bloqueado, lo conserva sin cambiarlo.
    if (colorAnterior && colorAnterior.bloqueado) {
      // Mantiene el mismo color y su estado bloqueado.
      coloresActuales.push(colorAnterior);

    // Si no estaba bloqueado, genera un color nuevo.
    } else {
      // Guarda el color nuevo junto con su estado desbloqueado.
      coloresActuales.push({
        hex: generarColorHEX(),
        bloqueado: false
      });
    }
  }

  // Dibuja en pantalla la paleta nueva.
  mostrarPaleta();

  // Si corresponde, muestra un aviso de que se genero una nueva paleta.
  if (mostrarFeedback) {
    // Avisa al usuario que la accion del boton funciono.
    mostrarToast('Nueva paleta generada');
  }
}

// Funcion que dibuja las tarjetas usando los colores guardados.
function mostrarPaleta() {
  // Limpia las tarjetas anteriores para dibujarlas de nuevo.
  paletasSection.innerHTML = '';

  // Recorre todos los colores guardados actualmente.
  coloresActuales.forEach((colorActual, indice) => {
    // Guarda el codigo HEX real del color.
    const colorHEX = colorActual.hex;

    // Prepara el texto que se va a ver abajo de la tarjeta: HEX o HSL.
    const textoColor = obtenerTextoDelColor(colorHEX);

    // Elige el dibujo del candado segun si el color esta bloqueado o desbloqueado.
    const candado = colorActual.bloqueado ? '🔒' : '🔓';

    // Prepara el texto que explica la accion del boton de candado.
    const textoCandado = colorActual.bloqueado ? 'Desbloquear color' : 'Bloquear color';

    // Crea un div nuevo en memoria; todavia no se ve en la pagina.
    const tarjeta = document.createElement('div');

    // Le pone la clase color-card para que tome los estilos del CSS.
    tarjeta.className = colorActual.bloqueado ? 'color-card color-card-bloqueada' : 'color-card';

    // Mete dentro de la tarjeta el rectangulo de color, el boton de candado, el mensaje para copiar y el texto con el codigo.
    tarjeta.innerHTML = `
      <!-- Este div es el rectangulo grande donde se ve el color generado. -->
      <div class="color-display" style="background-color: ${colorHEX}">
        <!-- Este boton bloquea o desbloquea el color para que no cambie al generar otra paleta. -->
        <button type="button" class="color-lock-button" aria-label="${textoCandado}" title="${textoCandado}">
          ${candado}
        </button>

        <!-- Este span muestra el mensaje pequeno dentro del color. -->
        <span class="color-copy-message">Click para COPIAR</span>
      </div>
      <!-- Este div muestra debajo el codigo del color, en formato HEX o HSL. -->
      <div class="color-value">${textoColor}</div>
    `;

    // Cuando el usuario hace click en la tarjeta, copia el texto que se esta mostrando.
    tarjeta.addEventListener('click', () => copiarAlPortapapeles(textoColor));

    // Busca el boton de candado que esta dentro de esta tarjeta.
    const botonCandado = tarjeta.querySelector('.color-lock-button');

    // Cuando el usuario toca el candado, bloquea o desbloquea solo este color.
    botonCandado.addEventListener('click', evento => {
      // Evita que el click en el candado tambien copie el color.
      evento.stopPropagation();

      // Cambia el estado bloqueado/desbloqueado de este color.
      alternarBloqueoColor(indice);
    });

    // Agrega la tarjeta ya armada dentro de la seccion de paletas para que se vea.
    paletasSection.appendChild(tarjeta);

  // Cierra el recorrido de los colores actuales.
  });
}

// Funcion que bloquea o desbloquea un color de la paleta.
function alternarBloqueoColor(indice) {
  // Invierte el estado del color: si estaba bloqueado lo desbloquea, y al reves.
  coloresActuales[indice].bloqueado = !coloresActuales[indice].bloqueado;

  // Guarda el texto del color para mostrarlo en el aviso.
  const textoColor = obtenerTextoDelColor(coloresActuales[indice].hex);

  // Prepara el mensaje segun el nuevo estado del color.
  const mensaje = coloresActuales[indice].bloqueado
    ? `Color ${textoColor} bloqueado`
    : `Color ${textoColor} desbloqueado`;

  // Redibuja la paleta para actualizar el dibujo del candado.
  mostrarPaleta();

  // Muestra un aviso corto con la accion realizada.
  mostrarToast(mensaje);
}

// Funcion que copia un texto al portapapeles.
function copiarAlPortapapeles(texto) {
  // Usa la herramienta del navegador para copiar el texto recibido.
  navigator.clipboard.writeText(texto).then(() => {
    // Si se copio bien, muestra un aviso con el color copiado.
    mostrarToast(`Color ${texto} copiado`);

  // Si el navegador no puede copiar el texto, muestra un aviso de error.
  }).catch(() => {
    // Avisa que la copia no se pudo completar.
    mostrarToast('No se pudo copiar el color');

  // Cierra lo que pasa cuando falla la copia.
  });
}

// Funcion reutilizable para mostrar mensajes cortos en el cartel flotante.
function mostrarToast(mensaje) {
  // Cambia el texto del toast segun la accion que acaba de pasar.
  toast.textContent = mensaje;

  // Si habia un temporizador anterior, lo cancela para que no se cierre antes de tiempo.
  clearTimeout(temporizadorToast);

  // Hace visible el toast agregando la clase mostrar.
  toast.classList.add('mostrar');

  // Espera 2 segundos y despues oculta el toast.
  temporizadorToast = setTimeout(() => toast.classList.remove('mostrar'), 2000);
}

// Cuando la pagina termina de cargar, genera una paleta automaticamente.
window.addEventListener('load', () => generarPaleta());

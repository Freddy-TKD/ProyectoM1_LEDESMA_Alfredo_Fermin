// Busca en el HTML el boton que dice "Generar Paleta" y lo guarda en una constante.
const generarBtn = document.getElementById('generarPaletas');

// Busca en el HTML la lista desplegable donde se elige 6, 8 o 9 colores.
const cantidadSelect = document.getElementById('cantidadColores');

// Busca todos los circulitos de opcion que tienen name="tipoColor".
const tipoColorRadios = document.querySelectorAll('input[name="tipoColor"]');

// Busca la seccion vacia donde despues se van a dibujar las tarjetas de colores.
const paletasSection = document.getElementById('paletas');

// Busca el cartelito que avisa "Color copiado!".
const toast = document.getElementById('toast');

// Guarda que formato de color se esta usando ahora; arranca en hexadecimal.
let tipoColorActual = 'hex';

// Guarda los colores actuales de la pantalla para no cambiarlos al pasar de HEX a HSL.
let coloresActuales = [];

// Cuando el usuario hace click en el boton, se ejecuta la funcion generarPaleta.
generarBtn.addEventListener('click', generarPaleta);

// Cuando el usuario cambia la cantidad de colores, ahi si se vuelve a generar la paleta.
cantidadSelect.addEventListener('change', generarPaleta);

// Recorre cada radio button de formato de color, uno por uno.
tipoColorRadios.forEach(radio => {
  // A cada radio button le escucha el cambio, o sea cuando el usuario lo selecciona.
  radio.addEventListener('change', e => {
    // Guarda el valor elegido: puede ser "hex" o "hsl".
    tipoColorActual = e.target.value;

    // Muestra de nuevo las mismas tarjetas, pero cambiando el texto del formato.
    mostrarPaleta();

  // Cierra el evento change de este radio button.
  });

// Cierra el recorrido de todos los radio buttons.
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
function generarPaleta() {
  // Lee la cantidad elegida en el select y la convierte de texto a numero.
  const cantidad = parseInt(cantidadSelect.value);

  // Vacia la lista de colores actuales para cargar una paleta nueva.
  coloresActuales = [];

  // Repite el bloque de adentro tantas veces como colores se pidieron.
  for (let i = 0; i < cantidad; i++) {
    // Genera un color HEX nuevo y lo guarda en la lista.
    coloresActuales.push(generarColorHEX());
  }

  // Dibuja en pantalla la paleta nueva.
  mostrarPaleta();
}

// Funcion que dibuja las tarjetas usando los colores guardados.
function mostrarPaleta() {
  // Limpia las tarjetas anteriores para dibujarlas de nuevo.
  paletasSection.innerHTML = '';

  // Recorre todos los colores guardados actualmente.
  coloresActuales.forEach(colorHEX => {
    // Prepara el texto que se va a ver abajo de la tarjeta: HEX o HSL.
    const textoColor = obtenerTextoDelColor(colorHEX);

    // Crea un div nuevo en memoria; todavia no se ve en la pagina.
    const tarjeta = document.createElement('div');

    // Le pone la clase color-card para que tome los estilos del CSS.
    tarjeta.className = 'color-card';

    // Mete dentro de la tarjeta el rectangulo de color y el texto con el codigo.
    tarjeta.innerHTML = `
      <div class="color-display" style="background-color: ${colorHEX}"></div>
      <div class="color-value">${textoColor}</div>
    `;

    // Cuando el usuario hace click en la tarjeta, copia el texto que se esta mostrando.
    tarjeta.addEventListener('click', () => copiarAlPortapapeles(textoColor));

    // Agrega la tarjeta ya armada dentro de la seccion de paletas para que se vea.
    paletasSection.appendChild(tarjeta);

  // Cierra el recorrido de los colores actuales.
  });
}

// Funcion que copia un texto al portapapeles.
function copiarAlPortapapeles(texto) {
  // Usa la herramienta del navegador para copiar el texto recibido.
  navigator.clipboard.writeText(texto).then(() => {
    // Si se copio bien, agrega la clase mostrar para que aparezca el cartelito.
    toast.classList.add('mostrar');

    // Espera 2 segundos y despues saca la clase mostrar para ocultar el cartelito.
    setTimeout(() => toast.classList.remove('mostrar'), 2000);

  // Cierra lo que pasa cuando la copia salio bien.
  });
}

// Cuando la pagina termina de cargar, genera una paleta automaticamente.
window.addEventListener('load', generarPaleta);

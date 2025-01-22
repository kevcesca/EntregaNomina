const UNIDADES = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const DECENAS = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

const ESPECIALES = [
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE",
  "DIECI", "VEINTI"
];

/**
 * Convierte un número a su representación en texto
 * @param {number} numero - Número a convertir
 * @returns {string} Representación en texto del número
 */
function convertirNumeroALetras(numero) {
    console.log("convertirNumeroALetras - número recibido:", numero); // Debug: Número de entrada

    if (isNaN(numero) || numero === null || numero === undefined) {
        console.log("convertirNumeroALetras - número inválido:", numero);
        return "CANTIDAD INVÁLIDA";
    }

    const partes = numero.toFixed(2).toString().split(".");
    const enteros = parseInt(partes[0], 10);
    const centavos = parseInt(partes[1], 10);

    console.log("convertirNumeroALetras - partes separadas:", { enteros, centavos }); // Debug: Partes enteros y centavos

    const enterosEnLetra = convertirMiles(enteros);
    const centavosEnLetra = `${centavos}/100`;

    const resultado = `${enterosEnLetra} PESOS ${centavosEnLetra} M.N.`;
    console.log("convertirNumeroALetras - resultado:", resultado); // Debug: Resultado final

    return resultado;
}

/**
 * Convierte un número mayor a 999, manejando miles y millones
 * @param {number} numero - Número a convertir
 * @returns {string} Representación en texto del número
 */
function convertirMiles(numero) {
    console.log("convertirMiles - número recibido:", numero); // Debug: Número recibido

    if (numero === 0) return "CERO";

    let resultado = "";

    // Manejo de millones
    const millones = Math.floor(numero / 1000000);
    const restoMillones = numero % 1000000;

    if (millones > 0) {
        resultado += convertirGrupo(millones) + " MILLÓN";
        if (millones > 1) resultado += "ES";
        if (restoMillones > 0) resultado += " ";
    }

    // Manejo de miles
    const miles = Math.floor(restoMillones / 1000);
    const restoMiles = restoMillones % 1000;

    if (miles > 0) {
        if (miles === 1) {
            resultado += "MIL ";
        } else {
            resultado += convertirGrupo(miles) + " MIL ";
        }
    }

    // Manejo de centenas
    if (restoMiles > 0) {
        resultado += convertirGrupo(restoMiles);
    }

    return resultado.trim();
}

/**
 * Convierte un grupo de números en texto (1 a 999)
 * @param {number} numero - Número de 1 a 999
 * @returns {string} Representación en texto del grupo
 */
function convertirGrupo(numero) {
    console.log("convertirGrupo - número recibido:", numero); // Debug: Número recibido por el grupo

    if (numero === 0) return "CERO";
    if (numero === 100) return "CIEN";

    let letras = "";

    const centenas = Math.floor(numero / 100);
    const restoCentenas = numero % 100;

    if (centenas > 0) {
        letras += CENTENAS[centenas] + " ";
    }

    if (restoCentenas < 10) {
        letras += UNIDADES[restoCentenas];
    } else if (restoCentenas >= 10 && restoCentenas < 20) {
        letras += ESPECIALES[restoCentenas - 10];
    } else {
        const decenas = Math.floor(restoCentenas / 10);
        const unidades = restoCentenas % 10;

        letras += DECENAS[decenas] + (unidades > 0 ? " Y " + UNIDADES[unidades] : "");
    }

    console.log("convertirGrupo - resultado parcial:", letras.trim()); // Debug: Resultado parcial del grupo

    return letras.trim();
}

export default convertirNumeroALetras;

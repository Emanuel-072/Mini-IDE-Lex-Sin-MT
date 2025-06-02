function updateLineNumbers() {
    const textarea = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    const lines = textarea.value.split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => `${i + 1}`).join('\n');
}

function syncScroll() {
    const textarea = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    lineNumbers.scrollTop = textarea.scrollTop;
}

function calculateCharacterWidth() {
    const testElement = document.createElement('span');
    testElement.style.font = window.getComputedStyle(document.getElementById('codeEditor')).font;
    testElement.style.visibility = 'hidden';
    testElement.style.position = 'absolute';
    testElement.textContent = 'X';
    document.body.appendChild(testElement);
    const width = testElement.getBoundingClientRect().width;
    document.body.removeChild(testElement);
    return width;
}

function showErrorMarkers(errors) {
    const textarea = document.getElementById('codeEditor');
    const overlay = document.getElementById('errorOverlay');
    overlay.innerHTML = '';

    if (!Array.isArray(errors) || errors.length === 0) {
        return;
    }

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.5;
    const charWidth = calculateCharacterWidth();

    errors.forEach(error => {
        if (!error || typeof error.columna !== 'number' || typeof error.linea !== 'number') {
            console.warn('Error inválido:', error);
            return;
        }

        const errorMarker = document.createElement('div');
        errorMarker.className = 'error-underline';
        const top = (error.linea - 1) * lineHeight;
        const left = error.columna * charWidth;
        
        errorMarker.style.left = `${left}px`;
        errorMarker.style.top = `${top}px`;
        errorMarker.style.width = `${charWidth}px`;
        errorMarker.style.height = `${lineHeight}px`;

        const tooltip = document.createElement('div');
        tooltip.className = 'error-tooltip';
        tooltip.textContent = `${error.tipo}: ${error.mensaje}`;
        errorMarker.appendChild(tooltip);

        errorMarker.addEventListener('mouseover', () => {
            tooltip.style.display = 'block';
            const tooltipWidth = tooltip.offsetWidth;
            tooltip.style.left = `${-tooltipWidth/2 + charWidth/2}px`;
            tooltip.style.top = `-25px`;
        });

        errorMarker.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });

        overlay.appendChild(errorMarker);
    });
}

async function analyzeLexer() {
    const code = document.getElementById('codeEditor').value;
    try {
        const response = await fetch('/analyze/lexer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code })
        });

        const data = await response.json();
        const errors = Array.isArray(data.errors) ? data.errors.map(error => ({
            ...error,
            columna: error.columna + 1
        })) : [];
        
        displayLexerResults(data);
        showErrorMarkers(errors);

        if (errors.length > 0) {
            console.log('Errores léxicos encontrados:', errors);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al realizar el análisis léxico');
    }
}

async function analyzeParser() {
    const code = document.getElementById('codeEditor').value;
    const lines = code.split('\n');
    
    try {
        const results = await Promise.all(lines.map(async (line, index) => {
            if (!line.trim()) return null;
            
            const response = await fetch('/analyze/parser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: line })
            });

            const data = await response.json();
            return {
                ...data,
                lineNumber: index + 1,
                code: line
            };
        }));

        const validResults = results.filter(result => result !== null);
        const errors = [];
        const successfulLines = [];

        validResults.forEach(result => {
            if (result.errors && result.errors.length > 0 && !result.errors[0].mensaje?.includes('Lexer object')) {
                let mensajeError = traducirMensajeError(result.errors[0].mensaje || 'Error de sintaxis');
                
                // Agregar contexto adicional al mensaje de error
                if (mensajeError.toLowerCase().includes('token')) {
                    mensajeError += ' Revise la sintaxis de la expresión.';
                } else if (mensajeError.toLowerCase().includes('carácter')) {
                    mensajeError += ' Verifique que no haya caracteres especiales no permitidos.';
                } else if (mensajeError.toLowerCase().includes('sintaxis')) {
                    mensajeError += ' Verifique la estructura de la expresión.';
                }

                errors.push({
                    tipo: 'Error de Sintaxis',
                    mensaje: mensajeError,
                    linea: result.lineNumber,
                    codigo: result.code
                });
            } else {
                successfulLines.push({
                    linea: result.lineNumber,
                    codigo: result.code,
                    ast: result.ast
                });
            }
        });

        displayParserResults({
            errors: errors,
            successfulLines: successfulLines
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error al realizar el análisis sintáctico. Por favor, intente nuevamente.');
    }
}

async function executeTuring() {
    const input = document.getElementById('turingInput').value;
    try {
        if (!/^[ab]*$/.test(input)) {
            throw new Error('La entrada solo puede contener los símbolos "a" y "b"');
        }

        const pasos = simularMaquinaTuring(input);

        displayTuringResults(pasos);

    } catch (error) {
        console.error('Error:', error);
        const turingState = document.getElementById('turingState');
        turingState.innerHTML = `
            <div class="alert alert-danger">
                Error al procesar la cadena: ${error.message}
            </div>`;
    }
}

function simularMaquinaTuring(input) {
    const historial = [];
    let cinta = ['B', ...input.split(''), 'B'];
    let cabezal = 1;
    let estado = 'q0';
    let paso = 0;
    let esValida = true;
    let mensaje = '';

    function registrarPaso(accion, descripcion = '') {
        historial.push({
            paso: paso++,
            estado: estado,
            cinta: [...cinta],
            posicion_cabezal: cabezal,
            accion: accion,
            descripcion: descripcion
        });
    }

    registrarPaso('Inicio', 'Comenzando análisis de la cadena');

    // Primera fase: verificar que todas las a's estén antes que las b's
    let fase = 'verificar_orden';
    let encontradoB = false;
    let posicionActual = 1;

    registrarPaso('Verificación', 'Verificando que todas las "a" estén antes que las "b"');

    for (let i = 1; i < cinta.length - 1; i++) {
        cabezal = i;
        if (fase === 'verificar_orden') {
            if (cinta[i] === 'b') {
                encontradoB = true;
                registrarPaso('Lectura', `Encontrado primer símbolo "b" en posición ${i}`);
            } else if (cinta[i] === 'a' && encontradoB) {
                esValida = false;
                mensaje = 'Se encontró una "a" después de una "b"';
                registrarPaso('Error', `Se encontró una "a" después de una "b" en posición ${i}`);
                break;
            }
            registrarPaso('Lectura', `Verificando símbolo "${cinta[i]}" en posición ${i}`);
        }
    }

    if (esValida) {
        let contadorA = 0;
        let contadorB = 0;

        registrarPaso('Conteo', 'Iniciando conteo de símbolos "a"');
        
        // Contar a's
        for (let i = 1; i < cinta.length - 1; i++) {
            cabezal = i;
            if (cinta[i] === 'a') {
                contadorA++;
                registrarPaso('Conteo', `Contando "a" número ${contadorA}`);
            }
        }

        registrarPaso('Conteo', 'Iniciando conteo de símbolos "b"');
        
        // Contar b's
        for (let i = 1; i < cinta.length - 1; i++) {
            cabezal = i;
            if (cinta[i] === 'b') {
                contadorB++;
                registrarPaso('Conteo', `Contando "b" número ${contadorB}`);
            }
        }

        if (contadorA !== contadorB) {
            esValida = false;
            mensaje = `Número diferente de a's (${contadorA}) y b's (${contadorB})`;
            registrarPaso('Error', `Cantidad diferente: ${contadorA} a's y ${contadorB} b's`);
        } else {
            mensaje = `¡Cadena válida! Contiene ${contadorA} a's seguidas de ${contadorB} b's`;
            registrarPaso('Aceptación', `Cadena aceptada: ${contadorA} a's y ${contadorB} b's`);
        }
    }

    return {
        historial: historial,
        esValida: esValida,
        mensaje: mensaje
    };
}

function displayLexerResults(data) {
    const tokenResults = document.getElementById('tokenResults');
    const errorResults = document.getElementById('errorResults');

    if (Array.isArray(data.tokens) && data.tokens.length > 0) {
        tokenResults.innerHTML = data.tokens.map(token => `
            <div class="token-box">
                <strong>Tipo:</strong> ${token.tipo}<br>
                <strong>Valor:</strong> ${token.valor}<br>
                <strong>Línea:</strong> ${token.linea}<br>
                <strong>Columna:</strong> ${token.columna}
            </div>
        `).join('');
    } else {
        tokenResults.innerHTML = '<div class="alert alert-info">No se encontraron tokens</div>';
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
        errorResults.innerHTML = data.errors.map(error => `
            <div class="error-box">
                <strong>Tipo:</strong> ${error.tipo}<br>
                <strong>Mensaje:</strong> ${error.mensaje}<br>
                <strong>Línea:</strong> ${error.linea}<br>
                <strong>Columna:</strong> ${error.columna}
            </div>
        `).join('');
    } else {
        errorResults.innerHTML = '<div class="alert alert-success">No se encontraron errores</div>';
    }
}

function displayParserResults(data) {
    const errorResults = document.getElementById('errorResults');
    const tokenResults = document.getElementById('tokenResults');

    errorResults.innerHTML = '';
    tokenResults.innerHTML = '';

    if (data.successfulLines && data.successfulLines.length > 0) {
        tokenResults.innerHTML = `
            <div class="alert alert-success">
                <h4>Expresiones correctas:</h4>
                ${data.successfulLines.map(line => `
                    <div class="token-box">
                        <strong>Línea ${line.linea}:</strong> ${line.codigo}
                        ${line.ast ? `<pre>${JSON.stringify(line.ast, null, 2)}</pre>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (data.errors && data.errors.length > 0) {
        errorResults.innerHTML = data.errors.map(error => `
            <div class="error-box">
                <strong>Error de sintaxis en línea ${error.linea}:</strong><br>
                <strong>Expresión:</strong> ${error.codigo}<br>
                <strong>Descripción:</strong> ${error.mensaje}
            </div>
        `).join('');
    } else {
        errorResults.innerHTML = '<div class="alert alert-success">Análisis sintáctico completado. No se encontraron errores.</div>';
    }
}

function displayTuringResults(data) {
    const turingState = document.getElementById('turingState');
    const turingTape = document.getElementById('turingTape');
    const turingHistory = document.getElementById('turingHistory');

    turingState.innerHTML = '';
    turingTape.innerHTML = '';
    turingHistory.innerHTML = '';

    const isValid = data.isValidFormat && data.numAs === data.numBs;

    // Mostrar el estado actual
    turingState.innerHTML = `
        <div class="alert alert-${isValid ? 'success' : 'danger'}">
            <h4>${isValid ? '¡Cadena Aceptada!' : 'Cadena Rechazada'}</h4>
            <p>${data.mensaje}</p>
            <hr>
            <p><strong>Explicación:</strong> ${
                isValid 
                    ? `La cadena cumple con el formato a^${data.numAs}b^${data.numBs} donde n=${data.numAs}`
                    : 'La cadena no cumple con el formato requerido a^n b^n'
            }</p>
        </div>
    `;

    // Mostrar la cinta final
    if (data.historial && data.historial.length > 0) {
        const ultimoPaso = data.historial[data.historial.length - 1];
        
        turingTape.innerHTML = `
            <div class="tape-container">
                ${ultimoPaso.cinta.map((simbolo, index) => `
                    <div class="tape-cell ${index === ultimoPaso.posicion_cabezal ? 'head-position' : ''}">
                        ${simbolo === 'B' ? '□' : simbolo}
                    </div>
                `).join('')}
            </div>
        `;

        // Mostrar historial de pasos
        turingHistory.innerHTML = `
            <div class="history-container">
                <h4>Historial de Ejecución</h4>
                ${data.historial.map((paso, index) => `
                    <div class="step-box">
                        <strong>Paso ${index + 1}: ${paso.accion}</strong>
                        <div class="tape-mini">
                            ${paso.cinta.map((simbolo, i) => `
                                <span class="${i === paso.posicion_cabezal ? 'head-position-mini' : ''}" 
                                      title="${i === paso.posicion_cabezal ? 'Posición actual del cabezal' : ''}">
                                    ${simbolo === 'B' ? '□' : simbolo}
                                </span>
                            `).join('')}
                        </div>
                        <div class="step-details">
                            <span>Estado: ${paso.estado}</span>
                            <span>${paso.descripcion || paso.accion}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function traducirMensajeError(mensaje) {
    // Mapeo detallado de mensajes de error
    const traducciones = {
        'Syntax error': 'Error de sintaxis',
        'Invalid syntax': 'Sintaxis inválida',
        'Unexpected token': 'Token no esperado',
        'Expected': 'Se esperaba',
        'Invalid expression': 'Expresión inválida',
        'Missing semicolon': 'Falta punto y coma',
        'Unexpected end of input': 'Final inesperado de la entrada',
        'Invalid statement': 'Declaración inválida',
        'Unexpected character': 'Carácter no esperado',
        'Invalid identifier': 'Identificador inválido',
        'Lexer object has no attribute': 'Error interno del analizador',
        'Error de sintaxis en el token': 'Error de sintaxis en la expresión',
        'unexpected character': 'carácter no permitido',
        'invalid syntax': 'sintaxis no válida',
        'invalid token': 'token no válido',
        'unexpected EOF': 'final inesperado del código',
        'invalid character': 'carácter no válido',
        'unexpected indent': 'indentación inesperada',
        'unexpected token at': 'token inesperado en',
        'syntax error': 'error de sintaxis',
        'expected': 'se esperaba',
        'unexpected': 'no esperado',
        'invalid': 'no válido',
        'missing': 'falta',
        'error': 'error',
        'Error': 'Error'
    };

    let mensajeTraducido = mensaje;

    // Aplicar traducciones
    for (const [ingles, espanol] of Object.entries(traducciones)) {
        const regExp = new RegExp(ingles, 'gi');
        mensajeTraducido = mensajeTraducido.replace(regExp, espanol);
    }

    // Mejorar formato del mensaje
    mensajeTraducido = mensajeTraducido
        .replace(/^error/i, 'Error')
        .replace(/\s+/g, ' ')
        .trim();

    // Agregar punto final si no existe
    if (!mensajeTraducido.endsWith('.')) {
        mensajeTraducido += '.';
    }

    return mensajeTraducido;
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    updateLineNumbers();
    const textarea = document.getElementById('codeEditor');
    textarea.addEventListener('input', function() {
        document.getElementById('errorOverlay').innerHTML = '';
    });
});

// Limpiar marcadores de error cuando el usuario modifica el código
document.getElementById('codeEditor').addEventListener('input', function() {
    document.getElementById('errorOverlay').innerHTML = '';
    document.getElementById('errorResults').innerHTML = '';
    document.getElementById('tokenResults').innerHTML = '';
});

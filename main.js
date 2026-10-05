/*
 * FincatiX · pagina de presentacion.
 *
 * Sin librerias: lo que se mueve lo mueve CSS, y este fichero solo decide
 * CUANDO (al llegar a cada parte de la pagina) y dibuja la fachada. Quien
 * pide menos movimiento en su sistema lo ve todo quieto y entero.
 */
(function () {
    'use strict';

    var raiz = document.documentElement;
    raiz.classList.remove('sin-js');

    var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- utilidades ---------- */

    // «2.032,86»: punto de miles y coma decimal, como en la aplicacion. Intl
    // en español no agrupa los numeros de cuatro cifras, y aqui si se quiere.
    function formatear(valor, decimales) {
        var partes = Math.abs(valor).toFixed(decimales).split('.');
        var entera = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return (valor < 0 ? '-' : '') + entera + (decimales > 0 ? ',' + partes[1] : '');
    }

    function alVer(elementos, accion, opciones) {
        if (!('IntersectionObserver' in window)) {
            elementos.forEach(function (el) { accion(el); });
            return;
        }

        var observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    accion(entrada.target);
                    observador.unobserve(entrada.target);
                }
            });
        }, opciones || { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

        elementos.forEach(function (el) { observador.observe(el); });
    }

    function todos(selector, dentro) {
        return Array.prototype.slice.call((dentro || document).querySelectorAll(selector));
    }

    /* ---------- cabecera y menu ---------- */

    var cabecera = document.querySelector('[data-cabecera]');
    var alDesplazar = function () {
        cabecera.classList.toggle('con-linea', window.scrollY > 8);
    };
    window.addEventListener('scroll', alDesplazar, { passive: true });
    alDesplazar();

    var botonMenu = document.querySelector('[data-menu-boton]');
    var listaMenu = document.querySelector('[data-menu-lista]');

    function cerrarMenu() {
        botonMenu.setAttribute('aria-expanded', 'false');
        listaMenu.classList.remove('abierto');
    }

    botonMenu.addEventListener('click', function () {
        var abierto = botonMenu.getAttribute('aria-expanded') === 'true';
        botonMenu.setAttribute('aria-expanded', String(!abierto));
        listaMenu.classList.toggle('abierto', !abierto);
    });

    todos('a', listaMenu).forEach(function (enlace) {
        enlace.addEventListener('click', cerrarMenu);
    });

    /* ---------- aparecer al pasar ---------- */

    alVer(todos('.aparece'), function (el) { el.classList.add('visto'); });

    /* ---------- la fachada ---------- */

    var fachada = document.querySelector('[data-fachada]');
    var grupoVentanas = fachada.querySelector('[data-ventanas]');
    var NS = 'http://www.w3.org/2000/svg';
    var ventanas = [];

    function ventana(x, y, ancho, alto) {
        var rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', ancho);
        rect.setAttribute('height', alto);
        rect.setAttribute('rx', 3);
        rect.setAttribute('class', 'ventana');
        grupoVentanas.appendChild(rect);
        ventanas.push(rect);
        return rect;
    }

    // Cinco plantas de cuatro ventanas, y dos escaparates a los lados del portal.
    var columnas = [68, 128, 188, 248];
    var plantas = [72, 120, 168, 216, 264];

    plantas.forEach(function (y) {
        columnas.forEach(function (x) { ventana(x, y, 34, 34); });
    });
    ventana(60, 330, 64, 44);
    ventana(216, 330, 64, 44);

    // Que ventanas se encienden al principio: siempre las mismas, para que la
    // fachada se reconozca; como en el simbolo, unas si y otras no.
    var encendidas = [0, 3, 5, 6, 9, 12, 14, 15, 17, 19, 20];

    function encender(rect, conDestello) {
        rect.classList.add('encendida');
        if (conDestello) {
            rect.classList.remove('destello');
            void rect.getBoundingClientRect();
            rect.classList.add('destello');
        }
    }

    if (quieto) {
        encendidas.forEach(function (i) { encender(ventanas[i]); });
    } else {
        // Primero suben las ventanas, de abajo arriba, y luego se encienden las luces.
        fachada.classList.add('preparada');
        ventanas.forEach(function (rect, i) {
            var fila = Math.floor(i / 4);
            rect.style.animationDelay = (0.25 + (plantas.length - fila) * 0.09 + (i % 4) * 0.04) + 's';
        });

        encendidas.forEach(function (indice, orden) {
            setTimeout(function () { encender(ventanas[indice], true); }, 1100 + orden * 140);
        });

        // Despues, de vez en cuando una se apaga y otra se enciende, solo
        // mientras la portada se ve.
        var portadaVisible = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entradas) {
                portadaVisible = entradas[0].isIntersecting;
            }).observe(fachada);
        }

        setTimeout(function () {
            setInterval(function () {
                if (!portadaVisible || document.hidden) {
                    return;
                }
                var rect = ventanas[Math.floor(Math.random() * ventanas.length)];
                if (rect.classList.contains('encendida')) {
                    rect.classList.remove('encendida');
                } else {
                    encender(rect, true);
                }
            }, 1700);
        }, 1100 + encendidas.length * 140 + 1200);
    }

    /* ---------- la frase, palabra a palabra ---------- */

    var frase = document.querySelector('[data-frase]');

    (function partirEnPalabras(nodo) {
        todos('*', nodo).concat([nodo]).forEach(function (el) {
            Array.prototype.slice.call(el.childNodes).forEach(function (hijo) {
                if (hijo.nodeType !== 3 || !hijo.textContent.trim()) {
                    return;
                }
                var trozo = document.createDocumentFragment();
                hijo.textContent.split(/(\s+)/).forEach(function (pieza) {
                    if (!pieza) {
                        return;
                    }
                    if (/^\s+$/.test(pieza)) {
                        trozo.appendChild(document.createTextNode(pieza));
                    } else {
                        var span = document.createElement('span');
                        span.className = 'palabra';
                        span.textContent = pieza;
                        trozo.appendChild(span);
                    }
                });
                el.replaceChild(trozo, hijo);
            });
        });
    })(frase);

    var palabras = todos('.palabra', frase);

    function iluminarFrase() {
        var caja = frase.getBoundingClientRect();
        var alto = window.innerHeight;
        // De 0 cuando la frase asoma por abajo a 1 un poco antes de que su
        // centro llegue al de la pantalla: centrada, ya se lee entera.
        var empieza = alto * 0.95;
        var termina = alto * 0.58 - caja.height / 2;
        var avance = (empieza - caja.top) / (empieza - termina);
        var cuantas = Math.round(Math.max(0, Math.min(1, avance)) * palabras.length);
        palabras.forEach(function (p, i) { p.classList.toggle('vista', i < cuantas); });
    }

    if (quieto) {
        palabras.forEach(function (p) { p.classList.add('vista'); });
    } else {
        var pendiente = false;
        window.addEventListener('scroll', function () {
            if (!pendiente) {
                pendiente = true;
                requestAnimationFrame(function () { iluminarFrase(); pendiente = false; });
            }
        }, { passive: true });
        iluminarFrase();
    }

    /* ---------- contadores ---------- */

    function contar(el) {
        var destino = parseFloat(el.getAttribute('data-contar'));
        var decimales = parseInt(el.getAttribute('data-decimales') || '0', 10);

        if (quieto) {
            el.textContent = formatear(destino, decimales);
            return;
        }

        var inicio = null;
        var duracion = 1500;

        function paso(ahora) {
            if (inicio === null) {
                inicio = ahora;
            }
            var t = Math.min(1, (ahora - inicio) / duracion);
            var suave = 1 - Math.pow(1 - t, 3);
            el.textContent = formatear(destino * suave, decimales);
            if (t < 1) {
                requestAnimationFrame(paso);
            } else {
                el.textContent = formatear(destino, decimales);
            }
        }

        requestAnimationFrame(paso);
    }

    alVer(todos('[data-contar]'), contar, { threshold: 0.6 });

    /* ---------- partes que se mueven al llegar ---------- */

    alVer(todos('[data-importador]'), function (el) {
        setTimeout(function () { el.classList.add('ordenado'); }, quieto ? 0 : 500);
    }, { threshold: 0.35 });

    alVer(todos('[data-circuito]'), function (el) { el.classList.add('visto'); }, { threshold: 0.25 });

    alVer(todos('.pieza'), function (el) { el.classList.add('visto'); }, { threshold: 0.4 });

    alVer(todos('[data-agrupa]'), function (el) {
        setTimeout(function () { el.classList.add('junto'); }, quieto ? 0 : 700);
    }, { threshold: 0.5 });

    alVer(todos('[data-cierre-simbolo]'), function (el) { el.classList.add('encendido'); }, { threshold: 0.6 });

    // El buscador de muestra se escribe solo.
    alVer(todos('.buscador-demo'), function (demo) {
        var destino = demo.querySelector('[data-escribe]');
        var texto = destino.getAttribute('data-escribe');

        if (quieto) {
            destino.textContent = texto;
            demo.classList.add('escrito');
            return;
        }

        var i = 0;
        setTimeout(function escribe() {
            destino.textContent = texto.slice(0, ++i);
            if (i < texto.length) {
                setTimeout(escribe, 110 + Math.random() * 90);
            } else {
                setTimeout(function () { demo.classList.add('escrito'); }, 250);
            }
        }, 600);
    }, { threshold: 0.5 });

    /* ---------- el buscador de prueba (Ctrl+K) ---------- */

    // Datos inventados, de comunidades de prueba.
    var PROPIETARIOS = [
        { nombre: 'Raquel Rubio Herrero', detalle: 'El Mirador del Secarral · 600 ••• ••• · Vocal' },
        { nombre: 'Raquel Ortega Lamas', detalle: 'Residencial Los Almendros · 611 ••• ••• · Presidenta' },
        { nombre: 'Enrique Prieto Vargas', detalle: 'El Mirador del Secarral · 622 ••• ••• · Presidente' },
        { nombre: 'Natalia Sanz Pastor', detalle: 'El Mirador del Secarral · 633 ••• •••' },
        { nombre: 'Víctor Morales Marín', detalle: 'Residencial Los Almendros · 644 ••• •••' },
        { nombre: 'Sara Ortiz Gallego', detalle: 'Edificio Los Olmos · 655 ••• ••• · Secretaria' },
        { nombre: 'Roberto Cano Fuentes', detalle: 'Edificio Los Olmos · 666 ••• •••' }
    ];

    var PROPIEDADES = [
        { nombre: '3º A', detalle: 'El Mirador del Secarral · Vivienda · Raquel Rubio Herrero' },
        { nombre: '3º B', detalle: 'El Mirador del Secarral · Vivienda · Enrique Prieto Vargas' },
        { nombre: 'Garaje 12', detalle: 'El Mirador del Secarral · Garaje · Raquel Rubio Herrero' },
        { nombre: 'Trastero 4', detalle: 'Residencial Los Almendros · Trastero · Víctor Morales Marín' },
        { nombre: 'Local 1', detalle: 'Edificio Los Olmos · Local comercial · sin propietario' }
    ];

    var paleta = document.querySelector('[data-paleta]');
    var entrada = paleta.querySelector('[data-paleta-entrada]');
    var resultados = paleta.querySelector('[data-paleta-resultados]');
    var quienAbrio = null;
    var marcado = 0;

    function sinAcentos(texto) {
        return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    function pintarResultados() {
        var buscado = sinAcentos(entrada.value.trim());
        var coincide = function (fila) { return !buscado || sinAcentos(fila.nombre + ' ' + fila.detalle).indexOf(buscado) !== -1; };
        var grupos = [['Propietarios', PROPIETARIOS.filter(coincide)], ['Propiedades', PROPIEDADES.filter(coincide)]];

        resultados.textContent = '';
        marcado = 0;
        var hay = false;

        grupos.forEach(function (grupo) {
            if (!grupo[1].length) {
                return;
            }
            hay = true;
            var titulo = document.createElement('span');
            titulo.className = 'versalita';
            titulo.textContent = grupo[0];
            resultados.appendChild(titulo);

            grupo[1].forEach(function (fila) {
                var caja = document.createElement('div');
                caja.className = 'resultado';
                var nombre = document.createElement('strong');
                nombre.textContent = fila.nombre;
                var detalle = document.createElement('span');
                detalle.className = 'tenue';
                detalle.textContent = fila.detalle;
                caja.appendChild(nombre);
                caja.appendChild(detalle);
                resultados.appendChild(caja);
            });
        });

        if (!hay) {
            var vacio = document.createElement('p');
            vacio.className = 'paleta-vacio';
            vacio.textContent = 'Nada con «' + entrada.value.trim() + '». Pruebe con «Raquel», «Mirador» o «3º A».';
            resultados.appendChild(vacio);
        }

        marcar(0);
    }

    function marcar(indice) {
        var filas = todos('.resultado', resultados);
        if (!filas.length) {
            return;
        }
        marcado = (indice + filas.length) % filas.length;
        filas.forEach(function (fila, i) { fila.classList.toggle('marcado', i === marcado); });
        filas[marcado].scrollIntoView({ block: 'nearest' });
    }

    function abrirPaleta() {
        if (!paleta.hidden) {
            return;
        }
        quienAbrio = document.activeElement;
        paleta.hidden = false;
        document.body.style.overflow = 'hidden';
        entrada.value = '';
        pintarResultados();
        entrada.focus();
    }

    function cerrarPaleta() {
        if (paleta.hidden) {
            return;
        }
        paleta.hidden = true;
        document.body.style.overflow = '';
        if (quienAbrio && quienAbrio.focus) {
            quienAbrio.focus();
        }
    }

    document.addEventListener('keydown', function (evento) {
        var tecla = evento.key ? evento.key.toLowerCase() : '';
        if (tecla === 'k' && (evento.ctrlKey || evento.metaKey)) {
            evento.preventDefault();
            if (paleta.hidden) {
                abrirPaleta();
            } else {
                cerrarPaleta();
            }
        } else if (!paleta.hidden) {
            if (tecla === 'escape') {
                cerrarPaleta();
            } else if (tecla === 'arrowdown') {
                evento.preventDefault();
                marcar(marcado + 1);
            } else if (tecla === 'arrowup') {
                evento.preventDefault();
                marcar(marcado - 1);
            } else if (tecla === 'tab') {
                // El unico control de la ventana es el campo: el foco se queda en el.
                evento.preventDefault();
                entrada.focus();
            }
        }
    });

    entrada.addEventListener('input', pintarResultados);
    todos('[data-cerrar-paleta]').forEach(function (el) { el.addEventListener('click', cerrarPaleta); });
    todos('[data-abrir-buscador]').forEach(function (el) { el.addEventListener('click', abrirPaleta); });

    // En el Mac la tecla es ⌘, no Ctrl: se dice la que es.
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
        todos('.tecla').forEach(function (tecla) {
            if (tecla.textContent === 'Ctrl') {
                tecla.textContent = '⌘';
            }
        });
    }

    /* ---------- la calculadora del precio ---------- */

    var deslizador = document.querySelector('[data-calculadora]');
    var salidaPropiedades = document.querySelector('[data-calculadora-propiedades]');
    var salidaTotal = document.querySelector('[data-calculadora-total]');
    var PRECIO = 0.25;

    function calcular() {
        var propiedades = parseInt(deslizador.value, 10);
        var total = propiedades * PRECIO;
        salidaPropiedades.textContent = formatear(propiedades, 0);
        salidaTotal.textContent = formatear(total, total % 1 === 0 ? 0 : 2);
        var relleno = (propiedades - deslizador.min) / (deslizador.max - deslizador.min) * 100;
        deslizador.style.setProperty('--relleno', relleno + '%');
    }

    deslizador.addEventListener('input', calcular);
    calcular();
})();

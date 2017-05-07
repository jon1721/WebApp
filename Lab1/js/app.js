var navPila = [];

var fnRefrescar = {
    'pgPrincipal': refrescarPrincipal,
    'pgNuevaTarea': refrescarNuevaTarea,
    'pgEditarTarea': refrescarEditarTarea,
    'pgTodasTareas': refrescarTodasTareas
};

function cambiarPagina(pag, pagAnterior) {
    console.log('cambiarPagina(' + pag + ',' + pagAnterior + ')');
    if (pagAnterior) $('#' + pagAnterior).css('display', 'none');
    $('#' + pag).css('display', 'block');
// ajustar altura
    $('#' + pag + ' .content').height('auto');
// añadir pie de página
    $('#' + pag + ' .content').height($('#' + pag + ' .content').height() + $
        ('#' + pag + ' .footer').height());
// ocultar barra de navegación
    window.scrollTo(0, 1);
}

function navSaltar(pag) {
    console.log('navSaltar(' + pag + ')');

    navPila.forEach(function (pagina, indice){
        console.log("navSaltar: " + indice + '. ' + pagina);
    });

// 1. recuperar página anterior
    var pagAnterior;
    if (navPila.length > 0) pagAnterior = navPila[navPila.length-1];
// 2. apilar página nueva
    navPila.push(pag);
// 3. refrescar página nueva
    var args = [];
    for (var i = 1; i < arguments.length; i++) args[i-1] = arguments[i];
    fnRefrescar[pag](args);
// 4. cambiar página
    cambiarPagina(pag, pagAnterior);
}

function navAtras() {
    console.log('navAtras()');

    navPila.forEach(function (pagina, indice){
        console.log("navAtras: " + indice + '. ' + pagina);
    });


// 1. desapilar actual
    var pgActual = navPila.pop();
    if (navPila.length > 0) {
// 2. obtener anterior
        var pgAnterior = navPila[navPila.length-1];
// 3. refrescar
        fnRefrescar[pgAnterior]();
// 4. mostrar
        cambiarPagina(pgAnterior, pgActual);
    }
}

function refrescarPrincipal() {
    console.log('refrescarPrincipal()');
    $('#pgPrincipal .lista-tarea').empty();

    var numTareas = 0;
    var i = 0;

    var req = dbRegCount();

    if(req != undefined){
        req.onsuccess = function() {
            console.log(req.result);
            var len = req.result;

            var request = dbGetAllTareas();

            if(request != undefined){

                request.onerror = function(event) {
                    alert("Unable to retrieve data from database!");
                };

                request.onsuccess = function(event) {
                    if(request.result) {
                        var tarea = request.result;
                        tareasDB = [];

                        tarea.forEach(function (task) {
                            tareasDB.push(task)
                        });

                        while (numTareas < 5 && i < len) {
                            if (tareasDB[i].estado == 'pendiente') {
                                $('#pgPrincipal .lista-tarea').append('<li ' +
                                    'onclick="navSaltar(\'pgEditarTarea\',' +
                                    tareasDB[i].id + ')">Tarea: ' + tareasDB[i].titulo + '</li>');
                                numTareas++;
                            }
                            i++;
                        }
                    }
                };

            }



/*
            while (numTareas < 5 && i < len) {
                if (tareasDB[i].estado == 'pendiente') {
                    $('#pgPrincipal .lista-tarea').append('<li ' +
                        'onclick="navSaltar(\'pgEditarTarea\',' +
                        tareasDB[i].id + ')">Tarea: ' + tareasDB[i].titulo + '</li>');
                    numTareas++;
                }
                i++;
            }
*/
        }
    }

}

function refrescarNuevaTarea() {
    console.log('refrescarNuevaTarea()');
    $('#pgNuevaTarea #txtTitulo').val('');
}

function refrescarEditarTarea(id) {
    console.log('refrescarEditarTarea(' + id + ')');
    if (!id) return;

    console.log("refrescarEditarTarea id: " + id);
    dbGetTarea(id[0]);



/*
    var tarea = buscarTarea(id);

    if (!tarea) {
        alert('error, tarea con id ' + id + ' no existe');
        return;
    }
    // detalles tarea
    var html = '<legend>Tarea: ' + tarea.titulo + '</legend>';
    var date = new Date(tarea.ts);
    html += '<p class="' + tarea.estado + '">' + tarea.estado + '</p><p class="' +
        tarea.estado + '">' +
        [date.getDate(), date.getMonth()+1, date.getFullYear()].join("/") +
        '</p>';
    $('#pgEditarTarea .content fieldset').html(html);
    // botón completar
    html = tarea.estado == 'pendiente'? '<a id="btCompletar"' +
    'onclick="completarTarea(' + id + '); navAtras();" class="boton"' +
    ' href="#">Completar</a>': '';
    // botón eliminar
    html += '<a id="btEliminar" onclick="eliminarTarea(' + id + ');'
        + ' navAtras();"'
        + ' class="boton" href="#">Eliminar</a>';
    $('#pgEditarTarea .footer').html(html);
*/
}

function refrescarTodasTareas() {
    console.log('refrescarTodasTareas()');
    $('#pgTodasTareas .lista-tarea').empty();
    // filtrar
    var pendientes = $('#pgTodasTareas #chkPendientes').is(":checked");
    var completadas = $('#pgTodasTareas #chkCompletadas').is(":checked");
    var fecha = $('#pgTodasTareas #txtFecha').val();
    try {
        fecha = fecha && fecha.split('/');
        fecha = new Date(fecha[2], fecha[1]-1, fecha[0]);
    } catch (e) {
        console.log('Fecha no valida')
    }
    console.log('pendientes:' + pendientes + ',completadas:' + completadas +
        ',fecha:' + fecha);

    var req = dbRegCount();

    if(req != undefined){
        req.onsuccess = function() {
            console.log(req.result);
            var len = req.result;

            var request = dbGetAllTareas();

            if(request != undefined){

                request.onerror = function(event) {
                    alert("Unable to retrieve data from database!");
                };

                request.onsuccess = function(event) {
                    if(request.result) {
                        var tarea = request.result;
                        tareasDB = [];

                        tarea.forEach(function (task) {
                            tareasDB.push(task)
                        });

                        for (var i = 0; i < len; i++) {
                            var tarea = tareasDB[i];
                            if (tarea.estado == 'pendiente' && !pendientes) continue;
                            if (tarea.estado == 'completada' && !completadas) continue;
                            if (fecha && tarea.ts < fecha.getTime()) continue;
                            $('#pgTodasTareas .lista-tarea').append('<li class="' +
                                tarea.estado  +
                                '" onclick="navSaltar(\'pgEditarTarea\',' + tarea.id + ')">Tarea: '
                                + tarea.titulo + '</li>');
                        }
                    }
                };

            }
        }
    }
}

$(function() {

    // eventos pgPrincipal

    $('#pgPrincipal #btNuevaTarea').click(function() {
        navSaltar('pgNuevaTarea');
    });
    $('#pgPrincipal #btTodasTareas').click(function() {
        navSaltar('pgTodasTareas');
    });

// eventos pgNuevaTarea    
    $('#pgNuevaTarea #btAceptar').click(function() {
        // guardar tarea
        nuevaTarea($('#txtTitulo').val());
        navAtras();

    });
    $('#pgNuevaTarea #btCancelar').click(function() {
        navAtras();
    });
// eventos pgTodasTareas
    $('#pgTodasTareas #pgTodasTareas input').change(function() {
        refrescarTodasTareas();
        cambiarPagina('pgTodasTareas');
    });
// eventos atrás
    $('.header a').click(function() {
        navAtras();
    });

    navSaltar('pgPrincipal');
});
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

                        var len = tareasDB.length;
                        if(len > 0) {
                            nextId = tareasDB[len - 1].id + 1;
                        }
                        var ahora = new Date().getTime();
                        tareasDB.forEach(function (task) {
                            if(task.vencimiento < ahora) {
                                task.vencida = 1;
                            } else {
                                task.vencida = 0;
                            }
                        });

                        tareasDB.sort(function(tarea1, tarea2){return tarea2.vencida - tarea1.vencida});

                        var renglon = "";

                        while (numTareas < 5 && i < len) {

                            if ((tareasDB[i].estado == 'pendiente') && (tareasDB[i].vencimiento < ahora)) {

                                renglon = '<li ' +
                                    'class="vencida"'  +
                                    'onclick="navSaltar(\'pgEditarTarea\',' +
                                    tareasDB[i].id + ')">Tarea: ' + tareasDB[i].titulo + '</li>';

                                $('#pgPrincipal .lista-tarea').append(renglon);
                                numTareas++;
                            }

                            if ((tareasDB[i].estado == 'pendiente') && (tareasDB[i].vencimiento >= ahora)) {
                                $('#pgPrincipal .lista-tarea').append('<li ' +
                                    'class="' +  tareasDB[i].estado + '"' +
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
    $('#pgNuevaTarea #txtVencimiento').val('');
    $("#priorBaja").prop("checked", false);
    $("#priorMedia").prop("checked", true);
    $("#priorAlta").prop("checked", false);
    $("#chkPermitir").prop("checked", true);
}

function refrescarEditarTarea(id) {
    //console.log('refrescarEditarTarea(' + id + ')');
    if (!id) return;

    //console.log("refrescarEditarTarea id: " + id);
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

    var baja = $('#pgTodasTareas #chkBaja').is(":checked");
    var media = $('#pgTodasTareas #chkMedia').is(":checked");
    var alta = $('#pgTodasTareas #chkAlta').is(":checked");

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

                        var ahora = new Date().getTime();

                        tareasDB.forEach(function (task) {
                            if(task.vencimiento < ahora) {
                                task.vencida = 1;
                            } else {
                                task.vencida = 0;
                            }
                        });


                        tareasDB.sort(function(tarea1, tarea2){return tarea2.vencida - tarea1.vencida});

                        //colorear

                        var renglon = "";
                        var clase = "";

                        for (var i = 0; i < len; i++) {
                            var tarea = tareasDB[i];
                            if (tarea.estado == 'pendiente' && !pendientes) continue;
                            if (tarea.estado == 'completada' && !completadas) continue;

                            if (tarea.prioridad == 'baja' && !baja) continue;
                            if (tarea.prioridad == 'media' && !media) continue;
                            if (tarea.prioridad == 'alta' && !alta) continue;


                            if (fecha && tarea.ts < fecha.getTime()) continue;

                            clase = tarea.estado;
                            if(clase !== "completada") {
                                if(tarea.vencida === 1) {clase = "vencida"};
                            }

                            renglon = '<li class="' + clase  +
                                '" onclick="navSaltar(\'pgEditarTarea\',' + tarea.id + ')">Tarea: '
                                + tarea.titulo + '</li>';

                            $('#pgTodasTareas .lista-tarea').append(renglon);
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
        var vencimiento = $('#txtVencimiento').val();
        var fechaOK = validarFormatoFecha(vencimiento) && existeFecha(vencimiento);

        if($('#txtTitulo').val() === ""){
            alert("El título de la tarea es un campo obligatorio");
            return;
        }

        if(fechaOK == true)
        {
            var fechaf = vencimiento.split("/");
            var day = fechaf[0];
            var month = fechaf[1]-1;
            var year = fechaf[2];
            var d = new Date(year, month, day);
            var venc = d.getTime();

            var permitir = new Date().getTime() < venc;

            if($('#chkPermitir').is(':checked') === false) { permitir = true; }

            if(permitir){
                var prior = "";
                if($('#priorBaja').is(':checked')) { prior = 'baja'; }
                if($('#priorMedia').is(':checked')) { prior = 'media'; }
                if($('#priorAlta').is(':checked')) { prior = 'alta'; }

                nuevaTarea($('#txtTitulo').val(), venc, prior);
                navAtras();
            }else {
                alert("La fecha de vencimiento no puede ser inferior a la actual");
                $('#txtVencimiento').val("");
                return;
            }
        } else {
            alert("La fecha de vencimiento ingresada y/o su formato son incorrectos");
            $('#txtVencimiento').val("");
            return;
        }

    });
    $('#pgNuevaTarea #btCancelar').click(function() {
        navAtras();
    });
// eventos pgTodasTareas
    $('#pgTodasTareas input').change(function() {
        refrescarTodasTareas();
        cambiarPagina('pgTodasTareas');
    });
// eventos atrás
    $('.header a').click(function() {
        navAtras();
    });

    navSaltar('pgPrincipal');
});


function validarFormatoFecha(campo) {
    var RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    if ((campo.match(RegExPattern)) && (campo!='')) {
        return true;
    } else {
        return false;
    }
}

function existeFecha(fecha){
    var fechaf = fecha.split("/");
    var day = fechaf[0];
    var month = fechaf[1];
    var year = fechaf[2];
    var date = new Date(year,month,'0');
    if((day-0)>(date.getDate()-0)){
        return false;
    }
    return true;
}
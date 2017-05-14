/**
 * Created by jon on 06/05/2017.
 */

var db = undefined;

function dbAbrir(nombre, version) {

    var objectStore = undefined;

    if (!window.indexedDB) {
        window.alert("Esto sí que es una pena: su navegador no soporta una versión estable de indexedDB.");
    }
    else {
        var request = window.indexedDB.open(nombre, version);

        request.onupgradeneeded = function(e) {
            db = e.target.result;
            objectStore = db.createObjectStore('objTareas', { keyPath: "id" });
            //objectStore.createIndex('id', 'id', {unique: true});

        }

        request.onerror = function(event) {
            alert("Database error: " + event.target.errorCode);
        };

        request.onsuccess = function(e) {
            db =  e.target.result;
            //var trans = db.transaction('objTareas', 'readwrite');
            //objectStore = trans.objectStore('objTareas', { keyPath: "id" });
            //objectStore = db.createObjectStore('objTareas', { keyPath: "id" });

            refrescarPrincipal();
        }
    }
}

function dbAddTarea(nuevaTarea) {

    if((db != undefined) && db != null) {

        var request = db.transaction(["objTareas"], "readwrite")
            .objectStore("objTareas")
            .add(nuevaTarea);

        request.onsuccess = function(event) {
            console.log("dbAddTarea tx OK");
        };

        request.onerror = function(event) {
            console.log("dbAddTarea tx falló: " + request.error);

        }
    }
}

function dbGetTarea(id) {

    if((db != undefined) && db != null) {

        var transaction = db.transaction(["objTareas"]);
        var objectStore = transaction.objectStore("objTareas");
        var request = objectStore.get(id);

        request.onerror = function(event) {
            alert("Unable to retrieve daa from database!");
        };

        request.onsuccess = function(event) {
            if(request.result) {
                var tarea = request.result;

                if (!tarea) {
                    alert('error, tarea con id ' + id + ' no existe');
                    return;
                } else {

                    //colorear segun vencida

                    var clase = tarea.estado;
                    var ahora = new Date().getTime();
                    if(tarea.vencimiento < ahora) {
                        clase = 'vencida';
                    }


                    // detalles tarea
                    var html = '<legend>Tarea: ' + tarea.titulo + '</legend>';
                    var date = new Date(tarea.ts);
                    var fven = new Date(tarea.vencimiento);
                    html += '<p class="' +
                        clase + '">' + tarea.estado +
                        '</p><p class="' + clase + '">' +
                        "Inicio: " +
                        [date.getDate(), date.getMonth() + 1, date.getFullYear()].join("/") + '</p>' +

                    '</p><p class="' + clase + '">' +
                    "Prioridad: " + tarea.prioridad + '</p>';

                    if(tarea.vencimiento != undefined) {
                        html +=
                       '</p><p class="' + clase + '">' + "Vencimiento: " +
                        [fven.getDate(), fven.getMonth() + 1, fven.getFullYear()].join("/") +'</p>';
                    }


                    $('#pgEditarTarea .content fieldset').html(html);
                    // botón completar
                    html = tarea.estado == 'pendiente' ? '<a id="btCompletar"' +
                    'onclick="completarTarea(' + id + '); navAtras();" class="boton"' +
                    ' href="#">Completar</a>' : '';
                    // botón eliminar
                    html += '<a id="btEliminar" onclick="eliminarTarea(' + id + ')"'
                        + ' class="boton" href="#">Eliminar</a>';
                    $('#pgEditarTarea .footer').html(html);
                }
            }

            else {
                alert("Kenny couldn't be found in your database!");
            }
        };
    }
}

function dbPutItem(id) {
    if(db != undefined) {

        var objectStore = db.transaction(['objTareas'], "readwrite").objectStore('objTareas');
        var objectStoreIdRequest = objectStore.get(id);
        objectStoreIdRequest.onsuccess = function() {
            // Grab the data object returned as the result
            var tarea = objectStoreIdRequest.result;

            // Update the notified value in the object to "yes"
            tarea.estado = 'completada';

            // Create another request that inserts the item back into the database
            var updateIdRequest = objectStore.put(tarea);

            // Log the transaction that originated this request
            console.log("The transaction that originated this request is " + updateIdRequest.transaction);

            // When this new request succeeds, run the displayData() function again to update the display
            updateIdRequest.onsuccess = function () {

            };
        }
    }
}

function dbRegCount() {
    if(db != undefined){
        var transaction = db.transaction(['objTareas'], 'readonly');
        if(transaction != undefined){
            var objectStore = transaction.objectStore('objTareas');
        } else {
            return undefined;
        }
    return objectStore.count();
    } else {
        return undefined;
    }
}

function dbGetAllTareas() {

    if((db != undefined) && db != null) {

        var transaction = db.transaction(["objTareas"]);
        var objectStore = transaction.objectStore("objTareas");
        var request = objectStore.getAll();

        return request;

/*

        request.onerror = function(event) {
            alert("Unable to retrieve data from database!");
        };

        request.onsuccess = function(event) {
            if(request.result) {
                var tarea = request.result;

                if (!tarea) {
                    alert('No hay tareas');
                    return;
                }
            }

            else {
                alert("Anyone couldn't be found in your database!");
            }
        };
*/
    }
}

function dbRemoveTarea(id) {

    var request = db.transaction(["objTareas"], "readwrite")
        .objectStore("objTareas")
        .delete(id);

    request.onsuccess = function(event) {
        navAtras();
    };
}

$(document).ready(function () {
    login("9755b3f50b30dd0d20c5088de1987da1F173DD0995D764283F66D4EBD85B3187D582AFA1", "https://hst-api.wialon.com");
    //getToken();

    setInterval(function () {
        logout();
        //console.log("Actualizando las unidades: [" + new Date() + "]");
        //login($("#token").text(), "https://hst-api.wialon.com");
    }, 1 * 60 * 1000);
});

/* Variables globales */
    var conexion = null;
/* ------------------ */

////////////////////////////////////////////////////////////////////////////////////////////

/* Metodos para inicar y cerrar la sesion */
    function login(token, servidor) {
        console.log("Conexion establecida con exito con Wialon [" + new Date() + "]");
        conexion = wialon.core.Session.getInstance();
        conexion.initSession(servidor);

        //Hacemos el inicio de sesion con el token del usuario, hacemos una funcion de promesa en dado caso de ser exitos
        conexion.loginToken(token, "", function (code) {
            if (code) {
                getError(wialon.core.Errors.getErrorText(code));
                $("#text-online").text("Desconectado de Wialon Remote API");
                $("#btn-online").removeClass("btn-success").addClass("btn-danger");
            }
            $("#text-online").text("Conectado con Wialon Remote API");
            $("#btn-online").removeClass("btn-danger").addClass("btn-success");
            $("#user_Wialon").text(conexion.getAuthUser());
            //initMap();
            //init(conexion); // when login suceed then run init() function
            getUnits(conexion); // when login suceed then run init() function
        });
        return conexion;

    }

    function logout() {
        var user = conexion.getCurrUser();
        if (!user) {
            console.log("No se cerro conexion de manera correcta");
            return;
        }
        wialon.core.Session.getInstance().logout( // if user exist - logout
            function (code) { // logout callback
                if (code) {
                    console.log('logout: ' + wialon.core.Errors.getErrorText(code));
                }
                else //console.log("Sesion cerrada");
                    login("9755b3f50b30dd0d20c5088de1987da19F8DD3B8710427DC07765200B200CAD9741059B8", "https://hst-api.wialon.com");
                // refreshInfo( arrayobjetos );
                // login($("#token").text(), "https://hst-api.wialon.com");
            }
        );
    }
/* -------------------------------------- */

///////////////////////////////////////////////////////////////////////////////////////////

/* Metodos para obtener el token de Wialon */
    function getToken() {
        var dns = "http://rastreo.jornadadigitalgps.com/";

        // construct login page URL
        var url = dns + "/login.html";      // your site DNS + "/login.html"
        url += "?client_id=" + "App";	    // your application name
        url += "&access_type=" + 0xffff;	// access level, 0x100 = "Online tracking only"
        url += "&activation_time=" + 0;     // activation time, 0 = immediately; you can pass any UNIX time value
        url += "&duration=" + 604800;	    // duration, 604800 = one week in seconds
        url += "&flags=" + 0x1;			    // options, 0x1 = add username in response

        url += "&redirect_uri=" + dns + "/post_token.html"; // if login succeed - redirect to this page

        // listen message with token from login page window
        window.addEventListener("message", tokenRecieved);

        var ancho = screen.width;
        var alto = screen.height;
        // finally, open login page in new window
        window.open(url, "_blank", "width=" + ancho + ", height=" + alto + ", top=0, left=0");
    }

    function tokenRecieved(e) {
        var msg = e.data;
        if (typeof msg == "string" && msg.indexOf("access_token=") >= 0) {
            // get token
            var token = msg.replace("access_token=", "");
            // now we can use token, e.g show it on page
            document.getElementById("token").innerHTML = token;
            login(token, 'https://hst-api.wialon.com');
            document.getElementById("login").setAttribute("disabled", "");

            // or login to wialon using our token
            wialon.core.Session.getInstance().initSession("https://hst-api.wialon.com");

            wialon.core.Session.getInstance().loginToken(token, "", function (code) {
                if (code)
                    return;
                var user = wialon.core.Session.getInstance().getCurrUser().getName();
                //alert("Entrando con la cuenta de: " + user);

                $("#name_user_init").text(user);
                const toastLiveExample = document.getElementById('welcomeinit');
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
                toastBootstrap.show()
            });

            // remove "message" event listener
            window.removeEventListener("message", tokenRecieved);
        }
    }
/* -------------------------------------- */

///////////////////////////////////////////////////////////////////////////////////////////

/* Metodos para el manejo de visualizacion y atualizacion de campos personalizados */
    function getter_setter_field(idUnidad) {
        $("#campospersonalizados").html('');
        var unit = conexion.getItem(idUnidad);
        if (!unit) {
            getError('Unidad no encontrada');
        }
        var cp = unit.getCustomFields();

        for (const key in cp) {
            if (Object.hasOwnProperty.call(cp, key)) {
                const elemento = cp[key];
                $("#campospersonalizados").append(`
                <tr>
                    <td><input type="text" id="prop_id_${key}"  placeholder="ID" disabled="disabled" value="${elemento.id}"/></td>
                    <td><input type="text" id="prop_name_${key}" placeholder="Nombre" value="${elemento.n}"/></td>
                    <td><input type="text" id="prop_value_${key}" placeholder="Valor" value="${elemento.v}"/></td>
                    <td>
                        <button type="button" class="btn btn-primary" onclick="setProperties(${elemento.id},'${elemento.n}','${idUnidad}');">Actulizar</button>
                    </td>
                </tr>             
                `);
            }
        }
        $(".name_unit_modal").text(unit.getName());
        $("#modal-campospersonalizados").modal("show");
    }

    function setProperties(prop_id, name, idUnidad, value) {
        var cur_unit = conexion.getItem(idUnidad);
        var cur_prop = cur_unit.getCustomFields();
        value = (value == null || value == '') ? $('#prop_value_' + prop_id).val() : value    //var value = $('#prop_value_' + prop_id).val();

        cur_unit.updateCustomField({ id: prop_id, n: name, v: value });
        //alert('Se actualizo el campo: ' + name + ', con el valor: ' + value);
        alert('Se actualizaron los estados de las unidades');
    }

    function updateStatus() {

        if (conexion.getCurrUser().getName() == 'MONITOREO TICSA') {
            updateStatusFilsa();
        } else if (conexion.getCurrUser().getName() == 'MONITOREO GUZMAN') {
            updateStatusGuzman();
        } else {
            var flags = wialon.util.Number.or(
                wialon.item.Unit.dataFlag.lastMessage,
                wialon.item.Unit.dataFlag.sensors,
                wialon.item.Item.dataFlag.base,
                wialon.item.Item.dataFlag.customFields,
                wialon.item.Item.dataFlag.adminFields,
                wialon.item.Item.dataFlag.messages,
                wialon.item.Resource.dataFlag.notifications,
                wialon.item.Resource.dataFlag.reports
            );

            var spec = [
                { type: "type", data: "avl_unit", flags: flags, mode: 0 },
                { type: "type", data: "avl_resource", flags: flags, mode: 0 },
                { type: 'type', data: 'avl_unit_group', flags: flags, mode: 0 }
            ];

            conexion.loadLibrary("itemIcon"); // load Icon Library	
            conexion.loadLibrary("itemCustomFields");
            conexion.loadLibrary("unitSensors");
            conexion.loadLibrary("resourceReports");
            conexion.loadLibrary("resourceNotifications");
            conexion.loadLibrary("resourceReports");

            // Limpiar las tablas antes de agregar nuevas filas
            $(".status-table").empty();

            conexion.updateDataFlags(spec, function (code) {

                var units = conexion.getItems("avl_unit");
                for (var i = 0; i < units.length; i++) {
                    var u = units[i];
                    var pr = u.getCustomFields();
                    var estatus = null; // Inicializar estatus como null
                    var idProp = null;  // Inicializar el id prop
                    var namePrd = null; // Inicializar el name del campo pezonalizado

                    for (const key in pr) {
                        if (Object.hasOwnProperty.call(pr, key)) {
                            const elemento = pr[key];
                            if (elemento.n.match(/\b(?:status|estatus)\b/i)) {
                                estatus = (elemento.v !== "") ? elemento.v : null;
                                idProp = elemento.id;
                                namePrd = elemento.n;
                            }
                        }
                    }

                    if (estatus !== null && estatus !== undefined) {
                        if (estatus.match(/\b(?:vacio)\b/i)) {
                            $("#TABLE_VACIO").append(`
                            <tr class="draggable">
                                <td> <img class="icon mr-2" src="${u.getIconUrl(32)}" alt="icon"/> ${u.getName()} || ${estatus} <span class="invisible" >||${idProp}||${u.getId()}||VACIO||${namePrd}</span></td>
                            </tr>
                        `);
                        } else if (estatus.match(/\b(?:carga|ESPERA_CARGA)\b/i)) {
                            $("#TABLE_ESPERA_CARGA").append(`
                            <tr class="draggable">
                                <td> <img class="icon mr-2" src="${u.getIconUrl(32)}" alt="icon"/> ${u.getName()} || ${estatus} <span class="invisible" >||${idProp}||${u.getId()}||ESPERA_CARGA||${namePrd}</span></td>
                            </tr>
                        `);
                        } else if (estatus.match(/\b(?:cargado)\b/i)) {
                            $("#TABLE_CARGADO").append(`
                            <tr class="draggable">
                                <td> <img class="icon mr-2" src="${u.getIconUrl(32)}" alt="icon"/> ${u.getName()} || ${estatus} <span class="invisible" >||${idProp}||${u.getId()}||CARGADO||${namePrd}</span></td>
                            </tr>
                        `);
                        } else if (estatus.match(/\b(?:descarga|ESPERA_DESCARGA)\b/i)) {
                            $("#TABLE_ESPERA_DESCARGA").append(`
                            <tr class="draggable">
                                <td> <img class="icon mr-2" src="${u.getIconUrl(32)}" alt="icon"/> ${u.getName()} || ${estatus} <span class="invisible" >||${idProp}||${u.getId()}||ESPERA_DESCARGA||${namePrd}</span></td>
                            </tr>
                        `);
                        }
                    } else {
                        console.warn("estatus is null or undefined");
                    }
                }
            })


            // Mostrar el modal después de agregar todas las filas
            $("#modal-estatus").modal("show");

            initTable('table-status-units');

            // Destruir las instancias de DataTables existentes si ya están inicializadas
            // if ($.fn.DataTable.isDataTable('.mytable2')) {
            //     $('.mytable2').DataTable().destroy();
            // }

            // // Inicializar DataTables
            // $(".mytable2").DataTable({
            //     scrollY: '500',
            //     language: {
            //         info: "Mostrando página _PAGE_ de _PAGES_",
            //         infoEmpty: "No hay registros disponibles",
            //         lengthMenu: "",
            //         loadingRecords: "Cargando...",
            //         processing: "Procesando...",
            //         search: "Buscar",
            //     },
            //     pageLength: 100,
            // });
        }
    }

    function saveStatus() {
        var tableIds = ['VACIO', 'CARGADO', 'ESPERA_CARGA', 'ESPERA_DESCARGA'];
        var allRowsData = [];
        //login($("#token").text(), "https://hst-api.wialon.com");

        tableIds.forEach(function (tableId) {
            //console.log('saveEstatis')
            //Recorremos la tabla
            $("#" + tableId + ' tbody tr').each(function () {
                $(this).find('td').each(function () {
                    var cellContent = $(this).text();
                    var parts = cellContent.split('||');
                    console.log(parts);
                    // if (parts[4].trim() != tableId) {
                    //     if (parts.length === 6) {
                    //         //console.log(`Contenido de la tabla ${tableId}:`);
                    //         var rowObject = {
                    //             nombre: parts[0].trim(), //Nombre de la unidad
                    //             value: tableId + "  " + getNewDate(), //Nuevo valor del campo personalizado status
                    //             prop_id: parts[2].trim(), //EL id del campo personalizado
                    //             idUnidad: parts[3].trim(), //Id de la unidad
                    //             estatus: parts[4].trim(), //Status small
                    //             namePrd: parts[5].trim() //Nombre del campo personalizado
                    //         };
                    //         //console.log(rowObject);
                    //         allRowsData.push(rowObject);
                    //         setProperties(rowObject.prop_id, rowObject.namePrd, rowObject.idUnidad, rowObject.value);
                    //     } else {
                    //         console.warn(`Formato incorrecto en la celda: ${cellContent}`);
                    //     }
                    // }
                    // else {
                    //     //console.log('Sin cambios');
                    // }
                });
            });
        });
        alert('Cambios guardados');
    }
/*-------------------------------------------------------------------------------- */

////////////////////////////////////////////////////////////////////////////////////////////

/* Metodos para ver y atender notificaciones */
    function viewNotifications() {
        // Mostrar el modal después de agregar todas las filas
        $("#modal-notificaciones").modal("show");
    }

    function getNotifi() {
        var flags = wialon.item.Item.dataFlag.base | wialon.item.Resource.dataFlag.base | wialon.item.Item.dataFlag.messages | wialon.item.Resource.dataFlag.notifications;
        conexion.updateDataFlags(
            [{ type: "type", data: "avl_resource", flags: flags, mode: 1 }],
            function (code) {
                if (code) {
                    console.log(wialon.core.Errors.getErrorText(code));
                    return;
                }

                var res = conexion.getItems("avl_resource");
                for (var i = 0; i < res.length; i++) { // construct Select list using found resources		
                    //addEvent(res[i].getId()); // add event to any resource object
                    res[i].addListener("messageRegistered", showData); // register event when we will receive message
                }
            });
    }

    function showData(event) {
        var data = event.getData(); // get data from event
        var cont = parseInt($("#cont_notifi").text());
        var name_user = conexion.getCurrUser().getName();

        //if( $("#"+cont-1).text() === data.txt )
        if (data.tp && data.tp == "unm") {
            var unit = conexion.getItem(data.unit);
            $("#notifi").prepend(`
            <div class="alert alert-dark alert-dismissible fade show" id="${cont}" role="alert">
                <div class="unidad d-flex align-items-center">
                    <h5 class="mb-0">
                    <span class="badge rounded-pill text-bg-light">${cont + 1}</span>
                    <img src="${unit.getIconUrl(32)}" class="rounded me-2" alt="">
                    <strong>${unit.getName()}</strong>
                    <button type="button" class="btn-close btn-remove-alert-notificacion" data-bs-dismiss="alert" id="" aria-label="Close"></button>
                    </h5> 
                    <h4 class="ml-2 ms-auto p-2" >${data.name}</h4>
                </div>
                <hr>
                <span >${data.txt}</span>
                <hr>
                <button type="button" class="btn btn-danger btn-sm " onclick="showMapNotifi(${data.x}, ${data.y});" >
                    Ver ubicacion
                </button>
                <button type="button" class="btn btn-danger btn-sm " onclick="setNotificacion( ${cont}, '${unit.getName()}', '${data.t}', '${name_user}' );" >
                    Atender
                </button>
                <br>           
            </div>
            `);

            $("#liveToast").html(`
                <div class="toast-header" >
                    <img src="${unit.getIconUrl(32)}" class="rounded me-2" alt="">
                    <strong class="text-break">${unit.getName()} — ${data.name}</strong>
                </div>
                <div class="toast-body" id="cuerpo-notificacion">
                    
                </div>
            `);

            //Para mostrar la notificacion en la parte superior de la pantalla
            $(".cont-notifiaciones").text(cont + 1);
            const toastLiveExample = document.getElementById('liveToast')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
            toastBootstrap.show()
            //console.log(data.name + " - " + data.txt + " - " + data.t);

            //Sonido de notificacion
            var audio = new Audio('./mp3/livechat-129007.mp3.');
            audio.play();

            //axios
            const datos = {
                name_user: name_user,
                name_unidad: unit.getName(),
                name_alert: data.name,
                txt: data.txt,
                timestamp: data.t,
                latitud: data.y,
                longitud: data.x,
                monitorista: $("#getmonitorista").text()
            };

            axios.post('./php/insert_Notificaciones.php', datos)
                .then(response => {
                    //console.log('Success:', response.data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }
/* ------------------------------------- */

////////////////////////////////////////////////////////////////////////////////////////////

/* Metodos para ver los ultimos 100 mensajes de la unidad */
    function getMensajes(idUnidad) {
        $("#messages").append(``);
        $("#modal-ultimosmensajes").modal("show");
        var to = conexion.getServerTime();
        var from = to - 3600 * 24;

        var ml = conexion.getMessagesLoader();
        ml.loadInterval(idUnidad, from, to, 0, 0, 100,
            function (code, data) {
                if (code) {
                    getError(wialon.core.Errors.getErrorText(code));
                    return;
                } else {
                    ml.getMessages(0, 100, function (code, data) {
                        if (code) {
                            getError(wialon.core.Errors.getErrorText(code));
                            return;
                        }
                        else if (data.length == 0) {
                            getError("Nothing to show. Load messages first");
                            return;
                        }
                        var from_index = from;
                        for (var i = 0; i < data.length; i++) {
                            $("#messages").append( // append current message row to result table
                                "<tr" + (i % 2 == 1 ? " class='odd' " : "") + "><td>" + (from_index++) + "</td>" +
                                // print Json data of current message
                                "<td>" + wialon.util.Json.stringify(data[i]) + "</td></tr>"
                            );
                        }
                    }
                    );
                }
            }
        );
    }
/* ------------------------------------------------------ */

////////////////////////////////////////////////////////////////////////////////////////////

/*Metodos para ver los valores de los sencores */
    function getSensores(idUnidad) {
        $("#sensores_modal").html(``);
        $("#modal-sensores").modal("show");
        unit = conexion.getItem(idUnidad);
        sensores = unit.getSensors(); //console.log( sensores );
        lastMensajes = unit.getLastMessage();

        for (metadatos in sensores) {
            var valor = (unit.calculateSensorValue(unit.getSensor(sensores[metadatos].id), lastMensajes) == -348201.3876) ? 'N/A' : unit.calculateSensorValue(unit.getSensor(sensores[metadatos].id), lastMensajes);
            //console.log( `${metadatos} => ${sensores[metadatos].n}: ${valor}` );
            //$("#sensores_modal").append(`${metadatos} => ${sensores[metadatos].n}: ${valor}`);
            $("#sensores_modal").append(`
            <div class="alert alert-dark alert-dismissible fade show" role="alert">
                    ${metadatos} => ${sensores[metadatos].n}: ${valor}
            </div>
            `);
        }
    }
/* ------------------------------------------ */

///////////////////////////////////////////////////////////////////////////////////////////

/* Metodos de utileria */
    function getNewDate() {
        // Crear una nueva instancia de Date
        let fecha = new Date();

        // Obtener el día, el mes y el año
        let dia = fecha.getDate();
        let mes = fecha.getMonth() + 1; // Los meses van de 0 a 11, por eso sumamos 1
        let año = fecha.getFullYear();

        // Asegurarse de que el día y el mes tengan dos dígitos
        if (dia < 10) dia = '0' + dia;
        if (mes < 10) mes = '0' + mes;

        // Obtener los últimos dos dígitos del año
        let añoCorto = año.toString().slice(-2);

        // Formatear la fecha en formato corto (DD/MM/YY)
        let fechaCorta = `${dia}/${mes}/${añoCorto}`;

        return fechaCorta;
    }

    function getError(mensaje) {
        console.log(mensaje);
        return;
    }

    function initTable(id) {
        table = '.' + id;
        if ($.fn.DataTable.isDataTable(table)) {
            $(table).DataTable().destroy();
        }
    
        // Inicializar DataTables
        $(table).DataTable({
            scrollY: '500',
            language: {
                info: "Mostrando página _PAGE_ de _PAGES_",
                infoEmpty: "No hay registros disponibles",
                lengthMenu: "",
                loadingRecords: "Cargando...",
                processing: "Procesando...",
                search: "Buscar",
            },
            pageLength: 100,
        });
    
    }
/*-------------------- */

//////////////////////////////////////////////////////////////////////////////////////////

/* Metodos para atender notificaciones */
    function setNotificacion(id, unidad, timestamp, name_user) {
        //axios
        const datos = {
            name_unidad: unidad,
            timestamp: timestamp,
            atendida: true,
            new_timestamp: new Date().getTime(),
            name_user: name_user,
            monitorista: $("#getmonitorista").text()
        };
        $("#name_unit_notifi_atendida").text(unidad);
        const toastLiveExample = document.getElementById('NotificacionAtendida')
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        $("#" + id).remove();
        $("#cont-notifiaciones").text(parseInt($("#cont-notifiaciones").text()) - 1);

        axios.post('./php/setMonitoreo.php', datos)
            .then(response => {
                //console.log('Success:', response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
/* ----------------------------------- */

///////////////////////////////////////////////////////////////////////////////////////

/*CODIGO NUEVO */

/* Variable globales */
    var units, resources, unit_groups, arrayobjetos = {}, gruposUnidades ={};
/* ---------------- */

//////////////////////////////////////////////////////////////////////////////////////

/* Metodo para obtener la informacion de las unidades */
    function getUnits(conexion) {

        $(".cont").text('0');
        $(".btn-danger").removeClass( 'alert-btn' );
        $(".btn-danger").removeClass( 'btn-danger' );

        var flags = wialon.util.Number.or(
            wialon.item.Unit.dataFlag.lastMessage,
            wialon.item.Unit.dataFlag.sensors,
            wialon.item.Item.dataFlag.base,
            wialon.item.Item.dataFlag.customFields,
            wialon.item.Item.dataFlag.adminFields,
            wialon.item.Item.dataFlag.messages,
            wialon.item.Resource.dataFlag.notifications,
            wialon.item.Resource.dataFlag.reports
        );

        var spec = [
            { type: "type", data: "avl_unit", flags: flags, mode: 0 },
            { type: "type", data: "avl_resource", flags: flags, mode: 0 },
            { type: 'type', data: 'avl_unit_group', flags: flags, mode: 0 }
        ];

        conexion.loadLibrary("itemIcon"); // load Icon Library	
        conexion.loadLibrary("itemCustomFields");
        conexion.loadLibrary("unitSensors");
        conexion.loadLibrary("resourceReports");
        conexion.loadLibrary("resourceNotifications");
        conexion.loadLibrary("resourceReports");

        conexion.updateDataFlags(spec, function (code) {
            if (code) {
                getError(wialon.core.Errors.getErrorText(code));
            }

            /* Notificaciones */
                getNotifi();
            /*-------------- */

            units = conexion.getItems("avl_unit"); //console.log(units)
            resources = conexion.getItems("avl_resource"); //console.log(resources)
            unit_groups = conexion.getItems('avl_unit_group'); //console.log(unit_groups);   

            for (let i = 0; i < units.length; i++) {
                const u = units[i]

                /*Construimos el objeto principal*/
                objeto = {
                    info: getInfo(u, unit_groups),
                    sensores: getSensores(u),
                    personalizados: getPersonalizados(u),
                    gps: getGPS(u),
                }
                /* ---------------------------- */
                arrayobjetos[objeto.info.nameUnit] = objeto;
            }
            /* Actualiza los numero */
                //refreshInfo2(arrayobjetos); //console.log(arrayobjetos);
                getUnitsBYGroup( unit_groups );
            /*----------------------*/
        });
    }

    function getUnitsBYGroup(grupos) {
        //console.log(grupos);
        const gruposInteres = ['01-CARGAS MEXICO', '03-POLLO VIVO', '04-CONGELADO', '05-FRESCO', '06-PARA MONITOREO', 'HRH CAJAS', 'HRH GENERAL', 'HRH SEGURIDAD', '00-DIFEYRO', 'CAJAS DIFEYRO', 'DIFEYRO SEGURIDAD', '02-CARGAS FORANEAS', '07-CARGAS TYSON', '08-HRH CAJAS PILGRIMS'];
        for (const group of grupos) {
            //console.log( group.$$user_name );
            const nameGroup = group.$$user_name; //console.log( nameGroup + " - " + group.$$user_units.length );
            if (gruposInteres.includes(nameGroup)) {
                $("#"+nameGroup.replace(/ /g, "_")).text(group.$$user_units.length);
                const grupos = {};
                for (let i = 0; i < group.$$user_units.length; i++) {
                    const units = group.$$user_units[i]; //console.log( nameGroup  +" - "+ i );
                    const unit = conexion.getItem(units); //console.log(unit.getName());

                    objeto = {
                        info: getInfo(unit),
                        sensores: getSensores(unit),
                        personalizados: getPersonalizados(unit),
                        gps: getGPS(unit),
                    }

                    grupos[unit.getName()] = objeto;
                }
                gruposUnidades[nameGroup] = grupos;
            }
        }
        refreshInfo2(gruposUnidades); console.log(gruposUnidades);
    }
/* -------------------------------------------------- */

/////////////////////////////////////////////////////////////////////////////////////////

/* METODOS PARA ACTUALIZAR EL COMPARTAMIENTO DE LA CLASE */
    function getInfo(unidad, grupos) {
        const metadatos = {
            nameUnit: unidad.getName(),
            idUnit: unidad.getId(),
            icon: unidad.getIconUrl(32),
        };

        metadatos.group = 'N/D';

        for (const group of grupos) {
            // Verifica si el ID de `unidad` está en el array de `$$user_units`
            if (group.$$user_units.includes(unidad.getId())) {
                metadatos.group = group.$$user_name.replace(/ /g, "_"); //console.log("cont-"+objeto.info.group+"-"+objeto.sensores.State);.log(group.$$user_name.replace(/ /g, "_"));
                metadatos[group.$$user_name] = group.$$user_name.replace(/ /g, "_"); //console.log("cont-"+objeto.info.group+"-"+objeto.sensores.State);.log(group.$$user_name.replace(/ /g, "_"));
                break;
            }
        }

        return metadatos;

        // unit_groups.forEach(group => {
        //     console.log(group.$$user_name);
        //     console.log(group.$$user_units);
        // });
    }

    function getInfo(unidad) {
        
        const metadatos = {
            nameUnit: unidad.getName(),
            idUnit: unidad.getId(),
            icon: unidad.getIconUrl(32),         
        };

        return metadatos;
    }

    function getSensores(unidad) {
        const sensores = unidad.getSensors(); //console.log(unidad.getName()); console.log(sensores)
        const lastMensajes = unidad.getLastMessage();

        const metadatos = {
            nameUnit: unidad.getName(),
            ignicion: 0,
            velocidad: 0,
        };

        //PARA DETERMINAR SI ESTA APAGADO, RALENTI, MOVIMIENTO = (VELOCIDAD -- IGNICION)
        for (const key in sensores) {
            if (Object.hasOwnProperty.call(sensores, key)) {
                const sensor = sensores[key];
                if (sensor.n == "IGNICION") {
                    var valor = unidad.calculateSensorValue(unidad.getSensor(sensor.id), lastMensajes);
                    if (valor == -348201.3876) {
                        valor = "N/A";
                    }
                    metadatos.ignicion = valor;
                }
                if (sensor.n == "VELOCIDAD") {
                    var valor = unidad.calculateSensorValue(unidad.getSensor(sensor.id), lastMensajes);
                    if (valor == -348201.3876) {
                        valor = "N/A";
                    }
                    metadatos.velocidad = valor;
                }
                if (sensor.n == "BATERIA DE RESERVA GPS") {
                    var valor = unidad.calculateSensorValue(unidad.getSensor(sensor.id), lastMensajes);
                    if (valor == -348201.3876) {
                        valor = "N/A";
                    }
                    metadatos.bateria = valor;
                }
                if (sensor.n == "VOLTAJE EXTERNO") {
                    var valor = unidad.calculateSensorValue(unidad.getSensor(sensor.id), lastMensajes);
                    if (valor == -348201.3876) {
                        valor = "N/A";
                    }
                    metadatos.voltaje = valor;
                }
            }
        }
        getStateunit(metadatos)
        return metadatos; //console.log(metadatos);
    }

    function getPersonalizados(unidad) {
        const personalizados = unidad.getCustomFields();

        const metadatos = {
            id: unidad.getId(),
            nameUnit: unidad.getName(),
            icon: unidad.getIconUrl(32),
        }

        for (const key in personalizados) {
            if (Object.hasOwnProperty.call(personalizados, key)) {
                const personalizado = personalizados[key];
                // console.log(personalizado.n + " - " + personalizado.v);
                if (personalizado.n.match(/\d+[.\- ]+STATUS/g)) {
                    metadatos.status = personalizado.v;
                } else if (personalizado.n.match(/\d+[.\- ]+ORIGEN/g)) {
                    metadatos.origen = personalizado.v;
                } else if (personalizado.n.match(/\d+[.\- ]+DESTINO/g)) {
                    metadatos.destino = personalizado.v;
                } else {
                    metadatos[personalizado.n] = personalizado.v;
                }
            }
        }
        return metadatos; //console.log(metadatos);
    }

    function getGPS(unidad) {
        const metadatosGPS = unidad.getPosition();

        const metadatos = {
            nameUnit: unidad.getName(),
            time: (wialon.util.DateTime.formatTime(metadatosGPS.t) !== '') ? wialon.util.DateTime.formatTime(metadatosGPS.t) : 0,
            velocidad: metadatosGPS.s,
            latitud: metadatosGPS.x,
            longitud: metadatosGPS.y,
            mapsUrlembed: 'https://maps.google.com/maps?q=' + metadatosGPS.y + ',' + metadatosGPS.x + '&output=embed',
            mapsUrlUri: 'https://www.google.com/maps?q=' + metadatosGPS.y + ',' + metadatosGPS.x, // Enlace tradicional de Google Maps
        }
        // Mandamos llamar al metodo que determinara el estado de la conexion de la unidas (online, offline, outside)
        getStateconection(metadatos);
        return metadatos //console.log(metadatos);        
    }
/* ----------------------------------------------------- */

///////////////////////////////////////////////////////////////////////////////////////

/*Metodo para la construccion del html */
    // function refreshInfo(arrayobjetos) {
    //     const grupos = ['01-CARGAS_MEXICO', '03-POLLO_VIVO', '04-CONGELADO', '05-FRESCO', '06-PARA_MONITOREO', 'HRH_CAJAS', 'HRH_GENERAL', 'HRH_SEGURIDAD', 'DIFEYRO', 'CAJAS_DIFEYRO', 'DIFEYRO_SEGURIDAD', '06-HRH_CARGAS_FORÁNEAS'];

    //     for (const key in arrayobjetos) {
    //         if (arrayobjetos.hasOwnProperty(key)) {
    //             const objeto = arrayobjetos[key];
    //             if (grupos.includes(objeto.info.group)) {
    //                 console.log("cont-"+objeto.info.group+"-"+objeto.sensores.State);
    //                 $("#cont-" + objeto.info.group + "-" + objeto.sensores.State).text(parseInt($("#cont-" + objeto.info.group + "-" + objeto.sensores.State).text()) + 1);                    
    //             }
    //         }
    //     }
    // }

    function refreshInfo2(Arraygrupos) {
        var cont = 0;
        for (const key_grupo in Arraygrupos) { //console.log(key_grupo);            
            if (Arraygrupos.hasOwnProperty(key_grupo)) {
                const grupo = Arraygrupos[key_grupo]; 
                for( const key in grupo  ){ //console.log(key);
                    // console.log( cont++ );
                    const unit = grupo[key]; //console.log( unit );
                    //console.log("cont-"+key_grupo.replace(/ /g, "_")+"-"+unit.sensores.State);
                    $("#cont-"+key_grupo.replace(/ /g, "_")+"-"+unit.sensores.State).text(parseInt($("#cont-"+key_grupo.replace(/ /g, "_")+"-"+unit.sensores.State).text()) + 1);                    

                    if(unit.sensores.State == 'sinconexion'){
                        $("#btn-"+key_grupo.replace(/ /g, "_")+"-"+unit.sensores.State).addClass( 'alert-btn' );
                        $("#btn-"+key_grupo.replace(/ /g, "_")+"-"+unit.sensores.State).addClass( 'btn-danger' );
                    }
                }
            }
        }
    }
    

    // function getInfoUnits(grupo, estado) {
    //     $("#table-tbody").empty();
    //     //console.log(arrayobjetos);
    //     for (const key in arrayobjetos) {
    //         if (arrayobjetos.hasOwnProperty(key)) {
    //             const objeto = arrayobjetos[key];
    //             if (objeto.info.group === grupo) {
    //                 // console.log( objeto.info.nameUnit );
    //                 // console.log( objeto.sensores.State );
    //                 const html = `<tr><td>
    //                         <div class="toast fade show w-100" role="alert" aria-live="assertive" aria-atomic="true">
    //                             <div class="toast-header">
    //                                 <img class='icon' src='${objeto.info.icon}' alt='icon'/>
    //                                 <strong class="me-auto">
    //                                     <button type="button" class="btn btn-secondary btn-sm " onClick="getSelectedUnitInfo(${objeto.info.id});" >
    //                                         ${objeto.info.nameUnit}
    //                                     </button>
    //                                 </strong>
    //                                 <small>Ult MSJ: ${objeto.gps.time}</small>
    //                             </div>
    //                             <div class="toast-body">      
    //                                 <div class="">
    //                                     <div class="row">
    //                                         <div class="col-12">
    //                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
    //                                                 <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
    //                                                 <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
    //                                             </svg> ${objeto.personalizados.cliente} |
    //                                             🏁${objeto.gps.velocidad}km/h | ${objeto.personalizados.equipo} |                                
    //                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightning-charge text-warning" viewBox="0 0 16 16">
    //                                                 <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41z"/>
    //                                             </svg> ${objeto.sensores.voltaje} Volts                    
    //                                         </div>
    //                                     </div>
    //                                     <div class="row">
    //                                         <div class="col-12">
    //                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-battery-charging" viewBox="0 0 16 16">
    //                                                 <path d="M9.585 2.568a.5.5 0 0 1 .226.58L8.677 6.832h1.99a.5.5 0 0 1 .364.843l-5.334 5.667a.5.5 0 0 1-.842-.49L5.99 9.167H4a.5.5 0 0 1-.364-.843l5.333-5.667a.5.5 0 0 1 .616-.09z"/>
    //                                                 <path d="M2 4h4.332l-.94 1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.38l-.308 1H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2"/>
    //                                                 <path d="M2 6h2.45L2.908 7.639A1.5 1.5 0 0 0 3.313 10H2zm8.595-2-.308 1H12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9.276l-.942 1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
    //                                                     <path d="M12 10h-1.783l1.542-1.639q.146-.156.241-.34zm0-3.354V6h-.646a1.5 1.5 0 0 1 .646.646M16 8a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8"/>
    //                                             </svg> ${objeto.sensores.bateria} % |
    //                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ev-front" viewBox="0 0 16 16">
    //                                                 <path d="M9.354 4.243a.19.19 0 0 0-.085-.218.186.186 0 0 0-.23.034L6.051 7.246a.188.188 0 0 0 .136.316h1.241l-.673 2.195a.19.19 0 0 0 .085.218c.075.043.17.03.23-.034l2.88-3.187a.188.188 0 0 0-.137-.316H8.572z"/>
    //                                                 <path d="M4.819 2A2.5 2.5 0 0 0 2.52 3.515l-.792 1.848a.8.8 0 0 1-.38.404c-.5.25-.855.715-.965 1.262L.05 8.708a2.5 2.5 0 0 0-.049.49v.413c0 .814.39 1.543 1 1.997V13.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1.338c1.292.048 2.745.088 4 .088s2.708-.04 4-.088V13.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1.892c.61-.454 1-1.183 1-1.997v-.413q0-.248-.049-.49l-.335-1.68a1.8 1.8 0 0 0-.964-1.261.8.8 0 0 1-.381-.404l-.792-1.848A2.5 2.5 0 0 0 11.181 2H4.82ZM3.44 3.91A1.5 1.5 0 0 1 4.82 3h6.362a1.5 1.5 0 0 1 1.379.91l.792 1.847a1.8 1.8 0 0 0 .853.904c.222.112.381.32.43.564l.336 1.679q.03.146.029.294v.413a1.48 1.48 0 0 1-1.408 1.484c-1.555.07-3.786.155-5.592.155s-4.037-.084-5.592-.155A1.48 1.48 0 0 1 1 9.611v-.413q0-.148.03-.294l.335-1.68a.8.8 0 0 1 .43-.563c.383-.19.685-.511.853-.904z"/>
    //                                             </svg> ${(objeto.sensores.ignicion == 1) ? "Encendido" : "Apagado"} |
    //                                             ${objeto.personalizados.status}
    //                                         </div>                
    //                                     </div>
    //                                 </div>          
    //                             </div>
    //                         </div>
    //                     </td>/td></tr>`;

    //                 //console.log( objeto.sensores.State + "-" + estado );
    //                 if (objeto.sensores.State === estado) {
    //                     $("#table-tbody").append(html);
    //                 }
    //             }
    //         }
    //     }
    // }

    function getInfoUnits2(grupo, estado, id) {
        $("#table-tbody").empty();

        $("#"+id).removeClass('alert-btn');
        $("#"+id).removeClass('btn-danger');
        console.log(arrayobjetos);
        for (const key_grupo in gruposUnidades) {
            if (gruposUnidades.hasOwnProperty(key_grupo)) { //console.log(key_grupo);
                const elemento = gruposUnidades[key_grupo]; //console.log(elemento);
                for( const key_unit in elemento ){ //console.log(key_grupo);
                    const objeto = elemento[key_unit]; //console.log(objeto);
                    const html =    `<tr><td>
                            <div class="toast fade show w-100" role="alert" aria-live="assertive" aria-atomic="true">
                                <div class="toast-header">
                                    <img class='icon' src='${objeto.info.icon}' alt='icon'/>
                                    <strong class="me-auto">
                                        <button type="button" class="btn btn-secondary btn-sm " onClick="getSelectedUnitInfo(${objeto.info.idUnit});" >
                                            ${objeto.info.nameUnit}
                                        </button>
                                    </strong>
                                    <small>Ult MSJ: ${objeto.gps.time}</small>
                                </div>
                                <div class="toast-body">      
                                    <div class="">
                                        <div class="row">
                                            <div class="col-12">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                                </svg> ${objeto.personalizados?.cliente ?? 'HRH'} |
                                                🏁${objeto.gps.velocidad}km/h | ${objeto.personalizados.equipo} |                                
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightning-charge text-warning" viewBox="0 0 16 16">
                                                    <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41z"/>
                                                </svg> ${Math.round(objeto.sensores.voltaje)} Volts                    
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-12">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-battery-charging" viewBox="0 0 16 16">
                                                    <path d="M9.585 2.568a.5.5 0 0 1 .226.58L8.677 6.832h1.99a.5.5 0 0 1 .364.843l-5.334 5.667a.5.5 0 0 1-.842-.49L5.99 9.167H4a.5.5 0 0 1-.364-.843l5.333-5.667a.5.5 0 0 1 .616-.09z"/>
                                                    <path d="M2 4h4.332l-.94 1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.38l-.308 1H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2"/>
                                                    <path d="M2 6h2.45L2.908 7.639A1.5 1.5 0 0 0 3.313 10H2zm8.595-2-.308 1H12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9.276l-.942 1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                                                        <path d="M12 10h-1.783l1.542-1.639q.146-.156.241-.34zm0-3.354V6h-.646a1.5 1.5 0 0 1 .646.646M16 8a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8"/>
                                                </svg> ${Math.round(objeto.sensores?.bateria?? '100')} % |
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ev-front" viewBox="0 0 16 16">
                                                    <path d="M9.354 4.243a.19.19 0 0 0-.085-.218.186.186 0 0 0-.23.034L6.051 7.246a.188.188 0 0 0 .136.316h1.241l-.673 2.195a.19.19 0 0 0 .085.218c.075.043.17.03.23-.034l2.88-3.187a.188.188 0 0 0-.137-.316H8.572z"/>
                                                    <path d="M4.819 2A2.5 2.5 0 0 0 2.52 3.515l-.792 1.848a.8.8 0 0 1-.38.404c-.5.25-.855.715-.965 1.262L.05 8.708a2.5 2.5 0 0 0-.049.49v.413c0 .814.39 1.543 1 1.997V13.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1.338c1.292.048 2.745.088 4 .088s2.708-.04 4-.088V13.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1.892c.61-.454 1-1.183 1-1.997v-.413q0-.248-.049-.49l-.335-1.68a1.8 1.8 0 0 0-.964-1.261.8.8 0 0 1-.381-.404l-.792-1.848A2.5 2.5 0 0 0 11.181 2H4.82ZM3.44 3.91A1.5 1.5 0 0 1 4.82 3h6.362a1.5 1.5 0 0 1 1.379.91l.792 1.847a1.8 1.8 0 0 0 .853.904c.222.112.381.32.43.564l.336 1.679q.03.146.029.294v.413a1.48 1.48 0 0 1-1.408 1.484c-1.555.07-3.786.155-5.592.155s-4.037-.084-5.592-.155A1.48 1.48 0 0 1 1 9.611v-.413q0-.148.03-.294l.335-1.68a.8.8 0 0 1 .43-.563c.383-.19.685-.511.853-.904z"/>
                                                </svg> ${(objeto.sensores.ignicion == 1) ? "Encendido" : "Apagado"} |
                                                ${objeto.personalizados?.status?? ''}
                                            </div>                
                                        </div>
                                    </div>          
                                </div>
                            </div>
                                        </td>/td></tr>`;
                    if( key_grupo == grupo && objeto.sensores.State == estado  ){ //console.log(objeto);
                        $("#table-tbody").append(html);
                    }
                }
            }
        }
    }

    function getSelectedUnitInfo(id_unidad) {
        const unit = conexion.getItem(id_unidad);
        const pos = unit.getPosition();

        objeto = {
            info: getInfo(unit),
            sensores: getSensores(unit),
            personalizados: getPersonalizados(unit),
            gps: getGPS(unit),
        }
        //console.log(objeto);

        if (pos) {
            wialon.util.Gis.getLocations([{ lon: pos.x, lat: pos.y }], function (code, address) {
                if (code) {
                    getError(wialon.core.Errors.getErrorText(code));
                }
                $("#map").html(`
                        <iframe 
                            width="100%" height="100%" frameborder="0" style="border:0"
                            src="https://maps.google.com/maps?q=${objeto.gps.longitud},${objeto.gps.latitud}&output=embed" allowfullscreen>
                        </iframe>
                `);
                
                $("#table-info").html(`
                    <thead>
                            <tr>
                                <th scope="col"> <img src="${objeto.info.icon}" width="24" alt=""> </th>
                                <th scope="col">${objeto.info.nameUnit}</th>
                                <th scope="col"></th>
                                <th scope="col">
                                    <div class="btn-group dropup auto-ms" role="group">
                                        <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                            Opciones
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li>
                                                <button type="button" class="dropdown-item " id="btn-campospers" onclick="getter_setter_field(${objeto.personalizados.id})">
                                                    Campos personalizados
                                                </button>                            
                                            </li>
                                            <li>
                                                <button type="button" class="dropdown-item " id="btn-mapear" onclick="getSensores(${objeto.personalizados.id})">
                                                    Sensores
                                                </button>
                                            </li>
                                            <li>
                                                <button type="button" class="dropdown-item " id="btn-mapear" onclick="getRecorridoUnit(${objeto.personalizados.id})">
                                                    Mapear recorrido
                                                </button>
                                            </li>
                                            <li>
                                                <button type="button" class="dropdown-item " id="btn-mapear" onclick="getMensajes(${objeto.personalizados.id})">
                                                    Ultimos mensajes
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">Origen:</th>
                                <td colspan="4">${objeto.personalizados?.origen?? 'Error  de su campo personalizado' }</td>
                            </tr>
                            <tr>
                                <th scope="row">Destino:</th>
                                <td colspan="4">${objeto.personalizados?.destino?? 'Error de su campo personalizado' }</td>
                            </tr>
                            <tr>
                                <th scope="row">Estatus:</th>
                                <td colspan="4">${objeto.personalizados?.status?? 'Error  de su campo personalizado'}</td>
                            </tr>
                            <tr>
                                <th scope="row"></th>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                `);
            });
        } else {
            // position data not exists, print message
            getError('Error con la ubicacion de la unidad');
        }
    }
/* ---------------------------------- */

///////////////////////////////////////////////////////////////////////////////////////

/* Metodos para establecer el estado de la unidad */
    function getStateunit(vehicle) {
        if (vehicle.ignicion === 0) {
            return vehicle.State = 'apagadas' /*'movimiento'*/;
        } else if (vehicle.ignicion === 1 && vehicle.velocidad === 0) {
            return vehicle.State = 'ralenti' /*'movimiento'*/;
        } else if (vehicle.ignicion === 1 && vehicle.velocidad > 0) {
            return vehicle.State = 'movimiento';
        } else if( vehicle.ignicion == 'N/A' && vehicle.velocidad > 0  ){
            return vehicle.State = 'movimiento';
        } else if( vehicle.ignicion == 'N/A' && vehicle.velocidad == 0  ){
            return vehicle.State = 'apagadas';
        } 
        else {
            return vehicle.State = 'sinconexion';
        }
    }

    /* Metodos para establecer su estado de conexion */
    function getStateconection(vehicle) { //AGREGA STATE A GPS ( ONLINE, OFFLINE )
        const tiempo_actual = Date.now();
        const ultimo_mensaje = new Date(vehicle.time).getTime();
        const diferencia_tiempo = tiempo_actual - ultimo_mensaje;

        const online = 15 * 60 * 1000;
        const outside = 24 * 60 * 60 * 1000;

        if (diferencia_tiempo <= online) {
            return vehicle.State = 'Online';
        } else if (diferencia_tiempo > online && diferencia_tiempo <= outside) {
            return vehicle.State = 'Offline';
        } else if (diferencia_tiempo > outside) {
            return vehicle.State = 'Offline';
        } else {
            return vehicle.State = 'Offline';
        }
    }

    function getState(objeto) { //AGREGA STATE A SENSORES ( SINCONEXION, APAGADAS, RALENTI, MOVIMIENTO )
        if (objeto.gps.State == 'Online') {
            if (objeto.sensores.State == 'apagadas') {
                return objeto.sensores.State; /*'movimiento'*/;
            } else if (objeto.sensores.State == 'ralenti') {
                return objeto.sensores.State /*'movimiento'*/;
            } else if (objeto.sensores.State == 'movimiento') {
                return objeto.sensores.State;
            }
        } else if (objeto.gps.State == 'Offline') {
            return objeto.sensores.State = 'sinconexion';
        } else if (objeto.gps.State == 'Offline') {
            return 'sinconexion';
        }
    }
/* --------------------------------------------- */

/////////////////////////////////////////////////////////////////////////////////////////

/* OJO Revisar OJO */
function replaceText() {
    // Obtiene el HTML del contenedor
    var container = document.querySelector('.col-12.d-flex.justify-content-between.align-items-center.border.p-3');

    // Reemplaza las ocurrencias en el HTML
    container.innerHTML = container.innerHTML.replace(/01-CARGAS MEXICO/g, '03-POLLO VIVO');
}

// Llama a la función
//replaceText();
/*-------------- */
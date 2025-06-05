// import { removeClass } from "../utils/utils.js";
import { env } from "../config.js";

export function createHTML_PanelbyStatus(data) {
    let objeto = {};
    for (const key in data) {
        const _state = data[key];
        const _units_online = _state;
        objeto[key] = getStateOnline(_units_online); // Crea un objeto con las unidades online por estatus
    }
    return objeto;
}

export function create_button_module(data, id_tag, filter) {
    $(id_tag).empty();
    for (const titulo in data) {
        if (Object.keys(filter).includes(titulo)) {

            const _titulo = filter[titulo];
            const _status_remove = (env.grupoInteres_modules[_titulo]) ? env.grupoInteres_modules[_titulo] : [];
            const _data = data[titulo];             
            const contApagadas = Object.keys(_data.apagadas).length;
            const contRalenti = Object.keys(_data.ralenti).length;
            const contMovimiento = Object.keys(_data.movimiento).length;
            const contSinConexion = Object.keys(_data.sinconexion).length;
            const contWarning = Object.keys(_data.warning).length;
            const contGeneral = contApagadas + contRalenti + contMovimiento + contSinConexion + contWarning;
            
            $(id_tag).append(`<!-- Grupo -->
                <div class="toast fade show w-100 " role="alert" aria-live="assertive" aria-atomic="true" id="${_titulo.replaceAll(" ", "_")}">
                    <div class="toast-header text-bg-ligth ${/*text-bg-${env.bootstrap[_titulo]}*/ ""}">
                        ${env.img[_titulo] ? `<img class='img-fluid' src='${env.img[_titulo]}' alt='icon' width="25" id="img-${_titulo.replaceAll(" ", "_")}"/>` : ""}
                        <button class="btn btn-light" onclick="getInfoUnits('${titulo}', 'general')">
                            <strong class="font-monospace me-auto fs-5 btn">
                                ${_titulo} 
                                <span class="badge bg-dark fs-6" id="${titulo}">${contGeneral}</span>
                            </strong>
                        </button>
                        <small class="text-muted">
                            <button type="button" 
                                class="btn btn-warning p-1 ${ ( _status_remove.includes('ralenti')) ? 'd-none' : '' } " onclick="getInfoUnits('${titulo}', 'ralenti');">
                                <span class="font- d-none d-xl-inline fs-6">Ralenti</span>  
                                <i class="bi bi-bootstrap-reboot d-xl-none"></i>
                                <span class="badge text-bg-secondary cont" id="cont-${titulo}-ralenti">${contRalenti}</span>
                            </button>
                            <button type="button" 
                                class="btn btn-primary p-1 ${ ( _status_remove.includes('apagadas')) ? 'd-none' : '' } " onclick="getInfoUnits('${titulo}', 'apagadas')">
                                <span class="font- d-none d-xl-inline fs-6">Apagadas</span>  
                                <i class="bi bi-power d-xl-none"></i>
                                <span class="badge text-bg-secondary cont" id="cont-${titulo}-apagadas">${contApagadas}</span>                                    
                            </button>
                            <!--UNIDADES QUE LLEVAN DIAS SIN CONEXION-->
                                ${ ( _titulo == 'Dobles' || _titulo == 'Cajas' ) 
                                    ? `<button type="button" 
                                        class="btn btn-danger p-1" onclick="getInfoUnits('${titulo}', 'warning')">
                                        <span class="font- d-none d-xl-inline fs-6">Unidad sin reportar</span>  
                                        <i class="bi bi-power d-xl-none"></i>
                                        <span class="badge text-bg-dark cont" id="cont-${titulo}-warning">${contWarning}</span>                                    
                                        </button>` 
                                    : ''
                                }
                            <!--UNIDADES QUE LLEVAN DIAS SIN CONEXION-->
                        </small>                                        
                    </div>
                    <div class="toast-body">
                        <div class="d-flex justify-content-around flex-wrap border">
                            <button type="button" 
                                class="btn btn-success flex-grow-1 m-1 p-1 d-flex align-items-center justify-content-center ${ ( _status_remove.includes('movimiento')) ? 'd-none' : '' }"
                                onclick="getInfoUnits('${titulo}', 'movimiento');" data-bs-toggle="tooltip" data-bs-placement="top"
                                title="Movimiento">
                                <span class="font-monospace d-none d-lg-inline fs-6">Movimiento</span> 
                                <i class="bi bi-arrow-right d-lg-none"></i>                                                
                                <span class="font-monospace badge bg-dark cont ms-1 fs-6" id="cont-${titulo}-movimiento">${contMovimiento}</span>
                            </button>
                            <button type="button" id="btn-${titulo.replaceAll( " ", "_" )}-sinconexion"
                                class="btn btn-secondary flex-grow-1 m-1 p-1 d-flex align-items-center justify-content-center ${contSinConexion > 0 ? "alert-btn btn-danger" : ""}" id="btn-${titulo.replaceAll(" ", "_" )}-sinconexion ${ ( _status_remove.includes('sin_conexion')) ? 'd-none' : '' } " 
                                onclick="getInfoUnits('${titulo}', 'sinconexion', '#btn-${titulo}-sinconexion'); removeClass_v2('#btn-${titulo.replaceAll( " ", "_" )}-sinconexion', 'alert-btn btn-danger');"
                                data-bs-toggle="tooltip" data-bs-placement="top" title="Sin conexión">
                                <span class="font-monospace d-none d-lg-inline fs-6">Sin conexión</span>
                                <i class="bi bi-wifi-off d-lg-none"></i>
                                <span class="font-monospace badge bg-dark cont ms-1 fs-6" id="cont-${titulo}-sinconexion">${contSinConexion}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- ----- -->
            `);
        }
    }
}

export function create_table_module(data, id_table) {
    $(id_table).empty();
    for (const key in data) {
        const objeto = data[key];

        const html = `
        <tr>
            <td>
                <div class="toast fade show w-100" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <img class="rounded me-2" src="${objeto.info.icon}" alt="Icon" width="24" height="24" />
                        <strong class="me-auto">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="getSelectedUnitInfo(${objeto.info.idUnit})">
                                ${objeto.info.nameUnit}
                            </button>
                        </strong>
                        <small class="text-muted">Ult MSJ: ${objeto.gps?.time ?? ""}</small>
                    </div>
                    <div class="toast-body">
                        <div class="row mb-2">
                            <div class="col-12 d-flex align-items-center flex-wrap">
                                <span class="me-3 d-flex align-items-center">
                                    <i class="bi bi-person-circle me-1 text-primary"></i>
                                    <strong>${"JD"}</strong>
                                </span>
                                <span class="me-3 d-flex align-items-center">
                                    <i class="bi bi-speedometer me-1 text-secondary"></i>
                                    ${objeto.gps?.velocidad ?? 0} km/h
                                </span>
                                <span class="me-3 d-flex align-items-center">
                                    <i class="bi bi-tools me-1 text-dark"></i>
                                    ${objeto.personalizados?.equipo ?? "Sin equipo"}
                                </span>
                                <span class="me-3 d-flex align-items-center text-danger">
                                    <i class="bi bi-lightning-charge me-1"></i>
                                    ${Math.round(objeto.sensors?.voltaje ?? 0)} Volts
                                </span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 d-flex align-items-center flex-wrap">
                                <span class="me-3 d-flex align-items-center">
                                    <i class="bi bi-battery-charging me-1 text-success"></i>
                                    ${Math.round(objeto.sensors?.bateria ?? 100)} %
                                </span>
                                <span class="me-3 d-flex align-items-center">
                                    <i class="bi bi-ev-front me-1 text-info"></i>
                                    ${objeto.sensors?.ignicion ?? 1 ? "Encendido" : "Apagado"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>`;

        $(id_table).append(html);
    }
}

export function create_map_module_div(objeto) {
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
                                    <button type="button" class="dropdown-item " id="btn-campospers" onclick="getFields(${objeto.personalizados.id})">
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
                    <td colspan="4">${objeto.personalizados?.origen.v ?? 'Error  de su campo personalizado'}</td>
                </tr>
                <tr>
                    <th scope="row">Destino:</th>
                    <td colspan="4">${objeto.personalizados?.destino.v ?? 'Error de su campo personalizado'}</td>
                </tr>
                <tr>
                    <th scope="row">Estatus:</th>
                    <td colspan="4">${objeto.personalizados?.status.v ?? 'Error  de su campo personalizado'}</td>
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
}

export function create_map_module_modal(objeto) {
    console.log(objeto);

    // Generar contenido elegante para el modal
    $("#modal-content").html(`
      <div class="modal-header bg-dark text-white">
        <h5 class="modal-title">🚗 Información de la Unidad</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <!-- Mapa -->
        <div id="map" class=" rounded overflow-hidden shadow-sm">
            <iframe 
                class="rounded"
                width="100%" height="100%" frameborder="0" style="border:0"
                src="https://maps.google.com/maps?q=${objeto.gps.longitud},${objeto.gps.latitud}&t=k&output=embed" 
                allowfullscreen>
            </iframe>
        </div>
  
        <!-- Información en tabla -->
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white">
            <div class="d-flex align-items-center">
              <img src="${objeto.info.icon}" class="rounded-circle me-2" width="32" alt="">
              <h6 class="mb-0">${objeto.info.nameUnit}</h6>
            </div>
          </div>
          <div class="card-body p-3">
            <table class="table table-hover table-bordered">
              <tbody>
                <tr>
                  <th>Origen:</th>
                  <td>${objeto.personalizados?.origen?.v ?? "Error de su campo personalizado"}</td>
                </tr>
                <tr>
                  <th>Destino:</th>
                  <td>${objeto.personalizados?.destino?.v ?? "Error de su campo personalizado" }</td>
                </tr>
                <tr>
                  <th>Estatus:</th>
                  <td>${objeto.personalizados?.status?.v ?? "Error de su campo personalizado" }</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- Opciones -->
        <div class="mt-4">
          <div class="btn-group dropup w-100">
            <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              Opciones
            </button>
            <ul class="dropdown-menu w-100">
              <li><button class="dropdown-item" onclick="getFields(${objeto.personalizados.id})">Campos personalizados</button></li>
              <li><button class="dropdown-item" onclick="getSensores(${objeto.personalizados.id})">Sensores</button></li>
              <li><button class="dropdown-item" onclick="getRecorridoUnit(${objeto.personalizados.id})">Mapear recorrido</button></li>
              <li><button class="dropdown-item" onclick="getMensajes(${objeto.personalizados.id})">Últimos mensajes</button></li>
            </ul>
          </div>
        </div>
      </div>
    `);

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById("dynamicModal"));
    modal.show();
}

export function create_select_units(data) {
    for (const unit in data) {
        const _data = data[unit];
        $("#select_unit_search").append(
            `<option value="${_data.info.idUnit}"><img src="${_data.info.icon}" alt="" width="20">${_data.info.nameUnit}</option>`
        );
    }
    $("#select_unit_search").select2({
        dropdownParent: $("#modal-search_units"),
        width: "100%",
    });
}

export function config_modules() {
    if (env.Temperature == "false") {
        $("#btn-temperature").hide();
    }

    if (env.Estatus == "false") {
        $("#btn-status").hide();
    }
}

function getStateOnline(data) {
    let objeto;
    const apagadas = {},
        movimiento = {},
        ralenti = {},
        warning = {},
        sinconexion = {};

    for (const _state in data) {
        const state = data[_state];
        for (const key in state) {
            const _unit = state[key];

            if (Object.keys(_unit).length > 0) {
                const conection = _unit.gps.State;
                
                const value = _unit.sensors.State;

                if (conection === "Online") {
                    switch (value) {
                        case "apagadas":
                            apagadas[key] = _unit;
                            break;
                        case "movimiento":
                            movimiento[key] = _unit;
                            break;
                        case "ralenti":
                            ralenti[key] = _unit;
                            break;
                    }
                } else if (conection === "Offline") {
                    sinconexion[key] = _unit;
                } else if (conection === "Warning") {
                    warning[key] = _unit;
                }
            }
        }
    }

    return (objeto = { apagadas, movimiento, ralenti, sinconexion, warning });
}

export function removeClass_v2(tag, className) {
    $(tag).removeClass( className );
}
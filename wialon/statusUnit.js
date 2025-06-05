import { _login } from '../js/index.js';
import { getGPS, getInfo, getPersonalizados, getSensores } from './device.js'
import { getAvl } from '../wialon/wialonAPI.js'
import { showModal } from '../utils/utils.js'

export const getUnitsStatus = async (units) => {

    const VACIO = {};
    const CARGADO = {};
    const ESPERA_CARGA = {};
    const ESPERA_DESCARGA = {};
    const SIN_STATUS = {};

    for (const key in units) {
        const element = await units[key].personalizados;
        
        if (element && 'status' in element) {
            const value = units[key].personalizados.status.v;

            if ( value.match(/\b(?:vacio)\b/i) ) {
                VACIO[ units[key].info.nameUnit ] = units[key];
            }
            else if ( value.match(/\b(?:carga|ESPERA_CARGA)\b/i) ) {
                ESPERA_CARGA[ units[key].info.nameUnit ] = units[key];
            }
            else if ( value.match(/\b(?:cargado)\b/i) ) {
                CARGADO[ units[key].info.nameUnit ] = units[key];
            }
            else if ( value.match(/\b(?:descarga|ESPERA_DESCARGA)\b/i) ) {
                ESPERA_DESCARGA[ units[key].info.nameUnit ] = units[key];
            }/*else{
                SIN_STATUS[ units[key].info.nameUnit ] = units[key];
            }*/
        }
    }

    return {
        VACIO,
        CARGADO,
        ESPERA_CARGA,
        ESPERA_DESCARGA,
        // SIN_STATUS
    }
};


export function create_status_module( conexion ){
    $(".status-table").empty();

    const units = getAvl( 'avl_unit', conexion );
    
    for (var i = 0; i < units.length; i++) {
        var u = units[i];
        
        /*Construimos el objeto principal*/
        const unidad = {
            info: getInfo(u),
            sensores: getSensores(u),
            personalizados: getPersonalizados(u),
            gps: getGPS(u),
        }

        /* ---------------------------- */
        for (const key in unidad.personalizados){
            const valor = unidad.personalizados[key];
            if (/^(status|estatus)$/.test(key)){
                if (valor.v !== null && valor.v !== undefined) {
                    const html = `  <tr class="draggable">
                                        <td>
                                            <img class='icon' src='${unidad.personalizados.icon}' alt='icon'/>
                                            <span class=' unitName '> ${unidad.personalizados.nameUnit} </span> ||                                                                                                   
                                            <span class=' value '>  ${valor.v} </span>  <br>                                              
                                            <button class="btn btn-success" id="" onclick="getGeocercas('${unidad.personalizados.id ?? ' '}','${unidad.personalizados.nameUnit ?? ' '}','${unidad.personalizados.icon ?? ' '}','${unidad.personalizados?.origen?.id ?? ' '}','${unidad.personalizados?.origen?.n ?? ' '}','${unidad.personalizados?.origen?.v ?? ' '}','${unidad.personalizados?.destino?.id ?? ' '}','${unidad.personalizados?.destino?.n ?? ' '}','${unidad.personalizados?.destino?.v ?? ' '}');">
                                                Origen/Destino
                                            </button>
                                            <span class=' unitId invisible'> ${unidad.personalizados.id} </span>
                                            <span class=' fieldName invisible'>  ${valor.n} </span>
                                            <span class=' fieldId invisible '>  ${valor.id} </span>
                                        </td>
                                    </tr>`;
                                    
                        if (valor.v.match(/\b(?:vacio)\b/i)) {
                            $("#TABLE_VACIO").append( html );
                        } else if (valor.v.match(/\b(?:carga|ESPERA_CARGA)\b/i)) {
                            $("#TABLE_ESPERA_CARGA").append( html );
                        } else if (valor.v.match(/\b(?:cargado)\b/i)) {
                            $("#TABLE_CARGADO").append( html );
                        } else if (valor.v.match(/\b(?:descarga|ESPERA_DESCARGA)\b/i)) {
                            $("#TABLE_ESPERA_DESCARGA").append( html );
                        }
                } else {
                }
            }
        }
        //Abrir el modal
        showModal('#modal-estatus');
    }


    // console.log(data);
    
    // for ( const key in data ){
    //     const _unit = data[ key ];
    //     for( const key in _unit ){
    //         console.log( key, _unit[key].personalizados.status );
    //     }
    // }

    // <div class="col-3 border-end border-success">
    //     <h3 class="text-center">VACIO</h3>
    //     <table class="table table-light table-striped mytable2" id="VACIO" style="width: 100%;">
    //         <thead>
    //             <tr>
    //                 <th>Unidades</th>
    //             </tr>
    //         </thead>
    //         <tbody id="TABLE_VACIO" class=" status-table">
    //         </tbody>
    //     </table>
    // </div>

    // <tr class="draggable">
    //     <td> <img class="icon mr-2" src="${u.getIconUrl(32)}" alt="icon"/> ${u.getName()} || ${estatus} <span class="invisible" >||${idProp}||${u.getId()}||VACIO||${namePrd}</span></td>
    // </tr>
}


function showStatus() {
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
    //initTable('.table-status-units');

    conexion.updateDataFlags(spec, function (code) {

        var units = conexion.getItems("avl_unit");

        for (var i = 0; i < units.length; i++) {
            var u = units[i];
            
            /*Construimos el objeto principal*/
            unidad = {
                info: getInfo(u, unit_groups),
                sensores: getSensores(u),
                personalizados: getPersonalizados(u),
                gps: getGPS(u),
            }
            /* ---------------------------- */
            for (const key in unidad.personalizados){
                const valor = unidad.personalizados[key];
                if (/^(status|estatus)$/.test(key)){
                    if (valor.v !== null && valor.v !== undefined) {
                        const html = `  <tr class="draggable">
                                            <td>
                                                <img class='icon' src='${unidad.personalizados.icon}' alt='icon'/>
                                                <span class=' unitName '> ${unidad.personalizados.nameUnit} </span> ||                                                                                                   
                                                <span class=' value '>  ${valor.v} </span>  <br>                                              
                                                <button class="btn btn-success" id="" onclick="getGeocercas('${unidad.personalizados.id ?? ' '}','${unidad.personalizados.nameUnit ?? ' '}','${unidad.personalizados.icon ?? ' '}','${unidad.personalizados?.origen?.id ?? ' '}','${unidad.personalizados?.origen?.n ?? ' '}','${unidad.personalizados?.origen?.v ?? ' '}','${unidad.personalizados?.destino?.id ?? ' '}','${unidad.personalizados?.destino?.n ?? ' '}','${unidad.personalizados?.destino?.v ?? ' '}');">
                                                    Origen/Destino
                                                </button>
                                                <span class=' unitId invisible'> ${unidad.personalizados.id} </span>
                                                <span class=' fieldName invisible'>  ${valor.n} </span>
                                                <span class=' fieldId invisible '>  ${valor.id} </span>
                                            </td>
                                        </tr>`;
                            if (valor.v.match(/\b(?:vacio)\b/i)) {
                                $("#TABLE_VACIO").append( html );
                            } else if (valor.v.match(/\b(?:carga|ESPERA_CARGA)\b/i)) {
                                $("#TABLE_ESPERA_CARGA").append( html );
                            } else if (valor.v.match(/\b(?:cargado)\b/i)) {
                                $("#TABLE_CARGADO").append( html );
                            } else if (valor.v.match(/\b(?:descarga|ESPERA_DESCARGA)\b/i)) {
                                $("#TABLE_ESPERA_DESCARGA").append( html );
                            }
                    } else {
                    }
                }
            }
        }
        //$('.table-status-units').DataTable().draw();
    });
    $("#modal-estatus").modal('show');
    //initTable('.table-status-units');
}

function collectStatus() {
    const parser = new DOMParser();
    var tableIds = ['VACIO', 'CARGADO', 'ESPERA_CARGA', 'ESPERA_DESCARGA'];
    var objetoUnit = {};
    
    tableIds.forEach(function (tableId) {
        $("#" + tableId + ' tbody tr').each(function () {
            $(this).find('td').each(function () {
                var htmlString = $(this).html(); //console.log(cellContent);
                const doc = parser.parseFromString(htmlString, 'text/html');

                objetoUnit.unitName = doc.querySelector('span.unitName').textContent.trim();
                objetoUnit.unitId = doc.querySelector('span.unitId').textContent.trim();
                objetoUnit.fieldId = doc.querySelector('span.fieldId').textContent.trim();
                objetoUnit.fieldName = doc.querySelector('span.fieldName').textContent.trim();
                objetoUnit.fieldValue = doc.querySelector('span.value').textContent.trim();

                if( objetoUnit.fieldValue.replace(/[^a-zA-Z\s]/g, '').trim() == tableId.replace('_', ' ') ){
                    
                }else{
                    //console.log( tableId.replace('_', ' ') + ' - ' + objetoUnit.fieldValue.replace(/[^a-zA-Z\s]/g, '') + ' - ' + tableId + " " + getNewDate() );
                    setProperties(objetoUnit.fieldId, objetoUnit.fieldName, objetoUnit.unitId, tableId + " " + getNewDate());
                }
            });
        });
    });
    alert('Cambios guardados');
}

function collectRoute() {
    var id_origen = $('#info_origen_id').text(); 
    var id_destino = $('#info_destino_id').text();
    
    var name_origen = $('#info_origen_name').text();
    var name_destino = $('#info_destino_name').text();
    
    var origen = $('#select-origen').val();
    var destino = $('#select-destino').val();
     
    var idUnit = $("#info_unit_id").text()
    
    //console.log(id_origen + ' ' + name_origen + ' ' + idUnit + ' ' + origen); //origen
    //console.log(id_destino + ' ' + name_destino + ' ' + idUnit + ' ' + origen); //origen
    setProperties(id_origen, name_origen, idUnit, origen); //origen
    setProperties(id_destino, name_destino, idUnit, destino); //destino
    alert('Cambios guardados');
}
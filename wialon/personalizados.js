import { getUnitById, _conexion, _token } from "../js/index.js";
import { showModal } from "../utils/utils.js";
import {  logout  } from './wialonAPI.js'

export const getFields = (idUnidad) =>{
    const _unit = getUnitById(idUnidad);
    const fields = _unit.personalizados;
    create_module_fields(fields);
}

export function setProperties(prop_id, name, idUnidad, value) {
    const cur_unit = _conexion.getItem( idUnidad ); 
    //const cur_prop = cur_unit.getCustomFields();
    value = (value == null || value == '') ? $('#prop_value_' + prop_id).val() : value    //var value = $('#prop_value_' + prop_id).val();
    

    cur_unit.updateCustomField({ id: prop_id, n: name, v: value });
    alert('Se actualizo ' + name + ', con el valor: ' + value);
    logout( _token );
    //alert('Se actualizaron los estados de las unidades');
}

function create_module_fields( data ){
    $("#modal_body_campos_personalizados").empty();
    for( const key in data ){
        const elemento = data[key]; 
        if(elemento.id){
            $("#modal_body_campos_personalizados").append(`
            <tr>
                <td><input type="text" id="prop_id_${data[key].id}"  placeholder="ID" disabled="disabled" value="${elemento.id}"/></td>
                <td><input type="text" id="prop_name_${data[key].id}" placeholder="Nombre" value="${elemento.n}"/></td>
                <td><input type="text" id="prop_value_${data[key].id}" placeholder="Valor" value="${elemento.v}"/></td>
                <td>
                    <button type="button" class="btn btn-primary" onclick="setProperties(${elemento.id},'${elemento.n}','${data.id}');">Actualizar</button>
                </td>
            </tr>             
            `);
        }
        showModal('#modal_campos_personalizados');
    }
}
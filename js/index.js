/* imports */
import { env } from '../config.js'
import { getToken } from '../wialon/token.js'
import { showModal, removeClass } from '../utils/utils.js'
import { login, getAvl, logout  } from '../wialon/wialonAPI.js'
import { getFields, setProperties  } from '../wialon/personalizados.js'
import { getInfoGroup, getUnitsGroup } from '../wialon/groups.js'
import { getUnitsStatus, create_status_module } from '../wialon/statusUnit.js'
import { getNotifications, handleNotifications } from '../wialon/notifications.js';
import { getTemperature, create_modal_temperature } from '../wialon/temperature.js'
import { getGPS, getInfo, getPersonalizados, getSensores, getState } from '../wialon/device.js'
import { getStateConectionsUnits, getStateConectionsUnitsbyStatus, getStateConectionsUnitsbyGroups } from '../wialon/statusConections.js'
import { createHTML_PanelbyStatus, create_button_module, create_table_module, create_map_module_modal, config_modules, create_select_units, removeClass_v2} from '../helper/index.js'
/* ------- */

window.showModal = showModal;
window.getFields = getFields;
window.searchUnit = searchUnit;
window.showStatus = showStatus;
window.removeClass_v2 = removeClass_v2;
window.getInfoUnits = getInfoUnits;
window.setProperties = setProperties;
window.getSelectedUnitInfo = getSelectedUnitInfo;
window.handleNotifications = handleNotifications;
window.getOptionSelectUnitSearch = getOptionSelectUnitSearch;

let units;
let _units;
let _groups;
let _unitsbyStatus;
let _unitsfailedTemperature;

export let _token;
export let _conexion;

$( document ).ready( () =>{
    getToken().then( token => {
        _token = token;        
        _login( token );
    });

    setInterval(function () {
        logout( _token );        
    }, 1 * 60 * 1000);
});

export const _login = ( token ) =>{
    try {
        login( token )
        .then( ( conexion ) => {
            _conexion = conexion;
            $("#user_Wialon").text( conexion.getCurrUser().getName() );
            
            units = getAvl( 'avl_unit', conexion );  
            
            const group = getAvl( 'avl_unit_group', conexion );
            const resource = getAvl( 'avl_resource', conexion );
             
            //create_status_module( conexion );
            getNotifications( resource );  
            config_modules();
            getUnits( units )
            .then ( response => {
                _units = getStateConectionsUnits( response );
                
                if( env.Temperature == 'true' ){
                    _unitsfailedTemperature = getTemperature( response );
                    create_modal_temperature( _unitsfailedTemperature ); 
                }
            })
            
            if( env.StatusUnit == 'true'  && env.statusInteres ){
                getUnitsStatus( units ) 
                .then( ( response ) => {
                    _unitsbyStatus = getStateConectionsUnitsbyStatus( response );
                    _unitsbyStatus = createHTML_PanelbyStatus( _unitsbyStatus ); 
                    create_button_module( _unitsbyStatus, '#button_module1', env.statusInteres );
                })
            }
            
            if(env.GroupsUnit == 'true'){
                if( env.gruposInteres1 ){
                    if( Object.keys(env.gruposInteres2).length == 0 && ( !env.StatusUnit ) ){
                          $(".btn-module").addClass('w-100');  
                    }
                    
                    getGrupos( group )
                    .then( response => {
                        _groups = getStateConectionsUnitsbyGroups( response ); 
                        _groups = createHTML_PanelbyStatus( _groups );
                        create_button_module( _groups, '#button_module2', env.gruposInteres1 );
        
                    })
                }

                if( env.gruposInteres2 ){
                    getGrupos( group )
                    .then( response => {
                        _groups = getStateConectionsUnitsbyGroups( response ); 
                        _groups = createHTML_PanelbyStatus( _groups );
                        create_button_module( _groups, '#button_module1', env.gruposInteres2 );
        
                    })
                }
            }  
            
        })
        .catch( (error) => {
            console.error ( `Sin unidades: ${error}` );
        }) 
        
        if(env.map == 'false'){
            $("#root_map").addClass('d-none');
            $("#root_button_module").addClass('col-9');
        }
    } catch (error) {
        console.error ( error );
    }
}

export const getUnitById = ( id ) => {
    for( const key in _units ){
        const unit = _units[ key ];
        for( const key in unit ){
            const value = unit[ key ];
            if( id == value.info.idUnit ){
                return value;
            }
        }
    }
}

const getGrupos = async ( groups ) => {
        await groups.forEach(group => {
            const objeto = {
                info: getInfoGroup( group ),
                units: getUnitsGroup( group ),
            }
        groups[group.getName()] = objeto;
    });
    return groups;
}

const getUnits = async ( units ) => {
    await units.forEach( unit => {
        const objeto = {
            info: getInfo( unit ),
            gps: getGPS( unit ),
            sensors: getSensores( unit ),
            personalizados: getPersonalizados( unit )
        }
        getState( objeto );
        units[unit.getName()] = objeto
    });
    return units;
}

function getInfoUnits( modulo, estado, id_tag ){
    
    const TODO = { ..._unitsbyStatus, ..._groups};
    
    for( const _modulo in TODO){
        if( _modulo == modulo){
            const _units = TODO[ _modulo ];
            if( estado == 'general'  ){
                const { apagadas, movimiento, ralenti, sinconexion, warning } = _units
                const allUnits = { ...apagadas, ...movimiento, ...ralenti, ...sinconexion, ...warning };
                create_table_module( allUnits, '#table-tbody' );                
            }else{
                for( const key in _units ){             
                    const units = _units[ key ];
                    
                    if( key == estado ){                 
                        create_table_module( units, '#table-tbody' );
                    }
                }   
            }  

        } 
    }
}

function searchUnit(){
    const TODO = { ..._units.online, ..._units.offline };
    create_select_units( TODO );
    showModal('#modal-search_units');
}

function getSelectedUnitInfo ( id ){
    const value = getUnitById( id );
    create_map_module_modal( value );
}

function showStatus (  ){
    create_status_module( _conexion );
}

function getOptionSelectUnitSearch(){
    const idUnit = $("#select_unit_search").val();
    const unitbyId = getUnitById( idUnit );
    // alert( value );
    create_map_module_modal( unitbyId );
}
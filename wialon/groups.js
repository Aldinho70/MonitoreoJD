import { getGPS, getInfo, getPersonalizados, getSensores, getState } from './device.js'
const conexion = wialon.core.Session.getInstance();

export const getInfoGroup = ( group ) =>{
    return {
        nameGroup: group.getName(),
        idGroup: group.getId(),
        icon: group.getIconUrl(32), 
    }
}

export const getUnitsGroup = ( group ) => {
    return initUnit( group.getUnits() );
}

function initUnit(unitsGoups) {
    const units = {};
    unitsGoups.forEach( Element => {
        const unit = conexion.getItem( Element );
        if ( unit ) {
            const objeto = {
                info: getInfo(unit),
                sensors: getSensores(unit),
                personalizados: getPersonalizados(unit),
                gps: getGPS(unit),
            }
            getState( objeto );

            units[unit.getName()] = objeto;
        }
        
    })
    return units;
}   
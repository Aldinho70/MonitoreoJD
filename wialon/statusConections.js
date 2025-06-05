    // import { env } from "../config.js";
    // const gruposInteres = env.gruposInteres;
    
    export const getStateConectionsUnits = ( units ) =>{ 
        const offline = {};
        const online = {};
        const warning = {};
        for( const key in units ){
            if( units[key].gps ){
                if( units[key].gps.State == 'Online' ){
                    online[ key ] = units[key];
                }else if( units[key].gps.State == 'Offline' ){
                    offline[ key ] = units[key];
                }else if( units[key].gps.State == 'Warning' ){
                    // warning[ key ] = units[key]; 
                    //Se mod por que los compañeros de monitoreo quieren ver todas las unidades
                    offline[ key ] = units[key];                    
                }
            }
        }
        return { online, offline, warning };
    }

    export const getStateConectionsUnitsbyStatus = ( units ) => {
        let objeto = {};
        for (const key in units) {
            if (Object.hasOwnProperty.call(units, key)) {
                const _units = units[key];
                objeto[key] = getStateConectionsUnits (_units);
            }
        }
        return objeto;
    }
    
    export const getStateConectionsUnitsbyGroups = ( groups ) => {
        let objeto = {};
        for (const key in groups) {
            /*if( gruposInteres.includes( key ) ){*/
                if (Object.hasOwnProperty.call(groups, key)) {
                    const _groups = groups[key].units;
                    objeto[key] = getStateConectionsUnits (_groups);
                }
            /*}*/
        }
        return objeto;
    }
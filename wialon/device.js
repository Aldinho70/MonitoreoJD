import { env } from '../config.js';
/* Objetos de una unidad */
    export const getInfo = (unidad) => {
        
        return {
            nameUnit: unidad.getName(),
            idUnit: unidad.getId(),
            icon: unidad.getIconUrl(32),         
        };
        
    }

    export const getSensores = (unidad) => {
        /**
         * Borrar si todo funciona bien!
         */
        // const customFields = unidad.getCustomFields(); //console.log(unidad.getName()); console.log(customFields)
        // for (const key in customFields) {
        //     if (Object.prototype.hasOwnProperty.call(customFields, key)) {
        //         const element = customFields[key];
        //         // console.log( element.n, element.v );
        //         if( element.n == 'TIPO' ){
        //             if( element.v.toLowerCase().includes("caja")){
        //                 console.log( element.v );                        
        //             }                    
        //         }
        //     }
        // }
        // console.log(unidad.getCustomFields());
        
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
                if (sensor.n == "IGNICION" || sensor.n == "ignicion") {
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
                if (sensor.n == "TEMPERATURA") {
                    var valor = unidad.calculateSensorValue(unidad.getSensor(sensor.id), lastMensajes);
                    if (valor == -348201.3876) {
                        valor = "N/A";
                    }
                    metadatos.temperatura = valor;
                }
                if (sensor.n == "jamming") {
                    var valor = unidad.calculateSensorValue(unidad.getSensor(sensor.id), lastMensajes);
                    if (valor == -348201.3876) {
                        valor = "N/A";
                    }
                    metadatos.temperatura = valor;
                }
            }
        }

        if(getTypeUnit(unidad)) {
            metadatos.tipo = 'Caja'            
        }

        getStateunit(metadatos)
        
        return metadatos; //console.log(metadatos);
    }

    export const getPersonalizados = (unidad) => {
        const personalizados = unidad.getCustomFields();

        const metadatos = {
            id: unidad.getId(),
            nameUnit: unidad.getName(),
            icon: unidad.getIconUrl(32),
        }

        for (const key in personalizados) {
            if (Object.hasOwnProperty.call(personalizados, key)) {
                const personalizado = personalizados[key]; //console.log( personalizado );
                // console.log(personalizado.n + " - " + personalizado.v);
                if (personalizado.n.match(/\b(?:status|estatus)\b/i) ) {
                    metadatos.status = personalizado;
                } else if (personalizado.n.match(/\b(?:ORIGEN|origen)\b/i) || personalizado.n == '1 ORIGEN' ) {
                    metadatos.origen = personalizado;
                } else if (personalizado.n.match(/\b(?:DESTINO|destino)\b/i) || personalizado.n == '2 DESTINO' ) {
                    metadatos.destino = personalizado;
                } else {
                    metadatos[personalizado.n] = personalizado;
                }
            }
        }
        //console.log(metadatos);
        return metadatos; 
    }

    export const getGPS = (unidad) => {
        const metadatosGPS = unidad.getPosition();
        if( metadatosGPS ){
            const metadatos = {
                nameUnit: unidad.getName(),
                time: (wialon.util.DateTime.formatTime(metadatosGPS.t) !== '') ? wialon.util.DateTime.formatTime(metadatosGPS.t) : 0,
                velocidad: metadatosGPS.s,
                latitud: metadatosGPS.x,
                longitud: metadatosGPS.y,
                mapsUrlembed: 'https://maps.google.com/maps?q=' + metadatosGPS.y + ',' + metadatosGPS.x + '&output=embed',
                mapsUrlUri: 'https://www.google.com/maps?q=' + metadatosGPS.y + ',' + metadatosGPS.x, // Enlace tradicional de Google Maps
            }
            
            getStateconection(metadatos);
            
            return metadatos 

        }

    }
/* --------------------- */

/* Metodos para establecer el estado de la unidad */
function getStateunit(vehicle) {
    
    if (vehicle.ignicion === 0) {
        return vehicle.State = 'apagadas' /*'movimiento'*/;
    } else if (vehicle.ignicion === 1 && vehicle.velocidad === 0) {
        // return vehicle.State = 'ralenti' /*'movimiento'*/;
        if( vehicle.tipo == 'Caja'){
            return vehicle.State = 'movimiento' /*'movimiento'*/;
        }else{
            return vehicle.State = 'ralenti' /*'movimiento'*/;
        }
    } else if (vehicle.ignicion === 1 && vehicle.velocidad > 0) {
        return vehicle.State = 'movimiento';
    } else if( vehicle.ignicion == 'N/A' && vehicle.velocidad > 0  ){
        return vehicle.State = 'movimiento';
    } else if( vehicle.ignicion == 'N/A' && vehicle.velocidad == 0  ){
        return vehicle.State = 'apagadas';
    } else {
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
        return vehicle.State = 'Warning';
    }    
}

export function getState(objeto) { //AGREGA STATE A SENSORES ( SINCONEXION, APAGADAS, RALENTI, MOVIMIENTO )
    if ( objeto.gps ){
        if (objeto.gps.State == 'Online') {
            if (objeto.sensors.State == 'apagadas') {
                return objeto.sensors.State; /*'movimiento'*/;
            } else if (objeto.sensors.State == 'ralenti') {
                return objeto.sensors.State /*'movimiento'*/;
            } else if (objeto.sensors.State == 'movimiento') {
                return objeto.sensors.State;
            }
        } else if (objeto.gps.State == 'Offline') {
            if(objeto.sensors.State == 'apagadas'){
                getRealState( objeto );       
            }else{
                return objeto.sensors.State = 'sinconexion';
            }
        } else if( objeto.gps.State == 'Warning') {
            return objeto.sensors.State = 'warning';
        }
    }
}

const getRealState = ( objeto ) => {
    const { gps, sensors } = objeto;
    const { time } = gps;
    const { State } = sensors;
    const minutosDiff = calcularDiferenciaEnMinutos(time);

    if( minutosDiff < 30 && State == 'apagadas'){
        objeto.gps.State = 'Online'        
    }
}

function calcularDiferenciaEnMinutos(fecha) {
    const fechaProporcionada = new Date(fecha); 
    const fechaActual = new Date(); 

    const diferenciaMs = fechaActual - fechaProporcionada ;

    const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));

    return diferenciaMinutos;
}

const getTypeUnit = function (unidad) {    
    const name_caja = env.Name_cajas; 
    const customFields = unidad.getCustomFields(); //console.log(unidad.getName()); console.log(customFields)

    for (const key in customFields) {
        if (Object.prototype.hasOwnProperty.call(customFields, key)) {
            const element = customFields[key];
            // console.log( element.n, element.v );
            if( element.n == 'TIPO' ){
                if(element.v.startsWith('CAJA')){
                    return true;
                }
            }else if( element.v.startsWith(name_caja) ){
                return true;                
            }
        }
    }    
}

/* --------------------------------------------- */
import { all_avl } from './spec.js';
import { _login } from '../js/index.js';
import { loadLibraries } from './libraries.js';

export const login = async ( token ) => {
    try {
        const conexion = await getLogin( token ); 
        const data = await init( conexion );
        // console.log( data);
        
        return data;
    } catch (error) {
        return error;
    }
}

export const logout = ( _token ) => {
    wialon.core.Session.getInstance().logout( // if user exist - logout
        function (code) { // logout callback
            if (code) {
                console.log('logout: ' + wialon.core.Errors.getErrorText(code));
            }
            else //console.log("Sesion cerrada");
                _login( _token );
        }
    );
}

export const init = async ( conexion ) => {
    try {
        return await getInit ( conexion ); 
    } catch (error) {
        return;
    }
}

export const getAvl = (avl, conexion) => { 
    var avl_search = conexion.getItems(avl); 
    // if (!avl_search || !avl_search.length){ 
    //     console.error("Sin avl_search");
    //     return; 
    // } 
    return avl_search;
}

async function getLogin(token){
    const conexion = wialon.core.Session.getInstance();

    conexion.initSession("https://hst-api.wialon.com"); 
    return new Promise( ( resolve, reject ) => {
        conexion.loginToken(token, "", (code) => { 
               if (code){ 
                   reject(wialon.core.Errors.getErrorText(code));
               }
               resolve ( conexion );
       });
    });
}

async function getInit( conexion ){
    loadLibraries( conexion );
    return new Promise ((resolve, reject) => {
        conexion.updateDataFlags(all_avl , ( code ) => {  
            if( code ){
                reject( code );
            }else{
                resolve(conexion);
            }
        });    
    })
}
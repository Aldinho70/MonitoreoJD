import { getUnitById } from "../js/index.js";
import { showToast, axiosPost } from "../utils/utils.js";

export function getNotifications( resource ) {
    for (var i = 0; i < resource.length; i++) { 
        resource[i].addListener("messageRegistered", showData); 
    }
}

function showData(event) {
    const data = event.getData(); // get data from event
    const cont = parseInt($("#cont_notificacion").text());    

    if (data.tp && data.tp == "unm") {
        var unit = getUnitById( data.unit );

        $("#notifi").prepend(`
        <div class="alert alert-dark alert-dismissible fade show" id="${cont}" role="alert">
            <div class="unidad d-flex align-items-center">
                <h5 class="mb-0">
                <span class="badge rounded-pill text-bg-light">${cont + 1}</span>
                <img src="${unit.info.icon}" class="rounded me-2" alt="">
                <strong>${unit.info.nameUnit}</strong>
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
            <button type="button" class="btn btn-danger btn-sm " onclick="handleNotifications( ${cont}, '${unit.info.nameUnit}', '${data.t}', 'user_root' );" >
                    Atender
                </button>             
            <br>           
        </div>
        `);

        $("#cont_notificacion").text(cont + 1);

        $("#Toast_Notification").html(`
            <div class="toast-header p-4">
                <img src="${unit.info.icon}" class="rounded me-2" alt="" style="width: 48px; height: 48px;">
                <strong class="text-break flex-grow-1 fs-5">${unit.info.nameUnit} — ${data.name}</strong>
            </div>
        `);

        showToast("#Toast_Notification");
        
        //Sonido de notificacion
        var audio = new Audio('./mp3/livechat-129007.mp3');
        audio.play();

        // const objeto = {
        //     name_user: name_user,
        //     name_unidad: unit.getName(),
        //     name_alert: data.name,
        //     txt: data.txt,
        //     timestamp: data.t,
        //     latitud: data.y,
        //     longitud: data.x,
        //     monitorista: $("#getmonitorista").text()
        // };

        // axiosPost( './php/insert_Notificaciones.php', objeto )
    }
}

export function handleNotifications(id, unidad, timestamp, name_user) {
    
    $("#name_unit_notifi_atendida").text(unidad);
    showToast('#NotificacionAtendida');
    $("#" + id).remove();
    $("#cont_notificacion").text(parseInt($("#cont_notificacion").text()) - 1);
    
    // const objeto = {
    //     name_unidad: unidad,
    //     timestamp: timestamp,
    //     atendida: true,
    //     new_timestamp: new Date().getTime(),
    //     name_user: name_user,
    //     monitorista: 'root_user'
    // };

    // axiosPost('./php/update_Notificaciones.php', objeto)

}
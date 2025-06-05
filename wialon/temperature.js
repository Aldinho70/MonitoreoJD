export function getTemperature(data) {
    const units = {};
    for (const key in data) {
        const _units = data[key];
        if (data[key] && data[key].sensors && data[key].sensors.temperatura) {
            const temperatura = data[key].sensors.temperatura;
            if( temperatura == 'N/A' ) {
                units[key] = _units;
            }
        }
    }
    return units;
}

export function create_modal_temperature( data ){
    const cont = Object.keys( data ).length;
    $("#cont-temperatura").text( cont );
    for ( const key in data ) {
        const unit = data[key];
        const html = `
        <tr>
            <th scope="row"><img class='icon' src='${unit.info.icon}' alt='icon'/></th>
            <td><strong>${unit.info.nameUnit}</strong></td>
            <td>${unit.sensors.temperatura}</td>
        </tr>
    `;

    $("#table-body-temperature").append(html);
    }
}


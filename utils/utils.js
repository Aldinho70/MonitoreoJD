/* Retorna una array de object con la modifcacion de uno de sus atributos a int */
export function parseData(data) {
    return data.map(item => ({
        name: item.name,
        y: Number(item.y) 
    }));
}

export function showToast(idToast) {
    var toastElement = $( idToast );
    var toastInstance = new bootstrap.Toast(toastElement);
    toastInstance.show();
}

export function showModal(idModal) {
    $(idModal).modal("show");
}

export function axiosPost( endpoint, data){
    axios.post(endpoint, data)
    .then(response => {
        console.log('Success:', response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


export function removeClass(tag, className) {
    $(tag).removeClass( className );
}
/* ----------------------------------------------------------------------------- */
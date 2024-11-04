let db ;
function inicializarDB(){
    const request = indexedDB.open("Clientes");// por defecto la versión es 1
    request.addEventListener('success',comenzar)
    request.addEventListener('error',mostrarError)
    request.addEventListener("upgradeneeded",crearEstructura)
}

function comenzar(ev){
    db = ev.target.result
}

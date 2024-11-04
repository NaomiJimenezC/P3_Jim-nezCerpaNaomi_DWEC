//
let db
let invertidos = true


//ElementosDOM
const nombreCliente = document.querySelector("#nombre")
const correCliente = document.querySelector("#email")
const telefono = document.querySelector("#telefono")
const empresa = document.querySelector("#empresa")
const botonSubmit = document.querySelector("#formulario input[type=submit]")
const formulario = document.querySelector("#formulario")

const contenidoTabla = document.querySelector("#listado-clientes")
const botonOrdenar= document.querySelector("#boton-ordenar")
const busquedaCliente = document.querySelector("#search")

const selectEmail = document.querySelector("#selectCliente")
//listeners

const datosCliente ={
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    id: 0
}
if (!contenidoTabla && !selectEmail){
    nombreCliente.addEventListener("blur", validar)
    correCliente.addEventListener("blur",validar)
    telefono.addEventListener("blur",validar)
    empresa.addEventListener("blur",validar)
    formulario.addEventListener("submit", enviarDatosClientes)
} else if (selectEmail){
    console.log("miau")
  selectEmail.addEventListener("change",obtenerInfoCliente)
} else {
    busquedaCliente.addEventListener("blur",buscarClientes)
    botonOrdenar.addEventListener("onclick", invertirClientesPorNombre)
}

document.addEventListener('DOMContentLoaded',inicializarDB)

//funciones


function rellenarSelectClientes(){
    obtenerEmails(db)
        .then(emailsCliente => {
            limpiarHTML(selectEmail);
            emailsCliente.forEach(email => {
                const option = document.createElement("option");
                option.value = email;
                option.textContent = email;
                selectEmail.appendChild(option);
            });
        })
}

function obtenerInfoCliente (evEmail){

        const transaction = db.transaction("clientes","readonly")
        const datosClientes = transaction.objectStore("clientes")

        const request = datosClientes.get(evEmail.target.value)

        request.onsuccess = () =>{
            const cliente = request.result
            const resultadoCliente = document.querySelector("#resultadoCliente")
            limpiarHTML(resultadoCliente);

            const {nombre,email,telefono,empresa} = cliente;
            const nombreh2 = document.createElement("h2");
            nombreh2.innerText="Nombre:";
            const nombreHtlm = document.createElement("P")
            nombreHtlm.textContent=nombre;
            const emailh2 = document.createElement("h2");
            emailh2.innerText="Email";
            const emailHtlm = document.createElement("P")
            emailHtlm.textContent=email;
            const telefonoH2 = document.createElement("h2");
            telefonoH2.innerText="Telefono:";
            const telefonoHtlm = document.createElement("P")
            telefonoHtlm.textContent=telefono;
            const empresaH2 = document.createElement("h2");
            empresa.textContent="Empresa:";
            const empresaHtlm = document.createElement("P")
            empresaHtlm.textContent=empresa;

            resultadoCliente.appendChild(nombreh2);
            resultadoCliente.appendChild(nombreHtlm);
            resultadoCliente.appendChild(emailh2);
            resultadoCliente.appendChild(emailHtlm);
            resultadoCliente.appendChild(telefonoH2);
            resultadoCliente.appendChild(telefonoHtlm);
            resultadoCliente.appendChild(empresaH2);
            resultadoCliente.appendChild(empresaHtlm);


        }

        request.onerror = (ev) =>{
            console.log(ev.target.error)
        }

}

function obtenerEmails(db){
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("clientes", "readonly");
        const datosClientes = transaction.objectStore("clientes");

        const request = datosClientes.getAllKeys(); // Obtener todos los registros

        request.onsuccess = (event) => {
            resolve(event.target.result); // Resuelve la promesa con el resultado
        };

        request.onerror = (event) => {
            reject(event.target.error); // Rechaza la promesa si hay un error
        };
    });
}

function invertirClientesPorNombre(ev){
    obtenerDatosClientes(db)
        .then(clientes => {
            if (!invertidos){
                // Ordenar los clientes en orden ascendente y luego invertir a descendente
                const clientesOrdenados = clientes.sort((a, b) => a.nombre.localeCompare(b.nombre)).reverse();
                limpiarHTML(contenidoTabla);
                pintarClientes(clientesOrdenados);
                invertidos = true
            } else{
                const clientesOrdenados = clientes.sort((a, b) => a.nombre.localeCompare(b.nombre))
                limpiarHTML(contenidoTabla);
                pintarClientes(clientesOrdenados);
                invertidos = false
            }

        })
}


function buscarClientes(ev) {
    /**
     * Busca los clientes que tengan un nombre escrito en el input.
     */
    const nombreBuscado = ev.target.value.toLowerCase();

    obtenerDatosClientes(db)
        .then(clientes => {
            const clientesFiltrados = clientes.filter(cliente => cliente.nombre.toLowerCase().includes(nombreBuscado));
            limpiarHTML(contenidoTabla)
            // Pintar los clientes filtrados
            pintarClientes(clientesFiltrados);
        })
        .catch(error => {
            console.error("Error al obtener los datos de clientes:", error);
        });
}

function limpiarHTML (seleccion){
    while (seleccion.firstChild) {
        seleccion.removeChild(seleccion.firstChild)
    }
}

function pintarClientes(infoClientes){
    if(infoClientes){
        limpiarHTML(infoClientes)

        infoClientes.forEach(cliente => {
            const clientRow = document.createElement("tr")
            clientRow.classList.add("px-6", "py-3", "border-b" ,"border-gray-200")

            const nombreCliente = document.createElement("td")
            nombreCliente.innerText = cliente.nombre

            const telefonoCliente = document.createElement("td")
            telefonoCliente.innerText = cliente.telefono

            const empresaCliente = document.createElement("td")
            empresaCliente.innerText = cliente.empresa

            const accion = document.createElement("td")
            const eliminar = document.createElement("button");
            eliminar.innerText = "X";
            eliminar.classList.add("bg-red-500", "text-white","px-2", "py-1","cursor-pointer")
            eliminar.onclick = () => {
                borrarCliente(cliente.email,clientRow)
            }

            accion.appendChild(eliminar)

            clientRow.appendChild(nombreCliente)
            clientRow.appendChild(telefonoCliente)
            clientRow.appendChild(empresaCliente)
            clientRow.appendChild(accion)

            contenidoTabla.appendChild(clientRow)
        })
    }
}

function enviarDatosClientes(ev){
    guardarDatosCliente()
}

function validar(ev){
    const campoForm = ev.target

    if(ev.target.id === "email"){
        if (!validarCorreo(campoForm.value)){
            mostrarError("Email inválido",campoForm.parentElement)
            return;
        }
    }

    if(campoForm.id === "telefono" && !validarTlf(campoForm.value)){
            mostrarError("Teléfono inválido",campoForm.parentElement)
            return;
    }

    if(campoForm.value === ""){
        mostrarError("El campo no puede estar vacío",campoForm.parentElement)
        return;
    }

    limpiarAlerta(campoForm.parentElement)

    // Asignar los valores
    datosCliente[campoForm.name] = campoForm.value.trim()

    // Comprobar el objeto de email
    comprobarDatosCliente()

}

function mostrarError(mensaje,campoForm){
    limpiarAlerta(campoForm)
    const contenedor = document.createElement("div")
    contenedor.classList.add("bg-red-500")

    const contenidoMensaje = document.createElement("p")

    contenidoMensaje.innerText = mensaje
    contenidoMensaje.classList.add("text-bold","text-center","text-white")
    contenedor.appendChild(contenidoMensaje)

    campoForm.appendChild(contenedor)

    console.log(mensaje)
}

function limpiarAlerta (referencia) {
    // Comprueba si ya existe una alerta
    const alerta = referencia.querySelector('.bg-red-500')
    if (alerta) {
        alerta.remove()
    }
}

function comprobarDatosCliente () {
    if (Object.values(datosCliente).includes('')) {
        botonSubmit.classList.add('opacity-50')
        botonSubmit.disabled = true
        return
    }
    botonSubmit.classList.remove('opacity-50')
    botonSubmit.disabled = false
}

function validarCorreo(correo){
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    return regex.test(correo)
}

function validarTlf(telefono){
    const regex = RegExp("^[0-9]{9}$")
    return regex.test(telefono)
}

//indexedDB

function inicializarDB(){
    const request = indexedDB.open("Clientes");

    request.onupgradeneeded = (ev)=> {
        db = ev.target.result;
        if (!db.objectStoreNames.contains("clientes")) {
            db.createObjectStore("clientes", {keyPath: "email"});
        }
    }

    request.onerror = (ev) => {
        mostrarError("Algo sucedió con la base de datos",ev.target)
    }
    request.onsuccess = (ev)=>{
        db = ev.target.result;

        if (selectEmail){
            console.log("miau")
            rellenarSelectClientes()
        }

        if (contenidoTabla){
            obtenerDatosClientes(db)
                .then(datosClientes => {
                    pintarClientes(datosClientes)
                })
        }

    }
}

function actualizarCliente(datosNuevos){
    const transaccion = db.transaction("clientes","readwrite")
    const clientesActuales = transaccion.objectStore("clientes")
    const request = clientesActuales.put(datosNuevos)

    request.onerror = function (){
        mostrarError(request.onerror.name,formulario)
    }

}

function guardarDatosCliente(){
    const transaccion = db.transaction("clientes","readwrite")
    const clientesActuales = transaccion.objectStore("clientes")
    const request = clientesActuales.add(datosCliente)

    request.onsuccess = function() { // (4)
        console.log("Cliente agregado", request.result);
    };

    request.onerror = (ev)=> {
        console.log(ev.target.error.name)
        if (ev.target.error.name === "ConstraintError"){
            console.log("Actualizando datos del cliente...")
            actualizarCliente(datosCliente)
        } else {
            console.log("wao error inesperado")
        }
    };
}

function borrarCliente(idCliente,clientRow){
    const transaccion = db.transaction("clientes","readwrite")
    const clienteActuales = transaccion.objectStore("clientes")
    const request = clienteActuales.delete(idCliente)
    request.onsuccess = function() {
        console.log("Cliente borrado")
        clientRow.remove();
    }

    request.onerror = function() {
        console.log("Algo fue mal")
    }
}


function obtenerDatosClientes(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("clientes", "readonly");
        const datosClientes = transaction.objectStore("clientes");

        const request = datosClientes.getAll(); // Obtener todos los registros

        request.onsuccess = (event) => {
            resolve(event.target.result); // Resuelve la promesa con el resultado
        };

        request.onerror = (event) => {
            reject(event.target.error); // Rechaza la promesa si hay un error
        };
    });
}


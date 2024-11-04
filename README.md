# 1ª Funcionalidad
## Búsqueda del cliente por nombre
Esta funcionalidad tiene con un fin el poder agilizar la búsqueda de información de clientes.
Para hacer ello he puesto un input en el html que serviría para escribir el nombre del usuario que estás buscando en la lista
y en el código javascript he puesto un listener blur a ese input y ejecuto una función para buscar y pintar los resultados filtrados

El código aplicado es este:
```javascript
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
```
La función obtenerDatosClientes se usa obtener todos los clientes que haya en la base de datos y se usa promesas para ello
```javascript
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
```

El resultado de la busqueda es de tal manera que encuentra los nombres y si uno no aparece no pintará nada.

# 2ª Funcionalidad
## Ordenar alfabéticamente los nombres
Esta funcionalidad también va orientada a facilitar y facilitar las busquedas de cliente, aunque de una manera más sencilla
y menos práctica, pero algo más rápida si estás buscando un nombre que esté al final de la lista de clientes.
La funcionalidad es sencilla, al pusar un botón se ejecuta una función que se encarga de ordenar o revertir la lista de clientes
acorde al nombre

El código utilizado es el siguiente:
```javascript
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
```
Es la funcionalidad más sencilla de las tres.


# 3ª Funcionalidad
## Obtener información de un cliente
Esta funcionalidad sirve para obtener la información de un único cliente acorde a su email, ayuda a ver la información del cliente
que queramos de una forma más limpia y más clara, al estar separadada del resto

Para realizar eso, he creado otro archivo html llamado perfilCliente.html, en el que he añadido un select en el que 
estarán los emails que estén en la base de datos, cuando selecciones uno de los emails aparecerán todos los datos del cliente que use
ese email para ello he utilizado las siguientes funciones
```javascript
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
```

```javascript
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
```
```javascript
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
```

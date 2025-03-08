// URL base de la API
const API_URL = "https://gestorempleados-production.up.railway.app/api";

// Función para mostrar mensajes de éxito o error

function mostrarMensaje(mensaje, esError = false) {
    const mensajeError = document.getElementById("mensaje-error");
    const mensajeTexto = document.getElementById("mensaje-texto");

    // Mostrar el mensaje
    mensajeTexto.textContent = mensaje;

    // Aplicar clases CSS según el tipo de mensaje
    if (esError) {
        mensajeError.className = "mensaje-error"; // Clase para errores
    } else {
        mensajeError.className = "mensaje-exito"; // Clase para éxito
    }

    // Mostrar el contenedor de mensajes
    mensajeError.style.display = "flex"; // Usar flexbox para alinear el texto y la "X"
}

// Función para cerrar el mensaje
function cerrarMensaje() {
    const mensajeError = document.getElementById("mensaje-error");
    mensajeError.style.display = "none"; // Ocultar el mensaje
}

// Función para listar empleados
// Función para listar empleados
async function listarEmpleados() {
    try {
        const response = await fetch(`${API_URL}/empleados`);
        if (!response.ok) {
            throw new Error("Error al obtener la lista de empleados");
        }
        const empleados = await response.json();

        const tablaEmpleados = document.getElementById("tabla-empleados").getElementsByTagName("tbody")[0];
        tablaEmpleados.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos elementos

        empleados.forEach(empleado => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${empleado.id_empleado}</td>
                <td>${empleado.nombre}</td>
                <td>${empleado.apellido}</td>
                <td>${empleado.sueldo.toFixed(2)}</td>
                <td>${empleado.puesto}</td>
                <td class="acciones">
                    <button class="editar" onclick="editarEmpleado(${empleado.id_empleado})">Editar</button>
                    <button class="eliminar" onclick="eliminarEmpleado(${empleado.id_empleado})">Eliminar</button>
                </td>
            `;

            tablaEmpleados.appendChild(fila);
        });
    } catch (error) {
        console.error("Error:", error);
        mostrarMensaje(error.message, true);
    }
}

// Función para crear o actualizar un empleado

async function crearEmpleado(event) {
    event.preventDefault(); // Evitar que el formulario se envíe de manera tradicional

    try {
        const id_empleado = document.getElementById("id_empleado").value;
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const sueldo = parseFloat(document.getElementById("sueldo").value);
        const puesto = document.getElementById("puesto").value;

        const empleado = {
            id_empleado: id_empleado || null,
            nombre,
            apellido,
            sueldo,
            puesto
        };

        // Determinar si es una creación o una actualización
        const url = id_empleado ? `${API_URL}/editar/${id_empleado}` : `${API_URL}/crear`;
        const method = id_empleado ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(empleado)
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.mensaje || "Error al guardar el empleado");
        }

        // Limpiar el formulario
        document.getElementById("form-empleado").reset();
        document.getElementById("id_empleado").value = "";

        // Cambiar el texto del botón de "Editar" a "Guardar"
        const botonGuardar = document.querySelector("#form-empleado button[type='submit']");
        botonGuardar.textContent = "Guardar";

        // Ocultar el botón de "Cancelar"
        const botonCancelar = document.getElementById("cancelar-edicion");
        botonCancelar.style.display = "none";

        mostrarMensaje("Empleado guardado exitosamente", false);
        listarEmpleados(); // Actualizar la lista de empleados
    } catch (error) {
        console.error("Error:", error);
        mostrarMensaje(error.message, true);
    }
}
// Función para editar un empleado
async function editarEmpleado(id_empleado) {
    try {
        const response = await fetch(`${API_URL}/buscar/${id_empleado}`);
        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.mensaje || "Error al buscar el empleado");
        }

        const empleado = await response.json();

        // Llenar el formulario con los datos del empleado
        document.getElementById("id_empleado").value = empleado.id_empleado;
        document.getElementById("nombre").value = empleado.nombre;
        document.getElementById("apellido").value = empleado.apellido;
        document.getElementById("sueldo").value = empleado.sueldo;
        document.getElementById("puesto").value = empleado.puesto;

        // Cambiar el texto del botón de "Guardar" a "Editar"
        const botonGuardar = document.querySelector("#form-empleado button[type='submit']");
        botonGuardar.textContent = "Editar";

        // Mostrar el botón de "Cancelar"
        const botonCancelar = document.getElementById("cancelar-edicion");
        botonCancelar.style.display = "inline-block";

        mostrarMensaje("Empleado cargado para editar", false);
    } catch (error) {
        console.error("Error:", error);
        mostrarMensaje(error.message, true);
    }
}

// Función para cancelar la edición
function cancelarEdicion() {
    // Limpiar el formulario
    document.getElementById("form-empleado").reset();
    document.getElementById("id_empleado").value = "";

    // Cambiar el texto del botón de "Editar" a "Guardar"
    const botonGuardar = document.querySelector("#form-empleado button[type='submit']");
    botonGuardar.textContent = "Guardar";

    // Ocultar el botón de "Cancelar"
    const botonCancelar = document.getElementById("cancelar-edicion");
    botonCancelar.style.display = "none";

    mostrarMensaje("Edición cancelada", false);
}

// Función para eliminar un empleado
async function eliminarEmpleado(id_empleado) {
    try {
        const response = await fetch(`${API_URL}/eliminar/${id_empleado}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.mensaje || "Error al eliminar el empleado");
        }

        mostrarMensaje("Empleado con id "+ id_empleado + " eliminado exitosamente", false);
        listarEmpleados(); // Actualizar la lista de empleados
    } catch (error) {
        console.error("Error:", error);
        mostrarMensaje(error.message, true);
    }
}


// Función para buscar un empleado por ID

async function buscarEmpleadoPorId() {
    try {
        const idEmpleado = document.getElementById("id-buscar").value;

        // Validar que el ID no esté vacío
        if (!idEmpleado) {
            mostrarMensajeBusqueda("Por favor, ingrese un ID válido.", true);
            return;
        }

        // Realizar la solicitud al endpoint de búsqueda
        const response = await fetch(`${API_URL}/buscar/${idEmpleado}`);

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.mensaje || "No se encontró el empleado con el ID proporcionado.");
        }

        const empleado = await response.json();

        // Mostrar el empleado encontrado en la tabla
        const tablaEmpleados = document.getElementById("tabla-empleados").getElementsByTagName("tbody")[0];
        tablaEmpleados.innerHTML = ""; // Limpiar la tabla antes de agregar el empleado encontrado

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${empleado.id_empleado}</td>
            <td>${empleado.nombre}</td>
            <td>${empleado.apellido}</td>
            <td>${empleado.sueldo.toFixed(2)}</td>
            <td>${empleado.puesto}</td>
            <td class="acciones">
                <button class="editar" onclick="editarEmpleado(${empleado.id_empleado})">Editar</button>
                <button class="eliminar" onclick="eliminarEmpleado(${empleado.id_empleado})">Eliminar</button>
            </td>
        `;

        tablaEmpleados.appendChild(fila);

        // Mostrar el botón "Volver atrás"
        //document.getElementById("volver-atras").style.display = "inline-block";

        mostrarMensajeBusqueda("Empleado encontrado", false);
        
    } catch (error) {
        console.error("Error:", error);
        mostrarMensajeBusqueda(error.message, true); // Mostrar mensaje de error
    }
}


// Función para mostrar mensajes de búsqueda
function mostrarMensajeBusqueda(mensaje, esError = false) {
    const mensajeBusqueda = document.getElementById("mensaje-busqueda");
    const mensajeTextoBusqueda = document.getElementById("mensaje-busqueda-texto");

    // Mostrar el mensaje
    mensajeTextoBusqueda.textContent = mensaje;

    // Aplicar clases CSS según el tipo de mensaje
    if (esError) {
        mensajeBusqueda.className = "mensaje-error-busqueda"; // Error
    } else {
        mensajeBusqueda.className = "mensaje-exito-busqueda"; // Éxito
    }

    // Mostrar el contenedor de mensajes
    mensajeBusqueda.style.display = "flex"; // Usar flexbox para alinear el texto y la "X"
}

// Función para cerrar el mensaje de búsqueda
function cerrarMensajeBusqueda() {
    const mensajeBusqueda = document.getElementById("mensaje-busqueda");
    mensajeBusqueda.style.display = "none"; // Ocultar el mensaje
}


// Función para volver a la lista completa de empleados
function volverAtras() {
    // Ocultar el botón "Volver atrás"
   // document.getElementById("volver-atras").style.display = "none";

    // Limpiar el campo de búsqueda
    document.getElementById("id-buscar").value = "";

    // Mostrar la lista completa de empleados
    listarEmpleados();
}
// Cargar la lista de empleados al iniciar la página
document.addEventListener("DOMContentLoaded", listarEmpleados);

// Asignar el evento submit al formulario
document.getElementById("form-empleado").addEventListener("submit", crearEmpleado);
// ==========================================
// LÓGICA DE PRODUCTOS Y LOCALSTORAGE
// ==========================================

// 1. Validar e iniciar la base de datos local
let misProductos = [];
const imagenGenerica = "https://via.placeholder.com/500x300/e9ecef/1d3557?text=Sin+Imagen+Disponible";

const productosBase = [
    { id: 1, nombre: 'Hamburguesa Clásica', desc: 'Carne, queso, lechuga y tomate.', precio: 5500, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
    { id: 2, nombre: 'Completo Italiano', desc: 'Palta, tomate y mayonesa casera.', precio: 3200, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
];

if (!localStorage.getItem('datosMenuSanguchon')) {
    localStorage.setItem('datosMenuSanguchon', JSON.stringify(productosBase));
}
misProductos = JSON.parse(localStorage.getItem('datosMenuSanguchon'));


// 2. Renderizar en INICIO (index.html)
function pintarMenuInicio() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return; 

    grid.innerHTML = ''; 
    
    misProductos.forEach(producto => {
        grid.innerHTML += `
            <article class="product-card">
                <img src="${producto.img}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.desc}</p>
                <span class="price">$${producto.precio.toLocaleString('es-CL')}</span>
                <!-- AQUÍ AGREGAMOS LA FUNCIÓN DEL CARRITO -->
                <button class="add-btn" onclick="agregarAlCarrito(${producto.id})">Añadir al carrito</button>
            </article>
        `;
    });
}



// 3. Renderizar en ADMIN (admin.html)
function pintarMenuAdmin() {
    const tbody = document.getElementById('adminProductsBody');
    if (!tbody) return; // Si no existe el elemento (estamos en index), salir.

    tbody.innerHTML = ''; // Limpiar tabla
    
    misProductos.forEach(producto => {
        tbody.innerHTML += `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;"><img src="${producto.img}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 5px;"></td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${producto.nombre}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">$${producto.precio.toLocaleString('es-CL')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;"><button onclick="borrarProducto(${producto.id})" style="background:#e63946; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">🗑️ Eliminar</button></td>
            </tr>
        `;
    });
}


// 4. Guardar producto final en memoria
function guardarEnMemoria(nombre, desc, precio, imagenBase64) {
    const nuevoProducto = {
        id: Date.now(),
        nombre: nombre,
        desc: desc,
        precio: parseInt(precio),
        img: imagenBase64
    };

    misProductos.push(nuevoProducto);
    localStorage.setItem('datosMenuSanguchon', JSON.stringify(misProductos));
    
    alert("¡Producto guardado exitosamente!");
    document.getElementById('addProductForm').reset();
    pintarMenuAdmin();
}


// 5. Procesar formulario desde Admin
function crearProducto(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('prodNombre').value;
    const desc = document.getElementById('prodDesc').value;
    const precio = document.getElementById('prodPrecio').value;
    const inputFile = document.getElementById('prodImg');

    if (inputFile.files && inputFile.files[0]) {
        // CON IMAGEN: Leerla y redimensionarla
        const archivo = inputFile.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Redimensionar para que no sature la memoria
                const MAX_WIDTH = 400;
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imagenComprimida = canvas.toDataURL('image/jpeg', 0.7);
                
                guardarEnMemoria(nombre, desc, precio, imagenComprimida);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(archivo);
    } else {
        // SIN IMAGEN: Usar genérica
        guardarEnMemoria(nombre, desc, precio, imagenGenerica);
    }
}


// 6. Eliminar producto
function borrarProducto(id) {
    if(confirm("¿Seguro que deseas eliminar este producto?")) {
        misProductos = misProductos.filter(prod => prod.id !== id);
        localStorage.setItem('datosMenuSanguchon', JSON.stringify(misProductos));
        pintarMenuAdmin();
    }
}


// 7. Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    pintarMenuInicio();
    pintarMenuAdmin();

    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', crearProducto);
    }
});

// ==========================================
// LÓGICA DEL CARRITO DE COMPRAS
// ==========================================

// 1. Inicializar el carrito (leemos si ya hay algo guardado)
let carrito = JSON.parse(localStorage.getItem('carritoSanguchon')) || [];

// 2. Función para actualizar el botón del Navbar
function actualizarBotonCarrito() {
    const btnCarrito = document.querySelector('.cart-btn');
    if (!btnCarrito) return;

    // Sumamos la cantidad total de productos
    const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    // Sumamos el precio total
    const precioTotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    if (cantidadTotal > 0) {
        btnCarrito.innerText = `🛒 Carrito (${cantidadTotal}) - $${precioTotal.toLocaleString('es-CL')}`;
    } else {
        btnCarrito.innerText = `🛒 Carrito (0)`;
    }
}

// 3. Función que se ejecuta al presionar "Añadir al carrito"
function agregarAlCarrito(idProducto) {
    // Buscamos qué producto fue el que seleccionó
    const productoSeleccionado = misProductos.find(prod => prod.id === idProducto);
    if (!productoSeleccionado) return;

    // Revisamos si ese producto ya estaba en el carrito
    const itemEnCarrito = carrito.find(item => item.id === idProducto);

    if (itemEnCarrito) {
        // Si ya estaba, le sumamos 1 a la cantidad
        itemEnCarrito.cantidad++;
    } else {
        // Si es nuevo, lo agregamos al carrito con cantidad 1
        carrito.push({
            id: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            precio: productoSeleccionado.precio,
            cantidad: 1
        });
    }

    // Guardamos el carrito actualizado en el navegador
    localStorage.setItem('carritoSanguchon', JSON.stringify(carrito));
    
    // Actualizamos el botón de arriba
    actualizarBotonCarrito();

    // Pequeño aviso visual (puedes borrarlo después si te molesta)
    alert(`¡Agregaste ${productoSeleccionado.nombre} al carrito!`);
}

// 4. Asegurarnos de que el botón se actualice apenas cargue la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarBotonCarrito();
});


// ==========================================
// FUNCIONES DEL MENÚ LATERAL DEL CARRITO
// ==========================================

// 1. Abrir y Cerrar el panel
function abrirCarrito() {
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
    dibujarCarritoLateral(); // Refresca los datos al abrir
}

function cerrarCarrito() {
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
}

// 2. Dibujar los productos dentro del carrito
function dibujarCarritoLateral() {
    const contenedorItems = document.getElementById('cart-items');
    const precioTotalSpan = document.getElementById('cart-total-price');
    if (!contenedorItems) return;

    contenedorItems.innerHTML = ''; // Limpiamos

    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p style="text-align:center; color:#666;">Tu carrito está vacío 🍔</p>';
        precioTotalSpan.innerText = '$0';
        return;
    }

    let totalPlata = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalPlata += subtotal;

        contenedorItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>${item.cantidad} x $${item.precio.toLocaleString('es-CL')} = $${subtotal.toLocaleString('es-CL')}</p>
                </div>
                <button class="remove-item-btn" onclick="quitarDelCarrito(${index})">🗑️</button>
            </div>
        `;
    });

    precioTotalSpan.innerText = `$${totalPlata.toLocaleString('es-CL')}`;
}

// 3. Quitar un producto del carrito
function quitarDelCarrito(indice) {
    carrito.splice(indice, 1); // Elimina el elemento de la lista
    localStorage.setItem('carritoSanguchon', JSON.stringify(carrito));
    actualizarBotonCarrito();
    dibujarCarritoLateral();
}

// 4. Simular el pago
function pagarPedido() {
    if (carrito.length === 0) {
        alert("¡Tu carrito está vacío! Agrega algo rico primero.");
        return;
    }
    alert("¡Pago simulado con éxito! Preparando tu pedido 🥪");
    carrito = []; // Vaciamos el carrito
    localStorage.setItem('carritoSanguchon', JSON.stringify(carrito));
    actualizarBotonCarrito();
    cerrarCarrito();
}

// 5. Configurar los botones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Escuchar el clic del botón del carrito en el navbar
    const btnCarrito = document.querySelector('.cart-btn');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', abrirCarrito);
    }

    // Escuchar los clics para cerrar el carrito
    const btnCerrar = document.getElementById('close-cart-btn');
    const overlay = document.getElementById('cart-overlay');
    
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarCarrito);
    if (overlay) overlay.addEventListener('click', cerrarCarrito); // Cierra si haces clic afuera
});
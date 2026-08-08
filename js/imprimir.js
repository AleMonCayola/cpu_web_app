function initImprimir() {
  const inputTitulo = document.getElementById('titulo-lista');
  const printHeaderTitle = document.getElementById('print-header-title');
  const printFecha = document.getElementById('print-fecha');
  const col1 = document.getElementById('print-tabla-col1');
  const col2 = document.getElementById('print-tabla-col2');
  const btnEjecutarImprimir = document.getElementById('btn-ejecutar-imprimir');

  const hoy = new Date();
  if (printFecha) {
    printFecha.textContent = hoy.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  if (inputTitulo && printHeaderTitle) {
    inputTitulo.addEventListener('input', (e) => {
      printHeaderTitle.textContent = e.target.value.toUpperCase();
    });
  }

  async function cargarListaImpresion() {
    try {
      const { data: productos, error } = await db.from('productos').select('*');
      if (error) throw error;

      const productosActivos = productos.filter(p => p.estado && p.estado.toLowerCase() === 'activo');
      productosActivos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

      if (col1 && col2) {
        col1.innerHTML = '';
        col2.innerHTML = '';

        const mitad = Math.ceil(productosActivos.length / 2);
        const grupo1 = productosActivos.slice(0, mitad);
        const grupo2 = productosActivos.slice(mitad);

        const renderFilas = (lista, contenedor) => {
          lista.forEach(p => {
            const precioVenta = parseFloat(p.precio_venta) || 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td class="col-prod"><strong>${p.nombre}</strong></td>
              <td class="col-precio text-right">Bs. ${precioVenta.toFixed(2)}</td>
            `;
            contenedor.appendChild(tr);
          });
        };

        renderFilas(grupo1, col1);
        renderFilas(grupo2, col2);
      }
    } catch (error) {
      console.error('Error al generar lista de impresión:', error);
    }
  }

  if (btnEjecutarImprimir) {
    btnEjecutarImprimir.addEventListener('click', () => {
      window.print();
    });
  }

  cargarListaImpresion();
}
function initProductos() {
  const form = document.getElementById('form-producto');
  const inputBuscar = document.getElementById('input-buscar');
  const tablaBody = document.getElementById('tabla-productos');

  const inputNombre = document.getElementById('nombre');
  const inputUnidades = document.getElementById('unidades');
  const inputPrecioPaquete = document.getElementById('precio-paquete');
  const inputPrecioUnitario = document.getElementById('precio-unitario');
  const inputPrecioVenta = document.getElementById('precio-venta');

  const modalEditar = document.getElementById('modal-editar');
  const formEditar = document.getElementById('form-editar-producto');
  const btnCancelarModal = document.getElementById('btn-cancelar-modal');
  const editId = document.getElementById('edit-id');
  const editNombre = document.getElementById('edit-nombre');
  const editUnidades = document.getElementById('edit-unidades');
  const editPrecioPaquete = document.getElementById('edit-precio-paquete');
  const editPrecioUnitario = document.getElementById('edit-precio-unitario');
  const editPrecioVenta = document.getElementById('edit-precio-venta');

  if (!form || !tablaBody) return;

  function autoCalcularUnitario(unidadesInput, paqueteInput, unitarioInput) {
    const unidades = parseInt(unidadesInput.value) || 0;
    const precioPaquete = parseFloat(paqueteInput.value) || 0;
    if (unidades > 0 && precioPaquete > 0) {
      unitarioInput.value = (precioPaquete / unidades).toFixed(2);
    }
  }

  inputUnidades.addEventListener('input', () => autoCalcularUnitario(inputUnidades, inputPrecioPaquete, inputPrecioUnitario));
  inputPrecioPaquete.addEventListener('input', () => autoCalcularUnitario(inputUnidades, inputPrecioPaquete, inputPrecioUnitario));
  editUnidades.addEventListener('input', () => autoCalcularUnitario(editUnidades, editPrecioPaquete, editPrecioUnitario));
  editPrecioPaquete.addEventListener('input', () => autoCalcularUnitario(editUnidades, editPrecioPaquete, editPrecioUnitario));

  async function renderTabla(filtro = '') {
    try {
      let query = db.from('productos').select('*').order('id', { ascending: false });

      if (filtro.trim() !== '') {
        query = query.ilike('nombre', `%${filtro}%`);
      }

      const { data: productos, error } = await query;
      if (error) throw error;

      tablaBody.innerHTML = '';

      productos.forEach(p => {
        const unidades = parseInt(p.unidades_por_paquete) || 0;
        const precioPaquete = parseFloat(p.precio_paquete) || 0;
        const costoUnitario = parseFloat(p.costo_unitario) || (unidades > 0 ? precioPaquete / unidades : 0);
        const precioVenta = parseFloat(p.precio_venta) || 0;
        const estadoActual = p.estado || 'activo';
        const esActivo = estadoActual.toLowerCase() === 'activo';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.id}</td>
          <td><strong>${p.nombre}</strong></td>
          <td>${unidades} unid.</td>
          <td>Bs. ${precioPaquete.toFixed(2)}</td>
          <td>Bs. ${costoUnitario.toFixed(2)}</td>
          <td>Bs. ${precioVenta.toFixed(2)}</td>
          <td>
            <button 
              class="btn-status ${esActivo ? 'status-activo' : 'status-inactivo'}" 
              data-id="${p.id}" 
              data-estado="${estadoActual}">
              ${esActivo ? '🟢 Activo' : '🔴 Inactivo'}
            </button>
          </td>
          <td>
            <button class="btn-action btn-edit" data-id="${p.id}">✏️ Editar</button>
            <button class="btn-action btn-delete" data-id="${p.id}">🗑️ Borrar</button>
          </td>
        `;
        tablaBody.appendChild(tr);
      });

      // Eventos
      tablaBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => abrirModalEdicion(btn.dataset.id, productos));
      });

      tablaBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => borrarProducto(btn.dataset.id));
      });

      tablaBody.querySelectorAll('.btn-status').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const estadoActual = btn.dataset.estado;
          const nuevoEstado = estadoActual.toLowerCase() === 'activo' ? 'inactivo' : 'activo';

          const { error } = await db.from('productos').update({ estado: nuevoEstado }).eq('id', id);
          if (!error) renderTabla(inputBuscar ? inputBuscar.value : '');
        });
      });

    } catch (error) {
      console.error('Error al renderizar productos:', error);
    }
  }

  // Guardar Nuevo Producto
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = inputNombre.value;
    const unidades_por_paquete = parseInt(inputUnidades.value) || 1;
    const precio_paquete = parseFloat(inputPrecioPaquete.value) || 0;
    const precio_venta = parseFloat(inputPrecioVenta.value) || 0;

    try {
      const { error } = await db.from('productos').insert([
        { nombre, unidades_por_paquete, precio_paquete, precio_venta }
      ]);

      if (error) throw error;
      
      form.reset();
      renderTabla();
    } catch (error) {
      console.error('Error al registrar producto:', error);
    }
  });

  function abrirModalEdicion(id, productos) {
    const p = productos.find(prod => prod.id == id);
    if (!p) return;

    editId.value = p.id;
    editNombre.value = p.nombre;
    editUnidades.value = p.unidades_por_paquete;
    editPrecioPaquete.value = p.precio_paquete;
    editPrecioUnitario.value = p.costo_unitario;
    editPrecioVenta.value = p.precio_venta || 0;

    modalEditar.style.display = 'flex';
  }

  // Editar Producto
  formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editId.value;
    const nombre = editNombre.value;
    const unidades_por_paquete = parseInt(editUnidades.value) || 1;
    const precio_paquete = parseFloat(editPrecioPaquete.value) || 0;
    const precio_venta = parseFloat(editPrecioVenta.value) || 0;

    const { error } = await db.from('productos').update({
      nombre,
      unidades_por_paquete,
      precio_paquete,
      precio_venta
    }).eq('id', id);

    if (!error) {
      modalEditar.style.display = 'none';
      renderTabla();
    }
  });

  btnCancelarModal.addEventListener('click', () => {
    modalEditar.style.display = 'none';
  });

  async function borrarProducto(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const { error } = await db.from('productos').delete().eq('id', id);
      if (!error) renderTabla();
    }
  }

  if (inputBuscar) {
    inputBuscar.addEventListener('input', (e) => renderTabla(e.target.value));
  }

  renderTabla();
}
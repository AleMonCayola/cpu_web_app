function initCalculadora() {
  const calcBuscar = document.getElementById('calc-buscar');
  const tablaBody = document.getElementById('tabla-calculadora');

  async function renderCalculadora(filtro = '') {
    let query = db.from('productos').select('*').order('id', { ascending: false });

    if (filtro.trim() !== '') {
      query = query.ilike('nombre', `%${filtro}%`);
    }

    const { data: productos, error } = await query;
    if (error) {
      console.error('Error en calculadora:', error);
      return;
    }

    tablaBody.innerHTML = '';

    productos.forEach(p => {
      const costoUnitario = parseFloat(p.costo_unitario) || 0;
      const unidades = parseInt(p.unidades_por_paquete) || 0;
      const precioPaquete = parseFloat(p.precio_paquete) || 0;
      const precioVentaDb = parseFloat(p.precio_venta) || 0;

      const precioVentaInicial = (precioVentaDb > 0) ? precioVentaDb : (Math.ceil(costoUnitario) || costoUnitario);

      const tr = document.createElement('tr');
      tr.setAttribute('data-id', p.id);

      tr.innerHTML = `
        <td><strong>${p.nombre}</strong></td>
        <td>${unidades} unid.</td>
        <td>${precioPaquete.toFixed(2)}</td>
        <td>${costoUnitario.toFixed(2)}</td>
        <td>
          <input 
            type="number" 
            step="0.10" 
            class="input-precio-venta" 
            data-id="${p.id}"
            data-costo="${costoUnitario}" 
            data-unidades="${unidades}"
            value="${precioVentaInicial.toFixed(2)}"
            style="width: 100px; padding: 5px; text-align: right; border: 1px solid #cbd5e1; border-radius: 4px; transition: background-color 0.3s;"
          >
        </td>
        <td class="cell-ganancia-unidad">0.00</td>
        <td class="cell-ganancia-total" style="font-weight: bold;">0.00</td>
      `;

      tablaBody.appendChild(tr);

      const inputVenta = tr.querySelector('.input-precio-venta');
      calcularFila(tr, inputVenta);

      inputVenta.addEventListener('input', () => calcularFila(tr, inputVenta));

      // Guardar en Supabase al perder foco o presionar enter
      inputVenta.addEventListener('change', async () => {
        const nuevoPrecio = parseFloat(inputVenta.value) || 0;
        const prodId = inputVenta.getAttribute('data-id');

        try {
          const { error } = await db.from('productos').update({ precio_venta: nuevoPrecio }).eq('id', prodId);
          if (error) throw error;

          inputVenta.style.backgroundColor = '#dcfce7'; 
          setTimeout(() => inputVenta.style.backgroundColor = '#ffffff', 600);
        } catch (err) {
          console.error("Error guardando precio:", err);
          inputVenta.style.backgroundColor = '#fee2e2';
        }
      });
    });
  }

  function calcularFila(tr, input) {
    const costoUnitario = parseFloat(input.getAttribute('data-costo')) || 0;
    const unidades = parseInt(input.getAttribute('data-unidades')) || 0;
    const precioVenta = parseFloat(input.value) || 0;

    const gananciaUnidad = precioVenta - costoUnitario;
    const gananciaTotal = gananciaUnidad * unidades;

    const cellGananciaUnidad = tr.querySelector('.cell-ganancia-unidad');
    const cellGananciaTotal = tr.querySelector('.cell-ganancia-total');

    cellGananciaUnidad.textContent = `${gananciaUnidad.toFixed(2)}`;
    cellGananciaTotal.textContent = `${gananciaTotal.toFixed(2)}`;

    if (gananciaUnidad > 0) {
      cellGananciaUnidad.style.color = 'var(--success)';
      cellGananciaTotal.style.color = 'var(--success)';
    } else if (gananciaUnidad < 0) {
      cellGananciaUnidad.style.color = '#f38ba8';
      cellGananciaTotal.style.color = '#f38ba8';
    } else {
      cellGananciaUnidad.style.color = 'var(--text-main)';
    }
  }

  if (calcBuscar) {
    calcBuscar.addEventListener('input', (e) => renderCalculadora(e.target.value));
  }

  renderCalculadora();
}
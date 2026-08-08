const contentArea = document.getElementById('content-area');
const btnProductos = document.getElementById('btn-productos');
const btnCalculadora = document.getElementById('btn-calculadora');
const btnImprimir = document.getElementById('btn-imprimir');

async function cargarVista(vista) {
  try {
    const res = await fetch(`views/${vista}.html`);
    const html = await res.text();
    contentArea.innerHTML = html;

    if (vista === 'productos' && typeof initProductos === 'function') initProductos();
    if (vista === 'calculadora' && typeof initCalculadora === 'function') initCalculadora();
    if (vista === 'imprimir' && typeof initImprimir === 'function') initImprimir();
  } catch (error) {
    console.error('Error cargando la vista:', error);
  }
}

function desactivarBotones() {
  btnProductos.classList.remove('active');
  btnCalculadora.classList.remove('active');
  if (btnImprimir) btnImprimir.classList.remove('active');
}

btnProductos.addEventListener('click', () => {
  desactivarBotones();
  btnProductos.classList.add('active');
  cargarVista('productos');
});

btnCalculadora.addEventListener('click', () => {
  desactivarBotones();
  btnCalculadora.classList.add('active');
  cargarVista('calculadora');
});

if (btnImprimir) {
  btnImprimir.addEventListener('click', () => {
    desactivarBotones();
    btnImprimir.classList.add('active');
    cargarVista('imprimir');
  });
}

cargarVista('productos');
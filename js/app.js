const contentArea = document.getElementById('content-area');
const btnProductos = document.getElementById('btn-productos');
const btnCalculadora = document.getElementById('btn-calculadora');
const btnImprimir = document.getElementById('btn-imprimir');

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');

const sidebar = document.getElementById('sidebar');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');

async function verificarSesion() {
  const { data: { session } } = await db.auth.getSession();

  if (session) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
}

db.auth.onAuthStateChange((event, session) => {
  if (session) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
});

function mostrarApp() {
  loginContainer.style.display = 'none';
  appContainer.style.display = 'flex';
  cargarVista('productos');
}

function mostrarLogin() {
  appContainer.style.display = 'none';
  loginContainer.style.display = 'flex';
  loginForm.reset();
  loginError.style.display = 'none';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  loginError.style.display = 'none';

  const { data, error } = await db.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    loginError.textContent = 'Credenciales inválidas. Verifica tu correo y contraseña.';
    loginError.style.display = 'block';
  } else {
    mostrarApp();
  }
});

if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    await db.auth.signOut();
    cerrarMenu();
    mostrarLogin();
  });
}


function abrirMenu() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
}

function cerrarMenu() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', abrirMenu);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', cerrarMenu);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', cerrarMenu);

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
  cerrarMenu();
});

btnCalculadora.addEventListener('click', () => {
  desactivarBotones();
  btnCalculadora.classList.add('active');
  cargarVista('calculadora');
  cerrarMenu();
});

if (btnImprimir) {
  btnImprimir.addEventListener('click', () => {
    desactivarBotones();
    btnImprimir.classList.add('active');
    cargarVista('imprimir');
    cerrarMenu();
  });
}

verificarSesion();
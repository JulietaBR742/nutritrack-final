// api.js — todas las llamadas al backend pasan por aquí
const BASE_URL = '/api';  // usa proxy de Vite — visible en Network del navegador

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('nutritrack_token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res  = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

// AUTH
export const authService = {
  login:        (email, password) => apiFetch('/auth/login',    { method:'POST', body: JSON.stringify({ email, password }) }),
  registro:     (datos)           => apiFetch('/auth/registro', { method:'POST', body: JSON.stringify(datos) }),
  logout:       ()                => { localStorage.removeItem('nutritrack_token'); localStorage.removeItem('nutritrack_usuario'); },
  getUsuario:   ()                => { const r = localStorage.getItem('nutritrack_usuario'); return r ? JSON.parse(r) : null; },
  guardarSesion:(token, usuario)  => { localStorage.setItem('nutritrack_token', token); localStorage.setItem('nutritrack_usuario', JSON.stringify(usuario)); },
};

// DASHBOARD
export const dashboardService = {
  resumen: (fecha) => apiFetch(`/dashboard${fecha ? `?fecha=${fecha}` : ''}`),
};

// ALIMENTOS
export const alimentosService = {
  listar: (categoria, buscar) => {
    const p = new URLSearchParams();
    if (categoria && categoria !== 'todos') p.set('categoria', categoria);
    if (buscar) p.set('buscar', buscar);
    return apiFetch(`/alimentos${p.toString() ? `?${p}` : ''}`);
  },
  obtener: (id)    => apiFetch(`/alimentos/${id}`),
  crear:   (datos) => apiFetch('/alimentos', { method:'POST', body: JSON.stringify(datos) }),
};

// REGISTROS
export const registrosService = {
  listarPorFecha: (fecha) => apiFetch(`/registros${fecha ? `?fecha=${fecha}` : ''}`),
  crear:          (datos) => apiFetch('/registros',       { method:'POST',   body: JSON.stringify(datos) }),
  eliminar:       (id)    => apiFetch(`/registros/${id}`, { method:'DELETE' }),
};

// PERFIL
export const perfilService = {
  obtener:    ()      => apiFetch('/perfil'),
  actualizar: (datos) => apiFetch('/perfil', { method:'PUT', body: JSON.stringify(datos) }),
};

// HISTORIAL
export const historialService = {
  obtenerPeso:   ()      => apiFetch('/historial/peso'),
  registrarPeso: (datos) => apiFetch('/historial/peso', { method:'POST', body: JSON.stringify(datos) }),
  obtenerAgua:   (fecha) => apiFetch(`/historial/agua${fecha ? `?fecha=${fecha}` : ''}`),
  registrarAgua: (datos) => apiFetch('/historial/agua', { method:'POST', body: JSON.stringify(datos) }),
};

// RECETAS
export const recetasService = {
  listar:  ()      => apiFetch('/recetas'),
  obtener: (id)    => apiFetch(`/recetas/${id}`),
  crear:   (datos) => apiFetch('/recetas', { method:'POST', body: JSON.stringify(datos) }),
};

// NOTIFICACIONES
export const notificacionesService = {
  listar:     ()   => apiFetch('/notificaciones'),
  marcarLeida:(id) => apiFetch(`/notificaciones/${id}/leer`,  { method:'PUT' }),
  marcarTodas:()   => apiFetch('/notificaciones/leer-todas',  { method:'PUT' }),
};

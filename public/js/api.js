/* ============================================
   FútbolApp — Cliente API
   ============================================ */

const API_URL = window.location.origin + '/api';

const API = {
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        throw new Error(data.msg || 'Error en la petición');
      }
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};

/* Toast Notifications */
const Toast = {
  show(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type} active`;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

/* Modal helpers */
const Modal = {
  open(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },
  close(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};

/* Compartir */
const Share = {
  copyLink(text) {
    navigator.clipboard.writeText(text).then(() => {
      Toast.show('✓ Link copiado al portapapeles');
    }).catch(() => {
      Toast.show('Error al copiar', 'error');
    });
  },

  whatsapp(text, url) {
    const mensaje = encodeURIComponent(text);
    const link = url ? ` ${url}` : '';
    window.open(`https://wa.me/?text=${mensaje}${encodeURIComponent(link)}`, '_blank');
  }
};

/* Auth Check */
function requireAuth() {
  if (!API.getToken()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

/* Formatear números */
function formatearNumero(n) {
  return new Intl.NumberFormat('es-PE').format(n);
}

/* Formatear fecha */
function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatearHora(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

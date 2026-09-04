/* Shared API client + auth-state helpers */
const API = {
  base: '',
  token() { return localStorage.getItem('jib_token'); },
  user() {
    try { return JSON.parse(localStorage.getItem('jib_user') || 'null'); }
    catch (e) { return null; }
  },
  setSession(token, user) {
    localStorage.setItem('jib_token', token);
    localStorage.setItem('jib_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('jib_token');
    localStorage.removeItem('jib_user');
  },
  async request(method, pathname, body) {
    const headers = { 'Content-Type': 'application/json' };
    const t = this.token();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    const res = await fetch(this.base + pathname, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  },
  get(p) { return this.request('GET', p); },
  post(p, b) { return this.request('POST', p, b); },
  put(p, b) { return this.request('PUT', p, b); }
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function badgeClass(status) {
  return 'badge badge-' + status.replace(/\s+/g, '-');
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
  return Math.floor(diff / 86400) + ' days ago';
}

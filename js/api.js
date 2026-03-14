// ════════════════════════════════════════════════
// TIMETRIX — API SERVICE
// Connects frontend to Node.js backend
// ════════════════════════════════════════════════

const API_URL = 'http://localhost:5000/api';

// ── GET TOKEN ─────────────────────────────────
function getToken() {
  return localStorage.getItem('timetrix_token');
}

// ── HEADERS ───────────────────────────────────
function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// ── AUTH ──────────────────────────────────────
const Auth = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });
    return res.json();
  },

  async createAccount(data) {
    const res = await fetch(`${API_URL}/auth/create`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_URL}/auth/users`, { headers: headers() });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${API_URL}/auth/users/${id}`, {
      method:  'DELETE',
      headers: headers()
    });
    return res.json();
  }
};

// ── FACULTY ───────────────────────────────────
const Faculty = {
  async getAll() {
    const res = await fetch(`${API_URL}/faculty`, { headers: headers() });
    return res.json();
  },

  async add(data) {
    const res = await fetch(`${API_URL}/faculty`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_URL}/faculty/${id}`, {
      method:  'PUT',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/faculty/${id}`, {
      method:  'DELETE',
      headers: headers()
    });
    return res.json();
  }
};

// ── ROOMS ─────────────────────────────────────
const Rooms = {
  async getAll() {
    const res = await fetch(`${API_URL}/rooms/rooms`, { headers: headers() });
    return res.json();
  },

  async add(data) {
    const res = await fetch(`${API_URL}/rooms/rooms`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_URL}/rooms/rooms/${id}`, {
      method:  'PUT',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/rooms/rooms/${id}`, {
      method:  'DELETE',
      headers: headers()
    });
    return res.json();
  }
};

// ── LABS ──────────────────────────────────────
const Labs = {
  async getAll() {
    const res = await fetch(`${API_URL}/rooms/labs`, { headers: headers() });
    return res.json();
  },

  async add(data) {
    const res = await fetch(`${API_URL}/rooms/labs`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_URL}/rooms/labs/${id}`, {
      method:  'PUT',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/rooms/labs/${id}`, {
      method:  'DELETE',
      headers: headers()
    });
    return res.json();
  }
};

// ── SUBJECTS ──────────────────────────────────
const Subjects = {
  async getAll() {
    const res = await fetch(`${API_URL}/subjects`, { headers: headers() });
    return res.json();
  },

  async getByYear(year) {
    const res = await fetch(`${API_URL}/subjects/year/${year}`, { headers: headers() });
    return res.json();
  },

  async add(data) {
    const res = await fetch(`${API_URL}/subjects`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_URL}/subjects/${id}`, {
      method:  'PUT',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/subjects/${id}`, {
      method:  'DELETE',
      headers: headers()
    });
    return res.json();
  }
};

// ── TIMETABLE ─────────────────────────────────
const Timetable = {
  async save(data) {
    const res = await fetch(`${API_URL}/timetable`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data)
    });
    return res.json();
  },

  async getByClass(className) {
    const res = await fetch(`${API_URL}/timetable/class/${className}`, { headers: headers() });
    return res.json();
  },

  async getByFaculty(facultyId) {
    const res = await fetch(`${API_URL}/timetable/faculty/${facultyId}`, { headers: headers() });
    return res.json();
  },

  async getAll() {
    const res = await fetch(`${API_URL}/timetable`, { headers: headers() });
    return res.json();
  },

  async clear() {
    const res = await fetch(`${API_URL}/timetable`, {
      method:  'DELETE',
      headers: headers()
    });
    return res.json();
  }
};
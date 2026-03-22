// ════════════════════════════════════════════════
// TIMETRIX — AUTH & ROLE PROTECTION
// Add this to every page!
// ════════════════════════════════════════════════

function checkAuth(allowedRoles = []) {
  const session = sessionStorage.getItem('bca_user');

  // Not logged in → redirect to login
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }

  const user = JSON.parse(session);

  // If roles specified → check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'student') {
      window.location.href = 'timetable-class.html';
      return null;
    }
    if (user.role === 'faculty') {
      window.location.href = 'timetable-faculty.html';
      return null;
    }
  }

  // Set sidebar user info
  const roleEl  = document.getElementById('user-role');
  const emailEl = document.getElementById('user-email');
  if (roleEl)  roleEl.textContent  = user.role.toUpperCase();
  if (emailEl) emailEl.textContent = user.email;

  return user;
}

function logout() {
  sessionStorage.removeItem('bca_user');
  localStorage.removeItem('timetrix_token');
  window.location.href = 'index.html';
}

// ── HIDE ELEMENTS BASED ON ROLE ───────────────
function applyRoleUI(user) {
  if (!user) return;

  // Hide admin-only elements for faculty/student
  if (user.role === 'faculty' || user.role === 'student') {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Hide hod-only elements for others
  if (user.role !== 'hod') {
    document.querySelectorAll('.hod-only').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Hide edit buttons for faculty/student
  if (user.role === 'faculty' || user.role === 'student') {
    document.querySelectorAll('.btn-danger, .btn-ghost').forEach(el => {
      if (el.textContent.includes('Edit') ||
          el.textContent.includes('Delete') ||
          el.textContent.includes('Add')) {
        el.style.display = 'none';
      }
    });
  }
}
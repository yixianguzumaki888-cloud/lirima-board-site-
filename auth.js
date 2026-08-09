// auth.js
// Handles the login/signup modal and keeps the sidebar in sync with Supabase auth state.

const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const authClose = document.getElementById('authClose');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const logoutBtn = document.getElementById('logoutBtn');
const profileLoggedIn = document.getElementById('profileLoggedIn');
const profileName = document.getElementById('profileName');
const profileGrade = document.getElementById('profileGrade');
const profileAvatar = document.getElementById('profileAvatar');

function showLogin() {
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
}

function showSignup() {
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  signupForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
}

function initials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}

loginBtn.onclick = () => {
  loginError.classList.add('hidden');
  signupError.classList.add('hidden');
  showLogin();
  authModal.classList.remove('hidden');
};

authClose.onclick = () => authModal.classList.add('hidden');
tabLogin.onclick = showLogin;
tabSignup.onclick = showSignup;

loginForm.onsubmit = async e => {
  e.preventDefault();
  loginError.classList.add('hidden');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = error.message;
    loginError.classList.remove('hidden');
    return;
  }

  authModal.classList.add('hidden');
  loginForm.reset();
  toast('Sesión iniciada');
};

signupForm.onsubmit = async e => {
  e.preventDefault();
  signupError.classList.add('hidden');
  const fullName = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const grade = document.getElementById('signupGrade').value.trim();

  if (!email.toLowerCase().endsWith('@lirima.cl')) {
    signupError.textContent = 'Solo se permiten cuentas con correo @lirima.cl';
    signupError.classList.remove('hidden');
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, grade_level: grade } }
  });

  if (error) {
    signupError.textContent = error.message;
    signupError.classList.remove('hidden');
    return;
  }

  authModal.classList.add('hidden');
  signupForm.reset();
  toast(data.session ? 'Cuenta creada' : 'Revisa tu correo para confirmar tu cuenta');
};

logoutBtn.onclick = async () => {
  await supabaseClient.auth.signOut();
  toast('Sesión cerrada');
};

async function updateProfileUI(session) {
  if (session && session.user) {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, grade_level')
      .eq('id', session.user.id)
      .single();

    const name = profile?.full_name || session.user.email;
    const grade = profile?.grade_level || '';
    profileName.textContent = name;
    profileGrade.textContent = grade;
    profileAvatar.textContent = initials(name);
    profileLoggedIn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
  } else {
    profileLoggedIn.classList.add('hidden');
    loginBtn.classList.remove('hidden');
  }
}

supabaseClient.auth.onAuthStateChange((_event, session) => updateProfileUI(session));

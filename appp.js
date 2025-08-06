// Inicializa Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "quiniela-diamante",
  storageBucket: "quiniela-diamante.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginBtn = document.getElementById("login-btn");
const quinielaSection = document.getElementById("quiniela-section");
const paymentSection = document.getElementById("pago-section");
const matchesDiv = document.getElementById("matches");
const metodoDetalle = document.getElementById("metodo-detalle");

let currentUser = null;
let currentWeek = '32'; // Ejemplo: semana 32

// Función para cargar partidos desde backend
async function loadMatches() {
  const res = await fetch(`/quiniela/matches/${currentWeek}`);
  if (!res.ok) {
    alert('No hay partidos disponibles para esta semana');
    return;
  }
  const data = await res.json();
  matchesDiv.innerHTML = '';
  data.matches.forEach((match, idx) => {
    const div = document.createElement('div');
    div.className = 'game-card';
    div.innerHTML = `
      <h3>Partido ${idx + 1}</h3>
      <label>${match.local} vs ${match.visitante}</label>
      <input type="text" id="match-${idx + 1}" placeholder="Ej: 2-1" required/>
    `;
    matchesDiv.appendChild(div);
  });
}

// Login con Google
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(({ user }) => {
      currentUser = user;
      loginBtn.style.display = 'none';
      quinielaSection.classList.remove('hidden');
      loadMatches();
    })
    .catch(console.error);
});

// Enviar pronósticos
document.getElementById("quiniela-form").addEventListener('submit', async e => {
  e.preventDefault();
  const predictions = [];
  for (let i = 1; i <= 10; i++) {
    const val = document.getElementById(`match-${i}`).value.trim();
    predictions.push({ matchId: i, prediction: val });
  }
  try {
    const res = await fetch('/quiniela/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.uid,
        week: currentWeek,
        predictions,
        token: 1 // Ejemplo: 1 token = 50 MXN
      })
    });
    if (!res.ok) throw new Error('Error

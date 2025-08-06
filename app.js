const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { fetchMatchesFromSofascore } = require('./scraper');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com'
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/admin/setMatches', async (req, res) => {
  const { week, matches } = req.body;
  try {
    await db.collection('quinielas').doc(`semana-${week}`).set({ matches });
    res.status(200).send({ message: 'Partidos guardados exitosamente.' });
  } catch (error) {
    res.status(500).send({ error: 'Error al guardar partidos.' });
  }
});

app.get('/quiniela/matches/:week', async (req, res) => {
  const week = req.params.week;
  try {
    const doc = await db.collection('quinielas').doc(`semana-${week}`).get();
    if (!doc.exists) return res.status(404).send({ error: 'No hay partidos para esta semana.' });
    res.send(doc.data());
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener los partidos.' });
  }
});

app.post('/quiniela/submit', async (req, res) => {
  const { userId, week, predictions, token } = req.body;
  try {
    await db.collection('quiniela_submissions').add({
      userId,
      week,
      predictions,
      token,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.send({ message: 'Pronóstico enviado exitosamente.' });
  } catch (error) {
    res.status(500).send({ error: 'Error al enviar el pronóstico.' });
  }
});

// Ruta para cargar partidos automáticamente desde SofaScore
app.get('/admin/loadMatchesFromSofaScore/:week', async (req, res) => {
  const { week } = req.params;
  try {
    const matches = await fetchMatchesFromSofascore();

    if (matches.length === 0) return res.status(500).send({ error: 'No se encontraron partidos.' });

    await db.collection('quinielas').doc(`semana-${week}`).set({ matches });

    res.send({ message: 'Partidos cargados desde SofaScore.', matches });
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener partidos desde SofaScore.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor Quiniela Diamante corriendo en puerto ${PORT}`);
});

// server.js
const express = require('express');
const { logGenerator } = require('./logGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para el registro de logs
app.use(logGenerator);

// Ruta GET para el endpoint /
app.get('/', (req, res) => {
    const origin = req.get('origin');
    if (origin !== 'https://erwin-courses.netlify.app') {
        return res.status(403).send('Acceso prohibido');
    }

    res.send('Solicitud GET recibida correctamente');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

let questions = [];
const questionsFilePath = path.join(__dirname, 'questions.json');

// Leer preguntas desde el archivo JSON
fs.readFile(questionsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error al leer el archivo questions.json:', err);
        return;
    }
    questions = JSON.parse(data);
    console.log('Preguntas cargadas correctamente');
});

/**
 * Middleware para analizar el cuerpo de las solicitudes como JSON.
 */
app.use(express.json()); // Necesario para manejar JSON en el cuerpo de las solicitudes

/**
 * Mezcla aleatoriamente los elementos de un array.
 * @param {Array} array - Array a mezclar.
 * @function
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/**
 * Ruta para obtener las preguntas del juego.
 * Las preguntas se mezclan antes de enviarlas como respuesta.
 * @function
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */
app.get('/questions', (req, res) => {
    // Hacer una copia de las preguntas para no alterar el orden original
    let shuffledQuestions = [...questions];
    shuffleArray(shuffledQuestions);
    res.json(shuffledQuestions);
});


/**
 * Ruta para guardar el resultado de una partida.
 * Guarda el nombre del jugador, el puntaje, las respuestas y los conteos de respuestas correctas e incorrectas.
 * @function
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */app.post('/saveResult', (req, res) => {
    const { name, score, answers } = req.body; // Cambiado de answeredQuestions a answers
    const resultsFilePath = path.join(__dirname, 'results.json');

    fs.readFile(resultsFilePath, 'utf8', (err, data) => {
        let results = [];
        if (!err) {
            results = JSON.parse(data);
        }

        const correctCount = answers.filter(q => q.isCorrect).length; // Ajustado para usar el campo isCorrect
        const incorrectCount = answers.length - correctCount;

        results.push({
            name,
            score,
            answers: answers, // Guardar las respuestas enviadas
            correctCount,
            incorrectCount
        });

        fs.writeFile(resultsFilePath, JSON.stringify(results, null, 2), (err) => {
            if (err) {
                console.error('Error al guardar el resultado:', err);
                res.status(500).send('Error al guardar el resultado');
                return;
            }
            res.status(200).send('Resultado guardado correctamente');
        });
    });
});

/**
 * Ruta para obtener el historial de resultados guardados.
 * @function
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */app.get('/getHistory', (req, res) => {
    const resultsFilePath = path.join(__dirname, 'results.json');
    
    fs.readFile(resultsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo results.json:', err);
            res.status(500).send('Error al leer el historial');
            return;
        }
        res.json(JSON.parse(data));
    });
});

/**
 * Servir archivos estáticos desde la carpeta 'frontend'.
 * @function
 */
app.use(express.static(path.join(__dirname, '../frontend')));

/**
 * Inicia el servidor en el puerto especificado.
 * @function
 */
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

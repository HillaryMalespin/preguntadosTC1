/**
 * Nombre del jugador.
 * @type {string}
 */
let playerName = '';


/**
 * Índice de la pregunta actual.
 * @type {number}
 */
let currentQuestionIndex = 0;

/**
 * Puntaje actual del jugador.
 * @type {number}
 */
let score = 0;

/**
 * Lista de respuestas dadas por el jugador.
 * @type {Array<Object>}
 */
let answers = [];

/**
 * Contador de respuestas correctas.
 * @type {number}
 */
let correctAnswers = 0;

/**
 * Contador de respuestas incorrectas.
 * @type {number}
 */
let incorrectAnswers = 0;

/**
 * Inicia el juego al hacer clic en el botón de inicio.
 * @async
 * @function
 */
document.getElementById('start-game-button').addEventListener('click', startGame);

/**
 * Función para iniciar el juego.
 * Obtiene el nombre del jugador, oculta la pantalla de inicio, muestra la pantalla de juego,
 * carga las preguntas y muestra la primera pregunta.
 * @async
 */
async function startGame() {
    playerName = document.getElementById('player-name').value;
    if (playerName) {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('player-info').innerText = `Jugador: ${playerName}`;
        await loadQuestions();
        loadQuestion();
    } else {
        alert('Por favor, ingrese su nombre.');
    }
}

/**
 * Carga las preguntas desde el servidor y las mezcla.
 * @async
 * @function
 */
async function loadQuestions() {
    try {
        let response = await fetch('/questions');
        questions = await response.json();
        shuffleArray(questions); // Mezclar preguntas en el frontend
        console.log('Preguntas recibidas:', questions);
    } catch (error) {
        console.error('Error al obtener preguntas:', error);
    }
}

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
 * Carga la pregunta actual en la pantalla de juego.
 * Muestra el texto de la pregunta y las opciones de respuesta.
 * @function
 */
function loadQuestion() {
    if (currentQuestionIndex >= 10 || currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const question = questions[currentQuestionIndex];
    const questionsContainer = document.getElementById('question-container');
    questionsContainer.innerHTML = '';
    
    const feedback = document.getElementById('feedback');
    feedback.textContent = '';

    const questionText = document.createElement('p');
    questionText.textContent = `${currentQuestionIndex + 1}. ${question.question}`;
    questionsContainer.appendChild(questionText);

    question.answers.forEach((answer, i) => {
        const answerLabel = document.createElement('label');
        const answerInput = document.createElement('input');
        answerInput.type = 'radio';
        answerInput.name = 'answer';
        answerInput.value = i;
        answerLabel.appendChild(answerInput);
        answerLabel.appendChild(document.createTextNode(answer));
        questionsContainer.appendChild(answerLabel);
        questionsContainer.appendChild(document.createElement('br'));
    });
}

/**
 * Procesa la respuesta seleccionada y muestra el feedback.
 * @function
 */
function nextQuestion() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        const selectedIndex = parseInt(selectedAnswer.value, 10);
        answerQuestion(selectedIndex);
    } else {
        alert('Por favor, seleccione una respuesta.');
    }
}

/**
 * Evalúa la respuesta dada y actualiza el puntaje y feedback.
 * @param {number} selectedIndex - Índice de la respuesta seleccionada.
 * @function
 */
function answerQuestion(selectedIndex) {
    const question = questions[currentQuestionIndex];
    const feedback = document.getElementById('feedback');
    
    const isCorrect = selectedIndex === question.correct;
    answers.push({
        question: question.question,
        selectedAnswer: question.answers[selectedIndex],
        correctAnswer: question.answers[question.correct],
        isCorrect: isCorrect
    });
    
    // Actualiza el conteo de respuestas correctas e incorrectas
    if (isCorrect) {
        score++;
        correctAnswers++;
        feedback.textContent = 'Respuesta Correcta!';
        feedback.style.color = 'green';
    } else {
        incorrectAnswers++;
        feedback.textContent = 'Respuesta Incorrecta.';
        feedback.style.color = 'red';
    }

    // Imprime los valores de conteo para depuración
    console.log('Correctas:', correctAnswers);
    console.log('Incorrectas:', incorrectAnswers);

    feedback.style.display = 'block';
    
    setTimeout(() => {
        feedback.style.display = 'none';
        currentQuestionIndex++;
        
        if (currentQuestionIndex < 10 && currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 1000);
}

/**
 * Finaliza el juego, muestra el resultado y envía los resultados al backend.
 * @function
 */
function endGame() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';

    let resultText;
    if (score >= 6) {
        resultText = `¡Ganaste! Respuestas correctas: ${score}`;
    } else {
        resultText = `Perdiste. Respuestas correctas: ${score}`;
    }
    
    document.getElementById('result-text').innerText = resultText;

    // Imprime los valores de conteo para depuración
    console.log('Enviando Resultados...');
    console.log('Nombre:', playerName);
    console.log('Score:', score);
    console.log('Respuestas:', answers);
    console.log('Correctas:', correctAnswers);
    console.log('Incorrectas:', incorrectAnswers);

    // Enviar resultados al backend
    fetch('/saveResult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: playerName,
            score: score,
            answers: answers,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers
        })
    }).catch(error => console.error('Error al guardar el resultado:', error));
}

/**
 * Muestra el historial de resultados obtenidos desde el backend.
 * @function
 */
function viewHistory() {
    fetch('/getHistory')
        .then(response => response.json())
        .then(data => {
            let historyList = document.getElementById('history-list');
            historyList.innerHTML = data.map(entry => `
                <li>
                    <strong>Nombre:</strong> ${entry.name}<br>
                    <strong>Score:</strong> ${entry.score}<br>
                    <strong>Respuestas:</strong><br>
                    ${entry.answers.map(a => `
                        <p>Pregunta: ${a.question}</p>
                        <p>Respuesta Seleccionada: ${a.selectedAnswer}</p>
                        <p>Respuesta Correcta: ${a.correctAnswer}</p>
                        <p>Estado: ${a.isCorrect ? 'Correcta' : 'Incorrecta'}</p>
                        <hr>
                    `).join('')}
                    <strong>Total Correctas:</strong> ${entry.correctAnswers}<br>
                    <strong>Total Incorrectas:</strong> ${entry.incorrectAnswers}<br>
                </li>
            `).join('');
            document.getElementById('result-screen').style.display = 'none';
            document.getElementById('history-screen').style.display = 'block';
        })
        .catch(error => console.error('Error al obtener el historial:', error));
}

/**
 * Vuelve a la pantalla de inicio desde la pantalla de historial.
 * @function
 */
function backToStart() {
    document.getElementById('history-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

/**
 * Reinicia el juego y vuelve a la pantalla de inicio.
 * @function
 */
function restartGame() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    answers = [];
    correctAnswers = 0;
    incorrectAnswers = 0;
}


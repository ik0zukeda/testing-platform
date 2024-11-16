let testData = {};
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime, endTime;
let timerInterval;

// Функция для загрузки теста с сервера
async function loadTest() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const testId = urlParams.get("id");
    const name = urlParams.get("name");

    document.querySelector(".test-name").textContent = `Прохождение теста "${name}"`

    if (!testId) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка. Попробуйте снова`);
        return;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
    try {
        const response = await fetch("https://testing-platform.onrender.com/api/test/generate", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ testId: parseInt(testId) })
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        if (!response.ok) {
            throw new Error(`Ошибка загрузки теста: ${response.statusText}`);
        }

        testData = await response.json();
        userAnswers = new Array(testData.questions.length).fill(null).map(() => []);

        displayQuestion();
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось загрузить тест");
    }
}

function startTimer() {
    startTime = new Date();
    const timerDisplay = document.getElementById('timer');
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `Время: ${minutes}:${seconds}`;
    }, 1000);
}

// Функция для остановки таймера
function stopTimer() {
    clearInterval(timerInterval);
    endTime = new Date();
}

// Функция для отображения текущего вопроса
function displayQuestion() {
    const container = document.getElementById("testContainer");
    container.innerHTML = ""; // Очищаем контейнер

    const question = testData.questions[currentQuestionIndex];

    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question", "active");

    const questionTitle = document.createElement("h3");
    questionTitle.textContent = `${currentQuestionIndex + 1}. ${question.questionText}`;
    questionDiv.appendChild(questionTitle);

    question.answers.forEach((answer, answerIndex) => {
        const answerDiv = document.createElement("div");
        answerDiv.classList.add("answer");

        const answerInput = document.createElement("input");
        answerInput.type = "checkbox";
        answerInput.value = answer.answerText;
        answerInput.id = `question_${currentQuestionIndex}_answer_${answerIndex}`;
        answerInput.checked = userAnswers[currentQuestionIndex].includes(answer);

        // Обработчик для сохранения выбора пользователя
        answerInput.addEventListener("change", (event) => {
            if (event.target.checked) {
                userAnswers[currentQuestionIndex].push(answer);
            } else {
                const index = userAnswers[currentQuestionIndex].indexOf(answer);
                if (index > -1) {
                    userAnswers[currentQuestionIndex].splice(index, 1);
                }
            }
        });

        const answerLabel = document.createElement("label");
        answerLabel.setAttribute("for", `question_${currentQuestionIndex}_answer_${answerIndex}`);
        answerLabel.textContent = answer.answerText;

        answerDiv.appendChild(answerInput);
        answerDiv.appendChild(answerLabel);
        questionDiv.appendChild(answerDiv);
    });

    container.appendChild(questionDiv);
}

function next() {
    // Обработчик нажатия кнопки "Следующий вопрос"
    document.getElementById("nextQuestion").addEventListener("click", () => {
        if (currentQuestionIndex < testData.questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        }

        if (currentQuestionIndex === testData.questions.length - 1) {
            document.getElementById("nextQuestion").style.display = "none";
            document.getElementById("submitTest").style.display = "revert";
        }
    });
}

// Обработчик нажатия кнопки "Отправить тест"
async function submitTest() {
    stopTimer();
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);

    const testContainer = document.getElementById("testContainer");
    const timer = document.getElementById("timer");
    const buttons = document.querySelector(".buttons");

    testContainer.classList.add("disabled");
    timer.classList.add("disabled");
    buttons.classList.add("disabled");

    const checkTestDTO = {
        testId: testData.testId,
        answers: userAnswers.map((selectedAnswers, index) => ({
            id: testData.questions[index].id,
            answerTexts: selectedAnswers.map(sa => sa.answerText)
        })),
        duration: durationInSeconds
    };

    try {
        const response = await fetch("https://testing-platform.onrender.com/api/test/check", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(checkTestDTO)
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        if (!response.ok) {
            throw new Error(`Ошибка проверки теста: ${response.statusText}`);
        }

        const result = await response.json();
        alert(`Тест завершён! Ваш результат: ${result.score}/${testData.questions.length}`);
        window.location.href = "active_tests";
    } catch (error) {
        console.error("Ошибка при отправке теста:", error);
        alert("Не удалось отправить ответы");
    }
}

function showDisclaimer() {
    const disclaimer = document.getElementById("disclaimer");
    const okButton = document.getElementById("okButton");
    const testContainer = document.getElementById("testContainer");
    const timer = document.getElementById("timer");
    const buttons = document.querySelector(".buttons");

    okButton.addEventListener("click", function() {
        disclaimer.style.display = "none";
        testContainer.style.removeProperty("display");
        timer.style.removeProperty("display");
        buttons.style.removeProperty("display");
        startTimer();
    });
}

// Загружаем тест при загрузке страницы
window.addEventListener("DOMContentLoaded", loadTest);
window.addEventListener("DOMContentLoaded", showDisclaimer);
window.addEventListener("DOMContentLoaded", next);
window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("submitTest").addEventListener("click", submitTest);
});

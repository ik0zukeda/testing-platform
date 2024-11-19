let questionData = {};

// Функция для загрузки вопроса
async function loadQuestion() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const questionId = urlParams.get("id");

    const response = await fetch(`https://testing-platform.onrender.com/api/question/receive/${questionId}`, {
        method: "GET",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        }
    });

    if (response.status === 403) {
        window.location.href = "403";
    }

    questionData = await response.json();

    document.getElementById("questionText").value = questionData.questionText;
    renderAnswers();
}

// Функция для отображения ответов
function renderAnswers() {
    const answersContainer = document.getElementById("answersContainer");
    answersContainer.innerHTML = ""; // Очищаем контейнер

    questionData.answers.forEach((answer, index) => {
        const answerDiv = document.createElement("div");
        answerDiv.classList.add("answer");
        answerDiv.innerHTML = `
            <input class="answer-input" type="text" value="${answer.answerText}" required>
            <input class="is-correct-checkbox" type="checkbox" ${answer.isCorrect ? "checked" : ""}>
                Правильный ответ
            <button class="remove-answer-btn" onclick="removeAnswer(${index}, ${answer.answerId})">Удалить</button>
        `;
        answersContainer.appendChild(answerDiv);
    });

    document.querySelectorAll(".remove-answer-btn").forEach((btn) => {
        btn.disabled = questionData.answers.length <= 2;
    });
}

// Функция для добавления нового ответа
function addAnswer() {
    const newAnswer = {
        answerId: null, // Поскольку это новый ответ, ID еще не установлен
        answerText: "",
        isCorrect: false
    };
    questionData.answers.push(newAnswer);
    renderAnswers();
}

// Функция для удаления ответа
async function removeAnswer(index, answerId) {
    if (questionData.answers.length > 2) {
        questionData.answers.splice(index, 1);

        if (answerId != null) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const questionId = urlParams.get("id");

            const data = {
                questionId: parseInt(questionId),
                answerId: parseInt(answerId)
            };

            const res = await fetch(`https://testing-platform.onrender.com/api/question/remove_answer`, {
                method: "POST",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (res.status === 403) {
                window.location.href = "403";
            }

            if (!res.ok) {
                toastr.options = {
                    "progressBar": true,
                    "positionClass": "toast-top-right",
                    "timeOut": "5000"
                };

                toastr.error(`Ошибка при удалении ответа`);
                return;
            } else {
                toastr.options = {
                    "progressBar": true,
                    "positionClass": "toast-top-right",
                    "timeOut": "3000"
                };

                toastr.success(`Ответ успешно удалён`);
            }
        }
        renderAnswers();
    }
}

// Функция для сохранения изменений
async function saveChanges() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const questionId = urlParams.get("id");
    const topic = urlParams.get("topic");

    let success = true;

    const questionForm = document.querySelector(".question-answers-form");
    questionForm.classList.add("disabled");

    // Обновляем вопрос
    const updatedQuestionText = document.getElementById("questionText").value;

    if (updatedQuestionText === "") {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Пустая формулировка вопроса`);
        questionForm.classList.remove("disabled");
        return;
    }

    if (questionData.answers.some(ans => ans.answerText === "")) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Пустая формулировка ответа`);
        questionForm.classList.remove("disabled");
        return;
    }

    if (questionData.answers.every(ans => ans.isCorrect === false)) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Должен быть хотя бы один правильный ответ`);
        questionForm.classList.remove("disabled");
        return;
    }

    const updatedQuestionData = {
        questionText: updatedQuestionText
    };

    const res = await fetch(`https://testing-platform.onrender.com/api/question/update/${questionId}`, {
        method: "PUT",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedQuestionData)
    });

    if (res.status === 403) {
        window.location.href = "403";
    }

    if (!res.ok) {
        success = false;
        questionForm.classList.remove("disabled");
    }

    // Обновляем ответы
    for (const answer of questionData.answers) {
        const answerText = document.querySelectorAll(".answer-input")[questionData.answers.indexOf(answer)].value;
        const isCorrect = document.querySelectorAll(".is-correct-checkbox")[questionData.answers.indexOf(answer)].checked;

        // Обновляем состояние в questionData
        answer.answerText = answerText;
        answer.isCorrect = isCorrect;

        if (answer.answerId != null) {
            const updatedAnswerData = {
                answerText: answer.answerText,
                isCorrect: answer.isCorrect
            };

            const response = await fetch(`https://testing-platform.onrender.com/api/answer/update/${answer.answerId}`, {
                method: "PUT",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedAnswerData)
            });

            if (response.status === 403) {
                window.location.href = "403";
            }

            if (!response.ok) {
                success = false;
                questionForm.classList.remove("disabled");
            }
        } else {
            const createAnswerData = {
                answerText: answer.answerText,
                isCorrect: answer.isCorrect
            };

            const response = await fetch(`https://testing-platform.onrender.com/api/answer/create/${questionId}`, {
                method: "POST",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(createAnswerData)
            });

            if (response.status === 403) {
                window.location.href = "403";
            }

            if (!response.ok) {
                success = false;
                questionForm.classList.remove("disabled");
            }
        }
    }

    if (!success) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка при обновлении данных`);
    } else {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };

        toastr.success(`Данные успешно обновлены`);
        setTimeout(() => {
            window.location.href = `topic?id=${topic}`;
        }, 3000);
    }
}

async function deleteQuestion() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const questionId = urlParams.get("id");
    const topic = urlParams.get("topic");

    const questionForm = document.querySelector(".question-answers-form");
    questionForm.classList.add("disabled");

    const response = await fetch(`https://testing-platform.onrender.com/api/topic/remove_question`, {
        method: "POST",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ questionId: parseInt(questionId), topicId: parseInt(topic) })
    });

    if (response.status === 403) {
        window.location.href = "403";
    }

    const result = await response.json();

    if (!response.ok) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка при удалении вопроса: ${result.message}`);
        questionForm.classList.remove("disabled");
    } else {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };

        toastr.success(`Вопрос успешно удалён`);
        setTimeout(() => {
            window.location.href = `topic?id=${topic}`;
        }, 3000);
    }
}

// Обработчик для сохранения состояния чекбокса
document.addEventListener("change", (event) => {
    if (event.target.classList.contains("is-correct-checkbox")) {
        const checkbox = event.target;
        const answerDiv = checkbox.closest(".answer");
        const index = Array.from(answerDiv.parentNode.children).indexOf(answerDiv);
        questionData.answers[index].isCorrect = checkbox.checked; // Обновляем состояние в questionData
    } else if (event.target.classList.contains("answer-input")) {
        const input = event.target;
        const answerDiv = input.closest(".answer");
        const index = Array.from(answerDiv.parentNode.children).indexOf(answerDiv);
        questionData.answers[index].answerText = input.value; // Обновляем текст ответа в questionData
    }
});

// Загружаем вопрос при загрузке страницы
window.addEventListener("DOMContentLoaded", loadQuestion);

function setInputWidth(inputElement, additional = 0, length = null) {
    const calculator = document.getElementById("textWidthCalculator");
    if (length == null) {
        calculator.textContent = inputElement.value;

        const textWidth = calculator.offsetWidth + additional;

        inputElement.style.width = `${textWidth}px`;
    } else {
        inputElement.style.width = `${length}px`;
    }
}


let answerCount = 2; // Изначально доступно 2 ответа

function addAnswerField() {
    answerCount++;
    const answersContainer = document.getElementById("answers-container");

    const answerGroup = document.createElement("div");
    answerGroup.classList.add("form-group");
    answerGroup.id = `answer-group-${answerCount}`;
    answerGroup.innerHTML = `
            <label for="answer-${answerCount}">Ответ ${answerCount}:</label>
            <input type="text" class="answer-input" name="answer-${answerCount}" placeholder="Введите формулировку ответа" required>
            <input type="checkbox" class="is-correct-checkbox" name="is-correct-${answerCount}"> Правильный
        `;
    answersContainer.appendChild(answerGroup);

    // Активируем кнопку удаления, если добавлено более 2 ответов
    document.getElementById("remove-answer-btn").disabled = answerCount <= 2;
}

function removeLastAnswerField() {
    if (answerCount > 2) {
        const lastAnswerGroup = document.getElementById(`answer-group-${answerCount}`);
        if (lastAnswerGroup) {
            lastAnswerGroup.remove();
            answerCount--;

            // Деактивируем кнопку удаления, если осталось только 2 ответа
            document.getElementById("remove-answer-btn").disabled = answerCount <= 2;
        }
    }
}

function submitQuestionForm() {
    document.getElementById("addQuestionForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const topicId = urlParams.get("id");

        const questionText = document.getElementById("question-text").value;
        const answerInputs = document.querySelectorAll(".answer-input");
        const correctCheckboxes = document.querySelectorAll(".is-correct-checkbox");

        const answers = [];
        answerInputs.forEach((input, index) => {
            answers.push({
                answerText: input.value,
                isCorrect: correctCheckboxes[index].checked
            });
        });

        if (answers.every(ans => ans.isCorrect === false)) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Должен быть хотя бы один правильный ответ`);
            questionForm.classList.remove("disabled");
            return;
        }

        const questionDTO = {
            questionText: questionText,
            answers: answers
        };

        const addQuestionForm = document.getElementById("addQuestionForm");
        addQuestionForm.classList.add("disabled");
        const response = await fetch(`https://testing-platform.onrender.com/api/question/create/${topicId}`, {
            method: "POST",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(questionDTO)
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        const newQuestion = await response.json();

        if (!response.ok) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Ошибка: ${newQuestion.message}`);
            addQuestionForm.classList.remove("disabled");
        } else {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "3000"
            };

            toastr.success(`Вопрос успешно добавлен`);

            const studentTableBody = document.getElementById("studentTableBody");
            const row = document.createElement("tr");

            const newQuestionId = newQuestion.id;
            const newQuestionText = newQuestion.questionText;
            row.id = `question-${newQuestionId}`;
            row.innerHTML = `
                    <td class="question-id-cell">${newQuestionId}</td>
                    <td class="question-questionText-cell">${newQuestionText}</td>
                `;

            studentTableBody.appendChild(row);

            const bc = row.style.backgroundColor;

            row.addEventListener("mouseover", () => {
                row.style.transition = "color 0.3s";
                row.style.cursor = "pointer";
                row.style.color = "white";
                row.style.backgroundColor = "grey";
            });

            row.addEventListener("mouseout", () => {
                row.style.color = "initial";
                row.style.backgroundColor = bc;
            });

            row.addEventListener("click", () => {
                window.location.href = `question?id=${newQuestionId}`;
            });

            addQuestionForm.classList.remove("disabled");
            answerCount = 2;
            addQuestionForm.innerHTML = `
                <div class="form-group">
                    <b><label for="question-text">Формулировка:</label></b>
                    <input class="question-input" type="text" id="question-text" name="question-text" maxlength="255"
                           placeholder="Введите формулировку вопроса" required>
                </div>

            <div id="answers-container">
                <h3>Ответы</h3>
                <div class="form-group">
                    <label for="answer-1">Ответ 1:</label>
                    <input type="text" class="answer-input" name="answer-1" placeholder="Введите формулировку ответа" required>
                        <input type="checkbox" class="is-correct-checkbox" name="is-correct-1"> Правильный
                </div>
                <div class="form-group">
                    <label for="answer-2">Ответ 2:</label>
                    <input type="text" class="answer-input" name="answer-2" placeholder="Введите формулировку ответа" required>
                        <input type="checkbox" class="is-correct-checkbox" name="is-correct-2"> Правильный
                </div>
            </div>

            <button type="button" onclick="addAnswerField()">Добавить ответ</button>
            <button type="button" onclick="removeLastAnswerField()" id="remove-answer-btn" disabled>Удалить последний ответ</button>

            <button class="add-question-button" type="submit">Добавить вопрос</button>`
        }
    });
}

function addQuestion() {
    const addQuestionButton = document.querySelector(".addQuestionButton");
    addQuestionButton.style.display = "none";

    const addQuestionForm = document.querySelector(".add-question-form");
    addQuestionForm.style.display = "block";
}

function cancelAddQuestion() {
    const addQuestionForm = document.querySelector(".add-question-form");
    addQuestionForm.style.display = "none";

    const addQuestionButton = document.querySelector(".addQuestionButton");
    addQuestionButton.style.removeProperty("display");
}

function editRow(rowId, subject) {
    if (subject === "topic") {
        const row = document.getElementById(`topic-${rowId}`);

        let nameCell = row.querySelector(`.name-cell`);
        let organizationIdCell = row.querySelector(`.organization_id-cell`);
        let actionsCell = row.querySelector(`.actions`);

        // Сохраняем оригинальные значения перед редактированием
        nameCell.setAttribute("data-original-value", nameCell.textContent);
        organizationIdCell.setAttribute("data-original-value", organizationIdCell.textContent);

        // Заменяем текст на поля ввода
        nameCell.innerHTML = `<input type="text" id="edit-name-${rowId}" value="${nameCell.textContent}" />`;
        organizationIdCell.innerHTML = `<input type="text" id="edit-organization_id-${rowId}" value="${organizationIdCell.textContent}" />`;

        // Устанавливаем ширину полей ввода на основе содержимого
        setInputWidth(document.getElementById(`edit-name-${rowId}`), 200);
        setInputWidth(document.getElementById(`edit-organization_id-${rowId}`), 30);

        // Скрываем иконку редактирования и показываем иконки сохранения/отмены
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.display = "none";
        check.style.removeProperty("display");
        times.style.removeProperty("display");
    }
}

async function saveRow(rowId, subject) {
    if (subject === "topic") {
        const row = document.getElementById(`topic-${rowId}`);

        let nameCell = row.querySelector(`.name-cell`);
        let organizationIdCell = row.querySelector(`.organization_id-cell`);
        let actionsCell = row.querySelector(`.actions`);

        const name = document.getElementById(`edit-name-${rowId}`).value;
        const organizationId = document.getElementById(`edit-organization_id-${rowId}`).value;

        const data = {
            name: name === "" || name === "null" ? null : name,
            organizationId: organizationId === "" || organizationId === "null" ? null : parseInt(organizationId)
        };

        const response = await fetch(`https://testing-platform.onrender.com/api/topic/update/${rowId}`, {
            method: "PUT",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        const topic = await response.json();

        if (!response.ok) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Ошибка: ${topic.message}`);
            throw new Error(topic.message);
        }

        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };

        toastr.success(`Данные темы успешно обновлены`);

        // Получаем значения из input и заменяем их на текстовое содержимое
        nameCell.textContent = topic.name + "";
        organizationIdCell.textContent = topic.organizationId + "";

        document.getElementById("h1TopicName").textContent = topic.name;

        // Скрываем иконки сохранения/отмены и показываем иконку редактирования
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.removeProperty("display");
        check.style.display = "none";
        times.style.display = "none";
    }
}

function cancelEdit(rowId, subject) {
    if (subject === "topic") {
        const row = document.getElementById(`topic-${rowId}`);

        let nameCell = row.querySelector(`.name-cell`);
        let organizationIdCell = row.querySelector(`.organization_id-cell`);
        let actionsCell = row.querySelector(`.actions`);

        // Восстанавливаем оригинальные значения из data-атрибутов
        nameCell.textContent = nameCell.getAttribute("data-original-value");
        organizationIdCell.textContent = organizationIdCell.getAttribute("data-original-value");

        // Скрываем иконки сохранения/отмены и показываем иконку редактирования
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.removeProperty("display");
        check.style.display = "none";
        times.style.display = "none";
    }
}


async function loadUserData() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "auth";
    }

    const role = localStorage.getItem("role");
    if (role !== "0") {
        window.location.href = "403";
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const topicId = urlParams.get("id");

    const loader = document.querySelector(".loader");

    try {
        loader.style.display = "block";
        const response = await fetch(`https://testing-platform.onrender.com/api/topic/receive_full/${topicId}`, {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        const topic = await response.json();

        if (!response.ok) {
            throw new Error(topic.message);
        }

        const topicName = topic.name;

        document.getElementById("h1TopicName").textContent = topicName;

        const userTableBody = document.getElementById("userTableBody");
        userTableBody.innerHTML = "";

        const row = document.createElement("tr");
        const topic_id = topic.id;
        const topic_name = topic.name;
        const topic_organizationId = topic.organizationId;
        row.id = `topic-${topic_id}`;
        row.innerHTML = `
                    <td class="id-cell">${topic_id}</td>
                    <td class="organization_id-cell">${topic_organizationId}</td>
                    <td class="name-cell">${topic_name}</td>
                    <td class="actions">
                        <i class="fas fa-pencil-alt" onclick="editRow('${topic_id}', 'topic')"></i>
                        <i class="fas fa-check" style="display: none" onclick="saveRow('${topic_id}', 'topic')"></i>
                        <i class="fas fa-times" style="display: none" onclick="cancelEdit('${topic_id}', 'topic')"></i>
                    </td>
                `;
        userTableBody.appendChild(row);


        const studentTableBody = document.getElementById("studentTableBody");
        studentTableBody.innerHTML = "";

        topic.questions.forEach((question) => {
            const row = document.createElement("tr");
            const questionId = question.id;
            const questionText = question.questionText;
            row.id = `question-${questionId}`;
            row.innerHTML = `
                    <td class="question-id-cell">${questionId}</td>
                    <td class="question-questionText-cell">${questionText}</td>
                `;

            studentTableBody.appendChild(row);

            const bc = row.style.backgroundColor;

            row.addEventListener("mouseover", () => {
                row.style.transition = "color 0.3s";
                row.style.cursor = "pointer";
                row.style.color = "white";
                row.style.backgroundColor = "grey";
            });

            row.addEventListener("mouseout", () => {
                row.style.color = "initial";
                row.style.backgroundColor = bc;
            });

            row.addEventListener("click", () => {
                window.location.href = `question?id=${questionId}&topic=${topicId}`;
            });
        });


    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = "none";
    }
}

function changeQuestionTableVisibility() {
    changeTableVisibility(".questionsTableTitle", ".questionsTable");
}

function changeTableVisibility(titleClassName, tableClassName) {
    const title = document.querySelector(titleClassName);
    const table = document.querySelector(tableClassName);

    title.addEventListener("click", function() {
        const styleIsNone = table.style.display === "none";

        if (styleIsNone) {
            table.style.display = "table";
        } else {
            table.style.display = "none";
        }
    });
}

window.addEventListener("DOMContentLoaded", loadUserData);
window.addEventListener("DOMContentLoaded", submitQuestionForm);
window.addEventListener("DOMContentLoaded", changeQuestionTableVisibility);

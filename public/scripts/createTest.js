// Функция для загрузки доступных тем
async function loadData() {
    const responseTopics = await fetch('http://localhost:3000/api/topic/receive_all', {
        method: 'GET',
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
    });

    const responseGroups = await fetch('http://localhost:3000/api/teacher/groups', {
        method: 'GET',
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
    });

    const topics = await responseTopics.json();
    const groups = await responseGroups.json();
    const topicSelect = document.getElementById("topicId");
    const groupSelect = document.getElementById("group");

    topics.forEach(topic => {
        const option = document.createElement("option");
        option.value = topic.id;  // Сохраняем ID темы
        option.textContent = topic.name;  // Отображаем название темы
        topicSelect.appendChild(option);
    });

    groups.forEach(group => {
        const option = document.createElement("option");
        option.value = group;  // Сохраняем ID темы
        option.textContent = group;  // Отображаем название темы
        groupSelect.appendChild(option);
    });
}

// Функция для отправки данных на сервер для создания теста
async function createTest(event) {
    event.preventDefault(); // Отменяем стандартную отправку формы

    const testName = document.getElementById("testName").value;
    const topicId = document.getElementById("topicId").value;
    const questionCount = document.getElementById("questionCount").value;
    const attempts = document.getElementById("attempts").value;
    const group = document.getElementById("group").value;

    const testData = {
        testName: testName,
        group: group,
        topicId: parseInt(topicId),
        questionCount: parseInt(questionCount),
        attempts: parseInt(attempts),
    };

    // Отправляем запрос на создание теста
    const response = await fetch('http://localhost:3000/api/test/create', {
        method: 'POST',
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    });

    if (response.ok) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };

        toastr.success(`Тест успешно создан`);
    } else {
        const error = await response.json();
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка: ${error.message}`);
    }
}

// Загружаем темы при загрузке страницы
window.addEventListener("DOMContentLoaded", () => {
    loadData();
    const form = document.getElementById("createTestForm");
    form.addEventListener("submit", createTest);
});

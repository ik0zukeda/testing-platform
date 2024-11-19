// Функция для загрузки доступных тем
async function loadData() {
    const responseTopics = await fetch('https://testing-platform.onrender.com/api/topic/receive_all', {
        method: 'GET',
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
    });

    if (responseTopics.status === 403) {
        window.location.href = "403";
    }

    const responseGroups = await fetch('https://testing-platform.onrender.com/api/teacher/groups', {
        method: 'GET',
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
    });

    if (responseGroups.status === 403) {
        window.location.href = "403";
    }

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

    const createTestForm = document.getElementById("createTestForm");
    createTestForm.classList.add("disabled");

    // Отправляем запрос на создание теста
    const response = await fetch('https://testing-platform.onrender.com/api/test/create', {
        method: 'POST',
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    });

    if (response.status === 403) {
        window.location.href = "403";
    }

    if (response.ok) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };

        toastr.success(`Тест успешно создан`);
        setTimeout(() => {
            window.location.href = `active_tests`;
        }, 3000);
    } else {
        const error = await response.json();
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка: ${error.message}`);
        createTestForm.classList.remove('disabled');
    }
}

// Загружаем темы при загрузке страницы
window.addEventListener("DOMContentLoaded", () => {
    loadData();
    const form = document.getElementById("createTestForm");
    form.addEventListener("submit", createTest);
});

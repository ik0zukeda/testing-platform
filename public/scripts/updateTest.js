let testData = {};

// Функция для загрузки данных теста
async function loadTestData() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const testId = urlParams.get("id");

    // Запрашиваем данные теста по ID
    const response = await fetch(`https://testing-platform.onrender.com/api/test/receive/${testId}`, {
        method: "GET",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        }
    });

    if (response.status === 403) {
        window.location.href = "403";
    }

    if (!response.ok) {
        const error = await response.json();
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка: ${error.message}`);
        return;
    }

    testData = await response.json();
    document.getElementById("testName").value = testData.testName;
    document.getElementById("questionCount").value = testData.questionCount;
    document.getElementById("attempts").value = testData.attempts;

    // Загружаем доступные темы и устанавливаем текущую тему теста
    await loadTopics(testData.topicId);
    await loadGroups(testData.group);
}

// Функция для загрузки доступных тем
async function loadTopics(selectedTopicId) {
    const response = await fetch("https://testing-platform.onrender.com/api/topic/receive_all", {
        method: "GET",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        }
    });

    if (response.status === 403) {
        window.location.href = "403";
    }

    if (!response.ok) {
        const error = await response.json();
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка: ${error.message}`);
        return;
    }

    const topics = await response.json();
    const topicSelect = document.getElementById("topicId");

    topics.forEach(topic => {
        const option = document.createElement("option");
        option.value = topic.id;
        option.textContent = topic.name;
        if (topic.id === selectedTopicId) {
            option.selected = true;
        }
        topicSelect.appendChild(option);
    });
}

async function loadGroups(selectedGroup) {
    const response = await fetch("https://testing-platform.onrender.com/api/teacher/groups", {
        method: "GET",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        }
    });

    if (response.status === 403) {
        window.location.href = "403";
    }

    if (!response.ok) {
        const error = await response.json();
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка: ${error.message}`);
        return;
    }

    const groups = await response.json();
    const groupSelect = document.getElementById("group");

    groups.forEach(group => {
        const option = document.createElement("option");
        option.value = group;
        option.textContent = group;
        if (group === selectedGroup) {
            option.selected = true;
        }
        groupSelect.appendChild(option);
    });
}

// Функция для сохранения изменений
async function saveChanges(event) {
    event.preventDefault(); // Отменяем стандартное поведение формы

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const testId = urlParams.get("id");

    const updatedTestData = {
        testName: document.getElementById("testName").value,
        topicId: parseInt(document.getElementById("topicId").value),
        questionCount: parseInt(document.getElementById("questionCount").value),
        attempts: parseInt(document.getElementById("attempts").value),
        group: document.getElementById("group").value
    };

    const updateTestForm = document.getElementById("updateTestForm");
    updateTestForm.classList.add("disabled");

    // Отправляем данные на сервер для обновления
    const response = await fetch(`https://testing-platform.onrender.com/api/test/update/${testId}`, {
        method: "PUT",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTestData)
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

        toastr.success(`Тест успешно обновлён`);
        setTimeout(() => {
            window.location.href = "active_tests";
        }, 3000);
    } else {
        const error = await response.json();
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка: ${error.message}`);
        updateTestForm.classList.remove('disabled');
    }
}

async function deleteTest() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const testId = urlParams.get("id");

    const updateTestForm = document.getElementById("updateTestForm");
    updateTestForm.classList.add("disabled");

    const response = await fetch(`https://testing-platform.onrender.com/api/test/delete`, {
        method: "DELETE",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ testId: parseInt(testId) })
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

        toastr.success(`Тест успешно удалён`);
        setTimeout(() => {
            window.location.href = "active_tests";
        }, 3000);
    } else {
        const error = await response.json();
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`Ошибка: ${error.message}`);
        updateTestForm.classList.remove('disabled');
    }
}

// Загружаем данные теста при загрузке страницы
window.addEventListener("DOMContentLoaded", () => {
    loadTestData();
    const form = document.getElementById("updateTestForm");
    form.addEventListener("submit", saveChanges);
});

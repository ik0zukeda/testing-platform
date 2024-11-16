// Функция для загрузки данных о тесте
async function loadTestInfo() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const testId = urlParams.get("id");

    if (!testId) {
        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "5000"
        };

        toastr.error(`ID теста не указан`);
        return;
    }

    try {
        const response = await fetch(`https://testing-platform.onrender.com/api/test/receive_by_test_with_used_attempts/${testId}`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        if (!response.ok) {
            throw new Error(`Ошибка загрузки данных: ${response.statusText}`);
        }

        const testData = await response.json();
        displayTestInfo(testData);
        document.querySelector(".test-container").style.removeProperty("display");

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные о тесте');
    }
}

// Функция отображения основной информации о тесте
function displayTestInfo(data) {
    const mainInfoContainer = document.getElementById("mainInfo");
    mainInfoContainer.innerHTML = `
        <div class="info-row"><label>Название теста:</label> <span>${data.testName}</span></div>
        <div class="info-row"><label>Количество вопросов:</label> <span>${data.questionCount}</span></div>
        <div class="info-row"><label>Количество попыток:</label> <span>${data.attempts}</span></div>
        <div class="info-row"><label>Использовано попыток:</label> <span>${data.usedAttempts}</span></div>
        <div class="info-row"><label>Группа:</label> <span>${data.group}</span></div>
        <div class="info-row"><label>Дата создания:</label> <span>${new Date(data.createdAt).toLocaleDateString()}</span></div>
    `;

    // Информация о преподавателе
    const teacherInfoContainer = document.getElementById("teacherDetails");
    teacherInfoContainer.innerHTML = `
        <div class="info-row"><label>ФИО:</label> <span>${data.teacher.name}</span></div>
        <div class="info-row"><label>Email:</label> <span>${data.teacher.email}</span></div>
    `;

    // Информация о теме
    const topicInfoContainer = document.getElementById("topicDetails");
    topicInfoContainer.innerHTML = `
        <div class="info-row"><label>Тема:</label> <span>${data.topic.name}</span></div>
    `;

    const generateButton = document.querySelector(".generate-test-button");

    if (data.attempts <= data.usedAttempts) {
        const notEnoughAttempts = document.getElementById("notEnoughAttempts");
        generateButton.classList.add('disabled');
        generateButton.style.backgroundColor = "red";
        notEnoughAttempts.style.display = "revert";
    } else {
        generateButton.addEventListener("click", function() {
            window.location.href = `generated_test?et=amnfkegnwgnkgnwgjrngnr&yj=rgorgokerpgergenrgeorngegope&id=${data.id}&ops=45565oihor&hg=rgjrgirgrrg&name=${data.testName}&ty=regokeejoergrgjregiregjreoijgorggjergjregjernvkldfknkvlscvpenh`
        })
    }
}

// Загружаем информацию о тесте при загрузке страницы
window.addEventListener('DOMContentLoaded', loadTestInfo);

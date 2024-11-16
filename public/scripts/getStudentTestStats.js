function formatTime(seconds) {
    if (seconds < 60) {
        // Меньше минуты — просто секунды
        return `${seconds} сек`;
    } else if (seconds < 3600) {
        // Меньше часа — минуты и секунды
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} мин ${remainingSeconds} сек`;
    } else {
        // Больше часа — часы, минуты и секунды
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours} ч ${minutes} мин ${remainingSeconds} сек`;
    }
}

function formatDateTime(dateString) {
    const date = new Date(dateString);

    // Получаем часы, минуты и секунды
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Получаем день, месяц и год
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();

    // Формируем строку в нужном формате
    return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
}



async function fetchAndDisplayProducts() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const testId = urlParams.get("test_id");
    const studentId = urlParams.get("student_id");

    const loaders = document.querySelectorAll(".loader");
    const errorMessageBox = document.querySelector(".error-message");
    const productList = document.querySelector(".product-list");

    try {
        loaders.forEach(loader => {
            loader.style.display = "block";
        });

        errorMessageBox.style.display = "none";

        const response = await fetch("https://testing-platform.onrender.com/api/test/get_student_results", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                testId: parseInt(testId),
                studentId: parseInt(studentId)
            })
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        if (response.status === 401) {
            window.location.href = "auth";
        } else if (response.status === 403) {
            errorMessageBox.textContent = "Данный блок вам недоступен!";
        }

        const data = await response.json();

        document.querySelector("h2").textContent = "Статистика студента " + data.student.name + " для теста " + "\"" + data.test.testName + "\"";

        for (let i = 0; i < data.usedAttempts.length; i++){
            const usedAttempt = data.usedAttempts[i];
            const productDiv = document.createElement("div");
            productDiv.className = "attempt";

            const nameDiv = document.createElement("div");
            nameDiv.innerHTML = `<h3 class="product-name">Попытка ${i + 1}</h3>`;
            // nameDiv.addEventListener("mouseover", () => {
            //     nameDiv.style.transition = "color 0.3s";
            //     nameDiv.style.cursor = "pointer";
            //     nameDiv.style.color = "blue";
            // });
            // nameDiv.addEventListener("mouseout", () => {
            //     nameDiv.style.color = "initial";
            // });


            // const imageDiv = document.createElement("div");
            // imageDiv.innerHTML = `<img class="product-image" src="${usedAttempt.imageurl}" alt="Product Image">`;
            // imageDiv.addEventListener("mouseover", () => {
            //     imageDiv.style.cursor = "pointer";
            // });
            //
            // const topicDiv = document.createElement("div");
            // topicDiv.className = "product-price";
            // topicDiv.textContent = `Группа: ${usedAttempt.student.group}`;

            const categoryDiv = document.createElement("div");
            categoryDiv.className = "product-category";
            categoryDiv.textContent = `Затраченное время: ${formatTime(usedAttempt.timeSpent)}`;
            //
            const brandDiv = document.createElement("div");
            brandDiv.className = "product-brand";
            brandDiv.textContent = `Результат: ${usedAttempt.score} из ${data.test.questionCount}`;
            //
            // const availabilityDiv = document.createElement("div");
            // availabilityDiv.className = "product-availability";
            // availabilityDiv.textContent = `Количество попыток: ${usedAttempt.attempts}`;

            const usedAttemptsDiv = document.createElement("div");
            usedAttemptsDiv.className = "product-usedAttempt";
            usedAttemptsDiv.textContent = `Дата попытки: ${formatDateTime(usedAttempt.attemptDate)}`;

            // if (usedAttempt.attempts <= usedAttempt.usedAttempt) {
            //     productDiv.classList.add("disabled");
            // }

            productDiv.appendChild(nameDiv);
            // productDiv.appendChild(topicDiv);
            productDiv.appendChild(categoryDiv);
            productDiv.appendChild(brandDiv);
            // productDiv.appendChild(availabilityDiv);
            productDiv.appendChild(usedAttemptsDiv);

            productList.appendChild(productDiv);
        }

    } catch (error) {
        console.error(error);
        errorMessageBox.style.display = "block";
    } finally {
        loaders.forEach(loader => {
            loader.style.display = "none";
        });
    }
}

window.addEventListener("DOMContentLoaded", fetchAndDisplayProducts);

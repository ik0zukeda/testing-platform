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


async function fetchAndDisplayProducts() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const testId = urlParams.get("id");

    const loaders = document.querySelectorAll(".loader");
    const errorMessageBox = document.querySelector(".error-message");
    const productList = document.querySelector(".product-list");

    try {
        loaders.forEach(loader => {
            loader.style.display = "block";
        });

        errorMessageBox.style.display = "none";

        const response = await fetch("https://testing-platform.onrender.com/api/test/get_students_best_results", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ testId: parseInt(testId) })
        });

        if (response.status === 401) {
            window.location.href = "auth";
        } else if (response.status === 403) {
            window.location.href = "403";
        }

        const data = await response.json();

        document.querySelector("h2").textContent = "Статистика теста " + "\"" + data.test.testName + "\"";

        if (data.info.length !== 0) {
            document.getElementById("avgScore").textContent = "Средний результат: " + data.avgScore + " из " + data.test.questionCount;
            document.getElementById("avgTime").textContent = "Среднее затраченное время: " + formatTime(data.avgTime);

            data.info.forEach((bestAttempt) => {
                const productDiv = document.createElement("div");
                productDiv.className = "product";

                const nameDiv = document.createElement("div");
                nameDiv.innerHTML = `<h3 class="product-name">${bestAttempt.student.name}</h3>`;
                nameDiv.addEventListener("mouseover", () => {
                    nameDiv.style.transition = "color 0.3s";
                    nameDiv.style.cursor = "pointer";
                    nameDiv.style.color = "blue";
                });
                nameDiv.addEventListener("mouseout", () => {
                    nameDiv.style.color = "initial";
                });


                // const imageDiv = document.createElement("div");
                // imageDiv.innerHTML = `<img class="product-image" src="${bestAttempt.imageurl}" alt="Product Image">`;
                // imageDiv.addEventListener("mouseover", () => {
                //     imageDiv.style.cursor = "pointer";
                // });
                //
                const topicDiv = document.createElement("div");
                topicDiv.className = "product-price";
                topicDiv.textContent = `Группа: ${bestAttempt.student.group}`;

                const categoryDiv = document.createElement("div");
                categoryDiv.className = "product-category";
                categoryDiv.textContent = `Лучшее время: ${formatTime(bestAttempt.minTimeSpent)}`;
                //
                const brandDiv = document.createElement("div");
                brandDiv.className = "product-brand";
                brandDiv.textContent = `Лучший результат: ${bestAttempt.maxScore} из ${data.test.questionCount}`;
                //
                // const availabilityDiv = document.createElement("div");
                // availabilityDiv.className = "product-availability";
                // availabilityDiv.textContent = `Количество попыток: ${bestAttempt.attempts}`;

                const usedAttemptsDiv = document.createElement("div");
                usedAttemptsDiv.className = "product-usedAttempts";
                usedAttemptsDiv.textContent = `Использовано попыток: ${bestAttempt.usedAttempts} из ${data.test.attempts}`;

                // if (bestAttempt.attempts <= bestAttempt.usedAttempts) {
                //     productDiv.classList.add("disabled");
                // }

                productDiv.appendChild(nameDiv);
                productDiv.appendChild(topicDiv);
                productDiv.appendChild(categoryDiv);
                productDiv.appendChild(brandDiv);
                // productDiv.appendChild(availabilityDiv);
                productDiv.appendChild(usedAttemptsDiv);

                productList.appendChild(productDiv);

                const elements = [nameDiv];

                elements.forEach((element) => {
                    element.addEventListener("click", () => {
                        window.location.href = `student_test_stat?test_id=${data.test.id}&student_id=${bestAttempt.student.id}`;
                    });
                });
            });
        } else {
            document.getElementById("avgScore").textContent = "Данный тест ещё никто не проходил"
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

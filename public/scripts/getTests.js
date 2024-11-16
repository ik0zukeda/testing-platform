async function fetchAndDisplayProducts() {
    const loaders = document.querySelectorAll(".loader");
    const errorMessageBox = document.querySelector(".error-message");
    const productList = document.querySelector(".product-list");

    const role = localStorage.getItem("role");

    try {
        loaders.forEach(loader => {
            loader.style.display = "block";
        });

        errorMessageBox.style.display = "none";

        const response = await fetch("https://testing-platform.onrender.com/api/test/receive_all", {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            window.location.href = "auth";
        } else if (response.status === 403) {
            window.location.href = "403";
        }

        const data = await response.json();

        data.forEach((test) => {
            const productDiv = document.createElement("div");
            productDiv.className = "product";

            const nameDiv = document.createElement("div");
            nameDiv.innerHTML = `<h3 class="product-name">${test.testName}</h3>`;
            nameDiv.addEventListener("mouseover", () => {
                nameDiv.style.transition = "color 0.3s";
                nameDiv.style.cursor = "pointer";
                nameDiv.style.color = "blue";
            });
            nameDiv.addEventListener("mouseout", () => {
                nameDiv.style.color = "initial";
            });


            // const imageDiv = document.createElement("div");
            // imageDiv.innerHTML = `<img class="product-image" src="${test.imageurl}" alt="Product Image">`;
            // imageDiv.addEventListener("mouseover", () => {
            //     imageDiv.style.cursor = "pointer";
            // });
            //
            const topicDiv = document.createElement("div");
            topicDiv.className = "product-price";
            topicDiv.textContent = `Тема: ${test.topic.name}`;
            //
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "product-category";
            categoryDiv.textContent = `Преподаватель: ${test.teacher.name}`;
            //
            const brandDiv = document.createElement("div");
            brandDiv.className = "product-brand";
            brandDiv.textContent = `Количество вопросов: ${test.questionCount}`;
            //
            const availabilityDiv = document.createElement("div");
            availabilityDiv.className = "product-availability";
            availabilityDiv.textContent = `Количество попыток: ${test.attempts}`;

            const usedAttemptsDiv = document.createElement("div");
            usedAttemptsDiv.className = "product-usedAttempts";
            usedAttemptsDiv.textContent = `Использовано попыток: ${test.usedAttempts}`;

            if (test.attempts <= test.usedAttempts) {
                productDiv.classList.add("disabled");
            }

            productDiv.appendChild(nameDiv);
            productDiv.appendChild(topicDiv);
            productDiv.appendChild(categoryDiv);
            productDiv.appendChild(brandDiv);
            productDiv.appendChild(availabilityDiv);

            if (test.usedAttempts !== "недоступно") {
                productDiv.appendChild(usedAttemptsDiv);
            }


            productList.appendChild(productDiv);

            const elements = [nameDiv];

            elements.forEach((element) => {
                if (role === "1"){
                    element.addEventListener("click", () => {
                        window.location.href = `test?id=${test.id}`;
                    });
                } else {
                    element.addEventListener("click", () => {
                        window.location.href = `update_test?id=${test.id}`;
                    });
                }
            });
        });

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

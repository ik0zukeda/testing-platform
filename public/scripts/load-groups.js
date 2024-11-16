let allGroups = [];
let teacherGroups = [];

async function fetchGroups() {
    const loaders = document.querySelectorAll(".loader");
    const errorMessageBox = document.querySelector(".error-message");
    const productList = document.querySelector(".product-list");
    const groupDropdown = document.querySelector("#groupDropdown");
    const addGroupButton = document.querySelector("#addGroupButton");

    try {
        loaders.forEach(loader => {
            loader.style.display = "block";
        });

        errorMessageBox.style.display = "none";

        // Получаем группы преподавателя
        const responseTeacherGroups = await fetch("https://testing-platform.onrender.com/api/teacher/groups", {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (responseTeacherGroups.status === 403) {
            window.location.href = "403";
        }

        teacherGroups = await responseTeacherGroups.json();

        // Получаем все группы в организации
        const responseAllGroups = await fetch(`https://testing-platform.onrender.com/api/teacher/receive/org/groups`, {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (responseAllGroups.status === 403) {
            window.location.href = "403";
        }

        allGroups = await responseAllGroups.json();

        // Обновляем выпадающий список групп
        groupDropdown.innerHTML = "";
        allGroups.forEach(group => {
            const option = document.createElement("option");
            option.value = group;
            option.textContent = group;

            // Если группа уже у преподавателя, то делаем ее disabled
            if (teacherGroups.includes(group)) {
                option.disabled = true;
                option.textContent += " (уже добавлена)";
            }
            groupDropdown.appendChild(option);
        });

        // Отображаем текущие группы преподавателя
        productList.innerHTML = "";
        teacherGroups.forEach((group) => {
            const productDiv = document.createElement("div");
            productDiv.className = "product";

            const nameDiv = document.createElement("div");
            nameDiv.innerHTML = `<h3 class="product-name">${group}</h3>`;

            const deleteGroupButton = document.createElement("button");
            deleteGroupButton.id = "deleteGroupButton";
            deleteGroupButton.textContent = `Удалить`;
            deleteGroupButton.addEventListener("click", async function () {
                productDiv.classList.add("disabled");

                const response = await fetch("https://testing-platform.onrender.com/api/teacher/remove_group", {
                    method: "POST",
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ group: group })
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

                    toastr.success(`Группа "${group}" успешно удалена`);

                    teacherGroups = teacherGroups.filter(tgroup => tgroup !== group);
                    groupDropdown.innerHTML = "";
                    allGroups.forEach(group => {
                        const option = document.createElement("option");
                        option.value = group;
                        option.textContent = group;

                        // Если группа уже у преподавателя, то делаем ее disabled
                        if (teacherGroups.includes(group)) {
                            option.disabled = true;
                            option.textContent += " (уже добавлена)";
                        }
                        groupDropdown.appendChild(option);
                    });

                    productDiv.remove();
                } else {
                    const error = await response.json();
                    toastr.options = {
                        "progressBar": true,
                        "positionClass": "toast-top-right",
                        "timeOut": "5000"
                    };

                    toastr.error(`Ошибка: ${error.message}`);
                    productDiv.classList.remove('disabled');
                }
            });

            productDiv.appendChild(nameDiv);
            productDiv.appendChild(deleteGroupButton);
            productList.appendChild(productDiv);
        });

        // Добавляем обработчик для кнопки добавления группы
        addGroupButton.addEventListener("click", async function () {
            const selectedGroup = groupDropdown.value;
            if (!selectedGroup) return;

            document.querySelector(".add-user-form").classList.add("disabled");

            const response = await fetch("https://testing-platform.onrender.com/api/teacher/add_group", {
                method: "POST",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ group: selectedGroup })
            });

            if (response.status === 403) {
                window.location.href = "403";
            }

            if (response.ok) {
                toastr.success(`Группа "${selectedGroup}" успешно добавлена`);

                const newProductDiv = document.createElement("div");
                newProductDiv.className = "product";

                const newNameDiv = document.createElement("div");
                newNameDiv.innerHTML = `<h3 class="product-name">${selectedGroup}</h3>`;

                const newDeleteGroupButton = document.createElement("button");
                newDeleteGroupButton.id = "deleteGroupButton";
                newDeleteGroupButton.textContent = `Удалить`;
                newDeleteGroupButton.addEventListener("click", async function () {
                    newProductDiv.classList.add("disabled");

                    const newResponse = await fetch("https://testing-platform.onrender.com/api/teacher/remove_group", {
                        method: "POST",
                        headers: {
                            "authorization": `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ group: selectedGroup })
                    });

                    if (newResponse.status === 403) {
                        window.location.href = "403";
                    }

                    if (newResponse.ok) {
                        toastr.options = {
                            "progressBar": true,
                            "positionClass": "toast-top-right",
                            "timeOut": "3000"
                        };

                        toastr.success(`Группа "${selectedGroup}" успешно удалена`);
                        teacherGroups = teacherGroups.filter(tgroup => tgroup !== selectedGroup);
                        groupDropdown.innerHTML = "";
                        allGroups.forEach(group => {
                            const option = document.createElement("option");
                            option.value = group;
                            option.textContent = group;

                            // Если группа уже у преподавателя, то делаем ее disabled
                            if (teacherGroups.includes(group)) {
                                option.disabled = true;
                                option.textContent += " (уже добавлена)";
                            }
                            groupDropdown.appendChild(option);
                        });

                        newProductDiv.remove();
                    } else {
                        const error = await response.json();
                        toastr.options = {
                            "progressBar": true,
                            "positionClass": "toast-top-right",
                            "timeOut": "5000"
                        };

                        toastr.error(`Ошибка: ${error.message}`);
                        newProductDiv.classList.remove('disabled');
                    }
                });

                newProductDiv.appendChild(newNameDiv);
                newProductDiv.appendChild(newDeleteGroupButton);
                productList.appendChild(newProductDiv);

                teacherGroups.push(selectedGroup);
                // allGroups = allGroups.filter(group => group !== selectedGroup);
                groupDropdown.innerHTML = "";
                allGroups.forEach(group => {
                    const option = document.createElement("option");
                    option.value = group;
                    option.textContent = group;

                    // Если группа уже у преподавателя, то делаем ее disabled
                    if (teacherGroups.includes(group)) {
                        option.disabled = true;
                        option.textContent += " (уже добавлена)";
                    }
                    groupDropdown.appendChild(option);
                });

                document.querySelector(".add-user-form").classList.remove("disabled");
            } else {
                const error = await response.json();
                toastr.error(`Ошибка: ${error.message}`);
                document.querySelector(".add-user-form").classList.remove("disabled");
            }
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

window.addEventListener("DOMContentLoaded", fetchGroups);

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


function add_student() {
    document.getElementById("addStudentForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        const studentName = document.getElementById("student-name").value === "" ? null : document.getElementById("student-name").value;
        const studentGroup = document.getElementById("student-group").value === "" ? null : document.getElementById("student-group").value;
        const organizationId = parseInt(document.querySelector(".id-cell").textContent);

        const data = {
            name: studentName,
            group: studentGroup,
            organizationId
        };

        const addStudentForm = document.getElementById("addStudentForm");
        addStudentForm.classList.add("disabled");

        const response = await fetch("https://testing-platform.onrender.com/api/student/create", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        if (!response.ok) {
            addStudentForm.classList.remove("disabled");
            const json = await response.json();
            alert(json.message);
            throw new Error(json.message);
        }

        const student = await response.json();
        const studentId = student.id;
        const userID = student.userID;
        const name = student.name;
        const studentIsActive = student.isActive;
        const group = student.group;
        const email = student.email;
        const createdAt = student.createdAt;
        const orgName = document.getElementById("h1OrgName").textContent;

        const studentTableBody = document.getElementById("studentTableBody");
        const row = document.createElement("tr");
        row.id = `student-${studentId}`;
        row.innerHTML = `
                    <td class="student-id-cell">${studentId}</td>
                    <td class="student-userId-cell">${userID}</td>
                    <td class="student-name-cell">${name}</td>
                    <td class="student-group-cell">${group}</td>
                    <td class="student-isActive-cell">${studentIsActive}</td>
                    <td class="student-email-cell">${email}</td>
                    <td class="student-createDate-cell">${createdAt}</td>
                    <td class="student-actions">
                        <i class="fas fa-pencil-alt" onclick="editRow('${studentId}', 'student')"></i>
                        <i class="fas fa-check" style="display: none" onclick="saveRow('${studentId}', 'student')"></i>
                        <i class="fas fa-times" style="display: none" onclick="cancelEdit('${studentId}', 'student')"></i>
                        <button class="student-edit-button" onclick="getInviteLink(1, '${studentId}', '${orgName}', '${studentIsActive}')">🔗</button>
                    </td>
                `;

        if (!studentIsActive) {
            row.style.backgroundColor = "darkslategrey";
            row.querySelector(".student-edit-button").style.backgroundColor = "green";
        }

        studentTableBody.appendChild(row);
        cancelAddStudent();
    });
}

function addStudent() {
    const addStudentButton = document.querySelector(".addStudentButton");
    const addTeacherButton = document.querySelector(".addTeacherButton");
    addStudentButton.style.display = "none";
    addTeacherButton.style.display = "none";

    const addStudentForm = document.querySelector(".add-student-form");
    addStudentForm.style.display = "block";

}

function cancelAddStudent() {
    const addStudentForm = document.querySelector(".add-student-form");
    addStudentForm.style.display = "none";

    const addStudentButton = document.querySelector(".addStudentButton");
    const addTeacherButton = document.querySelector(".addTeacherButton");
    addStudentButton.style.removeProperty("display");
    addTeacherButton.style.removeProperty("display");
}

function add_teacher() {
    document.getElementById("addTeacherForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        const teacherName = document.getElementById("teacher-name").value === "" ? null : document.getElementById("teacher-name").value;
        const organizationId = parseInt(document.querySelector(".id-cell").textContent);

        const data = {
            name: teacherName,
            organizationId
        };

        const addTeacherForm = document.getElementById("addTeacherForm");
        addTeacherForm.classList.add("disabled");

        const response = await fetch("https://testing-platform.onrender.com/api/teacher/create", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        if (!response.ok) {
            addTeacherForm.classList.remove("disabled");
            const json = await response.json();
            alert(json.message);
            throw new Error(json.message);
        }

        const teacher = await response.json();
        const teacherId = teacher.id;
        const userID = teacher.userID;
        const name = teacher.name;
        const teacherIsActive = teacher.isActive;
        const email = teacher.email;
        const createdAt = teacher.createdAt;
        const orgName = document.getElementById("h1OrgName").textContent;

        const teacherTableBody = document.getElementById("teacherTableBody");
        const row = document.createElement("tr");
        row.id = `teacher-${teacherId}`;
        row.innerHTML = `
                    <td class="teacher-id-cell">${teacherId}</td>
                    <td class="teacher-userId-cell">${userID}</td>
                    <td class="teacher-name-cell">${name}</td>
                    <td class="teacher-isActive-cell">${teacherIsActive}</td>
                    <td class="teacher-email-cell">${email}</td>
                    <td class="teacher-createDate-cell">${createdAt}</td>
                     <td class="teacher-actions">
                        <i class="fas fa-pencil-alt" onclick="editRow('${teacherId}', 'teacher')"></i>
                        <i class="fas fa-check" style="display: none" onclick="saveRow('${teacherId}', 'teacher')"></i>
                        <i class="fas fa-times" style="display: none" onclick="cancelEdit('${teacherId}', 'teacher')"></i>
                        <button class="teacher-edit-button" onclick="getInviteLink(0, '${teacherId}', '${orgName}', '${teacherIsActive}')">🔗</button>
                    </td>
                `;

        if (!teacherIsActive) {
            row.style.backgroundColor = "darkslategrey";
            row.querySelector(".teacher-edit-button").style.backgroundColor = "green";
        }

        teacherTableBody.appendChild(row);
        cancelAddTeacher();
    });
}

function addTeacher() {
    const addTeacherButton = document.querySelector(".addTeacherButton");
    const addStudentButton = document.querySelector(".addStudentButton");
    addTeacherButton.style.display = "none";
    addStudentButton.style.display = "none";

    const addTeacherForm = document.querySelector(".add-teacher-form");
    addTeacherForm.style.display = "block";

}

function cancelAddTeacher() {
    const addTeacherForm = document.querySelector(".add-teacher-form");
    addTeacherForm.style.display = "none";

    const addTeacherButton = document.querySelector(".addTeacherButton");
    const addStudentButton = document.querySelector(".addStudentButton");
    addTeacherButton.style.removeProperty("display");
    addStudentButton.style.removeProperty("display");
}

async function getInviteLink(role, actorId, orgName, isActive) {
    const data = {
        role: role,
        actorId: parseInt(actorId),
        orgName: orgName,
        isActive: isActive === "true"
    };

    const response = await fetch(`https://testing-platform.onrender.com/api/auth/get_invite_link`, {
        method: "POST",
        headers: {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (response.status === 403) {
        window.location.href = "403";
    }

    if (!response.ok) {
        const res_data = await response.json();
        alert(`Ошибка: ${res_data.message}`);
        throw new Error(res_data.message);
    }

    const link = await response.text();

    await navigator.clipboard.writeText(link);
    toastr.options = {
        "progressBar": true,
        "positionClass": "toast-top-right",
        "timeOut": "3000"
    };

    toastr.success("Ссылка скопирована в буфер обмена!");
}

function editRow(rowId, subject) {
    if (subject === "org") {
        const row = document.getElementById(`org-${rowId}`);

        let nameCell = row.querySelector(`.name-cell`);
        let addressCell = row.querySelector(`.address-cell`);
        let phoneCell = row.querySelector(`.phone-cell`);
        let emailCell = row.querySelector(`.email-cell`);
        let responsiblePersonCell = row.querySelector(`.responsiblePerson-cell`);
        let actionsCell = row.querySelector(`.actions`);

        // Сохраняем оригинальные значения перед редактированием
        nameCell.setAttribute("data-original-value", nameCell.textContent);
        addressCell.setAttribute("data-original-value", addressCell.textContent);
        phoneCell.setAttribute("data-original-value", phoneCell.textContent);
        emailCell.setAttribute("data-original-value", emailCell.textContent);
        responsiblePersonCell.setAttribute("data-original-value", responsiblePersonCell.textContent);

        // Заменяем текст на поля ввода
        nameCell.innerHTML = `<input type="text" id="edit-name-${rowId}" value="${nameCell.textContent}" />`;
        addressCell.innerHTML = `<input type="text" id="edit-address-${rowId}" value="${addressCell.textContent}" />`;
        phoneCell.innerHTML = `<input maxlength="12" type="tel" id="edit-phone-${rowId}" value="${phoneCell.textContent}" />`;
        emailCell.innerHTML = `<input type="email" id="edit-email-${rowId}" value="${emailCell.textContent}" />`;
        responsiblePersonCell.innerHTML = `<input type="text" id="edit-responsiblePerson-${rowId}" value="${responsiblePersonCell.textContent}" />`;

        // Устанавливаем ширину полей ввода на основе содержимого
        setInputWidth(document.getElementById(`edit-name-${rowId}`));
        setInputWidth(document.getElementById(`edit-address-${rowId}`));
        setInputWidth(document.getElementById(`edit-phone-${rowId}`));
        setInputWidth(document.getElementById(`edit-email-${rowId}`));
        setInputWidth(document.getElementById(`edit-responsiblePerson-${rowId}`));

        // Скрываем иконку редактирования и показываем иконки сохранения/отмены
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.display = "none";
        check.style.removeProperty("display");
        times.style.removeProperty("display");

        phoneCell.addEventListener("input", function(e) {
            const input = e.target;
            const value = input.value;

            const cleanValue = value.replace(/[^0-9+]/g, "");

            if (cleanValue.startsWith("+7")) {
                input.maxLength = 12;
            } else {
                input.maxLength = 11;
            }

            input.value = cleanValue;
        });
    } else if (subject === "student") {
        const row = document.getElementById(`student-${rowId}`);

        let nameCell = row.querySelector(`.student-name-cell`);
        let groupCell = row.querySelector(`.student-group-cell`);
        let emailCell = row.querySelector(`.student-email-cell`);
        let actionsCell = row.querySelector(`.student-actions`);

        // Сохраняем оригинальные значения перед редактированием
        nameCell.setAttribute("data-original-value", nameCell.textContent);
        groupCell.setAttribute("data-original-value", groupCell.textContent);
        emailCell.setAttribute("data-original-value", emailCell.textContent);


        // Заменяем текст на поля ввода
        nameCell.innerHTML = `<input type="text" id="edit-student-name-${rowId}" value="${nameCell.textContent}" />`;
        groupCell.innerHTML = `<input type="text" id="edit-student-group-${rowId}" value="${groupCell.textContent}" />`;
        emailCell.innerHTML = `<input type="email" id="edit-student-email-${rowId}" value="${emailCell.textContent}" />`;

        // Устанавливаем ширину полей ввода на основе содержимого
        setInputWidth(document.getElementById(`edit-student-name-${rowId}`), 60);
        setInputWidth(document.getElementById(`edit-student-group-${rowId}`), 0, 70);
        setInputWidth(document.getElementById(`edit-student-email-${rowId}`), 10);

        // Скрываем иконку редактирования и показываем иконки сохранения/отмены
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.display = "none";
        check.style.removeProperty("display");
        times.style.removeProperty("display");
    } else if (subject === "teacher") {
        const row = document.getElementById(`teacher-${rowId}`);

        let nameCell = row.querySelector(`.teacher-name-cell`);
        let emailCell = row.querySelector(`.teacher-email-cell`);
        let actionsCell = row.querySelector(`.teacher-actions`);

        // Сохраняем оригинальные значения перед редактированием
        nameCell.setAttribute("data-original-value", nameCell.textContent);
        emailCell.setAttribute("data-original-value", emailCell.textContent);


        // Заменяем текст на поля ввода
        nameCell.innerHTML = `<input type="text" id="edit-teacher-name-${rowId}" value="${nameCell.textContent}" />`;
        emailCell.innerHTML = `<input type="email" id="edit-teacher-email-${rowId}" value="${emailCell.textContent}" />`;

        // Устанавливаем ширину полей ввода на основе содержимого
        setInputWidth(document.getElementById(`edit-teacher-name-${rowId}`), 60);
        setInputWidth(document.getElementById(`edit-teacher-email-${rowId}`), 10);

        // Скрываем иконку редактирования и показываем иконки сохранения/отмены
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.display = "none";
        check.style.removeProperty("display");
        times.style.removeProperty("display");
    }
}

function isValidEmail(email) {
    if (email === "" || email === "null") {
        return true;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

async function saveRow(rowId, subject) {
    if (subject === "org") {
        const row = document.getElementById(`org-${rowId}`);
        const emailInput = document.getElementById(`edit-email-${rowId}`);
        if (!isValidEmail(emailInput.value)) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "3000"
            };

            toastr.error("Неверный формат почты");
            return;
        }

        let nameCell = row.querySelector(`.name-cell`);
        let addressCell = row.querySelector(`.address-cell`);
        let phoneCell = row.querySelector(`.phone-cell`);
        let emailCell = row.querySelector(`.email-cell`);
        let responsiblePersonCell = row.querySelector(`.responsiblePerson-cell`);
        let actionsCell = row.querySelector(`.actions`);

        const name = document.getElementById(`edit-name-${rowId}`).value;
        const address = document.getElementById(`edit-address-${rowId}`).value;
        const phone = document.getElementById(`edit-phone-${rowId}`).value;
        const email = document.getElementById(`edit-email-${rowId}`).value;
        const responsiblePerson = document.getElementById(`edit-responsiblePerson-${rowId}`).value;

        const data = {
            name: name === "" || name === "null" ? null : name,
            address: address === "" || address === "null" ? null : address,
            phone: phone === "" || phone === "null" ? null : phone,
            email: email === "" || email === "null" ? null : email,
            responsiblePerson: responsiblePerson === "" || responsiblePerson === "null" ? null : responsiblePerson
        };

        const response = await fetch(`https://testing-platform.onrender.com/api/organization/update/${rowId}`, {
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

        const org = await response.json();

        if (!response.ok) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Ошибка: ${org.message}`);
            throw new Error(org.message);
        }

        toastr.options = {
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };

        toastr.success(`Данные организации успешно обновлены`);

        // Получаем значения из input и заменяем их на текстовое содержимое
        nameCell.textContent = org.name + "";
        addressCell.textContent = org.address + "";
        phoneCell.textContent = org.phone + "";
        emailCell.textContent = org.email + "";
        responsiblePersonCell.textContent = org.responsiblePerson + "";

        document.getElementById("h1OrgName").textContent = org.name;

        // Скрываем иконки сохранения/отмены и показываем иконку редактирования
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.removeProperty("display");
        check.style.display = "none";
        times.style.display = "none";
    } else if (subject === "student") {
        const row = document.getElementById(`student-${rowId}`);
        const emailInput = document.getElementById(`edit-student-email-${rowId}`);
        if (!isValidEmail(emailInput.value)) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "3000"
            };

            toastr.error("Неверный формат почты");
            return;
        }

        let nameCell = row.querySelector(`.student-name-cell`);
        let groupCell = row.querySelector(`.student-group-cell`);
        let isActiveCell = row.querySelector(`.student-isActive-cell`);
        let emailCell = row.querySelector(`.student-email-cell`);
        let actionsCell = row.querySelector(`.student-actions`);

        const name = document.getElementById(`edit-student-name-${rowId}`).value;
        const group = document.getElementById(`edit-student-group-${rowId}`).value;
        const email = document.getElementById(`edit-student-email-${rowId}`).value;

        const data = {
            name: name === "" || name === "null" ? null : name,
            group: group === "" || group === "null" ? null : group,
            // isActive: isActive === "" || isActive === "null" ? null : (isActive !== "true" && isActive !== "false" ? null : (isActive === "true")),
            email: email === "" || email === "null" ? null : email
        };

        const response = await fetch(`https://testing-platform.onrender.com/api/student/update/${rowId}`, {
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

        const student = await response.json();

        if (!response.ok) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Ошибка: ${student.message}`);
            throw new Error(student.message);
        }

        toastr.success(`Данные студента успешно обновлены`);

        // Получаем значения из input и заменяем их на текстовое содержимое
        nameCell.textContent = student.name + "";
        groupCell.textContent = student.group + "";
        isActiveCell.textContent = student.isActive + "";
        emailCell.textContent = student.email + "";

        if (!student.isActive) {
            row.style.backgroundColor = "darkslategrey";
            row.querySelector(".student-edit-button").style.backgroundColor = "green";
        } else {
            row.style.removeProperty("background-color");
            row.querySelector(".student-edit-button").style.removeProperty("background-color");
        }

        // Скрываем иконки сохранения/отмены и показываем иконку редактирования
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.removeProperty("display");
        check.style.display = "none";
        times.style.display = "none";
    } else if (subject === "teacher") {
        const row = document.getElementById(`teacher-${rowId}`);
        const emailInput = document.getElementById(`edit-teacher-email-${rowId}`);
        if (!isValidEmail(emailInput.value)) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "3000"
            };

            toastr.error("Неверный формат почты");
            return;
        }

        let nameCell = row.querySelector(`.teacher-name-cell`);
        let isActiveCell = row.querySelector(`.teacher-isActive-cell`);
        let emailCell = row.querySelector(`.teacher-email-cell`);
        let actionsCell = row.querySelector(`.teacher-actions`);

        const name = document.getElementById(`edit-teacher-name-${rowId}`).value;
        const email = document.getElementById(`edit-teacher-email-${rowId}`).value;

        const data = {
            name: name === "" || name === "null" ? null : name,
            // isActive: isActive === "" || isActive === "null" ? null : (isActive !== "true" && isActive !== "false" ? null : (isActive === "true")),
            email: email === "" || email === "null" ? null : email
        };

        const response = await fetch(`https://testing-platform.onrender.com/api/teacher/update/${rowId}`, {
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

        const teacher = await response.json();

        if (!response.ok) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Ошибка: ${teacher.message}`);
            throw new Error(teacher.message);
        }

        toastr.success(`Данные преподавателя успешно обновлены`);

        // Получаем значения из input и заменяем их на текстовое содержимое
        nameCell.textContent = teacher.name + "";
        isActiveCell.textContent = teacher.isActive + "";
        emailCell.textContent = teacher.email + "";

        if (!teacher.isActive) {
            row.style.backgroundColor = "darkslategrey";
            row.querySelector(".teacher-edit-button").style.backgroundColor = "green";
        } else {
            row.style.removeProperty("background-color");
            row.querySelector(".teacher-edit-button").style.removeProperty("background-color");
        }

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
    if (subject === "org") {
        const row = document.getElementById(`org-${rowId}`);

        let nameCell = row.querySelector(`.name-cell`);
        let addressCell = row.querySelector(`.address-cell`);
        let phoneCell = row.querySelector(`.phone-cell`);
        let emailCell = row.querySelector(`.email-cell`);
        let responsiblePersonCell = row.querySelector(`.responsiblePerson-cell`);
        let actionsCell = row.querySelector(`.actions`);

        // Восстанавливаем оригинальные значения из data-атрибутов
        nameCell.textContent = nameCell.getAttribute("data-original-value");
        addressCell.textContent = addressCell.getAttribute("data-original-value");
        phoneCell.textContent = phoneCell.getAttribute("data-original-value");
        emailCell.textContent = emailCell.getAttribute("data-original-value");
        responsiblePersonCell.textContent = responsiblePersonCell.getAttribute("data-original-value");

        // Скрываем иконки сохранения/отмены и показываем иконку редактирования
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.removeProperty("display");
        check.style.display = "none";
        times.style.display = "none";
    } else if (subject === "student") {
        const row = document.getElementById(`student-${rowId}`);

        let nameCell = row.querySelector(`.student-name-cell`);
        let groupCell = row.querySelector(`.student-group-cell`);
        let emailCell = row.querySelector(`.student-email-cell`);
        let actionsCell = row.querySelector(`.student-actions`);

        // Восстанавливаем оригинальные значения из data-атрибутов
        nameCell.textContent = nameCell.getAttribute("data-original-value");
        groupCell.textContent = groupCell.getAttribute("data-original-value");
        emailCell.textContent = emailCell.getAttribute("data-original-value");

        // Скрываем иконки сохранения/отмены и показываем иконку редактирования
        const pencil = actionsCell.querySelector(".fa-pencil-alt");
        const check = actionsCell.querySelector(".fa-check");
        const times = actionsCell.querySelector(".fa-times");

        pencil.style.removeProperty("display");
        check.style.display = "none";
        times.style.display = "none";
    } else if (subject === "teacher") {
        const row = document.getElementById(`teacher-${rowId}`);

        let nameCell = row.querySelector(`.teacher-name-cell`);
        let emailCell = row.querySelector(`.teacher-email-cell`);
        let actionsCell = row.querySelector(`.teacher-actions`);

        // Восстанавливаем оригинальные значения из data-атрибутов
        nameCell.textContent = nameCell.getAttribute("data-original-value");
        emailCell.textContent = emailCell.getAttribute("data-original-value");

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
    if (role !== "2") {
        window.location.href = "403";
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const name = urlParams.get("name");

    const loader = document.querySelector(".loader");

    try {
        loader.style.display = "block";
        const response = await fetch(`https://testing-platform.onrender.com/api/organization/receive_with_all/${name}`, {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 403) {
            window.location.href = "403";
        }

        const org = await response.json();

        if (!response.ok) {
            throw new Error(org.message);
        }

        const orgName = org.name;

        document.getElementById("h1OrgName").textContent = orgName;

        const userTableBody = document.getElementById("userTableBody");
        userTableBody.innerHTML = "";

        const row = document.createElement("tr");
        const id = org.id;
        const org_name = org.name;
        const org_phone = org.phone;
        const org_email = org.email;
        const org_responsiblePerson = org.responsiblePerson;
        const org_address = org.address;
        row.id = `org-${id}`;
        row.innerHTML = `
                    <td class="id-cell">${id}</td>
                    <td class="name-cell">${org_name}</td>
                    <td class="address-cell">${org_address}</td>
                    <td class="phone-cell">${org_phone}</td>
                    <td class="email-cell">${org_email}</td>
                    <td class="responsiblePerson-cell">${org_responsiblePerson}</td>
                    <td class="actions">
                        <i class="fas fa-pencil-alt" onclick="editRow('${id}', 'org')"></i>
                        <i class="fas fa-check" style="display: none" onclick="saveRow('${id}', 'org')"></i>
                        <i class="fas fa-times" style="display: none" onclick="cancelEdit('${id}', 'org')"></i>
                    </td>
                `;
        userTableBody.appendChild(row);


        const studentTableBody = document.getElementById("studentTableBody");
        studentTableBody.innerHTML = "";

        org.students.forEach((student) => {
            const row = document.createElement("tr");
            const studentId = student.id;
            const userID = student.userID;
            const name = student.name;
            const studentIsActive = student.isActive;
            const group = student.group;
            const email = student.email;
            const createdAt = student.createdAt;
            row.id = `student-${studentId}`;
            row.innerHTML = `
                    <td class="student-id-cell">${studentId}</td>
                    <td class="student-userId-cell">${userID}</td>
                    <td class="student-name-cell">${name}</td>
                    <td class="student-group-cell">${group}</td>
                    <td class="student-isActive-cell">${studentIsActive}</td>
                    <td class="student-email-cell">${email}</td>
                    <td class="student-createDate-cell">${createdAt}</td>
                    <td class="student-actions">
                        <i class="fas fa-pencil-alt" onclick="editRow('${studentId}', 'student')"></i>
                        <i class="fas fa-check" style="display: none" onclick="saveRow('${studentId}', 'student')"></i>
                        <i class="fas fa-times" style="display: none" onclick="cancelEdit('${studentId}', 'student')"></i>
                        <button class="student-edit-button" onclick="getInviteLink(1, '${studentId}', '${orgName}', '${studentIsActive}')">🔗</button>
                    </td>
                `;

            if (!studentIsActive) {
                row.style.backgroundColor = "darkslategrey";
                row.querySelector(".student-edit-button").style.backgroundColor = "green";
            }

            studentTableBody.appendChild(row);
        });

        const teacherTableBody = document.getElementById("teacherTableBody");
        teacherTableBody.innerHTML = "";

        org.teachers.forEach((teacher) => {
            const row = document.createElement("tr");
            const teacherId = teacher.id;
            const userID = teacher.userID;
            const name = teacher.name;
            const teacherIsActive = teacher.isActive;
            const email = teacher.email;
            const createdAt = teacher.createdAt;
            row.id = `teacher-${teacherId}`;
            row.innerHTML = `
                    <td class="teacher-id-cell">${teacherId}</td>
                    <td class="teacher-userId-cell">${userID}</td>
                    <td class="teacher-name-cell">${name}</td>
                    <td class="teacher-isActive-cell">${teacherIsActive}</td>
                    <td class="teacher-email-cell">${email}</td>
                    <td class="teacher-createDate-cell">${createdAt}</td>
                     <td class="teacher-actions">
                        <i class="fas fa-pencil-alt" onclick="editRow('${teacherId}', 'teacher')"></i>
                        <i class="fas fa-check" style="display: none" onclick="saveRow('${teacherId}', 'teacher')"></i>
                        <i class="fas fa-times" style="display: none" onclick="cancelEdit('${teacherId}', 'teacher')"></i>
                        <button class="teacher-edit-button" onclick="getInviteLink(0, '${teacherId}', '${orgName}', '${teacherIsActive}')">🔗</button>
                    </td>
                `;

            if (!teacherIsActive) {
                row.style.backgroundColor = "darkslategrey";
                row.querySelector(".teacher-edit-button").style.backgroundColor = "green";
            }

            teacherTableBody.appendChild(row);
        });

    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = "none";
    }
}

function changeStudentTableVisibility() {
    changeTableVisibility(".studentTableTitle", ".studentTable");
}

function changeTeacherTableVisibility() {
    changeTableVisibility(".teacherTableTitle", ".teacherTable");
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
window.addEventListener("DOMContentLoaded", add_student);
window.addEventListener("DOMContentLoaded", add_teacher);
window.addEventListener("DOMContentLoaded", changeStudentTableVisibility);
window.addEventListener("DOMContentLoaded", changeTeacherTableVisibility);
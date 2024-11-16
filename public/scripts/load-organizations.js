function addOrgEvent() {
    document.getElementById("addUserForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value === "" ? null : document.getElementById("name").value;
        const address = document.getElementById("address").value === "" ? null : document.getElementById("address").value;
        const phone = document.getElementById("phone").value === "" ? null : document.getElementById("phone").value;
        const email = document.getElementById("email").value === "" ? null : document.getElementById("email").value;
        const responsiblePerson = document.getElementById("responsiblePerson").value === "" ? null : document.getElementById("responsiblePerson").value;

        const data = {
            name,
            address,
            phone,
            email,
            responsiblePerson
        };

        const addUserForm = document.getElementById("addUserForm");
        addUserForm.classList.add("disabled");

        const response = await fetch("https://testing-platform.onrender.com/api/organization/create", {
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
            addUserForm.classList.remove('disabled');
            alert((await response.json()).message)
            throw new Error("Ошибка при добавлении организации");
        }

        const resdata = await response.json();
        const id = resdata;
        const userTableBody = document.getElementById("userTableBody");
        const row = document.createElement("tr");
        row.id = `user-${id}`;
        row.innerHTML = `
                    <td class="id-cell">${id}</td>
                    <td class="name-cell">${name}</td>
                    <td class="address-cell">${address}</td>
                    <td class="phone-cell">${phone}</td>
                    <td class="email-cell">${email}</td>
                    <td class="responsiblePerson-cell">${responsiblePerson}</td>
                `;
        userTableBody.appendChild(row);

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
            window.location.href = `organization?name=${name}`;
        });

        cancelAddUser()
    });
}

function addUser() {
    const addUserButton = document.querySelector(".addUserButton");
    addUserButton.style.display = "none";

    const addUserForm = document.querySelector(".add-user-form");
    addUserForm.style.display = "block";

}

function cancelAddUser() {
    const addUserForm = document.querySelector(".add-user-form");
    addUserForm.style.display = "none";

    const addUserButton = document.querySelector(".addUserButton");
    addUserButton.style.display = "block";
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

    const loader = document.querySelector(".loader");

    try {
        loader.style.display = "block";
        const response = await fetch("https://testing-platform.onrender.com/api/organization/receive_all", {
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
            throw new Error("Ошибка при загрузке данных");
        }

        const userData = await response.json();
        const userTableBody = document.getElementById("userTableBody");

        userTableBody.innerHTML = "";

        userData.forEach(org => {
            const row = document.createElement("tr");
            const id = org.id;
            const org_name = org.name;
            const org_phone = org.phone;
            const org_email = org.email;
            const org_responsiblePerson = org.responsiblePerson;
            const org_address = org.address;
            row.id = `user-${org.id}`;
            row.innerHTML = `
                    <td class="id-cell">${id}</td>
                    <td class="name-cell">${org_name}</td>
                    <td class="address-cell">${org_address}</td>
                    <td class="phone-cell">${org_phone}</td>
                    <td class="email-cell">${org_email}</td>
                    <td class="responsiblePerson-cell">${org_responsiblePerson}</td>
                `;
            userTableBody.appendChild(row);

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
                window.location.href = `organization?name=${org_name}`;
            });
        });

    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = "none";
    }
}

window.addEventListener("DOMContentLoaded", loadUserData);
window.addEventListener("DOMContentLoaded", addOrgEvent);

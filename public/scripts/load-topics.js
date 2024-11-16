function addTopicEvent() {
    document.getElementById("addTopicForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value === "" ? null : document.getElementById("name").value;
        const data = {
            name
        };

        const addTopicForm = document.getElementById("addTopicForm");
        addTopicForm.classList.add("disabled");

        const response = await fetch("https://testing-platform.onrender.com/api/topic/create", {
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
            addTopicForm.classList.remove('disabled');
            alert((await response.json()).message)
            throw new Error("Ошибка при добавлении темы");
        }

        const org = await response.json();

        const topicTableBody = document.getElementById("topicTableBody");
        const row = document.createElement("tr");
        const topic_id = org.id;
        const org_name = org.name;
        const org_id = org.organizationId;
        row.id = `topic-${topic_id}`;
        row.innerHTML = `
                    <td class="id-cell">${topic_id}</td>
                    <td class="org-id-cell">${org_id}</td>
                    <td class="name-cell">${org_name}</td>
                `;
        topicTableBody.appendChild(row);

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
            window.location.href = `topic?id=${topic_id}`;
        });
        cancelAddTopic()
    });
}

function addTopic() {
    const addTopicButton = document.querySelector(".addTopicButton");
    addTopicButton.style.display = "none";

    const addTopicForm = document.querySelector(".add-topic-form");
    addTopicForm.style.display = "block";

}

function cancelAddTopic() {
    const addTopicForm = document.querySelector(".add-topic-form");
    addTopicForm.style.display = "none";

    const addTopicButton = document.querySelector(".addTopicButton");
    addTopicButton.style.display = "block";
}


async function loadTopicData() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "auth";
    }

    const role = localStorage.getItem("role");
    if (role !== "0") {
        window.location.href = "403";
    }

    const loader = document.querySelector(".loader");

    try {
        loader.style.display = "block";
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
            throw new Error("Ошибка при загрузке данных");
        }

        const topicData = await response.json();
        const topicTableBody = document.getElementById("topicTableBody");

        topicTableBody.innerHTML = "";

        topicData.forEach(org => {
            const row = document.createElement("tr");
            const topic_id = org.id;
            const org_name = org.name;
            const org_id = org.organizationId;
            row.id = `topic-${topic_id}`;
            row.innerHTML = `
                    <td class="id-cell">${topic_id}</td>
                    <td class="org-id-cell">${org_id}</td>
                    <td class="name-cell">${org_name}</td>
                `;
            topicTableBody.appendChild(row);

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
                window.location.href = `topic?id=${topic_id}`;
            });
        });

    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = "none";
    }
}

window.addEventListener("DOMContentLoaded", loadTopicData);
window.addEventListener("DOMContentLoaded", addTopicEvent);

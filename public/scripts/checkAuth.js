document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const test_stats_nav = document.getElementById("test_stats");
    const organization_nav = document.getElementById("manage-organization");
    const active_tests_nav = document.getElementById("active_tests");
    const topics_nav = document.getElementById("manage-topics");
    const groups_nav = document.getElementById("manage-groups");

    if (token) {
        const authButton = document.querySelector(".auth-button");
        if (authButton != undefined) {
            authButton.textContent = "Личный кабинет";
            const authForm = document.querySelector(".auth-form");
            authForm.action = "profile";
        }

        if (role !== "0") {
            test_stats_nav.style.display = "none";
            topics_nav.style.display = "none";
            groups_nav.style.display = "none";
        }

        if (role !== "2") {
            organization_nav.style.display = "none";
        } else {
            test_stats_nav.style.display = "none";
            active_tests_nav.style.display = "none";
            topics_nav.style.display = "none";
            groups_nav.style.display = "none";
        }

    } else {
        test_stats_nav.style.display = "none";
        active_tests_nav.style.display = "none";
        organization_nav.style.display = "none";
        topics_nav.style.display = "none";
        groups_nav.style.display = "none";
    }
});
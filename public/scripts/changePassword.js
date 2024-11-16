document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('.change-password').addEventListener('submit', function (e) {
        e.preventDefault();
        window.location.href = 'changePassword';
    });
});
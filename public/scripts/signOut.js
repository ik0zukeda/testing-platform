document.addEventListener("DOMContentLoaded", function () {
    const signOutButton = document.querySelector('.sign-out-button');
    if (signOutButton) {
        signOutButton.addEventListener('click', async function(event) {
            event.preventDefault();
            localStorage.clear();
            await fetch("https://testing-platform.onrender.com/api/auth/logout")
            window.location.href = 'auth';
        });
    }
});
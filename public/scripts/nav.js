document.addEventListener("DOMContentLoaded", function () {
    const currentUrl = window.location.href;
    const navLinks = document.querySelectorAll('.nav-item a');

    for (let i = 0; i < navLinks.length; i++) {
        if (navLinks[i].href === currentUrl) {
            navLinks[i].parentNode.classList.add('active');
            break;
        }
    }
});

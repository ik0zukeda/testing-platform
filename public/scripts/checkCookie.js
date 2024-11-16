function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Функция для проверки cookie и очистки localStorage
function checkAndClearStorage() {
    const authToken = getCookie('auth-token');

    if (!authToken) {
        localStorage.clear();
        console.log('localStorage очищен из-за истечения срока действия cookie');
    }
}

// Вызываем проверку при загрузке страницы
window.onload = checkAndClearStorage;
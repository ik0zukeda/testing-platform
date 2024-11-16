function auth() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const redirect = urlParams.get('redirect');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const data = {
            login: email,
            password: password
        };

        const loginForm = document.getElementById('loginForm');
        loginForm.classList.add('disabled');

        fetch('https://testing-platform.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.user.role);

                    if (redirect) {
                        window.location.href = `${redirect}`;
                    } else {
                        if (data.user.role === 0 || data.user.role === 1) {
                            window.location.href = "active_tests";
                        } else if (data.user.role === 2) {
                            window.location.href = "manage-organization";
                        } else if (data.user.role === undefined || data.user.role === null) {
                            window.location.href = "auth";
                        } else {
                            window.location.href = "auth";
                        }
                    }
                } else {
                    toastr.options = {
                        "progressBar": true,
                        "positionClass": "toast-top-right",
                        "timeOut": "5000"
                    };

                    toastr.error(`Ошибка входа: ${data.message}`);
                    loginForm.classList.remove('disabled');
                }
            })
            .catch(error => {
                console.error('Ошибка: ' + error);
            });
    });
}

document.addEventListener("DOMContentLoaded", auth)

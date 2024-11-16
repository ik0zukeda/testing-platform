document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("changePasswordForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const password = document.getElementById("password").value;
        const checkPassword = document.getElementById("checkPassword").value;
        if (password === checkPassword) {
            const data = {
                password: password
            };

            const changePasswordForm = document.getElementById("changePasswordForm");
            changePasswordForm.classList.add("disabled");

            fetch("https://testing-platform.onrender.com/api/auth/update_password", {
                method: "POST",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        toastr.options = {
                            "progressBar": true,
                            "positionClass": "toast-top-right",
                            "timeOut": "3000"
                        };

                        toastr.success(`Пароль обновлён`);
                    } else {
                        toastr.options = {
                            "progressBar": true,
                            "positionClass": "toast-top-right",
                            "timeOut": "5000"
                        };

                        toastr.error(`Ошибка: ${data.error}`);
                        changePasswordForm.classList.remove("disabled");
                    }
                })
                .catch(error => {
                    console.error("Ошибка: " + error);
                });
        } else {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Пароли не совпадают!`);
        }
    });
});
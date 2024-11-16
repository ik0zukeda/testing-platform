document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("sendRecoverLinkButton").addEventListener("click", async function() {
        const email = document.getElementById("email").value;
        if(!isValidEmail(email)) {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "3000"
            };

            toastr.error(`Введите корректную почту`);
            return;
        }

        if (email) {
            const data = {
                email: email
            };

            const code_button = document.getElementById("sendRecoverLinkButton");
            code_button.disabled = true;

            const response = await fetch("https://testing-platform.onrender.com/api/auth/recover_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                toastr.options = {
                    "progressBar": true,
                    "positionClass": "toast-top-right",
                    "timeOut": "10000"
                };

                toastr.success(`Письмо успешно отправлено на указанный адрес почты. Через 10 секунд вы будете перенаправлены на страницу авторизации`);
                setTimeout(() => {
                    window.location.href = "auth";
                }, 10000);
            } else {
                const resData = await response.json();
                toastr.options = {
                    "progressBar": true,
                    "positionClass": "toast-top-right",
                    "timeOut": "5000"
                };

                toastr.error(`Ошибка при отправке письма: ${resData.message}`);
                code_button.disabled = false;
            }

        } else {
            toastr.options = {
                "progressBar": true,
                "positionClass": "toast-top-right",
                "timeOut": "5000"
            };

            toastr.error(`Введите почту, чтобы восстановить пароль`);
        }
    });
});

function isValidEmail(email) {
    if (email === "" || email === "null") {
        return true;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}


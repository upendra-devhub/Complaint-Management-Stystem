(function () {
    const session = window.CMS.session;
    const api = window.CMS.api;
    const utils = window.CMS.utils;

    function togglePassword(button) {
        const targetId = button.getAttribute("data-target");
        const input = document.getElementById(targetId);
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        button.className = `bi ${isHidden ? "bi-eye" : "bi-eye-slash"} toggle-password`;
    }

    function bindPasswordToggles() {
        document.querySelectorAll(".toggle-password").forEach(function (button) {
            button.addEventListener("click", function () {
                togglePassword(button);
            });
        });
    }

    function redirectIfAuthenticated() {
        const user = session.getUser();
        const token = session.getToken();
        if (user && token) {
            session.redirectByRole(user.role);
        }
    }

    function bindLoginForm() {
        const form = document.getElementById("loginForm");
        if (!form) {
            return;
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="ph ph-arrow-repeat"></i> Signing in...';

            try {
                const payload = {
                    email: form.email.value.trim(),
                    password: form.password.value
                };
                const response = await api.login(payload);
                session.setSession(response.data);
                utils.showToast(response.message, "success");
                session.redirectByRole(response.data.user.role);
            } catch (error) {
                utils.showToast(error.message, "error");
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Login <i class="ph ph-arrow-right"></i>';
            }
        });
    }

    function bindRegisterForm() {
        const form = document.getElementById("registerForm");
        if (!form) {
            return;
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (form.password.value !== form.confirmPassword.value) {
                utils.showToast("Password and confirm password must match.", "error");
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="ph ph-arrow-repeat"></i> Creating account...';

            try {
                const payload = {
                    name: form.name.value.trim(),
                    email: form.email.value.trim(),
                    phone: form.phone.value.trim(),
                    address: form.address.value.trim(),
                    password: form.password.value
                };

                await api.register(payload);
                const loginResponse = await api.login({
                    email: payload.email,
                    password: payload.password
                });
                session.setSession(loginResponse.data);
                utils.showToast("Account created successfully.", "success");
                session.redirectByRole(loginResponse.data.user.role);
            } catch (error) {
                utils.showToast(error.message, "error");
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Register <i class="ph ph-arrow-right"></i>';
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        redirectIfAuthenticated();
        bindPasswordToggles();
        bindLoginForm();
        bindRegisterForm();

        const forgotLink = document.querySelector("[data-forgot-password]");
        if (forgotLink) {
            forgotLink.addEventListener("click", function (event) {
                event.preventDefault();
                utils.showToast("Forgot password is not available in the current backend yet.", "info");
            });
        }
    });
})();

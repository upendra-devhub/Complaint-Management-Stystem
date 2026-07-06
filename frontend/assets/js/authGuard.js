(function () {
    document.addEventListener("DOMContentLoaded", function () {
        const user = window.CMS.session.getUser();
        const token = window.CMS.session.getToken();
        const requiredRole = document.body.dataset.role;

        if (!user || !token) {
            window.CMS.session.redirectToLogin();
            return;
        }

        if (requiredRole && user.role !== requiredRole) {
            window.CMS.utils.showToast("Redirected to your role dashboard.", "info");
            window.CMS.session.redirectByRole(user.role);
            return;
        }

        window.CMS.utils.initProtectedLayout();
    });
})();

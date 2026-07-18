(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;
    const session = window.CMS.session;

    function getProfileApi() {
        const user = session.getUser() || {};
        return user.role === "admin" ? api.getAdminProfile : api.getMyProfile;
    }

    function updateProfileApi() {
        const user = session.getUser() || {};
        return user.role === "admin" ? api.updateAdminProfile : api.updateMyProfile;
    }

    function profileForm(profile) {
        return [
            '<form id="profileForm" class="form-grid">',
            '<div class="form-row">',
            '<div class="form-field"><label for="name">Full Name</label>',
            `<input class="field-control" id="name" name="name" type="text" value="${utils.escapeHtml(profile.name || "")}" required></div>`,
            '<div class="form-field"><label for="phone">Phone</label>',
            `<input class="field-control" id="phone" name="phone" type="text" value="${utils.escapeHtml(profile.phone || "")}" required></div>`,
            "</div>",
            '<div class="form-field"><label for="email">Email Address</label>',
            `<input class="field-control" id="email" name="email" type="email" value="${utils.escapeHtml(profile.email || "")}" required></div>`,
            '<div class="form-field"><label for="address">Address</label>',
            `<input class="field-control" id="address" name="address" type="text" value="${utils.escapeHtml(profile.address || "")}"></div>`,
            '<div class="form-field"><label for="profileImage">Profile Image URL</label>',
            `<input class="field-control" id="profileImage" name="profileImage" type="url" value="${utils.escapeHtml(profile.profileImage || "")}" placeholder="https://..."></div>`,
            '<div class="form-row">',
            '<div class="form-field"><label for="currentPassword">Current Password</label>',
            '<input class="field-control" id="currentPassword" name="currentPassword" type="password" placeholder="Only needed when changing password"></div>',
            '<div class="form-field"><label for="newPassword">New Password</label>',
            '<input class="field-control" id="newPassword" name="newPassword" type="password" placeholder="Leave blank to keep current password"></div>',
            "</div>",
            '<button class="btn btn-primary" type="submit">Save Profile <i class="bi bi-arrow-right"></i></button>',
            "</form>"
        ].join("");
    }

    async function renderProfile() {
        const root = document.getElementById("profileRoot");
        if (!root) {
            return;
        }

        const storedUser = session.getUser() || {};
        let summaryHtml = "";
        let profile = storedUser;

        try {
            const [profileResponse, dashboardResponse] = await Promise.all([
                getProfileApi()(),
                api.getDashboard(storedUser.role === "user" ? "user" : storedUser.role)
            ]);
            profile = profileResponse.data || storedUser;
            session.setStoredUser({
                ...storedUser,
                ...profile
            });

            const dashboard = dashboardResponse.data;
            const cards = dashboard.cards || {};
            summaryHtml = Object.keys(cards).map(function (key) {
                return `<div class="detail-tile"><span>${utils.escapeHtml(key.replace(/([A-Z])/g, " $1"))}</span><strong>${utils.escapeHtml(cards[key])}</strong></div>`;
            }).join("");
        } catch (error) {
            summaryHtml = '<p class="helper-text">Dashboard summary could not be loaded for this profile.</p>';
        }

        root.innerHTML = [
            '<section class="two-column">',
            '<article class="panel-card stack">',
            '<div class="split"><div class="split"><div class="avatar large">' + (profile.profileImage ? `<img src="${utils.escapeHtml(profile.profileImage)}" alt="Avatar">` : utils.getInitials(profile.name)) + '</div>',
            `<div><h1>${utils.escapeHtml(profile.name || "User")}</h1><p>${utils.escapeHtml(profile.role || "Role unavailable")}</p></div></div>`,
            '<span class="chip">Live profile</span></div>',
            '<p>Your profile is now backed by the backend API. You can update contact details here and optionally change your password.</p>',
            '<div class="details-grid">',
            `<div class="detail-tile"><span>Email</span><strong>${utils.escapeHtml(profile.email || "Not available")}</strong></div>`,
            `<div class="detail-tile"><span>Phone</span><strong>${utils.escapeHtml(profile.phone || "Not available")}</strong></div>`,
            `<div class="detail-tile"><span>Department</span><strong>${utils.escapeHtml(profile.department && profile.department.name ? profile.department.name : "Not assigned")}</strong></div>`,
            `<div class="detail-tile"><span>Address</span><strong>${utils.escapeHtml(profile.address || "Not added")}</strong></div>`,
            '</div>',
            profileForm(profile),
            '</article>',
            `<article class="panel-card"><div class="section-head"><div><h2>Account summary</h2><p>Quick metrics from the role dashboard.</p></div></div><div class="details-grid">${summaryHtml}</div></article>`,
            "</section>"
        ].join("");

        const form = document.getElementById("profileForm");
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const button = form.querySelector('button[type="submit"]');
            button.disabled = true;
            button.innerHTML = '<i class="bi bi-arrow-repeat"></i> Saving...';

            try {
                const payload = {
                    name: form.name.value.trim(),
                    email: form.email.value.trim(),
                    phone: form.phone.value.trim(),
                    address: form.address.value.trim(),
                    profileImage: form.profileImage.value.trim()
                };

                if (form.currentPassword.value.trim() || form.newPassword.value.trim()) {
                    payload.currentPassword = form.currentPassword.value;
                    payload.newPassword = form.newPassword.value;
                }

                const response = await updateProfileApi()(payload);
                const updatedProfile = response.data;
                session.setStoredUser({
                    ...storedUser,
                    ...updatedProfile
                });
                utils.showToast(response.message, "success");
                await renderProfile();
            } catch (error) {
                utils.showToast(error.message, "error");
            } finally {
                button.disabled = false;
                button.innerHTML = 'Save Profile <i class="bi bi-arrow-right"></i>';
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderProfile().catch(function (error) {
            utils.showToast(error.message, "error");
        });
    });
})();

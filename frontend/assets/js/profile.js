(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;

    async function renderProfile() {
        const root = document.getElementById("profileRoot");
        if (!root) {
            return;
        }

        const user = window.CMS.session.getUser() || {};
        let summaryHtml = "";

        try {
            const roleKey = user.role === "user" ? "user" : user.role;
            const dashboard = (await api.getDashboard(roleKey)).data;
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
            '<div class="split"><div class="split"><div class="avatar large">' + utils.getInitials(user.name) + '</div>',
            `<div><h1>${utils.escapeHtml(user.name || "User")}</h1><p>${utils.escapeHtml(user.role || "Role unavailable")}</p></div></div>`,
            '<span class="chip">Read only</span></div>',
            `<p>This project backend does not currently expose a profile update endpoint, so this page reflects the authenticated account stored from login.</p>`,
            '<div class="details-grid">',
            `<div class="detail-tile"><span>Email</span><strong>${utils.escapeHtml(user.email || "Not available")}</strong></div>`,
            `<div class="detail-tile"><span>Phone</span><strong>${utils.escapeHtml(user.phone || "Not available")}</strong></div>`,
            `<div class="detail-tile"><span>Department</span><strong>${utils.escapeHtml(user.department && user.department.name ? user.department.name : "Not assigned")}</strong></div>`,
            `<div class="detail-tile"><span>Address</span><strong>${utils.escapeHtml(user.address || "Not added")}</strong></div>`,
            '</div></article>',
            `<article class="panel-card"><div class="section-head"><div><h2>Account summary</h2><p>Quick metrics from the role dashboard.</p></div></div><div class="details-grid">${summaryHtml}</div></article>`,
            "</section>"
        ].join("");
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderProfile().catch(function (error) {
            utils.showToast(error.message, "error");
        });
    });
})();

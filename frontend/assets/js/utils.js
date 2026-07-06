(function () {
    const navigation = {
        user: [
            { key: "dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
            { key: "my-complaints", label: "My Complaints", icon: "bi-clipboard-check" },
            { key: "new-complaint", label: "New Complaint", icon: "bi-plus-square" },
            { key: "profile", label: "Profile", icon: "bi-person" }
        ],
        employee: [
            { key: "dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
            { key: "assigned", label: "Assigned Complaints", icon: "bi-list-task" },
            { key: "profile", label: "Profile", icon: "bi-person" }
        ],
        admin: [
            { key: "dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
            { key: "complaints", label: "Complaints", icon: "bi-clipboard-data" },
            { key: "departments", label: "Departments", icon: "bi-diagram-3" },
            { key: "employees", label: "Employees", icon: "bi-people" },
            { key: "profile", label: "Profile", icon: "bi-person" }
        ]
    };

    const pageMap = {
        user: {
            dashboard: "pages/user/dashboard.html",
            "my-complaints": "pages/user/myComplaints.html",
            "new-complaint": "pages/user/complaint.html",
            profile: "pages/user/profile.html"
        },
        employee: {
            dashboard: "pages/employee/dashboard.html",
            assigned: "pages/employee/assigned.html",
            profile: "pages/employee/profile.html"
        },
        admin: {
            dashboard: "pages/admin/dashboard.html",
            complaints: "pages/admin/complaints.html",
            departments: "pages/admin/departments.html",
            employees: "pages/admin/employees.html",
            profile: "pages/admin/profile.html"
        }
    };

    const promos = {
        user: {
            className: "user-promo",
            title: "Your voice matters",
            body: "File issues, track progress, and stay close to every update in your neighborhood.",
            action: "Create Complaint",
            icon: "bi-plus-circle",
            href: "pages/user/complaint.html"
        },
        employee: {
            className: "employee-promo",
            title: "Need a quick update?",
            body: "Move assigned work forward and keep citizens informed with timely progress notes.",
            action: "View Tasks",
            icon: "bi-arrow-repeat",
            href: "pages/employee/assigned.html"
        },
        admin: {
            className: "admin-promo",
            title: "Keep the system flowing",
            body: "Manage departments, allocate work, and keep service quality visible across the board.",
            action: "Manage Complaints",
            icon: "bi-sliders2",
            href: "pages/admin/complaints.html"
        }
    };

    function qs(selector) {
        return document.querySelector(selector);
    }

    function getInitials(name) {
        return (name || "User")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0).toUpperCase();
            })
            .join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function statusClass(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "-");
    }

    function formatDate(value) {
        if (!value) {
            return "Not available";
        }

        return new Date(value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function formatDateTime(value) {
        if (!value) {
            return "Not available";
        }

        return new Date(value).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function relativeTime(value) {
        if (!value) {
            return "Just now";
        }

        const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
        const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
        const steps = [
            { limit: 60, unit: "second" },
            { limit: 3600, unit: "minute", divisor: 60 },
            { limit: 86400, unit: "hour", divisor: 3600 },
            { limit: 604800, unit: "day", divisor: 86400 }
        ];

        for (let index = 0; index < steps.length; index += 1) {
            const step = steps[index];
            if (Math.abs(seconds) < step.limit) {
                const valueToFormat = step.divisor ? Math.round(seconds / step.divisor) : seconds;
                return formatter.format(valueToFormat, step.unit);
            }
        }

        return formatDate(value);
    }

    function showToast(message, type) {
        const root = qs("#toast-root");
        if (!root) {
            return;
        }

        const tone = type || "info";
        const iconMap = {
            success: "bi-check-circle-fill",
            error: "bi-exclamation-octagon-fill",
            info: "bi-info-circle-fill"
        };

        const toast = document.createElement("div");
        toast.className = `toast toast-${tone}`;
        toast.innerHTML = [
            `<i class="bi ${iconMap[tone] || iconMap.info}"></i>`,
            `<div><strong>${tone === "error" ? "Something went wrong" : "Update"}</strong>`,
            `<p>${escapeHtml(message)}</p></div>`
        ].join("");
        root.appendChild(toast);

        window.setTimeout(function () {
            toast.remove();
        }, 3200);
    }

    function createEmptyState(icon, title, body) {
        return [
            '<div class="empty-state">',
            `<i class="bi ${icon}"></i>`,
            `<h3>${escapeHtml(title)}</h3>`,
            `<p>${escapeHtml(body)}</p>`,
            "</div>"
        ].join("");
    }

    function resolvePage(role, key) {
        return window.CMS.session.resolve(pageMap[role][key]);
    }

    function renderSidebar(role, activePage) {
        const user = window.CMS.session.getUser();
        const promo = promos[role];
        const items = navigation[role]
            .map(function (item) {
                const active = activePage === item.key ? "active" : "";
                return [
                    `<a class="nav-link ${active}" href="${resolvePage(role, item.key)}">`,
                    `<i class="bi ${item.icon}"></i>`,
                    `<span>${item.label}</span>`,
                    "</a>"
                ].join("");
            })
            .join("");

        qs(".app-sidebar").innerHTML = [
            '<div class="brand">',
            '<div class="brand-mark"><i class="bi bi-shield-check"></i></div>',
            '<div class="brand-copy"><strong>Complaint</strong><span>Management System</span></div>',
            "</div>",
            `<nav class="nav-stack">${items}`,
            '<button class="nav-link" type="button" data-logout>',
            '<i class="bi bi-box-arrow-left"></i><span>Logout</span></button></nav>',
            `<div class="sidebar-promo ${promo.className}">`,
            `<div><h3>${promo.title}</h3><p>${promo.body}</p></div>`,
            `<a class="btn btn-primary" href="${window.CMS.session.resolve(promo.href)}"><i class="bi ${promo.icon}"></i>${promo.action}</a>`,
            `<small class="muted">Signed in as ${escapeHtml(user && user.role ? user.role : role)}</small>`,
            "</div>"
        ].join("");
    }

    function renderTopbar(title) {
        const user = window.CMS.session.getUser() || {};
        qs(".topbar").innerHTML = [
            '<button type="button" class="btn btn-secondary icon-btn menu-toggle" data-menu-toggle>',
            '<i class="bi bi-list"></i></button>',
            `<div><h2>${escapeHtml(title)}</h2><p class="muted">Connected to ${escapeHtml(window.CMS.session.getApiBase())}</p></div>`,
            '<label class="search-shell">',
            '<i class="bi bi-search"></i>',
            '<input type="search" placeholder="Search complaints, departments, employees..." data-global-search>',
            "</label>",
            '<div class="topbar-user">',
            `<div class="avatar">${getInitials(user.name)}</div>`,
            `<div><strong>${escapeHtml(user.name || "Guest User")}</strong><p>${escapeHtml(user.role || "")}</p></div>`,
            "</div>"
        ].join("");
    }

    function bindLayoutControls() {
        const sidebar = qs(".app-sidebar");
        const menuToggle = qs("[data-menu-toggle]");
        const logoutButtons = document.querySelectorAll("[data-logout]");
        const globalSearch = qs("[data-global-search]");

        if (menuToggle && sidebar) {
            menuToggle.addEventListener("click", function () {
                sidebar.classList.toggle("open");
            });
        }

        logoutButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                window.CMS.session.clearSession();
                window.CMS.session.redirectToLogin();
            });
        });

        if (globalSearch) {
            globalSearch.addEventListener("input", function (event) {
                document.dispatchEvent(new CustomEvent("cms:search", {
                    detail: {
                        query: event.target.value.trim().toLowerCase()
                    }
                }));
            });
        }
    }

    function initProtectedLayout() {
        const body = document.body;
        const currentUser = window.CMS.session.getUser() || {};
        const role = body.dataset.role || currentUser.role;
        const page = body.dataset.page;
        const title = body.dataset.title || "Dashboard";

        renderSidebar(role, page);
        renderTopbar(title);
        bindLayoutControls();
    }

    function statCard(theme, icon, label, value, note) {
        return [
            `<article class="panel-card stat-card ${theme}">`,
            '<div class="stat-top">',
            `<div class="stat-icon"><i class="bi ${icon}"></i></div>`,
            `<span class="chip">${escapeHtml(label)}</span>`,
            "</div>",
            `<div class="stat-value">${escapeHtml(value)}</div>`,
            `<div class="stat-label">${escapeHtml(label)}</div>`,
            `<p class="stat-note">${escapeHtml(note)}</p>`,
            "</article>"
        ].join("");
    }

    function complaintCard(complaint, actionsHtml) {
        return [
            '<article class="complaint-card">',
            '<div class="complaint-card-icon"><i class="bi bi-clipboard-data"></i></div>',
            "<div>",
            `<div class="split"><div><h3>${escapeHtml(complaint.title)}</h3>`,
            `<div class="complaint-meta"><span>${escapeHtml(complaint.complaintId || "")}</span>`,
            `<span>${escapeHtml(complaint.department && complaint.department.name ? complaint.department.name : "No department")}</span>`,
            `<span>${escapeHtml(complaint.location || "No location")}</span></div></div>`,
            `<span class="badge ${statusClass(complaint.status)}">${escapeHtml(complaint.status || "Pending")}</span></div>`,
            `<p>${escapeHtml(complaint.description || "")}</p>`,
            `<div class="complaint-footer"><span>Created ${relativeTime(complaint.createdAt)}</span>`,
            `<span>${complaint.assignedTo && complaint.assignedTo.name ? `Assigned to ${escapeHtml(complaint.assignedTo.name)}` : "Awaiting assignment"}</span></div>`,
            "</div>",
            `<div class="right-note">${actionsHtml || ""}</div>`,
            "</article>"
        ].join("");
    }

    function mountChart(canvas, config) {
        if (!canvas || typeof window.Chart === "undefined") {
            return null;
        }

        return new window.Chart(canvas, config);
    }

    function openModal(contentHtml) {
        closeModal();
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `<div class="modal-card">${contentHtml}</div>`;
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay || event.target.closest("[data-close-modal]")) {
                closeModal();
            }
        });
        document.body.appendChild(overlay);
    }

    function closeModal() {
        const existing = qs(".modal-overlay");
        if (existing) {
            existing.remove();
        }
    }

    function readQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    window.CMS = window.CMS || {};
    window.CMS.utils = {
        qs: qs,
        getInitials: getInitials,
        escapeHtml: escapeHtml,
        statusClass: statusClass,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        relativeTime: relativeTime,
        showToast: showToast,
        createEmptyState: createEmptyState,
        initProtectedLayout: initProtectedLayout,
        statCard: statCard,
        complaintCard: complaintCard,
        mountChart: mountChart,
        openModal: openModal,
        closeModal: closeModal,
        readQueryParam: readQueryParam,
        resolvePage: resolvePage
    };
})();

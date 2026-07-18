(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;
    const realtime = window.CMS.realtime;
    const userDashboardState = {
        complaints: [],
        trackedComplaintId: ""
    };

    function renderComplaintList(container, complaints, emptyTitle) {
        if (!container) {
            return;
        }

        if (!complaints.length) {
            container.innerHTML = utils.createEmptyState("bi-inbox", emptyTitle, "Data will appear here as soon as the backend returns results.");
            return;
        }

        container.innerHTML = complaints.map(function (complaint) {
            const detailsHref = window.CMS.session.resolve(`pages/user/details.html?id=${complaint._id}`);
            return utils.complaintCard(complaint, `<a class="btn btn-secondary" href="${detailsHref}">Open</a>`);
        }).join("");
    }

    function renderAdminDashboard(data) {
        var adminComplaintsPage = window.CMS.session.resolve("pages/admin/complaints.html");
        document.getElementById("adminStatCards").innerHTML = [
            utils.statCard("kpi-purple", "bi-clipboard-data", "Total Complaints", data.cards.totalComplaints, "", adminComplaintsPage + "?status=all"),
            utils.statCard("kpi-blue", "bi-people", "Total Employees", data.cards.totalEmployees, ""),
            utils.statCard("kpi-green", "bi-diagram-3", "Departments", data.cards.totalDepartments, "")
        ].join("");

        var adminComplaints = data.recentComplaints || [];
        var adminPage = 0;
        var perPage = 5;
        var adminSearchQuery = "";

        function getFilteredComplaints() {
            if (!adminSearchQuery) return adminComplaints;
            return adminComplaints.filter(function (c) {
                var haystack = [
                    c.title || "",
                    c.complaintId || "",
                    c.status || "",
                    c.department && c.department.name ? c.department.name : ""
                ].join(" ").toLowerCase();
                return haystack.indexOf(adminSearchQuery) !== -1;
            });
        }

        function renderAdminComplaintPage() {
            var container = document.getElementById("adminRecentComplaints");
            if (!container) return;

            var filtered = getFilteredComplaints();
            var start = adminPage * perPage;
            var pageItems = filtered.slice(start, start + perPage);
            var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

            if (!filtered.length) {
                container.innerHTML = utils.createEmptyState("bi-inbox", adminSearchQuery ? "No matches found" : "No recent complaints yet", adminSearchQuery ? "Try a different search term." : "Data will appear here as soon as the backend returns results.");
                return;
            }

            var rows = pageItems.map(function (c) {
                var detailsHref = window.CMS.session.resolve("pages/user/details.html?id=" + c._id);
                var statusCls = utils.statusClass ? utils.statusClass(c.status) : (c.status || "pending").toLowerCase();
                return [
                    '<div class="complaint-row">',
                    '<div class="complaint-row-info">',
                    '<strong>' + utils.escapeHtml(c.title) + '</strong>',
                    '<span class="complaint-row-meta">' + utils.escapeHtml(c.complaintId || "") + ' &middot; ' + utils.escapeHtml(c.department && c.department.name ? c.department.name : "—") + '</span>',
                    '</div>',
                    '<span class="badge ' + statusCls + '">' + utils.escapeHtml(c.status || "Pending") + '</span>',
                    '<a class="btn btn-secondary btn-sm" href="' + detailsHref + '">View</a>',
                    '</div>'
                ].join("");
            }).join("");

            var paginationHtml = "";
            if (totalPages > 1) {
                paginationHtml = '<div class="pagination-controls">';
                paginationHtml += '<button class="btn btn-secondary btn-sm" data-admin-prev ' + (adminPage === 0 ? 'disabled' : '') + '><i class="bi bi-chevron-left"></i></button>';
                paginationHtml += '<span class="pagination-info">' + (adminPage + 1) + ' / ' + totalPages + '</span>';
                paginationHtml += '<button class="btn btn-secondary btn-sm" data-admin-next ' + (adminPage >= totalPages - 1 ? 'disabled' : '') + '><i class="bi bi-chevron-right"></i></button>';
                paginationHtml += '</div>';
            }

            container.innerHTML = rows + paginationHtml;

            var prevBtn = container.querySelector("[data-admin-prev]");
            var nextBtn = container.querySelector("[data-admin-next]");
            if (prevBtn) prevBtn.addEventListener("click", function () { if (adminPage > 0) { adminPage--; renderAdminComplaintPage(); } });
            if (nextBtn) nextBtn.addEventListener("click", function () { if (adminPage < totalPages - 1) { adminPage++; renderAdminComplaintPage(); } });
        }

        renderAdminComplaintPage();

        document.addEventListener("cms:search", function (event) {
            adminSearchQuery = event.detail.query;
            adminPage = 0;
            renderAdminComplaintPage();
        });

        utils.mountChart(document.getElementById("adminStatusChart"), {
            type: "pie",
            data: {
                labels: data.statusChart.labels,
                datasets: [{
                    data: data.statusChart.data,
                    backgroundColor: data.statusChart.labels.map(function(label) {
                        var colors = { "Pending": "#EF4444", "Resolved": "#10B981", "In Progress": "#F59E0B", "Assigned": "#3B82F6" };
                        return colors[label] || "#8B5CF6";
                    }),
                    borderColor: "#ffffff",
                    borderWidth: 2,
                    hoverOffset: 18
                }]
            },
            options: {
                radius: "98%",
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = context.label || "";
                                var value = context.parsed || 0;
                                var total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                var pct = total ? Math.round((value / total) * 100) : 0;
                                return label + ": " + value + " (" + pct + "%)";
                            }
                        }
                    },
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#ccc",
                            padding: 14,
                            usePointStyle: true,
                            pointStyle: "circle"
                        }
                    }
                }
            }
        });

        utils.mountChart(document.getElementById("adminPriorityChart"), {
            type: "doughnut",
            data: {
                labels: data.priorityChart.labels,
                datasets: [{
                    data: data.priorityChart.data,
                    backgroundColor: ["#8bc9ff", "#ffcf76", "#63d7a1"]
                }]
            },
            options: { maintainAspectRatio: false }
        });

        utils.mountChart(document.getElementById("adminDepartmentChart"), {
            type: "bar",
            data: {
                labels: data.departmentChart.labels,
                datasets: [{
                    label: "Complaints",
                    data: data.departmentChart.data,
                    backgroundColor: ["#6a5cff", "#7cccf8", "#63d7a1", "#ffcf76", "#ff8ca7"],
                    maxBarThickness: 40,
                    borderRadius: 4
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function buildEmployeePriorityChart(complaints) {
        return complaints.reduce(function (accumulator, complaint) {
            const key = complaint.priority || "Medium";
            accumulator[key] = (accumulator[key] || 0) + 1;
            return accumulator;
        }, {});
    }

    function buildEmployeeStatusChart(complaints) {
        return complaints.reduce(function (accumulator, complaint) {
            const key = complaint.status || "Pending";
            accumulator[key] = (accumulator[key] || 0) + 1;
            return accumulator;
        }, {});
    }

    function renderEmployeeDashboard(dashboard, assignedComplaints) {
        // Inject employee name into the welcome heading
        var welcomeHeading = document.getElementById("employeeWelcomeHeading");
        if (welcomeHeading) {
            var currentUser = window.CMS.session.getUser();
            var userName = (currentUser && currentUser.name) ? currentUser.name : "";
            welcomeHeading.textContent = userName ? "Welcome back, " + userName + "." : "Welcome back.";
        }

        var empAssignedPage = window.CMS.session.resolve("pages/employee/assigned.html");
        document.getElementById("employeeStatCards").innerHTML = [
            utils.statCard("kpi-purple", "bi-clipboard-check", "Assigned", dashboard.cards.assigned, "", empAssignedPage + "?status=Assigned"),
            utils.statCard("kpi-orange", "bi-hourglass-split", "In Progress", dashboard.cards.inProgress, "", empAssignedPage + "?status=In Progress"),
            utils.statCard("kpi-green", "bi-check-circle", "Resolved", dashboard.cards.resolved, "", empAssignedPage + "?status=Resolved")
        ].join("");

        // Limit recent complaints to 4 — full list is on the Assigned Complaints page
        var recentComplaints = (dashboard.recentComplaints || []).slice(0, 4);
        renderComplaintList(document.getElementById("employeeRecentComplaints"), recentComplaints, "No assignments yet");

        const priorityData = buildEmployeePriorityChart(assignedComplaints);
        utils.mountChart(document.getElementById("employeePriorityChart"), {
            type: "doughnut",
            data: {
                labels: Object.keys(priorityData),
                datasets: [{
                    data: Object.values(priorityData),
                    backgroundColor: ["#6a5cff", "#ffcf76", "#63d7a1", "#7cccf8"]
                }]
            },
            options: { maintainAspectRatio: false }
        });

        const statusData = buildEmployeeStatusChart(assignedComplaints);
        utils.mountChart(document.getElementById("employeeStatusChart"), {
            type: "pie",
            data: {
                labels: Object.keys(statusData),
                datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: Object.keys(statusData).map(function(label) {
                        var colors = { "Pending": "#EF4444", "Resolved": "#10B981", "In Progress": "#F59E0B", "Assigned": "#3B82F6" };
                        return colors[label] || "#8B5CF6";
                    }),
                    borderColor: "#ffffff",
                    borderWidth: 2,
                    hoverOffset: 18
                }]
            },
            options: {
                radius: "98%",
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = context.label || "";
                                var value = context.parsed || 0;
                                var total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                var pct = total ? Math.round((value / total) * 100) : 0;
                                return label + ": " + value + " (" + pct + "%)";
                            }
                        }
                    },
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#ccc",
                            padding: 14,
                            usePointStyle: true,
                            pointStyle: "circle"
                        }
                    }
                }
            }
        });
    }

    function buildNotifications(complaints) {
        return complaints
            .filter(function (complaint) {
                return complaint.createdAt || complaint.assignedAt || complaint.resolvedAt;
            })
            .slice(0, 4)
            .map(function (complaint) {
                return [
                    '<div class="mini-item">',
                    '<div class="mini-icon"><i class="bi bi-bell"></i></div>',
                    `<div><strong>${utils.escapeHtml(complaint.title)}</strong>`,
                    `<p>Status is ${utils.escapeHtml(complaint.status)}</p></div>`,
                    `<small>${utils.relativeTime(complaint.updatedAt || complaint.resolvedAt || complaint.createdAt)}</small>`,
                    "</div>"
                ].join("");
            })
            .join("");
    }

    function renderTrackedComplaintResult() {
        const trackerResult = document.getElementById("complaintTrackerResult");
        if (!trackerResult) {
            return;
        }

        if (!userDashboardState.trackedComplaintId) {
            trackerResult.innerHTML = '<p class="helper-text">Enter your complaint ID above to follow each stage live.</p>';
            return;
        }

        const match = userDashboardState.complaints.find(function (complaint) {
            return complaint._id === userDashboardState.trackedComplaintId;
        });

        if (!match) {
            trackerResult.innerHTML = '<p class="helper-text">That complaint is no longer available in your account.</p>';
            return;
        }

        trackerResult.innerHTML = [
            utils.renderStatusTracker(match, {
                compact: true,
                liveLabel: "Live tracker"
            }),
            `<div class="action-row"><a class="btn btn-secondary" href="${window.CMS.session.resolve(`pages/user/details.html?id=${match._id}`)}">Open full details</a></div>`
        ].join("");
    }

    function renderUserDashboard(dashboard, complaints) {
        userDashboardState.complaints = complaints;

        // Inject user name into the welcome heading
        var welcomeHeading = document.getElementById("userWelcomeHeading");
        if (welcomeHeading) {
            var currentUser = window.CMS.session.getUser();
            var userName = (currentUser && currentUser.name) ? currentUser.name : "";
            welcomeHeading.textContent = userName ? "Welcome back, " + userName + "." : "Welcome back.";
        }

        var userComplaintsPage = window.CMS.session.resolve("pages/user/myComplaints.html");
        document.getElementById("userStatCards").innerHTML = [
            utils.statCard("kpi-purple", "bi-clipboard-data", "Total Complaints", dashboard.cards.totalComplaints, "", userComplaintsPage + "?status=all"),
            utils.statCard("kpi-orange", "bi-hourglass-split", "Pending", dashboard.cards.pending, "", userComplaintsPage + "?status=Pending"),
            utils.statCard("kpi-blue", "bi-person-workspace", "Assigned", dashboard.cards.assigned, "", userComplaintsPage + "?status=Assigned"),
            utils.statCard("kpi-pink", "bi-tools", "In Progress", dashboard.cards.inProgress, "", userComplaintsPage + "?status=In Progress"),
            utils.statCard("kpi-green", "bi-check-circle", "Resolved", dashboard.cards.resolved, "", userComplaintsPage + "?status=Resolved")
        ].join("");

        renderComplaintList(document.getElementById("userRecentComplaints"), dashboard.recentComplaints || [], "No complaints filed yet");

        const notifications = buildNotifications(complaints);
        document.getElementById("userNotifications").innerHTML = notifications || utils.createEmptyState("bi-bell", "No notifications yet", "Status changes will show up here.");
    }

    async function loadAdminDashboard() {
        const response = await api.getDashboard("admin");
        renderAdminDashboard(response.data);
    }

    async function loadEmployeeDashboard() {
        const results = await Promise.all([
            api.getDashboard("employee"),
            api.getAssignedComplaints()
        ]);
        renderEmployeeDashboard(results[0].data, results[1].data || []);
    }

    async function loadUserDashboard() {
        const results = await Promise.all([
            api.getDashboard("user"),
            api.getMyComplaints()
        ]);
        renderUserDashboard(results[0].data, results[1].data || []);
    }

    function subscribeToRealtime(loadFn) {
        if (!realtime) {
            return;
        }

        let refreshTimer = null;

        realtime.onComplaintChanged(function () {
            window.clearTimeout(refreshTimer);
            refreshTimer = window.setTimeout(function () {
                loadFn().catch(function (error) {
                    utils.showToast(error.message, "error");
                });
            }, 220);
        });
    }

    document.addEventListener("DOMContentLoaded", async function () {
        const page = document.body.dataset.page;
        if (page !== "dashboard") {
            return;
        }

        try {
            if (document.body.dataset.role === "admin") {
                await loadAdminDashboard();
                subscribeToRealtime(loadAdminDashboard);
            }

            if (document.body.dataset.role === "employee") {
                await loadEmployeeDashboard();
                subscribeToRealtime(loadEmployeeDashboard);
            }

            if (document.body.dataset.role === "user") {
                await loadUserDashboard();
                subscribeToRealtime(loadUserDashboard);
            }
        } catch (error) {
            utils.showToast(error.message, "error");
        }
    });
})();

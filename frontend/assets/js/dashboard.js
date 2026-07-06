(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;

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
        document.getElementById("adminStatCards").innerHTML = [
            utils.statCard("kpi-purple", "bi-clipboard-data", "Total Complaints", data.cards.totalComplaints, "Live system total"),
            utils.statCard("kpi-blue", "bi-people", "Total Employees", data.cards.totalEmployees, "Team members onboarded"),
            utils.statCard("kpi-green", "bi-diagram-3", "Departments", data.cards.totalDepartments, "Active operational units")
        ].join("");

        renderComplaintList(document.getElementById("adminRecentComplaints"), data.recentComplaints || [], "No recent complaints yet");

        utils.mountChart(document.getElementById("adminStatusChart"), {
            type: "line",
            data: {
                labels: data.statusChart.labels,
                datasets: [{
                    label: "Complaints",
                    data: data.statusChart.data,
                    borderColor: "#6a5cff",
                    backgroundColor: "rgba(106, 92, 255, 0.12)",
                    tension: 0.38,
                    fill: true
                }]
            },
            options: { maintainAspectRatio: false }
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
                    backgroundColor: ["#6a5cff", "#7cccf8", "#63d7a1", "#ffcf76", "#ff8ca7"]
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
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
        document.getElementById("employeeStatCards").innerHTML = [
            utils.statCard("kpi-purple", "bi-clipboard-check", "Assigned", dashboard.cards.assigned, "Complaints allocated to you"),
            utils.statCard("kpi-orange", "bi-hourglass-split", "In Progress", dashboard.cards.inProgress, "Actively being worked on"),
            utils.statCard("kpi-green", "bi-check-circle", "Resolved", dashboard.cards.resolved, "Resolved successfully")
        ].join("");

        renderComplaintList(document.getElementById("employeeRecentComplaints"), dashboard.recentComplaints || [], "No assignments yet");

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
            type: "line",
            data: {
                labels: Object.keys(statusData),
                datasets: [{
                    label: "Complaints",
                    data: Object.values(statusData),
                    borderColor: "#6a5cff",
                    backgroundColor: "rgba(106, 92, 255, 0.14)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { maintainAspectRatio: false }
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

    function renderUserDashboard(dashboard, complaints) {
        document.getElementById("userStatCards").innerHTML = [
            utils.statCard("kpi-purple", "bi-clipboard-data", "Total Complaints", dashboard.cards.totalComplaints, "All complaints you have raised"),
            utils.statCard("kpi-orange", "bi-hourglass-split", "Pending", dashboard.cards.pending, "Waiting for admin assignment"),
            utils.statCard("kpi-blue", "bi-person-workspace", "Assigned", dashboard.cards.assigned, "Already mapped to an employee"),
            utils.statCard("kpi-pink", "bi-tools", "In Progress", dashboard.cards.inProgress, "Currently being handled by the assigned team"),
            utils.statCard("kpi-green", "bi-check-circle", "Resolved", dashboard.cards.resolved, "Closed successfully")
        ].join("");

        renderComplaintList(document.getElementById("userRecentComplaints"), dashboard.recentComplaints || [], "No complaints filed yet");

        const notifications = buildNotifications(complaints);
        document.getElementById("userNotifications").innerHTML = notifications || utils.createEmptyState("bi-bell", "No notifications yet", "Status changes will show up here.");

        const tracker = document.getElementById("complaintTrackerForm");
        const trackerResult = document.getElementById("complaintTrackerResult");

        tracker.addEventListener("submit", function (event) {
            event.preventDefault();
            const value = tracker.complaintId.value.trim().toLowerCase();
            const match = complaints.find(function (complaint) {
                return String(complaint.complaintId || "").toLowerCase() === value;
            });

            if (!match) {
                trackerResult.innerHTML = '<p class="helper-text">No complaint matched that complaint ID in your account.</p>';
                return;
            }

            trackerResult.innerHTML = [
                `<h4>${utils.escapeHtml(match.title)}</h4>`,
                `<p>Status: <span class="badge ${utils.statusClass(match.status)}">${utils.escapeHtml(match.status)}</span></p>`,
                `<p>Department: ${utils.escapeHtml(match.department && match.department.name ? match.department.name : "Not set")}</p>`,
                `<a class="btn btn-secondary" href="${window.CMS.session.resolve(`pages/user/details.html?id=${match._id}`)}">Open details</a>`
            ].join("");
        });
    }

    document.addEventListener("DOMContentLoaded", async function () {
        const page = document.body.dataset.page;
        if (!page) {
            return;
        }

        try {
            if (page === "dashboard" && document.body.dataset.role === "admin") {
                const response = await api.getDashboard("admin");
                renderAdminDashboard(response.data);
            }

            if (page === "dashboard" && document.body.dataset.role === "employee") {
                const results = await Promise.all([
                    api.getDashboard("employee"),
                    api.getAssignedComplaints()
                ]);
                renderEmployeeDashboard(results[0].data, results[1].data || []);
            }

            if (page === "dashboard" && document.body.dataset.role === "user") {
                const results = await Promise.all([
                    api.getDashboard("user"),
                    api.getMyComplaints()
                ]);
                renderUserDashboard(results[0].data, results[1].data || []);
            }
        } catch (error) {
            utils.showToast(error.message, "error");
        }
    });
})();

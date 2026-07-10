(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;
    const realtime = window.CMS.realtime;

    const tableState = {
        myComplaints: {
            role: "user",
            items: [],
            query: "",
            bound: false,
            containerId: "myComplaintsTable"
        },
        adminComplaints: {
            role: "admin",
            items: [],
            employees: [],
            query: "",
            bound: false,
            containerId: "adminComplaintsTable"
        },
        employeeAssigned: {
            role: "employee",
            items: [],
            query: "",
            bound: false,
            containerId: "employeeAssignedTable"
        }
    };

    function complaintRow(complaint, role) {
        const detailsHref = window.CMS.session.resolve(`pages/user/details.html?id=${complaint._id}`);
        const assignButton = role === "admin" ? `<button class="btn btn-secondary" data-assign-id="${complaint._id}">Assign</button>` : "";
        const statusButton = role === "employee" ? `<button class="btn btn-secondary" data-update-id="${complaint._id}">Update</button>` : "";
        return [
            "<tr>",
            `<td><div class="inline-meta"><strong>${utils.escapeHtml(complaint.complaintId)}</strong><small>${utils.formatDate(complaint.createdAt)}</small></div></td>`,
            `<td><div class="inline-meta"><strong>${utils.escapeHtml(complaint.title)}</strong><small>${utils.escapeHtml(complaint.location)}</small></div></td>`,
            `<td>${utils.escapeHtml(complaint.department && complaint.department.name ? complaint.department.name : "No department")}</td>`,
            `<td><span class="badge ${utils.statusClass(complaint.status)}">${utils.escapeHtml(complaint.status)}</span></td>`,
            `<td>${utils.escapeHtml(complaint.assignedTo && complaint.assignedTo.name ? complaint.assignedTo.name : "Unassigned")}</td>`,
            `<td><div class="table-actions"><a class="btn btn-ghost" href="${detailsHref}">View</a>${assignButton}${statusButton}</div></td>`,
            "</tr>"
        ].join("");
    }

    function renderComplaintTable(container, complaints, role) {
        if (!complaints.length) {
            container.innerHTML = utils.createEmptyState("bi-inbox", "No complaints found", "Try changing the filters or add new complaints.");
            return;
        }

        container.innerHTML = [
            '<div class="table-shell"><table class="data-table"><thead><tr>',
            "<th>Complaint</th><th>Title</th><th>Department</th><th>Status</th><th>Assigned</th><th>Actions</th>",
            "</tr></thead><tbody>",
            complaints.map(function (complaint) {
                return complaintRow(complaint, role);
            }).join(""),
            "</tbody></table></div>"
        ].join("");
    }

    function filterComplaints(items, query) {
        if (!query) {
            return items;
        }

        return items.filter(function (complaint) {
            const haystack = [
                complaint.complaintId,
                complaint.title,
                complaint.location,
                complaint.department && complaint.department.name,
                complaint.createdBy && complaint.createdBy.name
            ].join(" ").toLowerCase();
            return haystack.includes(query);
        });
    }

    function renderTableState(state) {
        const container = document.getElementById(state.containerId);
        if (!container) {
            return;
        }

        renderComplaintTable(container, filterComplaints(state.items, state.query), state.role);
    }

    function bindSearch(state) {
        if (state.bound) {
            return;
        }

        state.bound = true;
        document.addEventListener("cms:search", function (event) {
            state.query = event.detail.query;
            renderTableState(state);
        });
    }

    function subscribeToComplaintChanges(loadFn) {
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

    async function initComplaintForm() {
        const form = document.getElementById("complaintCreateForm");
        if (!form) {
            return;
        }

        try {
            const departments = (await api.getDepartments()).data || [];
            const options = departments.map(function (department) {
                return `<option value="${department._id}">${utils.escapeHtml(department.name)}</option>`;
            }).join("");
            form.department.innerHTML = `<option value="">Select department</option>${options}`;
        } catch (error) {
            utils.showToast(error.message, "error");
        }

        form.images.addEventListener("change", function () {
            const preview = document.getElementById("imagePreview");
            const files = Array.from(form.images.files || []);
            preview.innerHTML = files.map(function (file) {
                return [
                    '<div class="preview-card">',
                    `<img src="${URL.createObjectURL(file)}" alt="${utils.escapeHtml(file.name)}">`,
                    `<span>${utils.escapeHtml(file.name)}</span>`,
                    "</div>"
                ].join("");
            }).join("");
        });

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Submitting...';

            try {
                const formData = new FormData();
                formData.append("title", form.title.value.trim());
                formData.append("description", form.description.value.trim());
                formData.append("department", form.department.value);
                formData.append("location", form.location.value.trim());
                Array.from(form.images.files || []).forEach(function (file) {
                    formData.append("images", file);
                });

                await api.createComplaint(formData);
                utils.showToast("Complaint created successfully.", "success");
                form.reset();
                document.getElementById("imagePreview").innerHTML = "";
            } catch (error) {
                utils.showToast(error.message, "error");
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Submit Complaint <i class="bi bi-arrow-right"></i>';
            }
        });
    }

    async function loadMyComplaintsPage() {
        const state = tableState.myComplaints;
        const container = document.getElementById(state.containerId);
        if (!container) {
            return;
        }

        bindSearch(state);
        state.items = (await api.getMyComplaints()).data || [];
        renderTableState(state);
    }

    function buildTimeline(complaint) {
        const steps = [
            { title: "Complaint created", time: complaint.createdAt, icon: "bi-plus-circle" },
            { title: "Assigned", time: complaint.assignedAt, icon: "bi-person-workspace" },
            { title: "In Progress", time: complaint.inProgressAt, icon: "bi-tools" },
            { title: "Resolved", time: complaint.resolvedAt, icon: "bi-check-circle" }
        ];

        return steps.map(function (step) {
            return [
                '<div class="timeline-item">',
                `<div class="timeline-icon"><i class="bi ${step.icon}"></i></div>`,
                `<div><strong>${step.title}</strong><p>${utils.formatDateTime(step.time)}</p></div>`,
                "</div>"
            ].join("");
        }).join("");
    }

    async function loadDetailsPage() {
        const complaintId = utils.readQueryParam("id");
        const container = document.getElementById("complaintDetailsRoot");
        if (!container || !complaintId) {
            return;
        }

        const complaint = (await api.getComplaintById(complaintId)).data;
        const images = (complaint.images || []).filter(Boolean).map(function (image) {
            return `<div class="preview-card"><img src="${image}" alt="Complaint evidence"></div>`;
        }).join("");

        container.innerHTML = [
            '<section class="panel-card stack">',
            `<div class="page-title"><span class="eyebrow">Complaint details</span><h1>${utils.escapeHtml(complaint.title)}</h1>`,
            `<p>${utils.escapeHtml(complaint.description)}</p></div>`,
            '<div class="details-grid">',
            `<div class="detail-tile"><span>Complaint ID</span><strong>${utils.escapeHtml(complaint.complaintId)}</strong></div>`,
            `<div class="detail-tile"><span>Status</span><strong><span class="badge ${utils.statusClass(complaint.status)}">${utils.escapeHtml(complaint.status)}</span></strong></div>`,
            `<div class="detail-tile"><span>Department</span><strong>${utils.escapeHtml(complaint.department && complaint.department.name ? complaint.department.name : "No department")}</strong></div>`,
            `<div class="detail-tile"><span>Location</span><strong>${utils.escapeHtml(complaint.location)}</strong></div>`,
            "</div></section>",
            utils.renderStatusTracker(complaint, { liveLabel: "Live complaint journey" }),
            '<section class="two-column">',
            `<div class="panel-card"><div class="section-head"><div><h2>Status timeline</h2><p>Each stage is sourced from backend timestamps.</p></div></div><div class="timeline">${buildTimeline(complaint)}</div></div>`,
            `<div class="panel-card"><div class="section-head"><div><h2>Participants</h2></div></div><div class="stack"><div><strong>Citizen</strong><p>${utils.escapeHtml(complaint.createdBy && complaint.createdBy.name ? complaint.createdBy.name : "Not available")}</p></div><div><strong>Assigned Employee</strong><p>${utils.escapeHtml(complaint.assignedTo && complaint.assignedTo.name ? complaint.assignedTo.name : "Not assigned yet")}</p></div><div><strong>Employee Remark</strong><p>${utils.escapeHtml(complaint.employeeRemark || "No remark added yet.")}</p></div></div></div>`,
            "</section>",
            `<section class="panel-card"><div class="section-head"><div><h2>Uploaded evidence</h2><p>Images uploaded while filing the complaint.</p></div></div><div class="preview-grid">${images || "<p class='helper-text'>No images uploaded for this complaint.</p>"}</div></section>`
        ].join("");
    }

    async function loadAdminComplaintsPage() {
        const state = tableState.adminComplaints;
        const container = document.getElementById(state.containerId);
        if (!container) {
            return;
        }

        bindSearch(state);
        const results = await Promise.all([
            api.getAllComplaints(),
            api.getEmployees()
        ]);

        state.items = results[0].data || [];
        state.employees = results[1].data || [];
        renderTableState(state);

        container.onclick = function (event) {
            const assignId = event.target.getAttribute("data-assign-id");
            if (!assignId) {
                return;
            }

            const complaint = state.items.find(function (item) {
                return item._id === assignId;
            });

            const matchingEmployees = state.employees.filter(function (employee) {
                return complaint.department && employee.department && complaint.department._id === employee.department._id;
            });

            if (!matchingEmployees.length) {
                utils.showToast("No employees are available in this complaint's department yet.", "info");
                return;
            }

            utils.openModal([
                '<div class="section-head"><div><h2>Assign Complaint</h2><p>Select an employee from the same department.</p></div>',
                '<button type="button" class="btn btn-secondary icon-btn" data-close-modal><i class="bi bi-x-lg"></i></button></div>',
                `<form id="assignComplaintForm" class="form-grid"><input type="hidden" name="complaintId" value="${complaint._id}">`,
                '<div class="form-field"><label>Complaint</label>',
                `<input class="field-control" value="${utils.escapeHtml(complaint.title)}" disabled></div>`,
                '<div class="form-field"><label>Employee</label><select class="field-select" name="employeeId" required>',
                matchingEmployees.map(function (employee) {
                    return `<option value="${employee._id}">${utils.escapeHtml(employee.name)} (${utils.escapeHtml(employee.department && employee.department.name ? employee.department.name : "No department")})</option>`;
                }).join(""),
                '</select></div><button type="submit" class="btn btn-primary">Assign Now</button></form>'
            ].join(""));

            document.getElementById("assignComplaintForm").addEventListener("submit", async function (submitEvent) {
                submitEvent.preventDefault();
                try {
                    await api.assignComplaint(assignId, submitEvent.target.employeeId.value);
                    utils.closeModal();
                    utils.showToast("Complaint assigned successfully.", "success");
                    await loadAdminComplaintsPage();
                } catch (error) {
                    utils.showToast(error.message, "error");
                }
            });
        };
    }

    function nextStatus(currentStatus) {
        if (currentStatus === "Assigned") {
            return "In Progress";
        }
        if (currentStatus === "In Progress") {
            return "Resolved";
        }
        return "";
    }

    async function loadEmployeeAssignedPage() {
        const state = tableState.employeeAssigned;
        const container = document.getElementById(state.containerId);
        if (!container) {
            return;
        }

        bindSearch(state);
        state.items = (await api.getAssignedComplaints()).data || [];
        renderTableState(state);

        container.onclick = function (event) {
            const updateId = event.target.getAttribute("data-update-id");
            if (!updateId) {
                return;
            }

            const complaint = state.items.find(function (item) {
                return item._id === updateId;
            });
            const targetStatus = nextStatus(complaint.status);

            if (!targetStatus) {
                utils.showToast("This complaint is already resolved.", "info");
                return;
            }

            utils.openModal([
                '<div class="section-head"><div><h2>Update Complaint Status</h2><p>Advance the complaint through the backend-supported workflow.</p></div>',
                '<button type="button" class="btn btn-secondary icon-btn" data-close-modal><i class="bi bi-x-lg"></i></button></div>',
                `<form id="updateComplaintForm" class="form-grid"><div class="form-field"><label>Current complaint</label><input class="field-control" value="${utils.escapeHtml(complaint.title)}" disabled></div>`,
                `<div class="form-field"><label>Next status</label><input class="field-control" value="${utils.escapeHtml(targetStatus)}" disabled></div>`,
                '<div class="form-field"><label>Remark</label><textarea class="field-textarea" name="employeeRemark" placeholder="Add an optional update for the citizen."></textarea></div>',
                '<button type="submit" class="btn btn-primary">Save status</button></form>'
            ].join(""));

            document.getElementById("updateComplaintForm").addEventListener("submit", async function (submitEvent) {
                submitEvent.preventDefault();
                try {
                    await api.updateComplaintStatus(updateId, {
                        status: targetStatus,
                        employeeRemark: submitEvent.target.employeeRemark.value.trim()
                    });
                    utils.closeModal();
                    utils.showToast("Complaint status updated.", "success");
                    await loadEmployeeAssignedPage();
                } catch (error) {
                    utils.showToast(error.message, "error");
                }
            });
        };
    }

    document.addEventListener("DOMContentLoaded", function () {
        initComplaintForm();

        loadMyComplaintsPage().catch(function () {
            return null;
        });
        loadDetailsPage().catch(function () {
            return null;
        });
        loadAdminComplaintsPage().catch(function () {
            return null;
        });
        loadEmployeeAssignedPage().catch(function () {
            return null;
        });

        if (document.getElementById(tableState.myComplaints.containerId)) {
            subscribeToComplaintChanges(loadMyComplaintsPage);
        }

        if (document.getElementById("complaintDetailsRoot")) {
            subscribeToComplaintChanges(loadDetailsPage);
        }

        if (document.getElementById(tableState.adminComplaints.containerId)) {
            subscribeToComplaintChanges(loadAdminComplaintsPage);
        }

        if (document.getElementById(tableState.employeeAssigned.containerId)) {
            subscribeToComplaintChanges(loadEmployeeAssignedPage);
        }
    });
})();

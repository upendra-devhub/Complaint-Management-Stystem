(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;
    const realtime = window.CMS.realtime;

    const ITEMS_PER_PAGE = 5;

    const tableState = {
        myComplaints: {
            role: "user",
            items: [],
            query: "",
            bound: false,
            currentPage: 1,
            statusFilter: "all",
            containerId: "myComplaintsTable"
        },
        adminComplaints: {
            role: "admin",
            items: [],
            employees: [],
            query: "",
            bound: false,
            currentPage: 1,
            statusFilter: "all",
            containerId: "adminComplaintsTable"
        },
        employeeAssigned: {
            role: "employee",
            items: [],
            query: "",
            bound: false,
            currentPage: 1,
            statusFilter: "all",
            containerId: "employeeAssignedTable"
        }
    };

    function statusIcon(status) {
        var map = {
            'Pending': 'bi-clock',
            'Assigned': 'bi-person-check',
            'In Progress': 'bi-gear-wide-connected',
            'Resolved': 'bi-check-circle'
        };
        return map[status] || 'bi-circle';
    }

    function complaintRow(complaint, role) {
        const detailsHref = window.CMS.session.resolve(`pages/user/details.html?id=${complaint._id}`);
        const assignButton = role === "admin" ? `<button class="row-action-btn" data-assign-id="${complaint._id}" title="Assign"><i class="bi bi-person-plus"></i> Assign</button>` : "";
        const statusButton = role === "employee" ? `<button class="row-action-btn" data-update-id="${complaint._id}" title="Update Status"><i class="bi bi-arrow-up-circle"></i> Update</button>` : "";
        const departmentName = complaint.department && complaint.department.name ? complaint.department.name : "No department";
        const assignedName = complaint.assignedTo && complaint.assignedTo.name ? complaint.assignedTo.name : "Unassigned";
        const statusCls = utils.statusClass(complaint.status);

        return [
            '<div class="complaint-row">',
            `  <div class="cc-icon"><div class="complaint-avatar ${statusCls}"><i class="bi ${statusIcon(complaint.status)}"></i></div></div>`,
            '  <div class="cc-info">',
            `    <span class="complaint-title">${utils.escapeHtml(complaint.title)}</span>`,
            '    <div class="complaint-meta-line">',
            `      <span class="complaint-id"><i class="bi bi-hash"></i>${utils.escapeHtml(complaint.complaintId)}</span>`,
            '      <span class="complaint-sep">·</span>',
            `      <span class="complaint-date"><i class="bi bi-calendar3"></i>${utils.formatDate(complaint.createdAt)}</span>`,
            '      <span class="complaint-sep">·</span>',
            `      <span class="complaint-location"><i class="bi bi-geo-alt"></i>${utils.escapeHtml(complaint.location)}</span>`,
            '    </div>',
            '  </div>',
            `  <div class="cc-dept"><span class="complaint-dept"><i class="bi bi-building"></i>${utils.escapeHtml(departmentName)}</span></div>`,
            `  <div class="cc-status"><span class="status-pill ${statusCls}"><i class="bi ${statusIcon(complaint.status)}"></i>${utils.escapeHtml(complaint.status)}</span></div>`,
            `  <div class="cc-assigned"><span class="complaint-assigned"><i class="bi bi-person"></i>${utils.escapeHtml(assignedName)}</span></div>`,
            '  <div class="cc-actions">',
            `    <div class="row-actions">`,
            `      <a class="row-action-btn view-btn" href="${detailsHref}" title="View Details"><i class="bi bi-eye"></i> View</a>`,
            `      ${assignButton}${statusButton}`,
            '    </div>',
            '  </div>',
            '</div>'
        ].join("");
    }

    function paginateItems(items, page) {
        const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
        const safePage = Math.max(1, Math.min(page, totalPages));
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        return {
            pageItems: items.slice(start, start + ITEMS_PER_PAGE),
            currentPage: safePage,
            totalPages: totalPages,
            totalItems: items.length
        };
    }

    function buildPaginationControls(paginationInfo, stateKey) {
        if (paginationInfo.totalPages <= 1) {
            return "";
        }

        var buttons = [];
        buttons.push(
            '<button class="pagination-btn' + (paginationInfo.currentPage === 1 ? ' disabled' : '') + '" data-page-action="prev" data-state-key="' + stateKey + '"' + (paginationInfo.currentPage === 1 ? ' disabled' : '') + '><i class="bi bi-chevron-left"></i></button>'
        );

        for (var i = 1; i <= paginationInfo.totalPages; i++) {
            buttons.push(
                '<button class="pagination-btn' + (i === paginationInfo.currentPage ? ' active' : '') + '" data-page-num="' + i + '" data-state-key="' + stateKey + '">' + i + '</button>'
            );
        }

        buttons.push(
            '<button class="pagination-btn' + (paginationInfo.currentPage === paginationInfo.totalPages ? ' disabled' : '') + '" data-page-action="next" data-state-key="' + stateKey + '"' + (paginationInfo.currentPage === paginationInfo.totalPages ? ' disabled' : '') + '><i class="bi bi-chevron-right"></i></button>'
        );

        return [
            '<div class="pagination-bar">',
            '<span class="pagination-info">Showing ' + ((paginationInfo.currentPage - 1) * ITEMS_PER_PAGE + 1) + '–' + Math.min(paginationInfo.currentPage * ITEMS_PER_PAGE, paginationInfo.totalItems) + ' of ' + paginationInfo.totalItems + '</span>',
            '<div class="pagination-controls">' + buttons.join('') + '</div>',
            '</div>'
        ].join('');
    }

    function getStateKeyForContainer(containerId) {
        for (var key in tableState) {
            if (tableState[key].containerId === containerId) {
                return key;
            }
        }
        return null;
    }

    function handlePaginationClick(event) {
        var target = event.target.closest('[data-state-key]');
        if (!target) {
            return;
        }

        var stateKey = target.getAttribute('data-state-key');
        var state = tableState[stateKey];
        if (!state) {
            return;
        }

        var pageNum = target.getAttribute('data-page-num');
        var pageAction = target.getAttribute('data-page-action');

        if (pageNum) {
            state.currentPage = parseInt(pageNum, 10);
        } else if (pageAction === 'prev') {
            state.currentPage = Math.max(1, state.currentPage - 1);
        } else if (pageAction === 'next') {
            state.currentPage = state.currentPage + 1;
        } else {
            return;
        }

        renderTableState(state);
    }

    function renderComplaintTable(container, complaints, role, stateKey) {
        if (!complaints.length) {
            container.innerHTML = utils.createEmptyState("bi-inbox", "No complaints found", "Try changing the filters or add new complaints.");
            return;
        }

        var state = tableState[stateKey];
        var paginationInfo = paginateItems(complaints, state.currentPage);
        state.currentPage = paginationInfo.currentPage;

        container.innerHTML = [
            '<div class="complaint-list">',
            '  <div class="complaint-header">',
            '    <div class="cc-icon"></div>',
            '    <div class="cc-info">Complaint</div>',
            '    <div class="cc-dept">Department</div>',
            '    <div class="cc-status">Status</div>',
            '    <div class="cc-assigned">Assigned To</div>',
            '    <div class="cc-actions">Actions</div>',
            '  </div>',
            paginationInfo.pageItems.map(function (complaint) {
                return complaintRow(complaint, role);
            }).join(""),
            '</div>',
            buildPaginationControls(paginationInfo, stateKey)
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

    function filterByStatus(items, statusFilter) {
        if (!statusFilter || statusFilter === "all") {
            return items;
        }
        return items.filter(function (complaint) {
            return complaint.status === statusFilter;
        });
    }

    function applyAllFilters(state) {
        var filtered = filterComplaints(state.items, state.query);
        if (state.statusFilter) {
            filtered = filterByStatus(filtered, state.statusFilter);
        }
        return filtered;
    }

    function renderTableState(state) {
        const container = document.getElementById(state.containerId);
        if (!container) {
            return;
        }

        var stateKey = getStateKeyForContainer(state.containerId);
        renderComplaintTable(container, applyAllFilters(state), state.role, stateKey);
    }

    function bindSearch(state) {
        if (state.bound) {
            return;
        }

        state.bound = true;
        document.addEventListener("cms:search", function (event) {
            state.query = event.detail.query;
            state.currentPage = 1;
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

        // Track selected files in an array so individual items can be removed
        var selectedFiles = [];

        function renderImagePreviews() {
            const preview = document.getElementById("imagePreview");
            if (!selectedFiles.length) {
                preview.innerHTML = '<p class="helper-text">No images selected yet.</p>';
                return;
            }
            preview.innerHTML = selectedFiles.map(function (file, index) {
                return [
                    '<div class="preview-card">',
                    '<div class="preview-card-img-wrap">',
                    `<img src="${URL.createObjectURL(file)}" alt="${utils.escapeHtml(file.name)}">`,
                    `<button type="button" class="preview-remove-btn" data-remove-index="${index}" title="Remove image"><i class="bi bi-x-lg"></i></button>`,
                    '</div>',
                    `<span>${utils.escapeHtml(file.name)}</span>`,
                    "</div>"
                ].join("");
            }).join("");
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
            var newFiles = Array.from(form.images.files || []);
            newFiles.forEach(function (file) {
                if (selectedFiles.length < 5) {
                    selectedFiles.push(file);
                }
            });
            // Reset the native input so re-selecting the same file works
            form.images.value = "";
            renderImagePreviews();
        });

        // Delegate click on remove buttons inside the preview grid
        document.getElementById("imagePreview").addEventListener("click", function (event) {
            var removeBtn = event.target.closest("[data-remove-index]");
            if (!removeBtn) {
                return;
            }
            var index = parseInt(removeBtn.getAttribute("data-remove-index"), 10);
            selectedFiles.splice(index, 1);
            renderImagePreviews();
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
                formData.append("priority", form.priority.value);
                selectedFiles.forEach(function (file) {
                    formData.append("images", file);
                });

                await api.createComplaint(formData);
                utils.showToast("Complaint created successfully.", "success");
                form.reset();
                selectedFiles = [];
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
        const currentUser = window.CMS.session.getUser();
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
            "</div>",
            // Admin assign button OR User delete button — only shown when complaint is Pending
            (currentUser && currentUser.role === "admin" && complaint.status === "Pending")
                ? '<div class="detail-actions" style="margin-top:1rem;"><button class="btn btn-primary" id="detailsAssignBtn"><i class="bi bi-person-plus"></i> Assign to Employee</button></div>'
                : (currentUser && currentUser.role === "user" && complaint.status === "Pending")
                ? '<div class="detail-actions" style="margin-top:1rem;"><button class="btn btn-primary" id="detailsDeleteBtn" style="background:#EF4444;border-color:#EF4444;"><i class="bi bi-trash3"></i> Delete Complaint</button></div>'
                : '',
            "</section>",
            utils.renderStatusTracker(complaint, { liveLabel: "Live complaint journey" }),
            '<section class="two-column">',
            `<div class="panel-card"><div class="section-head"><div><h2>Status timeline</h2></div></div><div class="timeline">${buildTimeline(complaint)}</div></div>`,
            `<div class="panel-card"><div class="section-head"><div><h2>Participants</h2></div></div><div class="stack"><div><strong>Citizen</strong><p>${utils.escapeHtml(complaint.createdBy && complaint.createdBy.name ? complaint.createdBy.name : "Not available")}</p></div><div><strong>Assigned Employee</strong><p>${utils.escapeHtml(complaint.assignedTo && complaint.assignedTo.name ? complaint.assignedTo.name : "Not assigned yet")}</p></div><div><strong>Employee Remark</strong><p>${utils.escapeHtml(complaint.employeeRemark || "No remark added yet.")}</p></div></div></div>`,
            "</section>",
            `<section class="panel-card"><div class="section-head"><div><h2>Uploaded evidence</h2></div></div><div class="preview-grid">${images || "<p class='helper-text'>No images uploaded for this complaint.</p>"}</div></section>`
        ].join("");

        // Wire up admin assign button on details page
        var detailsAssignBtn = document.getElementById("detailsAssignBtn");
        if (detailsAssignBtn) {
            detailsAssignBtn.addEventListener("click", async function () {
                try {
                    var employees = (await api.getEmployees()).data || [];
                    var matchingEmployees = employees.filter(function (employee) {
                        return complaint.department && employee.department && complaint.department._id === employee.department._id;
                    });

                    if (!matchingEmployees.length) {
                        utils.showToast("No employees are available in this complaint's department yet.", "info");
                        return;
                    }

                    utils.openModal([
                        '<div class="section-head"><div><h2>Assign Complaint</h2><p>Select an employee from the same department.</p></div>',
                        '<button type="button" class="btn btn-secondary icon-btn" data-close-modal><i class="bi bi-x-lg"></i></button></div>',
                        `<form id="detailsAssignForm" class="form-grid"><input type="hidden" name="complaintId" value="${complaint._id}">`,
                        '<div class="form-field"><label>Complaint</label>',
                        `<input class="field-control" value="${utils.escapeHtml(complaint.title)}" disabled></div>`,
                        '<div class="form-field"><label>Employee</label><select class="field-select" name="employeeId" required>',
                        matchingEmployees.map(function (employee) {
                            return `<option value="${employee._id}">${utils.escapeHtml(employee.name)} (${utils.escapeHtml(employee.department && employee.department.name ? employee.department.name : "No department")})</option>`;
                        }).join(""),
                        '</select></div><button type="submit" class="btn btn-primary">Assign Now</button></form>'
                    ].join(""));

                    document.getElementById("detailsAssignForm").addEventListener("submit", async function (submitEvent) {
                        submitEvent.preventDefault();
                        try {
                            await api.assignComplaint(complaint._id, submitEvent.target.employeeId.value);
                            utils.closeModal();
                            utils.showToast("Complaint assigned successfully.", "success");
                            await loadDetailsPage();
                        } catch (err) {
                            utils.showToast(err.message, "error");
                        }
                    });
                } catch (err) {
                    utils.showToast(err.message, "error");
                }
            });
        }

        // Wire up user delete button on details page
        var detailsDeleteBtn = document.getElementById("detailsDeleteBtn");
        if (detailsDeleteBtn) {
            detailsDeleteBtn.addEventListener("click", function () {
                utils.openModal([
                    '<div class="section-head"><div><h2>Delete Complaint</h2><p>This action cannot be undone.</p></div>',
                    '<button type="button" class="btn btn-secondary icon-btn" data-close-modal><i class="bi bi-x-lg"></i></button></div>',
                    '<div class="stack">',
                    `<p>Are you sure you want to delete <strong>${utils.escapeHtml(complaint.title)}</strong>?</p>`,
                    '<div class="row-actions" style="justify-content:flex-end;gap:0.75rem;margin-top:1rem;">',
                    '<button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>',
                    `<button type="button" class="btn btn-primary" id="confirmDetailsDeleteBtn" style="background:#EF4444;border-color:#EF4444;">Delete</button>`,
                    '</div></div>'
                ].join(""));

                document.getElementById("confirmDetailsDeleteBtn").addEventListener("click", async function () {
                    try {
                        await api.deleteComplaint(complaint._id);
                        utils.closeModal();
                        utils.showToast("Complaint deleted successfully.", "success");
                        // Redirect back to my complaints page
                        window.location.href = window.CMS.session.resolve("pages/user/dashboard.html");
                    } catch (err) {
                        utils.showToast(err.message, "error");
                    }
                });
            });
        }
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

    /**
     * Read ?status= from URL and pre-apply it on the matching table state.
     * Also visually activate the right filter chip and open the filter panel.
     */
    function applyUrlStatusFilter(state, chipsContainerId, panelId, toggleBtnId) {
        var urlStatus = utils.readQueryParam("status");
        if (!urlStatus) {
            return;
        }

        state.statusFilter = urlStatus;
        state.currentPage = 1;

        /* Open the filter panel and highlight the right chip */
        var panel = document.getElementById(panelId);
        var toggleBtn = document.getElementById(toggleBtnId);
        var chipsContainer = document.getElementById(chipsContainerId);

        if (panel) {
            panel.classList.add("open");
        }
        if (toggleBtn) {
            toggleBtn.classList.add("active");
        }

        if (chipsContainer) {
            var allChips = chipsContainer.querySelectorAll(".filter-chip");
            allChips.forEach(function (c) { c.classList.remove("active"); });

            var matchingChip = chipsContainer.querySelector('[data-status="' + urlStatus + '"]');
            if (matchingChip) {
                matchingChip.classList.add("active");
            }

            /* Show badge on toggle button */
            if (toggleBtn && urlStatus !== "all") {
                var existingBadge = toggleBtn.querySelector(".filter-count");
                if (existingBadge) {
                    existingBadge.textContent = "1";
                } else {
                    toggleBtn.insertAdjacentHTML("beforeend", ' <span class="filter-count">1</span>');
                }
            }
        }
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

        document.addEventListener('click', handlePaginationClick);

        /* ── Apply URL-based status filter on page load ── */

        /* Admin complaints page */
        if (document.getElementById(tableState.adminComplaints.containerId)) {
            applyUrlStatusFilter(tableState.adminComplaints, "statusFilterChips", "filterPanel", "filterToggleBtn");
        }

        /* Employee assigned page */
        if (document.getElementById(tableState.employeeAssigned.containerId)) {
            applyUrlStatusFilter(tableState.employeeAssigned, "employeeStatusFilterChips", "employeeFilterPanel", "employeeFilterToggleBtn");
        }

        /* User myComplaints page */
        if (document.getElementById(tableState.myComplaints.containerId)) {
            applyUrlStatusFilter(tableState.myComplaints, "userStatusFilterChips", "userFilterPanel", "userFilterToggleBtn");
        }

        /* ── Filter panel toggle + chip logic (Admin) ── */
        var filterToggleBtn = document.getElementById('filterToggleBtn');
        var filterPanel = document.getElementById('filterPanel');
        var statusFilterChips = document.getElementById('statusFilterChips');

        if (filterToggleBtn && filterPanel) {
            filterToggleBtn.addEventListener('click', function () {
                var isOpen = filterPanel.classList.toggle('open');
                filterToggleBtn.classList.toggle('active', isOpen);
            });
        }

        if (statusFilterChips) {
            statusFilterChips.addEventListener('click', function (event) {
                var chip = event.target.closest('[data-status]');
                if (!chip) {
                    return;
                }

                var status = chip.getAttribute('data-status');
                var state = tableState.adminComplaints;

                /* Update active chip */
                var allChips = statusFilterChips.querySelectorAll('.filter-chip');
                allChips.forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');

                /* Apply filter */
                state.statusFilter = status;
                state.currentPage = 1;
                renderTableState(state);

                /* Update the filter button badge */
                if (filterToggleBtn) {
                    var existingBadge = filterToggleBtn.querySelector('.filter-count');
                    if (status !== 'all') {
                        if (existingBadge) {
                            existingBadge.textContent = '1';
                        } else {
                            filterToggleBtn.insertAdjacentHTML('beforeend', ' <span class="filter-count">1</span>');
                        }
                    } else if (existingBadge) {
                        existingBadge.remove();
                    }
                }
            });
        }

        /* ── Employee filter panel toggle + chip logic ── */
        var empFilterToggleBtn = document.getElementById('employeeFilterToggleBtn');
        var empFilterPanel = document.getElementById('employeeFilterPanel');
        var empStatusFilterChips = document.getElementById('employeeStatusFilterChips');

        if (empFilterToggleBtn && empFilterPanel) {
            empFilterToggleBtn.addEventListener('click', function () {
                var isOpen = empFilterPanel.classList.toggle('open');
                empFilterToggleBtn.classList.toggle('active', isOpen);
            });
        }

        if (empStatusFilterChips) {
            empStatusFilterChips.addEventListener('click', function (event) {
                var chip = event.target.closest('[data-status]');
                if (!chip) {
                    return;
                }

                var status = chip.getAttribute('data-status');
                var state = tableState.employeeAssigned;

                /* Update active chip */
                var allChips = empStatusFilterChips.querySelectorAll('.filter-chip');
                allChips.forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');

                /* Apply filter */
                state.statusFilter = status;
                state.currentPage = 1;
                renderTableState(state);

                /* Update the filter button badge */
                if (empFilterToggleBtn) {
                    var existingBadge = empFilterToggleBtn.querySelector('.filter-count');
                    if (status !== 'all') {
                        if (existingBadge) {
                            existingBadge.textContent = '1';
                        } else {
                            empFilterToggleBtn.insertAdjacentHTML('beforeend', ' <span class="filter-count">1</span>');
                        }
                    } else if (existingBadge) {
                        existingBadge.remove();
                    }
                }
            });
        }

        /* ── User myComplaints filter panel toggle + chip logic ── */
        var userFilterToggleBtn = document.getElementById('userFilterToggleBtn');
        var userFilterPanel = document.getElementById('userFilterPanel');
        var userStatusFilterChips = document.getElementById('userStatusFilterChips');

        if (userFilterToggleBtn && userFilterPanel) {
            userFilterToggleBtn.addEventListener('click', function () {
                var isOpen = userFilterPanel.classList.toggle('open');
                userFilterToggleBtn.classList.toggle('active', isOpen);
            });
        }

        if (userStatusFilterChips) {
            userStatusFilterChips.addEventListener('click', function (event) {
                var chip = event.target.closest('[data-status]');
                if (!chip) {
                    return;
                }

                var status = chip.getAttribute('data-status');
                var state = tableState.myComplaints;

                /* Update active chip */
                var allChips = userStatusFilterChips.querySelectorAll('.filter-chip');
                allChips.forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');

                /* Apply filter */
                state.statusFilter = status;
                state.currentPage = 1;
                renderTableState(state);

                /* Update the filter button badge */
                if (userFilterToggleBtn) {
                    var existingBadge = userFilterToggleBtn.querySelector('.filter-count');
                    if (status !== 'all') {
                        if (existingBadge) {
                            existingBadge.textContent = '1';
                        } else {
                            userFilterToggleBtn.insertAdjacentHTML('beforeend', ' <span class="filter-count">1</span>');
                        }
                    } else if (existingBadge) {
                        existingBadge.remove();
                    }
                }
            });
        }
    });
})();

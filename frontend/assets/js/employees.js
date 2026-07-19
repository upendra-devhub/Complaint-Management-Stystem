(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;

    async function fillDepartmentOptions(select, selectedId) {
        const departments = (await api.getDepartments()).data || [];
        select.innerHTML = `<option value="">Choose department</option>${departments.map(function (department) {
            const selected = selectedId === department._id ? "selected" : "";
            return `<option value="${department._id}" ${selected}>${utils.escapeHtml(department.name)}</option>`;
        }).join("")}`;
    }

    async function loadEmployees() {
        const form = document.getElementById("employeeForm");
        const table = document.getElementById("employeeTable");
        if (!form || !table) {
            return;
        }

        await fillDepartmentOptions(form.department, form.department.value);
        const employees = (await api.getEmployees()).data || [];
        table.innerHTML = employees.length ? '<div class="employee-tiles">' + employees.map(function (employee) {
            var dept = employee.department && employee.department.name ? employee.department.name : "No department";
            return [
                '<div class="employee-tile">',
                '<div class="employee-tile-header">',
                '<div class="employee-tile-avatar">' + utils.getInitials(employee.name) + '</div>',
                '<div class="employee-tile-info">',
                '<strong>' + utils.escapeHtml(employee.name) + '</strong>',
                '<span>' + utils.escapeHtml(dept) + '</span>',
                '</div>',
                '</div>',
                '<div class="employee-tile-details">',
                '<div class="employee-tile-row"><i class="bi bi-envelope"></i><span>' + utils.escapeHtml(employee.email) + '</span></div>',
                '<div class="employee-tile-row"><i class="bi bi-phone"></i><span>' + utils.escapeHtml(employee.phone || "—") + '</span></div>',
                '<div class="employee-tile-row"><i class="bi bi-calendar3"></i><span>' + utils.formatDate(employee.createdAt) + '</span></div>',
                '</div>',
                '<div class="employee-tile-actions">',
                '<button class="btn btn-secondary btn-sm" data-edit-id="' + employee._id + '">Edit</button>',
                '<button class="btn btn-ghost btn-sm" data-delete-id="' + employee._id + '">Delete</button>',
                '</div>',
                '</div>'
            ].join("");
        }).join("") + '</div>' : utils.createEmptyState("bi-people", "No employees yet", "Add employees so complaints can be assigned.");

        table.onclick = async function (event) {
            const editId = event.target.getAttribute("data-edit-id");
            const deleteId = event.target.getAttribute("data-delete-id");

            if (editId) {
                const employee = employees.find(function (item) {
                    return item._id === editId;
                });
                form.employeeId.value = employee._id;
                form.name.value = employee.name;
                form.email.value = employee.email;
                form.phone.value = employee.phone || "";
                form.address.value = employee.address || "";
                await fillDepartmentOptions(form.department, employee.department && employee.department._id);
                form.password.closest(".form-field").classList.add("hidden");
                form.password.required = false;
                form.querySelector("[data-submit-label]").textContent = "Update Employee";
            }

            if (deleteId) {
                try {
                    await api.deleteEmployee(deleteId);
                    utils.showToast("Employee deleted successfully.", "success");
                    loadEmployees();
                } catch (error) {
                    utils.showToast(error.message, "error");
                }
            }
        };
    }

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("employeeForm");
        if (!form) {
            return;
        }

        loadEmployees().catch(function (error) {
            utils.showToast(error.message, "error");
        });

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const payload = {
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                phone: form.phone.value.trim(),
                address: form.address.value.trim(),
                department: form.department.value
            };

            if (!form.employeeId.value) {
                payload.password = form.password.value;
            }

            try {
                if (form.employeeId.value) {
                    await api.updateEmployee(form.employeeId.value, payload);
                    utils.showToast("Employee updated successfully.", "success");
                } else {
                    await api.createEmployee(payload);
                    utils.showToast("Employee created successfully.", "success");
                }

                form.reset();
                form.employeeId.value = "";
                form.password.closest(".form-field").classList.remove("hidden");
                form.password.required = true;
                form.querySelector("[data-submit-label]").textContent = "Create Employee";
                loadEmployees();
            } catch (error) {
                utils.showToast(error.message, "error");
            }
        });
    });
})();

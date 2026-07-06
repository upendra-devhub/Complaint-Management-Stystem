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
        table.innerHTML = employees.length ? [
            '<div class="table-shell"><table class="data-table"><thead><tr>',
            "<th>Employee</th><th>Email</th><th>Department</th><th>Phone</th><th>Actions</th>",
            "</tr></thead><tbody>",
            employees.map(function (employee) {
                return [
                    "<tr>",
                    `<td><div class="inline-meta"><strong>${utils.escapeHtml(employee.name)}</strong><small>${utils.formatDate(employee.createdAt)}</small></div></td>`,
                    `<td>${utils.escapeHtml(employee.email)}</td>`,
                    `<td>${utils.escapeHtml(employee.department && employee.department.name ? employee.department.name : "No department")}</td>`,
                    `<td>${utils.escapeHtml(employee.phone || "No phone")}</td>`,
                    `<td><div class="table-actions"><button class="btn btn-secondary" data-edit-id="${employee._id}">Edit</button><button class="btn btn-ghost" data-delete-id="${employee._id}">Delete</button></div></td>`,
                    "</tr>"
                ].join("");
            }).join(""),
            "</tbody></table></div>"
        ].join("") : utils.createEmptyState("bi-people", "No employees yet", "Add employees so complaints can be assigned.");

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
                form.querySelector("[data-submit-label]").textContent = "Create Employee";
                loadEmployees();
            } catch (error) {
                utils.showToast(error.message, "error");
            }
        });
    });
})();

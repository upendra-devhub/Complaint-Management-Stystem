(function () {
    const api = window.CMS.api;
    const utils = window.CMS.utils;

    async function loadDepartments() {
        const form = document.getElementById("departmentForm");
        const list = document.getElementById("departmentList");
        if (!form || !list) {
            return;
        }

        const departments = (await api.getDepartments()).data || [];
        list.innerHTML = departments.length ? departments.map(function (department) {
            return [
                '<article class="panel-card stack">',
                `<div class="split"><div><h3>${utils.escapeHtml(department.name)}</h3><p>${utils.escapeHtml(department.description || "No description added yet.")}</p></div>`,
                `<span class="chip">${utils.formatDate(department.createdAt)}</span></div>`,
                '<div class="action-row">',
                `<button class="btn btn-secondary" data-edit-id="${department._id}">Edit</button>`,
                `<button class="btn btn-ghost" data-delete-id="${department._id}">Delete</button>`,
                "</div></article>"
            ].join("");
        }).join("") : utils.createEmptyState("bi-diagram-3", "No departments yet", "Create the first department to structure complaints.");

        list.onclick = async function (event) {
            const editId = event.target.getAttribute("data-edit-id");
            const deleteId = event.target.getAttribute("data-delete-id");

            if (editId) {
                const department = departments.find(function (item) {
                    return item._id === editId;
                });
                form.departmentId.value = department._id;
                form.name.value = department.name;
                form.description.value = department.description || "";
                form.querySelector("[data-submit-label]").textContent = "Update Department";
            }

            if (deleteId) {
                try {
                    await api.deleteDepartment(deleteId);
                    utils.showToast("Department deleted successfully.", "success");
                    loadDepartments();
                } catch (error) {
                    utils.showToast(error.message, "error");
                }
            }
        };
    }

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("departmentForm");
        if (!form) {
            return;
        }

        loadDepartments().catch(function (error) {
            utils.showToast(error.message, "error");
        });

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            try {
                const payload = {
                    name: form.name.value.trim(),
                    description: form.description.value.trim()
                };

                if (form.departmentId.value) {
                    await api.updateDepartment(form.departmentId.value, payload);
                    utils.showToast("Department updated successfully.", "success");
                } else {
                    await api.createDepartment(payload);
                    utils.showToast("Department created successfully.", "success");
                }

                form.reset();
                form.departmentId.value = "";
                form.querySelector("[data-submit-label]").textContent = "Create Department";
                loadDepartments();
            } catch (error) {
                utils.showToast(error.message, "error");
            }
        });
    });
})();

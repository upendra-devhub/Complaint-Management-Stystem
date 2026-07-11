(function () {
    const ROOT_PREFIX = window.location.pathname.includes("/pages/") ? "../../" : "./";
    const STORAGE_KEYS = {
        token: "cms_token",
        user: "cms_user",
        apiBase: "cms_api_base_url"
    };

    const ROLE_HOME = {
        admin: "pages/admin/dashboard.html",
        employee: "pages/employee/dashboard.html",
        user: "pages/user/dashboard.html"
    };

    function resolve(path) {
        return `${ROOT_PREFIX}${path}`;
    }

 function getApiBase() {
    return (
        localStorage.getItem(STORAGE_KEYS.apiBase) ||
        "https://cms-backend-reba.onrender.com/api/v1"
    );
}

    function getSocketBase() {
        return getApiBase().replace(/\/api\/v1\/?$/, "");
    }

    function getToken() {
        return localStorage.getItem(STORAGE_KEYS.token) || "";
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
        } catch (error) {
            return null;
        }
    }

    function setSession(payload) {
        localStorage.setItem(STORAGE_KEYS.token, payload.token);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(payload.user));
    }

    function setStoredUser(user) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }

    function clearSession() {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
    }

    function redirectToLogin() {
        window.location.href = resolve("index.html");
    }

    function redirectByRole(role) {
        window.location.href = resolve(ROLE_HOME[role] || ROLE_HOME.user);
    }

    async function request(path, options) {
        const config = options || {};
        const headers = new Headers(config.headers || {});
        const isFormData = config.body instanceof FormData;
        const token = getToken();

        if (!isFormData && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const response = await fetch(`${getApiBase()}${path}`, {
            method: config.method || "GET",
            headers,
            body: config.body
        });

        const payload = await response.json().catch(function () {
            return {
                success: false,
                message: "Unexpected server response"
            };
        });

        if (!response.ok) {
            if (response.status === 401) {
                clearSession();
            }
            throw new Error(payload.message || "Request failed");
        }

        return payload;
    }

    const api = {
        request: request,
        login: function (credentials) {
            return request("/auth/login", {
                method: "POST",
                body: JSON.stringify(credentials)
            });
        },
        register: function (payload) {
            return request("/auth/register", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        getDashboard: function (role) {
            return request(`/dashboard/${role}`);
        },
        getDepartments: function () {
            return request("/departments");
        },
        createDepartment: function (payload) {
            return request("/departments", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        updateDepartment: function (id, payload) {
            return request(`/departments/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        },
        deleteDepartment: function (id) {
            return request(`/departments/${id}`, {
                method: "DELETE"
            });
        },
        getEmployees: function () {
            return request("/employees");
        },
        createEmployee: function (payload) {
            return request("/employees", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        updateEmployee: function (id, payload) {
            return request(`/employees/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        },
        deleteEmployee: function (id) {
            return request(`/employees/${id}`, {
                method: "DELETE"
            });
        },
        getAllComplaints: function () {
            return request("/complaints");
        },
        getMyComplaints: function () {
            return request("/complaints/my");
        },
        getAssignedComplaints: function () {
            return request("/complaints/assigned");
        },
        getComplaintById: function (id) {
            return request(`/complaints/${id}`);
        },
        createComplaint: function (formData) {
            return request("/complaints", {
                method: "POST",
                body: formData
            });
        },
        assignComplaint: function (id, employeeId) {
            return request(`/complaints/${id}/assign`, {
                method: "PUT",
                body: JSON.stringify({
                    employeeId: employeeId
                })
            });
        },
        updateComplaintStatus: function (id, payload) {
            return request(`/complaints/${id}/status`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        },
        getMyProfile: function () {
            return request("/users/me");
        },
        updateMyProfile: function (payload) {
            return request("/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        },
        getAdminProfile: function () {
            return request("/admin/me");
        },
        updateAdminProfile: function (payload) {
            return request("/admin/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        }
    };

    window.CMS = window.CMS || {};
    window.CMS.api = api;
    window.CMS.session = {
        getApiBase: getApiBase,
        getSocketBase: getSocketBase,
        getToken: getToken,
        getUser: getUser,
        setSession: setSession,
        clearSession: clearSession,
        setStoredUser: setStoredUser,
        redirectToLogin: redirectToLogin,
        redirectByRole: redirectByRole,
        resolve: resolve,
        roleHome: ROLE_HOME
    };
})();

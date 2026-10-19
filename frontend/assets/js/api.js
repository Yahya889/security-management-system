const API_BASE_URL = '/api';

class APIClient {
    constructor() {
        this.token = sessionStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        sessionStorage.setItem('token', token);
    }

    getToken() {
        return this.token;
    }

    clearToken() {
        this.token = null;
        sessionStorage.removeItem('token');
    }

    async request(method, endpoint, data = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (this.token) options.headers.Authorization = 'Bearer ' + this.token;
        if (data && method !== 'GET') options.body = JSON.stringify(data);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();
            if (response.status === 401 && !endpoint.startsWith('/auth/login')) {
                this.clearToken();
                window.location.href = '/frontend/pages/login.html';
            }
            return result;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'خطأ في الاتصال' };
        }
    }

    get(endpoint) { return this.request('GET', endpoint); }
    post(endpoint, data) { return this.request('POST', endpoint, data); }
    put(endpoint, data) { return this.request('PUT', endpoint, data); }
    delete(endpoint) { return this.request('DELETE', endpoint); }

    login(employee_id, password) {
        return this.post('/auth/login', { employee_id, password });
    }

    getCurrentUser() { return this.get('/auth/me'); }
    getAdminSettings() { return this.get('/admin/settings'); }
    saveAdminSettings(settings) { return this.put('/admin/settings', settings); }
    getDepartments() { return this.get('/admin/departments'); }
    createDepartment(name) { return this.post('/admin/departments', { name }); }
    updateDepartment(id, data) { return this.put(`/admin/departments/${id}`, data); }

    getEmployeeReport(filters = {}) {
        const query = new URLSearchParams(filters);
        return this.get(`/admin/reports/employees?${query}`);
    }
}

const api = new APIClient();

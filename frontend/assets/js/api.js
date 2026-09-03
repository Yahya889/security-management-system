// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    // تعيين التوكن
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // الحصول على التوكن
    getToken() {
        return this.token;
    }

    // حذف التوكن
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // طلب عام
    async request(method, endpoint, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.token) {
            options.headers.Authorization = `Bearer ${this.token}`;
        }

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/frontend/pages/login.html';
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'خطأ في الاتصال' };
        }
    }

    // GET
    get(endpoint) {
        return this.request('GET', endpoint);
    }

    // POST
    post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    // PUT
    put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    // DELETE
    delete(endpoint) {
        return this.request('DELETE', endpoint);
    }

    // Auth Methods
    login(employee_id, password) {
        return this.post('/auth/login', { employee_id, password });
    }

    getCurrentUser() {
        return this.get('/auth/me');
    }

    changePassword(old_password, new_password) {
        return this.post('/auth/change-password', { old_password, new_password });
    }

    logout() {
        return this.post('/auth/logout', {});
    }

    // Dashboard
    getDashboard() {
        return this.get('/dashboard');
    }

    getStatistics(period = 'day') {
        return this.get(`/dashboard/statistics?period=${period}`);
    }

    // Employees
    getAllEmployees(page = 1, limit = 10, status = 'نشط') {
        return this.get(`/employees?page=${page}&limit=${limit}&status=${status}`);
    }

    getEmployeeById(id) {
        return this.get(`/employees/${id}`);
    }

    createEmployee(data) {
        return this.post('/employees', data);
    }

    updateEmployee(id, data) {
        return this.put(`/employees/${id}`, data);
    }

    deleteEmployee(id) {
        return this.delete(`/employees/${id}`);
    }
}

// إنشاء instance عام
const api = new APIClient();

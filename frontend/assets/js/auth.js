// Authentication Functions
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const employee_id = document.getElementById('employee_id').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            // إخفاء الرسائل السابقة
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            
            try {
                const response = await api.login(employee_id, password);
                
                if (response.success) {
                    // تخزين التوكن
                    api.setToken(response.token);
                    
                    // تخزين بيانات الموظف
                    localStorage.setItem('employee', JSON.stringify(response.employee));
                    
                    // عرض رسالة النجاح
                    successMessage.textContent = 'جاري التوجيه...';
                    successMessage.style.display = 'block';
                    
                    // الانتظار قليلاً ثم التوجيه
                    setTimeout(() => {
                        window.location.href = '/frontend/pages/dashboard.html';
                    }, 1500);
                } else {
                    errorMessage.textContent = response.message || 'خطأ في تسجيل الدخول';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'حدث خطأ في الاتصال';
                errorMessage.style.display = 'block';
            }
        });
    }
});

// التحقق من تسجيل الدخول
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/frontend/pages/login.html';
        return false;
    }
    return true;
}

// تسجيل الخروج
async function logout() {
    try {
        await api.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        api.clearToken();
        localStorage.removeItem('employee');
        window.location.href = '/frontend/pages/login.html';
    }
}

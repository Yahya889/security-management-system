// Authentication Functions
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const employee_id = document.getElementById('employee_id').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            // إخفاء الرسائل السابقة
            api.clearToken();
            sessionStorage.removeItem('employee');
            errorMessage.hidden = true;
            successMessage.hidden = true;
            
            try {
                const response = await api.login(employee_id, password);
                
                if (response.success) {
                    if (response.employee.role !== 'مدير') {
                        errorMessage.textContent = 'هذه النسخة متاحة لمدير النظام فقط';
                        errorMessage.hidden = false;
                        return;
                    }
                    // تخزين التوكن
                    api.setToken(response.token);
                    
                    // تخزين بيانات الموظف
                    sessionStorage.setItem('employee', JSON.stringify(response.employee));
                    
                    // عرض رسالة النجاح
                    successMessage.textContent = 'جاري التوجيه...';
                    successMessage.hidden = false;
                    
                    // الانتظار قليلاً ثم التوجيه
                    setTimeout(() => {
                        window.location.href = '/frontend/pages/admin.html';
                    }, 400);
                } else {
                    errorMessage.textContent = response.message || 'خطأ في تسجيل الدخول';
                    errorMessage.hidden = false;
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'حدث خطأ في الاتصال';
                errorMessage.hidden = false;
            }
        });
    }
});

// التحقق من تسجيل الدخول
function checkAuth() {
    const token = sessionStorage.getItem('token');
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
        sessionStorage.removeItem('employee');
        window.location.href = '/frontend/pages/login.html';
    }
}

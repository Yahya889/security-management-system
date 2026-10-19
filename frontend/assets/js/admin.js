document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    const message = document.getElementById('pageMessage');
    const tell = (text, isError = false) => {
        message.textContent = text;
        message.className = `message visible${isError ? ' error' : ''}`;
    };
    const applyAppearance = (settings) => {
        document.body.classList.remove('theme-blue', 'theme-green', 'theme-dark',
            'background-gradient', 'background-light', 'background-dark');
        document.body.classList.add(`theme-${settings.theme}`, `background-${settings.background}`);
        document.getElementById('organizationTitle').textContent = settings.organization_name;
        document.title = settings.organization_name;
    };

    document.getElementById('logoutButton').addEventListener('click', logout);

    try {
        const [userResult, settingsResult] = await Promise.all([
            api.getCurrentUser(),
            api.getAdminSettings()
        ]);
        if (!userResult.success || userResult.employee.role !== 'مدير') {
            throw new Error('لا تملك صلاحية إدارة النظام');
        }
        if (!settingsResult.success) throw new Error(settingsResult.message);
        const employee = userResult.employee;
        document.getElementById('welcomeMessage').textContent = `مرحباً ${employee.full_name} — إعدادات وأقسام وتقارير الموظفين`;

        const settings = settingsResult.settings;
        document.getElementById('organizationName').value = settings.organization_name;
        document.getElementById('theme').value = settings.theme;
        document.getElementById('background').value = settings.background;
        applyAppearance(settings);
        await Promise.all([loadDepartments(), loadReport(), loadAssistantRequests()]);
    } catch (error) {
        tell(error.message || 'تعذر تحميل بيانات النظام', true);
    }

    document.getElementById('settingsForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const settings = {
            organization_name: document.getElementById('organizationName').value.trim(),
            theme: document.getElementById('theme').value,
            background: document.getElementById('background').value
        };
        const result = await api.saveAdminSettings(settings);
        if (!result.success) return tell(result.message, true);
        applyAppearance(settings);
        tell('تم حفظ إعدادات المظهر');
    });

    document.getElementById('departmentForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = document.getElementById('departmentName');
        const result = await api.createDepartment(input.value.trim());
        if (!result.success) return tell(result.message, true);
        input.value = '';
        await loadDepartments();
        tell('تمت إضافة القسم');
    });

    document.getElementById('reportForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await loadReport();
        } catch (error) {
            tell(error.message || 'تعذر تحميل التقرير', true);
        }
    });

    document.getElementById('assistantForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = document.getElementById('assistantInput');
        const resultElement = document.getElementById('assistantResult');
        resultElement.textContent = 'جارٍ تنفيذ الطلب أو تسجيله...';
        const result = await api.submitAssistantRequest(input.value.trim());
        if (!result.success) {
            resultElement.textContent = result.message || 'تعذر تنفيذ الطلب';
            return;
        }
        resultElement.textContent = result.request.result_message;
        input.value = '';
        if (result.request.status === 'نفذ') {
            if (/قسم/u.test(result.request.request_text)) await loadDepartments();
            if (/لون|خلفية|اسم المنشأة/u.test(result.request.request_text)) {
                const refreshedSettings = await api.getAdminSettings();
                if (refreshedSettings.success) {
                    document.getElementById('organizationName').value = refreshedSettings.settings.organization_name;
                    document.getElementById('theme').value = refreshedSettings.settings.theme;
                    document.getElementById('background').value = refreshedSettings.settings.background;
                    applyAppearance(refreshedSettings.settings);
                }
            }
        }
        await loadAssistantRequests();
    });

    async function loadAssistantRequests() {
        const result = await api.getAssistantRequests();
        if (!result.success) throw new Error(result.message);
        const list = document.getElementById('assistantRequests');
        list.replaceChildren();
        const pending = result.requests.filter((request) => request.status === 'بانتظار_المراجعة');
        if (!pending.length) {
            const empty = document.createElement('li');
            empty.textContent = 'لا توجد طلبات بانتظار المراجعة.';
            list.append(empty);
            return;
        }
        pending.forEach((request) => {
            const item = document.createElement('li');
            const text = document.createElement('span');
            text.className = 'request-text';
            text.textContent = request.request_text;
            const meta = document.createElement('span');
            meta.className = 'request-meta';
            meta.textContent = new Date(request.created_at).toLocaleString('ar');
            const reviewed = document.createElement('button');
            reviewed.type = 'button';
            reviewed.className = 'button secondary';
            reviewed.textContent = 'تمت المراجعة';
            reviewed.addEventListener('click', async () => {
                const response = await api.reviewAssistantRequest(request.id, 'تمت_المراجعة');
                if (!response.success) return tell(response.message, true);
                await loadAssistantRequests();
            });
            const rejected = document.createElement('button');
            rejected.type = 'button';
            rejected.className = 'button secondary';
            rejected.textContent = 'رفض';
            rejected.addEventListener('click', async () => {
                const response = await api.reviewAssistantRequest(request.id, 'مرفوض');
                if (!response.success) return tell(response.message, true);
                await loadAssistantRequests();
            });
            item.append(text, meta, reviewed, rejected);
            list.append(item);
        });
    }

    async function loadDepartments() {
        const result = await api.getDepartments();
        if (!result.success) throw new Error(result.message);
        const list = document.getElementById('departmentList');
        const select = document.getElementById('reportDepartment');
        list.replaceChildren();
        select.replaceChildren(new Option('كل الأقسام', ''));

        result.departments.forEach((department) => {
            const item = document.createElement('li');
            const name = document.createElement('span');
            name.textContent = department.name;
            if (!department.active) name.className = 'muted';
            const edit = document.createElement('button');
            edit.type = 'button';
            edit.className = 'button secondary';
            edit.textContent = 'تعديل الاسم';
            edit.addEventListener('click', async () => {
                const updatedName = window.prompt('اسم القسم الجديد', department.name);
                if (!updatedName || !updatedName.trim()) return;
                const response = await api.updateDepartment(department.id, {
                    name: updatedName.trim(), active: Boolean(department.active)
                });
                if (!response.success) return tell(response.message, true);
                await loadDepartments();
                tell('تم تحديث القسم');
            });
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'button';
            toggle.textContent = department.active ? 'إيقاف' : 'تفعيل';
            toggle.addEventListener('click', async () => {
                const response = await api.updateDepartment(department.id, {
                    name: department.name, active: !Boolean(department.active)
                });
                if (!response.success) return tell(response.message, true);
                await loadDepartments();
                tell('تم تحديث حالة القسم');
            });
            item.append(name, edit, toggle);
            list.append(item);
            if (department.active) select.add(new Option(department.name, department.name));
        });
    }

    async function loadReport() {
        const filters = {};
        const status = document.getElementById('reportStatus').value;
        const department = document.getElementById('reportDepartment').value;
        if (status) filters.status = status;
        if (department) filters.department = department;
        const result = await api.getEmployeeReport(filters);
        if (!result.success) throw new Error(result.message);
        const body = document.getElementById('reportRows');
        body.replaceChildren();
        document.getElementById('reportCount').textContent = `عدد الموظفين: ${result.count}`;
        result.employees.forEach((employee) => {
            const row = document.createElement('tr');
            [employee.employee_id, employee.full_name, employee.position, employee.department,
                employee.role, employee.status, employee.hire_date || '—'].forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value || '—';
                row.append(cell);
            });
            body.append(row);
        });
    }
});

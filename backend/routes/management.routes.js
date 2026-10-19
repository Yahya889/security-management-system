const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();
const allowedSettings = {
  theme: ['blue', 'green', 'dark'],
  background: ['gradient', 'light', 'dark'],
  organization_name: null
};

router.use(authMiddleware, adminMiddleware);

router.get('/settings', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM system_settings');
    const settings = { theme: 'blue', background: 'gradient', organization_name: 'نظام إدارة الحراسات الأمنية' };
    for (const row of rows) {
      if (Object.hasOwn(settings, row.setting_key)) settings[row.setting_key] = row.setting_value;
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  const entries = Object.entries(req.body || {});
  if (!entries.length || entries.some(([key, value]) => {
    if (!Object.hasOwn(allowedSettings, key) || typeof value !== 'string') return true;
    if (key === 'organization_name') return value.trim().length < 1 || value.trim().length > 100;
    return !allowedSettings[key].includes(value);
  })) {
    return res.status(400).json({ success: false, message: 'إعدادات غير صالحة' });
  }

  try {
    for (const [key, value] of entries) {
      await pool.execute(
        `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, key === 'organization_name' ? value.trim() : value]
      );
    }
    res.json({ success: true, message: 'تم حفظ الإعدادات' });
  } catch (error) {
    next(error);
  }
});

router.get('/departments', async (req, res, next) => {
  try {
    const [departments] = await pool.execute(
      'SELECT id, name, active FROM departments ORDER BY name'
    );
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
});

router.post('/departments', async (req, res, next) => {
  const name = typeof (req.body || {}).name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 100) {
    return res.status(400).json({ success: false, message: 'اسم القسم مطلوب وبحد أقصى 100 حرف' });
  }
  try {
    const [result] = await pool.execute('INSERT INTO departments (name) VALUES (?)', [name]);
    res.status(201).json({ success: true, department: { id: result.insertId, name, active: 1 } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'القسم موجود مسبقاً' });
    }
    return next(error);
  }
});

router.put('/departments/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const active = body.active;
  if (!Number.isSafeInteger(id) || id < 1 || !name || name.length > 100 ||
      (active !== undefined && typeof active !== 'boolean')) {
    return res.status(400).json({ success: false, message: 'بيانات القسم غير صالحة' });
  }
  try {
    const [result] = await pool.execute(
      'UPDATE departments SET name = ?, active = COALESCE(?, active) WHERE id = ?',
      [name, active === undefined ? null : active, id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'القسم غير موجود' });
    return res.json({ success: true, message: 'تم تحديث القسم' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'القسم موجود مسبقاً' });
    }
    return next(error);
  }
});

router.delete('/departments/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'معرّف القسم غير صالح' });
  }
  try {
    const [result] = await pool.execute('UPDATE departments SET active = 0 WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'القسم غير موجود' });
    return res.json({ success: true, message: 'تم إيقاف القسم' });
  } catch (error) {
    return next(error);
  }
});

router.get('/reports/employees', async (req, res, next) => {
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const department = typeof req.query.department === 'string' ? req.query.department.trim() : '';
  const allowedStatuses = ['نشط', 'إجازة', 'منتهي_الخدمة'];
  if ((status && !allowedStatuses.includes(status)) || department.length > 100) {
    return res.status(400).json({ success: false, message: 'معايير التقرير غير صالحة' });
  }

  const conditions = [];
  const parameters = [];
  if (status) {
    conditions.push('status = ?');
    parameters.push(status);
  }
  if (department) {
    conditions.push('department = ?');
    parameters.push(department);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const [employees] = await pool.execute(
      `SELECT employee_id, full_name, position, department, role, status, hire_date
       FROM employees ${where} ORDER BY full_name LIMIT 500`,
      parameters
    );
    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    next(error);
  }
});

router.get('/assistant/requests', async (req, res, next) => {
  try {
    const [requests] = await pool.execute(
      `SELECT id, request_text, status, result_message, created_at
       FROM admin_requests ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
});

router.post('/assistant/requests', async (req, res, next) => {
  const text = typeof (req.body || {}).text === 'string' ? req.body.text.trim() : '';
  if (!text || text.length > 500) {
    return res.status(400).json({ success: false, message: 'اكتب طلباً من 1 إلى 500 حرف' });
  }

  let action;
  let parameter;
  let resultMessage;
  let status = 'بانتظار_المراجعة';
  const addDepartment = text.match(/^(?:أضف|اضف|إضافة)\s+قسم\s+(.+)$/u);
  const changeOrganizationName = text.match(/^(?:غيّر|غير|تغيير)\s+اسم\s+(?:المنشأة|المؤسسة)\s+(?:إلى|الى)\s+(.+)$/u);
  const changeTheme = text.match(/^(?:غيّر|غير|تغيير)\s+لون\s+(?:الواجهة|النظام)\s+(?:إلى|الى)\s+(أزرق|ازرق|أخضر|اخضر|داكن)$/u);
  const changeBackground = text.match(/^(?:غيّر|غير|تغيير)\s+الخلفية\s+(?:إلى|الى)\s+(متدرجة|فاتحة|داكنة)$/u);
  const employeeReport = /^(?:أنشئ|انشئ|اعرض|عرض)\s+تقرير\s+الموظفين$/u.test(text);

  if (addDepartment) {
    parameter = addDepartment[1].trim();
    if (!parameter || parameter.length > 100) {
      return res.status(400).json({ success: false, message: 'اسم القسم يجب ألا يتجاوز 100 حرف' });
    }
    action = 'department';
    resultMessage = `تمت إضافة القسم: ${parameter}`;
    status = 'نفذ';
  } else if (changeOrganizationName) {
    parameter = changeOrganizationName[1].trim();
    if (!parameter || parameter.length > 100) {
      return res.status(400).json({ success: false, message: 'اسم المنشأة يجب ألا يتجاوز 100 حرف' });
    }
    action = 'organization_name';
    resultMessage = 'تم تغيير اسم المنشأة';
    status = 'نفذ';
  } else if (changeTheme) {
    parameter = { 'أزرق': 'blue', 'ازرق': 'blue', 'أخضر': 'green', 'اخضر': 'green', 'داكن': 'dark' }[changeTheme[1]];
    action = 'theme';
    resultMessage = 'تم تغيير لون الواجهة';
    status = 'نفذ';
  } else if (changeBackground) {
    parameter = { 'متدرجة': 'gradient', 'فاتحة': 'light', 'داكنة': 'dark' }[changeBackground[1]];
    action = 'background';
    resultMessage = 'تم تغيير الخلفية';
    status = 'نفذ';
  } else if (employeeReport) {
    action = 'employee_report';
    status = 'نفذ';
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (action === 'department') {
      await connection.execute('INSERT INTO departments (name) VALUES (?)', [parameter]);
    } else if (action) {
      const settingKey = action === 'organization_name' ? action : action;
      if (['organization_name', 'theme', 'background'].includes(settingKey)) {
        await connection.execute(
          `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [settingKey, parameter]
        );
      }
    }

    if (action === 'employee_report') {
      const [[{ count }]] = await connection.execute('SELECT COUNT(*) AS count FROM employees');
      resultMessage = `يوجد ${count} موظفاً. افتح قسم «تقرير الموظفين» لعرض التفاصيل والتصفية.`;
    } else if (!action) {
      resultMessage = 'سُجل الطلب للمراجعة؛ لا ينفذ المساعد تغييرات غير مدعومة أو يشغّل شيفرة.';
    }

    const [insertResult] = await connection.execute(
      `INSERT INTO admin_requests (created_by, request_text, status, result_message)
       VALUES (?, ?, ?, ?)`,
      [req.employee.id, text, status, resultMessage]
    );
    await connection.commit();
    return res.status(201).json({
      success: true,
      request: { id: insertResult.insertId, request_text: text, status, result_message: resultMessage }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY' && action === 'department') {
      return res.status(409).json({ success: false, message: 'هذا القسم موجود مسبقاً' });
    }
    return next(error);
  } finally {
    if (connection) connection.release();
  }
});

router.patch('/assistant/requests/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const status = (req.body || {}).status;
  if (!Number.isSafeInteger(id) || id < 1 || !['تمت_المراجعة', 'مرفوض'].includes(status)) {
    return res.status(400).json({ success: false, message: 'حالة الطلب غير صالحة' });
  }
  try {
    const [result] = await pool.execute(
      `UPDATE admin_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'بانتظار_المراجعة'`,
      [status, req.employee.id, id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود أو سبق التعامل معه' });
    }
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

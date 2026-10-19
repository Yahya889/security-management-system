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
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
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
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const active = req.body.active;
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

module.exports = router;

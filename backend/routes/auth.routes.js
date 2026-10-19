const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const employeeId = typeof req.body.employee_id === 'string' ? req.body.employee_id.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!employeeId || !password || employeeId.length > 100 || password.length > 200) {
    return res.status(400).json({ success: false, message: 'أدخل بيانات دخول صحيحة' });
  }

  try {
    const [employees] = await pool.execute(
      `SELECT id, employee_id, full_name, email, role, status, password
       FROM employees WHERE employee_id = ? OR email = ? LIMIT 1`,
      [employeeId, employeeId]
    );
    const employee = employees[0];

    if (!employee || employee.status !== 'نشط' || !(await bcrypt.compare(password, employee.password))) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      subject: String(employee.id),
      expiresIn: '8h'
    });
    return res.json({
      success: true,
      token,
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, employee: req.employee });
});

module.exports = router;

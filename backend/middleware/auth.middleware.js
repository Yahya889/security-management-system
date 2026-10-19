const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function authMiddleware(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token || /\s/.test(token)) {
    return res.status(401).json({ success: false, message: 'يلزم تسجيل الدخول' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!/^\d+$/.test(payload.sub || '') || typeof payload.jti !== 'string' ||
        !Number.isInteger(payload.exp)) {
      return res.status(401).json({ success: false, message: 'جلسة الدخول غير صالحة' });
    }
    const [revoked] = await pool.execute(
      'SELECT token_id FROM revoked_tokens WHERE token_id = ? LIMIT 1',
      [payload.jti]
    );
    if (revoked.length) {
      return res.status(401).json({ success: false, message: 'جلسة الدخول غير صالحة' });
    }
    const [employees] = await pool.execute(
      'SELECT id, employee_id, full_name, role, status FROM employees WHERE id = ? LIMIT 1',
      [payload.sub]
    );
    const employee = employees[0];

    if (!employee || employee.status !== 'نشط') {
      return res.status(401).json({ success: false, message: 'الحساب غير نشط' });
    }

    req.employee = employee;
    req.tokenId = payload.jti;
    req.tokenExpiry = payload.exp;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'جلسة الدخول غير صالحة' });
    }
    return next(error);
  }
}

function adminMiddleware(req, res, next) {
  if (req.employee.role !== 'مدير') {
    return res.status(403).json({ success: false, message: 'هذه الخدمة متاحة لمدير النظام فقط' });
  }
  return next();
}

module.exports = { authMiddleware, adminMiddleware };

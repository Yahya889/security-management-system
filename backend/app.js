const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const managementRoutes = require('./routes/management.routes');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters');
}

const app = express();

app.use(helmet());
app.use(express.json({ limit: '20kb' }));
app.use(morgan('combined'));
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => res.redirect('/frontend/pages/login.html'));
app.get('/api/health', (req, res) => res.json({ success: true }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', managementRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'المسار غير موجود' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Security management system listening on port ${port}`));
}

module.exports = app;

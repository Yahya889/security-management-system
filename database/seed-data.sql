-- Insert Test Data

-- Insert Shifts
INSERT INTO shifts (shift_name, start_time, end_time, description) VALUES
('الوردية الصباحية', '06:00:00', '14:00:00', 'وردية صباحية'),
('الوردية المسائية', '14:00:00', '22:00:00', 'وردية مسائية'),
('الوردية الليلية', '22:00:00', '06:00:00', 'وردية ليلية');

-- Insert Locations
INSERT INTO locations (location_name, address, phone) VALUES
('المدخل الرئيسي', 'الشارع الرئيسي', '0501234567'),
('المدخل الخلفي', 'شارع المستودعات', '0502345678'),
('موقف السيارات', 'بجوار المبنى الإداري', '0503456789'),
('المستودع', 'المنطقة الصناعية', '0504567890');

-- Insert Employees (مع تجزئة كلمات المرور - استخدم bcrypt في الواقع)
-- كلمة المرور المشفرة: password123
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, password, shift_id, location_id, status, hire_date) VALUES
('EMP001', 'محمد علي', 'mohammed@company.com', '0505555555', 'مدير الأمن', 'الأمن', 'مدير', '$2b$10$YourHashedPasswordHere1', 1, 1, 'نشط', '2020-01-15'),
('EMP002', 'أحمد محمود', 'ahmed@company.com', '0506666666', 'مشرف الأمن', 'الأمن', 'مشرف', '$2b$10$YourHashedPasswordHere2', 1, 1, 'نشط', '2020-06-20'),
('EMP003', 'علي حسن', 'ali@company.com', '0507777777', 'رجل أمن', 'الأمن', 'رجل_أمن', '$2b$10$YourHashedPasswordHere3', 1, 1, 'نشط', '2021-03-10'),
('EMP004', 'سالم محمد', 'salem@company.com', '0508888888', 'رجل أمن', 'الأمن', 'رجل_أمن', '$2b$10$YourHashedPasswordHere4', 2, 1, 'نشط', '2021-05-05'),
('EMP005', 'خالد عبدالله', 'khaled@company.com', '0509999999', 'رجل أمن', 'الأمن', 'رجل_أمن', '$2b$10$YourHashedPasswordHere5', 2, 2, 'نشط', '2021-07-15'),
('EMP006', 'فهد ياسين', 'fahad@company.com', '05010000000', 'رجل أمن', 'الأمن', 'رجل_أمن', '$2b$10$YourHashedPasswordHere6', 3, 1, 'نشط', '2021-09-01'),
('EMP007', 'ناصر عمر', 'nasser@company.com', '05011111111', 'سائق', 'النقل', 'سائق', '$2b$10$YourHashedPasswordHere7', 1, 1, 'نشط', '2021-11-20'),
('EMP008', 'محسن إبراهيم', 'mohsen@company.com', '05012222222', 'سائق', 'النقل', 'سائق', '$2b$10$YourHashedPasswordHere8', 2, 1, 'نشط', '2022-01-10'),
('EMP009', 'عبدالرحمن علي', 'abdulrahman@company.com', '05013333333', 'رجل أمن', 'الأمن', 'رجل_أمن', '$2b$10$YourHashedPasswordHere9', 3, 2, 'نشط', '2022-03-05'),
('EMP010', 'عبدالعزيز حمد', 'abdulaziz@company.com', '05014444444', 'رجل أمن', 'الأمن', 'رجل_أمن', '$2b$10$YourHashedPasswordHere10', 1, 3, 'نشط', '2022-05-12');

-- Insert Vehicles
INSERT INTO vehicles (vehicle_id, plate_number, vehicle_type, model, year, fuel_level, status) VALUES
('VEH001', 'ج-ن-ب 1234', 'دورية', 'تويوتا كرولا', 2022, 85, 'بالخدمة'),
('VEH002', 'ج-ن-ب 1235', 'دورية', 'هيونداي إلنترا', 2023, 90, 'بالخدمة'),
('VEH003', 'ج-ن-ب 1236', 'شاحنة', 'تويوتا هايس', 2021, 70, 'بالخدمة'),
('VEH004', 'ج-ن-ب 1237', 'دورية', 'نيسان ألتيما', 2022, 45, 'بالخدمة'),
('VEH005', 'ج-ن-ب 1238', 'سيارة مديرة', 'BMW X5', 2023, 95, 'بالخدمة');

-- Insert Gates
INSERT INTO gates (gate_name, location_id, gate_number) VALUES
('بوابة المدخل الرئيسي', 1, 'G-001'),
('بوابة المدخل الخلفي', 2, 'G-002'),
('بوابة موقف السيارات', 3, 'G-003'),
('بوابة المستودع', 4, 'G-004');

-- Insert Permits
INSERT INTO permits (permit_number, person_name, person_type, phone, id_number, issue_date, expiry_date, status, issued_by) VALUES
('PRM001', 'أحمد العنزي', 'زائر', '0501111111', '1234567890', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'ساري', 1),
('PRM002', 'فاطمة الشمري', 'مورد', '0502222222', '1234567891', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'ساري', 1),
('PRM003', 'محمود الحربي', 'مقاول', '0503333333', '1234567892', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'ساري', 2),
('PRM004', 'نور الدين', 'زائر', '0504444444', '1234567893', CURDATE() - INTERVAL 30 DAY, CURDATE() - INTERVAL 5 DAY, 'منتهي', 1),
('PRM005', 'ليلى محمد', 'مورد', '0505555555', '1234567894', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'ساري', 2);

-- Insert Attendance Data
INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status) VALUES
(3, CURDATE(), '06:15:00', '14:10:00', 'حاضر'),
(4, CURDATE(), '14:05:00', '22:05:00', 'حاضر'),
(5, CURDATE(), '14:00:00', NULL, 'حاضر'),
(6, CURDATE(), '22:00:00', NULL, 'حاضر'),
(7, CURDATE(), '06:00:00', '14:30:00', 'حاضر'),
(8, CURDATE(), '14:00:00', NULL, 'حاضر'),
(9, CURDATE() - INTERVAL 1 DAY, '22:00:00', '06:00:00', 'حاضر'),
(10, CURDATE(), '06:00:00', NULL, 'حاضر'),
(3, CURDATE() - INTERVAL 1 DAY, '06:00:00', '14:00:00', 'حاضر'),
(4, CURDATE() - INTERVAL 1 DAY, '14:00:00', '22:00:00', 'حاضر');

-- Insert Person Access Log
INSERT INTO person_access_log (permit_id, person_name, person_type, access_type, access_result, gate_id, checked_by) VALUES
(1, 'أحمد العنزي', 'زائر', 'دخول', 'مسموح', 1, 3),
(2, 'فاطمة الشمري', 'مورد', 'دخول', 'مسموح', 1, 3),
(1, 'أحمد العنزي', 'زائر', 'خروج', 'مسموح', 1, 4),
(3, 'محمود الحربي', 'مقاول', 'دخول', 'مسموح', 2, 5),
(NULL, 'شخص غير معروف', 'زائر', 'دخول', 'مرفوض', 1, 3);

-- Insert Incidents
INSERT INTO incidents (incident_number, incident_type, severity, incident_date, incident_time, location_id, description, reported_by, status) VALUES
('INC001', 'محاولة دخول غير مصرح', 'عالية', CURDATE(), '14:30:00', 1, 'محاولة دخول شخص بدون تصريح من قبل بوابة المدخل الرئيسي', 3, 'مغلق'),
('INC002', 'تأخير في الحضور', 'منخفضة', CURDATE(), '06:45:00', 1, 'موظف تأخر 45 دقيقة عن موعد الحضور', 2, 'مغلق'),
('INC003', 'ضرر في السيارة', 'متوسطة', CURDATE(), '10:15:00', 3, 'تضرر زجاج السيارة رقم VEH001', 7, 'تحت_إجراء'),
('INC004', 'اختراق محاولة النظام', 'حرجة', CURDATE() - INTERVAL 1 DAY, '23:45:00', 1, 'محاولة اختراق نظام التحكم بالبوابة', 6, 'مفتوح'),
('INC005', 'فقدان مفتاح', 'متوسطة', CURDATE() - INTERVAL 2 DAY, '15:30:00', 2, 'فقدان مفتاح بوابة المدخل الخلفي', 5, 'مغلق');

-- Insert Operations Log
INSERT INTO operations_log (employee_id, operation_type, operation_details, operation_date) VALUES
(1, 'تسجيل دخول', 'دخول مسؤول الأمن إلى لوحة التحكم', NOW()),
(3, 'تسجيل حضور', 'حضور الموظف من البوابة الرئيسية', NOW() - INTERVAL 2 HOUR),
(2, 'إصدار تصريح', 'إصدار تصريح زيارة جديد', NOW() - INTERVAL 4 HOUR),
(4, 'تسجيل حادثة', 'تسجيل حادثة ضرر في السيارة', NOW() - INTERVAL 6 HOUR),
(1, 'تحديث بيانات', 'تحديث بيانات الموظف', NOW() - INTERVAL 8 HOUR),
(3, 'تسجيل خروج', 'خروج الموظف من البوابة الرئيسية', NOW() - INTERVAL 10 HOUR),
(5, 'تسجيل دخول', 'دخول الموظف من البوابة الجانبية', NOW() - INTERVAL 12 HOUR),
(2, 'مراجعة تقرير', 'مراجعة تقرير اليوم', NOW() - INTERVAL 14 HOUR),
(6, 'تسجيل حضور', 'حضور الموظف من البوابة الرئيسية', NOW() - INTERVAL 16 HOUR),
(1, 'تسجيل خروج', 'تسجيل خروج مسؤول الأمن', NOW() - INTERVAL 18 HOUR);

-- Insert Login Log
INSERT INTO login_log (employee_id, login_time, logout_time, ip_address, status) VALUES
(1, NOW() - INTERVAL 1 HOUR, NULL, '192.168.1.100', 'ناجح'),
(2, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, '192.168.1.101', 'ناجح'),
(3, NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 1 HOUR, '192.168.1.102', 'ناجح'),
(1, NOW() - INTERVAL 24 HOUR, NOW() - INTERVAL 23 HOUR, '192.168.1.100', 'ناجح'),
(4, NOW() - INTERVAL 2 HOUR, NULL, '192.168.1.103', 'ناجح');

-- Create Database
CREATE DATABASE IF NOT EXISTS security_management_system;
USE security_management_system;

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    role ENUM('مدير', 'مشرف', 'رجل_أمن', 'سائق') DEFAULT 'رجل_أمن',
    password VARCHAR(255) NOT NULL,
    shift_id INT,
    location_id INT,
    status ENUM('نشط', 'إجازة', 'منتهي_الخدمة') DEFAULT 'نشط',
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shifts Table
CREATE TABLE IF NOT EXISTS shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    model VARCHAR(100),
    year INT,
    fuel_level INT DEFAULT 100,
    odometer INT,
    status ENUM('بالخدمة', 'في_الصيانة', 'معطل') DEFAULT 'بالخدمة',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status ENUM('حاضر', 'غائب', 'متأخر', 'إجازة') DEFAULT 'غائب',
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_attendance (employee_id, attendance_date)
);

-- Permits Table
CREATE TABLE IF NOT EXISTS permits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    permit_number VARCHAR(50) UNIQUE NOT NULL,
    person_name VARCHAR(100) NOT NULL,
    person_type ENUM('موظف', 'زائر', 'مورد', 'مقاول') NOT NULL,
    phone VARCHAR(20),
    id_number VARCHAR(50),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('ساري', 'منتهي', 'ملغي') DEFAULT 'ساري',
    issued_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issued_by) REFERENCES employees(id)
);

-- Person Access Log Table
CREATE TABLE IF NOT EXISTS person_access_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    permit_id INT,
    person_name VARCHAR(100) NOT NULL,
    person_type VARCHAR(50),
    access_type ENUM('دخول', 'خروج') NOT NULL,
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_result ENUM('مسموح', 'مرفوض') DEFAULT 'مسموح',
    gate_id INT,
    checked_by INT,
    notes VARCHAR(255),
    FOREIGN KEY (permit_id) REFERENCES permits(id),
    FOREIGN KEY (checked_by) REFERENCES employees(id)
);

-- Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    severity ENUM('منخفضة', 'متوسطة', 'عالية', 'حرجة') DEFAULT 'متوسطة',
    incident_date DATE NOT NULL,
    incident_time TIME,
    location_id INT,
    description TEXT,
    reported_by INT,
    status ENUM('مفتوح', 'تحت_إجراء', 'مغلق') DEFAULT 'مفتوح',
    resolved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (reported_by) REFERENCES employees(id)
);

-- Operations Log Table
CREATE TABLE IF NOT EXISTS operations_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    operation_type VARCHAR(100) NOT NULL,
    operation_details TEXT,
    operation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Login Log Table
CREATE TABLE IF NOT EXISTS login_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    ip_address VARCHAR(45),
    status ENUM('ناجح', 'فاشل') DEFAULT 'ناجح',
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Gates Table
CREATE TABLE IF NOT EXISTS gates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gate_name VARCHAR(100) NOT NULL,
    location_id INT,
    gate_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Vehicle Maintenance Table
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    maintenance_type VARCHAR(100),
    maintenance_date DATE,
    description TEXT,
    cost DECIMAL(10, 2),
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Create Indexes
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_access_log_time ON person_access_log(access_time);
CREATE INDEX idx_operations_employee ON operations_log(employee_id);
CREATE INDEX idx_login_log_employee ON login_log(employee_id);

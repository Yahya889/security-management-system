USE security_management_system;

CREATE TABLE IF NOT EXISTS admin_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_by INT NOT NULL,
    reviewed_by INT,
    request_text VARCHAR(500) NOT NULL,
    status ENUM('نفذ', 'بانتظار_المراجعة', 'تمت_المراجعة', 'مرفوض') NOT NULL,
    result_message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id),
    FOREIGN KEY (reviewed_by) REFERENCES employees(id),
    INDEX idx_admin_requests_status_created (status, created_at)
);

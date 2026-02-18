const db = require('../config/db');

/**
 * Logs an administrative action to the database.
 * @param {number} adminId - ID of the admin performing the action
 * @param {string} action - Type of action (e.g., 'CREATE_USER')
 * @param {string} details - Additional details about the action
 * @param {string} ip - IP address of the admin
 */
function logAudit(adminId, action, details, ip) {
    try {
        db.prepare(
            'INSERT INTO audit_logs (admin_id, action, details, ip_address) VALUES (?, ?, ?, ?)'
        ).run(adminId, action, details, ip);
    } catch (error) {
        console.error('Audit Log Error:', error.message);
    }
}

module.exports = logAudit;

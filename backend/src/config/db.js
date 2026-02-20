const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');

let dbInstance = null;
let isPostgres = false;

if (process.env.DATABASE_URL) {
    isPostgres = true;
    dbInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    console.log('PostgreSQL bazasiga ulandi');
} else {
    // Lokal yoki Render disk (agar bo'lsa)
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'kitobxon.db');
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    console.log('SQLite bazasiga ulandi:', dbPath);
}

// Universal Wrapper
const db = {
    query: async (sql, params = []) => {
        if (isPostgres) {
            let i = 1;
            const pgSql = sql.replace(/\?/g, () => `$${i++}`);
            const res = await dbInstance.query(pgSql, params);
            return res.rows;
        } else {
            return dbInstance.prepare(sql).all(...params);
        }
    },
    get: async (sql, params = []) => {
        if (isPostgres) {
            let i = 1;
            const pgSql = sql.replace(/\?/g, () => `$${i++}`);
            const res = await dbInstance.query(pgSql, params);
            return res.rows[0];
        } else {
            return dbInstance.prepare(sql).get(...params);
        }
    },
    run: async (sql, params = []) => {
        if (isPostgres) {
            let i = 1;
            let pgSql = sql.replace(/\?/g, () => `$${i++}`);
            if (/^\s*INSERT/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
                pgSql += ' RETURNING id';
            }
            const res = await dbInstance.query(pgSql, params);
            return {
                changes: res.rowCount,
                lastInsertRowid: res.rows[0]?.id || 0
            };
        } else {
            return dbInstance.prepare(sql).run(...params);
        }
    },
    exec: async (sql) => {
        if (isPostgres) await dbInstance.query(sql);
        else dbInstance.exec(sql);
    },
    // Legacy support (SQLite only)
    prepare: (sql) => {
        if (isPostgres) throw new Error('PostgreSQL does not support synchronous prepare/run. Update code to use async db.query/get/run.');
        return dbInstance.prepare(sql);
    },
    transaction: (cb) => {
        // Simple transaction wrapper only for SQLite. Postgres needs explicit BEGIN/COMMIT.
        // For now, if Postgres, just execute callback (no trans). Risk accepted.
        if (isPostgres) return cb;
        return dbInstance.transaction(cb);
    }
};

module.exports = db;

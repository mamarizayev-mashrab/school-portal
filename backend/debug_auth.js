const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function debugAuth() {
    console.log('--- DIAGNOSTIC START ---');

    // 1. Check DB User
    try {
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get('super@admin.uz');
        if (!user) {
            console.error("❌ User 'super@admin.uz' NOT FOUND in database!");
        } else {
            console.log("✅ User found:", {
                id: user.id,
                email: user.email,
                role: user.role,
                hash_start: user.password_hash.substring(0, 10) + '...'
            });

            // 2. Verify Password
            const isMatch = await bcrypt.compare('super123', user.password_hash);
            console.log(`🔐 Password ('super123') match check: ${isMatch ? '✅ MATCH' : '❌ FAIL'}`);
        }
    } catch (err) {
        console.error("❌ DB Error:", err.message);
    }

    // 3. Test API Endpoint (fetch)
    console.log('\n--- TESTING API ENDPOINT ---');
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'super@admin.uz',
                password: 'super123'
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("Response Status:", response.status);
        const data = await response.json();

        if (response.ok) {
            console.log("✅ API Login Success!");
            console.log("Response Data:", {
                xabar: data.xabar,
                token: data.token ? 'PRESENT' : 'MISSING',
                user: data.user
            });
        } else {
            console.error("❌ API Login Failed:", data);
        }
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
    }
}

debugAuth();

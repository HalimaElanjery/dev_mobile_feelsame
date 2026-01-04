const { query, end } = require('../src/config/database');

async function debug() {
    try {
        console.log('--- DEBUG START ---');

        // 1. Get current user ID by email (replace with your email)
        const email = 'elanjeryhalima2003@gmail.com';
        const users = await query('SELECT id, email, firebase_uid FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            console.log('❌ User not found with email:', email);

            // List all users to see what exists
            const allUsers = await query('SELECT id, email FROM users LIMIT 5');
            console.log('📋 Existing users:', allUsers);
            return;
        }

        const user = users[0];
        console.log('USER:', JSON.stringify(user));

        // 2. Check ALL private discussions
        const discussions = await query('SELECT * FROM private_discussions');
        console.log('TOTAL DISCUSSIONS:', discussions.length);

        if (discussions.length > 0) {
            console.log('FIRST 3 DISCUSSIONS:');
            discussions.slice(0, 3).forEach(d => {
                console.log(JSON.stringify({
                    id: d.id,
                    user1: d.user1_id,
                    user2: d.user2_id,
                    isActive: d.is_active,
                    expires: d.expires_at,
                    isMatchUser1: d.user1_id === user.id,
                    isMatchUser2: d.user2_id === user.id
                }));
            });
        }

        // 3. Check for Pending Match Requests
        const requests = await query('SELECT * FROM match_requests WHERE from_user_id = ? OR to_user_id = ?', [user.id, user.id]);
        console.log('MATCH REQUESTS COUNT:', requests.length);
        console.log('REQUESTS:', JSON.stringify(requests));

        // 4. AUTO-ACCEPT PENDING REQUESTS (FOR DEBUG/TESTING)
        console.log('--- AUTO-ACCEPTING PENDING REQUESTS ---');

        // Find pending requests involving this user
        const pendingRequests = await query(
            'SELECT * FROM match_requests WHERE (from_user_id = ? OR to_user_id = ?) AND status = "pending"',
            [user.id, user.id]
        );

        console.log(`Found ${pendingRequests.length} pending requests to force-accept.`);

        for (const req of pendingRequests) {
            console.log(`Processing request ${req.id}...`);

            // 1. Update status
            await query('UPDATE match_requests SET status = "accepted" WHERE id = ?', [req.id]);

            // 2. Create discussion
            const { generateUUID } = require('../src/config/database');
            const discussionId = generateUUID();
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

            await query(
                'INSERT INTO private_discussions (id, user1_id, user2_id, note_id, expires_at, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
                [discussionId, req.from_user_id, req.to_user_id, req.note_id, expiresAt]
            );

            console.log(`✅ Created discussion ${discussionId} for request ${req.id}`);
        }


    } catch (error) {
        console.error('Debug error:', error);
    } finally {
        // end(); // Don't close pool if running within app context, but here standalone is fine? 
        // actually better not to call end() if we want to run script easily without hanging
        process.exit(0);
    }
}

debug();

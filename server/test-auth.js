import 'dotenv/config';

const BASE = 'http://localhost:3001/api';

async function test(label, fn) {
  try {
    const result = await fn();
    console.log(`✅ ${label}:`, JSON.stringify(result).slice(0, 140));
    return result;
  } catch (e) {
    console.log(`❌ ${label}:`, e.message);
    return null;
  }
}

async function run() {
  // 1. Health
  await test('Health check', async () => {
    const r = await fetch(`${BASE}/health`);
    return r.json();
  });

  // 2. Register a new citizen
  const reg = await test('Register citizen', async () => {
    const r = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: `test${Date.now()}@test.com`, phone: '9999999999', password: 'test123' })
    });
    return r.json();
  });

  const token = reg?.token;
  if (!token) { console.log('No token, aborting'); return; }

  // 3. /me endpoint
  await test('GET /me', async () => {
    const r = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    return r.json();
  });

  // 4. Login as management
  const login = await test('Login management (Priya)', async () => {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya@example.com', password: 'password123' })
    });
    return r.json();
  });
  const mgmtToken = login?.token;

  // 5. Citizen lists their complaints (should be empty for new user)
  await test('Citizen GET /complaints (own only)', async () => {
    const r = await fetch(`${BASE}/complaints`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    return Array.isArray(data) ? `${data.length} complaints` : data;
  });

  // 6. Management lists all complaints
  await test('Management GET /complaints (all)', async () => {
    const r = await fetch(`${BASE}/complaints`, { headers: { Authorization: `Bearer ${mgmtToken}` } });
    const data = await r.json();
    return Array.isArray(data) ? `${data.length} complaints` : data;
  });

  // 7. Citizen tries status change - should 403
  await test('Citizen PATCH /status -> expect 403', async () => {
    const r = await fetch(`${BASE}/complaints/fake-id/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' })
    });
    return { httpStatus: r.status };
  });

  // 8. No token - expect 401
  await test('No token GET /complaints -> expect 401', async () => {
    const r = await fetch(`${BASE}/complaints`);
    return { httpStatus: r.status };
  });

  // 9. Wrong password - expect 401
  await test('Wrong password login -> expect 401', async () => {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya@example.com', password: 'wrongpassword' })
    });
    return { httpStatus: r.status, ...(await r.json()) };
  });

  console.log('\n✨ All tests complete!');
}

run().catch(console.error).finally(() => process.exit(0));

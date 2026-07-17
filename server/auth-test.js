async function main() {
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@skillnova.com', password: 'Admin#2026', rememberMe: true }),
    credentials: 'include',
  });

  const loginBody = await loginRes.text();
  const loginCookies = loginRes.headers.get('set-cookie') ? [loginRes.headers.get('set-cookie')] : [];
  console.log('LOGIN COOKIES:', loginCookies);
  console.log('LOGIN BODY:', loginBody);

  const parsed = JSON.parse(loginBody);
  const challengeToken = parsed.challengeToken;
  const devCode = parsed.devCode;
  console.log('challengeToken length', challengeToken.length);
  const { fileURLToPath, pathToFileURL } = await import('node:url');
  const { verifyAccessToken } = await import(pathToFileURL('./src/utils/auth.js').href);
  try {
    const payload = verifyAccessToken(challengeToken);
    console.log('challenge payload', payload);
  } catch (err) {
    console.error('challenge verify failed', err.message);
  }
  const cookieHeader = loginCookies.map((c) => c.split(';')[0]).join('; ');

  const verifyRes = await fetch('http://localhost:4000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ challengeToken, code: devCode }),
    credentials: 'include',
  });

  const verifyBody = await verifyRes.text();
  const verifyCookies = verifyRes.headers.get('set-cookie') ? [verifyRes.headers.get('set-cookie')] : [];
  console.log('VERIFY STATUS:', verifyRes.status);
  console.log('VERIFY SET-COOKIE:', verifyCookies);
  console.log('VERIFY BODY:', verifyBody);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

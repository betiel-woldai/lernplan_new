import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, passkey } = req.body;

    // Validate credentials against environment variables
    const validUsername = process.env.FEEDBACK_ADMIN_USERNAME;
    const validPasskey = process.env.FEEDBACK_ADMIN_PASSKEY;

    if (username === validUsername && passkey === validPasskey) {
      // Create session cookie (expires in 1 hour)
      const cookie = serialize('lernplan-admin-session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      res.setHeader('Set-Cookie', cookie);
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

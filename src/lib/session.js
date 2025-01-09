'use server';

import { cookies } from 'next/headers';
import * as crypto from 'crypto';
const ALGORITHM = 'aes256';
const SESSION_NAME = 'USER_SESSION';
const { ENCRYPTION_KEY } = process.env;
const FAKE_IV = 'abcdefghijklmnop';

function encryptJson(json) {
  const text = JSON.stringify(json);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, FAKE_IV);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decryptJson(encrypted) {
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, FAKE_IV);
  const d = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  return JSON.parse(d);
}

export async function setSession(data) {
  const encryptedSessionData = encryptJson(data);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_NAME, encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(SESSION_NAME);
  if (!encrypted) {
    return null;
  }
  return decryptJson(encrypted.value);
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}

require('dotenv').config();
const express = require('express');

// ── WEB PUSH (sin dependencia externa) ───────────────────────────────────────
// Implementación manual de Web Push usando crypto nativo de Node.js
const { createECDH, createSign, randomBytes, createCipheriv } = require('crypto');
const https = require('https');
const url = require('url');

const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  || 'BGXVsTmH4dCRzJk2vPoqMX08DtwH_EBk2fF42nIQGfubO9utSacLfZxCF4wTBQxDrH50S_8aZuUg5oKppHqF51A';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'uLGKx8F9YsP0gqhVqFuT_MKepxPBOQrjEX0bdnGxAoY';
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT     || 'mailto:coach@wolfmindset.com';

function b64urlToBuffer(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64');
}
function bufferToB64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sendWebPush(subscription, payload) {
  try {
    const endpoint = subscription.endpoint;
    const parsedUrl = new url.URL(endpoint);
    const audience = parsedUrl.origin;

    // Build VAPID JWT header + claims
    const header = bufferToB64url(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
    const now = Math.floor(Date.now() / 1000);
    const claims = bufferToB64url(Buffer.from(JSON.stringify({
      aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT
    })));
    const sigInput = `${header}.${claims}`;

    // Sign with VAPID private key
    const privKeyDer = Buffer.concat([
      Buffer.from('308141020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420', 'hex'),
      b64urlToBuffer(VAPID_PRIVATE_KEY)
    ]);

    const sign = createSign('SHA256');
    sign.update(sigInput);
    const sigDer = sign.sign({ key: privKeyDer, format: 'der', type: 'pkcs8', dsaEncoding: 'ieee-p1363' });
    const jwt = `${sigInput}.${bufferToB64url(sigDer)}`;

    // Encrypt payload using ECDH + AES-128-GCM (RFC 8291)
    const authBuf  = b64urlToBuffer(subscription.keys.auth);
    const p256dhBuf = b64urlToBuffer(subscription.keys.p256dh);
    const payloadBuf = Buffer.from(JSON.stringify(payload));
    const salt = randomBytes(16);
    const serverECDH = createECDH('prime256v1');
    serverECDH.generateKeys();
    const serverPublicKey = serverECDH.getPublicKey();
    const sharedSecret = serverECDH.computeSecret(p256dhBuf);

    // HKDF helpers
    function hkdfExtract(salt, ikm) {
      const { createHmac } = require('crypto');
      return createHmac('sha256', salt).update(ikm).digest();
    }
    function hkdfExpand(prk, info, len) {
      const { createHmac } = require('crypto');
      let t = Buffer.alloc(0), okm = Buffer.alloc(0);
      for(let i = 1; okm.length < len; i++) {
        t = createHmac('sha256', prk).update(Buffer.concat([t, info, Buffer.from([i])])).digest();
        okm = Buffer.concat([okm, t]);
      }
      return okm.slice(0, len);
    }

    const prk = hkdfExtract(authBuf, sharedSecret);
    const keyInfo = Buffer.concat([
      Buffer.from('Content-Encoding: aes128gcm

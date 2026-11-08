import crypto from 'crypto';

type ApiRequest = any;
type ApiResponse = any;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, userId, email, name } = req.body || {};

  if (!plan || !userId || !email) {
    return res.status(400).json({ error: 'Parameter tidak lengkap (plan, userId, email wajib diisi)' });
  }

  const clientId = process.env.DOKU_CLIENT_ID || 'BRN-0235-1794176848448';
  const secretKey = process.env.DOKU_SECRET_KEY || 'SK-8dhVykiMtt83hTM6mPTG';
  const isProduction = process.env.DOKU_IS_PRODUCTION !== 'false';

  const amount = plan === 'yearly' ? 45000 : 5000;
  const planName = plan === 'yearly' ? 'Kei Pro - Paket Tahunan (365 Hari)' : 'Kei Pro - Paket Bulanan (30 Hari)';
  const invoiceNumber = `INV-KEIPRO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const baseUrl = isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
  const targetPath = '/checkout/v1/payment';

  const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const requestId = crypto.randomUUID();

  const payload = {
    order: {
      amount,
      invoice_number: invoiceNumber,
      currency: 'IDR',
      callback_url: 'https://kalembur.vercel.app',
      line_items: [
        {
          name: planName,
          price: amount,
          quantity: 1,
        },
      ],
    },
    payment: {
      payment_due_date: 60, // 60 menit batas bayar
    },
    customer: {
      id: userId,
      name: name || 'Pengguna Kei Pro',
      email: email,
    },
    additional_info: {
      user_id: userId,
      plan: plan,
    },
  };

  const bodyString = JSON.stringify(payload);

  // 1. Generate SHA-256 Digest in Base64
  const digest = crypto.createHash('sha256').update(bodyString).digest('base64');

  // 2. Generate Signature Component String
  const componentString =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${targetPath}\n` +
    `Digest:${digest}`;

  // 3. Compute HMAC-SHA256 with DOKU Secret Key
  const hmac = crypto.createHmac('sha256', secretKey).update(componentString).digest('base64');
  const signature = `HMACSHA256=${hmac}`;

  try {
    const dokuRes = await fetch(`${baseUrl}${targetPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': signature,
      },
      body: bodyString,
    });

    const dokuData = await dokuRes.json();

    if (!dokuRes.ok || !dokuData?.response?.payment?.url) {
      console.error('DOKU API Error:', dokuData);
      return res.status(400).json({
        error: dokuData?.error?.message || dokuData?.message || 'Gagal memproses pembayaran DOKU',
        details: dokuData,
      });
    }

    return res.status(200).json({
      success: true,
      paymentUrl: dokuData.response.payment.url,
      invoiceNumber,
    });
  } catch (error: any) {
    console.error('DOKU Gateway Exception:', error);
    return res.status(500).json({
      error: 'Terjadi gangguan saat menghubungkan ke gateway DOKU: ' + error.message,
    });
  }
}

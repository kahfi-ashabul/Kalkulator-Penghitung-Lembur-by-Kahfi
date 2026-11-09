import { createClient } from '@supabase/supabase-js';

type ApiRequest = any;
type ApiResponse = any;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const notification = req.body || {};
  console.log('Received DOKU Notification:', JSON.stringify(notification));

  const transactionStatus =
    notification?.transaction?.status || notification?.transaction_status || notification?.status;

  const isSuccess =
    transactionStatus === 'SUCCESS' ||
    transactionStatus === '0000' ||
    transactionStatus === 'COMPLETED';

  if (!isSuccess) {
    console.log('Payment not yet successful, status:', transactionStatus);
    return res.status(200).send('OK');
  }

  // Ambil user ID dan jenis paket
  const targetUserId =
    notification?.additional_info?.user_id ||
    notification?.customer?.id;

  const selectedPlan =
    notification?.additional_info?.plan || 'monthly';

  if (!targetUserId) {
    console.error('Missing target user ID in DOKU notification payload');
    return res.status(200).send('OK (User ID missing)');
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Environment variables for Supabase are not configured');
    return res.status(500).send('Server misconfiguration');
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

  const durationDays = selectedPlan === 'yearly' ? 365 : 30;
  const newExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_pro: true,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (error) {
      console.error('Error updating profiles table in Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Successfully upgraded user ${targetUserId} to PRO until ${newExpiresAt}`);
    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('Exception updating Supabase:', err);
    return res.status(500).send('Error');
  }
}

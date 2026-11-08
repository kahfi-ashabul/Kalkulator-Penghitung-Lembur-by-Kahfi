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

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ohljgtdhcexspfzgpict.supabase.co';
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obGpndGRoY2V4c3BmemdwaWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDE0ODY1NCwiZXhwIjoyMTA5NzI0NjU0fQ.2wjlyF1aHaMs5CULt4eNP8TQQtEVYh8VYSJkwoE4EZo';

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

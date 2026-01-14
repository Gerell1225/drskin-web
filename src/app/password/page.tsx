'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button, Stack, TextField, Typography, Alert } from '@mui/material';

export default function PasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setAllowed(!!data.session);
      setReady(true);
    };
    init();
  }, []);

  const onUpdate = async () => {
    setMsg(null);
    if (p1.length < 6) return setMsg('Нууц үг хамгийн багадаа 6 тэмдэгт.');
    if (p1 !== p2) return setMsg('Нууц үг давталт таарахгүй байна.');

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: p1 });
    setLoading(false);

    if (error) return setMsg('Алдаа гарлаа. Линк хугацаа дууссан байж магадгүй.');

    setMsg('Амжилттай шинэчлэгдлээ. Login руу орно уу.');
  };

  if (!ready) return null;

  if (!allowed) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 420, mx: 'auto', mt: 8, px: 2 }}>
        <Alert severity="warning">
          Энэ хуудас руу зөвхөн имэйлээр ирсэн сэргээх линкээр орж болно.
        </Alert>
        <Button variant="contained" onClick={() => router.replace('/login')}>
          Login руу буцах
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 420, mx: 'auto', mt: 8, px: 2 }}>
      <Typography variant="h6">Нууц үг шинэчлэх</Typography>

      <TextField
        label="Шинэ нууц үг"
        type="password"
        size="small"
        fullWidth
        value={p1}
        onChange={(e) => setP1(e.target.value)}
      />
      <TextField
        label="Шинэ нууц үг давтах"
        type="password"
        size="small"
        fullWidth
        value={p2}
        onChange={(e) => setP2(e.target.value)}
      />

      {msg && <Alert severity="info">{msg}</Alert>}

      <Button variant="contained" disabled={loading} onClick={onUpdate}>
        {loading ? 'Шинэчилж байна…' : 'Нууц үг шинэчлэх'}
      </Button>
    </Stack>
  );
}

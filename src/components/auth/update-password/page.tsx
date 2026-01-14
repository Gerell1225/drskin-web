'use client';

import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { supabase } from '@/lib/supabaseClient';

const UpdatePasswordPage: React.FC = () => {
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [hasSession, setHasSession] = React.useState(false);

  const [password1, setPassword1] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('getUser error on update-password:', error);
        setHasSession(false);
      } else {
        setHasSession(!!data.user);
      }
      setLoadingUser(false);
    };
    init();
  }, []);

  const handleChangePassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password1 || password1.length < 6) {
      setErrorMsg('Нууц үг дор хаяж 6 тэмдэгт байх ёстой.');
      return;
    }
    if (password1 !== password2) {
      setErrorMsg('Нууц үг хоорондоо таарахгүй байна.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password1,
      });

      if (error) {
        console.error('updateUser (password) error:', error);
        setErrorMsg(
          'Нууц үг солиход алдаа гарлаа. Холбоосын хугацаа дууссан байж магадгүй.',
        );
        return;
      }

      setSuccessMsg(
        'Нууц үг амжилттай солигдлоо. Одоо шинэ нууц үгээ ашиглан нэвтэрч болно.',
      );
      setPassword1('');
      setPassword2('');
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Typography align="center">Ачаалж байна…</Typography>
        </Container>
      </Box>
    );
  }

  if (!hasSession) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Холбоосын алдаа
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Нууц үг сэргээх холбоос буруу эсвэл хугацаа нь дууссан байна.
                Дахин &quot;Нууц үг сэргээх&quot; хүсэлт илгээнэ үү.
              </Typography>
              <Button
                href="/"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none', borderRadius: 999 }}
              >
                Нүүр хуудас руу буцах
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Шинэ нууц үг тохируулах
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Шинэ нууц үгээ оруулаад баталгаажуулна уу.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Шинэ нууц үг"
                type="password"
                size="small"
                fullWidth
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
              />
              <TextField
                label="Шинэ нууц үг давтах"
                type="password"
                size="small"
                fullWidth
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />

              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              {successMsg && <Alert severity="success">{successMsg}</Alert>}

              <Button
                variant="contained"
                color="primary"
                sx={{
                  mt: 1,
                  textTransform: 'none',
                  borderRadius: 999,
                  py: 1,
                }}
                onClick={handleChangePassword}
                disabled={saving}
              >
                {saving ? 'Хадгалж байна…' : 'Нууц үг солих'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UpdatePasswordPage;

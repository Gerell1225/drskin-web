'use client';

import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Status = 'checking' | 'ready' | 'success' | 'error';

const UpdatePasswordPage: React.FC = () => {
  const router = useRouter();

  const [status, setStatus] = React.useState<Status>('checking');
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      setStatus('checking');
      setErrorMsg(null);

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error('No valid recovery session:', error);
        setErrorMsg(
          'Нууц үг шинэчлэх линк буруу эсвэл хугацаа нь дууссан байна. Дахин нууц үг сэргээх хүсэлт илгээнэ үү.',
        );
        setStatus('error');
        return;
      }

      if (typeof window !== 'undefined' && window.location.hash) {
        const url = new URL(window.location.href);
        url.hash = '';
        window.history.replaceState({}, '', url.toString());
      }

      setStatus('ready');
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || password.length < 6) {
      setErrorMsg('Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой.');
      return;
    }

    if (password !== password2) {
      setErrorMsg('Нууц үг хоёр хоорондоо таарахгүй байна.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('Update password error:', error);
        setErrorMsg(
          'Нууц үг шинэчлэхэд алдаа гарлаа. Линкний хугацаа дууссан байж магадгүй. Дахин оролдоно уу.',
        );
        setStatus('error');
        return;
      }

      setStatus('success');
      setPassword('');
      setPassword2('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Нууц үг шинэчлэх
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Шинэ нууц үгээ оруулж баталгаажуулна уу.
            </Typography>

            {status === 'checking' && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <CircularProgress size={28} />
              </Box>
            )}

            {status !== 'checking' && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  {status === 'success' && (
                    <Alert severity="success">
                      Нууц үг амжилттай шинэчлэгдлээ. Одоо шинэ нууц үгээрээ нэвтэрч орж болно.
                    </Alert>
                  )}

                  {status === 'error' && errorMsg && (
                    <Alert severity="error">{errorMsg}</Alert>
                  )}

                  {status !== 'success' && (
                    <>
                      <TextField
                        label="Шинэ нууц үг"
                        type="password"
                        size="small"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <TextField
                        label="Шинэ нууц үг давтах"
                        type="password"
                        size="small"
                        fullWidth
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{
                          mt: 1,
                          borderRadius: 999,
                          textTransform: 'none',
                          py: 1,
                        }}
                      >
                        {loading ? 'Шинэчилж байна...' : 'Нууц үг шинэчлэх'}
                      </Button>
                    </>
                  )}

                  {status === 'success' && (
                    <Button
                      variant="outlined"
                      sx={{
                        mt: 1,
                        borderRadius: 999,
                        textTransform: 'none',
                      }}
                      onClick={() => router.push('/')}
                    >
                      Нүүр хуудас руу буцах
                    </Button>
                  )}
                </Stack>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UpdatePasswordPage;

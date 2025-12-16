// src/components/auth/LoginDialog.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailPassword,
  signUpWithEmail,
  resetPassword,
} from '@/lib/auth';

type Props = {
  open: boolean;
  onClose: () => void;
  onLoggedIn?: () => void;
};

type Mode = 'login' | 'signup' | 'reset';

// 🔧 Map Supabase raw error messages -> nice Mongolian text
function mapAuthErrorMessage(raw: string | undefined, mode: Mode): string {
  const msg = raw || '';

  // Rate limit (the one you're seeing)
  if (msg.includes('For security purposes, you can only request this after')) {
    if (mode === 'reset') {
      return 'Нууц үг сэргээх хүсэлт хэдхэн мөчийн өмнө илгээгдсэн. Дахин илгээхийн тулд бага зэрэг хүлээнэ үү.';
    }
    // login / signup
    return 'Та хэсэг хугацааны дараа дахин оролдоно уу.';
  }

  // Common auth messages we can make nicer
  if (msg.includes('Invalid login credentials')) {
    return 'Имэйл эсвэл нууц үг буруу байна.';
  }

  if (msg.toLowerCase().includes('email rate limit exceeded')) {
    return 'Имэйл илгээх хязгаарт хүрлээ. Та хэсэг хугацааны дараа дахин оролдоно уу.';
  }

  if (msg.toLowerCase().includes('user already registered')) {
    return 'Энэ имэйлээр аль хэдийн бүртгэгдсэн байна. Нэвтэрч оролдоно уу.';
  }

  // Fallback: generic Mongolian text, don’t show raw English
  return 'Үйлдэл гүйцэтгэхэд алдаа гарлаа. Та хэсэг хугацааны дараа дахин оролдоно уу.';
}

const LoginDialog: React.FC<Props> = ({ open, onClose, onLoggedIn }) => {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const resetState = () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    resetState();
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    // Admin shortcut
    if (mode === 'login' && email.trim() === 'admin' && password === 'admin') {
      onClose();
      router.push('/admin');
      return;
    }

    setLoading(true);
    const { error } = await signInWithEmailPassword(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(mapAuthErrorMessage(error.message, 'login'));
    } else {
      if (onLoggedIn) onLoggedIn();
      onClose();
    }
  };

  const handleSignUp = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Нэрээ оруулна уу.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Имэйл хаягаа оруулна уу.');
      return;
    }
    if (!password) {
      setErrorMsg('Нууц үгээ оруулна уу.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Нууц үг дор хаяж 6 тэмдэгт байх ёстой.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Нууц үг хоорондоо таарахгүй байна.');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail({
      email,
      password,
      fullName,
      phone,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(mapAuthErrorMessage(error.message, 'signup'));
      return;
    }

    // Автомат нэвтрэх оролдоно
    setLoading(true);
    const { error: loginError } = await signInWithEmailPassword(
      email,
      password,
    );
    setLoading(false);

    if (loginError) {
      setInfoMsg('Бүртгэл амжилттай. Нэвтрэх хэсгээр оролдоно уу.');
      setMode('login');
    } else {
      if (onLoggedIn) onLoggedIn();
      onClose();
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim()) {
      setErrorMsg('Имэйл хаягаа оруулна уу.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setErrorMsg(mapAuthErrorMessage(error.message, 'reset'));
    } else {
      setInfoMsg(
        'Нууц үг сэргээх холбоос таны имэйл рүү илгээгдлээ. Хэсэг хугацааны дараа имэйлээ шалгана уу.',
      );
    }
  };

  const handlePrimaryAction = async () => {
    if (mode === 'login') return handleLogin();
    if (mode === 'signup') return handleSignUp();
    if (mode === 'reset') return handleResetPassword();
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const title =
    mode === 'login'
      ? 'Нэвтрэх'
      : mode === 'signup'
        ? 'Бүртгүүлэх'
        : 'Нууц үг сэргээх';

  const primaryLabel =
    mode === 'login'
      ? 'Нэвтрэх'
      : mode === 'signup'
        ? 'Бүртгүүлэх'
        : 'Линк илгээх';

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} mt={1}>
          {/* SIGN UP extra fields */}
          {mode === 'signup' && (
            <>
              <TextField
                label="Нэр"
                fullWidth
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                label="Утас"
                fullWidth
                size="small"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}

          {/* Email */}
          <TextField
            label="Имэйл"
            type="email"
            fullWidth
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password fields (not in reset mode) */}
          {mode !== 'reset' && (
            <>
              <TextField
                label="Нууц үг"
                type="password"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {mode === 'signup' && (
                <TextField
                  label="Нууц үг (дахин)"
                  type="password"
                  fullWidth
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}

              {mode === 'login' && (
                <Typography
                  variant="caption"
                  sx={{
                    alignSelf: 'flex-end',
                    cursor: 'pointer',
                    color: 'primary.main',
                  }}
                  onClick={() => changeMode('reset')}
                >
                  Нууц үг мартсан?
                </Typography>
              )}
            </>
          )}

          {/* Messages */}
          {errorMsg && (
            <Typography variant="caption" color="error">
              {errorMsg}
            </Typography>
          )}
          {infoMsg && (
            <Typography variant="caption" color="primary">
              {infoMsg}
            </Typography>
          )}

          {mode === 'login' && (
            <Typography variant="caption" color="text.secondary">
              Энгийн хэрэглэгчид имэйл, нууц үгээр нэвтрэнэ.
              <br />
              Туршилтын админ нэвтрэх: <strong>admin / admin</strong>
            </Typography>
          )}

          {/* Mode switch */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 1 }}
          >
            {mode === 'login' && (
              <Typography variant="caption" color="text.secondary">
                Бүртгэлгүй юу?{' '}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => changeMode('signup')}
                >
                  Бүртгүүлэх
                </Typography>
              </Typography>
            )}

            {mode === 'signup' && (
              <Typography variant="caption" color="text.secondary">
                Аль хэдийн бүртгэлтэй?{' '}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => changeMode('login')}
                >
                  Нэвтрэх
                </Typography>
              </Typography>
            )}

            {mode === 'reset' && (
              <Typography variant="caption" color="text.secondary">
                Санаж авсан уу?{' '}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => changeMode('login')}
                >
                  Нэвтрэх рүү буцах
                </Typography>
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          Болих
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrimaryAction}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          {loading ? 'Түр хүлээнэ үү…' : primaryLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;

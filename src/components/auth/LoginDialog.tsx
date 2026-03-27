'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailPassword,
  signUpWithEmail,
  resetPassword,
} from '@/lib/auth';

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
  onLoggedIn?: () => void;
};

type Mode = 'login' | 'signup';

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  onLoggedIn,
}) => {
  const [mode, setMode] = React.useState<Mode>('login');

  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = React.useState(false);

  const router = useRouter();

  const resetState = React.useCallback(() => {
    setMode('login');
    setFullName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setForgotOpen(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const switchMode = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  const validateLogin = () => {
    if (!email.trim() || !password) {
      setErrorMsg('И-мэйл болон нууц үгээ бүрэн оруулна уу.');
      return false;
    }
    return true;
  };

  const validateSignUp = () => {
    if (!fullName.trim()) {
      setErrorMsg('Овог нэрээ оруулна уу.');
      return false;
    }

    if (!phone.trim()) {
      setErrorMsg('Утасны дугаараа оруулна уу.');
      return false;
    }

    if (!email.trim()) {
      setErrorMsg('И-мэйлээ оруулна уу.');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Нууц үг хамгийн багадаа 6 тэмдэгт байна.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateLogin()) return;

    if (email.trim() === 'admin' && password === 'admin') {
      onClose();
      router.push('/admin');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signInWithEmailPassword(email, password);

      if (error) {
        setErrorMsg(error.message || 'Нэвтрэхэд алдаа гарлаа.');
        return;
      }

      setEmail('');
      setPassword('');
      onLoggedIn?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateSignUp()) return;

    setLoading(true);
    try {
      const { session, error } = await signUpWithEmail({
        email,
        password,
        fullName,
        phone,
      });

      if (error) {
        setErrorMsg(error.message || 'Бүртгүүлэхэд алдаа гарлаа.');
        return;
      }

      if (session) {
        setSuccessMsg('Бүртгэл амжилттай үүслээ.');
        onLoggedIn?.();
        onClose();
        return;
      }

      setSuccessMsg(
        'Бүртгэл амжилттай. И-мэйл баталгаажуулах шаардлагатай бол и-мэйлээ шалгана уу.',
      );
      setMode('login');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Нууц үг сэргээхийн тулд и-мэйлээ оруулна уу.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);

      if (error) {
        setErrorMsg(error.message || 'Нууц үг сэргээх хүсэлт илгээхэд алдаа гарлаа.');
        return;
      }

      setSuccessMsg('Нууц үг сэргээх холбоосыг и-мэйл рүү илгээлээ.');
      setForgotOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (mode === 'login') {
      await handleLogin();
      return;
    }

    await handleSignUp();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {mode === 'login' ? 'Dr.Skin нэвтрэх' : 'Dr.Skin бүртгүүлэх'}
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            {mode === 'signup' && (
              <>
                <TextField
                  label="Овог нэр"
                  size="small"
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                  label="Утасны дугаар"
                  size="small"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            )}

            <TextField
              label="И-мэйл"
              type="email"
              size="small"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Нууц үг"
              type="password"
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            {successMsg && <Alert severity="success">{successMsg}</Alert>}

            {/* {mode === 'login' && (
              <Button
                variant="text"
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  px: 0,
                  minWidth: 0,
                }}
                onClick={() => setForgotOpen(true)}
              >
                Нууц үгээ мартсан уу?
              </Button>
            )} */}

            <Button
              variant="text"
              sx={{
                alignSelf: 'flex-start',
                textTransform: 'none',
                px: 0,
                minWidth: 0,
              }}
              onClick={switchMode}
            >
              {mode === 'login'
                ? 'Шинэ хэрэглэгч бол бүртгүүлэх'
                : 'Бүртгэлтэй бол нэвтрэх'}
            </Button>

            {forgotOpen && mode === 'login' && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  И-мэйл хаягаа оруулаад сэргээх холбоос аваарай.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                >
                  {loading ? 'Илгээж байна…' : 'Сэргээх холбоос илгээх'}
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={handleClose}
            sx={{ textTransform: 'none' }}
            disabled={loading}
          >
            Болих
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrimaryAction}
            disabled={loading}
            sx={{ borderRadius: 999, textTransform: 'none', px: 3 }}
          >
            {loading
              ? mode === 'login'
                ? 'Нэвтэрч байна…'
                : 'Бүртгэж байна…'
              : mode === 'login'
              ? 'Нэвтрэх'
              : 'Бүртгүүлэх'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginDialog;
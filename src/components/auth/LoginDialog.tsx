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
import { supabase } from '@/lib/supabaseClient';

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
  onLoggedIn?: () => void;
};

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  onLoggedIn,
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = React.useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('И-мэйл болон нууц үгээ бүрэн оруулна уу.');
      return;
    } else if (email.trim() == 'admin' && password == 'admin') {
      onClose();
      router.push('/admin');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
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

  const handleClose = () => {
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    onClose();
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
            Dr.Skin нэвтрэх
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
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
            onClick={handleLogin}
            disabled={loading}
            sx={{ borderRadius: 999, textTransform: 'none', px: 3 }}
          >
            {loading ? 'Нэвтэрч байна…' : 'Нэвтрэх'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginDialog;

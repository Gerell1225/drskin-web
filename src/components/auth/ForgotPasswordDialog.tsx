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
} from '@mui/material';
import { supabase } from '@/lib/supabaseClient';

type ForgotPasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  open,
  onClose,
}) => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSendReset = async () => {
    resetMessages();

    if (!email.trim()) {
      setErrorMsg('Имэйл хаягаа оруулна уу.');
      return;
    }

    setLoading(true);
    try {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:3000');

      const redirectTo = `${origin}/auth/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo,
        },
      );

      if (error) {
        console.error('resetPasswordForEmail error:', error);
        setErrorMsg(
          'Нууц үг сэргээх имэйл илгээхэд алдаа гарлаа. Та дахин оролдоно уу.',
        );
        return;
      }

      setSuccessMsg(
        'Нууц үг сэргээх линк таны имэйл рүү амжилттай илгээгдлээ. Хэдхэн минутын дотор шалгана уу.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    resetMessages();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Нууц үг сэргээх</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Та Dr.Skin аккаунтад бүртгэлтэй имэйл хаягаа оруулна уу. Бид нууц үг
            сэргээх линкийг таны имэйл рүү илгээнэ.
          </Typography>

          <TextField
            label="Имэйл хаяг"
            type="email"
            size="small"
            fullWidth
            value={email}
            onChange={(e) => {
              resetMessages();
              setEmail(e.target.value);
            }}
          />

          {errorMsg && (
            <Typography variant="caption" color="error">
              {errorMsg}
            </Typography>
          )}
          {successMsg && (
            <Typography variant="caption" sx={{ color: 'success.main' }}>
              {successMsg}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Болих
        </Button>
        <Button
          variant="contained"
          onClick={handleSendReset}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          {loading ? 'Илгээж байна…' : 'Линк илгээх'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;

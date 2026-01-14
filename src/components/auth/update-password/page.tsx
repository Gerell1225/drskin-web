'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Stack,
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
  const [sending, setSending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleClose = () => {
    if (sending) return;
    setEmail('');
    setErrorMsg(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleSend = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Имэйл хаягаа зөв оруулна уу.');
      return;
    }

    setSending(true);
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      );

      if (error) {
        console.error('resetPasswordForEmail error:', error);
        setErrorMsg(
          'Нууц үг сэргээх имэйл илгээхэд алдаа гарлаа. Дахин оролдоно уу.',
        );
        return;
      }

      setSuccessMsg(
        'Нууц үг сэргээх холбоос таны имэйл рүү илгээгдлээ. 1–2 минутын дараа Spam/Promotions хэсгээ шалгана уу.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Нууц үг сэргээх</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Таны Dr.Skin бүртгэлтэй имэйл хаягийг оруулна уу. Нууц үг сэргээх
            холбоос имэйлээр очих болно.
          </Typography>
          <TextField
            label="Имэйл хаяг"
            type="email"
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <Button onClick={handleClose} disabled={sending}>
          Болих
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={sending}
          sx={{ textTransform: 'none' }}
        >
          {sending ? 'Илгээж байна…' : 'Имэйл илгээх'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;

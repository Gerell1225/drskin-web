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
  Alert,
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

  const handleSend = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('И-мэйл хаягаа оруулна уу.');
      return;
    }

    setSending(true);
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${siteUrl}/auth/update-password`,
        },
      );

      if (error) {
        console.error('resetPasswordForEmail error:', error);
        setErrorMsg(
          error.message || 'И-мэйл илгээхэд алдаа гарлаа. Дахин оролдоно уу.',
        );
        return;
      }

      setSuccessMsg(
        'Нууц үг сэргээх заавар таны и-мэйл хаяг руу илгээгдлээ. Inbox болон Spam хавтасыг шалгана уу.',
      );
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setErrorMsg(null);
    setSuccessMsg(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Нууц үг сэргээх</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Dr.Skin аккаунтын и-мэйл хаягаа оруулснаар нууц үг сэргээх холбоос
            очих болно.
          </Typography>

          <TextField
            label="И-мэйл хаяг"
            type="email"
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          {successMsg && <Alert severity="success">{successMsg}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: 'none' }}
          disabled={sending}
        >
          Болих
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={sending}
          sx={{ textTransform: 'none', borderRadius: 999 }}
        >
          {sending ? 'Илгээж байна…' : 'И-мэйл илгээх'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;

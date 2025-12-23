'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import StarIcon from '@mui/icons-material/Star';
import LockResetIcon from '@mui/icons-material/LockReset';

import { supabase } from '@/lib/supabaseClient';

type BookingHistoryItem = {
  id: number | string;
  date: string;
  time: string | null;
  status: string;
  channel: string | null;
  branchName: string;
  serviceName: string;
};

type ProfileData = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
};

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
  onLoggedOut?: () => void;
};

const statusLabel: Record<string, string> = {
  pending: 'Шинэ',
  confirmed: 'Баталгаажсан',
  cancelled: 'Цуцлагдсан',
  completed: 'Дууссан',
};

const channelLabel: Record<string, string> = {
  online: 'Онлайн',
  phone: 'Утас',
};

const statusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'success' as const;
    case 'pending':
      return 'info' as const;
    case 'cancelled':
      return 'default' as const;
    default:
      return 'default' as const;
  }
};

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  open,
  onClose,
  onLoggedOut,
}) => {
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [history, setHistory] = React.useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // change password state
  const [newPassword, setNewPassword] = React.useState('');
  const [newPassword2, setNewPassword2] = React.useState('');
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = React.useState<string | null>(null);
  const [pwSaving, setPwSaving] = React.useState(false);
  const [pwDrawerOpen, setPwDrawerOpen] = React.useState(false);

  // Close password drawer when profile drawer closes
  React.useEffect(() => {
    if (!open) {
      setPwDrawerOpen(false);
      setPwError(null);
      setPwSuccess(null);
      setNewPassword('');
      setNewPassword2('');
    }
  }, [open]);

  // Load profile + history when drawer opens
  React.useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      // 1) Auth user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error('Auth user error:', userError);
        setProfile(null);
        setHistory([]);
        setErrorMsg('Нэвтэрсэн хэрэглэгч олдсонгүй.');
        setLoading(false);
        return;
      }

      const authUser = userData.user as any;
      const authUserId = authUser.id;
      const authEmail: string | null = authUser.email ?? null;
      const authPhoneRaw: string | null =
        authUser.phone ?? authUser.user_metadata?.phone ?? null;

      // 2) Customer profile – customers.id = auth user id
      const { data: customerRow, error: customerError } = await supabase
        .from('customers')
        .select('id, full_name, phone, loyalty_points')
        .eq('id', authUserId)
        .single();

      if (customerError || !customerRow) {
        console.error('Customer profile error:', customerError);
        setProfile(null);
        setHistory([]);
        setErrorMsg('Профайл ачаалахад алдаа гарлаа.');
        setLoading(false);
        return;
      }

      let customerPhone: string | null = customerRow.phone ?? null;

      // 2.1 If customers.phone is empty but auth has a phone, sync it to customers
      if (!customerPhone && authPhoneRaw) {
        const { error: updateError } = await supabase
          .from('customers')
          .update({ phone: authPhoneRaw })
          .eq('id', authUserId);

        if (updateError) {
          console.error('Customer phone sync error:', updateError);
        } else {
          customerPhone = authPhoneRaw;
        }
      }

      const profileData: ProfileData = {
        id: customerRow.id as string,
        fullName: customerRow.full_name ?? '',
        email: authEmail,
        phone: customerPhone,
        loyaltyPoints: customerRow.loyalty_points ?? 0,
      };

      setProfile(profileData);

      // 3) All bookings linked by PHONE (can include multiple phone candidates)
      const phoneCandidates: string[] = [];

      if (customerPhone) {
        phoneCandidates.push(customerPhone);
      }
      if (authPhoneRaw && !phoneCandidates.includes(authPhoneRaw)) {
        phoneCandidates.push(authPhoneRaw);
      }

      if (phoneCandidates.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(
          `
          id,
          date,
          time,
          status,
          channel,
          customer_phone,
          branches ( name ),
          services ( name )
        `,
        )
        .in('customer_phone', phoneCandidates)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (bookingsError) {
        console.error('Booking history error:', bookingsError);
        setHistory([]);
        setErrorMsg('Захиалгын түүх ачаалахад алдаа гарлаа.');
        setLoading(false);
        return;
      }

      const bookings = (bookingsData ?? []) as any[];

      if (bookings.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const mappedHistory: BookingHistoryItem[] = bookings.map((b: any) => ({
        id: b.id,
        date: b.date,
        time: b.time ?? null,
        status: b.status,
        channel: b.channel ?? null,
        branchName: b.branches?.name ?? '',
        serviceName: b.services?.name ?? '',
      }));

      setHistory(mappedHistory);
      setLoading(false);
    };

    load();
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setHistory([]);
    onLoggedOut?.();
    onClose();
  };

  const handleOpenPwDrawer = () => {
    setPwError(null);
    setPwSuccess(null);
    setNewPassword('');
    setNewPassword2('');
    setPwDrawerOpen(true);
  };

  const handleClosePwDrawer = () => {
    if (pwSaving) return; // avoid closing while saving
    setPwDrawerOpen(false);
  };

  const handleChangePassword = async () => {
    setPwError(null);
    setPwSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setPwError('Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой.');
      return;
    }

    if (newPassword !== newPassword2) {
      setPwError('Нууц үг хоёр хоорондоо таарахгүй байна.');
      return;
    }

    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        setPwError('Нууц үг солиход алдаа гарлаа.');
      } else {
        setPwSuccess('Нууц үг амжилттай солигдлоо.');
        setNewPassword('');
        setNewPassword2('');

        // Close bottom drawer after success (optional slight delay)
        setTimeout(() => {
          setPwDrawerOpen(false);
        }, 400);
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <>
      {/* MAIN PROFILE DRAWER (right) */}
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 380 },
            borderRadius: { xs: 0, sm: '16px 0 0 16px' },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Миний профайл
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
        <Divider />

        {/* Profile summary */}
        <Box sx={{ p: 2 }}>
          {profile ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {profile.fullName || 'Нэргүй хэрэглэгч'}
              </Typography>
              {profile.email && (
                <Typography variant="body2" color="text.secondary">
                  {profile.email}
                </Typography>
              )}
              {profile.phone && (
                <Typography variant="body2" color="text.secondary">
                  Утас: {profile.phone}
                </Typography>
              )}

              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<StarIcon />}
                  label={`Loyalty: ${profile.loyaltyPoints.toLocaleString(
                    'en-US',
                  )} оноо`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Нэвтрээгүй байна. Нэвтэрч дахин оролдоно уу.
            </Typography>
          )}

          {errorMsg && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errorMsg}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Booking history */}
        <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HistoryIcon fontSize="small" color="action" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Захиалгын түүх
              </Typography>
            </Stack>

            {loading && (
              <Typography variant="body2" color="text.secondary">
                Түүхийг уншиж байна...
              </Typography>
            )}

            {!loading && history.length === 0 && !errorMsg && (
              <Typography variant="body2" color="text.secondary">
                Одоогоор захиалга байхгүй байна.
              </Typography>
            )}

            {!loading && history.length > 0 && (
              <List dense sx={{ px: 0 }}>
                {history.map((b) => (
                  <ListItem
                    key={b.id}
                    sx={{ alignItems: 'flex-start', px: 0, py: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={1}
                        >
                          <Box>
                            <Typography variant="body2">
                              {b.date}{' '}
                              {b.time ? b.time.toString().slice(0, 5) : ''}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {b.branchName || 'Салбар'} •{' '}
                              {b.serviceName || 'Үйлчилгээ'}
                            </Typography>
                          </Box>
                          <Stack spacing={0.5} alignItems="flex-end">
                            {b.channel && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {channelLabel[b.channel] || b.channel}
                              </Typography>
                            )}
                            <Chip
                              size="small"
                              label={statusLabel[b.status] || b.status}
                              color={statusColor(b.status)}
                              sx={{ fontSize: 11 }}
                            />
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Change password – compact section, open bottom drawer */}
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <LockResetIcon fontSize="small" color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Нууц үг
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Нууц үгээ өөрчлөхийн тулд доорх товчийг дарж баталгаажуулна уу.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LockResetIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 999,
            }}
            onClick={handleOpenPwDrawer}
          >
            Нууц үг солих
          </Button>
        </Box>

        <Divider />

        {/* Logout */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<LogoutIcon />}
            sx={{ textTransform: 'none', borderRadius: 999 }}
            onClick={handleLogout}
          >
            Гарах
          </Button>
        </Box>
      </Drawer>

      {/* PASSWORD BOTTOM SHEET DRAWER */}
      <Drawer
        anchor="bottom"
        open={pwDrawerOpen}
        onClose={handleClosePwDrawer}
        PaperProps={{
          sx: {
            borderRadius: '16px 16px 0 0',
            maxWidth: 480,
            mx: 'auto',
            width: '100%',
            p: 2.5,
          },
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LockResetIcon fontSize="small" color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Нууц үг солих
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Шинэ нууц үгээ оруулж баталгаажуулна уу.
              </Typography>
            </Stack>
            <IconButton size="small" onClick={handleClosePwDrawer}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <TextField
            label="Шинэ нууц үг"
            type="password"
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="Шинэ нууц үг давтах"
            type="password"
            size="small"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            fullWidth
          />

          {pwError && (
            <Typography variant="caption" color="error">
              {pwError}
            </Typography>
          )}
          {pwSuccess && (
            <Typography variant="caption" sx={{ color: 'success.main' }}>
              {pwSuccess}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<LockResetIcon />}
            sx={{ textTransform: 'none', borderRadius: 999, mt: 0.5 }}
            onClick={handleChangePassword}
            disabled={pwSaving}
          >
            {pwSaving ? 'Хадгаж байна…' : 'Нууц үг шинэчлэх'}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default ProfileDrawer;

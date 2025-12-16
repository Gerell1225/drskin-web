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

  // Load profile + history when drawer opens
  React.useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      // 1) Auth user (for id + email)
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

      const authUser = userData.user;
      const authUserId = authUser.id;
      const authEmail = authUser.email ?? null;

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

      const profileData: ProfileData = {
        id: customerRow.id as string,
        fullName: customerRow.full_name ?? '',
        email: authEmail,
        phone: customerRow.phone ?? null,
        loyaltyPoints: customerRow.loyalty_points ?? 0,
      };

      setProfile(profileData);

      // 3) Last 10 bookings linked by PHONE (because bookings.customer_id column does not exist)
      let bookingsData: any[] | null = [];
      let bookingsError: any = null;

      if (customerRow.phone) {
        const res = await supabase
          .from('bookings')
          .select(
            'id, date, time, status, channel, branch_id, service_id, customer_phone',
          )
          .eq('customer_phone', customerRow.phone)
          .order('date', { ascending: false })
          .order('time', { ascending: false })
          .limit(10);

        bookingsData = res.data;
        bookingsError = res.error;
      } else {
        // no phone on profile -> nothing to match
        bookingsData = [];
      }

      if (bookingsError) {
        console.error('Booking history error:', bookingsError);
        setHistory([]);
        setErrorMsg('Захиалгын түүх ачаалахад алдаа гарлаа.');
        setLoading(false);
        return;
      }

      const bookings = bookingsData ?? [];

      if (bookings.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // 4) Fetch branch + service names separately
      const branchIds = Array.from(
        new Set(
          bookings
            .map((b: any) => b.branch_id)
            .filter((id: any) => id != null),
        ),
      );
      const serviceIds = Array.from(
        new Set(
          bookings
            .map((b: any) => b.service_id)
            .filter((id: any) => id != null),
        ),
      );

      let branchMap: Record<number, string> = {};
      let serviceMap: Record<number, string> = {};

      if (branchIds.length > 0) {
        const { data: branchRows, error: branchError } = await supabase
          .from('branches')
          .select('id, name')
          .in('id', branchIds);

        if (branchError) {
          console.error('Branches fetch error:', branchError);
        } else {
          branchMap = (branchRows ?? []).reduce(
            (acc: Record<number, string>, row: any) => {
              acc[row.id] = row.name ?? '';
              return acc;
            },
            {},
          );
        }
      }

      if (serviceIds.length > 0) {
        const { data: serviceRows, error: serviceError } = await supabase
          .from('services')
          .select('id, name')
          .in('id', serviceIds);

        if (serviceError) {
          console.error('Services fetch error:', serviceError);
        } else {
          serviceMap = (serviceRows ?? []).reduce(
            (acc: Record<number, string>, row: any) => {
              acc[row.id] = row.name ?? '';
              return acc;
            },
            {},
          );
        }
      }

      const mappedHistory: BookingHistoryItem[] = bookings.map((b: any) => ({
        id: b.id,
        date: b.date,
        time: b.time ?? null,
        status: b.status,
        channel: b.channel ?? null,
        branchName: branchMap[b.branch_id] || '',
        serviceName: serviceMap[b.service_id] || '',
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
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380 },
          borderRadius: { xs: 0, sm: '16px 0 0 16px' },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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

          {!loading && history.length === 0 && (
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
                          <Typography variant="caption" color="text.secondary">
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

      {/* Change password */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <LockResetIcon fontSize="small" color="action" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Нууц үг солих
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
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
            variant="outlined"
            size="small"
            startIcon={<LockResetIcon />}
            sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
            onClick={handleChangePassword}
            disabled={pwSaving}
          >
            {pwSaving ? 'Хадгаж байна…' : 'Нууц үг солих'}
          </Button>
        </Stack>
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
  );
};

export default ProfileDrawer;

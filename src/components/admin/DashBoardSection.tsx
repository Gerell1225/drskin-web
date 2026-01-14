'use client';

import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import { supabase } from '@/lib/supabaseClient';

type BookingChannel = 'online' | 'phone';
type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'refunded';

type BranchRef = {
  id: number;
  name: string;
  capacitySkin: number;
  capacityHair: number;
};

type ServiceRef = {
  id: number;
  name: string;
  category: 'skin' | 'hair';
};

type BookingRow = {
  id: number;
  date: string;
  time: string;
  branchId: number;
  serviceId: number;
  peopleCount: number;
  channel: BookingChannel;
  status: BookingStatus;
  totalAmount: number | null;
  paymentStatus: PaymentStatus | null;
};

const DashboardSection: React.FC = () => {
  const todayStr = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const [loading, setLoading] = React.useState(true);

  const [branches, setBranches] = React.useState<BranchRef[]>([]);
  const [services, setServices] = React.useState<ServiceRef[]>([]);
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [customersCount, setCustomersCount] = React.useState<number>(0);

  const [selectedDate, setSelectedDate] = React.useState<string>(todayStr);
  const [branchFilter, setBranchFilter] =
    React.useState<number | 'all'>('all');

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setErrorMsg(null);

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      const fromStr = fromDate.toISOString().slice(0, 10);

      const [branchesRes, servicesRes, bookingsRes, customersRes] =
        await Promise.all([
          supabase
            .from('branches')
            .select('id, name, capacity_skin, capacity_hair')
            .order('id', { ascending: true }),
          supabase
            .from('services')
            .select('id, name, category')
            .order('id', { ascending: true }),
          supabase
            .from('bookings')
            .select(
              'id, date, time, branch_id, service_id, people_count, channel, status, total_amount, payment_status',
            )
            .gte('date', fromStr)
            .order('date', { ascending: true })
            .order('time', { ascending: true }),
          supabase
            .from('customers')
            .select('id', { count: 'exact', head: true }),
        ]);

      if (branchesRes.error) {
        console.error('Branches error:', branchesRes.error);
        setErrorMsg('Салбарын мэдээлэл ачаалахад алдаа гарлаа.');
      }
      if (servicesRes.error) {
        console.error('Services error:', servicesRes.error);
        setErrorMsg('Үйлчилгээний мэдээлэл ачаалахад алдаа гарлаа.');
      }
      if (bookingsRes.error) {
        console.error('Bookings error:', bookingsRes.error);
        setErrorMsg('Захиалгын мэдээлэл ачаалахад алдаа гарлаа.');
      }
      if (customersRes.error) {
        console.error('Customers error:', customersRes.error);
        setErrorMsg('Хэрэглэгчийн мэдээлэл ачаалахад алдаа гарлаа.');
      }

      const branchList: BranchRef[] = (branchesRes.data ?? []).map(
        (row: any) => ({
          id: row.id,
          name: row.name ?? '',
          capacitySkin: row.capacity_skin ?? 0,
          capacityHair: row.capacity_hair ?? 0,
        }),
      );

      const serviceList: ServiceRef[] = (servicesRes.data ?? []).map(
        (row: any) => ({
          id: row.id,
          name: row.name ?? '',
          category: (row.category ?? 'skin') as 'skin' | 'hair',
        }),
      );

      const bookingList: BookingRow[] = (bookingsRes.data ?? []).map(
        (row: any) => ({
          id: row.id,
          date: row.date,
          time: row.time ? String(row.time).slice(0, 5) : '',
          branchId: row.branch_id,
          serviceId: row.service_id,
          peopleCount: row.people_count ?? 1,
          channel: row.channel as BookingChannel,
          status: row.status as BookingStatus,
          totalAmount:
            row.total_amount !== null && row.total_amount !== undefined
              ? Number(row.total_amount)
              : null,
          paymentStatus: row.payment_status as PaymentStatus | null,
        }),
      );

      setBranches(branchList);
      setServices(serviceList);
      setBookings(bookingList);
      setCustomersCount(customersRes.count ?? 0);

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getBranchName = (id: number) =>
    branches.find((b) => b.id === id)?.name || `#${id}`;

  const getServiceName = (id: number) =>
    services.find((s) => s.id === id)?.name || `#${id}`;

  const filteredForDate = React.useMemo(() => {
    return bookings.filter((b) => {
      if (b.date !== selectedDate) return false;
      if (branchFilter !== 'all' && b.branchId !== branchFilter) return false;
      return true;
    });
  }, [bookings, selectedDate, branchFilter]);

  const totalBookings = filteredForDate.length;

  const totalOnlinePaid = filteredForDate
    .filter(
      (b) =>
        b.channel === 'online' &&
        b.paymentStatus === 'paid' &&
        b.totalAmount != null,
    )
    .reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);

  const pendingOnlinePayments = filteredForDate.filter(
    (b) => b.channel === 'online' && b.paymentStatus === 'pending',
  ).length;

  const phoneBookingsCount = filteredForDate.filter(
    (b) => b.channel === 'phone',
  ).length;

  const topServices = React.useMemo(() => {
    if (bookings.length === 0 || services.length === 0) return [];

    const counts = new Map<number, number>();

    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      counts.set(b.serviceId, (counts.get(b.serviceId) ?? 0) + 1);
    });

    const items = Array.from(counts.entries())
      .map(([serviceId, count]) => ({
        serviceId,
        count,
        name: getServiceName(serviceId),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return items;
  }, [bookings, services]);

  const branchLoadsForDate = React.useMemo(() => {
    const map = new Map<
      number,
      { people: number; bookings: number }
    >();

    filteredForDate.forEach((b) => {
      if (b.status === 'cancelled') return;

      const prev = map.get(b.branchId) ?? { people: 0, bookings: 0 };
      map.set(b.branchId, {
        people: prev.people + (b.peopleCount || 1),
        bookings: prev.bookings + 1,
      });
    });

    const arr = Array.from(map.entries()).map(([branchId, info]) => ({
      branchId,
      branchName: getBranchName(branchId),
      people: info.people,
      bookings: info.bookings,
    }));

    arr.sort((a, b) => b.people - a.people);

    return arr;
  }, [filteredForDate, branches]);

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Хянах самбар
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Өнөөдрийн захиалга, онлайн орлого, салбарын ачаалал болон хамгийн
          их захиалагдсан үйлчилгээнүүдийг нэг дороос харна.
        </Typography>
      </Stack>

      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <TextField
            label="Огноо"
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="branch-filter-label">Салбар</InputLabel>
            <Select
              labelId="branch-filter-label"
              label="Салбар"
              value={branchFilter}
              onChange={(e) =>
                setBranchFilter(
                  e.target.value === 'all'
                    ? 'all'
                    : Number(e.target.value),
                )
              }
            >
              <MenuItem value="all">Бүх салбар</MenuItem>
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading && (
            <Box sx={{ flex: 1 }}>
              <LinearProgress />
            </Box>
          )}
        </Stack>

        {errorMsg && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: 'block' }}
          >
            {errorMsg}
          </Typography>
        )}
      </Paper>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        mb={3}
      >
        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Захиалга ({selectedDate})
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
            {loading ? '…' : totalBookings}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Утас: {phoneBookingsCount} • Онлайн:{' '}
            {
              filteredForDate.filter((b) => b.channel === 'online')
                .length
            }
          </Typography>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Онлайн орлого ({selectedDate})
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
            {loading
              ? '…'
              : `${totalOnlinePaid.toLocaleString('en-US')} ₮`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Зөвхөн онлайн (QPay) төлбөрөө бүрэн төлсөн захиалгууд.
          </Typography>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Онлайн төлбөрийн төлөв ({selectedDate})
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Хүлээгдэж буй онлайн төлбөр:{' '}
            <strong>{loading ? '…' : pendingOnlinePayments}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Онлайн сувагтай, төлбөрийн төлөв нь &quot;pending&quot; захиалга.
          </Typography>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Нийт бүртгэлтэй хэрэглэгч
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
            {loading ? '…' : customersCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Loyalty системд бүртгэлтэй хэрэглэгчдийн тоо.
          </Typography>
        </Paper>
      </Stack>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
      >
        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Сүүлийн 30 хоногт хамгийн их захиалагдсан үйлчилгээ
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Захиалга цуцлагдсан бичлэгүүдийг оролцуулаагүй.
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {topServices.length === 0 && !loading && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Одоогоор хангалттай захиалга байхгүй байна.
            </Typography>
          )}

          <Stack spacing={1.5}>
            {topServices.map((item, index) => {
              const total = bookings.length || 1;
              const percent = Math.round((item.count / total) * 100);

              return (
                <Box
                  key={item.serviceId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.count} захиалга • {percent}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percent, 100)}
                      sx={{ mt: 0.5, height: 6, borderRadius: 999 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Салбарын ачаалал ({selectedDate})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Захиалга цуцлагдсан бичлэгийг тооцохгүй. Хүний тоонд суурилсан
            ачаалал.
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {branchLoadsForDate.length === 0 && !loading && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Энэ өдөр захиалга бүртгэгдээгүй байна.
            </Typography>
          )}

          <Stack spacing={1.5}>
            {branchLoadsForDate.map((b) => {
              return (
                <Box
                  key={b.branchId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {b.branchName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {b.bookings} захиалга • {b.people} хүн
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={`${b.people} хүн`}
                    color="primary"
                    sx={{ fontSize: 11 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default DashboardSection;

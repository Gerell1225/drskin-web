'use client';

import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '@/lib/supabaseClient';

export type BookingChannel = 'online' | 'phone';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

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
  isActive: boolean;
  enabledBranchIds: number[]; 
};

type Booking = {
  id: number;
  date: string;
  time: string;
  branchId: number;
  serviceId: number;
  customerName: string;
  customerPhone: string;
  peopleCount: number;
  totalAmount: number | null;
  channel: BookingChannel;
  status: BookingStatus;
  paymentStatus: PaymentStatus | null;
};

const channelLabel: Record<BookingChannel, string> = {
  online: 'Онлайн',
  phone: 'Утас',
};

const statusLabel: Record<BookingStatus, string> = {
  pending: 'Шинэ',
  confirmed: 'Баталгаажсан',
  cancelled: 'Цуцлагдсан',
};

const paymentLabel: Record<PaymentStatus, string> = {
  pending: 'Төлбөр хүлээгдэж',
  paid: 'Төлөгдсөн',
  refunded: 'Буцаагдсан',
};

const BookingsSection: React.FC = () => {
  const [branches, setBranches] = React.useState<BranchRef[]>([]);
  const [services, setServices] = React.useState<ServiceRef[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(false);

  const today = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );
  const [selectedDate, setSelectedDate] = React.useState<string>(today);
  const [branchFilter, setBranchFilter] =
    React.useState<number | 'all'>('all');
  const [channelFilter, setChannelFilter] =
    React.useState<BookingChannel | 'all'>('all');
  const [statusFilter, setStatusFilter] =
    React.useState<BookingStatus | 'all'>('all');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [formDate, setFormDate] = React.useState(today);
  const [formTime, setFormTime] = React.useState('10:00');
  const [formBranchId, setFormBranchId] = React.useState<number | null>(null);
  const [formServiceId, setFormServiceId] = React.useState<number | null>(null);
  const [formCustomerName, setFormCustomerName] = React.useState('');
  const [formCustomerPhone, setFormCustomerPhone] = React.useState('');
  const [formPeopleCount, setFormPeopleCount] = React.useState('1');
  const [formStatus, setFormStatus] =
    React.useState<BookingStatus>('pending');

  const [saving, setSaving] = React.useState(false);
  const [capacityError, setCapacityError] = React.useState<string | null>(
    null,
  );
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      const [branchesRes, servicesRes, bookingsRes] = await Promise.all([
        supabase
          .from('branches')
          .select('id, name, capacity_skin, capacity_hair')
          .order('id', { ascending: true }),
        supabase
          .from('services')
          .select(
            `
            id,
            name,
            category,
            is_active,
            service_branch_prices (
              branch_id,
              enabled
            )
          `,
          )
          .order('id', { ascending: true }),
        supabase
          .from('bookings')
          .select(
            'id, date, time, branch_id, service_id, customer_name, customer_phone, people_count, channel, status, total_amount, payment_status',
          )
          .order('date', { ascending: false })
          .order('time', { ascending: true }),
      ]);

      if (branchesRes.error) {
        console.error('Error loading branches:', branchesRes.error);
      }
      if (servicesRes.error) {
        console.error('Error loading services:', servicesRes.error);
      }
      if (bookingsRes.error) {
        console.error('Error loading bookings:', bookingsRes.error);
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
        (row: any) => {
          const prices = (row.service_branch_prices ?? []) as any[];

          return {
            id: row.id,
            name: row.name ?? '',
            category: (row.category ?? 'skin') as 'skin' | 'hair',
            isActive: row.is_active ?? true,
            enabledBranchIds: prices
              .filter((p) => p.enabled)
              .map((p) => p.branch_id as number),
          };
        },
      );

      const bookingsList: Booking[] = (bookingsRes.data ?? []).map(
        (row: any) => ({
          id: row.id,
          date: row.date,
          time: row.time ? String(row.time).slice(0, 5) : '',
          branchId: row.branch_id,
          serviceId: row.service_id,
          customerName: row.customer_name ?? '',
          customerPhone: row.customer_phone ?? '',
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
      setBookings(bookingsList);

      if (branchList[0] && formBranchId == null) {
        setFormBranchId(branchList[0].id);
      }
      if (serviceList[0] && formServiceId == null) {
        setFormServiceId(serviceList[0].id);
      }

      setLoading(false);
    };

    loadAll();
  }, []);

  const getBranchName = (id: number) =>
    branches.find((b) => b.id === id)?.name || `#${id}`;

  const getServiceName = (id: number) =>
    services.find((s) => s.id === id)?.name || `#${id}`;

  const getServiceCategory = (id: number): 'skin' | 'hair' => {
    const s = services.find((srv) => srv.id === id);
    return (s?.category ?? 'skin') as 'skin' | 'hair';
  };

  const getBranchCapacityForCategory = (
    branchId: number,
    category: 'skin' | 'hair',
  ): number => {
    const b = branches.find((br) => br.id === branchId);
    if (!b) return 0;
    return category === 'skin' ? b.capacitySkin ?? 0 : b.capacityHair ?? 0;
  };

  const availableServices = React.useMemo(() => {
    const branchIdNumber = formBranchId;

    return services.filter((s) => {
      if (!s.isActive) return false;

      if (branchIdNumber == null) return true;

      if (s.enabledBranchIds && s.enabledBranchIds.length > 0) {
        const isEnabled = s.enabledBranchIds.includes(branchIdNumber);
        if (!isEnabled && formServiceId === s.id) {
          return true;
        }
        return isEnabled;
      }

      return true;
    });
  }, [services, formBranchId, formServiceId]);

  const filtered = React.useMemo(() => {
    return bookings.filter((b) => {
      if (selectedDate && b.date !== selectedDate) return false;
      if (branchFilter !== 'all' && b.branchId !== branchFilter) return false;
      if (channelFilter !== 'all' && b.channel !== channelFilter) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      return true;
    });
  }, [bookings, selectedDate, branchFilter, channelFilter, statusFilter]);

  const totalBookings = filtered.length;

  const onlinePaidRevenue = filtered
    .filter(
      (b) =>
        b.channel === 'online' &&
        b.paymentStatus === 'paid' &&
        b.totalAmount != null,
    )
    .reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);

  const paidCount = filtered.filter((b) => b.paymentStatus === 'paid').length;
  const pendingPaymentCount = filtered.filter(
    (b) => b.paymentStatus === 'pending',
  ).length;

  const resetFormErrors = () => {
    setCapacityError(null);
    setFormError(null);
  };

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    resetFormErrors();

    const defaultBranchId = branches[0]?.id ?? null;
    const branchIdNumber = defaultBranchId;

    const servicesForBranch = services.filter((s) => {
      if (!s.isActive) return false;
      if (branchIdNumber == null) return true;
      if (s.enabledBranchIds && s.enabledBranchIds.length > 0) {
        return s.enabledBranchIds.includes(branchIdNumber);
      }
      return true;
    });

    setFormDate(selectedDate || today);
    setFormTime('10:00');
    setFormBranchId(defaultBranchId);
    setFormServiceId(
      servicesForBranch[0]?.id ?? services[0]?.id ?? null,
    );
    setFormCustomerName('');
    setFormCustomerPhone('');
    setFormPeopleCount('1');
    setFormStatus('pending');
    setDialogOpen(true);
  };

  const openEdit = (booking: Booking) => {
    setMode('edit');
    setEditingId(booking.id);
    resetFormErrors();
    setFormDate(booking.date);
    setFormTime(booking.time);
    setFormBranchId(booking.branchId);
    setFormServiceId(booking.serviceId);
    setFormCustomerName(booking.customerName);
    setFormCustomerPhone(booking.customerPhone);
    setFormPeopleCount(String(booking.peopleCount));
    setFormStatus(booking.status);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };
  const checkCapacity = (): boolean => {
    setCapacityError(null);

    const branchId = formBranchId ?? 0;
    const serviceId = formServiceId ?? 0;
    const people = Number(formPeopleCount) || 1;

    if (!branchId || !serviceId || !formDate || !formTime) {
      return true;
    }

    const category = getServiceCategory(serviceId);
    const capacity = getBranchCapacityForCategory(branchId, category);

    if (capacity <= 0) {
      setCapacityError(
        category === 'skin'
          ? 'Энэ салбарт арьсны үйлчилгээний багтаамж 0 байна.'
          : 'Энэ салбарт үсний үйлчилгээний багтаамж 0 байна.',
      );
      return false;
    }

    const currentLoad = bookings
      .filter(
        (b) =>
          b.branchId === branchId &&
          b.date === formDate &&
          b.time === formTime &&
          getServiceCategory(b.serviceId) === category &&
          b.status !== 'cancelled',
      )
      .reduce((sum, b) => sum + (b.peopleCount || 1), 0);

    const total = currentLoad + people;

    if (total > capacity) {
      setCapacityError(
        `Энэ цагт багтаамж дүүрсэн. Одоогийн захиалга: ${currentLoad}/${capacity} хүн. Шинээр ${people} хүн нэмэхэд ${total}/${capacity} болно.`,
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    resetFormErrors();

    if (!formDate || !formTime || formBranchId == null || formServiceId == null) {
      setFormError('Огноо, цаг, салбар, үйлчилгээг заавал бөглөнө үү.');
      return;
    }
    if (!formCustomerName.trim()) {
      setFormError('Хэрэглэгчийн нэрийг оруулна уу.');
      return;
    }

    const branchId = formBranchId;
    const serviceId = formServiceId;
    const people = Number(formPeopleCount) || 1;

    const ok = checkCapacity();
    if (!ok) return;

    const payload = {
      date: formDate,
      time: formTime,
      branch_id: branchId,
      service_id: serviceId,
      customer_name: formCustomerName.trim(),
      customer_phone: formCustomerPhone.trim() || null,
      people_count: people,
      channel: 'phone' as BookingChannel,
      status: formStatus,
      total_amount: null,
      payment_status: null,
    };

    setSaving(true);

    try {
      if (mode === 'create') {
        const { data, error } = await supabase
          .from('bookings')
          .insert(payload)
          .select(
            'id, date, time, branch_id, service_id, customer_name, customer_phone, people_count, channel, status, total_amount, payment_status',
          )
          .single();

        if (error || !data) {
          console.error('Insert booking error:', error);
          setFormError('Захиалга нэмэхэд алдаа гарлаа.');
          setSaving(false);
          return;
        }

        const newBooking: Booking = {
          id: data.id,
          date: data.date,
          time: data.time ? String(data.time).slice(0, 5) : '',
          branchId: data.branch_id,
          serviceId: data.service_id,
          customerName: data.customer_name ?? '',
          customerPhone: data.customer_phone ?? '',
          peopleCount: data.people_count ?? people,
          channel: data.channel as BookingChannel,
          status: data.status as BookingStatus,
          totalAmount:
            data.total_amount !== null && data.total_amount !== undefined
              ? Number(data.total_amount)
              : null,
          paymentStatus: data.payment_status as PaymentStatus | null,
        };

        setBookings((prev) => [newBooking, ...prev]);
      } else if (mode === 'edit' && editingId != null) {
        const { data, error } = await supabase
          .from('bookings')
          .update(payload)
          .eq('id', editingId)
          .select(
            'id, date, time, branch_id, service_id, customer_name, customer_phone, people_count, channel, status, total_amount, payment_status',
          )
          .single();

        if (error || !data) {
          console.error('Update booking error:', error);
          setFormError('Захиалга засахад алдаа гарлаа.');
          setSaving(false);
          return;
        }

        const updated: Booking = {
          id: data.id,
          date: data.date,
          time: data.time ? String(data.time).slice(0, 5) : '',
          branchId: data.branch_id,
          serviceId: data.service_id,
          customerName: data.customer_name ?? '',
          customerPhone: data.customer_phone ?? '',
          peopleCount: data.people_count ?? people,
          channel: data.channel as BookingChannel,
          status: data.status as BookingStatus,
          totalAmount:
            data.total_amount !== null && data.total_amount !== undefined
              ? Number(data.total_amount)
              : null,
          paymentStatus: data.payment_status as PaymentStatus | null,
        };

        setBookings((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b)),
        );
      }

      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Захиалга
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Онлайн болон утсаар ирсэн бүх захиалгыг эндээс хянаж, засварлана.
          Орлого карт нь зөвхөн онлайн (QPay) төлбөртэй захиалгын дүнг
          тооцоолно. Салбар бүрийн арьс / үсний ор дүүргэлтийг автоматаар
          шалгана.
        </Typography>
      </Stack>

      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          mb: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flex={1}>
            <TextField
              label="Огноо"
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
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
                <MenuItem value="all">Бүгд</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="channel-filter-label">Суваг</InputLabel>
              <Select
                labelId="channel-filter-label"
                label="Суваг"
                value={channelFilter}
                onChange={(e) =>
                  setChannelFilter(
                    e.target.value === 'all'
                      ? 'all'
                      : (e.target.value as BookingChannel),
                  )
                }
              >
                <MenuItem value="all">Бүгд</MenuItem>
                <MenuItem value="online">Онлайн</MenuItem>
                <MenuItem value="phone">Утас</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="status-filter-label">Төлөв</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Төлөв"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value === 'all'
                      ? 'all'
                      : (e.target.value as BookingStatus),
                  )
                }
              >
                <MenuItem value="all">Бүгд</MenuItem>
                <MenuItem value="pending">Шинэ</MenuItem>
                <MenuItem value="confirmed">Баталгаажсан</MenuItem>
                <MenuItem value="cancelled">Цуцлагдсан</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
            onClick={openCreate}
            disabled={branches.length === 0 || services.length === 0}
          >
            Утасны захиалга нэмэх
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Өнөөдрийн захиалга
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
            {loading ? '…' : totalBookings}
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
            Онлайн орлого
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
            {loading
              ? '…'
              : `${onlinePaidRevenue.toLocaleString('en-US')} ₮`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Зөвхөн онлайн төлбөр төлсөн захиалга.
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
            Төлбөрийн төлөв
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Төлөгдсөн: <strong>{paidCount}</strong> • Хүлээгдэж:{' '}
            <strong>{pendingPaymentCount}</strong>
          </Typography>
        </Paper>
      </Stack>

      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Захиалгын жагсаалт
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Огноо / цаг</TableCell>
                <TableCell>Салбар</TableCell>
                <TableCell>Үйлчилгээ</TableCell>
                <TableCell>Хэрэглэгч</TableCell>
                <TableCell align="right">Хүний тоо</TableCell>
                <TableCell>Суваг</TableCell>
                <TableCell align="right">Үнэ (онлайн)</TableCell>
                <TableCell align="right">Төлбөр</TableCell>
                <TableCell align="right">Төлөв</TableCell>
                <TableCell align="right">Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>
                    {booking.date} {booking.time}
                  </TableCell>
                  <TableCell>{getBranchName(booking.branchId)}</TableCell>
                  <TableCell>{getServiceName(booking.serviceId)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.customerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {booking.peopleCount}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={channelLabel[booking.channel]}
                      color={
                        booking.channel === 'online' ? 'primary' : 'default'
                      }
                      sx={{ fontSize: 12 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {booking.channel === 'online' &&
                    booking.totalAmount != null ? (
                      `${booking.totalAmount.toLocaleString('en-US')} ₮`
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {booking.channel === 'online' && booking.paymentStatus ? (
                      <Chip
                        size="small"
                        label={paymentLabel[booking.paymentStatus]}
                        color={
                          booking.paymentStatus === 'paid'
                            ? 'success'
                            : booking.paymentStatus === 'pending'
                              ? 'warning'
                              : 'default'
                        }
                        sx={{ fontSize: 11 }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={statusLabel[booking.status]}
                      color={
                        booking.status === 'cancelled'
                          ? 'default'
                          : booking.status === 'confirmed'
                            ? 'success'
                            : 'info'
                      }
                      sx={{ fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(booking)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      Энэ өдрийн захиалга алга.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {mode === 'create' ? 'Шинэ утасны захиалга нэмэх' : 'Захиалга засах'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Огноо"
                type="date"
                size="small"
                value={formDate}
                onChange={(e) => {
                  setFormDate(e.target.value);
                  resetFormErrors();
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Цаг"
                type="time"
                size="small"
                value={formTime}
                onChange={(e) => {
                  setFormTime(e.target.value);
                  resetFormErrors();
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="branch-select-label">Салбар</InputLabel>
                <Select
                  labelId="branch-select-label"
                  label="Салбар"
                  value={formBranchId ?? ''}
                  onChange={(e) => {
                    const val =
                      e.target.value === ''
                        ? null
                        : Number(e.target.value);
                    setFormBranchId(val);
                    resetFormErrors();
                  }}
                >
                  {branches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="service-select-label">Үйлчилгээ</InputLabel>
                <Select
                  labelId="service-select-label"
                  label="Үйлчилгээ"
                  value={formServiceId ?? ''}
                  onChange={(e) => {
                    const val =
                      e.target.value === ''
                        ? null
                        : Number(e.target.value);
                    setFormServiceId(val);
                    resetFormErrors();
                  }}
                >
                  {availableServices.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Хэрэглэгчийн нэр"
                size="small"
                value={formCustomerName}
                onChange={(e) => setFormCustomerName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Утас"
                size="small"
                value={formCustomerPhone}
                onChange={(e) => setFormCustomerPhone(e.target.value)}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Хүний тоо"
                type="number"
                size="small"
                value={formPeopleCount}
                onChange={(e) => {
                  setFormPeopleCount(e.target.value);
                  resetFormErrors();
                }}
                fullWidth
              />
              <FormControl fullWidth size="small">
                <InputLabel id="status-select-label">
                  Захиалгын төлөв
                </InputLabel>
                <Select
                  labelId="status-select-label"
                  label="Захиалгын төлөв"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as BookingStatus)
                  }
                >
                  <MenuItem value="pending">Шинэ</MenuItem>
                  <MenuItem value="confirmed">Баталгаажсан</MenuItem>
                  <MenuItem value="cancelled">Цуцлагдсан</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {capacityError && (
              <Typography variant="body2" color="error">
                {capacityError}
              </Typography>
            )}
            {formError && (
              <Typography variant="body2" color="error">
                {formError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Болих
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            sx={{ textTransform: 'none' }}
          >
            {saving ? 'Хадгаж байна…' : 'Хадгалах'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsSection;

'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { supabase } from '@/lib/supabaseClient';
import LoginDialog from '@/components/auth/LoginDialog';

type BranchRef = {
  id: number;
  name: string;
  capacitySkin: number;
  capacityHair: number;
};

type ServiceBranchPrice = {
  branchId: number;
  enabled: boolean;
  price: number;
};

type ServiceRef = {
  id: number;
  name: string;
  category: 'skin' | 'hair';
  isActive: boolean;
  branchPrices: ServiceBranchPrice[];
};

type SupabaseUser = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    [key: string]: any;
  };
};

type TimeSlot = {
  time: string; // "HH:mm"
  remaining: number; // үлдсэн багтаамж
};

// 11:00 – 19:00, 30 минутын алхамтай
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 11; hour <= 19; hour++) {
    const h = hour.toString().padStart(2, '0');
    slots.push(`${h}:00`);
    if (hour !== 19) {
      slots.push(`${h}:30`);
    }
  }
  return slots;
};

const OnlineBookingSection: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<SupabaseUser | null>(null);

  const [branches, setBranches] = React.useState<BranchRef[]>([]);
  const [services, setServices] = React.useState<ServiceRef[]>([]);

  const [loadingInitial, setLoadingInitial] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // time slots (for dropdown)
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [slotsError, setSlotsError] = React.useState<string | null>(null);

  // form
  const today = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const [date, setDate] = React.useState(today);
  const [time, setTime] = React.useState<string | null>(null);
  const [branchId, setBranchId] = React.useState<number | null>(null);
  const [serviceId, setServiceId] = React.useState<number | null>(null);
  const [peopleCount, setPeopleCount] = React.useState('1');

  const [formError, setFormError] = React.useState<string | null>(null);
  const [capacityError, setCapacityError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // ─────────────────────────────
  // AUTH – check & subscribe
  // ─────────────────────────────
  React.useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setIsLoggedIn(true);
        setAuthUser(data.user as SupabaseUser);
      } else {
        setIsLoggedIn(false);
        setAuthUser(null);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user as SupabaseUser | undefined;
      setIsLoggedIn(!!user);
      setAuthUser(user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─────────────────────────────
  // LOAD branches + services
  // ─────────────────────────────
  React.useEffect(() => {
    const loadData = async () => {
      setLoadingInitial(true);

      const [branchesRes, servicesRes] = await Promise.all([
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
              enabled,
              price
            )
          `,
          )
          .order('id', { ascending: true }),
      ]);

      if (branchesRes.error) {
        console.error('Error loading branches:', branchesRes.error);
      }
      if (servicesRes.error) {
        console.error('Error loading services:', servicesRes.error);
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
            branchPrices: prices.map((p: any) => ({
              branchId: p.branch_id as number,
              enabled: !!p.enabled,
              price: p.price != null ? Number(p.price) : 0,
            })),
          };
        },
      );

      setBranches(branchList);
      setServices(serviceList);

      if (branchList[0] && branchId == null) {
        setBranchId(branchList[0].id);
      }
      if (serviceList[0] && serviceId == null) {
        setServiceId(serviceList[0].id);
      }

      setLoadingInitial(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────
  // HELPERS
  // ─────────────────────────────
  const resetMessages = () => {
    setFormError(null);
    setCapacityError(null);
    setSuccessMsg(null);
    setSlotsError(null);
  };

  const getServiceCategory = (sid: number): 'skin' | 'hair' => {
    const s = services.find((srv) => srv.id === sid);
    return (s?.category ?? 'skin') as 'skin' | 'hair';
  };

  const getBranchCapacityForCategory = (
    bid: number,
    category: 'skin' | 'hair',
  ) => {
    const b = branches.find((br) => br.id === bid);
    if (!b) return 0;
    return category === 'skin' ? b.capacitySkin ?? 0 : b.capacityHair ?? 0;
  };

  // services allowed for selected branch
  const availableServices = React.useMemo(() => {
    if (!branchId) {
      return services.filter((s) => s.isActive);
    }

    return services.filter((s) => {
      if (!s.isActive) return false;
      return s.branchPrices.some(
        (bp) => bp.branchId === branchId && bp.enabled,
      );
    });
  }, [services, branchId]);

  // price for current branch+service
  const selectedPrice = React.useMemo(() => {
    if (!branchId || !serviceId) return null;
    const service = services.find((s) => s.id === serviceId);
    if (!service) return null;
    const bp = service.branchPrices.find(
      (p) => p.branchId === branchId && p.enabled,
    );
    return bp ? bp.price : null;
  }, [services, branchId, serviceId]);

  const totalAmount = React.useMemo(() => {
    if (!selectedPrice) return null;
    const people = Number(peopleCount) || 1;
    return selectedPrice * people;
  }, [selectedPrice, peopleCount]);

  // ─────────────────────────────
  // TIME SLOTS (11:00–19:00, 30 мин) + filter past slots
  // ─────────────────────────────
  React.useEffect(() => {
    const loadSlots = async () => {
      setTimeSlots([]);
      setSlotsError(null);

      if (!branchId || !serviceId || !date) return;

      const category = getServiceCategory(serviceId);
      const capacity = getBranchCapacityForCategory(branchId, category);

      if (capacity <= 0) {
        setSlotsError(
          category === 'skin'
            ? 'Энэ салбарт арьсны үйлчилгээ авах боломжгүй байна.'
            : 'Энэ салбарт үсний үйлчилгээ авах боломжгүй байна.',
        );
        return;
      }

      setLoadingSlots(true);

      const { data, error } = await supabase
        .from('bookings')
        .select('time, people_count, service_id, status')
        .eq('branch_id', branchId)
        .eq('date', date)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error loading slots bookings:', error);
        setSlotsError('Цагийн мэдээлэл ачаалахад алдаа гарлаа.');
        setLoadingSlots(false);
        return;
      }

      const list = (data ?? []) as any[];

      const counts: Record<string, number> = {};
      list.forEach((row) => {
        const bookedService = services.find((s) => s.id === row.service_id);
        if (!bookedService) return;
        if (bookedService.category !== category) return;

        const t = row.time ? String(row.time).slice(0, 5) : '';
        if (!t) return;

        const people =
          row.people_count != null ? Number(row.people_count) : 1;
        counts[t] = (counts[t] || 0) + people;
      });

      const allSlots = generateTimeSlots();

      const now = new Date();
      const todayStr = today;
      const isToday = date === todayStr;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const available: TimeSlot[] = allSlots
        .map((t) => {
          const used = counts[t] || 0;
          const remaining = Math.max(capacity - used, 0);
          return { time: t, remaining };
        })
        .filter((slot) => {
          if (slot.remaining <= 0) return false;
          if (isToday) {
            const [h, m] = slot.time.split(':');
            const slotMinutes =
              parseInt(h || '0', 10) * 60 + parseInt(m || '0', 10);
            // Зөвхөн ОДОО цагаас ДАРААГИЙН цагуудыг харуулна
            return slotMinutes > nowMinutes;
          }
          return true;
        });

      if (available.length === 0) {
        setSlotsError('Сонгосон өдөр сул цаг байхгүй байна.');
      }

      setTimeSlots(available);
      setLoadingSlots(false);
    };

    if (!loadingInitial) {
      loadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, serviceId, date, loadingInitial]);

  // ─────────────────────────────
  // CAPACITY CHECK (final guard)
  // ─────────────────────────────
  const checkCapacity = async (): Promise<boolean> => {
    setCapacityError(null);

    if (!branchId || !serviceId || !date || !time) return false;

    const category = getServiceCategory(serviceId);
    const capacity = getBranchCapacityForCategory(branchId, category);
    const people = Number(peopleCount) || 1;

    if (capacity <= 0) {
      setCapacityError(
        category === 'skin'
          ? 'Энэ салбарт арьсны үйлчилгээний багтаамж 0 байна.'
          : 'Энэ салбарт үсний үйлчилгээний багтаамж 0 байна.',
      );
      return false;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('people_count, service_id, status')
      .eq('branch_id', branchId)
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error checking capacity:', error);
      setCapacityError(
        'Багтаамж шалгахад алдаа гарлаа. Та түр хүлээгээд дахин оролдоно уу.',
      );
      return false;
    }

    const currentLoad =
      (data ?? [])
        .filter(
          (row: any) =>
            getServiceCategory(row.service_id as number) === category,
        )
        .reduce(
          (sum: number, row: any) =>
            sum + (row.people_count != null ? Number(row.people_count) : 1),
          0,
        ) || 0;

    const total = currentLoad + people;

    if (total > capacity) {
      setCapacityError(
        `Энэ цагт багтаамж дүүрсэн байна. Одоогийн захиалга: ${currentLoad}/${capacity} хүн. Танай ${people} хүнийг нэмбэл ${total}/${capacity} болно.`,
      );
      return false;
    }

    return true;
  };

  // ─────────────────────────────
  // SUBMIT
  // ─────────────────────────────
  const handleSubmit = async () => {
    resetMessages();

    if (!isLoggedIn || !authUser) {
      setFormError('Онлайнаар цаг авахын тулд эхлээд нэвтэрнэ үү.');
      setLoginOpen(true);
      return;
    }

    if (!branchId || !serviceId || !date || !time) {
      setFormError('Салбар, үйлчилгээ, өдөр, цагийг бүрэн сонгоно уу.');
      return;
    }

    if (!selectedPrice) {
      setFormError(
        'Сонгосон салбарт энэ үйлчилгээ онлайнаар авах боломжгүй байна.',
      );
      return;
    }

    const people = Number(peopleCount) || 1;

    // capacity check
    const ok = await checkCapacity();
    if (!ok) return;

    // customer info from auth (талбар харагдахгүй, зөвхөн DB-д)
    const fullName =
      authUser.user_metadata?.full_name ||
      (authUser.email ? authUser.email.split('@')[0] : 'Онлайн хэрэглэгч');
    const phone =
      authUser.user_metadata?.phone ||
      authUser.phone ||
      'Утасгүй'; // <<--- NOT NULL fallback

    const payload = {
      date,
      time,
      branch_id: branchId,
      service_id: serviceId,
      customer_name: fullName,
      customer_phone: phone, // хэзээ ч null биш
      people_count: people,
      channel: 'online',
      status: 'pending',
      total_amount: totalAmount,
      payment_status: 'pending', // 30 мин дотор төлөгдөх ёстой
    };

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(payload)
        .select('id')
        .single();

      if (error || !data) {
        console.error('Online booking insert error:', error);
        setFormError(
          'Захиалга үүсгэхэд алдаа гарлаа. Та түр хүлээгээд дахин оролдоно уу.',
        );
        return;
      }

      setSuccessMsg(
        'Таны онлайн захиалга амжилттай бүртгэгдлээ. 30 минутын дотор QPay-ээр төлбөр хийгдээгүй тохиолдолд захиалга автоматаар цуцлагдана.',
      );

      // people & time-ийг reset, салбар/үйлчилгээг үлдээнэ
      setPeopleCount('1');
      setTime(null);
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────
  // LOGIN DIALOG HANDLERS
  // ─────────────────────────────
  const handleOpenLogin = () => setLoginOpen(true);
  const handleCloseLogin = () => setLoginOpen(false);

  const handleLoggedIn = async () => {
    setLoginOpen(false);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setIsLoggedIn(true);
      setAuthUser(data.user as SupabaseUser);
    } else {
      setIsLoggedIn(false);
      setAuthUser(null);
    }
  };

  // ─────────────────────────────
  // RENDER
  // ─────────────────────────────
  return (
    <Box
      id="online-booking"
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: '#ffffff',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems={{ xs: 'stretch', md: 'flex-start' }}
        >
          {/* Left: Title + description */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Онлайн цаг авах
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Dr.Skin &amp; Dr.Hair салбаруудад онлайнаар захиалга өгөхийн тулд
              Dr.Skin аккаунтаараа нэвтэрч, салбар, үйлчилгээ, өдөр, цагийг
              сонгон захиалгаа илгээнэ үү.
            </Typography>

            <Stack spacing={1} sx={{ mt: 2 }}>
              <Chip
                label="Онлайн захиалга + QPay төлбөр"
                variant="outlined"
                sx={{ maxWidth: 'fit-content' }}
              />
              <Typography variant="caption" color="text.secondary">
                Захиалга эхлээд{' '}
                <strong>&quot;Төлбөр хүлээгдэж&quot;</strong> төлөвтэй үүснэ. 30
                минутын дотор QPay-ээр төлбөр хийгдээгүй тохиолдолд захиалга
                автоматаар цуцлагдана.
              </Typography>
            </Stack>
          </Box>

          {/* Right: Booking card */}
          <Box sx={{ flex: 1, maxWidth: 480, width: '100%' }}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: 4,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Онлайн захиалгын мэдээлэл
                </Typography>

                {loadingInitial && (
                  <Typography variant="body2" color="text.secondary">
                    Салбар, үйлчилгээний мэдээлэл ачаалж байна...
                  </Typography>
                )}

                {!loadingInitial && branches.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Одоогоор онлайн захиалга авах салбар бүртгэгдээгүй байна.
                  </Typography>
                )}

                {!loadingInitial && branches.length > 0 && (
                  <Stack spacing={2}>
                    {/* Branch + Service */}
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                    >
                      <FormControl fullWidth size="small">
                        <InputLabel id="branch-select-label">
                          Салбар
                        </InputLabel>
                        <Select
                          labelId="branch-select-label"
                          label="Салбар"
                          value={branchId ?? ''}
                          onChange={(e) => {
                            resetMessages();
                            const val =
                              e.target.value === ''
                                ? null
                                : Number(e.target.value);
                            setBranchId(val);
                            setTime(null);
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
                        <InputLabel id="service-select-label">
                          Үйлчилгээ
                        </InputLabel>
                        <Select
                          labelId="service-select-label"
                          label="Үйлчилгээ"
                          value={serviceId ?? ''}
                          onChange={(e) => {
                            resetMessages();
                            const val =
                              e.target.value === ''
                                ? null
                                : Number(e.target.value);
                            setServiceId(val);
                            setTime(null);
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

                    {/* Date + Time (dropdown) */}
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                    >
                      <TextField
                        label="Өдөр"
                        type="date"
                        size="small"
                        value={date}
                        onChange={(e) => {
                          resetMessages();
                          setDate(e.target.value);
                          setTime(null);
                        }}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: today }}
                      />

                      <FormControl fullWidth size="small">
                        <InputLabel id="time-select-label">
                          Цаг (11:00 – 19:00)
                        </InputLabel>
                        <Select
                          labelId="time-select-label"
                          label="Цаг (11:00 – 19:00)"
                          value={time ?? ''}
                          onChange={(e) => {
                            resetMessages();
                            const val =
                              e.target.value === ''
                                ? null
                                : (e.target.value as string);
                            setTime(val);
                          }}
                        >
                          {loadingSlots && (
                            <MenuItem value="" disabled>
                              Цагуудыг ачаалж байна...
                            </MenuItem>
                          )}

                          {!loadingSlots && slotsError && (
                            <MenuItem value="" disabled>
                              {slotsError}
                            </MenuItem>
                          )}

                          {!loadingSlots &&
                            !slotsError &&
                            timeSlots.length === 0 && (
                              <MenuItem value="" disabled>
                                Энэ өдөр сул цаг алга байна.
                              </MenuItem>
                            )}

                          {!loadingSlots &&
                            !slotsError &&
                            timeSlots.length > 0 &&
                            timeSlots.map((slot) => (
                              <MenuItem key={slot.time} value={slot.time}>
                                {slot.time} ({slot.remaining} хүн боломжтой)
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* People */}
                    <TextField
                      label="Хүний тоо"
                      type="number"
                      size="small"
                      value={peopleCount}
                      onChange={(e) => {
                        resetMessages();
                        setPeopleCount(e.target.value);
                      }}
                      inputProps={{ min: 1, max: 6 }}
                      fullWidth
                    />

                    {/* Price summary */}
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Үнийн мэдээлэл:
                      </Typography>
                      {selectedPrice ? (
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedPrice.toLocaleString('en-US')} ₮ / хүн •{' '}
                          {totalAmount != null
                            ? `${totalAmount.toLocaleString('en-US')} ₮ нийт`
                            : ''}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Сонгосон салбар дээр энэ үйлчилгээ онлайнаар авах
                          боломжгүй байна.
                        </Typography>
                      )}
                    </Box>

                    {capacityError && (
                      <Alert severity="warning">{capacityError}</Alert>
                    )}
                    {formError && (
                      <Alert severity="error">{formError}</Alert>
                    )}
                    {successMsg && (
                      <Alert severity="success">{successMsg}</Alert>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        mt: 1,
                        borderRadius: 999,
                        textTransform: 'none',
                        py: 1,
                      }}
                      onClick={handleSubmit}
                      disabled={
                        submitting ||
                        loadingInitial ||
                        branches.length === 0
                      }
                    >
                      {submitting
                        ? 'Захиалга илгээж байна...'
                        : 'Онлайн захиалга илгээх'}
                    </Button>
                  </Stack>
                )}
              </CardContent>

              {/* Blur overlay when NOT logged in */}
              {!isLoggedIn && !loadingInitial && branches.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backdropFilter: 'blur(10px)',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Онлайн захиалга өгөхийн тулд эхлээд нэвтэрнэ үү.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      px: 4,
                    }}
                    onClick={handleOpenLogin}
                  >
                    Нэвтрэх
                  </Button>
                </Box>
              )}
            </Card>
          </Box>
        </Stack>
      </Container>

      <LoginDialog
        open={loginOpen}
        onClose={handleCloseLogin}
        onLoggedIn={handleLoggedIn}
      />
    </Box>
  );
};

export default OnlineBookingSection;

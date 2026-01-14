'use client';

import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Chip,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '@/lib/supabaseClient';

export type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  totalPoints: number;
  totalVisits: number;
  lastVisit: string | null;
  isActive: boolean;
};

const CustomersSection: React.FC = () => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] =
    React.useState<'all' | 'active' | 'inactive'>('all');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [formName, setFormName] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formTotalPoints, setFormTotalPoints] = React.useState('0');
  const [formTotalVisits, setFormTotalVisits] = React.useState('0');
  const [formLastVisit, setFormLastVisit] = React.useState('');
  const [formIsActive, setFormIsActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('customers')
      .select(
        'id, name, phone, email, total_points, total_visits, last_visit, is_active',
      )
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Error loading customers:', error);
      setLoading(false);
      return;
    }

    const list: Customer[] = (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name ?? '',
      phone: row.phone ?? null,
      email: row.email ?? null,
      totalPoints: row.total_points ?? 0,
      totalVisits: row.total_visits ?? 0,
      lastVisit: row.last_visit ? String(row.last_visit) : null,
      isActive: row.is_active ?? true,
    }));

    setCustomers(list);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();

    return customers.filter((c) => {
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;

      if (!s) return true;

      const haystack =
        `${c.name} ${c.phone ?? ''} ${c.email ?? ''}`.toLowerCase();
      return haystack.includes(s);
    });
  }, [customers, search, statusFilter]);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const totalPointsSum = customers.reduce(
    (sum, c) => sum + (c.totalPoints || 0),
    0,
  );

  const openEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormName(customer.name);
    setFormPhone(customer.phone ?? '');
    setFormEmail(customer.email ?? '');
    setFormTotalPoints(String(customer.totalPoints ?? 0));
    setFormTotalVisits(String(customer.totalVisits ?? 0));
    setFormLastVisit(customer.lastVisit ?? '');
    setFormIsActive(customer.isActive);
    setErrorMsg(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSave = async () => {
    setErrorMsg(null);

    if (editingId == null) return;

    const pointsNum = Number(formTotalPoints) || 0;
    const visitsNum = Number(formTotalVisits) || 0;

    const payload = {
      name: formName.trim() || null,
      phone: formPhone.trim() || null,
      email: formEmail.trim() || null,
      total_points: pointsNum,
      total_visits: visitsNum,
      last_visit: formLastVisit ? formLastVisit : null,
      is_active: formIsActive,
    };

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', editingId)
        .select(
          'id, name, phone, email, total_points, total_visits, last_visit, is_active',
        )
        .single();

      if (error || !data) {
        console.error('Update customer error:', error);
        setErrorMsg('Хэрэглэгч засахад алдаа гарлаа.');
        setSaving(false);
        return;
      }

      const updated: Customer = {
        id: data.id,
        name: data.name ?? '',
        phone: data.phone ?? null,
        email: data.email ?? null,
        totalPoints: data.total_points ?? 0,
        totalVisits: data.total_visits ?? 0,
        lastVisit: data.last_visit ? String(data.last_visit) : null,
        isActive: data.is_active ?? true,
      };

      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Хэрэглэгчид / Loyalty Оноо
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Хэрэглэгчийн мэдээлэл, оноо болон үйлчлэлийн статистикийг эндээс
          хянаж удирдана. Хэрэглэгчид өөрсдөө бүртгэл үүсгэнэ.
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        mb={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          flex={1}
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
              Нийт хэрэглэгч
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {loading ? '…' : totalCustomers}
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
              Идэвхтэй хэрэглэгч
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {loading ? '…' : activeCustomers}
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
              Нийт хуримтлагдсан оноо
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {loading ? '…' : totalPointsSum.toLocaleString('en-US')} оноо
            </Typography>
          </Paper>
        </Stack>
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
            size="small"
            label="Хайх (нэр, утас, имэйл)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">Төлөв</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Төлөв"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
            >
              <MenuItem value="all">Бүгд</MenuItem>
              <MenuItem value="active">Зөвхөн идэвхтэй</MenuItem>
              <MenuItem value="inactive">Зөвхөн идэвхгүй</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Хэрэглэгчдийн жагсаалт
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Нэр</TableCell>
                <TableCell>Холбогдох</TableCell>
                <TableCell align="right">Оноо</TableCell>
                <TableCell align="right">Үйлчлэл</TableCell>
                <TableCell>Сүүлийн үйлчлэл</TableCell>
                <TableCell>Төлөв</TableCell>
                <TableCell align="right">Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {c.name || '(нэргүй)'}
                    </Typography>
                    {c.email && (
                      <Typography variant="caption" color="text.secondary">
                        {c.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {c.phone || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {c.totalPoints.toLocaleString('en-US')} оноо
                  </TableCell>
                  <TableCell align="right">{c.totalVisits}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {c.lastVisit || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                      color={c.isActive ? 'success' : 'default'}
                      sx={{ fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      Хайлтын нөхцөлд тохирох хэрэглэгч олдсонгүй.
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
        <DialogTitle>Хэрэглэгч засах</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Нэр"
              fullWidth
              size="small"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Утас"
                fullWidth
                size="small"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
              <TextField
                label="Имэйл"
                fullWidth
                size="small"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Нийт оноо"
                type="number"
                size="small"
                fullWidth
                value={formTotalPoints}
                onChange={(e) => setFormTotalPoints(e.target.value)}
              />
              <TextField
                label="Нийт үйлчлэл"
                type="number"
                size="small"
                fullWidth
                value={formTotalVisits}
                onChange={(e) => setFormTotalVisits(e.target.value)}
              />
            </Stack>

            <TextField
              label="Сүүлийн үйлчлэлийн огноо"
              type="date"
              size="small"
              value={formLastVisit}
              onChange={(e) => setFormLastVisit(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Идэвхтэй хэрэглэгч"
            />

            {errorMsg && (
              <Typography variant="caption" color="error">
                {errorMsg}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{ textTransform: 'none' }}
            disabled={saving}
          >
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

export default CustomersSection;

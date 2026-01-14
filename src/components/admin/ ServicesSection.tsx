'use client';

import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { supabase } from '@/lib/supabaseClient';

export type ServiceCategory = 'skin' | 'hair';

export type Service = {
  id: number;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  isActive: boolean;
  description: string;
  branchPrices: {
    branchId: number;
    enabled: boolean;
    price: string;
  }[];
};

type BranchRef = {
  id: number;
  name: string;
};

type Props = {
  initialServices?: Service[];
  branches: BranchRef[];
};

const ServicesSection: React.FC<Props> = ({
  initialServices = [],
  branches,
}) => {
  const [services, setServices] = React.useState<Service[]>(initialServices);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [formName, setFormName] = React.useState('');
  const [formCategory, setFormCategory] =
    React.useState<ServiceCategory>('skin');
  const [formDuration, setFormDuration] = React.useState('60');
  const [formDescription, setFormDescription] = React.useState('');
  const [formIsActive, setFormIsActive] = React.useState(true);
  const [formBranchPrices, setFormBranchPrices] = React.useState<
    { branchId: number; enabled: boolean; price: string }[]
  >([]);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (branches.length === 0) return;

    const fetchServices = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('services')
        .select(
          `
          id,
          name,
          category,
          description,
          duration_minutes,
          is_active,
          service_branch_prices (
            branch_id,
            enabled,
            price
          )
        `,
        )
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading services:', error);
        setLoading(false);
        return;
      }

      const list: Service[] = (data ?? []).map((row: any) => {
        const prices = (row.service_branch_prices ?? []) as any[];
        const branchPrices = branches.map((b) => {
          const found = prices.find((p) => p.branch_id === b.id);
          return {
            branchId: b.id,
            enabled: found ? !!found.enabled : false,
            price:
              found && found.price != null ? String(found.price) : '',
          };
        });

        const cat: ServiceCategory =
          row.category === 'hair' ? 'hair' : 'skin';

        return {
          id: row.id,
          name: row.name ?? '',
          category: cat,
          description: row.description ?? '',
          durationMinutes: row.duration_minutes ?? 60,
          isActive: row.is_active ?? true,
          branchPrices,
        };
      });

      setServices(list);
      setLoading(false);
    };

    fetchServices();
  }, [branches]);

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    setFormName('');
    setFormCategory('skin');
    setFormDuration('60');
    setFormDescription('');
    setFormIsActive(true);
    setFormBranchPrices(
      branches.map((b) => ({
        branchId: b.id,
        enabled: false,
        price: '',
      })),
    );
    setErrorMsg(null);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setMode('edit');
    setEditingId(service.id);
    setFormName(service.name);
    setFormCategory(service.category);
    setFormDuration(String(service.durationMinutes));
    setFormDescription(service.description);
    setFormIsActive(service.isActive);

    const bp = branches.map((b) => {
      const found = service.branchPrices.find(
        (p) => p.branchId === b.id,
      );
      return (
        found || {
          branchId: b.id,
          enabled: false,
          price: '',
        }
      );
    });

    setFormBranchPrices(bp);
    setErrorMsg(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const updateBranchPrice = (
    branchId: number,
    field: 'enabled' | 'price',
    value: boolean | string,
  ) => {
    setFormBranchPrices((prev) =>
      prev.map((bp) =>
        bp.branchId === branchId
          ? { ...bp, [field]: value }
          : bp,
      ),
    );
  };

  const handleSave = async () => {
    setErrorMsg(null);

    if (!formName.trim()) {
      setErrorMsg('Үйлчилгээний нэрийг оруулна уу.');
      return;
    }

    const durationNum = Number(formDuration) || 0;
    if (durationNum <= 0) {
      setErrorMsg('Үйлчилгээний хугацааг зөв оруулна уу (минут).');
      return;
    }

    const baseServicePayload = {
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim(),
      duration_minutes: durationNum,
      is_active: formIsActive,
    };

    const priceRows = formBranchPrices.map((bp) => ({
      service_id: editingId ?? null,
      branch_id: bp.branchId,
      enabled: bp.enabled,
      price:
        bp.enabled && bp.price.trim() !== ''
          ? Number(bp.price)
          : 0,
    }));

    setSaving(true);

    try {
      let serviceId = editingId;

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('services')
          .insert(baseServicePayload)
          .select(
            'id, name, category, description, duration_minutes, is_active',
          )
          .single();

        if (error || !data) {
          console.error('Insert service error:', error);
          setErrorMsg('Үйлчилгээ нэмэхэд алдаа гарлаа.');
          setSaving(false);
          return;
        }

        serviceId = data.id;

        priceRows.forEach((row) => {
          row.service_id = serviceId!;
        });

        const { error: priceError } = await supabase
          .from('service_branch_prices')
          .upsert(priceRows, {
            onConflict: 'service_id, branch_id',
          });

        if (priceError) {
          console.error('Insert price error:', priceError);
          setErrorMsg(
            'Үнийн тохиргоог хадгалахад алдаа гарлаа.',
          );
        }

        const newService: Service = {
          id: data.id,
          name: data.name ?? '',
          category:
            data.category === 'hair' ? 'hair' : 'skin',
          description: data.description ?? '',
          durationMinutes: data.duration_minutes ?? 60,
          isActive: data.is_active ?? true,
          branchPrices: formBranchPrices,
        };

        setServices((prev) => [...prev, newService]);
        setDialogOpen(false);
      } else if (mode === 'edit' && serviceId != null) {
        const { data, error } = await supabase
          .from('services')
          .update(baseServicePayload)
          .eq('id', serviceId)
          .select(
            'id, name, category, description, duration_minutes, is_active',
          )
          .single();

        if (error || !data) {
          console.error('Update service error:', error);
          setErrorMsg('Үйлчилгээ засахад алдаа гарлаа.');
          setSaving(false);
          return;
        }

        priceRows.forEach((row) => {
          row.service_id = serviceId!;
        });

        const { error: priceError } = await supabase
          .from('service_branch_prices')
          .upsert(priceRows, {
            onConflict: 'service_id, branch_id',
          });

        if (priceError) {
          console.error('Update price error:', priceError);
          setErrorMsg(
            'Үнийн тохиргоог хадгалахад алдаа гарлаа.',
          );
        }

        const updated: Service = {
          id: data.id,
          name: data.name ?? '',
          category:
            data.category === 'hair' ? 'hair' : 'skin',
          description: data.description ?? '',
          durationMinutes: data.duration_minutes ?? 60,
          isActive: data.is_active ?? true,
          branchPrices: formBranchPrices,
        };

        setServices((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        setDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: Service) => {
    const ok = window.confirm(
      `"${service.name}" үйлчилгээг устгах уу? Холбоотой захиалгууд байвал гараар засварлах шаардлагатай.`,
    );
    if (!ok) return;

    setDeletingId(service.id);

    try {
      const { error: priceError } = await supabase
        .from('service_branch_prices')
        .delete()
        .eq('service_id', service.id);

      if (priceError) {
        console.error('Delete service_branch_prices error:', priceError);
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (error) {
        console.error('Delete service error:', error);
        alert('Үйлчилгээ устгахад алдаа гарлаа. Холбоотой захиалга байж магадгүй.');
        return;
      }

      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Үйлчилгээ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Арьс, үс арчилгааны бүх үйлчилгээг салбар бүрийн үнэтэй нь хамт
          удирдана.
        </Typography>
      </Stack>

      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          boxShadow: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Нийт үйлчилгээ: <strong>{services.length}</strong>
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none' }}
          onClick={openCreate}
        >
          Үйлчилгээ нэмэх
        </Button>
      </Paper>

      <Stack spacing={2}>
        {loading && services.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Үйлчилгээнүүдийг ачаалж байна...
          </Typography>
        )}

        {!loading && services.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Одоогоор үйлчилгээ бүртгэгдээгүй байна. &quot;Үйлчилгээ
            нэмэх&quot; товчоор шинээр үүсгэнэ үү.
          </Typography>
        )}

        {services.map((service) => (
          <Paper
            key={service.id}
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  mb={0.5}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600 }}
                  >
                    {service.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      service.category === 'hair'
                        ? 'Үс'
                        : 'Арьс'
                    }
                    color={service.category === 'hair' ? 'info' : 'primary'}
                    sx={{ fontSize: 11 }}
                  />
                  <Chip
                    size="small"
                    label={service.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                    color={service.isActive ? 'success' : 'default'}
                    sx={{ fontSize: 11 }}
                  />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {service.description ||
                    'Тайлбар оруулаагүй байна.'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Үргэлжлэх хугацаа: {service.durationMinutes} минут
                </Typography>

                <Box sx={{ mt: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Салбар тус бүрийн үнэ:
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                  >
                    {branches.map((b) => {
                      const bp = service.branchPrices.find(
                        (p) => p.branchId === b.id,
                      );
                      const enabled = bp?.enabled;
                      const price = bp?.price;

                      return (
                        <Chip
                          key={b.id}
                          size="small"
                          label={
                            enabled && price
                              ? `${b.name}: ${Number(
                                  price,
                                ).toLocaleString('en-US')} ₮`
                              : `${b.name}: идэвхгүй`
                          }
                          color={enabled ? 'primary' : 'default'}
                          sx={{ fontSize: 11 }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </Box>

              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => openEdit(service)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(service)}
                  disabled={deletingId === service.id}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {mode === 'create'
            ? 'Үйлчилгээ нэмэх'
            : 'Үйлчилгээ засах'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Үйлчилгээний нэр"
              fullWidth
              size="small"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="category-label">
                  Төрөл
                </InputLabel>
                <Select
                  labelId="category-label"
                  label="Төрөл"
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(
                      e.target.value as ServiceCategory,
                    )
                  }
                >
                  <MenuItem value="skin">Арьс / Facial</MenuItem>
                  <MenuItem value="hair">Үс / Hair</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Хугацаа (минут)"
                type="number"
                size="small"
                fullWidth
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
              />
            </Stack>

            <TextField
              label="Тайлбар"
              fullWidth
              size="small"
              multiline
              minRows={2}
              value={formDescription}
              onChange={(e) =>
                setFormDescription(e.target.value)
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formIsActive}
                  onChange={(e) =>
                    setFormIsActive(e.target.checked)
                  }
                  color="primary"
                />
              }
              label="Идэвхтэй үйлчилгээ"
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
              >
                Салбарын үнэ
              </Typography>
              <Stack spacing={1.5}>
                {branches.map((b) => {
                  const bp =
                    formBranchPrices.find(
                      (p) => p.branchId === b.id,
                    ) || {
                      branchId: b.id,
                      enabled: false,
                      price: '',
                    };

                  return (
                    <Stack
                      key={b.id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bp.enabled}
                            onChange={(e) =>
                              updateBranchPrice(
                                b.id,
                                'enabled',
                                e.target.checked,
                              )
                            }
                            color="primary"
                          />
                        }
                        label={b.name}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Үнэ (₮)"
                        type="number"
                        size="small"
                        sx={{ width: 160 }}
                        disabled={!bp.enabled}
                        value={bp.price}
                        onChange={(e) =>
                          updateBranchPrice(
                            b.id,
                            'price',
                            e.target.value,
                          )
                        }
                      />
                    </Stack>
                  );
                })}
              </Stack>
            </Box>

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

export default ServicesSection;

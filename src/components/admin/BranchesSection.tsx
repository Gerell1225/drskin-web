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
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MapIcon from '@mui/icons-material/Map';
import { supabase } from '@/lib/supabaseClient';

export type Branch = {
  id: number;
  name: string;
  location: string;
  phone: string;
  isActive: boolean;
  capacitySkin: number;
  capacityHair: number;
  mapUrl: string;
};

type Props = {
  initialBranches?: Branch[];
};

const BranchesSection: React.FC<Props> = ({ initialBranches = [] }) => {
  const [branches, setBranches] = React.useState<Branch[]>(initialBranches);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [formName, setFormName] = React.useState('');
  const [formLocation, setFormLocation] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formCapacitySkin, setFormCapacitySkin] = React.useState('0');
  const [formCapacityHair, setFormCapacityHair] = React.useState('0');
  const [formMapUrl, setFormMapUrl] = React.useState('');
  const [formIsActive, setFormIsActive] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('branches')
        .select(
          `
            id,
            name,
            location,
            phone,
            is_active,
            capacity_skin,
            capacity_hair,
            map_url
          `,
        )
        .order('id', { ascending: true });

      if (error) {
        console.error('Error loading branches:', error);
        setLoading(false);
        return;
      }

      const list: Branch[] = (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name ?? '',
        location: row.location ?? '',
        phone: row.phone ?? '',
        isActive: row.is_active ?? true,
        capacitySkin: row.capacity_skin ?? 0,
        capacityHair: row.capacity_hair ?? 0,
        mapUrl: row.map_url ?? '',
      }));

      setBranches(list);
      setLoading(false);
    };

    fetchBranches();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormLocation('');
    setFormPhone('');
    setFormCapacitySkin('0');
    setFormCapacityHair('0');
    setFormMapUrl('');
    setFormIsActive(true);
    setErrorMsg(null);
  };

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setMode('edit');
    setEditingId(branch.id);
    setFormName(branch.name);
    setFormLocation(branch.location);
    setFormPhone(branch.phone);
    setFormCapacitySkin(String(branch.capacitySkin));
    setFormCapacityHair(String(branch.capacityHair));
    setFormMapUrl(branch.mapUrl);
    setFormIsActive(branch.isActive);
    setErrorMsg(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSave = async () => {
    setErrorMsg(null);

    if (!formName.trim()) {
      setErrorMsg('Салбарын нэрийг оруулна уу.');
      return;
    }

    const capSkin = Number(formCapacitySkin) || 0;
    const capHair = Number(formCapacityHair) || 0;

    const payload = {
      name: formName.trim(),
      location: formLocation.trim(),
      phone: formPhone.trim(),
      capacity_skin: capSkin,
      capacity_hair: capHair,
      map_url: formMapUrl.trim() || null,
      is_active: formIsActive,
    };

    setSaving(true);

    try {
      if (mode === 'create') {
        const { data, error } = await supabase
          .from('branches')
          .insert(payload)
          .select(
            'id, name, location, phone, is_active, capacity_skin, capacity_hair, map_url',
          )
          .single();

        if (error || !data) {
          console.error('Insert branch error:', error);
          setErrorMsg('Салбар нэмэхэд алдаа гарлаа.');
          setSaving(false);
          return;
        }

        const newBranch: Branch = {
          id: data.id,
          name: data.name ?? '',
          location: data.location ?? '',
          phone: data.phone ?? '',
          isActive: data.is_active ?? true,
          capacitySkin: data.capacity_skin ?? 0,
          capacityHair: data.capacity_hair ?? 0,
          mapUrl: data.map_url ?? '',
        };

        setBranches((prev) => [...prev, newBranch]);
        setDialogOpen(false);
      } else if (mode === 'edit' && editingId != null) {
        const { data, error } = await supabase
          .from('branches')
          .update(payload)
          .eq('id', editingId)
          .select(
            'id, name, location, phone, is_active, capacity_skin, capacity_hair, map_url',
          )
          .single();

        if (error || !data) {
          console.error('Update branch error:', error);
          setErrorMsg('Салбар засахад алдаа гарлаа.');
          setSaving(false);
          return;
        }

        const updated: Branch = {
          id: data.id,
          name: data.name ?? '',
          location: data.location ?? '',
          phone: data.phone ?? '',
          isActive: data.is_active ?? true,
          capacitySkin: data.capacity_skin ?? 0,
          capacityHair: data.capacity_hair ?? 0,
          mapUrl: data.map_url ?? '',
        };

        setBranches((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b)),
        );
        setDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    const ok = window.confirm(
      `"${branch.name}" салбарыг устгах уу?\nХэрэв энэ салбартай холбогдсон захиалга, үйлчилгээний үнэ байвал алдаа гарч магадгүй.`,
    );
    if (!ok) return;

    setDeletingId(branch.id);

    try {

      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branch.id);

      if (error) {
        console.error('Delete branch error:', error);
        alert(
          'Салбар устгахад алдаа гарлаа. Холбоотой захиалга эсвэл үнэ байж магадгүй.',
        );
        return;
      }

      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Салбарууд
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dr.Skin & Dr.Hair салбаруудын байршил, хүчин чадал (ор/үзлэгийн ор)
          болон идэвхжилтийг удирдана.
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
          Нийт салбар: <strong>{branches.length}</strong>
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none' }}
          onClick={openCreate}
        >
          Салбар нэмэх
        </Button>
      </Paper>

      <Stack spacing={2}>
        {loading && branches.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Салбаруудыг ачаалж байна...
          </Typography>
        )}

        {!loading && branches.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Одоогоор салбар бүртгэгдээгүй байна. &quot;Салбар нэмэх&quot;
            товчоор шинээр үүсгэнэ үү.
          </Typography>
        )}

        {branches.map((branch) => (
          <Paper
            key={branch.id}
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
                    {branch.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={branch.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                    color={branch.isActive ? 'success' : 'default'}
                    sx={{ fontSize: 11 }}
                  />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {branch.location || 'Байршлын мэдээлэл оруулаагүй.'}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 0.5 }}
                >
                  Утас: {branch.phone || '—'}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Арьсны ор: {branch.capacitySkin} • Үсний ор:{' '}
                  {branch.capacityHair}
                </Typography>

                {branch.mapUrl && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={<MapIcon />}
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: 'none', borderRadius: 999 }}
                    >
                      Газрын зураг
                    </Button>
                  </Box>
                )}
              </Box>

              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => openEdit(branch)}
                  aria-label="edit"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(branch)}
                  disabled={deletingId === branch.id}
                  aria-label="delete"
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
          {mode === 'create' ? 'Шинэ салбар нэмэх' : 'Салбар засах'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Салбарын нэр"
              fullWidth
              size="small"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <TextField
              label="Байршил / тайлбар"
              fullWidth
              size="small"
              multiline
              minRows={2}
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
            />

            <TextField
              label="Утас"
              fullWidth
              size="small"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              <TextField
                label="Арьсны ор (skin beds)"
                type="number"
                size="small"
                fullWidth
                value={formCapacitySkin}
                onChange={(e) => setFormCapacitySkin(e.target.value)}
              />
              <TextField
                label="Үсний ор (hair beds)"
                type="number"
                size="small"
                fullWidth
                value={formCapacityHair}
                onChange={(e) => setFormCapacityHair(e.target.value)}
              />
            </Stack>

            <TextField
              label="Google Maps URL"
              fullWidth
              size="small"
              value={formMapUrl}
              onChange={(e) => setFormMapUrl(e.target.value)}
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
              label="Идэвхтэй салбар"
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

export default BranchesSection;

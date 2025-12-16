'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from '@mui/material';

import BookingsSection from '@/components/admin/BookingsSection';
import BranchesSection from '@/components/admin/BranchesSection';
import CustomersSection from '@/components/admin/CustomersSection';
import DashboardSection from '@/components/admin/DashBoardSection';
import { supabase } from '@/lib/supabaseClient';
import ServicesSection from '@/components/admin/ ServicesSection';

const adminNavItems = [
  { id: 'dashboard', label: 'Хянах самбар' },
  { id: 'branches', label: 'Салбарууд' },
  { id: 'services', label: 'Үйлчилгээ' },
  { id: 'bookings', label: 'Захиалга' },
  { id: 'customers', label: 'Хэрэглэгчид' }
];

type BranchRefForServices = {
  id: number;
  name: string;
};

export default function AdminPage() {
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const isMobile = useMediaQuery('(max-width:960px)');

  const [branchesForServices, setBranchesForServices] = React.useState<
    BranchRefForServices[]
  >([]);

  React.useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error loading branches for services:', error);
        return;
      }

      const mapped: BranchRefForServices[] = (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name ?? '',
      }));

      setBranchesForServices(mapped);
    };

    fetchBranches();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <main>
      {/* Top bar */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          bgcolor: '#ffffff',
          py: 2,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Dr.Skin Admin
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
              href="/"
            >
              Main site
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ textTransform: 'none' }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Main layout */}
      <Box sx={{ bgcolor: '#fafafa', minHeight: 'calc(100vh - 64px)' }}>
        <Container
          maxWidth="lg"
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* Sidebar */}
          <Box
            sx={{
              width: { xs: '100%', md: 260 },
              flexShrink: 0,
            }}
          >
            <Paper
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Цэс
                </Typography>
              </Box>
              <Divider />
              <List dense disablePadding>
                {adminNavItems.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    sx={{
                      borderLeft:
                        activeSection === item.id
                          ? '3px solid #D42121'
                          : '3px solid transparent',
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>

            {isMobile && <Box sx={{ height: 12 }} />}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            {activeSection === 'dashboard' && <DashboardSection />}

            {activeSection === 'branches' && <BranchesSection />}

            {activeSection === 'services' && (
              <ServicesSection branches={branchesForServices} />
            )}

            {activeSection === 'bookings' && <BookingsSection />}

            {activeSection === 'customers' && <CustomersSection />}
          </Box>
        </Container>
      </Box>
    </main>
  );
}

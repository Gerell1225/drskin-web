'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import { supabase } from '@/lib/supabaseClient';

type ServiceBranchPriceRow = {
  price: number | null;
  enabled: boolean | null;
};

type ServiceRow = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  is_active?: boolean | null;
  service_branch_prices?: ServiceBranchPriceRow[];
};

const ServicesSection: React.FC = () => {
  const [services, setServices] = React.useState<ServiceRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('services')
        .select(
          `
          id,
          name,
          description,
          category,
          is_active,
          service_branch_prices (
            price,
            enabled
          )
        `,
        )
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading services:', error);
        setServices([]);
      } else {
        const list = (data ?? []) as ServiceRow[];

        const filtered = list.filter((s) => s.is_active !== false);

        setServices(filtered);
      }

      setLoading(false);
    };

    fetchServices();
  }, []);

  const isEmpty = !loading && services.length === 0;

  const getPriceText = (service: ServiceRow): string => {
    const prices =
      service.service_branch_prices
        ?.filter((p) => p.enabled !== false && p.price != null)
        .map((p) => Number(p.price)) ?? [];

    if (prices.length === 0) {
      return 'Үнэ: салбараас хамаарна';
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
      return `Үнэ: ${min.toLocaleString('en-US')} ₮`;
    }

    return `Үнэ: ${min.toLocaleString('en-US')} – ${max.toLocaleString(
      'en-US',
    )} ₮`;
  };

  const getCategoryLabel = (category: string | null) => {
    if (category === 'hair') return 'Hair';
    if (category === 'skin') return 'Facial & Skin';
    return '';
  };

  return (
    <Box
      id="services"
      sx={{
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1, textAlign: 'left' }}
            >
              Үйлчилгээ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Арьс, үс арчилгааны үндсэн болон дээд зэрэглэлийн багцууд.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 999,
              },
            }}
          >
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={`skeleton-${i}`}
                  sx={{
                    minWidth: 260,
                    maxWidth: 280,
                    flex: '0 0 auto',
                    borderRadius: 4,
                    boxShadow: 3,
                  }}
                >
                  <CardContent>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={40}
                      sx={{ mt: 2, borderRadius: 2 }}
                    />
                  </CardContent>
                </Card>
              ))}

            {!loading &&
              services.map((service) => (
                <Card
                  key={service.id}
                  sx={{
                    minWidth: 260,
                    maxWidth: 280,
                    flex: '0 0 auto',
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    ':hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    {service.category && (
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ textTransform: 'uppercase', mb: 1 }}
                      >
                        {getCategoryLabel(service.category)}
                      </Typography>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {service.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {service.description ||
                        'Dr.Skin эмч нарын мэргэжлийн үйлчилгээ.'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getPriceText(service)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}

            {isEmpty && (
              <Box
                sx={{
                  minWidth: 260,
                  maxWidth: 280,
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  border: '1px dashed',
                  borderColor: 'grey.300',
                  p: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Одоогоор үйлчилгээ бүртгэгдээгүй байна.
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ServicesSection;

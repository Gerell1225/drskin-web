'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  Skeleton,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { supabase } from '@/lib/supabaseClient';

type BranchRow = {
  id: number;
  name: string;
  location: string | null;
  map_url: string | null;
};

const BranchesSection: React.FC = () => {
  const [branches, setBranches] = React.useState<BranchRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('branches')
        .select('id, name, location, map_url')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading branches:', error);
        setBranches([]);
      } else {
        setBranches((data ?? []) as BranchRow[]);
      }

      setLoading(false);
    };

    fetchBranches();
  }, []);

  const isEmpty = !loading && branches.length === 0;

  return (
    <Box
      id="branches"
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: '#fff',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1, textAlign: 'left' }}
            >
              Манай салбарууд
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Хотын гол бүсүүдэд байрлах Dr.Skin &amp; Dr.Hair салбаруудаа
              сонгон үйлчлүүлээрэй.
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
              Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={`branch-skeleton-${i}`}
                  sx={{
                    minWidth: 280,
                    maxWidth: 320,
                    flex: '0 0 auto',
                    borderRadius: 4,
                    boxShadow: 3,
                  }}
                >
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="50%" />
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={36}
                      sx={{ borderRadius: 999 }}
                    />
                  </CardActions>
                </Card>
              ))}

            {!loading &&
              branches.map((branch) => (
                <Card
                  key={branch.id}
                  sx={{
                    minWidth: 280,
                    maxWidth: 320,
                    flex: '0 0 auto',
                    borderRadius: 4,
                    boxShadow: 3,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {branch.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5 }}
                    >
                      {branch.location ||
                        'Салоны байршлын дэлгэрэнгүй мэдээлэл удахгүй.'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 2, display: 'block' }}
                    >
                      Ажлын цаг: 10:00 – 21:00
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<MapIcon />}
                      {...(branch.map_url
                        ? {
                            href: branch.map_url,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          }
                        : { disabled: true })}
                      sx={{ textTransform: 'none', borderRadius: 999 }}
                    >
                      Газрын зураг
                    </Button>
                  </CardActions>
                </Card>
              ))}

            {isEmpty && (
              <Box
                sx={{
                  minWidth: 280,
                  maxWidth: 320,
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
                  Одоогоор салбар бүртгэгдээгүй байна.
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default BranchesSection;

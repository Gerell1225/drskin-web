'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { supabase } from '@/lib/supabaseClient';
import LoginDialog from '@/components/auth/LoginDialog';
import ProfileDrawer from '@/components/auth/ProfileDrawer';

const navItems = [
  { id: 'services', label: 'Үйлчилгээ' },
  { id: 'branches', label: 'Салбарууд' },
];

function scrollToId(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width:900px)');

  React.useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setIsLoggedIn(true);
        setUserEmail(data.user.email ?? null);
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
      }
    };
    checkUser();
  }, []);

  const handleNavClick = (id: string) => {
    scrollToId(id);
    setDrawerOpen(false);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      setProfileOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  const handleCloseLogin = () => setLoginOpen(false);

  const handleLoggedIn = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setIsLoggedIn(true);
      setUserEmail(data.user.email ?? null);
      setLoginOpen(false);
      setProfileOpen(true);
    }
  };

  const handleLoggedOut = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setProfileOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundColor: '#ffffff',
          color: '#111',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => scrollToId('top')}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              Dr.Skin &amp; Dr.Hair
            </Typography>
          </Box>

          {!isMobile && (
            <Stack direction="row" spacing={3} alignItems="center">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  color="inherit"
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}

          {!isMobile && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack direction="row" spacing={1}>
                <IconButton
                  component="a"
                  href="https://www.facebook.com/BudDr.SkinProFacial"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.300',
                  }}
                >
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://www.instagram.com/dr.skin_beauty_salon/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.300',
                  }}
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Button
                variant="contained"
                color="primary"
                startIcon={isLoggedIn ? <AccountCircleIcon /> : <LoginIcon />}
                sx={{ borderRadius: 999, textTransform: 'none', px: 2.5 }}
                onClick={handleAuthClick}
              >
                {isLoggedIn ? userEmail || 'Профайл' : 'Нэвтрэх'}
              </Button>
            </Stack>
          )}

          {isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                color="primary"
                size="small"
                aria-label="login"
                onClick={handleAuthClick}
              >
                {isLoggedIn ? <AccountCircleIcon /> : <LoginIcon />}
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => setDrawerOpen(true)}
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton onClick={() => handleNavClick(item.id)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={isLoggedIn ? <AccountCircleIcon /> : <LoginIcon />}
              sx={{ borderRadius: 999, textTransform: 'none' }}
              onClick={handleAuthClick}
            >
              {isLoggedIn ? userEmail || 'Профайл' : 'Нэвтрэх'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <LoginDialog
        open={loginOpen}
        onClose={handleCloseLogin}
        onLoggedIn={handleLoggedIn}
      />

      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLoggedOut={handleLoggedOut}
      />
    </>
  );
};

export default Header;

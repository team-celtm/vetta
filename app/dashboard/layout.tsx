//app/dashboard/layout.tsx
"use client"
import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Avatar,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Storage as StorageIcon,
  TuneOutlined as TuneIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 64;

const NAV_ITEMS = [
  { icon: <SearchIcon fontSize="small" />, label: 'Smart Match', href: '/dashboard' },
  { icon: <PeopleIcon fontSize="small" />, label: 'Talent Pipeline', href: '/dashboard/talentpipeline' },
  { icon: <BarChartIcon fontSize="small" />, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: <StorageIcon fontSize="small" />, label: 'Talent Pool', href: '/dashboard/talentpool' },
  { icon: <TuneIcon fontSize="small" />, label: 'Settings', href: '/dashboard/settings' },
];

// ─── Sidebar Content ──────────────────────────────────────────────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNav = (href: string) => {
    router.push(href);
    onClose?.();
  };

  const handleLogout = () => {
    router.push('/login');
    onClose?.();
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        backgroundColor: '#0F1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          backgroundColor: '#1A35E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: 14,
          color: '#fff',
          letterSpacing: '-0.5px',
          flexShrink: 0,
        }}
        onClick={() => handleNav('/dashboard')}
      >
        V
      </Box>

      {/* Nav Items */}
      <List disablePadding sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href} title={item.label} placement="right" arrow>
              <ListItemButton
                onClick={() => handleNav(item.href)}
                sx={{
                  minHeight: 40,
                  borderRadius: '8px',
                  justifyContent: 'center',
                  px: 0,
                  backgroundColor: isActive ? 'rgba(26, 53, 232, 0.25)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? 'rgba(26, 53, 232, 0.35)'
                      : 'rgba(255,255,255,0.07)',
                  },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: isActive ? '#1A35E8' : 'rgba(255,255,255,0.45)',
                    '& svg': { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ width: 36, borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />

      {/* Logout */}
      <Tooltip title="Logout" placement="right" arrow>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            justifyContent: 'center',
            px: 0,
            mb: 1.5,
            '&:hover': { backgroundColor: 'rgba(255,80,80,0.15)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, color: 'rgba(255,255,255,0.35)' }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
        </ListItemButton>
      </Tooltip>

      {/* User Avatar */}
      <Tooltip title="Your profile" placement="right" arrow>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: '#1A35E8',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: '2px solid rgba(26,53,232,0.4)',
          }}
        >
          SA
        </Avatar>
      </Tooltip>
    </Box>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#F5F2EC' }}>

      {/* ── Desktop permanent sidebar ── */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              p: 0,
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* ── Mobile temporary drawer ── */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              p: 0,
            },
          }}
        >
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </Drawer>
      )}

      {/* ── Main content ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Mobile top bar with hamburger */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              bgcolor: '#0F1117',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          >
            <IconButton
              onClick={() => setMobileOpen(true)}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', p: 0.5 }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: '#1A35E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                color: '#fff',
              }}
            >
              V
            </Box>
          </Box>
        )}

        {children}
      </Box>
    </Box>
  );
}
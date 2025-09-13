'use client';

import { AppBar, Toolbar, Typography, Box, IconButton, Avatar } from '@mui/material';
import Image from 'next/image';

export default function Header() {
  return (
    <AppBar position="static" elevation={2} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 72 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Image src="/globe.svg" alt="OpenAvenue Logo" width={36} height={36} />
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Real-Estate Analyzer
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Placeholder for future actions, e.g., user avatar or nav */}
          <IconButton>
            <Avatar alt="User" src="/vercel.svg" sx={{ width: 36, height: 36 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

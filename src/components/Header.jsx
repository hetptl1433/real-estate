'use client';

import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Tooltip, Button } from '@mui/material';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #f5f7fa 0%, #c3cfe2 100%)',
        color: 'text.primary',
        boxShadow: '0 2px 12px 0 rgba(60,72,88,0.08)',
        borderRadius: 3,
        borderBottom: 1,
        borderColor: 'divider',
        px: 0,
        py: 0,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 80,
          width: '100%',
          px: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
            px: 3,
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { opacity: 0.9 } }}>
            <Image src="/images/logo_house_check.svg" alt="RealEstate" width={44} height={44} style={{ borderRadius: '8px' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1, color: '#2d3748', lineHeight: 1.2 }}>
                Real-Estate Analyzer
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#718096', fontWeight: 400, letterSpacing: 0.5, lineHeight: 1.2 }}>
                Your smart property insights
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {session ? (
              <>
                <Typography sx={{ fontWeight: 600, color: '#2d3748', mr: 1, fontSize: 16, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.user.name || session.user.email}
                </Typography>
                <Tooltip title="Profile">
                  <IconButton sx={{
                    transition: 'box-shadow 0.2s',
                    boxShadow: '0 0 0 0 rgba(0,0,0,0)',
                    '&:hover': {
                      boxShadow: '0 4px 16px 0 rgba(60,72,88,0.12)',
                      background: '#e2e8f0',
                    },
                  }}>
                    <Avatar alt="User" src={session.user.image || '/vercel.svg'} sx={{ width: 40, height: 40, border: '2px solid #c3cfe2' }} />
                  </IconButton>
                </Tooltip>
                <Button variant="outlined" color="primary" size="small" sx={{ ml: 2, borderRadius: 2, textTransform: 'none', fontWeight: 500, minWidth: 80 }} onClick={() => signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500, minWidth: 80 }} onClick={() => signIn()}>
                Sign in
              </Button>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

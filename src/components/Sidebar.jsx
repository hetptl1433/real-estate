'use client';

import { Box, List, ListItemButton, ListItemText } from '@mui/material';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Map', href: '/map' },
  { label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  return (
    <Box sx={{ borderRight: '1px solid #eee', height: '100%', overflow: 'auto', bgcolor: 'white' }}>
      <List dense>
        {items.map((it) => (
          <ListItemButton key={it.label} href={it.href}>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

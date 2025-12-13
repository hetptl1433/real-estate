
'use client';

import Layout from '../components/Layout';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Layout>
      <Box
        sx={{
          p: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            bgcolor: 'grey.900',
            color: 'common.white',
            px: { xs: 4, md: 6 },
            py: { xs: 6, md: 8 },
            display: 'grid',
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 15% 15%, rgba(59,130,246,0.45), transparent 55%), radial-gradient(circle at 85% 20%, rgba(236,72,153,0.35), transparent 45%), radial-gradient(circle at 40% 80%, rgba(16,185,129,0.45), transparent 55%)',
            }}
          />
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Box sx={{ maxWidth: 560 }}>
              <Chip
                label="Real-Estate Analyzer"
                color="primary"
                sx={{ color: 'common.white', bgcolor: 'rgba(59,130,246,0.35)', mb: 2 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Discover parcels faster, act with confidence.
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mt: 2 }}>
                Use the interactive map to analyze parcels, pull deep property insights, and visualize street-level context in seconds.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                Brought to you by HP Tech.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={Link}
                  href="/map"
                  variant="contained"
                  size="large"
                  endIcon={<Box component="span" sx={{ fontSize: 20, lineHeight: 1 }}>→</Box>}
                  sx={{ borderRadius: 999 }}
                >
                  Launch map
                </Button>
                <Button
                  component={Link}
                  href="/settings"
                  variant="outlined"
                  size="large"
                  endIcon={<Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>⚙️</Box>}
                  sx={{ borderRadius: 999, color: 'common.white', borderColor: 'rgba(255,255,255,0.4)' }}
                >
                  Adjust settings
                </Button>
              </Stack>
            </Box>
            <Card
              sx={{
                width: 320,
                bgcolor: 'rgba(15,23,42,0.85)',
                borderRadius: 4,
                border: '1px solid rgba(148,163,184,0.25)',
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 600 }}>
                    Quick metrics
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.75)' }}>
                    Your workspace snapshot
                  </Typography>
                }
              />
              <CardContent>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'common.white' }}>
                      124
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.7)' }}>
                      Active parcels tracked
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(148,163,184,0.3)' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'common.white' }}>
                      12
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.7)' }}>
                      New watchlist updates
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              title: 'Parcel intelligence',
              description:
                'Dive into ownership, zoning, FAR, and building metrics sourced from Reonomy with a single parcel click.',
              icon: '📊',
            },
            {
              title: 'Map-first workflow',
              description:
                'Search by address, highlight parcels instantly, and view Street View panoramas without leaving the map.',
              icon: '🗺️',
            },
            {
              title: 'Tailored preferences',
              description:
                'Control auto-open Street View, notifications, and privacy options so the experience matches your style.',
              icon: '⚙️',
            },
          ].map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.light', display: 'grid', placeItems: 'center', fontSize: 26 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ borderRadius: 3 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                ✓
              </Avatar>
            }
            title="Getting started checklist"
            subheader="Follow these steps to extract the most value quickly"
            action={
              <Button
                component={Link}
                href="/map"
                size="small"
                endIcon={<Box component="span" sx={{ fontSize: 16, lineHeight: 1 }}>→</Box>}
              >
                Go to map
              </Button>
            }
          />
          <CardContent>
            <List disablePadding>
              {[
                'Search for an address or parcel ID to center the map on your target property.',
                'Click a parcel outline to reveal deep property metrics from Reonomy.',
                'Toggle Street View in Settings if you prefer an automatic panoramic preview.',
                'Save map views or share parcel IDs with your team for follow-up analysis.',
              ].map((item, idx) => (
                <ListItem key={item} sx={{ alignItems: 'flex-start', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Chip
                      label={idx + 1}
                      color="primary"
                      size="small"
                      sx={{ borderRadius: '50%', width: 28, height: 28 }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

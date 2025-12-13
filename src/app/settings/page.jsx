'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  Alert,
} from '@mui/material';
import { DEFAULT_SETTINGS, readStoredSettings, writeStoredSettings } from '../../lib/userSettings';

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hasSaved, setHasSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setSettings(readStoredSettings());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    writeStoredSettings(settings);
    setHasSaved(true);
    const timeout =
      typeof window !== 'undefined'
        ? window.setTimeout(() => setHasSaved(false), 2000)
        : null;
    return () => {
      if (timeout && typeof window !== 'undefined') {
        window.clearTimeout(timeout);
      }
    };
  }, [settings, initialized]);

  const handleToggle = (field) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const hasCustomSettings = useMemo(() => {
    return Object.entries(DEFAULT_SETTINGS).some(
      ([key, defaultValue]) => settings[key] !== defaultValue
    );
  }, [settings]);

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        px: { xs: 3, md: 5 },
        py: { xs: 4, md: 6 },
        minHeight: '100%',
      }}
    >
      <Box>
        <Typography variant="overline" color="text.secondary">
          Settings
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
          Customize your experience
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560 }}>
          Manage notification preferences, map defaults, and data sharing so the app works the way you do.
        </Typography>
      </Box>

      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3 }}>
          <CardHeader title="Notifications" subheader="Stay updated on parcel and market movements" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailAlerts}
                    onChange={handleToggle('emailAlerts')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Email alerts</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive a daily digest covering watchlist changes and zoning updates.
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardHeader title="Map Experience" subheader="Choose how parcels behave in map view" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoOpenStreetView}
                    onChange={handleToggle('autoOpenStreetView')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Auto-open Street View</Typography>
                    <Typography variant="body2" color="text.secondary">
                      When enabled, parcel selections launch the Street View dialog automatically.
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardHeader title="Privacy & Insights" subheader="Control what we learn from your usage" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.shareUsageInsights}
                    onChange={handleToggle('shareUsageInsights')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Share anonymized usage insights</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Help improve the product by allowing aggregated analytics on your interactions.
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={!hasCustomSettings}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          Reset to defaults
        </Button>
        {hasSaved && (
          <Alert severity="success" sx={{ flexGrow: 1, maxWidth: 360 }}>
            Preferences updated. Changes apply instantly across your session.
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

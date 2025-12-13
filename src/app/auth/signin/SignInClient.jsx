
"use client";

import { useEffect, useMemo, useState } from "react";
import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [csrfToken, setCsrfToken] = useState("");

  const showError = useMemo(() => Boolean(error), [error]);

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? ""));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "background.default"
            : "linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 40%, #dae7ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 6, sm: 8 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 960,
          display: "grid",
          gap: { xs: 4, md: 6 },
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          alignItems: "stretch",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 4, sm: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            borderRadius: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to access your real-estate intelligence dashboard and keep
            track of opportunities in seconds.
          </Typography>

          {showError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Invalid credentials. Please double-check your username and
              password.
            </Alert>
          )}

          <Box
            component="form"
            noValidate
            method="post"
            action="/api/auth/callback/credentials"
          >
            <input name="csrfToken" type="hidden" value={csrfToken} />
            <input name="callbackUrl" type="hidden" value="/" />

            <Stack spacing={3}>
              <TextField
                label="Username"
                name="username"
                type="text"
                autoComplete="username"
                fullWidth
                required
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ py: 1.2 }}
              >
                Sign in
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Trouble signing in?{" "}
            <Link component={NextLink} href="/support" underline="hover">
              Contact support
            </Link>
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "background.paper" : "#101c3d",
            color: "common.white",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            p: 6,
            borderRadius: 4,
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>
              Real Estate Analyzer
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, mb: 2 }}>
              Insights that keep you ahead.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85 }}>
              Explore parcels, surface opportunities, and collaborate with your
              team using a single intuitive workspace.
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} Meridian Capital Holdings · All rights
            reserved.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TaxAssessors from "../../components/TaxAssessors";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const userName = session.user.name || session.user.email || "Investor";

  const quickMetrics = [
    {
      label: "Active Parcels",
      value: "124",
      change: "+8.2%",
      glyph: "🏢",
      color: "primary",
    },
    {
      label: "Watchlist Updates",
      value: "12",
      change: "+3 new today",
      glyph: "⏱️",
      color: "secondary",
    },
    {
      label: "Opportunities",
      value: "5",
      change: "2 high priority",
      glyph: "📈",
      color: "success",
    },
  ];

  const mockPipelines = [
    { label: "Due Diligence", value: 60 },
    { label: "Negotiation", value: 35 },
    { label: "Under Contract", value: 22 },
  ];

  const activityItems = [
    {
      title: "Parcel 1009123 added to watchlist",
      description: "Upper West Side · 18k ft² lot",
      time: "2 hours ago",
    },
    {
      title: "Zoning change alert",
      description: "Chelsea district · R7 to R8",
      time: "Yesterday",
    },
    {
      title: "New sale comp available",
      description: "SoHo mixed-use · $1,250/ft²",
      time: "2 days ago",
    },
  ];

  const spotlightStats = [
    { label: "Vacancy rate", value: "4.2%" },
    { label: "Avg. sale price", value: "$1.3M" },
    { label: "New listings", value: "18 / 30 days" },
  ];

  const savedSearches = [
    {
      name: "Upper West Side · Multifamily",
      filters: ["FAR > 5", "Lot > 10k ft²", "Zoning R8"],
      updated: "Updated 3 days ago",
    },
    {
      name: "Brooklyn Industrial · Off-market",
      filters: ["Cap rate > 6%", "Asking < $15M"],
      updated: "Updated yesterday",
    },
    {
      name: "Midtown Retail · Streetscape",
      filters: ["Corner lot", "Foot traffic high"],
      updated: "Updated 5 days ago",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        px: { xs: 3, md: 5 },
        py: { xs: 4, md: 5 },
        gap: 4,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            Dashboard
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back, {userName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
            Stay on top of market activity, parcel performance, and zoning
            updates across your territory.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            component={Link}
            href="/map"
            variant="contained"
            size="large"
            startIcon={<Box component="span" sx={{ fontSize: 18 }}>🗺️</Box>}
            sx={{ borderRadius: 999 }}
          >
            Open Map
          </Button>
          <Button
            component={Link}
            href="/settings"
            variant="outlined"
            size="large"
            sx={{ borderRadius: 999 }}
          >
            Settings
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 260, md: 280 },
              bgcolor: "grey.900",
              color: "common.white",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 10% 20%, rgba(33,150,243,0.55), transparent 55%), radial-gradient(circle at 80% 0%, rgba(156,39,176,0.4), transparent 50%), radial-gradient(circle at 40% 80%, rgba(0,200,83,0.35), transparent 50%)",
                opacity: 0.9,
              }}
            />
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                p: { xs: 3, md: 4 },
                gap: 3,
              }}
            >
              <Box>
                <Chip
                  label="Market Spotlight"
                  color="primary"
                  sx={{ color: "common.white", bgcolor: "primary.main" }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 2 }}>
                  Manhattan Central · Q4 Outlook
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ opacity: 0.85, maxWidth: 520, mt: 1.5 }}
                >
                  Stabilizing vacancy and strong retail absorption signal an
                  opportunity to re-evaluate your repositioning strategy across
                  Broadway and Amsterdam corridors.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {spotlightStats.map((item) => (
                  <Grid item xs={12} sm={4} key={item.label}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.75 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Button
                component={Link}
                href="/map"
                variant="contained"
                color="secondary"
                endIcon={<Box component="span" sx={{ fontSize: 16 }}>→</Box>}
                sx={{ alignSelf: "flex-start", borderRadius: 999 }}
              >
                Explore on map
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "primary.light", color: "primary.dark" }}>
                  🔎
                </Avatar>
              }
              title="Saved Searches"
              subheader="Keep tabs on curated areas"
            />
            <CardContent>
              <List disablePadding>
                {savedSearches.map((search, index) => (
                  <Box key={search.name}>
                    <ListItem disableGutters alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600 }}>
                            {search.name}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ flexWrap: "wrap" }}
                            >
                              {search.filters.map((filter) => (
                                <Chip
                                  key={filter}
                                  size="small"
                                  label={filter}
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {search.updated}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < savedSearches.length - 1 && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </Box>
                ))}
              </List>
              <Button
                component={Link}
                href="/settings"
                size="small"
                sx={{ mt: 2 }}
              >
                Edit preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {quickMetrics.map((metric) => (
          <Grid item xs={12} md={4} key={metric.label}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: "divider",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 3,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: (theme) => theme.palette[metric.color].light,
                  color: (theme) => theme.palette[metric.color].dark,
                  width: 48,
                  height: 48,
                  mb: 1,
                }}
              >
                {metric.glyph}
              </Avatar>
              <Typography variant="overline" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {metric.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.change}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardHeader
              title="Pipeline Snapshot"
              subheader="Active deals and diligence stages"
            />
            <CardContent>
              <Stack spacing={3}>
                {mockPipelines.map((stage) => (
                  <Box key={stage.label}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        {stage.label}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${stage.value}%`}
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={stage.value}
                      sx={{ height: 10, borderRadius: 6 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardHeader title="Recent Activity" />
            <CardContent>
              <List disablePadding>
                {activityItems.map((item, index) => (
                  <Box key={item.title}>
                    <ListItem disablePadding alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.light" }}>📈</Avatar>
                      </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {item.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {item.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                    {index < activityItems.length - 1 && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardHeader
          title="Nearby Tax Assessors"
          subheader="Tap a property to see additional parcel information"
          action={
            <Button component={Link} href="/map" size="small">
              Explore on map
            </Button>
          }
        />
        <CardContent>
          <TaxAssessors />
        </CardContent>
      </Card>
    </Box>
  );
}

"use client";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import PostOverview from "@/app/(DashboardLayout)/components/dashboard/PostOverview";
import RecentPosts from "@/app/(DashboardLayout)/components/dashboard/RecentPosts";
import PostTrend from "@/app/(DashboardLayout)/components/dashboard/PostTrend";
import TopCategoriesTags from "@/app/(DashboardLayout)/components/dashboard/TopCategoriesTags";

const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <PostOverview />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <RecentPosts />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <PostTrend />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <TopCategoriesTags />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;

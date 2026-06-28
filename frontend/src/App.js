// src/App.js

import React from "react";
import "./theme.css";
import "@/App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppStateProvider } from "@/context/AppStateContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

import Login from "@/pages/Login";
import Register from "@/pages/Register";

import Dashboard from "@/pages/Dashboard";

import Habits from "@/pages/Habits";
import CreateHabit from "@/pages/CreateHabit";
import EditHabit from "@/pages/EditHabit";

import Tasks from "@/pages/Tasks";
import CreateTask from "@/pages/CreateTask";
import EditTask from "@/pages/EditTask";

import Rewards from "@/pages/Rewards";
import CreateReward from "@/pages/CreateReward";
import EditReward from "@/pages/EditReward";

import History from "@/pages/History";
import Achievements from "@/pages/Achievements";
import Quests from "@/pages/Quests";

import Onboarding from "@/pages/Onboarding";

import PrivacyPolicy from "@/pages/PrivacyPolicy";
import DeleteAccount from "@/pages/DeleteAccount";

import Settings from "@/pages/Settings";
import ChangePassword from "@/pages/ChangePassword";
import BillingSettings from "@/pages/BillingSettings";

import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import ThemeStore from "@/pages/ThemeStore";

import SocialFeed from "@/pages/SocialFeed";
import ActivityFeed from "@/pages/ActivityFeed";
import PublicActivity from "@/pages/PublicActivity";
import UserSearch from "@/pages/UserSearch";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import PublicProfile from "@/pages/PublicProfile";
import Followers from "@/pages/Followers";
import Following from "@/pages/Following";
import Notifications from "@/pages/Notifications";
import WeeklyRecap from "@/pages/WeeklyRecap";
import ChooseHabit from "@/pages/ChooseHabit";
import Orbits from "@/pages/Orbits";
import CreateOrbit from "@/pages/CreateOrbit";
import OrbitDetail from "@/pages/OrbitDetail";
import OrbitMembers from "@/pages/OrbitMembers";
import OrbitInvite from "@/pages/OrbitInvite";
import CreateOrbitGoal from "@/pages/CreateOrbitGoal";
import OrbitGrowthAnalytics from "@/pages/OrbitGrowthAnalytics";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTools from "@/pages/AdminTools";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import TemplateMarketplace from "@/pages/TemplateMarketplace";
import OrbitTimeline from "@/pages/OrbitTimeline";
import OrbitThemeSettings from "@/pages/OrbitThemeSettings";
import OrbitVerifications from "@/pages/OrbitVerifications";

const TOAST_OPTIONS = {
  style: {
    border: "2px solid #1E1E24",
    borderRadius: "12px",
    boxShadow: "4px 4px 0 0 #1E1E24",
    background: "white",
    color: "#1E1E24",
    fontWeight: 700,
  },
};

function AuthGate({ children }) {
  return children;
}

function Shell({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <ThemeProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={TOAST_OPTIONS}
              />

              <Routes>
                <Route
                  path="/login"
                  element={
                    <AuthGate>
                      <Login />
                    </AuthGate>
                  }
                />

                <Route
                  path="/register"
                  element={
                    <AuthGate>
                      <Register />
                    </AuthGate>
                  }
                />

                <Route
                  path="/privacy"
                  element={<PrivacyPolicy />}
                />
                <Route path="/orbit-invite/:token" element={<OrbitInvite />} />

                <Route
                  path="/delete-account"
                  element={<DeleteAccount />}
                />

                <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
                />

                <Route
                  path="/reset-password"
                  element={<ResetPassword />}
                />

                <Route
                  path="/"
                  element={
                    <Shell>
                      <Dashboard />
                    </Shell>
                  }
                />

                <Route
                  path="/onboarding"
                  element={
                    <Shell>
                      <Onboarding />
                    </Shell>
                  }
                />

                <Route
                  path="/habits"
                  element={
                    <Shell>
                      <Habits />
                    </Shell>
                  }
                />

                <Route
                  path="/habits/choose"
                  element={
                    <Shell>
                      <ChooseHabit />
                    </Shell>
                  }
                />

                <Route
                  path="/habits/new"
                  element={
                    <Shell>
                      <CreateHabit />
                    </Shell>
                  }
                />

                <Route
                  path="/habits/:habitId/edit"
                  element={
                    <Shell>
                      <EditHabit />
                    </Shell>
                  }
                />

                <Route
                  path="/tasks"
                  element={
                    <Shell>
                      <Tasks />
                    </Shell>
                  }
                />

                <Route
                  path="/tasks/new"
                  element={
                    <Shell>
                      <CreateTask />
                    </Shell>
                  }
                />

                <Route
                  path="/tasks/:taskId/edit"
                  element={
                    <Shell>
                      <EditTask />
                    </Shell>
                  }
                />

                <Route
                  path="/rewards"
                  element={
                    <Shell>
                      <Rewards />
                    </Shell>
                  }
                />

                <Route
                  path="/rewards/new"
                  element={
                    <Shell>
                      <CreateReward />
                    </Shell>
                  }
                />

                <Route
                  path="/rewards/:rewardId/edit"
                  element={
                    <Shell>
                      <EditReward />
                    </Shell>
                  }
                />

                <Route
                  path="/quests"
                  element={
                    <Shell>
                      <Quests />
                    </Shell>
                  }
                />

                <Route path="/projects" element={<Shell><Projects /></Shell>} />
                <Route path="/projects/:projectId" element={<Shell><ProjectDetail /></Shell>} />
                <Route path="/templates" element={<Shell><TemplateMarketplace /></Shell>} />
                <Route path="/orbits/:orbitId/timeline" element={<Shell><OrbitTimeline /></Shell>} />
                <Route path="/orbits/:orbitId/theme" element={<Shell><OrbitThemeSettings /></Shell>} />
                <Route path="/orbits/:orbitId/verifications" element={<Shell><OrbitVerifications /></Shell>} />
                <Route path="/orbits" element={<Shell><Orbits /></Shell>} />
                <Route path="/orbits/new" element={<Shell><CreateOrbit /></Shell>} />
                <Route path="/orbits/:orbitId" element={<Shell><OrbitDetail /></Shell>} />
                <Route path="/orbits/:orbitId/members" element={<Shell><OrbitMembers /></Shell>} />
                <Route path="/orbits/:orbitId/goals/new" element={<Shell><CreateOrbitGoal /></Shell>} />
                <Route path="/admin" element={<Shell><AdminDashboard /></Shell>} />
                <Route path="/admin/tools" element={<Shell><AdminTools /></Shell>} />
                <Route path="/admin/orbit-growth" element={<Shell><OrbitGrowthAnalytics /></Shell>} />

                <Route
                  path="/themes"
                  element={
                    <Shell>
                      <ThemeStore />
                    </Shell>
                  }
                />

                <Route
                  path="/achievements"
                  element={
                    <Shell>
                      <Achievements />
                    </Shell>
                  }
                />

                <Route
                  path="/history"
                  element={
                    <Shell>
                      <History />
                    </Shell>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <Shell>
                      <Settings />
                    </Shell>
                  }
                />

                <Route
                  path="/billing"
                  element={
                    <Shell>
                      <BillingSettings />
                    </Shell>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <Shell>
                      <ChangePassword />
                    </Shell>
                  }
                />

                <Route
                  path="/feed"
                  element={
                    <Shell>
                      <SocialFeed />
                    </Shell>
                  }
                />

                <Route
                  path="/activity"
                  element={
                    <Shell>
                      <ActivityFeed />
                    </Shell>
                  }
                />

                <Route
                  path="/people"
                  element={
                    <Shell>
                      <UserSearch />
                    </Shell>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <Shell>
                      <Notifications />
                    </Shell>
                  }
                />

                <Route
                  path="/weekly-recap"
                  element={
                    <Shell>
                      <WeeklyRecap />
                    </Shell>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <Shell>
                      <Profile />
                    </Shell>
                  }
                />

                <Route
                  path="/profile/edit"
                  element={
                    <Shell>
                      <EditProfile />
                    </Shell>
                  }
                />

                <Route
                  path="/u/:username"
                  element={
                    <Shell>
                      <PublicProfile />
                    </Shell>
                  }
                />

                <Route
                  path="/users/:userId/followers"
                  element={
                    <Shell>
                      <Followers />
                    </Shell>
                  }
                />

                <Route
                  path="/users/:userId/following"
                  element={
                    <Shell>
                      <Following />
                    </Shell>
                  }
                />

                <Route
                  path="/users/:userId/activity"
                  element={
                    <Shell>
                      <PublicActivity />
                    </Shell>
                  }
                />

                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />
              </Routes>
            </BrowserRouter>
          </AppStateProvider>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;

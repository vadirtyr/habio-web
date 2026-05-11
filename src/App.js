import React from "react";
import "./theme.css";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/context/AuthContext";
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
      <ThemeProvider>
        <AuthProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />

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

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AppStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
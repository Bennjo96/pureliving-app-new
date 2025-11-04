/*
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import AdminLogin from "../components/admin/AdminLogin";
import Dashboard from "../components/admin/Dashboard";
import UserManagement from "../components/admin/UserManagement";
import BookingManagement from "../components/admin/BookingManagement";
import AnalyticsPanel from "../components/admin/AnalyticsPanel";
import PaymentAnalytics from "../components/admin/PaymentAnalytics";
import Settings from "../components/admin/Settings";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* No authentication required for now */
 /*     <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
      <Route path="/admin/bookings" element={<AdminLayout><BookingManagement /></AdminLayout>} />
      <Route path="/admin/analytics" element={<AdminLayout><AnalyticsPanel /></AdminLayout>} />
      <Route path="/admin/payments" element={<AdminLayout><PaymentAnalytics /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
      
      {/* Default redirect to dashboard */
    
  /*    <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};

export default AdminRoutes; */

import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import AdminLogin from "../components/admin/AdminLogin";
import Dashboard from "../components/admin/Dashboard";
import UserManagement from "../components/admin/UserManagement";
import BookingManagement from "../components/admin/BookingManagement";
import AnalyticsPanel from "../components/admin/AnalyticsPanel";
import PaymentAnalytics from "../components/admin/PaymentAnalytics";
import Settings from "../components/admin/Settings";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin login page (not required if skipping auth) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 🔹 No authentication required for now */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <AdminLayout>
            <BookingManagement />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminLayout>
            <AnalyticsPanel />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminLayout>
            <PaymentAnalytics />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminLayout>
            <Settings />
          </AdminLayout>
        }
      />

      {/* Catch-all: Redirect any unknown /admin/* to /admin/dashboard */}
      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};

export default AdminRoutes;

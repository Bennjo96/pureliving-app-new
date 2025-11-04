import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import "./i18n";

/* -----------------------  Context Providers  ----------------------- */
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { GoogleMapsProvider } from "./contexts/GoogleMapsContext";

/* -----------------------  Global Components  ----------------------- */
import ScrollToTop from "./components/common/ScrollToTop";
import LoadingSpinner from "./components/common/LoadingSpinner";

/* -----------------------  Lazy‑loaded Pages  ----------------------- */
const HomePage = lazy(() => import(/* webpackChunkName: "home" */ "./components/HomePage"));
const OurServicesPage = lazy(() => import(/* webpackChunkName: "services" */ "./components/OurServicesPage"));
const PricingPage = lazy(() => import(/* webpackChunkName: "pricing" */ "./components/PricingPage"));
const LoginPage = lazy(() => import(/* webpackChunkName: "auth" */ "./components/LoginPage"));
const SignupPage = lazy(() => import(/* webpackChunkName: "auth" */ "./components/SignupPage"));
const ErrorPage = lazy(() => import("./components/ErrorPage"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));

/* ---- Booking flow ---- */
const BookingPage = lazy(() => import("./components/BookingPage"));
const LocationInputPage = lazy(() => import("./components/LocationInputPage.js"));
const BookingDetailsPage = lazy(() => import("./components/BookingDetailsPage"));
const PaymentPage = lazy(() => import("./components/PaymentPage"));
const BookingConfirmationPage = lazy(() => import("./components/BookingConfirmationPage"));
const ResumeBooking = lazy(() => import("./components/ResumeBooking"));
const ServiceCustomizationPage = lazy(() => import("./components/ServiceCustomizationPage"));
const CustomerDetailsPage = lazy(() => import("./components/CustomerDetailsPage"));

/* ---- Job Tracking & Ratings ---- */
const JobTrackingPage = lazy(() => import("./components/JobTrackingPage"));
const PostServiceRatingPage = lazy(() => import("./components/PostServiceRatingPage"));

/* ---- Customer ---- */
const CustomerLayout = lazy(() => import("./components/customer/CustomerLayout"));
const CustomerDashboard = lazy(() => import("./components/customer/CustomerDashboard"));
const CustomerProfile = lazy(() => import("./components/customer/CustomerProfile"));
const CustomerBookings = lazy(() => import("./components/customer/CustomerBookings"));
const SavedAddresses = lazy(() => import("./components/customer/SavedAddresses"));
const PaymentMethods = lazy(() => import("./components/customer/PaymentMethods"));
const CustomerReviews = lazy(() => import("./components/customer/CustomerReviews"));
const CustomerSettings = lazy(() => import("./components/customer/CustomerSettings"));
const CustomerNotFoundPage = lazy(() => import("./components/customer/CustomerNotFoundPage"));

/* ---- Admin ---- */
const AdminLoginPage = lazy(() => import("./components/admin/AdminLoginPage"));
const AdminSignupPage = lazy(() => import("./components/admin/AdminSignupPage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/admin/Dashboard"));
const UserManagement = lazy(() => import("./components/admin/UserManagement"));
const BookingManagement = lazy(() => import("./components/admin/BookingManagement"));
const AnalyticsPanel = lazy(() => import("./components/admin/AnalyticsPanel"));
const PaymentAnalytics = lazy(() => import("./components/admin/PaymentAnalytics"));
const SystemSettings = lazy(() => import("./components/admin/SystemSettings"));
const NotificationCenter = lazy(() => import("./components/admin/NotificationCenter"));
const CleanerManagement = lazy(() => import("./components/admin/CleanerManagement"));
const AdminInvitationsPage = lazy(() => import("./components/admin/AdminInvitationsPage"));
const AdminNotFoundPage = lazy(() => import("./components/admin/AdminNotFoundPage"));

/* ---- Cleaner ---- */
const CleanerLayout = lazy(() => import("./components/cleaner/CleanerLayout"));
const CleanerDashboard = lazy(() => import("./components/cleaner/CleanerDashboard"));
const JobList = lazy(() => import("./components/cleaner/JobList"));
const CleanerJobDetail = lazy(() => import("./components/cleaner/CleanerJobDetail"));
const CleanerCalendar = lazy(() => import("./components/cleaner/CleanerCalendar"));
const CleanerAvailability = lazy(() => import("./components/cleaner/CleanerAvailability"));
const CleanerEarnings = lazy(() => import("./components/cleaner/CleanerEarnings"));
const CleanerReviews = lazy(() => import("./components/cleaner/CleanerReviews"));
const CleanerProfile = lazy(() => import("./components/cleaner/CleanerProfile"));
const CleanerSettings = lazy(() => import("./components/cleaner/CleanerSettings"));
const CleanerNotFoundPage = lazy(() => import("./components/cleaner/CleanerNotFoundPage"));

/* ---- Messaging ---- */
const MessageCenter = lazy(() => import("./components/messages/MessageCenter"));
const Conversation = lazy(() => import("./components/messages/Conversation"));

/* -----------------------  Helpers  ----------------------- */
const SectionFallback = ({ message }) => <LoadingSpinner message={message} />;

const ROLES = {
  ADMIN: "admin",
  CLEANER: "cleaner",
  CUSTOMER: "customer",
  CLIENT: "client",
};

/*
  Role‑aware Route Guard.
  Shows global spinner while auth state is resolving, otherwise either
  renders nested routes or redirects to fallback.
*/
const ProtectedRoute = ({ allowedRoles, fallback = "/login" }) => {
  const { user, activeRole, loading } = useAuth();

  if (loading) return <SectionFallback message="Checking permissions…" />;

  const isAllowed =
    user && (!allowedRoles || allowedRoles.includes(activeRole));

  return isAllowed ? <Outlet /> : <Navigate to={fallback} replace />;
};

/* -----------------------  App  ----------------------- */
function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <NotificationProvider>
          <SettingsProvider>
            <GoogleMapsProvider>
              <Router>
                <ScrollToTop />
                {/* Global Suspense: each lazy page renders its own spinner in fallback */}
                <Suspense fallback={<SectionFallback message="Loading…" />}>
                  <Routes>
                    {/* ---------------- Public ---------------- */}
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="signup" element={<SignupPage />} />
                    <Route path="services" element={<OurServicesPage />} />
                    <Route path="location" element={<LocationInputPage />} />
                    <Route path="pricing" element={<PricingPage />} />
                    <Route path="error" element={<ErrorPage />} />

                    {/* ---------------- Booking ---------------- */}
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="booking/customize" element={<ServiceCustomizationPage />} />
                    <Route path="booking/details" element={<BookingDetailsPage />} />
                    <Route path="booking/customer-details" element={<CustomerDetailsPage />} />
                    <Route path="booking/payment" element={<PaymentPage />} />
                    <Route path="booking/confirmation" element={<BookingConfirmationPage />} />
                    <Route path="booking/resume/:bookingId" element={<ResumeBooking />} />
                    
                    {/* ---------------- Job Tracking & Rating ---------------- */}
                    <Route path="booking/track/:bookingId" element={<JobTrackingPage />} />
                    <Route path="booking/rate/:bookingId" element={<PostServiceRatingPage />} />

                    {/* ---------------- Customer ---------------- */}
                    <Route
                      element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.CLIENT]} />}
                    >
                      <Route path="customer" element={<CustomerLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<CustomerDashboard />} />
                        <Route path="profile" element={<CustomerProfile />} />
                        <Route path="bookings" element={<CustomerBookings />} />
                        <Route path="addresses" element={<SavedAddresses />} />
                        <Route path="payment-methods" element={<PaymentMethods />} />
                        <Route path="reviews" element={<CustomerReviews />} />
                        <Route path="settings" element={<CustomerSettings />} />
                        <Route path="*" element={<CustomerNotFoundPage />} />
                      </Route>
                    </Route>

                    {/* ---------------- Admin ---------------- */}
                    <Route path="admin/login" element={<AdminLoginPage />} />
                    <Route path="admin/signup" element={<AdminSignupPage />} />
                    <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} fallback="/admin/login" />}>
                      <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="cleaners" element={<CleanerManagement />} />
                        <Route path="bookings" element={<BookingManagement />} />
                        <Route path="analytics" element={<AnalyticsPanel />} />
                        <Route path="payments" element={<PaymentAnalytics />} />
                        <Route path="settings" element={<SystemSettings />} />
                        <Route path="notifications" element={<NotificationCenter />} />
                        <Route path="invitations" element={<AdminInvitationsPage />} />
                        <Route path="*" element={<AdminNotFoundPage />} />
                      </Route>
                    </Route>

                    {/* ---------------- Cleaner ---------------- */}
                    <Route element={<ProtectedRoute allowedRoles={[ROLES.CLEANER]} />}>
                      <Route path="cleaner" element={<CleanerLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<CleanerDashboard />} />
                        <Route path="jobs" element={<JobList />} />
                        <Route path="jobs/:jobId" element={<CleanerJobDetail />} />
                        <Route path="calendar" element={<CleanerCalendar />} />
                        <Route path="availability" element={<CleanerAvailability />} />
                        <Route path="earnings" element={<CleanerEarnings />} />
                        <Route path="reviews" element={<CleanerReviews />} />
                        <Route path="profile" element={<CleanerProfile />} />
                        <Route path="settings" element={<CleanerSettings />} />
                        <Route path="*" element={<CleanerNotFoundPage />} />
                      </Route>
                    </Route>

                    {/* ---------------- Messaging ---------------- */}
                    <Route element={<ProtectedRoute allowedRoles={Object.values(ROLES)} />}>
                      <Route path="messages" element={<MessageCenter />} />
                      <Route path="messages/:conversationId" element={<Conversation />} />
                    </Route>

                    {/* ---------------- Catch‑all ---------------- */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Router>
            </GoogleMapsProvider>
          </SettingsProvider>
        </NotificationProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
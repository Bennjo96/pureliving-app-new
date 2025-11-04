// src/components/Navbar.js
import React, { useEffect, useRef, useCallback, forwardRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { NavHashLink as BaseNavHashLink } from "react-router-hash-link";
import {
  Menu,
  X,
  Globe,
  Bell,
  Search,
  Sparkles,
  LogIn,
  LogOut,
  User,
  UserCircle,
  Users,
  Wrench,
  Calendar,
  Settings as Cog,
  Home,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import useToggle from "../hooks/useToggle";
import useOutsideClick from "../hooks/useOutsideClick";

/* ------------------------------------------------------------------ */
// Utility helpers
/* ------------------------------------------------------------------ */
// Custom NavHashLink wrapper to filter out isActive prop
const NavHashLink = forwardRef(({ isActive, ...props }, ref) => {
  return <BaseNavHashLink {...props} ref={ref} />;
});

// Fixed navItemClass to receive props object instead of direct isActive
const navItemClass = ({ isActive }) =>
  clsx(
    "font-medium py-2 flex items-center transition-colors",
    isActive
      ? "text-teal-100 border-b-2 border-teal-100"
      : "text-white hover:text-teal-100"
  );

export const ROLES = {
  ADMIN: "admin",
  CLEANER: "cleaner",
  CUSTOMER: "customer",
  CLIENT: "client",
};

/* ------------------------------------------------------------------ */
// Navbar component
/* ------------------------------------------------------------------ */
function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- state via hooks ---------------- */
  const mobileMenu = useToggle(false);
  const languageMenu = useToggle(false);
  const loginMenu = useToggle(false);
  const profileMenu = useToggle(false);
  const isScrolled = useToggle(false);
  const isLoggingOut = useToggle(false);

  /* ---------------- refs & outside‑click ---------------- */
  const langRef = useRef(null);
  const loginRef = useRef(null);
  const profileRef = useRef(null);
  useOutsideClick(langRef, languageMenu.close);
  useOutsideClick(loginRef, loginMenu.close);
  useOutsideClick(profileRef, profileMenu.close);

  /* ---------------- effects ---------------- */
  useEffect(() => {
    const onScroll = () => isScrolled.set(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route/hash change
  useEffect(() => mobileMenu.close(), [location.pathname, location.hash]);

  /* ---------------- callbacks ---------------- */
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    languageMenu.close();
  };

  const handleLogout = async () => {
    try {
      isLoggingOut.set(true);
      await logout();
      navigate("/");
    } finally {
      isLoggingOut.set(false);
      profileMenu.close();
    }
  };

  // Build nav links based on role
  const getLinks = useCallback(() => {
    // Using direct paths instead of hash links for Services and Pricing
    const base = [
      { name: t("Home"), path: "/", icon: <Home className="w-5 h-5" /> },
      { name: t("Services"), path: "/services" },
      { name: t("Pricing"), path: "/pricing", icon: <DollarSign className="w-5 h-5" /> },
    ];

    if (!user || !activeRole) return base;

    switch (activeRole) {
      case ROLES.ADMIN:
        return [
          ...base,
          { name: t("Admin Dashboard"), path: "/admin/dashboard" },
        ];
      case ROLES.CLEANER:
        return [
          ...base,
          { name: t("Cleaner Dashboard"), path: "/cleaner/dashboard" },
        ];
      case ROLES.CUSTOMER:
      case ROLES.CLIENT:
        return [
          ...base,
          { name: t("Customer Dashboard"), path: "/customer/dashboard" },
        ];
      default:
        return base;
    }
  }, [t, user, activeRole]);

  const navLinks = getLinks();

  /* ---------------- render ---------------- */
  return (
    <header
      className={clsx(
        "bg-teal-600 fixed top-0 w-full z-20 transition-all duration-300",
        isScrolled.value ? "py-2 shadow-md" : "py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/logo-clean.png"
            alt="Pureliving Helpers Logo"
            className={clsx(
              "transition-all duration-300",
              isScrolled.value ? "w-28 sm:w-32" : "w-32 sm:w-40"
            )}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex space-x-6 items-center">
          {/* Main nav links - Use direct NavLink components */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                "font-medium py-2 flex items-center transition-colors",
                isActive
                  ? "text-teal-100 border-b-2 border-teal-100"
                  : "text-white hover:text-teal-100"
              )
            }
          >
            <Home className="w-5 h-5 mr-2" /> {t("Home")}
          </NavLink>
          
          <NavLink
            to="/services"
            className={({ isActive }) =>
              clsx(
                "font-medium py-2 flex items-center transition-colors",
                isActive
                  ? "text-teal-100 border-b-2 border-teal-100"
                  : "text-white hover:text-teal-100"
              )
            }
          >
            {t("Services")}
          </NavLink>
          
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              clsx(
                "font-medium py-2 flex items-center transition-colors",
                isActive
                  ? "text-teal-100 border-b-2 border-teal-100"
                  : "text-white hover:text-teal-100"
              )
            }
          >
            <DollarSign className="w-5 h-5 mr-2" /> {t("Pricing")}
          </NavLink>

          {/* Conditionally show dashboard link based on role */}
          {user && activeRole && (
            <NavLink
              to={`/${activeRole.toLowerCase()}/dashboard`}
              className={({ isActive }) =>
                clsx(
                  "font-medium py-2 flex items-center transition-colors",
                  isActive
                    ? "text-teal-100 border-b-2 border-teal-100"
                    : "text-white hover:text-teal-100"
                )
              }
            >
              {t(`${activeRole} Dashboard`)}
            </NavLink>
          )}

          {user && (
            <>
              <button
                onClick={() => navigate("/search")}
                className="text-white hover:text-teal-100"
                title={t("Search")}
                aria-label={t("Search")}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/notifications")}
                className="relative text-white hover:text-teal-100"
                aria-label={t("Notifications")}
              >
                <Bell className="w-5 h-5" />
                {user.unreadNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 flex items-center justify-center min-w-5 h-5">
                    {user.unreadNotifications}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Simplified Language selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={languageMenu.toggle}
              className="flex items-center text-white hover:text-teal-100"
              aria-haspopup="true"
              aria-expanded={languageMenu.value}
              aria-label={t("Change language")}
            >
              <Globe className="w-5 h-5" />
              <span className="sr-only md:not-sr-only md:ml-1">{i18n.language.toUpperCase()}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </button>
            <AnimatePresence>
              {languageMenu.value && (
                <motion.div
                  key="lang"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  {[
                    { id: "en", label: "English" },
                    { id: "de", label: "Deutsch" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => changeLanguage(id)}
                      className={clsx(
                        "block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-50 transition-colors",
                        i18n.language === id && "bg-teal-50 font-medium text-teal-700"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth / Profile */}
          {!user ? (
            <div className="relative" ref={loginRef}>
              <button
                onClick={loginMenu.toggle}
                className="flex items-center text-white hover:text-teal-100 transition-colors"
                aria-haspopup="true"
                aria-expanded={loginMenu.value}
              >
                <LogIn className="mr-2 w-5 h-5" />
                {t("Login")}
              </button>
              <AnimatePresence>
                {loginMenu.value && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
                  >
                    <NavLink
                      to="/login"
                      onClick={loginMenu.close}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-teal-50 transition-colors"
                    >
                      <Users className="mr-3 w-5 h-5 text-teal-600" />
                      {t("Login as Customer")}
                    </NavLink>
                    <NavLink
                      to="/login"
                      state={{ role: ROLES.CLEANER }}
                      onClick={loginMenu.close}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-teal-50 transition-colors border-t border-gray-100"
                    >
                      <Wrench className="mr-3 w-5 h-5 text-teal-600" />
                      {t("Login as Service Provider")}
                    </NavLink>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={profileMenu.toggle}
                className="flex items-center text-white hover:text-teal-100 transition-colors"
                aria-haspopup="true"
                aria-expanded={profileMenu.value}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full mr-2 border-2 border-white object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 mr-2" />
                )}
                <span className="max-w-24 truncate">{user.name}</span>
                <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
              </button>
              <AnimatePresence>
                {profileMenu.value && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-teal-600 mt-1 font-medium">
                        {t(user.role)}
                      </p>
                    </div>
                    <div className="py-1">
                      <NavLink
                        to="/profile"
                        onClick={profileMenu.close}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-teal-50 transition-colors"
                      >
                        <UserCircle className="mr-2 w-5 h-5 text-gray-500" /> {t("My Profile")}
                      </NavLink>
                      {user.role === ROLES.CLIENT && (
                        <NavLink
                          to="/my-bookings"
                          onClick={profileMenu.close}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-teal-50 transition-colors"
                        >
                          <Calendar className="mr-2 w-5 h-5 text-gray-500" /> {t("My Bookings")}
                        </NavLink>
                      )}
                      <NavLink
                        to="/settings"
                        onClick={profileMenu.close}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-teal-50 transition-colors"
                      >
                        <Cog className="mr-2 w-5 h-5 text-gray-500" /> {t("Settings")}
                      </NavLink>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut.value}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-50 transition-colors"
                      >
                        {isLoggingOut.value ? (
                          <span className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-teal-600 rounded-full"></span>
                        ) : (
                          <LogOut className="mr-2 w-5 h-5 text-gray-500" />
                        )}
                        {isLoggingOut.value ? t("Logging out...") : t("Logout")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* CTA - Visually aligned with Hero CTA */}
          <Link
            to="/services"
            className="bg-white text-teal-600 font-medium py-2 px-4 rounded-md hover:bg-teal-50 
                       flex items-center shadow-sm transition-all duration-300
                       hover:shadow-md"
            aria-label={t("Book your cleaning service")}
          >
            <Sparkles className="mr-2 w-5 h-5" /> {t("Book Your Cleaning")}
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden text-white hover:text-teal-100 transition-colors p-1"
          onClick={mobileMenu.toggle}
          aria-label={t("Toggle Mobile Menu")}
          aria-expanded={mobileMenu.value}
        >
          {mobileMenu.value ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileMenu.value && (
          <motion.div
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="sm:hidden bg-teal-600 px-6 pb-6 shadow-inner overflow-hidden"
          >
            <nav>
              <ul className="flex flex-col space-y-4 pt-4">
                {/* Direct links for mobile too */}
                <li>
                  <NavLink
                    to="/"
                    end
                    onClick={mobileMenu.close}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center text-white font-medium transition-colors",
                        isActive && "text-teal-100"
                      )
                    }
                  >
                    <Home className="mr-2 w-5 h-5" /> {t("Home")}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/services"
                    onClick={mobileMenu.close}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center text-white font-medium transition-colors",
                        isActive && "text-teal-100"
                      )
                    }
                  >
                    {t("Services")}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/pricing"
                    onClick={mobileMenu.close}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center text-white font-medium transition-colors",
                        isActive && "text-teal-100"
                      )
                    }
                  >
                    <DollarSign className="mr-2 w-5 h-5" /> {t("Pricing")}
                  </NavLink>
                </li>
                
                {/* Conditionally show dashboard link based on role */}
                {user && activeRole && (
                  <li>
                    <NavLink
                      to={`/${activeRole.toLowerCase()}/dashboard`}
                      onClick={mobileMenu.close}
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center text-white font-medium transition-colors",
                          isActive && "text-teal-100"
                        )
                      }
                    >
                      {t(`${activeRole} Dashboard`)}
                    </NavLink>
                  </li>
                )}

                {/* Language */}
                <li className="border-t border-teal-500/50 pt-4 mt-2">
                  <div className="text-sm text-teal-100/70 mb-2">{t("Language")}:</div>
                  <div className="flex space-x-4">
                    {[
                      { id: "en", label: "English" },
                      { id: "de", label: "Deutsch" },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => changeLanguage(id)}
                        className={clsx(
                          "text-white transition-colors",
                          i18n.language === id ? "bg-teal-500/40 px-3 py-1 rounded-md font-medium" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </li>

                {/* Auth */}
                {!user ? (
                  <li className="border-t border-teal-500/50 pt-4 mt-2 space-y-3">
                    <div className="text-sm text-teal-100/70 mb-2">{t("Account")}:</div>
                    <NavLink
                      to="/login"
                      onClick={mobileMenu.close}
                      className="text-white flex items-center bg-teal-500/30 px-4 py-2 rounded-md hover:bg-teal-500/50 transition-colors"
                    >
                      <Users className="mr-2 w-5 h-5" />{" "}
                      {t("Login as Customer")}
                    </NavLink>
                    <NavLink
                      to="/login"
                      state={{ role: ROLES.CLEANER }}
                      onClick={mobileMenu.close}
                      className="text-white flex items-center bg-teal-500/30 px-4 py-2 rounded-md hover:bg-teal-500/50 transition-colors"
                    >
                      <Wrench className="mr-2 w-5 h-5" />{" "}
                      {t("Login as Service Provider")}
                    </NavLink>
                  </li>
                ) : (
                  <li className="border-t border-teal-500/50 pt-4 mt-2 space-y-3">
                    <div className="flex items-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full mr-3 border-2 border-white object-cover"
                        />
                      ) : (
                        <UserCircle className="w-10 h-10 mr-3 text-white" />
                      )}
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-teal-100/70">{t(user.role)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <NavLink
                        to="/profile"
                        onClick={mobileMenu.close}
                        className="text-white flex items-center justify-center bg-teal-500/30 px-3 py-2 rounded-md hover:bg-teal-500/50 transition-colors text-sm"
                      >
                        <UserCircle className="mr-1 w-4 h-4" /> {t("Profile")}
                      </NavLink>
                      <NavLink
                        to="/settings"
                        onClick={mobileMenu.close}
                        className="text-white flex items-center justify-center bg-teal-500/30 px-3 py-2 rounded-md hover:bg-teal-500/50 transition-colors text-sm"
                      >
                        <Cog className="mr-1 w-4 h-4" /> {t("Settings")}
                      </NavLink>
                      {user.role === ROLES.CLIENT && (
                        <NavLink
                          to="/my-bookings"
                          onClick={mobileMenu.close}
                          className="text-white flex items-center justify-center bg-teal-500/30 px-3 py-2 rounded-md hover:bg-teal-500/50 transition-colors text-sm col-span-2"
                        >
                          <Calendar className="mr-1 w-4 h-4" /> {t("My Bookings")}
                        </NavLink>
                      )}
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="text-white flex items-center justify-center bg-teal-500/30 px-4 py-2 rounded-md hover:bg-teal-500/50 transition-colors w-full mt-2"
                    >
                      <LogOut className="mr-2 w-4 h-4" /> {t("Logout")}
                    </button>
                  </li>
                )}

                {/* CTA */}
                <li className="pt-4">
                  <Link
                    to="/services"
                    onClick={mobileMenu.close}
                    className="w-full bg-white text-teal-600 font-medium py-3 px-4 rounded-md flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                  >
                    <Sparkles className="mr-2 w-5 h-5" /> {t("Book Your Cleaning")}
                  </Link>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default React.memo(Navbar);
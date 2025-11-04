import React, { useCallback, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Star,
  Info as InfoIcon,
  ArrowRight,
  Home,
  Droplets,
  Sprout,
  Sparkles // For "Professional Service" tag
} from "lucide-react";
import {
  container,
  fadeIn,
  stagger,
  delayedStaggerChildren,
} from "../animations/heroAnimations";

/* -------------------- Trust Badge Component (Outline Style) -------------------- */
const TrustBadge = memo(({ text, icon: Icon }) => (
  <motion.div
    variants={fadeIn}
    className="border-2 border-teal-500/70 text-teal-200 px-3.5 py-2 rounded-lg 
               text-sm font-medium flex items-center justify-center gap-2 
               hover:bg-teal-500/10 transition-colors duration-200" // Very subtle hover
    // No strong shadow, looks more like an embossed label
  >
    <Icon className="w-4 h-4 flex-shrink-0 text-teal-400" /> {/* Brighter teal icon */}
    <span>{text}</span>
  </motion.div>
));

/* -------------------- Popular Service Card (Adjusted for Lighter Overlay) -------------------- */
const PopularServiceCard = ({ label, slug, icon, navigate }) => (
  <motion.button
    variants={stagger}
    onClick={() => navigate(`/services?service=${slug}`)}
    className="group flex items-center p-3.5 rounded-xl transition-all duration-300 
               bg-black/50 hover:bg-black/60 backdrop-blur-md border border-white/20 // Slightly more opaque card for readability
               hover:shadow-lg hover:border-white/30 relative overflow-hidden
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900" // Adjusted offset for darker potential card bg
    aria-label={`Select ${label} service`}
  >
    <div className="bg-teal-500/40 group-hover:bg-teal-500/60 p-2 rounded-lg mr-3 transition-colors duration-300">
      {icon}
    </div>
    <div className="flex flex-col items-start">
      <span className="text-white text-sm font-medium">
        {label}
      </span>
      <span className="text-xs text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity">
        Select →
      </span>
    </div>
  </motion.button>
);

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Stronger text shadows for even lighter overlay
  const heroHeadlineStyle = { textShadow: "0px 2px 7px rgba(0, 0, 0, 0.75)" };
  const heroTextStyle = { textShadow: "0px 1px 5px rgba(0, 0, 0, 0.7)" };

  const trustBadgesData = useMemo(
    () => [
      { textKey: "Verified Cleaners", icon: CheckCircle },
      { textKey: "100% Satisfaction", icon: Star },
      { textKey: "24/7 Support", icon: InfoIcon },
    ],
    []
  );

  const popularServicesData = useMemo(
    () => [
      {
        slug: "regular",
        labelKey: "Regular Cleaning",
        icon: <Home className="w-5 h-5 text-white" />,
        descriptionKey: "Weekly or bi-weekly cleaning"
      },
      {
        slug: "deep",
        labelKey: "Deep Cleaning",
        icon: <Droplets className="w-5 h-5 text-white" />,
        descriptionKey: "Thorough, detailed cleaning"
      },
      {
        slug: "window",
        labelKey: "Window Cleaning",
        icon: <Sprout className="w-5 h-5 text-white" />,
        descriptionKey: "Crystal-clear windows"
      },
    ],
    []
  );

  const handleGetStarted = useCallback(() => {
    navigate("/location");
  }, [navigate]);

  return (
    <motion.div
      className="relative min-h-[100vh] bg-center bg-cover overflow-hidden flex items-center justify-center"
      initial="hidden"
      animate="visible"
      viewport={{ once: true }}
      variants={container}
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {/* EVEN LIGHTER Overlay to make the background image contrast more prominent */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/30 to-black/55" // Significantly reduced opacity
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 text-center max-w-4xl">
        {/* "Professional Service" Tag - Styled as a simple text label with an icon */}
        <motion.div
          variants={fadeIn}
          className="inline-flex items-center text-teal-300 text-sm sm:text-base font-semibold mb-6 tracking-wide"
          style={heroTextStyle} // Apply text shadow for readability
        >
          <Sparkles className="w-5 h-5 mr-2 opacity-80" /> {/* Using Sparkles icon */}
          {t("Professional Service")}
        </motion.div>

        <motion.h1
          variants={fadeIn}
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-5"
          style={heroHeadlineStyle}
        >
          {t("Professional Cleaning")}{" "}
          <span className="text-teal-300 block sm:inline">
            {t("for Your Peace of Mind")}
          </span>
        </motion.h1>

        <motion.p
          variants={fadeIn}
          className="text-lg sm:text-xl text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed"
          style={heroTextStyle}
        >
          {t("Book trusted professionals for your home or office with just a few clicks.")}{" "}
          <span className="text-teal-300 font-medium">
            {t("Quality service guaranteed.")}
          </span>
        </motion.p>

        {/* Trust Badges Section - Outline Style */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12"
          variants={delayedStaggerChildren}
        >
          {trustBadgesData.map((badge) => (
            <TrustBadge key={badge.textKey} text={t(badge.textKey)} icon={badge.icon} />
          ))}
        </motion.div>

        {/* Main Call to Action Button - VERY DISTINCT */}
        <motion.div variants={fadeIn} className="mb-16">
          <button
            onClick={handleGetStarted}
            className="bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white px-10 py-4 rounded-xl 
                      text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl
                      transform hover:-translate-y-1.5 active:scale-95
                      flex items-center mx-auto
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900" // Adjusted offset for potentially very dark area
            aria-label={t("Find your perfect cleaning service")}
          >
            {t("Book Your Cleaning")}
            <ArrowRight className="ml-2.5 h-5 w-5" />
          </button>
        </motion.div>

        <motion.div variants={fadeIn}>
          <h3
            className="text-white/90 mb-5 text-base sm:text-lg font-medium flex items-center justify-center"
            style={heroTextStyle}
          >
            <span className="h-px w-10 bg-teal-500/60 mr-4"></span>
            {t("Popular Services")}
            <span className="h-px w-10 bg-teal-500/60 ml-4"></span>
          </h3>
          <motion.div
            className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-3xl mx-auto"
            variants={delayedStaggerChildren}
          >
            {popularServicesData.map((service) => (
              <PopularServiceCard
                key={service.slug}
                label={t(service.labelKey)}
                slug={service.slug}
                icon={service.icon}
                navigate={navigate}
              />
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={fadeIn} className="mt-16 flex flex-col items-center" style={heroTextStyle}>
          <p className="text-sm text-gray-300">
            {t("Join Thousands of Satisfied Customers")}
          </p>
          <div className="flex items-center mt-2.5">
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-gray-600 border-2 border-neutral-700/70 shadow-sm" // Adjusted border for lighter overlay
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="ml-3 text-xs text-gray-300">
              <span className="text-teal-400 font-semibold">4.9/5</span> {t("from 2,000+ reviews")}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
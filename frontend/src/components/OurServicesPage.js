// src/components/OurServicesPage.js
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  HelpCircle,
  Star,
  X as CloseIcon, // For closing modals
  Filter, // Example for a filter icon
  ArrowLeftRight, // For Compare
  Info,
  MapPin,
  Users,
  Shield,
} from "lucide-react";
import { serviceList } from "../data/services"; // Assuming structure: { id, icon, title, shortDescription, keyBenefit, price, duration, features, isPopular, category }
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";
import useLocalStorageState from "../hooks/useLocalStorageState";
import { useBooking } from "../contexts/BookingContext";

const byId = (id) => serviceList.find((s) => s.id === id);

// --- Re-designed Service Card ---
const ServiceCard = memo(
  ({
    id,
    icon: Icon,
    title,
    shortDescription, // Expecting a concise description
    keyBenefit, // A standout benefit
    price,
    duration,
    isPopular,
    onSelect, // When card is clicked to "select" (might open quick view or select)
    onContinue, // When "Continue" button on a selected card is clicked
    isSelected,
  }) => {
    const { t } = useTranslation();
    return (
      <motion.div
        layout
        id={`service-${id}`} // For scrolling to
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 20px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.05)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`bg-white border rounded-xl overflow-hidden cursor-pointer
                    ${
                      isSelected
                        ? "border-teal-500 border-2 shadow-2xl"
                        : "border-gray-200 hover:border-teal-300 shadow-lg"
                    }`}
        onClick={() => onSelect(id)} // Selects the service on card click
      >
        <div className="p-5">
          {isPopular && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center shadow">
              <Star className="w-3.5 h-3.5 mr-1 fill-current" />
              POPULAR
            </div>
          )}
          <div className="flex items-center mb-3">
            <div className="bg-teal-100 p-3 rounded-lg mr-4">
              {" "}
              {/* Slightly larger padding and rounded-lg */}
              <Icon className="text-teal-600 w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              {duration && (
                <div className="text-xs text-gray-500 mt-0.5">
                  <Clock className="w-3 h-3 mr-1 inline-block text-teal-600" />
                  {duration}
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 h-10 line-clamp-2">
            {shortDescription ||
              t("Default short description for this service.")}
          </p>

          {keyBenefit && (
            <div className="mb-4 p-2.5 bg-teal-50 rounded-md">
              <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-1">
                {t("Key Benefit:")}
              </p>
              <div className="flex items-start text-teal-800 text-sm">
                <CheckCircle
                  className="mr-1.5 text-teal-500 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <span>{keyBenefit}</span>
              </div>
            </div>
          )}

          <div className="mt-2 mb-3">
            <span className="text-2xl font-extrabold text-teal-600">
              €{price}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              {duration && duration.includes("hour") ? "/service" : ""}
            </span>
          </div>
        </div>

        <div
          className={`p-4 border-t ${
            isSelected ? "border-teal-200" : "border-gray-100"
          }`}
        >
          {isSelected ? (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card's onSelect from firing again
                onContinue(id);
              }}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {t("Continue with")} {title}
              <ArrowRight size={18} className="ml-2" />
            </button>
          ) : (
            <button // This button now acts as the primary selection trigger for clarity
              onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
              }}
              className="w-full bg-white text-teal-600 border-2 border-teal-500 hover:bg-teal-50 py-2.5 px-4 rounded-lg transition-colors font-semibold"
            >
              {t("Select this Service")}
            </button>
          )}
        </div>
      </motion.div>
    );
  }
);

// --- Service Questionnaire (Kept similar, it's good) ---
const ServiceQuestionnaire = ({ onClose, onServiceRecommended }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const { t } = useTranslation();

  const questions = [
    /* ... Your questions ... */
    {
      question: "What type of property needs cleaning?",
      options: ["Apartment", "House", "Office", "Other"],
      icons: ["🏢", "🏠", "🏢", "🏗️"],
    },
    {
      question: "How often do you need cleaning services?",
      options: ["One-time", "Weekly", "Bi-weekly", "Monthly"],
      icons: ["📅", "🔄", "🗓️", "📆"],
    },
    {
      question: "What's your main cleaning priority?",
      options: [
        "Regular maintenance",
        "Deep cleaning",
        "Specific areas (windows, kitchen)",
        "Moving in/out",
      ],
      icons: ["🧹", "✨", "🚿", "📦"],
    },
  ];

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [step]: answer });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      let recommendedService = "home-cleaning"; // default from your original code
      if (answers[0] === "Office") recommendedService = "commercial-cleaning";
      else if (answers[2] === "Moving in/out")
        recommendedService = "move-cleaning";
      else if (answers[2] === "Specific areas (windows, kitchen)")
        recommendedService = "window-cleaning";
      else if (answers[2] === "Deep cleaning")
        recommendedService = "deep-cleaning";
      onServiceRecommended(recommendedService);
      onClose();
    }
  };

  return (
    <motion.div /* ... Your questionnaire styling ... */
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-lg w-full mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {t("Find Your Ideal Service")}
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label={t("Close")}
        >
          <CloseIcon size={22} className="text-gray-600" />
        </button>
      </div>
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-right text-sm text-gray-500 mt-1">
          {t("Step")} {step + 1} {t("of")} {questions.length}
        </p>
      </div>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-700 mb-4">
          {questions[step].question}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {questions[step].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className="p-4 text-left border rounded-lg hover:bg-teal-50 transition-colors
                               flex justify-between items-center text-gray-700 hover:border-teal-300
                               focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <span className="flex items-center">
                <span className="text-xl mr-3">
                  {questions[step].icons[idx]}
                </span>
                <span>{option}</span>
              </span>
              <ArrowRight size={16} className="text-teal-500 opacity-70" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Compare Modal (Kept similar, trigger would ideally change) ---
const CompareModal = ({
  isOpen,
  onClose,
  services,
  onServiceSelect,
  onServiceContinue,
}) => {
  // ... Your existing CompareModal code ... (It's quite long, so I'll omit it for brevity here but assume it exists)
  // Ensure the "Book Now" in compare modal calls onServiceContinue(service.id) and onClose()
  // Ensure "View Details" calls onServiceSelect(service.id) and onClose() to highlight on main page
  if (!isOpen || !services || services.length < 2) return null; // Ensure at least 2 services to compare

  const bestValueIndex = services.findIndex((service) => service.isPopular);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div /* ... backdrop ... */>
          <motion.div /* ... modal content ... */>
            {/* ... Your table structure for comparison ... */}
            {/* Example action buttons in table cells */}
            {/* <button onClick={() => { onServiceContinue(service.id); onClose(); }}>Book Now</button> */}
            {/* <button onClick={() => { onServiceSelect(service.id); onClose(); }}>View Details</button> */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Category Filters (Simplified) ---
const serviceCategoryFilters = [
  { id: "all", name: "All Services" },
  { id: "residential", name: "Residential" }, // Example categories
  { id: "commercial", name: "Commercial" },
  { id: "specialty", name: "Specialty" },
];

// --- Smart Sticky Bar (Conceptual - Needs more logic for scroll awareness) ---
const SmartStickySelectedServiceBar = ({
  selectedService,
  onContinue,
  isVisible,
}) => {
  const { t } = useTranslation();
  if (!isVisible || !selectedService) return null;

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="fixed bottom-0 left-0 right-0 bg-white shadow-top p-4 z-40 border-t border-gray-200" // shadow-top is a custom utility
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center">
          {selectedService.icon && (
            <selectedService.icon className="text-teal-600 w-7 h-7 mr-3 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold text-gray-800">
              {selectedService.title}
            </p>
            <p className="text-sm text-gray-500">
              €{selectedService.price}{" "}
              {selectedService.duration && `· ${selectedService.duration}`}
            </p>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors w-full sm:w-auto font-semibold flex items-center justify-center"
        >
          {t("Continue to Location")}
          <ArrowRight size={18} className="inline ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---
const OurServicesPage = () => {
  const { selectService: storeServiceInBookingContext } = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [selectedId, setSelectedId] = useLocalStorageState(
    "selectedServiceId",
    null
  );
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // For Compare Modal (basic example, would need more logic for selecting items to compare)
  const [itemsToCompare, setItemsToCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // For Smart Sticky Bar visibility (simplified, real version needs scroll listeners)
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    // Logic to show sticky bar if a service is selected and continue button is off-screen
    // This is a placeholder for actual scroll detection logic.
    if (selectedId) {
      // Simulating that the card's continue button might be off-screen
      // In a real app, you'd use IntersectionObserver or scroll event listeners
      const timer = setTimeout(() => setShowStickyBar(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowStickyBar(false);
    }
  }, [selectedId]);

  const filteredServiceOptions = useMemo(() => {
    if (categoryFilter === "all") return serviceList;
    return serviceList.filter((service) => service.category === categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    const idFromUrl = searchParams.get("highlight");
    if (idFromUrl && byId(idFromUrl)) setSelectedId(idFromUrl);
    if (searchParams.get("first") === "true") setShowQuestionnaire(true);
  }, [searchParams, setSelectedId]);

  const handleServiceSelect = useCallback(
    (serviceId) => {
      setSelectedId((prevId) => (prevId === serviceId ? null : serviceId)); // Toggle selection or simply select
    },
    [setSelectedId]
  );

  const handleContinueToBookingFlow = useCallback(
    (serviceIdToContinue) => {
      const serviceToBook = byId(serviceIdToContinue || selectedId);
      if (!serviceToBook) return;

      // Ensure data is serializable (remove component Icon for example)
      const { icon, ...serializableService } = serviceToBook;
      storeServiceInBookingContext(serializableService);
      // Navigate to customization page instead of location
      navigate("/booking/customize", {
        state: { selectedService: serializableService },
      });
    },
    [selectedId, storeServiceInBookingContext, navigate]
  );

  const handleServiceRecommendation = useCallback(
    (serviceId) => {
      if (byId(serviceId)) {
        setSelectedId(serviceId);
        const serviceCategory = byId(serviceId)?.category;
        if (serviceCategory && serviceCategory !== categoryFilter) {
          setCategoryFilter(serviceCategory); // Switch to the category of recommended service
        }
        setTimeout(() => {
          document
            .getElementById(`service-${serviceId}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    },
    [setSelectedId, categoryFilter, setCategoryFilter]
  );

  const selectedServiceForStickyBar = useMemo(() => {
    return selectedId ? byId(selectedId) : null;
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-slate-50">
      {" "}
      {/* Lighter background */}
      <Navbar />
      <main className="container mx-auto px-4 pt-24 md:pt-28 pb-16">
        {" "}
        {/* Consistent padding */}
        <header className="text-center mb-10 md:mb-12">
          <motion.h1
            /* ... */ className="text-3xl md:text-4xl font-bold text-gray-800 mb-3"
          >
            {t("Choose Your Cleaning Service")}
          </motion.h1>
          <motion.p
            /* ... */ className="text-gray-600 max-w-xl mx-auto mb-6 text-lg"
          >
            {t(
              "Find the perfect clean for your home or office. Not sure where to start?"
            )}
          </motion.p>
          <motion.button
            onClick={() => setShowQuestionnaire(true)}
            className="bg-teal-600 text-white py-3.5 px-8 rounded-lg hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 text-base md:text-lg font-semibold flex items-center mx-auto group"
          >
            <HelpCircle
              size={22}
              className="mr-2.5 group-hover:animate-pulse"
            />
            {t("Help Me Choose a Service")}
          </motion.button>
          <p className="text-sm text-gray-500 mt-4">
            {t("Or browse our services below")}
          </p>
        </header>
        <div className="mb-8 md:mb-10 sticky top-[calc(var(--navbar-height,64px)+1rem)] bg-slate-50/80 backdrop-blur-md z-20 py-4 -mx-4 px-4 md:mx-0 md:px-0 shadow-sm rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex overflow-x-auto space-x-2 pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
              {" "}
              {/* hide-scrollbar is a custom utility */}
              {serviceCategoryFilters.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${
                      categoryFilter === category.id
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                >
                  {t(category.name)}
                </button>
              ))}
            </div>
            {/* Conceptual: Button to trigger compare modal - needs logic to select items first */}
            {/* <button onClick={() => setShowCompareModal(true)} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center"><ArrowLeftRight size={16} className="mr-1.5" /> Compare</button> */}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {filteredServiceOptions.length === 0 ? (
            <motion.div
              key="no-services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <Filter size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4 text-lg">
                {t("No services match your current filter.")}
              </p>
              <button
                onClick={() => setCategoryFilter("all")}
                className="bg-teal-100 text-teal-700 px-5 py-2.5 rounded-lg hover:bg-teal-200 font-medium"
              >
                {t("View All Services")}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={categoryFilter} // Re-trigger animation on filter change
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { staggerChildren: 0.07 } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {filteredServiceOptions.map((service) => (
                <ServiceCard
                  key={service.id}
                  {...service}
                  isSelected={selectedId === service.id}
                  onSelect={handleServiceSelect}
                  onContinue={handleContinueToBookingFlow}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Simplified How It Works / Value Proposition (optional, place further down or in footer) */}
        <section className="mt-16 md:mt-20 pt-10 md:pt-12 border-t border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            {t("Simple & Reliable Cleaning")}
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-8">
            {t(
              "Select your service, tell us when and where, and we'll match you with a trusted, vetted professional. It's that easy!"
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: CheckCircle,
                title: "Choose Your Service",
                desc: "Pick from our tailored options.",
              },
              {
                icon: MapPin,
                title: "Set Location & Time",
                desc: "Flexible scheduling for you.",
              },
              {
                icon: Users,
                title: "Get Matched!",
                desc: "We find your perfect cleaner.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
              >
                <item.icon className="w-8 h-8 text-teal-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">
                  {t(item.title)}
                </h3>
                <p className="text-xs text-gray-500">{t(item.desc)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SmartStickySelectedServiceBar
        selectedService={selectedServiceForStickyBar}
        onContinue={() => handleContinueToBookingFlow()}
        isVisible={showStickyBar && !!selectedId} // Only visible if conditions met
      />
      <AnimatePresence>
        {showQuestionnaire && (
          <motion.div
            /* Modal backdrop */ className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <ServiceQuestionnaire
              onClose={() => setShowQuestionnaire(false)}
              onServiceRecommended={handleServiceRecommendation}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Compare Modal - Ensure it's correctly implemented or simplified
      <CompareModal 
          isOpen={showCompareModal} 
          onClose={() => setShowCompareModal(false)} 
          services={itemsToCompare.length > 0 ? itemsToCompare.map(id => byId(id)) : serviceList.slice(0,3) /* Example data }
          onServiceSelect={handleServiceSelect}
          onServiceContinue={handleContinueToBookingFlow}
      /> 
      */}
    </div>
  );
};

export default memo(OurServicesPage);

// src/components/PricingPage.js
import React, { useState } from "react";
import { Check, Star, Home, Droplets, Leaf, ExternalLink, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar"; // Import Navbar explicitly

// Enhanced service data with additional properties
const services = [
  {
    id: "home-cleaning",
    title: "Home Cleaning",
    priceInfo: "From €79.99",
    basePrice: "79.99",
    hourlyRate: "€20/hour",
    priceUnit: "service",
    popular: true,
    icon: <Home className="h-6 w-6 text-teal-500" />,
    category: "regular",
    description: [
      { text: "Thorough room-by-room cleaning", highlight: false },
      { text: "Dust and wipe all surfaces", highlight: false },
      { text: "Vacuum and mop floors", highlight: true },
      { text: "Clean bathrooms and kitchen", highlight: true },
      { text: "2-3 hours duration", highlight: false },
    ],
    ctaLink: "/booking?service=home-cleaning",
    learnMoreLink: "/services?type=home-cleaning",
  },
  {
    id: "deep-cleaning",
    title: "Deep Cleaning",
    priceInfo: "From €129.99",
    basePrice: "129.99",
    hourlyRate: "€25/hour",
    priceUnit: "service",
    popular: false,
    icon: <Droplets className="h-6 w-6 text-teal-500" />,
    category: "specialty",
    description: [
      { text: "All Home Cleaning services", highlight: false },
      { text: "Deep clean of hard-to-reach areas", highlight: true },
      { text: "Detailed appliance cleaning", highlight: true },
      { text: "Carpet and upholstery spot cleaning", highlight: false },
      { text: "4-5 hours duration", highlight: false },
    ],
    ctaLink: "/booking?service=deep-cleaning",
    learnMoreLink: "/services?type=deep-cleaning",
  },
  {
    id: "window-cleaning",
    title: "Window Cleaning",
    priceInfo: "From €59.99",
    basePrice: "59.99",
    hourlyRate: "€18/hour",
    priceUnit: "service",
    popular: false,
    icon: <Maximize className="h-6 w-6 text-teal-500" />,
    category: "specialty",
    description: [
      { text: "Interior and exterior window cleaning", highlight: true },
      { text: "Streak-free guarantee", highlight: false },
      { text: "Sill and frame cleaning", highlight: false },
      { text: "Glass door and mirror cleaning", highlight: true },
      { text: "1-2 hours duration", highlight: false },
    ],
    ctaLink: "/booking?service=window-cleaning",
    learnMoreLink: "/services?type=window-cleaning",
  },
  {
    id: "move-cleaning",
    title: "Move-in/Move-out Cleaning",
    priceInfo: "From €199.99",
    basePrice: "199.99",
    hourlyRate: "€22/hour",
    priceUnit: "service",
    popular: false,
    icon: <Droplets className="h-6 w-6 text-teal-500" />,
    category: "specialty",
    description: [
      { text: "Full home deep cleaning", highlight: true },
      { text: "Appliance and fixture detailing", highlight: true },
      { text: "Wall and baseboard cleaning", highlight: false },
      { text: "Carpet and floor preparation", highlight: false },
      { text: "5-7 hours duration", highlight: false },
    ],
    ctaLink: "/booking?service=move-cleaning",
    learnMoreLink: "/services?type=move-cleaning",
    disclaimer: "Prices vary by home size",
  },
  {
    id: "carpet-cleaning",
    title: "Carpet Cleaning",
    priceInfo: "From €89.99",
    basePrice: "89.99",
    hourlyRate: "€22/hour",
    priceUnit: "service",
    popular: false,
    icon: <Droplets className="h-6 w-6 text-teal-500" />,
    category: "specialty",
    description: [
      { text: "Professional carpet shampooing", highlight: true },
      { text: "Stain removal treatment", highlight: true },
      { text: "Deodorizing and sanitizing", highlight: false },
      { text: "Fast drying process", highlight: false },
      { text: "2-4 hours duration", highlight: false },
    ],
    ctaLink: "/booking?service=carpet-cleaning",
    learnMoreLink: "/services?type=carpet-cleaning",
    disclaimer: "Per room. Minimum 3 rooms",
  },
  {
    id: "gardening",
    title: "Gardening & Lawn Care",
    priceInfo: "From €69.99",
    basePrice: "69.99",
    hourlyRate: "€18/hour",
    priceUnit: "service",
    popular: false,
    icon: <Leaf className="h-6 w-6 text-teal-500" />,
    category: "outdoor",
    description: [
      { text: "Lawn mowing & edging", highlight: false },
      { text: "Hedge trimming", highlight: true },
      { text: "Weeding and bed maintenance", highlight: true },
      { text: "Plant and shrub pruning", highlight: false },
      { text: "Yard waste removal", highlight: false },
    ],
    ctaLink: "/booking?service=gardening",
    learnMoreLink: "/services?type=gardening",
    disclaimer: "Up to 200 sq meters",
  },
];

// Group services by category for filtering
const serviceCategories = [
  { id: "all", name: "All Services" },
  { id: "regular", name: "Regular Cleaning" },
  { id: "specialty", name: "Specialty Cleaning" },
  { id: "outdoor", name: "Outdoor Services" },
];

const PricingPage = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredServices = activeCategory === "all" 
    ? services 
    : services.filter(service => service.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Include Navbar explicitly in the component */}
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
              {t("Transparent Pricing")}
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("Choose the perfect service for your needs with our all-inclusive pricing. No hidden fees, ever.")}
          </p>
          
          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {serviceCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${activeCategory === category.id 
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
              >
                {t(category.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid with enhanced card design */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col h-full relative group"
            >
              {service.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    {t("Most Popular")}
                  </div>
                </div>
              )}
              
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-gray-100 flex items-center">
                <div className="bg-teal-50 p-3 rounded-lg mr-4">
                  {service.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t(service.title)}
                  </h2>
                </div>
              </div>
              
              {/* Price Section - More prominent */}
              <div className="bg-teal-50 p-4 text-center border-b border-teal-100">
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-teal-700">{service.priceInfo}</span>
                </div>
                <p className="text-sm text-teal-600 mt-1">
                  {service.hourlyRate} • {service.priceUnit === "service" ? t("Per service") : t("Per hour")}
                </p>
                {service.disclaimer && (
                  <p className="text-xs text-teal-600 mt-1 italic">{t(service.disclaimer)}</p>
                )}
              </div>
              
              {/* Features List */}
              <div className="p-6 flex-grow">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">{t("What's included")}:</p>
                <ul className="space-y-3 mb-6">
                  {service.description.map((desc, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <Check className={`w-4 h-4 mr-2 mt-1 ${desc.highlight ? 'text-teal-500' : 'text-gray-400'}`} />
                      <span className={desc.highlight ? 'font-medium' : ''}>{t(desc.text)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Section */}
              <div className="p-6 pt-2 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={service.ctaLink}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-center flex-grow shadow-sm hover:shadow"
                  >
                    {t("Book Now")}
                  </Link>
                  <Link
                    to={service.learnMoreLink}
                    className="inline-block bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-center flex-shrink-0"
                  >
                    <span className="flex items-center justify-center">
                      {t("Details")}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("No services found in this category.")}</p>
            <button 
              onClick={() => setActiveCategory('all')}
              className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
            >
              {t("View all services")}
            </button>
          </div>
        )}

        {/* Pricing Guarantee */}
        <div className="mt-16 bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Star className="h-5 w-5 text-teal-500 mr-2" /> {t("Our Pricing Guarantee")}
          </h3>
          <p className="text-gray-700 mb-4">
            {t("We believe in transparent pricing with no surprises. The price you see is the price you pay, and all our services come with a satisfaction guarantee.")}
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
              <p>{t("No hidden fees or charges")}</p>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
              <p>{t("Cancel anytime, no contracts")}</p>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
              <p>{t("100% satisfaction guarantee")}</p>
            </div>
          </div>
        </div>

        {/* Bulk Discount Section */}
        <div className="mt-12 bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <Star className="h-5 w-5 mr-2" /> {t("Regular Service Discount")}
          </h3>
          <p className="mb-4">
            {t("Book regular recurring services and save up to 20% on each cleaning.")}
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 p-3 rounded-lg text-center">
              <p className="font-bold text-xl mb-1">5%</p>
              <p>{t("Bi-weekly")}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg text-center">
              <p className="font-bold text-xl mb-1">10%</p>
              <p>{t("Weekly")}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg text-center">
              <p className="font-bold text-xl mb-1">20%</p>
              <p>{t("Multiple services bundle")}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/80">
            {t("Discounts are automatically applied when you choose the frequency during booking.")}
          </div>
        </div>

        {/* Disclaimer Section - Redesigned for better readability */}
        <div className="mt-12 bg-gray-100 p-6 rounded-lg max-w-4xl mx-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t("Important Information")}</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              {t("* Services and prices may vary based on location, home size, and extra add-ons. All prices shown include VAT.")}
            </p>
            <p>
              {t("** Discounts cannot be combined with other promotional offers unless explicitly stated.")}
            </p>
            <p>
              {t("All services are performed by insured, background-checked professionals. No contract period; cancel anytime with 48 hours notice.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
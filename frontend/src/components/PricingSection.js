// src/components/PricingSection.js
import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Updated services with accurate information and aligned with your service options
const pricingOptions = [
  {
    id: "home-cleaning",
    title: "Home Cleaning",
    priceInfo: "€79.99 per service",
    hourlyRate: "Starting at €20/hour",
    description: [
      "Thorough room-by-room cleaning",
      "Dust and wipe all surfaces",
      "Vacuum and mop floors",
      "Clean bathrooms and kitchen",
      "2-3 hours duration"
    ],
    ctaLink: "/services?type=home-cleaning",
  },
  {
    id: "deep-cleaning",
    title: "Deep Cleaning",
    priceInfo: "€129.99 per service",
    hourlyRate: "Starting at €25/hour",
    description: [
      "All Home Cleaning services",
      "Deep clean of hard-to-reach areas",
      "Detailed appliance cleaning",
      "Carpet and upholstery spot cleaning",
      "4-5 hours duration"
    ],
    ctaLink: "/services?type=deep-cleaning",
  },
  {
    id: "window-cleaning",
    title: "Window Cleaning",
    priceInfo: "€59.99 per service",
    hourlyRate: "Starting at €18/hour",
    description: [
      "Interior and exterior window cleaning",
      "Streak-free guarantee",
      "Sill and frame cleaning",
      "Glass door and mirror cleaning",
      "1-2 hours duration"
    ],
    ctaLink: "/services?type=window-cleaning",
  },
  {
    id: "move-cleaning",
    title: "Move-in/Move-out Cleaning",
    priceInfo: "€199.99 per service",
    hourlyRate: "Starting at €22/hour",
    description: [
      "Full home deep cleaning",
      "Appliance and fixture detailing",
      "Wall and baseboard cleaning",
      "Carpet and floor preparation",
      "5-7 hours duration"
    ],
    ctaLink: "/services?type=move-cleaning",
  }
];

const PricingSection = () => {
  const { t } = useTranslation();
  
  return (
    <section id="pricing" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4 
                         bg-gradient-to-r from-teal-600 to-teal-400 
                         bg-clip-text text-transparent">
            {t("Transparent Pricing")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-6">
            {t("Find the perfect cleaning service that fits your needs and budget. All prices include professional cleaners and top-quality service.")}
          </p>
          <Link 
            to="/pricing" 
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            {t("View detailed pricing")}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </motion.div>

        {/* Pricing Cards Grid - Show only most popular options */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pricingOptions.map((option, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)"
              }}
              key={option.id}
              className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-between border border-gray-100"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {t(option.title)}
                </h3>
                <div className="bg-teal-50 rounded-lg py-2 px-3 mb-4 inline-block">
                  <span className="text-xl font-bold text-teal-600">{option.priceInfo}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {option.hourlyRate}
                </p>
                {/* Only show 3 key features to save space */}
                <ul className="space-y-2 mb-6">
                  {option.description.slice(0, 3).map((desc, idx) => (
                    <li key={idx} className="flex items-start text-gray-700 text-sm">
                      <Check className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{t(desc)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={option.ctaLink}
                className="mt-4 w-full flex items-center justify-between p-3 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
              >
                <span className="font-medium">{t("View Details")}</span>
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link 
            to="/pricing" 
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-md"
          >
            {t("See All Pricing Options")}
          </Link>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto text-sm">
            {t("Prices may vary based on your location, home size, and additional requirements. All our services are performed by insured, background-checked professionals.")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
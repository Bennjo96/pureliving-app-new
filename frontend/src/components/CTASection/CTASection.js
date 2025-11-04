import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const CTASection = () => {
  const benefits = [
    "Professional Cleaners",
    "Flexible Scheduling",
    "Satisfaction Guaranteed",
    "Eco-Friendly Products",
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12
      }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { scale: 0.98 }
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-teal-600 to-teal-700 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white"></div>
      </div>
      
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative max-w-3xl mx-auto text-center"
      >
        {/* Section Header */}
        <motion.div className="mb-8" variants={childVariants}>
          <h2 className="text-4xl font-bold mb-6">
            Ready for a Cleaner Space?
          </h2>
          <p className="text-lg">
            Get started today and enjoy a spotless, healthier environment.
          </p>
        </motion.div>

        {/* Benefits List */}
        <motion.div 
          variants={childVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-center sm:justify-start space-x-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-teal-500 p-1 rounded-full">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span>{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={childVariants}>
          <Link to="/booking">
            <motion.button
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="px-6 py-3 bg-white text-teal-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center mx-auto"
            >
              Book Your First Cleaning
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;
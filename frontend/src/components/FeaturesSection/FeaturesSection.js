import React from "react";
import { Shield, Clock, Star, Sparkles, ThumbsUp, Heart } from "lucide-react";

const FeatureCard = ({ feature }) => (
  <div className="group relative p-8 rounded-lg bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-200">
    {/* Icon */}
    <div className="mb-6">
      <div className="inline-flex p-4 rounded-full bg-teal-50 group-hover:bg-teal-100 transition-colors duration-300">
        <feature.icon className="w-6 h-6 text-teal-600" />
      </div>
    </div>
    {/* Content */}
    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
      {feature.title}
    </h3>
    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Insured & Bonded",
      description:
        "Our services are fully insured and bonded, ensuring your peace of mind.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description:
        "Book cleaning services that fit your schedule, anytime you need.",
    },
    {
      icon: Star,
      title: "Top-Rated Service",
      description:
        "Experience premium quality with our skilled and dedicated professionals.",
    },
    {
      icon: Sparkles,
      title: "Thorough Cleaning",
      description:
        "We go beyond the basics to ensure a spotless, sanitized space.",
    },
    {
      icon: ThumbsUp,
      title: "100% Satisfaction",
      description:
        "Your satisfaction is our priority. We'll make it right if you're not happy.",
    },
    {
      icon: Heart,
      title: "Eco-Friendly Products",
      description:
        "We use products that are safe for your family, pets, and the environment.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Why Choose Us?</h2>
          <p className="text-lg text-gray-600">
            Thousands trust us for their cleaning needs. Here's why.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

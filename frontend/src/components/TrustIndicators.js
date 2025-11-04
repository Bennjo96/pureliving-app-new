import React from "react";
import {
  Users,
  MapPin,
  UserCheck,
  Star,
  Shield,
  Award,
  ThumbsUp,
} from "lucide-react";

const TrustIndicators = ({ stats }) => {
  // Icons mapping for different stat types
  const getIconForStat = (label) => {
    const iconProps = {
      className: "w-8 h-8 text-teal-600",
      strokeWidth: 1.5,
    };

    const iconMap = {
      "Happy Customers": <Users {...iconProps} />,
      "Cities Served": <MapPin {...iconProps} />,
      "Professional Cleaners": <UserCheck {...iconProps} />,
      "5-Star Reviews": <Star {...iconProps} />,
      "Years Experience": <Award {...iconProps} />,
      "Satisfaction Rate": <ThumbsUp {...iconProps} />,
      default: <Shield {...iconProps} />,
    };

    return iconMap[label] || iconMap.default;
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Why Choose Us
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their
            cleaning needs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-teal-50 rounded-full hover:bg-teal-100 transition-colors duration-300">
                  {getIconForStat(stat.label)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
          {["Insured", "Bonded", "Licensed", "Certified"].map((badge) => (
            <div
              key={badge}
              className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors duration-300"
            >
              <Shield className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;

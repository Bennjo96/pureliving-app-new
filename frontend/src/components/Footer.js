import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  ChevronUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscriptionStatus({
        success: false,
        message: t("Please enter a valid email")
      });
      return;
    }
    
    // Here you would typically make an API call to subscribe the user
    // For now, we'll simulate a successful subscription
    setSubscriptionStatus({
      success: true,
      message: t("Thank you for subscribing")
    });
    
    // Reset form after success
    setEmail("");
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      if (subscriptionStatus?.success) {
        setSubscriptionStatus(null);
      }
    }, 5000);
  };
  
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { name: t("Home"), path: "/" },
    { name: t("Services"), path: "/services" },
    { name: t("About Us"), path: "/about" },
    { name: t("Contact"), path: "/contact" },
    { name: t("FAQ"), path: "/faq" }
  ];
  
  const legalLinks = [
    { name: t("Privacy Policy"), path: "/privacy-policy" },
    { name: t("Terms of Service"), path: "/terms-of-service" },
    { name: t("Cookie Policy"), path: "/cookie-policy" },
    { name: t("Imprint"), path: "/imprint" }
  ];
  
  const socialLinks = [
    { name: "Facebook", icon: Facebook, url: "https://facebook.com/cleaningapp" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com/cleaningapp" },
    { name: "Twitter", icon: Twitter, url: "https://twitter.com/cleaningapp" }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 px-4 relative">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-colors"
        aria-label={t("Back to top")}
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Company Info Section */}
          <div>
            <div className="mb-6">
              <img 
                src="/logo-white.png" 
                alt="Pureliving Helpers Logo" 
                className="h-10 mb-4"
              />
              <p className="text-gray-400 leading-relaxed">
                {t("Professional cleaning services tailored to your needs. Providing quality and reliability across Europe.")}
              </p>
            </div>
            
            {/* Contact Information */}
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {t("Contact Us")}
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-teal-400" />
                <a 
                  href="mailto:contact@cleaningapp.com" 
                  className="hover:text-teal-300 transition-colors"
                  aria-label={t("Email us")}
                >
                  contact@cleaningapp.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <a 
                    href="tel:+491234567890" 
                    className="hover:text-teal-300 transition-colors"
                    aria-label={t("Call us")}
                  >
                    +49 (0) 123 456 7890
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("Available Mon-Fri")}: 8:00 - 18:00
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-teal-400 flex-shrink-0 mt-1" />
                <address className="not-italic text-gray-400">
                  Pureliving Helpers GmbH<br />
                  Musterstraße 123<br />
                  10115 Berlin
                </address>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 mr-3 text-teal-400 flex-shrink-0 mt-1" />
                <div className="text-gray-400">
                  <p>{t("Business Hours")}:</p>
                  <p className="text-sm">
                    {t("Mon-Fri")}: 8:00 - 18:00<br />
                    {t("Sat")}: 9:00 - 14:00<br />
                    {t("Sun")}: {t("Closed")}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {t("Quick Links")}
            </h3>
            <nav aria-label={t("Quick Links")}>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-teal-300 transition-colors duration-200 focus:outline-none focus:text-teal-300 flex items-center"
                    >
                      <span className="mr-2">›</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <h3 className="text-lg font-semibold mt-8 mb-4 border-b border-gray-700 pb-2">
              {t("Legal")}
            </h3>
            <nav aria-label={t("Legal")}>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-teal-300 transition-colors duration-200 focus:outline-none focus:text-teal-300 flex items-center"
                    >
                      <span className="mr-2">›</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <h3 className="text-lg font-semibold mt-8 mb-4 border-b border-gray-700 pb-2">
              {t("Follow Us")}
            </h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-teal-400 transition-colors bg-gray-800 p-2 rounded-full"
                  aria-label={`${t("Follow us on")} ${social.name}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {t("Stay Updated")}
            </h3>
            <form onSubmit={handleSubscribe} className="mb-6">
              <p className="text-gray-400 mb-3">
                {t("Subscribe to receive special offers and cleaning tips.")}
              </p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="email-input" className="sr-only">
                    {t("Email Address")}
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("Enter your email")}
                    className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    aria-required="true"
                  />
                </div>
                
                {subscriptionStatus && (
                  <div className={`text-sm flex items-center ${subscriptionStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                    {subscriptionStatus.success ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    {subscriptionStatus.message}
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  {t("Subscribe")}
                </button>
                
                <p className="text-xs text-gray-500">
                  {t("We respect your privacy and will never share your information.")}
                </p>
              </div>
            </form>
            
            <div className="bg-gray-800 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-teal-300 mb-2">{t("Need Help?")}</h4>
              <p className="text-gray-400 text-sm mb-3">
                {t("Have questions about our services?")}
              </p>
              <Link 
                to="/contact"
                className="inline-block bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                {t("Contact Us")}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Pureliving Helpers. {t("All rights reserved")}
          </p>
          
          <div className="flex justify-start md:justify-end space-x-4 text-sm text-gray-500">
            <Link to="/sitemap" className="hover:text-teal-400 transition-colors">
              {t("Sitemap")}
            </Link>
            <span>|</span>
            <button 
              className="hover:text-teal-400 transition-colors"
              onClick={() => {
                // This would typically open your cookie preferences
                console.log("Open cookie preferences");
              }}
            >
              {t("Cookie Preferences")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
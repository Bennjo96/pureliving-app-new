// src/controllers/serviceController.js
const Service = require('../models/Service'); // You'll need to create this model

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    // Since we might not have the Service model yet, let's return sample data
    const services = [
      {
        id: 'home-cleaning',
        title: 'Home Cleaning',
        description: 'Comprehensive cleaning for your entire home',
        price: 79.99,
        duration: '2-3 hours',
        isPopular: true,
        category: 'Residential',
        features: [
          'Thorough room-by-room cleaning',
          'Dust and wipe all surfaces',
          'Vacuum and mop floors',
          'Clean bathrooms and kitchen'
        ],
        rating: 4.9,
        icon: 'Home'
      },
      {
        id: 'deep-cleaning',
        title: 'Deep Cleaning',
        description: 'Intensive cleaning for a complete refresh',
        price: 129.99,
        duration: '4-5 hours',
        isPopular: false,
        category: 'Residential',
        features: [
          'All Home Cleaning services',
          'Deep clean of hard-to-reach areas',
          'Detailed appliance cleaning',
          'Carpet and upholstery spot cleaning'
        ],
        rating: 4.8,
        icon: 'Sparkles'
      },
      {
        id: 'window-cleaning',
        title: 'Window Cleaning',
        description: 'Professional window and glass surface cleaning',
        price: 59.99,
        duration: '1-2 hours',
        isPopular: false,
        category: 'Specialty',
        features: [
          'Interior and exterior window cleaning',
          'Streak-free guarantee',
          'Sill and frame cleaning',
          'Glass door and mirror cleaning'
        ],
        rating: 4.7,
        icon: 'Scan'
      },
      {
        id: 'move-cleaning',
        title: 'Move-in/Move-out Cleaning',
        description: 'Comprehensive cleaning for property transitions',
        price: 199.99,
        duration: '5-7 hours',
        isPopular: false,
        category: 'Specialty',
        features: [
          'Full home deep cleaning',
          'Appliance and fixture detailing',
          'Wall and baseboard cleaning',
          'Carpet and floor preparation'
        ],
        rating: 4.9,
        icon: 'DoorOpen'
      },
      {
        id: 'office-cleaning',
        title: 'Office Cleaning',
        description: 'Professional cleaning for commercial spaces',
        price: 149.99,
        duration: '3-4 hours',
        isPopular: false,
        category: 'Commercial',
        features: [
          'Reception and common areas cleaning',
          'Desk and workspace sanitization',
          'Restroom disinfection',
          'Kitchen and break room cleaning'
        ],
        rating: 4.8,
        icon: 'Building'
      }
    ];

    // Apply filters if present in query
    let filteredServices = [...services];
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;
      
      filteredServices = filteredServices.filter(service => 
        service.price >= minPrice && service.price <= maxPrice
      );
    }
    
    // Filter by category if it's in the query
    if (req.query.category) {
      filteredServices = filteredServices.filter(service => 
        service.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Sort by price, rating, or popularity
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          filteredServices.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filteredServices.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredServices.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          filteredServices.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
          break;
      }
    }

    res.status(200).json({ 
      success: true, 
      count: filteredServices.length,
      data: filteredServices
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services',
      error: error.message
    });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sample data (in a real app, you'd query the database)
    const services = [
      {
        id: 'home-cleaning',
        title: 'Home Cleaning',
        description: 'Comprehensive cleaning for your entire home',
        detailedDescription: 'Our professional home cleaning service provides a thorough clean for your entire home. We dust and wipe all surfaces, vacuum carpets and rugs, mop floors, clean bathrooms including showers, tubs, sinks and toilets, and ensure your kitchen is spotless including the sink, countertops, and appliance exteriors.',
        price: 79.99,
        duration: '2-3 hours',
        isPopular: true,
        category: 'Residential',
        features: [
          'Thorough room-by-room cleaning',
          'Dust and wipe all surfaces',
          'Vacuum and mop floors',
          'Clean bathrooms and kitchen'
        ],
        additionalServices: [
          { id: 'laundry', name: 'Laundry Service', price: 20, duration: '1 hour' },
          { id: 'dishes', name: 'Dish Washing', price: 15, duration: '30 min' },
          { id: 'fridge', name: 'Refrigerator Cleaning', price: 25, duration: '45 min' }
        ],
        rating: 4.9,
        reviewCount: 128,
        icon: 'Home'
      },
      // More service objects...
    ];
    
    const service = services.find(s => s.id === id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service',
      error: error.message
    });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Sample data (in a real app, you'd query the database)
    const services = [
      {
        id: 'home-cleaning',
        title: 'Home Cleaning',
        description: 'Comprehensive cleaning for your entire home',
        price: 79.99,
        duration: '2-3 hours',
        isPopular: true,
        category: 'Residential',
        features: [
          'Thorough room-by-room cleaning',
          'Dust and wipe all surfaces',
          'Vacuum and mop floors',
          'Clean bathrooms and kitchen'
        ],
        rating: 4.9,
        icon: 'Home'
      },
      {
        id: 'deep-cleaning',
        title: 'Deep Cleaning',
        description: 'Intensive cleaning for a complete refresh',
        price: 129.99,
        duration: '4-5 hours',
        isPopular: false,
        category: 'Residential',
        features: [
          'All Home Cleaning services',
          'Deep clean of hard-to-reach areas',
          'Detailed appliance cleaning',
          'Carpet and upholstery spot cleaning'
        ],
        rating: 4.8,
        icon: 'Sparkles'
      },
      // More service objects...
    ];
    
    const filteredServices = services.filter(
      service => service.category.toLowerCase() === category.toLowerCase()
    );
    
    if (filteredServices.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No services found in category: ${category}`
      });
    }
    
    res.status(200).json({ 
      success: true, 
      count: filteredServices.length,
      data: filteredServices
    });
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services by category',
      error: error.message
    });
  }
};

// Get service features
exports.getServiceFeatures = async (req, res) => {
  try {
    // Sample features data
    const features = [
      {
        id: 'eco-friendly',
        name: 'Eco-Friendly Cleaning',
        description: 'We use environmentally friendly cleaning products that are safe for your family and pets.',
        icon: 'Leaf'
      },
      {
        id: 'professional-staff',
        name: 'Professional Staff',
        description: 'Our cleaners are trained professionals with years of experience.',
        icon: 'Award'
      },
      {
        id: 'satisfaction-guarantee',
        name: 'Satisfaction Guarantee',
        description: 'If you\'re not satisfied with our service, we\'ll re-clean at no additional cost.',
        icon: 'Shield'
      },
      {
        id: 'flexible-scheduling',
        name: 'Flexible Scheduling',
        description: 'Choose a time that works best for you, including evenings and weekends.',
        icon: 'Calendar'
      },
      {
        id: 'insurance',
        name: 'Fully Insured',
        description: 'All our services are fully insured for your peace of mind.',
        icon: 'Lock'
      }
    ];
    
    res.status(200).json({ 
      success: true, 
      count: features.length,
      data: features
    });
  } catch (error) {
    console.error('Error fetching service features:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service features',
      error: error.message
    });
  }
};

// Get service FAQs
exports.getServiceFAQs = async (req, res) => {
  try {
    // Sample FAQ data
    const faqs = {
      general: [
        {
          question: "What's included in the Home Cleaning service?",
          answer: "Our Home Cleaning service includes thorough cleaning of all rooms, dusting and wiping surfaces, vacuuming carpets, mopping floors, and cleaning bathrooms and kitchens. We use eco-friendly products and follow a detailed checklist to ensure nothing is missed."
        },
        {
          question: "How long does a typical cleaning service take?",
          answer: "The duration depends on the size of your home and the service you choose. A standard Home Cleaning for a 2-bedroom apartment typically takes 2-3 hours, while Deep Cleaning may take 4-5 hours. Window Cleaning and Move-in/out services vary based on the scope of work."
        },
        {
          question: "Can I customize the cleaning services?",
          answer: "Yes! After selecting your base service, you'll have the option to add specific areas or tasks to customize your cleaning experience. Contact us for any special requirements not listed."
        }
      ],
      pricing: [
        {
          question: "Do you offer any discounts for recurring services?",
          answer: "Yes, we offer 10-20% discounts for regular recurring bookings. Weekly services receive the highest discount, while bi-weekly and monthly services also qualify for reduced rates. You can see the discount applied during the booking process."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely after your booking is confirmed. For recurring services, we offer convenient automatic billing options."
        }
      ],
      booking: [
        {
          question: "How far in advance should I book a cleaning service?",
          answer: "For regular cleaning services, we recommend booking at least 2-3 days in advance. For specialized services like deep cleaning or move-in/out cleaning, 5-7 days advance booking is ideal. However, we do offer same-day services based on availability."
        },
        {
          question: "Can I reschedule or cancel my booking?",
          answer: "Yes, you can reschedule or cancel your booking through your account dashboard. We require 24 hours notice for rescheduling and 48 hours for cancellations to avoid any fees. Emergency situations are handled on a case-by-case basis."
        }
      ],
      cleaners: [
        {
          question: "How are your cleaners vetted?",
          answer: "All our cleaners undergo a rigorous screening process that includes background checks, reference verification, and skill assessment. We only hire experienced professionals who meet our high standards."
        },
        {
          question: "Can I request the same cleaner for recurring services?",
          answer: "Yes, you can! We understand the importance of consistency and trust. You can request your preferred cleaner through your account settings or by contacting our customer service."
        }
      ]
    };
    
    // Filter by category if provided
    if (req.query.category && faqs[req.query.category]) {
      return res.status(200).json({ 
        success: true, 
        count: faqs[req.query.category].length,
        data: faqs[req.query.category]
      });
    }
    
    // Otherwise return all categories
    res.status(200).json({ 
      success: true, 
      data: faqs
    });
  } catch (error) {
    console.error('Error fetching service FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service FAQs',
      error: error.message
    });
  }
};

module.exports = exports;
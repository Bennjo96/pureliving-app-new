// src/contexts/BookingContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { bookingService, adminService } from '../api/api';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  // ==================== STATE STRUCTURE ====================
  const [bookingData, setBookingData] = useState({
    // Step 1: Service Selection
    service: null,
    
    // Step 2: Service Customization (NEW)
    customizations: {
      extraRooms: [],
      addOns: [],
      priorities: [],
      homeDetails: {
        hasPets: false,
        hasChildren: false,
        homeOffice: false,
        petDetails: ''
      },
      cleaningProducts: 'standard',
      specialRequests: ''
    },
    
    // Step 3: Location
    location: {
      postalCode: null,
      cityName: null,
      streetName: null,
      streetNumber: null,
      formattedAddress: null,
      coordinates: null,
      validated: false,
      accessInstructions: '' // NEW
    },
    
    // Step 4: Schedule
    dateTime: {
      date: null,
      time: null,
      flexible: false
    },
    frequency: 'one-time', // one-time, weekly, bi-weekly, monthly
    apartmentSize: '80', // 50, 80, 120, 150+
    
    // Step 5: Customer Details (UPDATED)
    customer: {
      firstName: null,
      lastName: null,
      email: null,
      phone: null,
      address: null, // Full address if different from service location
      specialInstructions: '',
      accessInstructions: '',
      contactPreference: 'email',
      createAccount: false,
      isGuest: true
    },
    
    // Step 6: Payment
    payment: {
      method: 'card', // card, paypal, sepa
      status: null,
      transactionId: null,
      isTestMode: false
    },
    
    // Pricing (UPDATED)
    pricing: {
      basePrice: 0,
      customizationsCost: 0, // NEW
      frequencyDiscount: 0, // NEW
      apartmentSizeAdjustment: 0, // NEW
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: 'EUR'
    },
    
    // System
    cleaner: null, // Auto-assigned after payment
    status: 'draft', // draft, pending_payment, confirmed, in_progress, completed
    bookingId: null,
    createdAt: null,
    updatedAt: null
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('service');
  
  // ==================== HELPER FUNCTIONS ====================
  
  const sanitizeServiceData = (service) => {
    if (!service) return null;
    const { icon, ...serviceData } = service;
    if (icon && icon.displayName) {
      serviceData.iconName = icon.displayName;
    }
    return serviceData;
  };

  const calculatePricing = () => {
    const { service, customizations, frequency, apartmentSize } = bookingData;
    
    if (!service) return;
    
    let basePrice = service.price || 0;
    
    // Calculate customizations cost
    let customizationsCost = 0;
    if (customizations.addOns.length > 0) {
      customizationsCost += customizations.addOns.reduce((sum, addon) => sum + addon.price, 0);
    }
    if (customizations.extraRooms.length > 0) {
      customizationsCost += customizations.extraRooms.reduce((sum, room) => sum + room.price, 0);
    }
    
    // Calculate frequency discount
    let frequencyDiscount = 0;
    let discountPercentage = 0;
    if (frequency === 'weekly') {
      discountPercentage = 0.15; // 15% off
    } else if (frequency === 'bi-weekly') {
      discountPercentage = 0.10; // 10% off
    } else if (frequency === 'monthly') {
      discountPercentage = 0.05; // 5% off
    }
    frequencyDiscount = (basePrice + customizationsCost) * discountPercentage;
    
    // Calculate apartment size adjustment
    let apartmentSizeAdjustment = 0;
    if (apartmentSize === '120') {
      apartmentSizeAdjustment = (basePrice + customizationsCost) * 0.2; // 20% increase
    } else if (apartmentSize === '150+') {
      apartmentSizeAdjustment = (basePrice + customizationsCost) * 0.35; // 35% increase
    }
    
    // Calculate totals
    const subtotal = basePrice + customizationsCost + apartmentSizeAdjustment - frequencyDiscount;
    const tax = subtotal * 0.19; // 19% VAT for Germany
    const total = subtotal + tax;
    
    // Update pricing in state
    setBookingData(prev => ({
      ...prev,
      pricing: {
        basePrice,
        customizationsCost,
        frequencyDiscount,
        apartmentSizeAdjustment,
        subtotal,
        tax,
        total,
        currency: 'EUR'
      }
    }));
    
    return total;
  };

  // ==================== STEP FUNCTIONS ====================
  
  // Step 1: Service Selection
  const selectService = (service) => {
    if (!service) return;
    
    const sanitizedService = sanitizeServiceData(service);
    setBookingData(prev => ({
      ...prev,
      service: sanitizedService,
      pricing: {
        ...prev.pricing,
        basePrice: sanitizedService.price || 0
      }
    }));
    setCurrentStep('customize');
  };

  // Step 2: Service Customization
  const setCustomizations = (customizations) => {
    setBookingData(prev => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        ...customizations
      }
    }));
    calculatePricing();
  };

  // Step 3: Location
  const setLocation = (locationData) => {
    if (!locationData) return;
    
    setBookingData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        ...locationData,
        validated: true
      }
    }));
    
    // Persist to localStorage
    if (locationData.postalCode) {
      localStorage.setItem('userPostalCode', locationData.postalCode);
    }
    if (locationData.cityName) {
      localStorage.setItem('userCityName', locationData.cityName);
    }
  };

  // Step 4: Schedule
  const setSchedule = (scheduleData) => {
    setBookingData(prev => ({
      ...prev,
      dateTime: scheduleData.dateTime || prev.dateTime,
      frequency: scheduleData.frequency || prev.frequency,
      apartmentSize: scheduleData.apartmentSize || prev.apartmentSize
    }));
    calculatePricing();
  };

  // Step 5: Customer Details
  const setCustomerDetails = (customerData) => {
    setBookingData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        ...customerData
      }
    }));
  };

  // Step 6: Payment
  const setPaymentMethod = (method) => {
    setBookingData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        method
      }
    }));
  };

  // ==================== API FUNCTIONS ====================
  
  const createBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const { service, location, dateTime, apartmentSize, customizations, pricing, customer } = bookingData;

      // Map apartment size to approximate duration in hours
      const durationMap = { '50': 2, '80': 3, '120': 4, '150+': 5 };
      const duration = durationMap[apartmentSize] || 3;

      // Build the address object the backend schema requires
      const streetParts = [location?.streetName, location?.streetNumber].filter(Boolean);
      const street = streetParts.length > 0
        ? streetParts.join(' ')
        : (location?.formattedAddress || 'Address not specified');

      const payload = {
        // Core required fields — match backend Booking schema
        service: service?.title,
        date: dateTime?.date,
        time: dateTime?.time,
        duration,
        address: {
          street,
          city: location?.cityName || 'Unknown',
          state: 'Germany',
          zipCode: location?.postalCode || '00000',
          additionalInfo: location?.accessInstructions || customizations?.specialRequests || '',
        },
        notes: customizations?.specialRequests || '',

        // Pricing (backend uses this to set booking.price)
        pricing,

        // Customer contact details
        customer,
      };
      
      const response = await bookingService.createBooking(payload);
      
      if (response.data?.booking) {
        const createdBooking = response.data.booking;
        setBookingData(prev => ({
          ...prev,
          bookingId: createdBooking._id || createdBooking.id,
          status: 'pending_payment'
        }));
        return createdBooking;
      }
      
      throw new Error('Failed to create booking');
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processPaymentAndAssignCleaner = async (paymentDetails) => {
    setLoading(true);
    setError(null);
    
    try {
      // Process payment and trigger auto-assignment
      const response = await bookingService.processPayment(bookingData.bookingId, {
        paymentMethod: paymentDetails.method,
        transactionId: paymentDetails.transactionId,
        amount: bookingData.pricing.total,
        isTestMode: paymentDetails.isTestMode
      });
      
      if (response.data?.booking) {
        const confirmedBooking = response.data.booking;
        
        // Update state with confirmed booking including assigned cleaner
        setBookingData(prev => ({
          ...prev,
          cleaner: confirmedBooking.cleaner,
          payment: {
            ...prev.payment,
            status: 'completed',
            transactionId: paymentDetails.transactionId
          },
          status: 'confirmed'
        }));
        
        return confirmedBooking;
      }
      
      throw new Error('Payment processing failed');
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Payment failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async (bookingDetails) => {
    // This is called after successful payment
    // bookingDetails should include the cleaner assigned by the backend
    
    const completedBooking = {
      ...bookingData,
      ...bookingDetails,
      status: 'confirmed',
      cleaner: bookingDetails.cleaner || bookingData.cleaner,
      updatedAt: new Date().toISOString()
    };
    
    setBookingData(completedBooking);
    return completedBooking;
  };

  // ==================== NAVIGATION ====================
  
  const steps = ['service', 'customize', 'location', 'schedule', 'details', 'payment', 'confirmation'];
  
  const canProceedToStep = (targetStep) => {
    const currentIndex = steps.indexOf(currentStep);
    const targetIndex = steps.indexOf(targetStep);
    
    if (targetIndex <= currentIndex) return true;
    
    // Check required data for each step
    switch (targetStep) {
      case 'customize':
        return !!bookingData.service;
      case 'location':
        return !!bookingData.service;
      case 'schedule':
        return !!bookingData.service && !!bookingData.location.postalCode;
      case 'details':
        return !!bookingData.service && !!bookingData.location.postalCode && 
               !!bookingData.dateTime.date && !!bookingData.dateTime.time;
      case 'payment':
        return !!bookingData.service && !!bookingData.location.postalCode && 
               !!bookingData.dateTime.date && !!bookingData.dateTime.time &&
               !!bookingData.customer.email && !!bookingData.customer.phone;
      case 'confirmation':
        return !!bookingData.bookingId && bookingData.status === 'confirmed';
      default:
        return false;
    }
  };

  const goToStep = (step) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1]);
    }
  };

  // ==================== UTILITIES ====================
  
  const resetBooking = () => {
    setBookingData({
      service: null,
      customizations: {
        extraRooms: [],
        addOns: [],
        priorities: [],
        homeDetails: {
          hasPets: false,
          hasChildren: false,
          homeOffice: false,
          petDetails: ''
        },
        cleaningProducts: 'standard',
        specialRequests: ''
      },
      location: {
        postalCode: null,
        cityName: null,
        streetName: null,
        streetNumber: null,
        formattedAddress: null,
        coordinates: null,
        validated: false,
        accessInstructions: ''
      },
      dateTime: {
        date: null,
        time: null,
        flexible: false
      },
      frequency: 'one-time',
      apartmentSize: '80',
      customer: {
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        address: null,
        specialInstructions: '',
        accessInstructions: '',
        contactPreference: 'email',
        createAccount: false,
        isGuest: true
      },
      payment: {
        method: 'card',
        status: null,
        transactionId: null,
        isTestMode: false
      },
      pricing: {
        basePrice: 0,
        customizationsCost: 0,
        frequencyDiscount: 0,
        apartmentSizeAdjustment: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        currency: 'EUR'
      },
      cleaner: null,
      status: 'draft',
      bookingId: null,
      createdAt: null,
      updatedAt: null
    });
    
    setCurrentStep('service');
    setError(null);
  };

  const updateBooking = (updates) => {
    setBookingData(prev => ({
      ...prev,
      ...updates
    }));
  };

  // ==================== LOAD SAVED DATA ====================
  
  useEffect(() => {
    // Load saved location from localStorage
    const savedPostalCode = localStorage.getItem('userPostalCode');
    const savedCityName = localStorage.getItem('userCityName');
    
    if (savedPostalCode || savedCityName) {
      setBookingData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          postalCode: savedPostalCode,
          cityName: savedCityName
        }
      }));
    }
  }, []);

  // ==================== CONTEXT VALUE ====================
  
  const contextValue = {
    // State
    bookingData,
    loading,
    error,
    currentStep,
    
    // Step functions
    selectService,
    setCustomizations,
    setLocation,
    setSchedule,
    setCustomerDetails,
    setPaymentMethod,
    
    // API functions
    createBooking,
    processPaymentAndAssignCleaner,
    completeBooking,
    
    // Navigation
    steps,
    canProceedToStep,
    goToStep,
    nextStep,
    prevStep,
    
    // Utilities
    calculatePricing,
    resetBooking,
    updateBooking,
    
    // Aliases for backward compatibility
    setService: selectService,
    setDateTime: (date, time, flexible = false) => {
      setSchedule({ dateTime: { date, time, flexible } });
    },
    calculateTotal: calculatePricing,
    currentBooking: bookingData,
    startBooking: resetBooking
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;
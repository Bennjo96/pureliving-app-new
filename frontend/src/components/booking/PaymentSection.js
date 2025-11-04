import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Shield } from 'lucide-react';

const PaymentSection = ({ onSelectPaymentMethod, paymentMethod }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <CreditCard className="mr-2 text-teal-600" size={20} />
        Payment Method
      </h3>
      
      <div className="space-y-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`border p-4 rounded-lg cursor-pointer
                    ${paymentMethod === 'card' 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-teal-200'}`}
          onClick={() => onSelectPaymentMethod('card')}
        >
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-md shadow-sm mr-3">
              <CreditCard className="text-teal-600" size={24} />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Credit/Debit Card</h4>
              <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`border p-4 rounded-lg cursor-pointer
                    ${paymentMethod === 'paypal' 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-teal-200'}`}
          onClick={() => onSelectPaymentMethod('paypal')}
        >
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-md shadow-sm mr-3">
              {/* Using a placeholder text instead of image */}
              <div className="w-6 h-6 flex items-center justify-center text-blue-600 font-bold">P</div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">PayPal</h4>
              <p className="text-xs text-gray-500">Pay securely with PayPal</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`border p-4 rounded-lg cursor-pointer
                    ${paymentMethod === 'klarna' 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-teal-200'}`}
          onClick={() => onSelectPaymentMethod('klarna')}
        >
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-md shadow-sm mr-3">
              {/* Using a placeholder text instead of image */}
              <div className="w-6 h-6 flex items-center justify-center text-pink-600 font-bold">K</div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Klarna</h4>
              <p className="text-xs text-gray-500">Pay later or in installments</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Payment form for card */}
      <AnimatePresence>
        {paymentMethod === 'card' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="123"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Name on card"
                />
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <label className="text-sm text-gray-600">
                  Save this card for future bookings
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-6 pt-4 border-t flex items-center justify-center text-sm text-gray-500">
        <Shield className="mr-2" size={16} />
        Your payment information is secure and encrypted
      </div>
    </div>
  );
};

export default PaymentSection;
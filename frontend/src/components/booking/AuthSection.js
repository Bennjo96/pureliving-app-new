import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Info } from 'lucide-react';

const AuthSection = ({ onSelectAuthMethod, authMethod }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="mr-2 text-teal-600" size={20} />
        Account Options
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className={`border p-4 rounded-lg cursor-pointer text-center
                    ${authMethod === 'login' 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-teal-200'}`}
          onClick={() => onSelectAuthMethod('login')}
        >
          <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <User className="text-teal-600" size={24} />
          </div>
          <h4 className="font-medium text-gray-800 mb-1">Login</h4>
          <p className="text-xs text-gray-500">Already have an account</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.03 }}
          className={`border p-4 rounded-lg cursor-pointer text-center
                    ${authMethod === 'register' 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-teal-200'}`}
          onClick={() => onSelectAuthMethod('register')}
        >
          <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <User className="text-teal-600" size={24} />
          </div>
          <h4 className="font-medium text-gray-800 mb-1">Sign Up</h4>
          <p className="text-xs text-gray-500">Create a new account</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.03 }}
          className={`border p-4 rounded-lg cursor-pointer text-center
                    ${authMethod === 'guest' 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-teal-200'}`}
          onClick={() => onSelectAuthMethod('guest')}
        >
          <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <User className="text-teal-600" size={24} />
          </div>
          <h4 className="font-medium text-gray-800 mb-1">Guest Checkout</h4>
          <p className="text-xs text-gray-500">Book without an account</p>
        </motion.div>
      </div>
      
      {/* Form based on selection */}
      <AnimatePresence>
        {authMethod === 'login' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" className="mr-2" />
                  Remember me
                </label>
                <button className="text-sm text-teal-600 hover:underline">
                  Forgot password?
                </button>
              </div>
              <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                Login
              </button>
            </div>
          </motion.div>
        )}
        
        {authMethod === 'register' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Last Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+49 123 45678900"
                />
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <label className="text-sm text-gray-600">
                  I agree to the <button className="text-teal-600 hover:underline">Terms of Service</button> and{" "}
                  <button className="text-teal-600 hover:underline">Privacy Policy</button>
                </label>
              </div>
              <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                Create Account
              </button>
            </div>
          </motion.div>
        )}
        
        {authMethod === 'guest' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Last Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+49 123 45678900"
                />
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700 flex">
                <Info className="mr-2 flex-shrink-0" size={18} />
                <p>Checking out as a guest? Consider creating an account to easily manage your bookings and get exclusive offers.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthSection;
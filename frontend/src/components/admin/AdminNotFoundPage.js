import React from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  ChevronRight
} from "lucide-react";

const AdminNotFoundPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-amber-50 p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold">Admin Page Not Found</h3>
          </div>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            This admin page doesn't exist
          </h1>
          
          <p className="text-gray-600 text-center max-w-md mb-8">
            The admin page you're looking for could not be found. It might have been moved or deleted.
          </p>
          
          <Link
            to="/admin/dashboard"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors mb-8"
          >
            Return to Admin Dashboard
          </Link>
          
          <div className="w-full max-w-md">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Popular Admin Pages
            </h4>
            
            <div className="grid gap-3">
              <Link
                to="/admin/dashboard"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Dashboard</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">User Management</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                to="/admin/bookings"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Booking Management</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">System Settings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotFoundPage;
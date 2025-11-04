import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

const toastConfig = {
  success: {
    icon: <CheckCircle className="w-5 h-5 mr-2" />,
    className: "bg-teal-500 text-white",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 mr-2" />,
    className: "bg-red-500 text-white",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 mr-2" />,
    className: "bg-amber-500 text-white",
  },
  info: {
    icon: <Info className="w-5 h-5 mr-2" />,
    className: "bg-blue-500 text-white",
  },
  loading: {
    icon: <Loader2 className="w-5 h-5 mr-2 animate-spin" />,
    className: "bg-gray-700 text-white",
  },
  // Default case
  default: {
    icon: <Info className="w-5 h-5 mr-2" />,
    className: "bg-gray-500 text-white",
  },
};

const showToast = (message, type = "default", options = {}) => {
  const config = toastConfig[type] || toastConfig.default; // Use default if type is invalid

  toast(
    <div className="flex items-center">
      {config.icon}
      <span>{message}</span>
    </div>,
    {
      className: `${config.className} flex items-center text-sm font-medium px-4 py-3 rounded-lg shadow-lg border-l-4`,
      bodyClassName: "flex items-center",
      progressClassName: "bg-white",
      autoClose: options.duration || 3000,
      position: options.position || "bottom-right",
      closeButton: options.closeButton !== undefined ? options.closeButton : true,
      ...options,
    }
  );
};

// Export specific toast types for direct use
export const success = (message, options) => showToast(message, "success", options);
export const error = (message, options) => showToast(message, "error", options);
export const warning = (message, options) => showToast(message, "warning", options);
export const info = (message, options) => showToast(message, "info", options);
export const loading = (message, options) => showToast(message, "loading", options);

// Export showToast for custom types
export default showToast;

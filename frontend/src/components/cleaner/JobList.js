// src/components/cleaner/JobList.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  User,
  Search,
  ChevronRight,
  CheckSquare,
  XSquare,
  CalendarCheck,
  CalendarX,
} from "lucide-react";
import { useCleanerJobs } from "../../hooks/useCleanerData";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { cleanerService } from "../../api/api";

const JobStatusBadge = ({ status }) => {
  const statusConfig = {
    new: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      label: "New",
      icon: <CalendarCheck className="h-3 w-3 mr-1" />,
    },
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Pending",
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    confirmed: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Confirmed",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
      icon: <CheckSquare className="h-3 w-3 mr-1" />,
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Cancelled",
      icon: <CalendarX className="h-3 w-3 mr-1" />,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div
      className={`${config.bg} ${config.text} text-xs px-2 py-1 rounded-full font-medium flex items-center`}
    >
      {config.icon}
      {config.label}
    </div>
  );
};

const JobList = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all"); // all, new, upcoming, completed, cancelled
  const [searchQuery, setSearchQuery] = useState("");
  const { jobs, isLoading, error, refetch } = useCleanerJobs();
  const [actionLoading, setActionLoading] = useState(null);

  // Handle job acceptance
  const handleAcceptJob = async (e, jobId) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    try {
      setActionLoading(jobId);
      await cleanerService.updateJobStatus(jobId, "confirmed");
      refetch(); // Refresh the jobs list
    } catch (err) {
      console.error("Error accepting job:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle job rejection
  const handleRejectJob = async (e, jobId) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    if (window.confirm(t("Are you sure you want to decline this job?"))) {
      try {
        setActionLoading(jobId);
        await cleanerService.updateJobStatus(
          jobId,
          "cancelled",
          "Declined by cleaner"
        );
        refetch(); // Refresh the jobs list
      } catch (err) {
        console.error("Error rejecting job:", err);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Ensure jobs is an array
  const jobsArray = Array.isArray(jobs) ? jobs : [];

  // Filter jobs based on status
  const filterJobsByStatus = (jobsToFilter) => {
    if (statusFilter === "all") return jobsToFilter;

    if (statusFilter === "new") {
      return jobsToFilter.filter((job) => job.status === "new");
    }

    if (statusFilter === "upcoming") {
      return jobsToFilter.filter((job) =>
        ["confirmed", "pending"].includes(job.status)
      );
    }

    return jobsToFilter.filter((job) => job.status === statusFilter);
  };

  // Filter jobs based on search query
  const filteredJobs = filterJobsByStatus(jobsArray).filter(
    (job) =>
      (job.serviceType &&
        job.serviceType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.clientName &&
        job.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.location &&
        job.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Count new jobs
  const newJobsCount = jobsArray.filter((job) => job.status === "new").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t("My Jobs")}
        </h1>
        <p className="text-gray-600">
          {t("Manage your upcoming and past cleaning jobs")}
        </p>
      </div>

      {/* New Jobs Notification */}
      {newJobsCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 flex items-center">
          <CalendarCheck className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-indigo-700">
              {t("You have {{count}} new job requests", {
                count: newJobsCount,
              })}
            </p>
            <p className="text-sm text-indigo-600 mt-1">
              {t("Please review and accept or decline them")}
            </p>
          </div>
          {statusFilter !== "new" && (
            <button
              onClick={() => setStatusFilter("new")}
              className="ml-auto bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {t("View New Jobs")}
            </button>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: "all", icon: <Calendar className="h-4 w-4" /> },
            { id: "new", icon: <CalendarCheck className="h-4 w-4" /> },
            { id: "upcoming", icon: <Clock className="h-4 w-4" /> },
            { id: "completed", icon: <CheckCircle className="h-4 w-4" /> },
            { id: "cancelled", icon: <AlertCircle className="h-4 w-4" /> },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap
                        ${
                          statusFilter === status.id
                            ? "bg-teal-100 text-teal-700 border border-teal-200"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
            >
              <span className="mr-2">{status.icon}</span>
              {t(status.id)}

              {/* Badge for new job count */}
              {status.id === "new" && newJobsCount > 0 && (
                <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {newJobsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t("Search jobs...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            {t("No jobs found")}
          </h3>
          <p className="text-gray-500">
            {statusFilter === "all"
              ? t("You don't have any jobs at the moment")
              : statusFilter === "new"
              ? t("You don't have any new job requests")
              : statusFilter === "upcoming"
              ? t("You don't have any upcoming jobs at the moment")
              : statusFilter === "completed"
              ? t("No completed jobs in your history yet")
              : t("No cancelled jobs to show")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Link to={`/cleaner/jobs/${job.id}`} key={job.id} className="block">
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                className={`bg-white rounded-xl shadow-sm border p-4 
                          hover:border-teal-200 transition-all duration-200
                          ${
                            job.status === "new"
                              ? "border-indigo-300 bg-indigo-50/30"
                              : "border-gray-100"
                          }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div
                      className={`p-3 rounded-lg mr-4 ${
                        job.status === "new" ? "bg-indigo-100" : "bg-teal-50"
                      }`}
                    >
                      <Calendar
                        className={`h-6 w-6 ${
                          job.status === "new"
                            ? "text-indigo-600"
                            : "text-teal-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {job.serviceType}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(job.scheduledAt).toLocaleDateString()}{" "}
                        {new Date(job.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <User className="h-4 w-4 mr-1" />
                        {job.clientName}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <JobStatusBadge status={job.status} />
                    <div className="mt-2 text-teal-600 font-medium">
                      €{job.payment?.amount?.toFixed(2) || "0.00"}
                    </div>

                    {/* Action buttons for new jobs */}
                    {job.status === "new" ? (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={(e) => handleAcceptJob(e, job.id)}
                          disabled={actionLoading === job.id}
                          className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                        >
                          {actionLoading === job.id ? (
                            <span className="flex items-center">
                              <span className="animate-spin h-3 w-3 mr-1 border-2 border-green-700 border-t-transparent rounded-full"></span>
                              {t("Processing")}
                            </span>
                          ) : (
                            <>
                              <CheckSquare className="h-4 w-4 mr-1" />
                              {t("Accept")}
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleRejectJob(e, job.id)}
                          disabled={actionLoading === job.id}
                          className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          <XSquare className="h-4 w-4 mr-1" />
                          {t("Decline")}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-auto pt-2">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;

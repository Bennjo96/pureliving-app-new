// src/hooks/useCleanerData.js
import { useState, useEffect, useCallback } from 'react';
import { cleanerService, userService } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

export const useCleanerData = () => {
  const [isUserCleaner, setIsUserCleaner] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Check if the current user is a cleaner
  useEffect(() => {
    const checkCleanerRole = async () => {
      if (!isAuthenticated) {
        setIsCheckingRole(false);
        return;
      }

      try {
        // Get the user profile which should include roles
        const response = await userService.getProfile();
        const isCleaner = response.data?.user?.role === 'cleaner' || 
                         response.data?.user?.roles?.includes('cleaner') ||
                         response.data?.isCleaner === true;
        
        setIsUserCleaner(isCleaner);
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsUserCleaner(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkCleanerRole();
  }, [isAuthenticated, user]);

  return {
    isUserCleaner,
    isCheckingRole
  };
};

export const useCleanerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isUserCleaner, isCheckingRole } = useCleanerData();

  const fetchDashboardData = useCallback(async () => {
    if (isCheckingRole) return; // Wait until we know if the user is a cleaner
    
    if (!isUserCleaner) {
      setError("You don't have permission to access the cleaner dashboard. Please contact support if you believe this is an error.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cleanerService.getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching cleaner dashboard data:", error);
      setError(
        error.message || 
        "Unable to load dashboard data. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUserCleaner, isCheckingRole]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboard,
    isUserCleaner
  };
};

export const useCleanerJobs = (status = 'all') => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isUserCleaner, isCheckingRole } = useCleanerData();

  const fetchJobs = useCallback(async () => {
    if (isCheckingRole) return;
    
    if (!isUserCleaner) {
      setError("You don't have permission to access cleaner jobs. Please contact support if you believe this is an error.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cleanerService.getJobs(status);
      setJobs(response.data.jobs);
      setError(null);
    } catch (error) {
      console.error("Error fetching cleaner jobs:", error);
      setError(
        error.message || 
        "Unable to load jobs. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [status, isUserCleaner, isCheckingRole]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const refreshJobs = () => {
    fetchJobs();
  };

  return {
    jobs,
    isLoading,
    error,
    refreshJobs,
    isUserCleaner
  };
};

export const useCleanerJobDetails = (jobId) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isUserCleaner, isCheckingRole } = useCleanerData();

  const fetchJobDetails = useCallback(async () => {
    if (!jobId || isCheckingRole) return;
    
    if (!isUserCleaner) {
      setError("You don't have permission to access job details. Please contact support if you believe this is an error.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cleanerService.getJobDetails(jobId);
      setJobDetails(response.data);
      setError(null);
    } catch (error) {
      console.error(`Error fetching job details for job ${jobId}:`, error);
      setError(
        error.message || 
        "Unable to load job details. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobId, isUserCleaner, isCheckingRole]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const refreshJobDetails = () => {
    fetchJobDetails();
  };

  return {
    jobDetails,
    isLoading,
    error,
    refreshJobDetails,
    isUserCleaner
  };
};

export const useCleanerEarnings = (period = 'month') => {
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isUserCleaner, isCheckingRole } = useCleanerData();

  const fetchEarnings = useCallback(async () => {
    if (isCheckingRole) return;
    
    if (!isUserCleaner) {
      setError("You don't have permission to access earnings data. Please contact support if you believe this is an error.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cleanerService.getEarnings(period);
      setEarnings(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching cleaner earnings:", error);
      setError(
        error.message || 
        "Unable to load earnings data. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [period, isUserCleaner, isCheckingRole]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const refreshEarnings = () => {
    fetchEarnings();
  };

  return {
    earnings,
    isLoading,
    error,
    refreshEarnings,
    isUserCleaner
  };
};

export default useCleanerData;
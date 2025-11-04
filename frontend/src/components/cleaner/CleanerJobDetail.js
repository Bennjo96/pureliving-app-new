import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Home,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  Loader,
  Camera,
  CheckSquare,
  CalendarCheck,
  CalendarX,
  Clock3,
  Shield,
  Navigation,
  Car,
  Route
} from "lucide-react";
import { cleanerService } from "../../api/api";
import LoadingSpinner from "../common/LoadingSpinner";

// Map Component to show the job location and distance
const JobLocationMap = ({ location, distance, travelTime }) => {
  // In a real implementation, this would use Google Maps or a similar service
  return (
    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
      <div className="h-40 bg-gray-100 relative">
        {/* This would be replaced with an actual map in production */}
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="h-10 w-10 text-red-500" />
          <div className="absolute inset-0 border-4 border-teal-500 border-opacity-30 rounded-lg"></div>
        </div>
      </div>
      <div className="bg-white p-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Navigation className="h-4 w-4 text-teal-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">{distance} km from your location</span>
          </div>
          <div className="flex items-center">
            <Car className="h-4 w-4 text-teal-600 mr-2" />
            <span className="text-sm text-gray-600">~{travelTime} min drive</span>
          </div>
        </div>
        <a 
          href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 text-teal-600 text-sm flex items-center hover:text-teal-700"
        >
          <Route className="h-4 w-4 mr-1" />
          Get directions
        </a>
      </div>
    </div>
  );
};

// Proximity Indicator Component
const ProximityIndicator = ({ score, isGood }) => {
  const getColorClass = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-400";
    if (score >= 20) return "bg-orange-400";
    return "bg-red-400";
  };
  
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Distance Score</span>
        <span className="text-xs font-medium text-gray-700">{score}/100</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColorClass()}`} style={{ width: `${score}%` }}></div>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {isGood ? 
          "This job is well within your service area." : 
          "This job is near the edge of your service area."}
      </p>
    </div>
  );
};

// Main Component
const CleanerJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'accept', 'reject', 'start', 'complete'
  
  // Additional state for proximity information
  const [proximityData, setProximityData] = useState({
    distance: "5.2", // Sample distance in km
    travelTime: "15", // Sample travel time in minutes
    proximityScore: 76, // Sample score from algorithm 0-100
  });

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        const response = await cleanerService.getJobDetails(jobId);
        setJob(response.data);
        
        // In an actual implementation, you would get this data from your API
        // This simulates fetching proximity data based on the job
        if (response.data && response.data.location) {
          // Mock calculation of distance - this would come from your backend in production
          // This would be part of your assignment algorithm scoring
          const mockProximityData = {
            distance: (Math.random() * 10 + 2).toFixed(1),
            travelTime: Math.floor(Math.random() * 20 + 10).toString(),
            proximityScore: Math.floor(Math.random() * 40 + 60)
          };
          setProximityData(mockProximityData);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Could not load the job details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Update job status
  const updateJobStatus = async (status) => {
    try {
      setIsUpdating(true);
      await cleanerService.updateJobStatus(jobId, status, notes);
      // Refresh job details
      const response = await cleanerService.getJobDetails(jobId);
      setJob(response.data);
      setNotes("");
      setShowConfirmationModal(false);
    } catch (err) {
      console.error("Error updating job status:", err);
      setError("Failed to update the job status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open confirmation modal
  const confirmAction = (type) => {
    setActionType(type);
    setShowConfirmationModal(true);
  };

  // Handle action confirmation
  const handleConfirmedAction = () => {
    if (actionType === 'accept') {
      updateJobStatus('confirmed');
    } else if (actionType === 'reject') {
      updateJobStatus('cancelled');
    } else if (actionType === 'start') {
      updateJobStatus('in_progress');
    } else if (actionType === 'complete') {
      updateJobStatus('completed');
    }
  };

  // Handle photo upload (mock implementation)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    
    // Simulating file upload with timeout
    setTimeout(() => {
      const newPhotos = files.map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        url: URL.createObjectURL(file),
        name: file.name,
        uploadedAt: new Date().toISOString()
      }));
      
      setPhotos([...photos, ...newPhotos]);
      setUploadingPhoto(false);
    }, 1500);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("Back")}
        </button>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("Back")}
        </button>
        
        <div className="text-center py-8 text-gray-500">
          <p>{t("Job not found")}</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    new: { color: "text-indigo-500", bg: "bg-indigo-100", icon: CalendarCheck, title: "New Job Request" },
    pending: { color: "text-yellow-500", bg: "bg-yellow-100", icon: AlertTriangle, title: "Pending Job" },
    confirmed: { color: "text-blue-500", bg: "bg-blue-100", icon: Calendar, title: "Confirmed Job" },
    in_progress: { color: "text-purple-500", bg: "bg-purple-100", icon: Clock3, title: "Job In Progress" },
    completed: { color: "text-green-500", bg: "bg-green-100", icon: CheckSquare, title: "Completed Job" },
    cancelled: { color: "text-red-500", bg: "bg-red-100", icon: CalendarX, title: "Cancelled Job" },
  };

  const StatusIcon = statusConfig[job.status]?.icon || AlertTriangle;
  const statusTitle = statusConfig[job.status]?.title || "Job Details";

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> {t("Back to Jobs")}
      </button>
      
      {/* Status Banner for New Jobs */}
      {job.status === 'new' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 flex items-center">
          <CalendarCheck className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-indigo-700 text-lg">{t("New Job Request")}</h3>
            <p className="text-indigo-600 mt-1">
              {t("This job is waiting for your confirmation. Please review the details and accept or decline.")}
            </p>
          </div>
        </div>
      )}
      
      <div className={`bg-white rounded-xl shadow-sm border p-6 mb-6 ${job.status === 'new' ? 'border-indigo-200' : 'border-gray-100'}`}>
        {/* Job Header with Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {job.serviceType}
            </h1>
            <div className="text-gray-500 text-sm">
              {t("Job ID")}: {job.id}
            </div>
          </div>
          <div className={`${statusConfig[job.status]?.bg} px-3 py-1 rounded-full flex items-center mt-2 sm:mt-0`}>
            <StatusIcon className={`${statusConfig[job.status]?.color} h-4 w-4 mr-1`} />
            <span className={`${statusConfig[job.status]?.color} font-medium text-sm`}>
              {t(job.status)}
            </span>
          </div>
        </div>
        
        {/* Quick Action Buttons for New Jobs */}
        {job.status === 'new' && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <button 
              onClick={() => confirmAction('accept')}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md flex items-center justify-center hover:bg-green-700"
              disabled={isUpdating}
            >
              {isUpdating && actionType === 'accept' ? (
                <Loader className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {t("Accept Job")}
            </button>
            
            <button 
              onClick={() => confirmAction('reject')}
              className="flex-1 py-2 px-4 bg-red-100 text-red-700 rounded-md flex items-center justify-center hover:bg-red-200"
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t("Decline Job")}
            </button>
          </div>
        )}
        
        {/* Job Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Details (Left Column) */}
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">{t("Date & Time")}</p>
                <p className="font-medium text-gray-800">
                  {new Date(job.scheduledAt).toLocaleDateString()} at {new Date(job.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">{t("Duration")}</p>
                <p className="font-medium text-gray-800">{job.duration || "2 hours"}</p>
              </div>
            </div>
            
            {/* Enhanced Location Section with Map */}
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">{t("Location")}</p>
                <p className="font-medium text-gray-800">{job.location}</p>
                <p className="text-sm text-gray-600">{job.locationDetails}</p>
                
                {/* Add Map Component */}
                <JobLocationMap 
                  location={job.location} 
                  distance={proximityData.distance} 
                  travelTime={proximityData.travelTime}
                />
                
                {/* Proximity Score from Algorithm */}
                <ProximityIndicator 
                  score={proximityData.proximityScore} 
                  isGood={proximityData.proximityScore >= 70}
                />
              </div>
            </div>
            
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">{t("Client")}</p>
                <p className="font-medium text-gray-800">{job.clientName}</p>
                <p className="text-sm text-gray-600">{job.clientPhone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Home className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">{t("Property Type")}</p>
                <p className="font-medium text-gray-800">{job.propertyType}</p>
                <p className="text-sm text-gray-600">{job.propertySize} m²</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">{t("Payment")}</p>
                <p className="font-medium text-gray-800">€{job.payment?.amount?.toFixed(2) || "0.00"}</p>
                <p className="text-sm text-gray-600">{job.payment?.status}</p>
              </div>
            </div>
          </div>
          
          {/* Service Details (Right Column) */}
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-800 mb-3">{t("Service Details")}</h3>
              
              {job.instructions && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">{t("Special Instructions")}</p>
                  <p className="text-gray-700">{job.instructions}</p>
                </div>
              )}
              
              {job.tasks && job.tasks.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("Tasks")}</p>
                  <ul className="space-y-2">
                    {job.tasks.map((task, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Additional Requirements */}
            {job.requirements && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  {t("Requirements")}
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start text-blue-700 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Algorithm Matching Information */}
            <div className="bg-teal-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-teal-800 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("Why You Were Matched")}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start text-teal-700 text-sm">
                  <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>This job is within your service area ({proximityData.distance}km)</span>
                </li>
                <li className="flex items-start text-teal-700 text-sm">
                  <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Your schedule is available at this time</span>
                </li>
                <li className="flex items-start text-teal-700 text-sm">
                  <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Your skills match the required service type</span>
                </li>
                <li className="flex items-start text-teal-700 text-sm">
                  <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Your high rating qualifies you for this service</span>
                </li>
              </ul>
            </div>
            
            {/* Contact Client Button */}
            <button className="w-full bg-white border border-teal-500 text-teal-600 rounded-lg py-2 px-4 flex items-center justify-center hover:bg-teal-50">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("Contact Client")}
            </button>
          </div>
        </div>
      </div>
      
      {/* Job Actions */}
      {job.status === 'confirmed' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("Start Job")}</h2>
          <p className="text-gray-600 mb-4">
            {t("Click the button below when you arrive at the location and are ready to start the job.")}
          </p>
          <button
            onClick={() => confirmAction('start')}
            disabled={isUpdating}
            className="bg-teal-600 text-white rounded-lg py-2 px-6 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating && actionType === 'start' ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2 inline" /> {t("Updating...")}
              </>
            ) : (
              t("Start Job")
            )}
          </button>
        </div>
      )}
      
      {job.status === 'in_progress' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("Complete Job")}</h2>
          
          {/* Notes field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Completion Notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              placeholder={t("Add any notes about the completed job...")}
            ></textarea>
          </div>
          
          {/* Photo upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Job Photos (Optional)")}
            </label>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200"
                >
                  <img 
                    src={photo.url} 
                    alt={photo.name} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setPhotos(photos.filter(p => p.id !== photo.id))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    title={t("Remove")}
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors">
                <Camera className="h-6 w-6 text-gray-400" />
                <span className="mt-1 text-xs text-gray-500">{t("Add Photo")}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
              
              {uploadingPhoto && (
                <div className="w-24 h-24 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                  <Loader className="animate-spin h-5 w-5 text-teal-500" />
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => confirmAction('complete')}
            disabled={isUpdating}
            className="bg-green-600 text-white rounded-lg py-2 px-6 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating && actionType === 'complete' ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2 inline" /> {t("Updating...")}
              </>
            ) : (
              t("Mark as Completed")
            )}
          </button>
        </div>
      )}
      
      {/* Job History Timeline */}
      {job.history && job.history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("Job History")}</h2>
          
          <div className="relative border-l-2 border-gray-200 pl-4 ml-2 space-y-6">
            {job.history.map((event, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-teal-500"></div>
                <div>
                  <p className="font-medium text-gray-800">{event.status}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                  {event.notes && (
                    <p className="text-gray-600 mt-1">{event.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {actionType === 'accept' && t("Accept Job")}
              {actionType === 'reject' && t("Decline Job")}
              {actionType === 'start' && t("Start Job")}
              {actionType === 'complete' && t("Complete Job")}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {actionType === 'accept' && t("Are you sure you want to accept this job? You'll be expected to arrive at the scheduled time.")}
              {actionType === 'reject' && t("Are you sure you want to decline this job? This action cannot be undone.")}
              {actionType === 'start' && t("Are you at the location and ready to start the job now?")}
              {actionType === 'complete' && t("Are you sure you want to mark this job as completed?")}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t("Cancel")}
              </button>
              
              <button
                onClick={handleConfirmedAction}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-md ${
                  actionType === 'reject' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                } disabled:opacity-50`}
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    {t("Processing...")}
                  </span>
                ) : (
                  <>
                    {actionType === 'accept' && t("Yes, Accept Job")}
                    {actionType === 'reject' && t("Yes, Decline Job")}
                    {actionType === 'start' && t("Yes, Start Now")}
                    {actionType === 'complete' && t("Yes, Complete Job")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanerJobDetail;
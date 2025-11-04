import React, { useState, useEffect } from "react";
import {
  Star,
  Smile,
  Frown,
  MessageSquare,
  CheckCircle,
  Zap,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronDown,
  X,
  Search,
  Calendar,
} from "lucide-react";
import { cleanerService } from "../../api/api";
import LoadingSpinner from "../common/LoadingSpinner";

const CleanerReviews = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
    commonTags: [],
    improvementAreas: [],
  });
  const [filter, setFilter] = useState("all");
  const [responseText, setResponseText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls
        const reviewsResponse = await cleanerService.getReviews();
        const statsResponse = await cleanerService.getReviewStats();

        // Make sure we're getting an array from the response
        setReviews(reviewsResponse.data?.data || []);
        setStats(
          statsResponse.data?.data || {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: [0, 0, 0, 0, 0],
            commonTags: [],
            improvementAreas: [],
          }
        );
        setError(null);
      } catch (err) {
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = Array.isArray(reviews)
    ? reviews.filter((review) => {
        if (filter === "all") return true;
        if (filter === "positive") return review.rating >= 4;
        if (filter === "negative") return review.rating < 4;
        if (filter === "responded") return !!review.response;
        if (filter === "unresponded") return !review.response;
        return true;
      })
    : [];

  const handleSubmitResponse = async (reviewId) => {
    try {
      if (!responseText.trim()) return;

      await cleanerService.respondToReview(reviewId, responseText);

      // Update local state to reflect the change
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                response: responseText,
                respondedAt: new Date().toISOString(),
              }
            : review
        )
      );

      setResponseText("");
      setReplyingTo(null);
    } catch (err) {
      setError("Failed to post response. Please try again.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Customer Feedback
            </h1>
            <p className="text-gray-600">
              Understand your strengths and areas for improvement
            </p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl mt-4 md:mt-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold ml-1">
                  {stats.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <div className="h-8 border-l border-gray-200"></div>
              <div>
                <span className="text-gray-700">{stats.totalReviews || 0}</span>
                <span className="text-gray-500 ml-1">reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Strengths Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-green-50 p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Your Strengths</h3>
            </div>
          </div>
          <div className="p-4">
            {stats.commonTags && stats.commonTags.length > 0 ? (
              <div className="space-y-3">
                {stats.commonTags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-gray-700">{tag.tag}</span>
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                      {tag.count} reviews
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No strength data available yet
              </div>
            )}
          </div>
        </div>

        {/* Improvement Areas Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-amber-50 p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold">Areas to Improve</h3>
            </div>
          </div>
          <div className="p-4">
            {stats.improvementAreas && stats.improvementAreas.length > 0 ? (
              <div className="space-y-3">
                {stats.improvementAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-gray-700">{area.area}</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-sm">
                      {area.count} mentions
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No improvement areas identified yet
              </div>
            )}
          </div>
        </div>

        {/* Rating Distribution Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Rating Distribution</h3>
          </div>
          <div className="p-4">
            {stats.ratingDistribution &&
            stats.ratingDistribution.some((count) => count > 0) ? (
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((stars, index) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center w-16">
                      <span className="text-gray-700">{stars}</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 ml-1" />
                    </div>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalReviews > 0
                              ? (stats.ratingDistribution[5 - stars] /
                                  stats.totalReviews) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-700 w-8 text-right">
                      {stats.ratingDistribution[5 - stars]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No rating data available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Reviews</h2>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span>Filter</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        filter === "all"
                          ? "bg-teal-50 text-teal-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      All reviews
                    </button>
                    <button
                      onClick={() => {
                        setFilter("positive");
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        filter === "positive"
                          ? "bg-teal-50 text-teal-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      Positive (4-5 stars)
                    </button>
                    <button
                      onClick={() => {
                        setFilter("negative");
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        filter === "negative"
                          ? "bg-teal-50 text-teal-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      Needs improvement (1-3 stars)
                    </button>
                    <button
                      onClick={() => {
                        setFilter("unresponded");
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        filter === "unresponded"
                          ? "bg-teal-50 text-teal-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      Awaiting response
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filter !== "all" ? (
              <>
                <p className="mb-2">No reviews match your current filter</p>
                <button
                  onClick={() => setFilter("all")}
                  className="text-teal-600 hover:text-teal-700"
                >
                  View all reviews
                </button>
              </>
            ) : (
              <p>You haven't received any reviews yet</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 md:p-6">
                <div className="flex gap-4">
                  {/* Customer Profile */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      {review.rating >= 4 ? (
                        <Smile className="w-6 h-6 text-teal-600" />
                      ) : (
                        <Frown className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{review.customerName}</h4>
                        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {review.serviceType || "Cleaning Service"}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {/* Tags & Categories */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {review.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {review.improvementAreas &&
                          review.improvementAreas.map((area, index) => (
                            <span
                              key={`imp-${index}`}
                              className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs"
                            >
                              {area}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Response Section */}
                    {review.response ? (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-teal-600" />
                          <h5 className="font-medium text-sm">Your Response</h5>
                          <span className="text-xs text-gray-500">
                            {new Date(review.respondedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {review.response}
                        </p>
                      </div>
                    ) : (
                      <>
                        {replyingTo === review.id ? (
                          <div className="mt-4">
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Write your response..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                              rows={3}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setResponseText("");
                                }}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitResponse(review.id)}
                                className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                disabled={!responseText.trim()}
                              >
                                Post Response
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-sm mt-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Respond to review
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Trend */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Rating Trend</h3>
          {/* You can add a date range selector here in the future */}
        </div>
        <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
          <p className="mb-2">Performance chart will be available soon</p>
          <p className="text-sm">Track your rating progress over time</p>
        </div>
      </div>
    </div>
  );
};

export default CleanerReviews;

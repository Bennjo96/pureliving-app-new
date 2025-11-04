// src/components/cleaner/ProfileBadge.js
import React from "react";

const ProfileBadge = ({ user, compact, className = "" }) => {
  // Show initials or a default icon if no user data exists
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className={className}>
      {user ? (
        <div
          className={`flex items-center justify-center rounded-full bg-gray-500 ${
            compact ? "w-8 h-8" : "w-12 h-12"
          }`}
        >
          <span className="text-white font-bold">{getInitials(user.name)}</span>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-gray-400 ${
            compact ? "w-8 h-8" : "w-12 h-12"
          }`}
        >
          <span className="text-white font-bold">?</span>
        </div>
      )}
    </div>
  );
};

export default ProfileBadge;

const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Payment = require("../models/Payment");
const bcrypt = require("bcrypt");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user profile",
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new passwords",
      });
    }

    // Find the user with password
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cascade: remove all data owned by or referencing this user
    const conversationIds = await Conversation.find(
      { participants: userId },
      '_id'
    ).lean().then(docs => docs.map(d => d._id));

    await Promise.all([
      Booking.deleteMany({ user: userId }),
      Review.deleteMany({ $or: [{ user: userId }, { cleaner: userId }] }),
      Notification.deleteMany({ recipient: userId }),
      Payment.deleteMany({ user: userId }),
      Message.deleteMany({ sender: userId }),
      Conversation.deleteMany({ participants: userId }),
      // Remove messages in conversations the user participated in
      conversationIds.length
        ? Message.deleteMany({ conversation: { $in: conversationIds } })
        : Promise.resolve()
    ]);

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user account",
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = { user: userId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Find bookings
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("cleaner", "name email rating");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error getting user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user bookings",
    });
  }
};

// Get user settings
exports.getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create settings object with defaults if not set
    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      appearance: {
        theme: user.preferences?.theme || "light",
        fontSize: user.preferences?.fontSize || "medium",
        language: user.preferences?.language || "en",
      },
      notifications: {
        email: user.preferences?.notifications?.email !== false,
        sms: user.preferences?.notifications?.sms !== false,
        app: user.preferences?.notifications?.app !== false,
        marketing: user.preferences?.notifications?.marketing || false,
      },
      privacy: {
        shareProfileData: user.preferences?.privacy?.shareProfileData || false,
        allowLocationAccess:
          user.preferences?.privacy?.allowLocationAccess || false,
      },
    };

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error getting user settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user settings",
    });
  }
};

// Update user settings
exports.updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appearance, notifications, privacy, preferences } = req.body;

    // Use updateOne with $set to avoid triggering validation on unrelated fields
    const updateData = {};

    // If preferences is provided directly (new approach)
    if (preferences) {
      // For each key in preferences, build dot notation paths for nested objects
      const flattenObject = (obj, prefix = "preferences") => {
        let result = {};

        for (const key in obj) {
          if (
            obj[key] &&
            typeof obj[key] === "object" &&
            !Array.isArray(obj[key])
          ) {
            // Recursively flatten nested objects
            const flattenedNested = flattenObject(obj[key], `${prefix}.${key}`);
            result = { ...result, ...flattenedNested };
          } else {
            // Add leaf values with full path
            result[`${prefix}.${key}`] = obj[key];
          }
        }

        return result;
      };

      // Convert nested object to flat dot notation for MongoDB update
      const flattenedPrefs = flattenObject(preferences);
      Object.assign(updateData, flattenedPrefs);
    } else {
      // Handle legacy structure (old approach)
      if (appearance) {
        updateData["preferences.theme"] = appearance.theme || "light";
        updateData["preferences.fontSize"] = appearance.fontSize || "medium";
        updateData["preferences.language"] = appearance.language || "en";
      }

      if (notifications) {
        Object.keys(notifications).forEach((key) => {
          updateData[`preferences.notifications.${key}`] = notifications[key];
        });
      }

      if (privacy) {
        Object.keys(privacy).forEach((key) => {
          updateData[`preferences.privacy.${key}`] = privacy[key];
        });
      }
    }

    // Only try to update if we have data to update
    if (Object.keys(updateData).length > 0) {
      // Use updateOne with $set to avoid triggering validation on unrelated fields
      const result = await User.updateOne(
        { _id: userId },
        { $set: updateData },
        { runValidators: false }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } else {
      // Check if user exists if no updates to make
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    // Fetch the updated user to return current settings
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        appearance: {
          theme: user.preferences?.theme || "light",
          fontSize: user.preferences?.fontSize || "medium",
          language: user.preferences?.language || "en",
        },
        notifications: {
          email: user.preferences?.notifications?.email !== false,
          sms: user.preferences?.notifications?.sms !== false,
          app: user.preferences?.notifications?.app !== false,
          marketing: user.preferences?.notifications?.marketing || false,
        },
        privacy: {
          shareProfileData:
            user.preferences?.privacy?.shareProfileData || false,
          allowLocationAccess:
            user.preferences?.privacy?.allowLocationAccess || false,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user settings",
    });
  }
};

// Get user addresses
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return empty array if no addresses found
    const addresses = user.addresses || [];

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Error getting user addresses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user addresses",
    });
  }
};

// Add user address
exports.addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, postalCode, country, isPrimary } = req.body;

    // Validate input
    if (!street || !city || !state || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: "Please provide all address fields",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }

    // Create new address
    const newAddress = {
      street,
      city,
      state,
      postalCode,
      country,
      isPrimary: isPrimary || false,
    };

    // If the new address is primary, update all other addresses to not be primary
    if (newAddress.isPrimary) {
      user.addresses = user.addresses.map((address) => ({
        ...address,
        isPrimary: false,
      }));
    }

    // Add new address
    user.addresses.push(newAddress);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error adding user address:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding user address",
    });
  }
};

// Update user address
exports.updateUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { street, city, state, postalCode, country, isPrimary } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find address index
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // If the updated address is primary, update all other addresses to not be primary
    if (isPrimary) {
      user.addresses = user.addresses.map((address) => ({
        ...address,
        isPrimary: false,
      }));
    }

    // Update address
    if (street) user.addresses[addressIndex].street = street;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (postalCode) user.addresses[addressIndex].postalCode = postalCode;
    if (country) user.addresses[addressIndex].country = country;
    if (isPrimary !== undefined)
      user.addresses[addressIndex].isPrimary = isPrimary;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: user.addresses[addressIndex],
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user address",
    });
  }
};

// Delete user address
exports.deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out the address to delete
    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    // Check if address was found and deleted
    if (user.addresses.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user address:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user address",
    });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Assuming you have a Notification model or notifications are stored in the user
    // This is a simplified implementation
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return empty array if no notifications
    const notifications = user.notifications || [];

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find notification index
    const notificationIndex = user.notifications.findIndex(
      (n) => n._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Mark as read
    user.notifications[notificationIndex].isRead = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating notification",
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Mark all as read
    if (user.notifications && user.notifications.length > 0) {
      user.notifications = user.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating notifications",
    });
  }
};

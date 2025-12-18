import Employee from '../../models/employees/employeeModel.js'

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id).select(
      "notifications"
    );
    

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Sort by createdAt descending (most recent first)
    const sortedNotifications = employee.notifications.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    console.log(sortedNotifications)

    res.status(200).json({ notifications: sortedNotifications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params; // The notification's unique _id

    // We use the positional operator $ to update the specific item in the array
    const result = await Employee.updateOne(
      { _id: req.user._id, "notifications._id": id },
      { $set: { "notifications.$.isRead": true } }
    );

    if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Notification not found or already read" });
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    // Set isRead to true for all notifications
    const result = await Employee.updateOne(
      { _id: req.user._id },
      { $set: { "notifications.$[].isRead": true } }
    );

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
        return res.status(404).json({ message: "Employee not found or no notifications to update" });
    }

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id).select(
      "notifications"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const unreadCount = employee.notifications.filter(
      (n) => !n.isRead
    ).length;

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
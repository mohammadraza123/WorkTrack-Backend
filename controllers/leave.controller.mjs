import LeaveModel from "../models/leave.model.mjs";

export const handleAddLeave = async (req, res) => {
  try {
    const { reason, startDate, endDate } = req.body;

    if (!reason || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Reason, startDate, and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "endDate cannot be before startDate",
      });
    }

    const userId = req.user?.id;

    const newLeave = new LeaveModel({
      user: userId,
      reason,
      startDate: start,
      endDate: end,
    });

    await newLeave.save();

    return res.status(201).json({
      success: true,
      message: "Leave request submitted",
      data: newLeave,
    });

  } catch (err) {
    console.error("failed to add leave: ", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const handleGetAll = async (req, res) => {
  try {
    const allLeave = await LeaveModel.find();
    
    return res.status(200).json({
      success: true,
      message: "Leave fetched",
      data: allLeave
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}


export const handleGetById = async (req, res) => {
  try {
    const { id } = req.params;

    const leaves = await LeaveModel.find({ user: id }); // <-- FIX

    return res.status(200).json({
      success: true,
      message: "Leaves fetched",
      data: leaves
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
export const handleUpdateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Leave ID is required"
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'"
      });
    }

    const leave = await LeaveModel.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    // ← the pending check is gone, HR can update freely

    leave.status = status;
    await leave.save();

    return res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leave
    });

  } catch (err) {
    console.error("Failed to update leave status:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
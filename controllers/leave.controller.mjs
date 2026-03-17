import LeaveModel from "../models/leave.model.mjs";

export const handleAddLeave = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason required",
      });
    }

    const userId = req.user?.id; 

    const newLeave = new LeaveModel({
      user: userId,
      reason,
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
    const {id} = req.params
    if(!id){
      return res.status(400).json({
        message: "id is required"
      })
    }
    const leave = await LeaveModel.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Leave fetched",
      data: leave
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

export const handleUpdateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;           // leave ID from URL
    const { status } = req.body;         // "approved" or "rejected"

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

    // Optional: only allow update if status is still pending
    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Leave request has already been processed"
      });
    }

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
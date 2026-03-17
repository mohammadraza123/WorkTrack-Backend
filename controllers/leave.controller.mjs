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
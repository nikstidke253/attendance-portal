const db = require('../models');

const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await db.LeaveType.findAll();
    res.json(leaveTypes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createLeaveType = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { name, annualQuota } = req.body;
    
    const existing = await db.LeaveType.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Leave type already exists' });
    }
    
    const leaveType = await db.LeaveType.create({ name, annualQuota });
    res.status(201).json(leaveType);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateLeaveType = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    const { name, annualQuota } = req.body;
    
    const leaveType = await db.LeaveType.findByPk(id);
    
    if (!leaveType) {
      return res.status(404).json({ error: 'Leave type not found' });
    }
    
    await leaveType.update({ name, annualQuota });
    res.json(leaveType);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteLeaveType = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    
    const leaveRequests = await db.LeaveRequest.count({ where: { leaveTypeId: id } });
    if (leaveRequests > 0) {
      return res.status(400).json({ error: 'Cannot delete leave type with existing requests' });
    }
    
    await db.LeaveType.destroy({ where: { id } });
    res.json({ message: 'Leave type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType };
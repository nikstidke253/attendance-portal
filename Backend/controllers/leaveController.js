const db = require('../models');
const { Op } = require('sequelize');

const applyLeave = async (req, res) => {
  try {
    const { leaveTypeId, startDate, endDate, reason } = req.body;
    
    const leaveRequest = await db.LeaveRequest.create({
      userId: req.user.id,
      leaveTypeId,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });
    
    const createdLeave = await db.LeaveRequest.findByPk(leaveRequest.id, {
      include: [{
        model: db.LeaveType,
        attributes: ['name']
      }]
    });
    
    res.status(201).json(createdLeave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await db.LeaveRequest.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: db.LeaveType,
          attributes: ['name', 'annualQuota']
        },
        {
          model: db.User,
          as: 'Actioner',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getPendingLeaves = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const subordinates = await db.User.findAll({
      where: { managerId: req.user.id, isActive: true }
    });
    
    const subordinateIds = subordinates.map(s => s.id);
    
    const pendingLeaves = await db.LeaveRequest.findAll({
      where: {
        userId: { [Op.in]: subordinateIds },
        status: 'pending'
      },
      include: [
        {
          model: db.User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: db.LeaveType,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(pendingLeaves);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const leaves = await db.LeaveRequest.findAll({
      include: [
        {
          model: db.User,
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: db.LeaveType,
          attributes: ['name']
        },
        {
          model: db.User,
          as: 'Actioner',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    
    if (!remark) {
      return res.status(400).json({ error: 'Remark is required' });
    }
    
    const leaveRequest = await db.LeaveRequest.findByPk(id, {
      include: [{ model: db.User }]
    });
    
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    if (leaveRequest.userId === req.user.id) {
      return res.status(403).json({ error: 'Cannot approve your own leave request' });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request already processed' });
    }
    
    if (req.user.role === 'manager') {
      const subordinates = await db.User.findAll({
        where: { managerId: req.user.id }
      });
      const subordinateIds = subordinates.map(s => s.id);
      
      if (!subordinateIds.includes(leaveRequest.userId)) {
        return res.status(403).json({ error: 'Not your subordinate' });
      }
    }
    
    await leaveRequest.update({
      status: 'approved',
      remark,
      actionedById: req.user.id
    });
    
    res.json(leaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    
    if (!remark) {
      return res.status(400).json({ error: 'Remark is required' });
    }
    
    const leaveRequest = await db.LeaveRequest.findByPk(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    if (leaveRequest.userId === req.user.id) {
      return res.status(403).json({ error: 'Cannot reject your own leave request' });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request already processed' });
    }
    
    if (req.user.role === 'manager') {
      const subordinates = await db.User.findAll({
        where: { managerId: req.user.id }
      });
      const subordinateIds = subordinates.map(s => s.id);
      
      if (!subordinateIds.includes(leaveRequest.userId)) {
        return res.status(403).json({ error: 'Not your subordinate' });
      }
    }
    
    await leaveRequest.update({
      status: 'rejected',
      remark,
      actionedById: req.user.id
    });
    
    res.json(leaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave
};
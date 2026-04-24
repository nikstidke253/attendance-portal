const db = require('../models');
const moment = require('moment');

const checkIn = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const now = moment();
    
    const existingAttendance = await db.Attendance.findOne({
      where: {
        userId: req.user.id,
        date: today
      }
    });
    
    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ error: 'Already checked in today' });
    }
    
    let attendance;
    if (existingAttendance) {
      await existingAttendance.update({ checkIn: now.toDate() });
      attendance = existingAttendance;
    } else {
      attendance = await db.Attendance.create({
        userId: req.user.id,
        date: today,
        checkIn: now.toDate()
      });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const checkOut = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const now = moment();
    
    const attendance = await db.Attendance.findOne({
      where: {
        userId: req.user.id,
        date: today
      }
    });
    
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ error: 'Must check in first' });
    }
    
    if (attendance.checkOut) {
      return res.status(400).json({ error: 'Already checked out today' });
    }
    
    const checkInTime = moment(attendance.checkIn);
    const hoursWorked = now.diff(checkInTime, 'hours', true);
    
    await attendance.update({
      checkOut: now.toDate(),
      totalHours: Math.round(hoursWorked * 100) / 100
    });
    
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTodayStatus = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    
    const attendance = await db.Attendance.findOne({
      where: {
        userId: req.user.id,
        date: today
      }
    });
    
    res.json({
      hasCheckedIn: attendance?.checkIn !== null && attendance?.checkIn !== undefined,
      hasCheckedOut: attendance?.checkOut !== null && attendance?.checkOut !== undefined,
      checkIn: attendance?.checkIn,
      checkOut: attendance?.checkOut
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const attendance = await db.Attendance.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getTeamAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const subordinates = await db.User.findAll({
      where: { managerId: req.user.id, isActive: true }
    });
    
    const subordinateIds = subordinates.map(s => s.id);
    
    const attendance = await db.Attendance.findAll({
      where: { userId: subordinateIds },
      include: [{
        model: db.User,
        attributes: ['id', 'username', 'email']
      }],
      order: [['date', 'DESC']]
    });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getTeamAttendance
};
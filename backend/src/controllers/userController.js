import { dataService } from '../services/dataService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await dataService.getUsers();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['MEMBER', 'SENIOR', 'INVENTORY_MANAGER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const updated = await dataService.updateUser(id, { role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await dataService.recordAuditLog({
      user: req.user._id || req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'USER_ROLE_UPDATED',
      entityType: 'USER',
      entityId: String(id),
      details: { newRole: role }
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dataService.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = await dataService.updateUser(id, { status: newStatus });

    await dataService.recordAuditLog({
      user: req.user._id || req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'USER_STATUS_TOGGLED',
      entityType: 'USER',
      entityId: String(id),
      details: { newStatus }
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

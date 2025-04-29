const userService = require('../services/userService');

exports.getCurrentUser = async (req, res) => {
    try {
      const user = await userService.getCurrentUser(req.user.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

exports.updateCurrentUser = async (req, res) => { 
    try {
      const updatedUser = await userService.updateCurrentUser({ ...req.body, userId: req.user.id });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
}
  
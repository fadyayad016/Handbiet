const userService = require('../services/userService');

exports.getCurrentUser = async (req, res) => {
    try {
      const user = await userService.getCurrentUser(req.user.id);
      res.status(200).json({
        message: 'User retrieved successfully',
        data: user, 
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

exports.updateCurrentUser = async (req, res) => { 
    try {
      const updatedUser = await userService.updateCurrentUser({ ...req.body, userId: req.user.id });
      res.status(200).json({
        message: 'User updated successfully',
        data: updatedUser,  
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
}

exports.listAllCooks = async (req, res) => {
  try {
    const cooks = await userService.getAllCooks();
    res.status(200).json({
      message: 'Cooks retrieved successfully',
      data: cooks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCookById = async (req, res) => {
  try {
    const { id } = req.params;
    const cook = await userService.getCookById(id);
    res.status(200).json({
      message: 'Cook retrieved successfully',
      data: cook,
    });
  } catch (error) {
    if (error.message.includes('Invalid cook ID') || error.message.includes('Cook not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};


exports.getFavoriteCooks = async (req, res) => {
  try {
    const customerId = req.user.id; 
    const favoriteCooks = await userService.getFavoriteCooks(customerId);
    res.status(200).json({ message: 'FavoriteCooks retrieved successfully', data: favoriteCooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.addFavoriteCook = async (req, res) => {
  try {
    const customerId = req.user.id;
    const cookId = req.params.cookId;

    const result = await userService.addFavoriteCook(customerId, cookId);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFavoriteCook = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;
    const cookId = req.params.cookId;

    const result = await userService.removeFavoriteCook(customerId, cookId);
    res.status(200).json({ message: 'Cook removed from favorites', ...result });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};



  
const authService = require('../services/authService.js');

exports.register = async (req, res) => {
    try {
        const userData = req.body;
        const result = await authService.registerUser(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const userData = req.body;
        const result = await authService.loginUser(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }


};




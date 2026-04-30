const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, refresh, logout, me, changePassword, deleteAccount } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, me);
router.put('/change-password', auth, changePassword);
router.delete('/account', auth, deleteAccount);

module.exports = router;

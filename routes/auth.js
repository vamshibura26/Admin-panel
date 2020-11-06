const express = require('express');
const authController = require('../controllers/auth');


const router = express.Router();

//User auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotemail', authController.forgotemail);
router.post('/forgototp', authController.forgototp);
router.post('/forotpresend', authController.forotpresend);
router.post('/resetpass', authController.resetpass);
router.post('/Myprofile', authController.Myprofile);

module.exports = router;
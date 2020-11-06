const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

// router.get('/', authController.isLoggedIn, (req, res) => {
//   console.log("inside");
//   res.render('index');
// });

router.get('/', authController.isLoggedIn, (req, res) => {
  console.log("inside");
  console.log(req.user);
  res.render('login', {
    user: req.user
  });
});

router.get('/forgototp', authController.isLoggedIn, (req, res) => {
  if(req.user) {
    res.render('forgototp', {
      user: req.user
    });
  } else {
    res.redirect("/forgotemail");
  }
});
router.get('/resetpass', authController.isLoggedIn, (req, res) => {
  if(req.user) {
    res.render('resetpass', {
      user: req.user
    });
  } else {
    res.redirect("/forgotemail");
  }
});
router.get('/Home', authController.isLoggedIn, (req, res) => {
  if(req.user) {
    res.render('Home', {
      user: req.user
    });
  } else {
    res.redirect("/login");
  }
});
router.get('/Myprofile', authController.isLoggedIn, (req, res) => {
  if(req.user) {
    res.render('Myprofile', {
      user: req.user
    });
  } else {
    res.redirect("/login");
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});
router.get('/register', (req, res) => {
  res.render('register');
});
router.get('/forgotemail', (req, res) => {
  res.render('forgotemail');
});
router.get('/logout',authController.logout,(req,res)=>{
  res.redirect('/login');
})

module.exports = router;

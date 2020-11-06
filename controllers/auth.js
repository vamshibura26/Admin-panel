const jwt = require('jsonwebtoken');
const db = require('../model/db');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');
var otpGenerator = require('otp-generator');
var global1 = {};
var global2 = {};


exports.register = (req, res) => {
  var  otp =  otpGenerator.generate(10, {upperCase: false, specialChars: false, alphabets: false})
  var otpe = 'AD'+''+otp
  console.log(req.body);
  const { firstname, lastname, email, password, passwordConfirm } = req.body;
  // 2) Check if user exists && password is correct
  db.start.query('SELECT Admin_email FROM Admin_table WHERE Admin_email = ?', [email], async (error, results) => {
    if(error) {
      console.log(error)
    }
    if(results.length > 0 ) {
      return res.render('register', {
                message: 'That Email has been taken'
              });
    } else if(password !== passwordConfirm) {
      return res.render('register', {
        message: 'Passwords do not match'
      });
    }
      
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);

      
    db.start.query('INSERT INTO Admin_table SET ?', { Admin_Id: otpe, First_name: firstname, Last_name: lastname, Admin_email: email, Admin_pwd: hashedPassword }, (error, result) => {
      if(error) {
        console.log(error)
      } 
          res.status(201).render('login')
        });
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.status(400).render("login", {
      message: 'Please provide email and password'
    });
  }
  // 2) Check if user exists && password is correct
  db.start.query('SELECT * FROM Admin_table WHERE Admin_email = ?', [email], async (error, results) => {
    if(error){
      console.log(error)
    }
    console.log(results);
    console.log(password);
    /*if(results[0].userEmail == 'null'){
      return res.status(401).render("login", {
        message: 'Email do not exist'
      });
    }*/
    const isMatch = await bcrypt.compare(password, results[0].Admin_pwd);
    console.log(isMatch);
    if(!results || !isMatch ) {
      return res.status(401).render("login", {
        message: 'Incorrect email or password'
      });
    } else {
      // 3) If everything ok, send token to client
          global1.id = results[0].Admin_Id;
          function Lid() {
              console.log(global1.id);
          }
          Lid();
      const id = results[0].Admin_Id;
      console.log(id)
      const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
      res.cookie('jwt', token, cookieOptions );
  }
  res.status(200).render('Home')
  });
};
exports.forgotemail =(req, res) =>{
  var  otp =  otpGenerator.generate(4, {upperCase: false, specialChars: false, alphabets: false})
  const { email } = req.body;
  db.start.query('SELECT * FROM Admin_table WHERE Admin_email = ?', [email], async (error, results) => {
    if(error) {
      console.log(error)
    }
    if(results.length > 0 ) {
      db.start.query('UPDATE Admin_table SET otp = ? WHERE Admin_Id = ?', [ otp, results[0].Admin_Id], (error, result) =>{
        if(error){
          console.log(error);
        }
      })
      global2.id = results[0].Admin_Id;
          function Lid() {
              console.log(global2.id);
          }
          Lid();
      const id = results[0].Admin_Id;
      console.log(id)
      const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
      res.cookie('jwt', token, cookieOptions);
      res.render('forgototp');
    } else {
      return res.render('login', {
           message: 'Email do not matched'
       });
    }
})
}

exports.forotpresend = (req, res) =>{
  var  otp =  otpGenerator.generate(4, {upperCase: false, specialChars: false, alphabets: false})
  db.start.query('UPDATE Admin_table SET otp = ? WHERE Admin_Id = ?', [ otp, global2.id ], (error, result) =>{
    if(error){
      console.log(error)
    }
    res.render('forgototp');
  })
}

exports.forgototp = (req, res) =>{
  const { otp } = req.body;
  db.start.query('SELECT otp FROM Admin_table WHERE Admin_Id = ?', [global2.id], (error, result) =>{
    if(error){
      console.log(error)
    }
    if(otp != result[0].otp){
     return res.render('forgototp', {
       message: 'OTP do not matched'
     }) 
    } else {
      res.render('resetpass');
    }
  })
}
exports.resetpass =(req, res) =>{
  const { password, confirmpassword } = req.body;
  if(password == confirmpassword){
    db.start.query('SELECT * FROM Admin_table WHERE Admin_Id = ?', [global2.id], async (error, results) => {
      if(error){
        console.log(error)
      }
      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);
      db.start.query('UPDATE Admin_table SET Admin_pwd = ? WHERE Admin_Id = ?', [hashedPassword, global2.id ], (error, result) =>{
        if(error){
          console.log(error)
        }
        res.redirect('/login')
      })
    })
  }
}

exports.Myprofile = (req, res) =>{
  const { name, email } = req.body;
  db.start.query('UPDATE Admin_table SET First_name = ?, Admin_email = ? WHERE Admin_Id = ?', [ name, email, global1.id ], (error, result) =>{
    if(error){
      console.log(error)
    }
    res.status(200).redirect('/Myprofile');
    })
}

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      console.log("decoded");
      console.log(decoded);
 
      // 2) Check if user still exists
      db.start.query('SELECT * FROM Admin_table WHERE Admin_Id = ?', [decoded.id], (error, result) => {
        console.log(result)
        if(!result) {
          return next();
        }
        // THERE IS A LOGGED IN USER
        req.user = result[0];
        // res.locals.user = result[0];
        console.log("next")
        return next();
      });
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};







exports.logout = (req, res) => {
  res.clearCookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).redirect("/login");
};
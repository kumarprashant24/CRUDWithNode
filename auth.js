const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const Register = require('./register');
const mongoose = require('mongoose');

const auth= async(req,res,next)=>{
    try {

        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        const verifyUserId =  verifyUser._id;  
        const user = await Register.findOne({_id:verifyUser._id});
      
       req.token = token;
       req.user=user;
          next();
        
        
    } catch (error) {
        res.render('login');
    }
}

module.exports = auth;
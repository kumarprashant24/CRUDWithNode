require('dotenv').config();
const express = require('express');
const path = require('path')
const app = express();
const hbs = require('hbs');
const Fmongoose = require('mongoose');
const alert = require('alert')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const auth = require('./auth');
require("./conn");
const reg = require('./register');
const jwt = require('jsonwebtoken')
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))

app.set('views', path.join(__dirname,'/templates/views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '/templates/partials'))


app.get('/', (req, res) => {

    res.render("index");
   
});


app.get('/register', (req, res) => {
    
    res.render("register");
  

    

});
app.post('/register', async (req, res) => {
    try {
        const emailCheck = await reg.findOne({ email: req.body.email });
        const pass = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const passwordHashing = await bcrypt.hash(pass, salt);
        // console.log(passwordHashing)

        if (emailCheck == null) {
            const regUser = new reg({

                fullname: req.body.name,
                email: req.body.email,
                password: passwordHashing,
                course: req.body.course,
                address: req.body.address
            })
            // creating token before saving the document
            const token = await regUser.generateAuthToken();

            // storing the value of token in cookie
            res.cookie("jwt", token);


            await regUser.save().then((result) => {
                alert('data saved successfully')


            }).catch(err => alert(err));
        }
        else {
            alert('Oops!!! Email Already Exists');
        }



    } catch (error) {
        alert('Technical error')
    }

    res.render("register");

});
app.get('/allrecord', auth, async (req, res) => {
    // console.log(req.cookies.jwt);

    const record = await reg.find();
    console.log(record)

    res.render('allrecord', { record });

});

app.get('/update/:id',auth, async (req, res) => {

    const id = mongoose.Types.ObjectId(req.params['id']);

    const record = await reg.findById(id);
    res.render('update', { record })
})
app.post('/update/:id', async (req, res) => {


    const id = mongoose.Types.ObjectId(req.params['id']);

    // const record = await reg.findById(id);
    const salt = await bcrypt.genSalt(10);
    const passwordHashing = await bcrypt.hash(req.body.uppassword, salt);
    console.log(passwordHashing);

    const record = await reg.updateOne({ _id: id }, {
        $set: {

            fullname: req.body.upfullname,
            email: req.body.upemail,
            password: passwordHashing,
            course: req.body.upcourse,
            address: req.body.upaddress
        }
    });
    alert('data updated successfully')
    res.render('index')
})

app.get('/delete/:id',auth, async (req, res) => {
    const delid = mongoose.Types.ObjectId(req.params['id']);
    const strDelId = delid.toString();
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token,process.env.SECRET_KEY);

    if(strDelId===verifyUser._id){
     res.clearCookie("jwt");
    const id = mongoose.Types.ObjectId(req.params['id']);
    // const record = await reg.findById(id);
    const record = await reg.deleteOne({ _id: id });

    alert('data deleted successfully');
    res.render('index')
    }
    else{
      
    const id = mongoose.Types.ObjectId(req.params['id']);
    // const record = await reg.findById(id);
    const record = await reg.deleteOne({ _id: id });

    alert('data deleted successfully');
    res.render('index')
    }
    // res.clearCookie("jwt");
    // const id = mongoose.Types.ObjectId(req.params['id']);
    // // const record = await reg.findById(id);
    // const record = await reg.deleteOne({ _id: id });

    // alert('data deleted successfully');
    // res.render('index')

})
app.get('/login', auth, async (req, res) => {

    const user = req.user;

    // res.render('login')
    //    const data = await reg.findOne({email:req.body.logEmail});
    // console.log(res.verifyUser);
    res.render('profile', { user });

})
app.post('/login', async (req, res) => {

    const emailCheck = await reg.findOne({ email: req.body.logEmail });
    // console.log(req.body.logEmail);
    if (!emailCheck) {
        alert('Invalid Email Address');
    }
    else {
        const validPassword = await bcrypt.compare(req.body.logPassword, emailCheck.password)
        if (validPassword) {
            const token = await emailCheck.generateAuthToken();
            res.cookie("jwt", token);

            res.render('index')
        }
        else {
            alert('InCorrect password');
            res.render('login')
        }

    }


});

app.get('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((element) => {
            return element.token !== req.token;
        })
        res.clearCookie("jwt");
        await req.user.save();
        res.render('login')

    } catch (error) {
        res.status(500).send(error)
    }

});

app.listen(3000, () => {
    console.log("app is listening on 3000 port")
})
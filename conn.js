const mongoose =  require('mongoose')
const db = "mongodb+srv://prashant24:Prince24@cluster0.2pd6v.mongodb.net/db1?retryWrites=true&w=majority";
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('connected...')).catch((err) => console.log(err));
var express     = require('express');
var app         = express();
var port        = process.env.PORT || 8080;
var morgan      = require('morgan');
var mongoose    = require('mongoose'); mongoose.set('useCreateIndex', true);
var bodyParser  = require('body-parser');
var router      = express.Router();
var appRoutes   = require('./app/routes/api')(router);
var path        = require('path');
var passport    = require('passport');
var social      = require('./app/passport/passport')(app,passport);
 

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api',appRoutes);


mongoose.connect('mongodb://localhost:27017/tutorial',{ useNewUrlParser: true },function(err){
    if(err){
        console.log("Not connected to database"+ err);
    }else{
        console.log("Successfully connected to MongoDB");
    }
    
}); 

app.get('*',function(req,res){
   res.sendFile(path.join(__dirname + '/public/app/view/index.html'));
});

app.listen(port,function(){
   console.log("Running the server "+ port); 
});



var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
//var sgTransport = require('nodemailer-smtp-transport');

module.exports = function (router) {
    
    var options = {
      auth: {
      
            api_user: 'mubashar391',
            api_key: 'Mubashar!1'
          //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
      }
    }
    var client = nodemailer.createTransport(sgTransport(options));
    
    // User Register Route
    router.post('/users', function (req, res) {
        var user = new User();
        user.name     = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.temporarytoken = jwt.sign({ username: user.username,email: user.email }, secret, { expiresIn: '24h'});

        if (req.body.name == null || req.body.name == '' || req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '') {
            res.json({
                success: false,
                message: 'Ensure that name, usernama, password email were provided'
            });
        } else {
            user.save(function (err) {
                if (err) {
                    if (err.errors != null){
                        if (err.errors.name){
                             res.json({success: false, message: err.errors.name.message});

                        }else if (err.errors.email){
                            res.json({success: false, message: err.errors.email.message});
                        }
                        else if (err.errors.username){
                            res.json({success: false, message: err.errors.username.message});
                        }
                         else if (err.errors.password){
                            res.json({success: false, message: err.errors.password.message});
                        }else{
                            res.json({success: false, message: err});
                        }   
                    }else if (err){
                       if (err.code == 11000){
                           if(err.errmsg[61] == 'u'){
                                res.json({success: false, message: 'That Username is already taken' });
                           }else if(err.errmsg[61] == 'e'){
                                res.json({success: false, message: 'That Email is already taken' });
                           }
                          
                       }else{
                           res.json({success: false, message: err});
                       }   
                    }
                }else {
                        var email = {
                          from: 'Localhost Staff, staff@localhost.com',
                          to: user.email,
                          subject: 'Local host Actication Link',
                          text: 'Hello'+ user.name +' Thankyou for registering at localhost.com please click on the following link to complete your activation ',
                          html: 'Hello <strong>'+ user.name +'</strong>,<br><br> Thankyou for registering at localhost.com please click on the link below to complete your activation :<br><br> <a href="https://meanstackapplicaion.herokuapp.com/activate/'+user.temporarytoken+ '">https://meanstackapplicaion.herokuapp.com/activate/</a>'
                        };
                        client.sendMail(email, function(err, info){
                            if (err){
                              console.log(err);
                            }
                            else {
                                 console.log('Message sent: ' + info.response);
                            }
                        });
                    
                          res.json({
                                    success: true,
                                    message: 'Account registered Please check your email for activation link'
                    });
                }
            });
        }
    });
       router.post('/checkusername', function (req, res) {
        
        User.findOne({ username: req.body.username }).select('username').exec(function (err, user) {
                if (err) throw err;
            if (user){
                res.json({success:false , message: "That username is already taken"});
            }else{
                res.json({ success: true , message: 'Valid Username'});
            }
             
            });
    });
    
    router.post('/checkemail', function (req, res) {
        
        User.findOne({ email: req.body.email }).select('email').exec(function (err, user) {
                if (err) throw err;
            if (user){
                res.json({success:false , message: "That e-mail is already taken"});
            }else{
                res.json({ success: true , message: 'Valid E-mail'});
            }
             
            });
    });
    

    //User Login Route

    router.post('/authenticate', function (req, res) {

        User.findOne({ username: req.body.username }).select('email username password active').exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'Could not Authenticate User'});
            } else if (user) {

                if (!req.body.password) {
                    res.json({ success: false, message: 'No password provided'}); // Password was not provided
                } else {
                    var validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({ success: false, message: 'could not authenticate Password' });
                    } else if (!user.active) {
                        res.json({ success: false, message: 'Account is not yet activated please check your e-mail for activation of link.',expired:true});

                    } else {
                        var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24s'});
                        res.json({ success: true, message: 'User Authenticate!', token: token});

                    }

                }


            }
        });
    });
    
    router.put('/activate/:token',function(req,res){
       
        User.findOne({temporarytoken: req.params.token},function(err,user){
            if (err) throw err;
            var token = req.params.token;
            
              jwt.verify (token , secret, function(err, decoded){
                if(err){    
                 res.json({success: false, message: 'Activation link has expired'});
                }else if(!user){
                  res.json({success: false, message: 'Activation link has expired'});
                }else{
                    
                    user.temparytoken = false;
                    user.active       = true;
                    
                    user.save(function(err){
                       if (err){
                           console.log(err);
                       }else{
                           
                             var email = {
                          from: 'Localhost Staff, staff@localhost.com',
                          to: user.email,
                          subject: 'Local host Account Activated ',
                          text: 'Hello'+ user.name +'Your account has been successfully activated!.',
                          html: 'Hello <strong>'+ user.name +'</strong>,<br><br> Your account has been successfully activated!. '
                        };

                        client.sendMail(email, function(err, info){
                            if (err ){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                               
                                
                                
                            }
                        });
                           
                         res.json({success: true, message: 'Account Activated!'});   
                        
                       } 
                    });
                    
                   
                }
            });
            
        })
    });
 
    router.post('/resend', function (req, res) {

        User.findOne({ username: req.body.username }).select('username password active ').exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'Could not Authenticate User'});
            } else if (user) {

                if (!req.body.password) {
                    res.json({ success: false, message: 'No password provided'}); // Password was not provided
                } else {
                    var validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({ success: false, message: 'could not authenticate Password' });
                    } else if (user.active) {
                        res.json({ success: false, message: 'Account is already activated'});

                    } else {
                    
                        res.json({success: true ,user:user});

                    }

                }


            }
        });
    });
    
    router.put('/resend',function(req, res){
        User.findOne({ username: req.body.username }).select('username active email temporarytoken').exec(function (err, user) {
            if(err) throw err;
            user.temporarytoken = jwt.sign({ username: user.username,email: user.email }, secret, { expiresIn: '24h'});
            user.save(function(err){
               if (err){
                   console.log(err);
               }else{
                   
                         var email = {
                          from: 'Localhost Staff, staff@localhost.com',
                          to: user.email,
                          subject: 'Local host Actication Link Request',
                          text: 'Hello'+user.username+'you recently request a new activation link. please click on the following link to complete your activation ',
                          html: 'Hello <strong>'+user.username+'</strong>,<br><br>you recently request a new activation link. please click on the link below to complete your activation :<br><br> <a href="https://meanstackapplicaion.herokuapp.com/activate/'+user.temporarytoken+ '">https://meanstackapplicaion.herokuapp.com/activate/</a>'
                        };
                        client.sendMail(email, function(err, info){
                            if (err){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                               
                            }
                        });
                   
                   res.json({success: true , message: "Activation link has been sent to "+user.email +' !'});
                   
               }
            });
        })
    });
    
    router.get('/resetusername/:email',function(req,res){
        User.findOne({ email: req.params.email }).select('username name email').exec(function (err, user) {
          if (err){
              res.json({success: false, message: err});
          }else{
              if (!req.params.email){
                  res.json({success: false, message:'no e-mail was provided'});
              }else{
                  if(!user){
                  res.json({success:false, message: 'E-mail was not found'});
              }else{
                  
                  var email = {
                          from: 'Localhost Staff, staff@localhost.com',
                          to: user.email,
                          subject: 'Local host Username Request',
                          text: 'Hello'+user.username+'you recently request a username please save in your files'+user.username,
                          html: 'Hello <strong>'+user.username+'</strong>,<br><br>you recently request a username please save in your files:- '+user.username
                        };
                        client.sendMail(email, function(err, info){
                            if (err){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                            }
                        });
                  
                  
                  
                  
                  res.json({success: true , message: 'Username has been sent to E-mail'});
              }    
            }  
          } 
       }); 
    });
    
    router.put('/resetpassword',function(req,res){
        User.findOne({username: req.body.username}).select('username email resettoken name active').exec(function(err, user){
            if(err) throw err;
            if(!user){
                res.json({success: false , message: 'Username was not found'});
            }else if (!user.active){
                res.json({success: false , message: 'Account has not yet Activated'});
            }else{
                user.resettoken = jwt.sign({ username: user.username,email: user.email }, secret, { expiresIn: '24h'});
                user.save(function(err){
                   if(err){
                       res.json({success: false, message: err});
                   }else{
                       var email = {
                          from: 'Localhost Staff, staff@localhost.com',
                          to: user.email,
                          subject: 'Local host Reset password Request',
                          text: 'Hello'+user.username+'you recently request a password reset link',
                          html: 'Hello <strong>'+user.username+'</strong>,<br><br>you recently request reset password <a href="http://localhost:8080/reset/'+user.resettoken+'">http://localhost:8080/reset/</a>'
                        };
                        client.sendMail(email, function(err, info){
                            if (err){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                               
                            }
                        });
                       
                       res.json({success: true, message :"please check your e-mail for reset password"});
                   } 
                });
            }
        })
    });
    
    router.get('/resetpassword/:token',function(req,res){
       
        User.findOne({resettoken: req.params.token}).select('resettoken username email ').exec(function(err, user){
            if (err) throw err;
            var token = req.params.token;
            
             jwt.verify (token , secret, function(err, decoded){
                if(err){    
                 res.json({success: false, message: 'Password link has expired'});
                }else{
                    if(!user){
                        res.json({ success: false , message:"password link has expired"});
                    }else{
                        res.json({ success: true , user:user});   
                    }
                    
                }
            });
            
        });
    });

    router.put('/savepassword',function(req,res){
    
        User.findOne({username: req.body.username}).select('username email name password resettoken ').exec(function(err, user){
            
           if(err) throw err;
            
            if(req.body.password == null || req.body.password == ''){  
                
                  res.json({ success: false, message:"password not provided"});
            }else{
                
                         user.password = req.body.password;
                         user.resettoken = false;
                         user.save(function(err){
                       if(err){
                           res.json({ success: false, message: err});

                       }else{

                               var email = {
                                      from: 'Localhost Staff, staff@localhost.com',
                                      to: user.email,
                                      subject: 'Local host Reset password',
                                      text: 'Hello'+user.username+'This e-mail is notify you ypur password has been reset at localhost',
                                      html: 'Hello <strong>'+user.username+'</strong>,<br><br>This e-mail is notify you your password has been reset at localhost'
                                    };
                                    client.sendMail(email, function(err, info){
                                        if (err){
                                          console.log(err);
                                        }
                                        else {
                                          console.log('Message sent: ' + info.response);
                                           
                                        }
                                    });
                           
                        res.json({ success: true, message:"password has been Reset"});  
               } 
            });
                
                
        }
            
          
        });
    });
   
    
    
    
    router.use(function(req, res, next){
    
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token){
            //  verify token
            jwt.verify (token , secret, function(err, decoded){
                if(err){    
                 res.json({success: false, message: 'Token invalid'});
                }else{
                    req.decoded = decoded;
                    next();
                }
            });
        }else{
            
          res.json({success:false , message : 'No token Provided'});
            
        }
        
    });
    
    router.post('/me',function(req,res){
       res.send(req.decoded);
    });
    
    router.get('/currentUser',function(req ,res){
    User.findOne({username:req.decoded.username}).select('name username email permission').exec(function(err, user){
         if (err) throw err;
           if(!user){
               res.json({success: false , message: "No User was found"});
           }else{
          console.log("user");
            res.json({success: true , user:user}); 
        }
        
        
    });
        
    });
    
    router.get('/renewToken/:username',function(req,res){
       User.findOne({username: req.params.username}).select().exec(function(err , user){
           if (err) throw err;
           if(!user){
               res.json({success: false , message: "No User was found"});
           }else{
            var newtoken = jwt.sign({ username: user.username,email: user.email }, secret, { expiresIn: '24h'});
               
               res.json({success: true , token: newtoken});
               
           }
       });
        
    });
    
    router.get('/permission',function(req,res){
        User.findOne({username: req.decoded.username},function(err, user){
            if(err) throw err;
            if(!user){
                res.json({success: false, message:'No user was found'});
            }else{
                res.json({success: true , permission: user.permission});
            }
        });
    });
    
    router.get('/management',function(req , res){
        User.find({},function(err, users){
            if(err) throw err;
            User.findOne({username: req.decoded.username},function(err,mainUser){
               if(err) throw err;
                if(!mainUser){
                    res.json({success: false, message: 'No user found'});
                }else{
                  
                    if(mainUser.permission  === 'admin' || mainUser.permission === 'moderator'){
                        if(!users){
                            res.json({success: false, message: 'No user found'});
                        }else{
                            
                            res.json({success: true,users: users, permission: mainUser.permission });
                        }
                        
                    }else{
                        res.json({success: false, message: 'Insufficent Permission'});
                    }
                }
            });   
        });
    });
    
    router.delete('/management/:username',function(req,res){
       
        var deleteUser = req.params.username;
        User.findOne({username: req.decoded.username},function(err , mainUser){
           if(err) throw err;
            
            if(!mainUser){
                res.json({success: false , message: 'No user found'});
            }else{
                if(mainUser.permission !== 'admin'){
                    res.json({success: false, message: 'Insufficient permissions'});
                }else{
                    User.findOneAndRemove({username:deleteUser },function(err, user){
                       
                        if(err) throw err;
                        res.json({success: true, message: 'User Deleted Successfully'});
                    });
                }
            }
        });
        
    });

    
    router.get('/edit/:id',function(req,res){
        var editUser = req.params.id;
        User.findOne({username: req.decoded.username},function(err, mainUser){
            
            if(err)throw err;
            if(!mainUser){
                res.json({success: false, message: 'No user found'});
            }else{
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    User.findOne({_id: editUser},function(err , user){
                        if(err) throw err;
                        if(!user){
                            res.json({success: false , messgae: "No user found"});
                        }else{
                            res.json({success: true , user:user});
                        }
                    });
                }else{
                    res.json({success:false , message: "Insufficient Permission" });
                }
            }    
            
        });
    });
    
    router.put('/edit',function(req, res){
      
        var editUser = req.body._id;
        if(req.body.name) var newName = req.body.name;
        if(req.body.username) var newUsername = req.body.username;
        if(req.body.email) var newEmail = req.body.email;
        if(req.body.permission) var newPermission = req.body.permission;
        User.findOne({username: req.decoded.username},function(err ,mainUser){
           if(err) throw err;
            if(!mainUser){
                res.json({success: false, message: "No user found"});
            }else{
                if(newName){
                   
                    if(mainUser.permission ===  'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser },function(err, user){
                            if(err) throw err;
                            
                            if(!user){
                                res.json({success: false, message: 'No  user found'});
                            }else{
                                user.name = newName;
                                user.save(function(err){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.json({success: true , message: 'Name has been Updated '});
                                    }
                                });
                            }
                        });
                    }else{
                        res.json({success: false , message: "Insufficient Permission" });
                    }
                }
                if(newUsername){
                    
                     if(mainUser.permission ===  'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser },function(err, user){
                            if(err) throw err;
                            
                            if(!user){
                                res.json({success: false, message: 'No user found'});
                            }else{
                                user.username = newUsername;
                                user.save(function(err){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.json({success: true , message: 'Username has been Updated '});
                                    }
                                });
                            }
                        });
                    }else{
                        res.json({success: false , message: "Insufficient Permission" });
                    }   
                }
                if(newEmail){
                     if(mainUser.permission ===  'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser },function(err, user){
                            if(err) throw err;
                            
                            if(!user){
                                res.json({success: false, message: 'No email user found'});
                            }else{
                                user.email = newEmail;
                                user.save(function(err){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.json({success: true , message: 'E-mail has been Updated '});
                                    }
                                });
                            }
                        });
                    }else{
                        res.json({success: false , message: "Insufficient Permission" });
                    }   
                }
                
                if(newPermission){
                     if(mainUser.permission ===  'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser },function(err, user){
                            if(err) throw err;
                            
                            if(!user){
                                res.json({success: false, message: 'No user found'});
                            }else{
                               
                                if(newPermission === 'user'){
                                    if(user.permission === 'admin'){
                                        if(mainUser.permission !== 'admin'){
                                                res.json({success: false , message: "Insufficient permission you must be an admin to downgrate an other admin"});
                                        }else{
                                            user.permission = newPermission;
                                             user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true , message: 'Permission  has been Updated '});
                                                }
                                             });
                                        }
                                        
                                    }else{
                                        
                                         user.permission = newPermission;
                                             user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true , message: 'Permission  has been Updated '});
                                                }
                                             });
                                    }
                                    
                                }
                                
                                if(newPermission === 'moderator'){
                                    if(user.permission === 'admin'){
                                        if(mainUser.permission !== 'admin'){
                                            res.json({success: false , message: "Insufficient permission you must be an admin to downgrate an other admin" });
                                        }else{
                                             user.permission = newPermission;
                                             user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true , message: 'Permission  has been Updated '});
                                                }
                                             });
                                            
                                        }
                                    }else{
                                         user.permission = newPermission;
                                         user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true , message: 'Permission  has been Updated '});
                                                }
                                        });
                                    }
                                }
                                if(newPermission === 'admin'){
                                    if(mainUser.permission === 'admin'){
                                         user.permission = newPermission;
                                             user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true , message: 'Permission  has been Updated '});
                                                }
                                             });
                                        
                                        
                                    }else{
                                        res.json({success: false , message: 'Insufficient permission you must be an admin to upgrate someone to admin level' })
                                    }
                                }
                            }
                        });
                    }else{
                        res.json({success: false , message: "Insufficient Permission" });
                    }   
                }
               
                
            }
            
        });
        
    });
    
    return router;
};

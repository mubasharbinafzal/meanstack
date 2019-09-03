var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
var bcrypt      = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator')

var nameValidator = [
    validate({
      validator: 'matches',
      arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
      message:'Name must be at least 3 characters, max 30, no special characters or numbers must have space between name'
    }),
     validate({
      validator: 'isLength',
      arguments: [3,20],
      message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

var emailValidator = [
    validate({
      validator: 'isEmail',
      message:'Is not a valid e-mail'
    }),
    validate({
      validator: 'isLength',
      arguments: [3,35],
      message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

var usernameValidator = [
   validate({
      validator: 'isLength',
      arguments: [3,25],
      message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
       validator: 'isAlphanumeric',
      message: 'Username must Contain letter and Numbers'
    })
];

var passwordValidator = [
    validate({
      validator: 'matches',
      arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
      message:'password need to have at least one lowercase, one uppercase, one number, one special character and must be at least 8 character but no more 35 character'
    }),
     validate({
      validator: 'isLength',
      arguments: [8,35],
      message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

var UserSchema = new Schema({
    name:     {type:String, requried: true ,validate: nameValidator},
    username: {type: String, lowercase: true, required:true, unique: true,
               validate:usernameValidator},
    password: {type: String, required: true, validate:passwordValidator , select:false },
    email:    {type: String, required: true, lowercase: true, unique: true,validate: emailValidator},
    active:   {type:Boolean, require:true, default: false},
    temporarytoken:{type: String, require:true },
    resettoken :{type:String, require: false},
    permission: {type: String, required: true, default: 'user'}
});

UserSchema.pre('save',function(next){
   var user =this;
    
    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password, null, null, function(err, hash){
        if(err){
            return next(err);
        }else{
              user.password = hash;
              next();
        }
    });
});

UserSchema.plugin(titlize, {
  paths: ['name'], // Array of paths first and last name of name is uppercase
  trim: true
});

UserSchema.methods.comparePassword = function(password){
   
    return bcrypt.compareSync(password,this.password);
}

module.exports = mongoose.model('User',UserSchema);





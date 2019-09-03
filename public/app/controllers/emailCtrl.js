angular.module('emailController', ['userServices']) 
.controller('emailCtrl', function($routeParams, User,$timeout ,$location ) {
    app =this;
    User.activeAccount($routeParams.token).then(function(data){
        app.successMsg = false;
        app.errorMsg   = false;
       if (data.data.success){
           app.successMsg = data.data.message+'.... Redirecting';
           $timeout(function(){
               $location.path('/login');
           },2000);
       }else{
           app.errorMsg   = data.data.message; 
       }
    });
})
.controller('resendCtrl',function(User){
    app = this;
    app.disabled  = false;
    app.errorMsg = false;
    app.successMsg = false;
    app.checkCredentials = function(loginData){
        User.checkCredentials(app.loginData).then(function(data){
            if(data.data.success){
                User.resendlink(app.loginData).then(function(data){
                    if (data.data.success){
                         app.disabled  = true;
                         app.errorMsg = false;
                        app.successMsg = data.data.message;
                        
                    }
                });
                
            }else{
                 app.disabled  = false;
                app.errorMsg = data.data.message;
            }
        })
    };
    
})

.controller('usernameCtrl',function(User){
    app = this;
    app.errorMsg = false;
    app.successMsg = false;

    
    app.sendUsername = function(userData, valid){
            app.loading = true;
            app.disabled = true;
        if (valid){
            User.sendUsername(app.userData.email).then(function(data){
                app.loading = false;
                if (data.data.success){
                    app.successMsg = data.data.message;
                     app.errorMsg = false;
                }else{
                    app.disabled = false;
                    app.errorMsg   = data.data.message;
                }
        });
        }else{
            app.disabled = false;
            app.loading = false;
            app.errorMsg= "Please enter a valid e-mail";
        }
        
    };
})
.controller('passwordCtrl',function(User){
    
    app = this;
    app.errorMsg = false;
    app.successMsg = false;

    app.sendPassword = function(resetData, valid){
            app.loading = true;
            app.disabled = true;
        
        if (valid){
            
            User.sendPassword(app.resetData).then(function(data){
                app.loading = false;
                if (data.data.success){
                    app.successMsg = data.data.message;
                     app.errorMsg = false;
                }else{
                    app.disabled = false;
                    app.errorMsg   = data.data.message;
            }
        });
        }else{
            app.disabled = false;
            app.loading = false;
            app.errorMsg= "Please enter a valid Username";
        }
        
    };
        
})

.controller('resetCtrl',function(User, $routeParams, $scope, $timeout, $location){
    
    app= this;
    app.hide = true;
    
    
    User.resetUser($routeParams.token).then(function(data){
            app.loading = true;
        if(data.data.success){    
                
                app.loading = false;
                app.hide = false;
                $scope.alert = 'alert alert-success';
                app.successMsg = "Please Enter new password ";
                $scope.username = data.data.user.username;
            
                
            }else{
                app.loading = false;
                app.hide = true;
                $scope.alert = 'alert alert-danger';
                app.errorMsg  = data.data.message;
            }
    });
    
    app.savePassword = function(regData, valid, confirmed){
        
        app.errorMsg = false;
        app.disabled = true;
        app.successMsg = false;
        app.disabled = true;
        app.loading = true;
            
        if(valid && confirmed){
            
        app.regData.username = $scope.username;
            
            User.savePassword(app.regData).then(function(data){
                app.loading = false;
                if(data.data.success){
                    $scope.alert = 'alert alert-success';
                    app.successMsg = data.data.message + ' ...Redirecting';
                      $timeout(function() {
                        $location.path('/login');
                    }, 2000);
                }else{
                    
                    $scope.alert = 'alert alert-danger';
                    app.disabled = false;
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
            });
            
        }else{
            $scope.alert = 'alert alert-danger'; 
            app.successMsg = false;
            app.loading = false;
            app.disabled = false;
            app.errorMsg = "Please ensure form out properly";
        }
        
    }
    
});




angular.module('mainController',['authServices','userServices'])

.controller('mainCtrl',function(Auth, $timeout ,$location,$rootScope ,$window, $interval,$route, User,AuthToken){
    var app= this;
    app.loadme   = false;
     
   
    
    app.checkSession = function(){
      if(Auth.isLoggedIn()){
         app.checkingSession = false;
         var interval = $interval(function(){
            var token = $window.localStorage.getItem('token');
             if(token == null){
                 $interval.cancel(interval);
             }else{
                 self.parseJwt = function(token){
                     var base64Url = token.split('.')[1];
                     var base64    = base64Url.replace('-','+').replace('_','/');
                     return JSON.parse($window.atob(base64));
                 }
                 var expireTime = self.parseJwt(token);
                 var timeStamp  = Math.floor(Date.now() / 1000);
                // console.log(expireTime.exp);
                // console.log(timeStamp);
                 var timecheck = expireTime.exp - timeStamp;
                 console.log('timeChecking', + timecheck);
                 if(timecheck <= 1800 ){
                     app.checkingSession = true;
                     console.log('token has expire');
                     showModal(2);
                     $interval.cancel(interval);
                 }else{
                     console.log('token not yet expired');
                 }
             }
         },30000);
      }
    };
    
    app.checkSession();
    
    
    var showModal = function(option){
        app.choiceMode = false;
        app.modalHeader= undefined;
        app.modalBody  = undefined;
        app.hideButtons = false;
        
        if(option === 1){
            
            app.modalHeader= "Time out Warring";
            app.modalBody  = "Your session will expired in 30 minutes. would you like to renew session?";
            $("#myModal").modal({ backdrop : "static"});
            
         
            
        }else if(option === 2){
            //logout portion
            app.hideButtons = true;
            app.modalHeader= "Logging Out";
            $("#myModal").modal({ backdrop : "static"});
            $timeout(function(){
                
                Auth.logout();
                $location.path('/');
                hideModal();
                $route.reload();
            },2000);
        }
        
       $timeout(function(){
           if(!app.choiceMode){
               hideModal();
           } 
        },10000);
         
       
    };
    
    app.renewSession = function(){
        app.choiceMode = true;
        User.renewSession(app.username).then(function(data){
            if(data.data.success){
                AuthToken.setToken(data.data.token);
                app.checkSession();
            }else{
                app.modalBody = data.data.message;
            }
        });
        hideModal();
    };
    
    app.endSession = function(){
        app.choiceMode = true;
        hideModal();
        $timeout(function(){
           showModal(2); 
        }, 1000);
    };
    
    var hideModal = function(){
        $("#myModal").modal('hide');
    };

    $rootScope.$on('$routeChangeStart',function(){
        app.isLoggedIn = true;
        
      if(!app.checkSession) app.checkSession();
        
         if (Auth.isLoggedIn()){
             
             Auth.getCurrentUser().then(function(data){
                 
                app.CurrUsername       = data.data.user.username;
                app.CurrEmail         = data.data.user.email;
                app.CurrName          = data.data.user.name;
                app.CurrPermission    = data.data.user.permission;
             });
             
            Auth.getUser().then(function(data){
                app.username       = data.data.username;
                app.email         = data.data.email;
                app.name          = data.data.name;
                app.permission    = data.data.permission;
                app.loadme   = true;
                app.disabled = true;
                
                User.getPermission().then(function(data){
                   if(data.data.permission === 'admin' ||  data.data.permission === 'moderator'){
                       app.authorized = true;
                      app.loadme   = true;
                   }else{
                       app.loadme   = true;
                   } 
                });
                
                
                
            });
        }else{
            app.isLoggedIn = false;
            app.username  = '';
            app.email  = '';
            app.loadme   = true;
           app.disabled = false;
    }
    if($location.hash() == '_=_'){
        $location.hash(null);
    }
});
   
    this.facebook = function(){
         app.disabled  = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook'; 
    }
    this.twitter = function(){
         app.disabled  = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter'; 
    }
    
        this.google = function(){
             app.disabled  = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google'; 
    }
    
    this.doLogin = function(loginData){
        app.loading = true;
        app.errorMsg = false;
        app.expired  = false;
        app.disabled  = true;
        Auth.login(app.loginData).then(function(data){
        if(data.data.success){
            app.loading = false;
            app.successMsg = data.data.message + ' ...Redirecting'; 
            $timeout(function(){
                $location.path('/about');
                app.loginData = "";
                app.successMsg = false;
            },2000);
            
        } else{
           
            if (data.data.expired){
                    
                    app.expired  = true;
                    app.loading = false;
                    app.errorMsg = data.data.message;
            }else{
                
                app.loading = false;
                app.disabled  = false;
                app.errorMsg = data.data.message;
            }
        }
        
        });
        
    };
    
   app.logout = function(){
      showModal(2);
        
    };
});
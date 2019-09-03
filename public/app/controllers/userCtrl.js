angular.module('userControllers',['userServices'])

.controller('regCtrl',function($http,$location,$timeout,User){
    var app= this;
    
    this.regUser = function(regData, valid){
        app.loading = true;
        app.errorMsg = false;
        if (valid){
            User.create(app.regData).then(function(data){
            if(data.data.success){
                app.loading = false;
                app.successMsg = data.data.message + '...Redirecting'; 
                $timeout(function(){
                    $location.path('/');
                },2000);

            } else{
                app.loading = false;
                app.errorMsg = data.data.message;
            }

            });

        }else{
                app.loading = false;
                app.errorMsg = 'Please ensure form is filled our properly';
            
        }
        
    };
    
    this.checkUsername = function(regData){
        app.usernameMsg = false;
        app.usernameInvalid = false;
        app.checkingUsername= true;
        User.checkUsername(app.regData).then(function(data){
            if(data.data.success){
                  app.checkingUsername= false;
                 app.usernameInvalid = false;
                app.usernameMsg = data.data.message;
            }else{
                  app.checkingUsername= false;
                app.usernameInvalid = true;
                app.usernameMsg = data.data.message;
            } 
        });
    }
    
    this.checkEmail = function(regData){
        app.emailMsg = false;
        app.emailInvalid = false;
        app.checkingEmail= true;
        User.checkEmail(app.regData).then(function(data){
            if(data.data.success){
                  app.checkingEmail= false;
                 app.emailInvalid = false;
                app.emailMsg = data.data.message;
            }else{
                  app.checkingEmail= false;
                app.emailInvalid = true;
                app.emailMsg = data.data.message;
            } 
        });
    }

})

.directive('match',function(){
    return {
        restrict: 'A',
        controller: function($scope){
          $scope.confirmed = false;
            
            $scope.doConfirm = function(values){
                values.forEach(function(ele){
                   if ($scope.confirm == ele){
                            $scope.confirmed = true;
                   }else{
                            $scope.confirmed = false;
                    }
        
                });
            }
        },
        link: function(scope, element , attrs){
            attrs.$observe('match',function(){
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm (scope.matches);
            });
            scope.$watch('confirm',function(){
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm (scope.matches);
                
            });
        }
    };
})

.controller('facebookCtrl',function($routeParams,Auth,$location,$window){
    var app = this;
    app.errorMsg = false;
    app.expired  = false;
    app.disable  = true;
    
    if ($window.location.pathname == '/facebookerror'){
        app.errorMsg = 'Facebook e-mail not found in database';
        
    }else if($window.location.pathname == '/facebook/inactive/error'){
            app.expired  = true;
            app.errorMsg = "Account is not yet activated please check your e-mail for activation of link.";
    } else{
            Auth.facebook($routeParams.token);
            $location.path('/');
    }
    
})


.controller('googleCtrl',function($routeParams,Auth,$location,$window){
    var app = this;
    app.errorMsg = false;
    app.expired  = false;
    app.disable  = true;
    if ($window.location.pathname == '/googleerror'){
        
        app.errorMsg = 'Google e-mail not found in database';
        
    }else if($window.location.pathname == '/google/inactive/error'){
            app.expired  = true;
            app.errorMsg = "Account is not yet activated please check your e-mail for activation of link.";
    }
    else{
            Auth.facebook($routeParams.token);
            $location.path('/');
    }
    
});
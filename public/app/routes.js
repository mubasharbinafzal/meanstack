var app = angular.module('appRoutes',['ngRoute'])

.config(function($routeProvider,$locationProvider){
  
    $routeProvider
    .when('/',{
        templateUrl: 'app/view/pages/home.html'
    })
    
    .when('/about',{
        templateUrl: 'app/view/pages/about.html'
    })
    
    .when('/register',{
        templateUrl: 'app/view/pages/users/register.html',
        controller:  'regCtrl',
        controllerAs: 'register',
        authenticated:false
    })
    .when('/login',{
        templateUrl: 'app/view/pages/users/login.html',
        authenticated:false
    })
     .when('/logout',{
        templateUrl: 'app/view/pages/users/logout.html',
        authenticated:true
    })
     .when('/profile',{
        templateUrl: 'app/view/pages/profile.html',
        authenticated:true
    })
    .when('/facebook/:token',{
        templateUrl : 'app/view/pages/users/social/social.html',
        controller  : 'facebookCtrl',
        controllerAs:'facebook',
        authenticated:false
    })
    
    .when('/facebookerror',{
        templateUrl : 'app/view/pages/users/login.html',
        controller  : 'facebookCtrl',
        controllerAs:'facebook',
        authenticated:false
    })
     .when('/google/:token',{
        templateUrl : 'app/view/pages/users/social/social.html',
        controller  : 'googleCtrl',
        controllerAs:'google',
        authenticated:false
    })
    .when('/googleerror',{
        templateUrl : 'app/view/pages/users/login.html',
        controller  : 'googleCtrl',
        controllerAs:'google',
        authenticated:false
    })
   
     .when('/facebook/inactive/error',{
        templateUrl : 'app/view/pages/users/login.html',
        controller  : 'facebookCtrl',
        controllerAs: 'facebook',
        authenticated: false
    })
     .when('/google/inactive/error',{
        templateUrl : 'app/view/pages/users/login.html',
        controller  : 'googleCtrl',
        controllerAs: 'google',
        authenticated: false
    })
    
     .when('/activate/:token', {
        templateUrl: 'app/view/pages/users/activation/activate.html',
        controller: 'emailCtrl',
        controllerAs: 'email',
        authenticated: false
    })
    
     .when('/resend', {
        templateUrl: 'app/view/pages/users/activation/resend.html',
        controller: 'resendCtrl',
        controllerAs: 'resend',
        authenticated: false
    })
    .when('/resetusername', {
        templateUrl: 'app/view/pages/users/reset/username.html',
        controller: 'usernameCtrl',
        controllerAs: 'username',
        authenticated: false
    })
    
    .when('/resetpassword', {
        templateUrl: 'app/view/pages/users/reset/password.html',
        controller: 'passwordCtrl',
        controllerAs: 'password',
        authenticated: false
    })
    .when('/reset/:token', {
        templateUrl: 'app/view/pages/users/reset/newpassword.html',
        controller:  'resetCtrl',
        controllerAs:'reset',
        authenticated: false
    })
    .when('/management',{
        templateUrl: 'app/view/pages/management/management.html',
        controller:  'managementCtrl',
        controllerAs:'management',
        authenticated: true,
        permission: ['admin','moderator']
    })
    .when('/edit/:id',{
        templateUrl: 'app/view/pages/management/edit.html',
        controller:  'editCtrl',
        controllerAs:'edit',
        authenticated: true,
        permission: ['admin','moderator']
    })
     .when('/search',{
        templateUrl: 'app/view/pages/management/search.html',
        controller:  'managementCtrl',
        controllerAs:'management',
        authenticated: true,
        permission: ['admin','moderator']
    })
    .otherwise({redirectTo: '/'});
    
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

app.run(['$rootScope','Auth','$location','User',function($rootScope,Auth,$location,User){
    $rootScope.$on('$routeChangeStart',function(event,next,current){
        if(next.$$route.authenticated == true){
            if(!Auth.isLoggedIn()){
                event.preventDefault();
                $location.path('/');
            }else if(next.$$route.permission){
             User.getPermission().then(function(data){
                 if(next.$$route.permission[0]!== data.data.permission){
                     if(next.$$route.permission[1]!== data.data.permission){
                         event.preventDefault();
                        $location.path('/');   
                     }
                 }
             })   
            }
        }else if (next.$$route.authenticated == false){
            if(Auth.isLoggedIn()){
                  event.preventDefault();
                $location.path('/profile');
                
            }
        }    
    });
}]);


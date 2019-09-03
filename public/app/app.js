angular.module('userApp',['appRoutes','userControllers','ngAnimate','mainController','authServices', 'emailController','managementController'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors');
})

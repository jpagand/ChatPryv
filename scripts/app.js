'use strict';

/**
 * @ngdoc overview
 * @name chatPryvApp
 * @description
 * # chatPryvApp
 *
 * Main module of the application.
 */
angular
  .module('chatPryvApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'hc.marked',
    'angularMoment',
    'chatPryvApp.chat',
    'chatPryvApp.main',
    'chatPryvApp.new',
    'chatPryvApp.conv',
    'chatPryvApp.about'
  ])
  .config(['$routeProvider' ,function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/new', {
        templateUrl: 'views/new.html',
        controller: 'NewCtrl'
      })
      .when('/conversation/:convId', {
        templateUrl: 'views/conv.html',
        controller: 'ConvCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);

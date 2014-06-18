'use strict';

/**
 * @ngdoc function
 * @name chatPryvApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the chatPryvApp
 */
angular.module('chatPryvApp.about', [])
  .controller('AboutCtrl',['$scope', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);

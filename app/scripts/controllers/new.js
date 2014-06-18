'use strict';

/**
 * @ngdoc function
 * @name chatPryvApp.controller:NewCtrl
 * @description
 * # NewCtrl
 * Controller of the chatPryvApp
 */
angular.module('chatPryvApp.new', [])
  .controller('NewCtrl', ['$scope', 'Chat','$location', function ($scope, Chat, $location) {
    Chat.init();
    $scope.newConv = {};
    $scope.addConv = function () {
      $scope.disable = true;
      Chat.addConversation($scope.newConv);
    };
    $scope.$on('success:conversation', function () {
       $scope.disable = false;
      $location.path('/');
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.$on('fail:conversation', function () {
       $scope.disable = false;
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

  }]);

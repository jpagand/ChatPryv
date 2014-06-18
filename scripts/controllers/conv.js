'use strict';

/**
 * @ngdoc function
 * @name chatPryvApp.controller:NewCtrl
 * @description
 * # NewCtrl
 * Controller of the chatPryvApp
 */
angular.module('chatPryvApp.conv', [])
  .controller('ConvCtrl', ['$scope', 'Chat','$routeParams', function ($scope, Chat, $routeParams) {
    Chat.init();
    $scope.conv = Chat.getConversation($routeParams.convId);
    $scope.messages = Chat.getMessages($routeParams.convId);
    $scope.$on('change:message', function () {
      $scope.messages= Chat.getMessages($routeParams.convId);
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $scope.addMessage = function () {
      Chat.addMessage($scope.conv, $scope.newMess);
      $scope.newMess = null;
    }

  }]);
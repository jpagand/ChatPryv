'use strict';

/**
 * @ngdoc function
 * @name chatPryvApp.controller:NewCtrl
 * @description
 * # NewCtrl
 * Controller of the chatPryvApp
 */
angular.module('chatPryvApp.conv', [])
  .controller('ConvCtrl', ['$scope', 'Chat','$routeParams', '$location', function ($scope, Chat, $routeParams, $location) {
    Chat.init();
    $scope.conv = Chat.getConversation($routeParams.convId);
    if (!$scope.conv) {
      $location.path('/');
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    }
    $scope.messages = Chat.getMessages($routeParams.convId);
    $scope.$on('change:message', function () {
      $scope.messages= Chat.getMessages($routeParams.convId);
      setTimeout(function () {
        if(!$scope.$$phase) {
          $scope.$apply();
          $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
        }
      }, 0);
    });
    $scope.addMessage = function () {
      Chat.addMessage($scope.conv, $scope.newMess);
      $scope.newMess = null;
    }
    $scope.delete = function (conv) {
      Chat.removeConversation(conv);
      $location.path('/');
      setTimeout(function () {
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      }, 0);
    }
    setTimeout(function () {
      $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
    }, 0);

  }]);
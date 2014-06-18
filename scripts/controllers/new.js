'use strict';

/**
 * @ngdoc function
 * @name chatPryvApp.controller:NewCtrl
 * @description
 * # NewCtrl
 * Controller of the chatPryvApp
 */
angular.module('chatPryvApp.new', [])
  .controller('NewCtrl', ['$scope', 'Chat', function ($scope, Chat) {
    Chat.init();
    $scope.newConv = {};
    $scope.addConv = function () {
      Chat.addConversation($scope.newConv);
    };

  }]);

'use strict';

/**
 * @ngdoc function
 * @name chatPryvApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the chatPryvApp
 */
angular.module('chatPryvApp.main', [])
  .controller('MainCtrl', ['$scope', 'Chat', function ($scope, Chat) {
    Chat.init();
    $scope.conversations = _.toArray(Chat.getConversation());
    $scope.$on('change:conversation', function () {
      $scope.conversations = _.toArray(Chat.getConversation());
    });

  }]);

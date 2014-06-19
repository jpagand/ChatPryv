'use strict';

angular.module('chatPryvApp.chat', [])
  .factory('Chat', ['$rootScope', '$http', function ($rootScope, $http) {
    var MESS_BY_CONV = 100;
    var EVENT_TYPE = 'encrypted/aes-text-base64';
    //singleton
    var isInit = false;
    // conv list {conv.token: con}
    var conversations = {};
    // mess list {con.token: [mess]}
    var messages = {};
    // mess to sync list {con.token : [mess]}
    var messToSync = {};
    var sockets = {};
    Offline.options = {checks: {image: {url: 'http://pryv.com/wp-content/uploads/2013/12/logoPryv.png'}, active: 'image'}}
    Offline.on('up', function () {
      console.log('Network up');
      _.each(sockets, function (socket) {
        socket.socket.connect();
      });
    });
    var _storage = {
      save: function (key, object) {
        localStorage.setItem(key, JSON.stringify(object));
      },
      restore: function (key) {
        return JSON.parse(localStorage.getItem(key));
      }
    }
    var init = function () {
      if (!isInit) {
        isInit = true;
        conversations = _storage.restore('conversations') || {};
        _.each(conversations, function (conv) {
          _initConvSocket(conv, function (socket) {
            socket.socket.on('connect', function () {
              console.log('Connect success');
              socket.convToken = conv.token;
              sockets[conv.token] = socket;
              _syncGetMessages(conv);
              socket.on('eventsChanged', function () {
                _syncGetMessages(conv);
              });
            });
            socket.socket.on('error', function (e) {
              socket.convToken = conv.token;
              sockets[conv.token] = socket;
              console.warn('Connection error:', e);
            });
          });
        });
        messages = _storage.restore('messages') || {};
        messToSync = _storage.restore('messToSync') || {};
      }
    }
    var _initConvSocket = function (conv, callback) {
      var s = io.connect('https://' + conv.host + '.pryv.io:443/' + conv.host + '?auth=' + conv.token + '&resource=/' + conv.host, {'force new connection': true, reconnection: false, timeout: 10000});
      console.log(s);
      if (_.isFunction(callback)) {
        callback(s);
      }
    };
    var _addExternalMessage = function (conv, message) {
       message.message = CryptoJS.AES.decrypt(message.content.payload, conversations[conv].pass).toString(CryptoJS.enc.Utf8);
      var unique = true;
      _.each(messages[conv], function (m) {
        if (m.message === message.message && m.time && message.time) {
          unique = false;
        }
      });
      if (unique) {

        if (!messages[conv]) {
          messages[conv] = [];
        }
        messages[conv].push(message);
        if (!conversations[conv].lastModified || conversations[conv].lastModified < message.modified) {
          conversations[conv].lastModified = message.modified;
        }
        _storage.save('messages', messages);
        $rootScope.$broadcast('change:message');
      }
    }
    var addConversation = function (conv) {
      if (conv.token && !conversations[conv.token]) {
        _initConvSocket(conv, function (socket) {
          socket.socket.on('connect', function () {
            console.log('Connect success');
            socket.emit('streams.get',{} , function (error, result) {
              console.log('streams.get success', arguments);
              if (result && result.streams) {
                conv.streamId = result.streams[0].id;
                conversations[conv.token] = conv;
                socket.convToken = conv.token;
                sockets[conv.token] = socket;
                _storage.save('conversations', conversations);
                $rootScope.$broadcast('change:conversation');
                $rootScope.$broadcast('success:conversation');

                socket.on('eventsChanged', function () {
                  _syncGetMessages(conv);
                });

                socket.emit('events.get', {streams: [conv.streamId], types: [EVENT_TYPE], limit: 100}, function (error, result) {
                  if (result && result.events) {
                    _.each(result.events, function (event) {
                      _addExternalMessage(conv.token, event);
                    });
                  } else {
                    console.warn('Fail fetch events', error, result);
                  }
                });
              } else {
                console.warn('Fail fetch stream', error, result);
              }
            })
          });
          socket.socket.on('error', function (e) {
            console.warn('Connection error:', e);
          });
        });
      } else {
        $rootScope.$broadcast('fail:conversation', 'already_exist');
      }
    }
    var removeConversation = function (param) {
      var token = param.token || param;
      if (conversations[token]) {
        delete conversations[token];
        _storage.save('conversations', conversations);
        delete messages[token];
        _storage.save('messages', messages);
        delete messToSync[token];
        _storage.save('messToSync', messToSync);
        $rootScope.$broadcast('change:conversation');
      }
    }

    var getConversation = function (token) {
      if (token) {
        return conversations[token];
      } else {
        return conversations;
      }
    }
    var _syncGetMessages = function (conv) {
      var socket = sockets[conv.token];
      socket.emit('events.get', {streams: [conv.streamId], types: [EVENT_TYPE], modifiedSince: conv.lastModified || 0}, function (error, result) {
        if (result && result.events) {
          _.each(result.events, function (event) {
            _addExternalMessage(conv.token, event);
          });
        } else {
          console.warn('Fail fetch eventsChanges', error, result);
        }
      });
    }
    var syncPostMessages = function () {
      _.each(messToSync, function (messages, convToken) {
        var socket = sockets[convToken];
        var toSync = messToSync[convToken].slice(0);
        messToSync[convToken] = [];
        _.each(toSync, function (message) {
          var url = 'https://' + conversations[convToken].host + '.pryv.io/events?auth=' + convToken;
          $http.post(url,  _.pick(message, ['time', 'streamId', 'type', 'content']))
            .success(function (result) {
              if (result && result.error) {
                messToSync[convToken].push(message);
                console.warn('Error creating message', result);
              } else {
                console.log('success create message');
              }
            })
            .error(function () {
              messToSync[convToken].push(message);
              console.warn('Error creating message');
            });
        });
      });
    }
    var addMessage = function (conv, message) {
      var token = conv.token || conv;
      if (conversations[token]) {
        var event = {};
        event.time = Date.now() / 1000;
        event.message = message;
        event.content = {payload: CryptoJS.AES.encrypt(message, conversations[token].pass).toString()};
        event.streamId = conversations[token].streamId;
        event.type = EVENT_TYPE;
        if (!messages[token]) {
          messages[token] = [];
        }
        messages[token].push(event);
        if (!messToSync[token]) {
          messToSync[token] = [];
        }
        messToSync[token].push(event);
        syncPostMessages();
        _storage.save('messages', messages);
        _storage.save('messToSync', messToSync);
        $rootScope.$broadcast('change:message');
      } else {
        console.warn('Cannot find conversation', token, conv);
      }
    }
    var getMessages = function (convToken) {
      return _.sortBy(messages[convToken], function(mess){ return mess.time; });
    }
    var refresh = function () {
      syncPostMessages();
      _.each(conversations, function (conv) {
        _syncGetMessages(conv);
      })
    };

    return {
      init: init,
      addConversation: addConversation,
      getConversation: getConversation,
      removeConversation: removeConversation,
      addMessage: addMessage,
      getMessages: getMessages,
      syncPostMessages: syncPostMessages,
      refresh: refresh
    }
  }]);
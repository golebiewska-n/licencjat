function MessageClient(logout_callback) {
  this.to_delete = {};
  this.id = null;
  this.logout_callback = logout_callback;

  var _this = this;

  this.ajax_request = function(data, success, retry) {
     $.ajax({
        type: "GET",
        url: "php-messages/msg_api.php",
        data: data,
        async: true,
        cache: false,
        timeout: 50000,
        success: function(response) {
           if(response == "LOGOUT") {
             typeof _this.logout_callback === 'function' && _this.logout_callback();
           } else {
             typeof success === 'function' && success(JSON.parse(response));
           }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
          setTimeout(retry, 1000);
        }});
  };


  this.login = function(username, callback) {
     _this.ajax_request({"cmd": "login", "username": username},
           function(response) {
              _this.id = response;
              typeof callback === 'function' && callback(response);
           },
           function () { _this.login(username, callback); });
  };


  this.delete_message = function(msg_id) {
     _this.ajax_request({"id": _this.id, "cmd": "delete_message", "msg_id": msg_id},
           function(data) { delete _this.to_delete[msg_id]; },
           function() { _this.delete_message(msg_id); });
  };


  this.get_first_message = function(type, callback, timeout_callback,
        expire_time) {

    var d = new Date()
    if(expire_time != null && d.getTime() > expire_time) {
      if(typeof timeout_callback === 'function') {
        if(timeout_callback.length == 2) timeout_callback(_this.id, type);
        else timeout_callback();
      }
      return null;
    }

    _this.ajax_request(
          {"id": _this.id, "cmd": "get_first_message", "type": type},
          callback,
          function() {
            _this.get_first_message(type, callback, timeout_callback, expire_time);
          });
  };


  this.read_message = function(type, callback, timeout_callback, timeout) {
     if(timeout != null) {
        var d = new Date()
        expire_time = d.getTime() + timeout;
     } else {
        expire_time = null;
     }

     if(type == null) {
        type = "";
     }

     var callback_wrapper = function f(msg) {
        if(msg != null && !(msg["id"] in _this.to_delete)) {
           _this.to_delete[msg["id"]] = 0;
           _this.delete_message(msg["id"]);
           callback(msg);
        } else {
           setTimeout(function() {
              _this.get_first_message(type, f, timeout_callback, expire_time);
           }, 2000);
        }
     };

     this.get_first_message(type, callback_wrapper, timeout_callback,
           expire_time);
  };


  this.send_message = function(receiver, type, content) {
     if(type == null) {
        type = "";
     }
     _this.ajax_request(
           {"id": _this.id, "cmd": "send_message", "type": type,
            "receiver": receiver, "content": content},
           null,
           function() { _this.send_message(receiver, type, content); });
  };


  this.get_active_sessions = function(callback) {
     _this.ajax_request(
           {"id": _this.id, "cmd": "get_active_sessions"},
           callback,
           function() { _this.get_active_sessions(callback); });
  };


  this.get_activity = function(session_id, callback) {
     _this.ajax_request(
           {"id": _this.id, "cmd": "get_activity", "session_id": session_id},
           callback,
           function() { _this.get_activity(session_id, callback); });
  };

}

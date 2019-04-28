<html>
<head>
    <title>Agent</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script> 
    <script src="php_messages.js" type="text/javascript" charset="utf-8"></script>

    <script type="text/javascript" charset="utf-8">

    var peer_id = null;
    var client = null;

    function pass_messages(msg) {

      $("#messages").html("<input type=\"text\" name=\"name\" id=\"text_input\" /><button id=\"confirm_button\">Send</button>");
      $("#confirm_button").click(function() { 
        client.send_message(peer_id, "RESPONSE", $("#text_input").val());
        $("#messages").html("Value send");
      });
      
      client.read_message("RESPONSE", function(msg) { alert(msg["content"]) }, null, null);
    }

    function reset_agent() {
      peer_id = null;
      wait_for_peer(); 
    }

    function wait_for_peer() {
      client.read_message("JOIN_OFFER", function(msg) {
        if(peer_id == null) {
          peer_id = msg["sender"];
          pass_messages();
        }
      }, null, null);
    }

   
    $(document).ready(function(){
      client = new MessageClient(function() { client.login("agent2", reset_agent); });
      client.login("agent2", reset_agent);
    });

    </script>
</head>
<body>
    <div id="messages">
      Waiting for peer.
    </div>
</body>
</html>

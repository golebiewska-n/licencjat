<?php
require_once('database.php');
require_once('message_box.php');
require_once('session_manager.php');
require_once('on_login.php');


$db = db_connect();

$messagebox = new Messagebox($db);
$session_manager = new SessionManager($db);

#TODO: smarter login code
if($_GET["cmd"] == "login") {
  $id = $session_manager->login($_GET["username"]);
  echo(json_encode($id));

  if(!is_null($id)) {
    on_login($id, $db, $messagebox, $session_manager);
  } else {
    die("LOGOUT");
  }

  exit();
}

# Checking if logged in
$idle_time = $session_manager->calculate_idle_time($_GET["id"]);
if(is_null($_GET["id"]) or is_null($idle_time)) {
  die("LOGOUT");
}

if($idle_time > 60*10) {
  $session_manager->close_session($_GET["id"]);
  die("LOGOUT");
}

$session_manager->update_activity($_GET["id"]);


switch ($_GET["cmd"]) {
  case "get_first_message":
    $res = $messagebox->get_first_message($_GET["id"], $_GET["type"]);
    echo(json_encode($res));
    break;

  case "delete_message":
    $msg = $messagebox->get_message($_GET["msg_id"]);
    if ($msg["receiver"] == $_GET["id"]) {
      $messagebox->delete_message($_GET["msg_id"]);
    }
    echo(json_encode($_GET["msg_id"]));
    break;

  case "send_message":
    $res = $messagebox->send_message($_GET["id"], $_GET["receiver"],
                                     $_GET["type"], $_GET["content"]);
    echo(json_encode($res));
    break;

  case "get_active_sessions":
    $res = $session_manager->get_active_sessions();
    echo(json_encode($res));
    break;

  case "get_activity":
    $res = $session_manager->get_activity($_GET["session_id"]);
    echo(json_encode($res));
    break;
}

?>

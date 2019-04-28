<?php

class Messagebox {

  function __construct($db) {
    $this->db = $db;
  }

  function get_first_message($receiver, $type) {

    if (is_null($type)) {
      $query_str = "SELECT * FROM messages WHERE receiver='".$receiver.
        "' ORDER BY time ASC, id ASC LIMIT 1;";
    } else {
      $query_str = "SELECT * FROM messages WHERE receiver='".$receiver.
        "' AND type='".$type."' ORDER BY time ASC, id ASC LIMIT 1;";
    }

    $res = $this->db->query($query_str);
   
    if (!$res) {
      die("MySQL query error.");
    }

    return $res->fetch_assoc();
  }

  function get_message($msg_id) {
    $res = $this->db->query("SELECT * FROM messages WHERE id='".$msg_id."';");

    if (!$res) {
      die("MySQL query error.");
    }

    return $res->fetch_assoc();
  }

  function delete_message($msg_id) {
    $res = $this->db->query("DELETE FROM messages WHERE id='".$msg_id."';");
    if (!$res) {
      die("MySQL query error.");
    }  
  }

  function send_message($sender, $receiver, $type, $content) {
    $res = $this->db->query("INSERT INTO messages
            (sender, receiver, type, content) VALUES ('".
            implode("','", array($sender, $receiver, $type, $content))."');");
    if (!$res) {
      die("MySQL query error.");
    }  
    return $this->db->insert_id;
  }

}

?>

<?php

class SessionManager {

  function __construct($db) {
     $this->db = $db;
  }

  function login($username) {
     $res = $this->db->query('SELECT id FROM users WHERE username="'.$username.'";');
     if (!$res) {
       die("MySQL query error.");
     } 
     if (!($row = $res->fetch_assoc())) {
       return NULL;
     }
     return $this->start_session($row["id"]);
  }

  function start_session($user_id) {
     $res = $this->db->query('INSERT INTO sessions (last_active, user_id) VALUES (NOW(),'.$user_id.');');
     if (!$res) {
        die("MySQL query error.");
     }  
     return $this->db->insert_id;
  }

  function close_session($id) {
     $res = $this->db->query('DELETE FROM sessions WHERE id='.$id.';');
     if (!$res) {
       die("MySQL query error.");
     } 
     $res = $this->db->query('DELETE FROM messages WHERE receiver='.$id.';');
     if (!$res) {
       die("MySQL query error.");
     }   
  }

  function find_matching_peer($id) {
     $res = $this->db->query('SELECT users.group_id FROM sessions JOIN users ON sessions.user_id=users.id WHERE sessions.id='.$id.';');
     if (!$res) {
       die("MySQL query error.");
     } 
     if (!($row = $res->fetch_assoc())) {
       return NULL;
     }
     $group_id = $row['group_id'];
    
     $res = $this->db->query('SELECT sessions.id FROM sessions JOIN users ON sessions.user_id=users.id WHERE peer_id IS NULL AND users.group_id!='.$group_id.' AND UNIX_TIMESTAMP(NOW())-UNIX_TIMESTAMP(last_active) < 10;');
     if (!$res) {
       die("MySQL query error.");
     }
     if (!($row = $res->fetch_assoc())) {
       return NULL;
     }
     $peer_id = $row['id'];

     $res = $this->db->query('UPDATE sessions SET peer_id='.$peer_id.' WHERE id='.$id.';');
     if (!$res) {
       die("MySQL query error.");
     } 
     $res = $this->db->query('UPDATE sessions SET peer_id='.$id.' WHERE id='.$peer_id.';');
     if (!$res) {
       die("MySQL query error.");
     } 

     return $peer_id;
  }

  function get_activity($id) {
     $res = $this->db->query('SELECT last_active FROM sessions WHERE id='.$id.';');
     if (!$res) {
       die("MySQL query error.");
     }
     if (!($row = $res->fetch_assoc())) {
       return NULL;
     }
     return $row['last_active'];
  }

  function calculate_idle_time($id) {
     $res = $this->db->query('SELECT (UNIX_TIMESTAMP(NOW())-UNIX_TIMESTAMP(last_active)) AS idle_time FROM sessions WHERE id='.$id.';');
     if (!$res) {
       die("MySQL query error.");
     }
     if (!($row = $res->fetch_assoc())) {
       return NULL;
     }
     return $row['idle_time'];
  }

  function update_activity($id) {
    $res = $this->db->query("UPDATE sessions SET last_active=NOW() WHERE id=".$id.";");
    if (!$res) {
       die("MySQL query error.");
    }  
  }

  function get_active_sessions() {
    $res = $this->db->query('SELECT id FROM sessions WHERE
      UNIX_TIMESTAMP(NOW())-UNIX_TIMESTAMP(last_active) < 10;');
    if (!$res) {
      die("MySQL query error.");
    }
    $active_ids = array();
    while($row = $res->fetch_assoc()) {
      $active_ids[] = $row["id"];
    } 
    return $active_ids;
  }

}

?>

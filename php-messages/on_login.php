<?php

function on_login($id, $db, $messagebox, $session_manager) {
    # Peer matching
    $peer_id = $session_manager->find_matching_peer($id);
    if(!is_null($peer_id)) {
      $messagebox->send_message($id, $peer_id, "JOIN_OFFER", "");
      $messagebox->send_message($peer_id, $id, "JOIN_OFFER", "");
    }
}

?>

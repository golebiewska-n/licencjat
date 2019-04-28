<?php

function db_connect() {
  $host = 'localhost';
  $login = 'root';
  $password = 'root';
  $db = 'php-messages';

  $connection = new mysqli($host, $login, $password, $db);
  
  if ($connection->connect_errno) {
      echo("Failed to connect to MySQL: (" . $connection->connect_errno . ") " . $connection->connect_error);
  }  

  return $connection;
}

?>

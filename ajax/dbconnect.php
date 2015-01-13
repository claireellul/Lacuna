<?php
   $host        = "host=127.0.0.1";
   $port        = "port=1432";
   $dbname      = "dbname=user1db";
   $credentials = "user=user1 password=user1password";
   $db = pg_connect( "$host $port $dbname $credentials"  );

?>
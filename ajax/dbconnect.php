<?php
   $host        = "host=localhost";
   $port        = "port=5432";
   $dbname      = "dbname=postgis";
   $credentials = "user=postgres password=postgres";
   $db = pg_connect( "$host $port $dbname $credentials"  );
?>
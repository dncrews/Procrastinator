======================
 SETUP
======================
1. Log in to mysql client and run:
   % SOURCE scripts/init.sql

======================
 RUN
======================

To start the server:

% node node/server.js

To visit:

http://127.0.0.1:8888/

======================
 DEPENDENCIES
======================
  * Node.js

  * db-mysql   
    % export MYSQL_CONFIG=/usr/bin/mysql_config
    % npm install db-mysql

  * node-cron
    % npm install cron

  * Express
    % npm install express




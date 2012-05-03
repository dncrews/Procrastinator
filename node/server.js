var http        = require('http');
var fs          = require('fs');
var path        = require('path');
var mysql       = require('db-mysql');
var cronJob     = require('cron').CronJob;
var querystring = require("querystring");
var url         = require('url');
var express     = require('express');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
var app = express.createServer();

app.use(express.bodyParser());

// Handle: domain root request
app.get('/', function(req, res){
  console.log( "Handling request to /" );
  get_messages( 'foo@bar.com', res );
});

// Handle: Sign-up request
app.post('/signup', function(req, res){
  console.log( "Handling request to /signup" );
  add_user( req.body.email, req.body.password, req.body.phone );
  handle_static_file( 'public/user_created.html', res );
});

// Handle: Sign-in request
app.post('/signin', function(req, res){
  console.log( "Handling request to /signin" );
  user_exists( req.body.email, req.body.password );
});

// Handle: static file requests
app.get('*', function(req, res){
  var file_path = get_requested_file_path( req );
  console.log( "Handling request to static file: " + file_path );
  path.exists(file_path, function(exists) {
    if ( exists ) {
      handle_static_file( file_path, res );
    } else {
      console.log('Request handled as 404: ' + file_path);
      res.writeHead(404);
      res.end();
    }
  });
});

app.listen(8888);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function get_messages( email, response ) {

  get_db().on('error', function(error) {
    console.log('Database error: ' + error);
  }).on('ready', function(server) {
        this.query().
        select('*').
        from('messages').
        where('email = ?', [ email ]).
        execute(function(error, rows, cols) {
            if (error) {
              console.log('ERROR: ' + error);
              return;
            }

            console.log( "Found " + rows.length + " messages for user `" + email + "`." );

            var content_type = 'text/html';

            response.writeHead(200, { 'Content-Type': content_type });
            response.end(_index_html(), 'utf-8');
                
        });
  }).connect();

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function add_user( email, password, phone ) {
  console.log( "Try to add user `" + email + "`" );
  get_db().on('error', function(error) {
    console.log('Database error: ' + error);
  }).on('ready', function(server) {
        this.query().
        insert('users', 
            ['email', 'password', 'phone'], 
            [ email, password, phone ]
        ).
        execute(function(error, result) {
            if (error) {
              console.log('Database error: ' + error);
              return;
            }
            console.log('Created user `' + email + '`');
        });
  }).connect();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function add_message( email, when, title, description ) {
  console.log( "Try to add message `" + title + "`: " + description );
  get_db().on('error', function(error) {
    console.log('Database error: ' + error);
  }).on('ready', function(server) {
        this.query().
        insert('messages', 
            [ 'email', 'when', 'title', 'description' ], 
            [ email, when, title, description ]
        ).
        execute(function(error, result) {
            if (error) {
              console.log('Database error: ' + error);
              return;
            }
            console.log("Created message `" + title + "`: " + description );
        });
  }).connect();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function user_exists( email, password ) {

  get_db().on('error', function(error) {
    console.log('Database error: ' + error);
  }).on('ready', function(server) {
        this.query().
        select('*').
        from('users').
        where('email = ? AND password = ?', [ email, password ]).
        execute(function(error, rows, cols) {
                if (error) {
                        console.log('ERROR: ' + error);
                        return;
                }

          if ( rows.length > 0 ) {
            console.log( "User `" + email + "` exists." );
          } else {
            console.log( "User `" + email + "` does NOT exist." );
          }
                
        });
  }).connect();

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function handle_static_file( file_path, response ) {
  fs.readFile(file_path, function(error, content) {
    if (error) {
      response.writeHead(500);
      response.end();
    }
    else {

      var content_type = 'text/html';

      if ( endsWith( file_path, '.css' ) ) {
        content_type = 'text/css';
      } else if ( endsWith( file_path, '.js' ) ) {
        content_type = 'text/javascript';
      }

      response.writeHead(200, { 'Content-Type': content_type });
      response.end(content, 'utf-8');
    }
  });
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function get_requested_file_path( request ) {

  var file_path = '.' + request.url;
  if (file_path == './')
    file_path = './index.html';

  file_path = file_path.substring( 2 );

  file_path = "public/" + file_path;

  file_path = file_path.toLowerCase();

  if ( file_path.indexOf( '?' ) != -1 ) {
    return file_path.substring( 0, file_path.indexOf( '?' ) );
  } else {
    return file_path;
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function get_db() {
  return new mysql.Database({
    hostname: '127.0.0.1',
    user: 'procrastinate',
    password: 'yourmom',
    database: 'procrastinate',
  });
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
/*
 * Source: http://stackoverflow.com/questions/280634/endswith-in-javascript
 */
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
/*
  user_exists( 'foo@bar.com', 'hella' );

  new cronJob('* * * * * *', function(){
    console.log('You will see this message every second');
  }, null, true, "America/Los_Angeles");

  get_messages( 'foo@bar.com' );
*/


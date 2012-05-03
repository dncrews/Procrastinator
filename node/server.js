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
app.use(express.cookieParser());
app.use(express.session({ secret: "procrastifoo" }));

// Handle: domain root request
app.get('/', function(req, res){
  console.log( "Handling request to /" );
  handle_root_req( req, res );
});

// Handle: Sign-up request
app.post('/signup', function(req, res){
  console.log( "Handling request to /signup" );
  add_user( req, res, req.body.email, req.body.password, req.body.phone );
});

// Handle: Sign-in request
app.post('/signin', function(req, res){
  console.log( "Handling request to /signin" );
  handle_signin( req, res, req.body.email, req.body.password );
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

            handle_static_file( 'public/index.html', response );
        });
  }).connect();

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function add_user( req, res, email, password, phone ) {
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
            set_user_session( req, res, email, password );
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
function handle_root_req( req, res ) {

  var auth_email = req.session.email;
  var auth_pass  = req.session.password;

  if ( typeof auth_email === 'undefined' || typeof auth_pass === 'undefined' ) {
    console.log( "No session information for user; redirecting to login page" );
    res.redirect('/login.html');
    return;
  }

  console.log( "Attempting to authenticate session for user: " + auth_email );

  get_db().on('error', function(error) {
    console.log('Database error: ' + error);
  }).on('ready', function(server) {
        this.query().
        select('*').
        from('users').
        where('email = ? AND password = ?', [ auth_email, auth_pass ]).
        execute(function(error, rows, cols) {
                if (error) {
                        console.log('ERROR: ' + error);
                        return;
                }

          if ( rows.length > 0 ) {
            get_messages( req.session.email, res );
          } else {
            res.redirect('/login.html');
          }
                
        });
  }).connect();

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function handle_signin( req, res, email, password ) {

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
            set_user_session( req, res, email, password );
          } else {
            console.log( "User `" + email + "` does NOT exist." );
            handle_static_file( 'public/error.html', res );
          }
                
        });
  }).connect();

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function set_user_session( req, res, email, password ) {
  req.session.email    = email;
  req.session.password = password;
  console.log( "Set session information for user: " + email );
  res.redirect('/');
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


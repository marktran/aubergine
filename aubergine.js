// aubergine.js : Mark Tran <mark@nirv.net>
var express = require('express'),
    connect = require('connect');

var app = express.createServer(connect.logger());

// configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use('/', connect.bodyDecoder());
  app.use('/', connect.methodOverride());
  app.use('/', connect.compiler({ src: __dirname + '/public',
                                  enable: ['sass'] }));
  app.use('/', connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.set('reload views', 1000);
  app.use('/', connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use('/', connect.errorHandler());
});

// routes
app.get('/', function(req, res) {
  res.render('index.haml', {
    locals: {
      title: 'aubergine'
    }
  });
});

app.listen(9090, '127.0.0.1');

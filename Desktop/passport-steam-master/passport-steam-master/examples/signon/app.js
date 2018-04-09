/**
 * Basic example demonstrating passport-steam usage within Express framework
 */
var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , session = require('express-session')
  , SteamStrategy = require('../../').Strategy

var SteamApi = require('steam-api');

var optionalSteamId = 76561198064189386;
var appId = 294100;
var apiKey= '45189DA008A4684CF106ADDF8659BD25';
var user = new SteamApi.User(apiKey, optionalSteamId);
var userStats = new SteamApi.UserStats(apiKey, optionalSteamId);
var news = new SteamApi.News(apiKey);
var app = new SteamApi.App(apiKey);
var player = new SteamApi.Player(apiKey, optionalSteamId);
var inventory = new SteamApi.Inventory(apiKey, optionalSteamId);
var items = new SteamApi.Items(apiKey, optionalSteamId);
var request = require('request');


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and 	invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:4000/auth/steam/return',
    realm: 'http://localhost:4000/',
    apiKey: '45189DA008A4684CF106ADDF8659BD25'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

var app = express();

var userCode;

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(session({
    secret: 'your secret',
    name: 'name of session id',
    resave: true,
    saveUninitialized: true}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

var test;
var url;
var friendUrl;
var listOGames;

app.get('/account/friends', ensureAuthenticated, function(req, res){
  //res.send(req.user.id);
  //url = ' http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apiKey '&steamids=' +
  //      req.user.id;
  friendUrl = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=' + apiKey + '&steamid=' + req.user.id + '&relationship=friend'
  test = "" + req.user.id;

  listOGames = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + apiKey + '&steamid=' + test +'&format=json';
  console.log(test);
  console.log(listOGames);
  console.log("Here000");
  console.log(friendUrl);
  res.redirect('/account/friendsList');
});

app.get('/account/ListOfGames', ensureAuthenticated, function(req, res){
  url = ' http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apiKey + '&steamids=' + req.user.id;
  friendUrl = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=' + apiKey + '&steamid=' + req.user.id + '&relationship=friend'
  request.get(listOGames, function(error, steamHttpResponse, steamHttpBody) {
        // Once we get the body of the steamHttpResponse, send it to our client
        // as our own httpResponse
        res.setHeader('Content-Type', 'application/json');
        res.send(steamHttpBody);
    });
});

app.get('/account/friendsList', function(httpRequest, httpResponse) {
    // Calculate the Steam API URL we want to use
    request.get(friendUrl, function(error, steamHttpResponse, steamHttpBody) {
        // Once we get the body of the steamHttpResponse, send it to our client
        // as our own httpResponse
        httpResponse.setHeader('Content-Type', 'application/json');
        httpResponse.send(steamHttpBody);
    });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
};

/////////////////////////////////////////////////////////////////////BELOW THIS POINT IS THE ACHIEVEMENT CODE
app.get('/', function(httpRequest, httpResponse) {
    httpResponse.send('Hello, World!');
});

// ```
// 
// Our handler is passed two objects: the original httpRequest and a
// new httpResponse.  The new httpResponse is a brand new object that hasn't been
// sent to the web browser yet.  We manipulate the httpResponse however we want
// before finishing up and sending it on its way with the `.send()` method.
// The `.send()` method can used all by itself by passing it the
// content you want to send.
// 
// And here's a GET event handler for a different URL.
// 
// ```js

app.get('/hello-frank', function(httpRequest, httpResponse) {
    httpResponse.send('Hello, Frank.');
});

// ```
// 
// 
// ### A quick aside:
// 
// We've just bound event handlers for two events for the HTTP GET method.
// We can also bind event handlers for different HTTP methods.
// 
// Launch [Postman] and try making both GET and POST requests to
// [http://localhost:4000/hello-frank](http://localhost:4000/hello-frank).
// 
// ```js

app.post('/hello-frank', function(httpRequest, httpResponse) {
    httpResponse.send("No, Frank. You're not allowed to post.");
});

// ```
// 
// 
// Add parameters to the path
// --------------------------
// Express also lets us define variables in the path.  These variables
// will be stored by Express in the `httpRequest.p+arams` object.
// We can then use those variables to construct a response.
// Open a web browser to [http://localhost:4000/steam/hello/Rachel]
// (http://localhost:4000/steam/hello/Rachel).
// 
// Try changing "Rachel" in the URL in the browser.
// 
// ```js

app.get('/hello/:name', function(httpRequest, httpResponse) {
    var name = httpRequest.params.name;
    httpResponse.send('Hello, ' + name + '!');
});

// ```
// 
// Changing tracks from Express for a moment to introduce the 'request' package.
// 
// We can use the `request` package to make our own HTTP requests.  For example,
// make an HTTP request to the Steam API to download the Civ5 achievements.
// 
// ```js

//var request = require('request');

// ```
// 
// Calculate the Steam API URL we want to use
// 
// ```js

var userId = '76561198040531349';//Zack's Steam ID

var url = 'http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/' +
    'v2/?key=45189DA008A4684CF106ADDF8659BD25&appid=400';

var url2 =  'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=45189DA008A4684CF106ADDF8659BD25&steamids=76561198040531349';//player summary, zack id
var url3 =  'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=440&key=45189DA008A4684CF106ADDF8659BD25&steamid=76561198040531349';//achievements
var url4 =  'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=45189DA008A4684CF106ADDF8659BD25&steamid=76561198040531349&format=json';//owned games
var url5 =  'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=45189DA008A4684CF106ADDF8659BD25&steamids=' + userId;//player summary, open id

var friendList;

user.GetFriendList(optionalRelationship = 'all', userId).done(function(result){
  //console.log(result);
  friendList = result;

  //console.log("test");

  //var myObj = JSON.parse(result);

  //var friends = myObj.player.personaName;
  //console.log(friends);

});

app.get('/account/friends', function(httpRequest, httpResponse) {
 //   httpResponse.send(friendList);
});

user.GetFriendList(optionalRelationship = 'all', optionalSteamId).done(function(result){
 // console.log(result);
});

// ```
// 
// Note: this is an "outgoing" `get()` rather than Express' "incoming" `get()`.
// 
// ```js

request.get(url, function(error, steamHttpResponse, steamHttpBody) {
    // Print to console to prove we downloaded the achievements.
    console.log(steamHttpBody);
    var myObj = JSON.parse(steamHttpBody);

  var gn = myObj.game.gameName;
  var gv = myObj.game.gameVersion;	
  console.log("This is the game "+ gn);
  console.log("This is the game version "+ gv);
});

// ```
// 
// 
// Put it all together
// -------------------
// 
// Now we can try something a little fancier.  We can use the `request` package
// to send our own HTTP requests to third parties.  We can use the third-party's
// response to help construct our own response.
// 
// Open a web browser to [http://localhost:4000/stuff]
// (http://localhost:4000/steam/civ5achievements).
// 
// ```js

app.get('/stuff', function(httpRequest, httpResponse) {
    // Calculate the Steam API URL we want to use
    var url = 'http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/' +
        'v2/?key=45189DA008A4684CF106ADDF8659BD25&appid=400';
    request.get(url4, function(error, steamHttpResponse, steamHttpBody) {
        // Once we get the body of the steamHttpResponse, send it to our client
        // as our own httpResponse
        httpResponse.setHeader('Content-Type', 'application/json');
        httpResponse.send(steamHttpBody);
    });
});

// ```
// 
// Combine the previous two techniques (variables in paths, request package).
// 
// Open a web browser to [http://localhost:4000/steam/game/400/achievements]
// (http://localhost:4000/steam/game/400/achievements) then try changing `400`
// (Civ5) to `292030` (Witcher 3).
// 
// ```js

app.get('/steam/game/:steamids/achievements', function(httpRequest, httpResponse) {
    // Calculate the Steam API URL we want to use
    var url = ' http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=XXXXXXXXXXXXXXXXXXXXXXX&steamids=' +
        httpRequest.params.steamids;
    request.get(url, function(error, steamHttpResponse, steamHttpBody) {
        httpResponse.setHeader('Content-Type', 'application/json');
        httpResponse.send(steamHttpBody);
    });
});

// ```
// 
// 
// Host static files
// -----------------
// What about your static files like `index.html` and `my-angular-app.js`?
// You might expect from the preceding that we'd need to bind event handlers
// for every path.  Well, maybe we can get clever and use those parameters
// in the path.  We'd need to learn how to read files from the filesystem
// and… ugh.  Yep, We can totally do that.
// 
// No, we're not going to do that.
// 
// This is such a common problem that Express has included
// a piece of software to handle it.  This software is called
// `express.static`.  If you call `express.static('public')`, Express
// writes an event handler for you to serve up static files, if they exist,
// in the 'public' folder.  All you need to do is to tell Express when to
// use it.  To tell express when to to call the new handler, use `app.use`.
// 
// After you call `app.use`, files like 'public/index.html' can be accessed
// in a web browser at [http://localhost:4000/static/index.html]
// (http://localhost:4000/static/index.html).
// 
// ```js

app.use('/', express.static('public'));

// ```
// 
// 
// ### Why `/static`?
// 
// You could totally just use `/`.  It's your choice.
// However, it's a good practice to place static files under a different path.
// If you accidentally name a file in a way that matches a path that's handled
// by one of your HTTP event handlers, the file wins.
// But, you don't really want to have to remember that.
// Careful file naming can prevent these problems.
// 
// 
// ### Why `app.use`; why not `app.get`?
// 
// The handlers that can be passed to `app.use` are a bit fancier that what
// we've been writing.  They need to know more about Express' innards and they
// get executed before the HTTP event handlers that we've been writing.
// In fact, they can do some neat pre-processing on
// the incoming HTTP requests before our event handlers see them.  After
// using `app.use` with `express.static`, Express makes a new decision when
// an incoming HTTP request comes in:
// 
// > IF there is a file at the requested path, respond with it;
// > IF NOT, try to use one of our event handlers.
// 
// It would take a lot of extra work to put this decision into every `.get()`
// event handler.  So, `app.use` saves us a ton of work.
// 
// 
// What was httpRequest for?
// -------------------------
// What about that httpRequest parameter?  We haven't done much with it yet.
// Typically HTTP GET requests don't have a body, but that's not the case
// with POST and PUT.  When a web browser sends new data to therver,
// they place that new data in the body of the HTTP POST or HTTP PUT request.
// 
// ```js

var bodyParser = require('body-parser');

app.use(bodyParser.text());

// ```
// 
// You'll need to use Postman to test out this example, because web browsers
// don't give users an easy way to make an HTTP POST.
// 
// Just to show how this works, we'll just write the HTTP POST body to the
// console.  So, open up Postman and make an HTTP POST to
// [http://localhost:4000/frank-blog](http://localhost:4000/frank-blog).
// 
// To constuct your request in Postman, click the 'GET' dropdown next
// to the URL and change to POST, then click the 'BODY' tab and choose
// the 'raw' radio button.  Change the content type to 'Text'.  Type some text
// in the body, then send the request.
// 
// ```js

app.post('/frank-blog', function(httpRequest, httpResponse) {
    //console.log(httpRequest.body);
    // We need to respond to the request so the web browser knows
    // something happened.
    // If you've got nothing better to say, it's considered good practice to
    // return the original POST body.
    httpResponse.status(200).send('Posted today:\n\n' + httpRequest.body);
});

// ```
// 
// 
// Start the server
// ----------------
// Finally, we just add a few lines at the end of the file to start up the Express
// server.
// 
// ```js

var port = 4000;
var server = app.listen(port);
console.log('Listening on port ' + port);

// ```
// 
// That's it.  Just run this file ([`server.js`]
// (https://gist.github.com/johnchristopherjones/c6c8928d2ffa5ccbda6a))
// with the command `node server.js`.
// 
// To stop the server, return to the terminal and type `⌃C` (control-c)
// in the terminal.
// 
// To make changes to the server, edit server.js.  Stop the server with ⌃C
// and start it up again with `node server.js`.

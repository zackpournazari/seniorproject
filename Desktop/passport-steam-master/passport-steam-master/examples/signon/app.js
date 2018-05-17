	var express = require('express')
	, passport = require('passport')
	, util = require('util')
	, session = require('express-session')
	, SteamStrategy = require('../../').Strategy


	var port = process.env.PORT; // 2. Using process.env.PORT

	var SteamApi = require('steam-api');

	var apiKey= '45189DA008A4684CF106ADDF8659BD25';
	var request = require('request');

	var steam = require("steam-web")

	var personas = new Array();
	var personanames = new Array();

	var s = new steam({
		apiKey: '45189DA008A4684CF106ADDF8659BD25',
  	format: 'json' //optional ['json', 'xml', 'vdf']
  });

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
		resave: false,
		saveUninitialized: true}));

	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(__dirname + '/../../public'));

	//the app.get lines below get the index or login site
	//the account page of the website
	//and the back page when attempting to return to previous page
	//both arrays that are used to hold friend name information and game list information
	//is cleared when entering any of these webpages as to keep the information per user.

	app.get('/', function(req, res){
		personanames = [];
		gameList = [];
		res.render('index', { user: req.user });
	});

	app.get('/account', ensureAuthenticated, function(req, res){

		personanames = [];
		gameList = [];
		res.render('account', { user: req.user, playerinfo: req.user.id });
	});

	app.get('/account/back', ensureAuthenticated, function(req, res){

		personanames = [];
		gameList = [];
		res.render('back', { user: req.user });
	});


	app.get('/account/friendList', function(req, res) {
	//this gets the friend list of the current user
	//uses a loop to get all friend ids then checks the user information of them
	//and renders a webpage using the friendname information.
		s.getFriendList({
			steamid: req.user.id ,
  relationship: 'friend', //'all' or 'friend'
  callback: function(err,data) {
  	var myJson;
  	var ids = new Array();
  	var length = data.friendslist.friends.length;
  	for(var x = 0; x < length; x++)
  		ids.push(data.friendslist.friends[x].steamid);
  	console.log(ids);

  	s.getPlayerSummaries({
  		steamids: [ids],
  		callback: function(err, data) {

  			for(var x = 0; x < length; x++)
  				personanames.push(data.response.players[x].personaname);
  			console.log(personanames);
  			res.render('friends', { amigos: personanames});
  		}
  	})
  },
})
	});	


	var gameList = new Array();
	var gameidList = new Array();
	var extendedGameList = new Array();
	var gameCount;

	app.get('/account/gamelist', ensureAuthenticated, function(req, res){
		listOGames = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + apiKey + '&steamid=' + req.user.id +'&include_appinfo=1&format=json';

		request.get(listOGames, function(error, steamres, steamHttpBody) {
	    //this request is to get the list of games
	    //the JSON is parsed and then looped through
	    //finally the link is redirected for the next bit of data
	    var myObj = JSON.parse(steamHttpBody);
	    gameCount = myObj.response.game_count;

	    var z = 0;
	    for (z; z < gameCount; z++)
	    {
	    	var gameId = myObj.response.games[z].appid;
	    	var gameTitle = myObj.response.games[z].name;
	    	gameidList.push(gameId);
	    	gameList.push(gameTitle);
	    }
	    res.redirect('/account/ListOfGames');
	});
	});

	app.get('/account/ListOfGames', ensureAuthenticated, function(req, res){
	//the completed array of game titles is returned and send to the res to be displayed on the html.
	res.send(gameList);
	gameList = [];
});

	app.get('/logout', function(req, res){
		req.logout();
		req.session.destroy(function (err) {
        	res.redirect('/'); //Inside a callback… bulletproof!
        });
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

	app.listen(4000);

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		res.redirect('/');
	};
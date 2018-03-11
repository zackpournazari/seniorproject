// How do I use the Steam API in my web app?
// ====================
// 
// You're a new developer working with web technologies.  You're competent
// in Javascript, though you might or might not be a “[ninja]”,
// and you've been learning some [Angular], [Ember], or maybe [jQuery].
// 
// [angular]: https://angularjs.org
// [ember]: http://emberjs.com
// [ninja]: https://www.manning.com/books/secrets-of-the-javascript-ninja
// [jQuery]: https://jquery.com
// 
// Now you want to start making an app that deals with “real” data, but all
// the cool kids are babbling about APIs and keys and routes and CORS,
// but you just want to make something cool and **WHY IS CROSS-ORIGIN POLICY
// SO HARD**?
// 
// I'll strip the jargon off and get you back on track.
// 
// Knowledge required:
// 
//  - basic command line (`mkdir`, `cd`, `ls`, `node server.js`)
// 
// Software required:
// 
// - [node]
// - [npm]
// - any web browser
// 
// Software recommended:
// 
// - [Postman] \(alternative: `curl`)
// 
// [node]: https://nodejs.org
// [npm]: https://www.npmjs.com
// [Postman]: https://www.getpostman.com
// 
// 
// Follow along
// ------------
// To try out the examples as you read along, live:
// 
// 1.  Make a folder somewhere,
// 2.  [Download and Save this file]
//     (https://gist.github.com/johnchristopherjones/c6c8928d2ffa5ccbda6a) as
//     `server.js` in the new folder.
// 3.  Open a terminal and `cd` to the new folder.
// 4.  Type `npm install express request` to install `express` and
//     `request` locally
// 5.  Type `node server.js` to start the server.
// 6.  Try opening URLs mentioned below in your browser.
// 
// To stop the server, return to the terminal and type `⌃C` (control-c)
// in the terminal.
// 
// To make changes to the server, edit server.js.  Stop the server with `⌃C`
// and start it up again with `node server.js`.
// 
// 
// Steam API
// ---------
// For this example we're going to learn how to work with the Steam API. This
// API has a couple of frustrating features:
// 
//   - The [Steam API] does not allow cross-origin requests.
//   - The Steam API requires an [API key] for many requests, and you have to
//     keep it secret.
// 
// Well, isn't that special?  Just what are you supposed to do with that?
// 
// First, the bad news.  You need to write a server.  You can't get around the
// cross-origin policy restriction.  Not only that, but once you get that
// API key (whatever that is), you need to keep it secret, so you can't include
// it in code you deliver to the web browser.
// 
// The good news is that "a server" is one of those scary overblown words
// like "source code".  I'm sure there was a time for you when "source code"
// was an intimidating word.  Now it's just a kinda-descriptive word for
// certain kinds of text files.  We're about to do that to "server".
// 
// [Steam API]: http://steamcommunity.com/dev
// [API key]: https://steamcommunity.com/dev/apikey
// 
// 
// What's an API key?
// ------------------
// An API key is basically a password.  Without a valid key, the server that hosts
// the API will simply refuse to answer your requests.  There are a number of
// reasons API providers should do this:
// 
// 1. Parts of the API can be privileged to certain API keys (e.g., write
//    permission for internal servers).
// 2. If a specific API user (identified by their API key) is abusing the server
//    then the server can just temporarily or permanently revoke that one key to
//    preserve server performance for everyone else.
// 3. If a specific API user abuses the terms of service of the API, the server
//    can revoke access to that user regardless of their IP address or hostname
//    or any other easily spoofable information.
// 
// In the examples that follow you'll need to replace 45189DA008A4684CF106ADDF8659BD25 with
// your Steam API key.
// 
// 
// ### Get your Steam API Key
// 
// Just go to the Steam [API Key] page and sign up.  It's a shockingly painless
// process.  Once you've got your key, keep it in a safe spot and never share it
// with anyone.  That means keeping it out of Github.
// 
// 
// Get started
// ---------------
// All of the code you'll see belongs in a single javascript file,
// which we'll call `server.js`.
// 
// By convention, you want to put all your 'require' statements at the top.
// However, to avoid introducing too much detail prematurely, I will only
// require packages as they are needed.
// 
// We're going to want an HTTP server.  The HTTP server will receive
// incoming HTTP requests from browsers and send an HTTP responses in return.
// 
// HTTP is a simple protocol composed entirely of text.  However, we're going
// to side-step a lot of tedious text manipulation by using [Express],
// which wraps HTTP up into familiar Javascript objects and events.
// 
// [Express]: http://expressjs.com
// 
// ```js

var express = require('express');

// ```
// 
// Create an Express server (not yet running) so we can configure it.  At the end, we'll make the server run with `app.listen()`.
// 
// ```js

var app = express();

// ```
// 
// Express lets you deal with HTTP in an event-driven way, like
// DOM events in the browser.  Similar to jQuery's `.click()` method, the
// `.get()` method lets you bind an event handler to an HTTP GET request event.
// 
// However, the `.get()` method is a little more powerful.  It lets you bind
// different event handlers for different URLs.  For example, the following
// handler responds to GET requests for the root-level URL (e.g., index.html).
// 
// ```js

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
// will be stored by Express in the `httpRequest.params` object.
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

var request = require('request');

// ```
// 
// Calculate the Steam API URL we want to use
// 
// ```js

var url = 'http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/' +
    'v2/?key=45189DA008A4684CF106ADDF8659BD25&appid=400';

// ```
// 
// Note: this is an "outgoing" `get()` rather than Express' "incoming" `get()`.
// 
// ```js

request.get(url, function(error, steamHttpResponse, steamHttpBody) {
    // Print to console to prove we downloaded the achievements.
    console.log(steamHttpBody);
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
// Open a web browser to [http://localhost:4000/steam/civ5achievements]
// (http://localhost:4000/steam/civ5achievements).
// 
// ```js

app.get('/steam/civ5achievements', function(httpRequest, httpResponse) {
    // Calculate the Steam API URL we want to use
    var url = 'http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/' +
        'v2/?key=45189DA008A4684CF106ADDF8659BD25&appid=400';
    request.get(url, function(error, steamHttpResponse, steamHttpBody) {
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

app.get('/steam/game/:appid/achievements', function(httpRequest, httpResponse) {
    // Calculate the Steam API URL we want to use
    var url = 'http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/' +
        'v2/?key=45189DA008A4684CF106ADDF8659BD25&appid=' +
        httpRequest.params.appid;
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
// with POST and PUT.  When a web browser sends new data to the server,
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
    console.log(httpRequest.body);
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

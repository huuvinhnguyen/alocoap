var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var SONGS_COLLECTION = "songs";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// SONGS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/songs"
 *    GET: finds all songs
 *    POST: creates a new song
 */

app.get("/songs", function(req, res) {
  db.collection(SONGS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get songs.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/songs", function(req, res) {
  var newSong = req.body;
  newSong.createDate = new Date();

  if (!(req.body.number || req.body.name)) {
    handleError(res, "Invalid user input", "Must provide number or name of song.", 400);
  }

  db.collection(SONGS_COLLECTION).insertOne(newSong, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new song.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/songs/:id"
 *    GET: find song by id
 *    PUT: update song by id
 *    DELETE: deletes song by id
 */

app.get("/songs/:id", function(req, res) {
  db.collection(SONGS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get song");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/songs/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(SONGS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update song");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/songs/:id", function(req, res) {
  db.collection(SONGS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete song");
    } else {
      res.status(204).end();
    }
  });
});

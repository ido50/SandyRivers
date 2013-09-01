var express = require('express'),
    MongoClient = require('mongodb').MongoClient;

var app = express();

app.set('title', 'Feed Reader');
app.use(express.static('app'));

app.get('/entries', function(req, res) {
	console.log("Loading entries");
	MongoClient.connect('mongodb://127.0.0.1:27017/feed_reader', function(err, db) {
		if (err) throw err;

		db.collection('entries').find().sort({ date: -1 }).toArray(function(err, results) {
			if (err) throw err;

			res.send(200, { entries: results });
		});
	});
});

app.listen(3000);

console.log("Listening on port 3000");
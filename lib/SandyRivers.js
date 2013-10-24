/*
 * Sandy Rivers
 * https://github.com/ido50/SandyRivers
 *
 * Copyright (c) 2013 Ido Perlmuter
 * Licensed under the GPL3 license.
 */

var express = require('express'),
    MongoClient = require('mongodb').MongoClient;

var app = express();

app.set('title', 'Sandy Rivers');
app.use(express.static('app'));
app.use(express.bodyParser());

app.get('/entries/unread', function(req, res) {
	console.log("Loading entries");
	MongoClient.connect('mongodb://127.0.0.1:27017/sandy_rivers', function(err, db) {
		if (err) throw err;

		db.collection('entries').find().limit(50).sort({ date: -1 }).toArray(function(err, results) {
			if (err) throw err;

			res.send(200, { entries: results });
		});
	});
});

app.get('/entries/all', function(req, res) {
	console.log("Loading entries");
	MongoClient.connect('mongodb://127.0.0.1:27017/sandy_rivers', function(err, db) {
		if (err) throw err;

		db.collection('entries').find().limit(50).sort({ date: -1 }).toArray(function(err, results) {
			if (err) throw err;

			res.send(200, { entries: results });
		});
	});
});

app.get('/feeds', function(req, res) {
	console.log("Loading feeds");
	MongoClient.connect('mongodb://127.0.0.1:27017/sandy_rivers', function(err, db) {
		if (err) throw err;

		db.collection('feeds').find().sort({ _id: 1 }).toArray(function(err, results) {
			if (err) throw err;

			res.send(200, { feeds: results });
		});
	});
});

app.post('/feeds', function(req, res) {
	console.log("Adding feed");
	MongoClient.connect('mongodb://127.0.0.1:27017/sandy_rivers', function(err, db) {
		if (err) throw err;

		db.collection('feeds').insert({
			_id: req.body._id,
			url: req.body.url
		}, function(err, docs) {
			if (err) throw err;
			res.send(200, { success: true });
		});
	});
});

app.listen(3000);

console.log("Listening on port 3000");

/*
 * Sandy Rivers
 * https://github.com/ido50/SandyRivers
 *
 * Copyright (c) 2013 Ido Perlmuter
 * Licensed under the GPL3 license.
 */

var express   = require('express'),
    Datastore = require('nedb')
    FeedSub   = require('feedsub'),
    sanitizer = require('sanitizer'),
    readers   = [],
    db        = {},
    app       = express();

/* Load database */
db.feeds = new Datastore({ filename: 'feeds.db', autoload: true });
db.entries = new Datastore({ filename: 'entries.db', autoload: true });

/* Ensure indexes on the entries collection */
db.entries.ensureIndex({ fieldName: 'read' }, function(err) {
	if (err) throw err;
});
db.entries.ensureIndex({ fieldName: 'url' }, function(err) {
	if (err) throw err;
});

/* Create Express App */
app.set('title', 'Sandy Rivers');
app.use(express.static('app'));
app.use(express.bodyParser());

app.get('/entries/unread', function(req, res) {
	db.entries.find({ read: false }, function(err, docs) {
		if (err) throw err;

		res.send(200, { entries: docs.sort(function(a,b) { return b.date - a.date }) });
	});
});

app.get('/entries/all', function(req, res) {
	db.entries.find({}, function(err, docs) {
		if (err) throw err;

		res.send(200, { entries: docs.sort(function(a,b) { return b.date - a.date }) });
	});
});

app.post('/entries/mark_as_read', function(req, res) {
	if (req.body.all) {
		console.log("Marking all unread entries as read");
		db.entries.update(
			{ read: false },
			{ $set: { read: true } },
			{ multi: true },
			function(err) { if (err) throw err }
		);
	} else {
		db.entries.update(
			{ url: req.body.url },
			{ $set: { read: true } },
			{},
			function(err) { if (err) throw err }
		);
	}
	res.send(200, { succes: 1 });
});

app.get('/feeds', function(req, res) {
	db.feeds.find({}, function(err, docs) {
		if (err) throw err;

		res.send(200, { feeds: docs.sort({ _id: 1 }) });
	});
});

app.post('/feeds', function(req, res) {
	db.feeds.insert({
		name: req.body.name,
		url: req.body.url
	}, function(err, doc) {
		if (err) throw err;
		res.send(200, { success: true });
	});
});

/* Read feeds and start the application */
app.listen(3000);
read_feeds();

console.log("Sandy Rivers listening on port 3000");

function read_feeds() {
	for (var i = 0; i < readers.length; i++) {
		readers[i].stop();
	}
	readers = [];

	db.feeds.find({}, function(err, results) {
		if (err) throw err;

		for (var i = 0; i < results.length; i++) {
			var feed = results[i];

			var reader = new FeedSub(feed.url, {
				interval: 10,
				autoStart: true,
				emitOnStart: true
			});

			var index = 0;

			reader.on('item', function(item) {
				db.entries.findOne({ url: item.link }, function(err, doc) {
					if (err) throw err;
					if (!doc) {
						db.entries.insert({
							url: item.link,
							feed: feed.name,
							title: item.title,
							description: sanitizer.sanitize(item.description),
							date: item.pubdate ? new Date(item.pubdate) : new Date(),
							read: false
						}, function(err, newDoc) { if (err) throw err; });
					}
				});
			});

			readers.push(reader);
		}
	});

	setInterval(read_feeds, 30000);
}

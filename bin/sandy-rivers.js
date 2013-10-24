#!/usr/bin/env node

var FeedSub = require('feedsub'),
    MongoClient = require('mongodb').MongoClient,
    sanitizer = require('sanitizer');

console.log("Starting Sandy Rivers");

MongoClient.connect('mongodb://127.0.0.1:27017/sandy_rivers', function(err, db) {
	if (err) throw err;

	var feed_coll = db.collection('feeds');
	var item_coll = db.collection('entries');

	item_coll.ensureIndex({ date: -1 }, function(err) {
		if (err) throw err;
	});

	feed_coll.find().toArray(function(err, results) {
		if (err) throw err;

		for (var i = 0; i < results.length; i++) {
			console.log("Fetching feeds for "+results[i]._id);
			var reader = new FeedSub(results[i].url, {
				interval: 10,
				autoStart: true,
				emitOnStart: true
			});

			var index = 0;

			reader.on('item', function(item) {
				item_coll.update(
					{ _id: item.link },
					{
						$set: {
							title: item.title,
							description: sanitizer.sanitize(item.description),
							date: item.pubdate ? new Date(item.pubdate) : new Date()
						}
					},
					{ upsert: true },
					function(err) { if (err) throw err }
				);
			});
		}
	});
});

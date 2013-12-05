function ViewModel() {
	var self = this;

	self.reading = ko.observable('unread');

	self.entries = ko.observableArray([]);

	self.hidden = ko.observable({});

	self.current_entry = ko.observable(-1);

	self.feeds = ko.observableArray([]);

	self.load_entries = function(type) {
		console.log("Loading entries");
		self.reading(type);
		$.ajax({
			url: '/entries/'+type,
			type: 'GET',
			success: function(data) {
				self.entries(data.entries);
			}
		});
	};

	self.mark_as_read = function(index) {
		//whatever
	};

	self.hide = function(index, bool) {
		self.hidden()[index] = bool;
	};

	self.toggle_entry = function(index, event, entry) {
		if (self.current_entry() === index) {
			self.current_entry(-1);
			//self.entries.splice(index, 1);
		} else {
			self.current_entry(index);
		}
	};

	self.show_feeds = function() {
		$.ajax({
			url: '/feeds',
			type: 'GET',
			success: function(data) {
				self.feeds(data.feeds);
				$('#manage_feeds').modal();
			}
		});
	};

	self.add_feed = function() {
		$.ajax({
			url: '/feeds',
			type: 'POST',
			data: JSON.stringify({
				name: $('#feed_name').val(),
				url: $('#feed_url').val()
			}),
			success: function(data) {
				self.show_feeds();
				$('#tabs a:first').tab('show');
			}
		});
	};

	return self;
}

$(function() {
	console.log("Welcome to Sandy Rivers");

	$.ajaxSetup({
		dataType: 'json',
		contentType: 'application/json',
		processData: false
	});

	var vm = new ViewModel();

	ko.applyBindings(vm);

	jwerty.key('x', function() {
		var current = vm.current_entry();
		if (current < vm.entries().length) {
			vm.mark_as_read(current);
			vm.hide(current, true);
			vm.current_entry(current + 1);
		}
	});

	jwerty.key('z', function() {
		var current = vm.current_entry();
		var new_current = current - 1;
		if (current >= -1) {
			if (current >= 0) { vm.mark_as_read(current); }
			vm.hide(new_current, false);
			vm.current_entry(current - 1);
		}
	});

	jwerty.key('c', function() {
		var current = vm.current_entry();
		if (current >= 0 && current < vm.entries().length) {
			window.open(vm.entries()[current].url, '_blank');
		}
	});

	vm.load_entries('unread');
});

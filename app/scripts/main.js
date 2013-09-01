$(function() {
	console.log("Welcome to Sandy Rivers");

	var vm = new viewModel();

	ko.applyBindings(vm);

	jwerty.key('x', function() {
		var current = vm.current_entry();
		if (current < vm.entries().length) {
			vm.mark_as_read(current);
			vm.current_entry(current + 1);
		}
	});

	jwerty.key('z', function() {
		var current = vm.current_entry();
		if (current >= -1) {
			if (current >= 0) vm.mark_as_read(current);
			vm.current_entry(current - 1);
		}
	});

	jwerty.key('c', function() {
		var current = vm.current_entry();
		if (current >= 0 && current < vm.entries().length)
			window.open(vm.entries()[current]._id, '_blank');
	});

	vm.load_entries();
});

function viewModel() {
	var self = this;

	self.entries = ko.observableArray([]);

	self.current_entry = ko.observable(-1);

	self.load_entries = function() {
		console.log("Loading entries");
		$.ajax({
			url: 'http://localhost:3000/entries',
			type: 'GET',
			success: function(data) {
				self.entries(data.entries);
			}
		});
	};

	self.mark_as_read = function(index) {
		//whatever
	};

	self.toggle_entry = function(index, event, entry) {
		if (self.current_entry() == index) {
			self.current_entry(-1);
			//self.entries.splice(index, 1);
		} else {
			self.current_entry(index);
		}
	};

	return self;
}
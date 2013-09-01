$(function() {
	console.log("Welcome to Sandy Rivers");

	var vm = new viewModel();

	ko.applyBindings(vm);

	vm.load_entries();
});

function viewModel() {
	var self = this;

	self.entries = ko.observableArray([]);

	self.current_entry = ko.observable('');

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

	self.toggle_entry = function(entry) {
		if (self.current_entry() == entry._id) {
			self.current_entry('');
			self.entries.remove(entry);
		} else {
			self.current_entry(entry._id);
		}
	};

	return self;
}
import { Events } from '../../imports/api/events.js';

window.Events = Events;

Template.eventsPage.onCreated(function eventsPageOnCreated() {
	Meteor.subscribe('events');
	Template.instance().attendeesText = new ReactiveVar("");
});

Template.eventsPage.helpers({
	events() {
		return Events.find({});
	},
	attendeesText() {
		return Template.instance().attendeesText.get();
	}
});

Template.eventsPage.events({
	'change .inputfile':function(e) {
		e.preventDefault();
		var f = new FileReader();
		var i = Template.instance();
		i.attendeesText.set("");
		f.onload = function(result) {
			i.attendeesText.set(result.target.result);
		};
		f.readAsText(e.target.files[0]);
	},
	'submit .form': function(event) {
		event.preventDefault();
		// "name,company\n" is included so the objects have the correct keys.
		attendees = csvToArray("name,company\n" + event.target.attendees.value, ',');
		console.log(attendees);
		Meteor.call('insertEventCSV', event.target.name.value, event.target.tables.value, event.target.seats.value, event.target.days.value, attendees);
	},
	'click .btn-danger': function() {
		Meteor.call('deleteEvent', this._id);
	}
});

export function cooper() {
	console.log("cooper");
}
import { Events } from '../../imports/api/events.js';

window.Events = Events;

Template.eventsPage.onCreated(function eventsPageOnCreated() {
	Meteor.subscribe('events');
	Template.instance().attendeesText = new ReactiveVar("");
	Template.instance().nameWarningLabelClass = new ReactiveVar("warningLabelInvisible");
});

Template.eventsPage.helpers({
	events() {
		return Events.find({});
	},
	attendeesText() {
		return Template.instance().attendeesText.get();
	},
	nameWarningLabelClass() {
		console.log(Template.instance().nameWarningLabelClass.get());
		return Template.instance().nameWarningLabelClass.get();
	}
});

function markInputInvalid(input, id) {
	if (input.value == "") {
		input.setAttribute("style", "border-color: #FF0000;");
		document.getElementById(id).className = "warningLabelVisible";
	} else {
		markInputValid(input, id);
	}
}

function markInputValid(input, id) {
	input.setAttribute("style", "border-color: #CCC");
	document.getElementById(id).className = "warningLabelInvisible";
}

Template.eventsPage.events({
	'focus .form-control':function(e) {
		markInputValid(e.target, e.target.id + "Warning");
	},
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
		Meteor.call('insertEventCSV', event.target.name.value, event.target.tables.value, event.target.seats.value, event.target.days.value, attendees, function(error, result) {
			markInputInvalid(event.target.name, "nameWarning");
			markInputInvalid(event.target.tables, "tablesWarning");
			markInputInvalid(event.target.seats, "seatsWarning");
			markInputInvalid(event.target.days, "daysWarning");
			markInputInvalid(event.target.attendees, "attendeesWarning");
			console.log(error);
		});
	},
	'click .btn-danger': function() {
		Meteor.call('deleteEvent', this._id);
	}
});

export function cooper() {
	console.log("cooper");
}
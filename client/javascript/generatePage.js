import { Events } from '../../imports/api/events.js';
import { calculateSeatingArrangements } from '../algorithm.js';
import { calculateSeatingArrangementsForArrays } from '../algorithm.js';

Template.generatePage.onCreated(function() {
	this.tables = new ReactiveVar([]);
	Meteor.subscribe('events');
});

Template.generatePage.helpers({
	tables() {
		return Template.instance().tables.get();
	},
	events() {
		return Events.find({});
	}
});

function calculateSeatingArrangementsForEvents(eventObjects) {
	var eventObject 	= eventObjects[0];
	const numberOfDays	= eventObject["days"];
	const tableCount 	= eventObject["tables"];
	const seatCount 	= eventObject["seats"];
	var tables 			= [];
	var students 		= [];
	var i = 0;
	for (i = 0; i < tableCount; i++) {
		tables.push({
			table:"Table " + (i + 1),
			seats:seatCount,
			students:[]
		});
	}
	i = 0;
	for (i = 0; i < eventObject["attendees"].length; i++) {
		students.push({
			name:eventObject["attendees"][i].name,
			company:eventObject["attendees"][i].company,
			studentsSatWith:[]
		});
	}
	return calculateSeatingArrangementsForArrays(numberOfDays, tables, students);
}

Template.generatePage.events({
	'submit .form-horizontal': function(e) {
		e.preventDefault();
		const target = e.target;
		
		if (target.name == "daysForm") {
			const days = target.text.value
			const result = calculateSeatingArrangements(days);
			console.log(result);
			Template.instance().tables.set(result);
		} else if (target.name == "eventsForm") {
			const eventObjects = Events.find({name:target.Events.value}).fetch();
			var result = calculateSeatingArrangementsForEvents(eventObjects);
			console.log(result);
			Template.instance().tables.set(result);
		}
	}
});
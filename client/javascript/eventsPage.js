import { Events } from '../../imports/api/events.js';
import { calculateSeatingArrangementsForArrays } from '../algorithm.js';

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

function markCSVInvalid(input) {
	input.setAttribute("style", "border-color: #FF0000");
	document.getElementById("attendeesMissingWarning").className = "warningLabelVisible";
}

function markCSVValid(input) {
	input.setAttribute("style", "border-color: #CCC");
	document.getElementById("attendeesMissingWarning").className = "warningLabelInvisible";
}

function calculateSeatingArrangementsForEvents(numberOfDays, tableCount, seatCount, attendees) {
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
	/*
	for (i = 0; i < eventObject["attendees"].length; i++) {
		students.push({
			name:eventObject["attendees"][i].name,
			company:eventObject["attendees"][i].company,
			studentsSatWith:[]
		});
	}*/
	students = attendees.map((a) => {
		a.studentsSatWith = [];
		return a;
	});
	return calculateSeatingArrangementsForArrays(numberOfDays, tables, students);
}

Template.eventsPage.events({
	'focus .form-control':function(e) {
		markInputValid(e.target, e.target.id + "Warning");
		if (e.target.id == "attendees") {
			markCSVValid(e.target);
		}
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
		var attendeesValidated = true;
		attendees = csvToArray("name,company\n" + event.target.attendees.value, ',');
		for (i in attendees) {
			var attendee = attendees[i];
			if (!attendee.hasOwnProperty("name") || !attendee.hasOwnProperty("company")) {
				markCSVInvalid(event.target.attendees);
				attendeesValidated = false;
				break;
			}
		}
		markInputInvalid(event.target.name, "nameWarning");
		markInputInvalid(event.target.tables, "tablesWarning");
		markInputInvalid(event.target.seats, "seatsWarning");
		markInputInvalid(event.target.days, "daysWarning");
		
		if (!attendeesValidated) {
			//We don't want to insert anything into the database if the
			//csv data is malformatted, but it's ok if the other data is
			//missing because meteor will catch that for us.
			return;
		} else if (event.target.attendees.value == "") {
			//If the attendees don't pass validation, this might
			//overwrite the error message, so we don't call it if
			//the attendees fail to validate.
			markInputInvalid(event.target.attendees, "attendeesWarning");
			return;
		}
		var name 	= event.target.name.value;
		var tables 	= event.target.tables.value;
		var seats 	= event.target.seats.value;
		var days 	= event.target.days.value;
		
		var tablesArray = calculateSeatingArrangementsForEvents(days, tables, seats, attendees);
		console.log(tablesArray);
		tablesArray = tablesArray.map((table, index) => {
			var arr = ["Day " + index, ""];
			for (i in table.array) {
				for (j in table.array[i].students) {
					arr.push(table.array[i].students[j].name);
				}
				arr.push(" ");
			}
			return arr;
		});
		/*
		Meteor.call('insertEventCSV', event.target.name.value, event.target.tables.value, event.target.seats.value, event.target.days.value, attendees, function(error, result) {
			console.log(error);
		});
		*/
		var fields = ["Day", ""];
		for (var i = 0; i < tables; i++) {
			fields.push("Table " + (i + 1));
			for (var j = 0; j < seats; j++) {
				fields.push("");
			}
		}
		var data = {
			data: tablesArray,
			fields: fields
		}
		console.log(data);
		let csv = Papa.unparse(data);
		csv = new Blob([csv], { type: 'text/csv' } );
		saveAs(csv, name + ".csv");
	},
	'click .btn-danger': function() {
		Meteor.call('deleteEvent', this._id);
	}

});

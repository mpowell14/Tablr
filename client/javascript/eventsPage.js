import { calculateSeatingArrangementsForArrays } from '../algorithm.js';

function downloadCSV(name, data) {
	let csv = Papa.unparse(data);
	csv = new Blob([csv], { type: 'text/csv' } );
	saveAs(csv, name + ".csv");
}

Template.eventsPage.onCreated(function eventsPageOnCreated() {
	Meteor.subscribe('events');
	Template.instance().attendeesText = new ReactiveVar("");
	Template.instance().nameWarningLabelClass = new ReactiveVar("warningLabelInvisible");
	Template.instance().tablesErrorText = new ReactiveVar("Error: Tables is required.");
	Template.instance().seatsErrorText = new ReactiveVar("Error: Seats is required.");
	Template.instance().daysErrorText = new ReactiveVar("Error: Days is required.");
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
	},
	tablesErrorText() {
		return Template.instance().tablesErrorText.get();
	},
	seatsErrorText() {
		return Template.instance().seatsErrorText.get();
	},
	daysErrorText() {
		return Template.instance().daysErrorText.get();
	},
});

function markInputInvalid(input, id) {
	
	if (input.value == "" || (input.type == "number" && input.value <= 0)) {
		input.setAttribute("style", "border-color: #FF0000;");
		document.getElementById(id).className = "warningLabelVisible";
		if (input.type == "number" && input.value <= 0) {
			Template.instance().tablesErrorText.set("Error: Tables must be positive.");
		} else {
			Template.instance().tablesErrorText.set("Error: Tables is required.");
		}
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
		var attendeesValue = event.target.attendees.value;
		if (event.target.attendees.value.substring(0, 12) != "name,company") {
			//The CSV parser assumes the top row is the column names,
			//so if they aren't, we have to manually insert them.
			attendeesValue = "name,company\n" + attendeesValue;
		}
		attendees = csvToArray(attendeesValue, ',');
		var nameCount = 0;
		var companyCount = 0;
		for (i in attendees) {
			var attendee = attendees[i];
			if (attendee.hasOwnProperty("name")) {
				nameCount++;
			}
			//We check for an empty string because that should
			//catch errant commas at the end of lines.
			if (attendee.hasOwnProperty("company") && attendee.company != "") {
				companyCount++;
			} else {
				//We insert a company because the algorithm expects
				//one. If all attendees' companies are the same, it
				//doesn't affect the algorithm. We keep track of who
				//had an assigned company (rather than us manually
				//setting it to "none"), and if there are no companies,
				//we use the dummy values, but if there are some companies
				//missing and some there, we know the CSV is malformed.
				attendee.company = "none";
			}
			// if (!attendee.hasOwnProperty("name") || !attendee.hasOwnProperty("company")) {
				// markCSVInvalid(event.target.attendees);
				// attendeesValidated = false;
				// break;
			// }
		}
		
		markInputInvalid(event.target.name, "nameWarning");
		markInputInvalid(event.target.tables, "tablesWarning");
		markInputInvalid(event.target.seats, "seatsWarning");
		markInputInvalid(event.target.days, "daysWarning");
		
		if (!attendeesValidated) {
			//We don't want to insert anything into the database if the
			//csv data is malformatted, but it's ok if the other data is
			//missing because meteor will catch that for us.
			markCSVInvalid(event.target.attendees, "attendeesWarning");
			return;
		} else if (nameCount != attendees.length) {
			markCSVInvalid(event.target.attendees);
			return;
		} else if (nameCount != companyCount && companyCount != 0) {
			markCSVInvalid(event.target.attendees);
			return;
		} else if (event.target.attendees.value == "") {
			//If the attendees don't pass validation, this might
			//overwrite the error message, so we don't call it if
			//the attendees fail to validate.
			markInputInvalid(event.target.attendees, "attendeesWarning");
			return;
		} else if (event.target.name.value == "") {
			return;
		} else if (event.target.tables.value == "") {
			return;
		} else if (event.target.seats.value == "") {
			return;
		} else if (event.target.days.value == "") {
			return;
		}
		
		var name 	= event.target.name.value;
		var tables 	= event.target.tables.value;
		var seats 	= event.target.seats.value;
		var days 	= event.target.days.value;
		
		if (tables <= 0) {
			return;
		} else if (seats <= 0) {
			return;
		} else if (days <= 0) {
			return;
		}
		
		if (attendees.length > tables * seats) {
			alert("Error: The number of attendees (" + attendees.length + ") is greater than the total number of seats (" + (tables * seats) + ").");
			return;
		}
		
		var tablesArray = calculateSeatingArrangementsForEvents(days, tables, seats, attendees);
		console.log(tablesArray);
		tablesArray = tablesArray.map((table, index) => {
			var arr = ["Day " + (index + 1), ""];
			for (i in table.array) {
				for (j in table.array[i].students) {
					arr.push(table.array[i].students[j].name);
				}
				//Insert empty spaces if there
				//are not enough students to fill
				//all the seats
				while (j < seats - 1) {
					arr.push("");
					j++;
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
		downloadCSV(name, data);
	},
	'click #downloadCSVButton': function() {
		var data = {
			data: [],
			fields: ["name", "company"]
		}
		downloadCSV("Attendees", data);
	}

});

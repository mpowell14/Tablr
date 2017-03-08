import { calculateSeatingArrangementsForArrays } from '../algorithm.js';

Template.eventsPage.onCreated(function eventsPageOnCreated() {
	Meteor.subscribe('events');
	Template.instance().attendeesText = new ReactiveVar("");
	Template.instance().nameWarningLabelClass = new ReactiveVar("warningLabelInvisible");
    Template.instance().usingCompany = new ReactiveVar(true);
});

Template.eventsPage.helpers({
	events() {
		return Events.find({});
	},
	attendeesText() {
		return Template.instance().attendeesText.get();
	},
	nameWarningLabelClass() {
		return Template.instance().nameWarningLabelClass.get();
	}
});

function markInputInvalid(input, id) {
	if (input.value == "") {
		input.setAttribute("style", "border-color: #FF0000;");
		document.getElementById(id).className = "warningLabelVisible";
        return true;
	} else {
		markInputValid(input, id);
        return false;
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

function validateCSVInput(attendeesCSV, includeCompany) {
    let attendees = attendeesCSV.split("\n");
    for (var i in attendees) {
        if (includeCompany) {
            if (!/\s*.+\s*,\s*.+\s*/.test(attendees[i])) {
                return i;
            }
        } else {
            if (!/\s*.+\s*/.test(attendees[i])) {
                return i;
            }
        }
    }
    return -1;
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
	students = attendees.map((a) => {
		a.studentsSatWith = [];
		return a;
	});
	return calculateSeatingArrangementsForArrays(numberOfDays, tables, students);
}

Template.eventsPage.helpers({
    'companyButtonText':function() {
        if (Template.instance().usingCompany.get()) {
            return "Include Company";
        } else {
            return "No Company";
        }
    },
    'attendeesPlaceholder':function() {
        if (Template.instance().usingCompany.get()) {
            return "name of person,name of company";
        } else {
            return "name of person";
        }
    },
    'attendeesMissingWarning':function() {
        if (Template.instance().usingCompany.get()) {
            return " and a company";
        } else {
            return "";
        }
    }
});

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
        let attendees = [];
		var attendeesValidated = true;
        if (Template.instance().usingCompany.get()) {
    		attendees = csvToArray("name,company\n" + event.target.attendees.value, ',');
        } else {
    		attendees = csvToArray("name\n" + event.target.attendees.value, ',');
            attendees = attendees.map((a) => {
                return {
                    name: a.name,
                    //Add a dummy company so the algorithm still works,
                    //but ignores the company field (because everyone
                    //has the same company, so it doesn't affect anything).
                    company: ""
                }
            });
        }
        let validated = validateCSVInput(event.target.attendees.value, Template.instance().usingCompany.get());
        if (validated != -1) {
            markCSVInvalid(event.target.attendees);
            attendeesValidated = false;
        } else {
            attendeesValidated = true;
        }

        let isInvalid = false;
		isInvalid = markInputInvalid(event.target.name, "nameWarning") || isInvalid;
		isInvalid = markInputInvalid(event.target.tables, "tablesWarning") || isInvalid;
		isInvalid = markInputInvalid(event.target.seats, "seatsWarning") || isInvalid;
		isInvalid = markInputInvalid(event.target.days, "daysWarning") || isInvalid;

		if (!attendeesValidated || isInvalid) {
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
		tablesArray = tablesArray.map((table, index) => {
			var arr = ["Day " + (index + 1), ""];
			for (i in table.array) {
				for (j in table.array[i].students) {
					arr.push(table.array[i].students[j].name);
				}
				arr.push(" ");
			}
			return arr;
		});
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
		let csv = Papa.unparse(data);
		csv = new Blob([csv], { type: 'text/csv' } );
		saveAs(csv, name + ".csv");
	},
	'click .companyToggle':function(event) {
        Template.instance().usingCompany.set(!Template.instance().usingCompany.get());
    }

});

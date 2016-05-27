import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Events } from '../imports/api/events.js';
import { Accounts } from 'meteor/accounts-base';

EventCSVSchema = new SimpleSchema({
		name: {
		type: String,
		label: "Name",
	},
	tables: {
		type: Number,
		label: "Number of Tables"
	},
	seats: {
		type: Number,
		label: "Seats per Table"
	},
	days: {
		type: Number,
		label: "Number of Days"
	},
	attendees: {
		type: String,
		label: "Attendees"
	}
});

Meteor.startup(() => {
	
	Meteor.methods({
		insertEventCSV: function(name, tables, seats, days, attendees) {
			Events.insert({
				name: name,
				tables: tables,
				seats: seats,
				days: days,
				attendees: attendees
			});
		},
		deleteEvent: function(id) {
			Events.remove(id);
		}
	});

	Meteor.publish('events', function eventsPublication() {
		return Events.find({
			$or: [
				{ owner: this.userId }
			]
		});
	});

	Events.allow({
		'insert': function(userId, doc) {
			return !!userId;
		}
	});

})

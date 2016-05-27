import { Mongo } from 'meteor/mongo';

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

import { Mongo } from 'meteor/mongo';

export const Events = new Mongo.Collection('events');
EventsSchema = new SimpleSchema({
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
	"attendees.$.name": {
		type: String,
		label: "Name"
	},
	"attendees.$.company": {
		type: String,
		label: "Company"
	},

	owner: {
		type:String,
		autoValue:function() {
			return Meteor.userId();
		},
		autoform:{
			type:"hidden",
			label: false
		}
	},
	username: {
		type:String,
		autoValue:function() {
			return Meteor.user().username;
		},
		autoform:{
			type:"hidden",
			label: false
		}
	}
});
Events.attachSchema(EventsSchema);
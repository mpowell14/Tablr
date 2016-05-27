
FlowRouter.route('/', {
	name: 'home',
	action() {
		BlazeLayout.render('navbar', {main: 'home'});
	}
});

FlowRouter.route('/events', {
	name: 'events',
	action() {
		if (!!Meteor.userId()) {
			BlazeLayout.render('navbar', {main: 'eventsPage'});
		} else {
			BlazeLayout.render('navbar', {main: 'home'});
		}
	}
});

FlowRouter.route('/generate', {
	name: 'generate',
	action() {
		if (!!Meteor.userId()) {
			BlazeLayout.render('navbar', {main: 'generatePage'});
		} else {
			BlazeLayout.render('navbar', {main: 'home'});
		}
	}
});
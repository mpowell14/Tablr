FlowRouter.route('/', {
	name: 'home',
	action() {
		// BlazeLayout.render('navbar', {main: 'eventsPage'});
        BlazeLayout.render('eventsPage');
	}
});

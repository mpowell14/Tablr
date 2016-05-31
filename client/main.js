import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Events } from '../imports/api/events.js';
import './main.css';
import './main.html';
import '../imports/startup/accounts-config.js';

UI.registerHelper('equals', function(a, b) {
	return a === b;
});
UI.registerHelper('add', (a, b) => {
	return a + b;
});

Accounts.onLogin(function() {
	FlowRouter.go('events');
});
Accounts.onLogout(function() {
	FlowRouter.go('home');
});

window.Events 	= Events;
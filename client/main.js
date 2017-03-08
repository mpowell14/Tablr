import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

UI.registerHelper('equals', function(a, b) {
	return a === b;
});
UI.registerHelper('add', (a, b) => {
	return a + b;
});

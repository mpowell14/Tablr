Template.instructions.onCreated(function() {
	Template.instance().visible = new ReactiveVar(false);
});

Template.instructions.helpers({
	'buttonText':function() {
		return Template.instance().visible.get() ? "Hide" : "Show";
	},
	'visible':function() {
		return Template.instance().visible.get();
	}
});

Template.instructions.events({
	'click #showButton':function(event) {
		Template.instance().visible.set(!Template.instance().visible.get());
	}
});
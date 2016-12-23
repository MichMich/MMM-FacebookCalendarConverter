/* Magic Mirror
 * Module: MMM-FacebookCalendarConverter
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-FacebookCalendarConverter", {
	defaults: {
		appId: "",
		appSecret: "",
		numberOfEvents: 100
	},

	start: function() {
		this.sendSocketNotification("CONFIG", this.config);
	}

});

// All magic is done in the node helper.
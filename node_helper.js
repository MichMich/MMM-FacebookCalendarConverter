/* MMM-FacebookCalendarConverter
 * Node Helper
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var FB = require("fb")
var moment = require("moment")

FB.options({version: "v2.8"});

module.exports = NodeHelper.create({
	config: {},

	start: function() {
		console.log(this.name + " is started!");
		var _this = this;
		_this.expressApp.get("/facebook-calendar/:page", function (req, res) {
			_this.fetchAccessToken(function() {
				_this.fetchEventsFromApiURL("/" + req.params.page  + "/events", function(events) {
					res.send(_this.convertToCalendar(events));
				})
			})
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "CONFIG") {
			this.config = payload;

			console.log(this.config);
		}
	},

	fetchAccessToken: function(callback) {
		var _this = this;
		FB.api("oauth/access_token", {
			client_id: _this.config.appId,
			client_secret: _this.config.appSecret,
			grant_type: "client_credentials"
		}, function (res) {
			if(!res || res.error) {
				console.log(!res ? "Error fetching access token: " : res.error);
				return;
			}

			FB.setAccessToken(res.access_token);
			callback();
		});
	},

	fetchEventsFromApiURL: function(url, callback) {
		FB.api(url, {limit:this.config.numberOfEvents || 25}, function (res) {
			if(!res || res.error) {
				console.log(!res ? "Error fetching events: " : res.error);
				return;
			}
			callback(res.data);
		});
	},

	convertToCalendar: function(events) {
		var calendarData;

		// Create header;
		calendarData = "BEGIN:VCALENDAR\n";
		calendarData += "VERSION:2.0\n";
		calendarData += "PRODID:-//magicmirror.builders/calendar//NONSGML v1.0//EN\n";
		calendarData += "X-PUBLISHED-TTL:PT12H\n";
		calendarData += "CALSCALE:GREGORIAN\n";
		calendarData += "METHOD:PUBLISH\n\n";


		events.forEach(function(event) {
			calendarData += "BEGIN:VEVENT\n";
			calendarData += "UID:" + event.id + "@facebook.com\n";

			calendarData += "DTSTAMP:" + moment(event.start_time).format("YYYYMMDDThhmmss") + "\n";
			calendarData += "DTSTART:" + moment(event.start_time).format("YYYYMMDDThhmmss") + "\n";
			if (event.end_time) {
				calendarData += "DTEND:" + moment(event.end_time).format("YYYYMMDDThhmmss") + "\n";
			}
			calendarData += "SUMMARY:" + event.name.replace(/,/g, "\\,") + "\n";
			calendarData += "URL:https://facebook.com/events/" + event.id + "\n";
			if (event.place) {
				calendarData += "LOCATION:" + event.place.name.replace(/,/g, "\\,") + "\n";
				if(event.place.location && event.place.location.latitude && event.place.location.longitude) {
					calendarData += "GEO:" + event.place.location.latitude + ";" + event.place.location.longitude + "\n";
				}
			}

			calendarData += "END:VEVENT\n";
			calendarData += "\n";
		});

		return calendarData;
	}

});
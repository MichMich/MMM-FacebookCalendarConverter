var FB = require("fb")
var moment = require("moment")

FB.options({version: "v2.8"});

var options = {
	appId: "760981867346269",
	appSecret: "421fa6d2a4b8c670b6037f78f12502cd",
	pageName: "DashBerlinOfficial1",
	numberOfEvents: 100
}


fetchAccessToken(function() {
	fetchEventsFromApiURL("/" + options.pageName  + "/events", function(events) {
		console.log(convertToCalendar(events));
	})
})


function fetchAccessToken(callback) {
	FB.api("oauth/access_token", {
		client_id: options.appId,
		client_secret: options.appSecret,
		grant_type: "client_credentials"
	}, function (res) {
		if(!res || res.error) {
			console.log(!res ? "Error fetching access token: " : res.error);
			return;
		}

		FB.setAccessToken(res.access_token);
		callback();
	});
}

function fetchEventsFromApiURL(url, callback) {
	FB.api(url, {limit:100}, function (res) {
		if(!res || res.error) {
			console.log(!res ? "Error fetching events: " : res.error);
			return;
		}
		callback(res.data);
	});
}

function convertToCalendar(events) {
	var calendarData;

	// Create header;
	calendarData = "BEGIN:VCALENDAR\n";
	calendarData += "VERSION:2.0\n";
	calendarData += "PRODID:-//magicmirror.builders/calendar//NONSGML v1.0//EN\n";
	calendarData += "X-WR-CALNAME:" + options.pageName + "\n";
	calendarData += "X-PUBLISHED-TTL:PT12H\n";
	calendarData += "X-ORIGINAL-URL:https://www.facebook.com/" + options.pageName + "/events\n";
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

		// console.log(event);
	});

	return calendarData;
}
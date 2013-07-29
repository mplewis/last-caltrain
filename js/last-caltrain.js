var weekdayData = '/data/origin_dest_weekdays.json';
var weekendData = '/data/origin_weekends.json';
var everythingDOM = '.everything';
var timeDisplayDOM = '.time-display';
var dateDisplayDOM = '.date-display';
var leaveTenseDOM = '.leave-tense';

var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

var now = new Date();

var friday          = new Date(2013, 06, 26, 19, 00, 00, 0);
var saturdayMorning = new Date(2013, 06, 27, 00, 30, 00, 0);
var saturday330am   = new Date(2013, 06, 27, 03, 30, 00, 0);
var saturday401am   = new Date(2013, 06, 27, 04, 01, 00, 0);
var saturday        = new Date(2013, 06, 27, 19, 00, 00, 0);
var sundayMorning   = new Date(2013, 06, 28, 00, 30, 00, 0);
var sunday          = new Date(2013, 06, 28, 19, 00, 00, 0);
var mondayMorning   = new Date(2013, 06, 29, 00, 30, 00, 0);
var monday          = new Date(2013, 06, 29, 19, 00, 00, 0);
var tuesdayMorning  = new Date(2013, 06, 30, 00, 30, 00, 0);

console.log(now);

var lookupDate = new Date(now.getTime());
if (lookupDate.getHours() < 4) {
    lookupDate.setDate(lookupDate.getDate() - 1);
}

var isWeekend = (lookupDate.getDay() == 0 || lookupDate.getDay() == 6);
var isSaturday = (lookupDate.getDay() == 6);

function setPageTextFromMinutes(minutesTotal) {
    var hours = Math.floor(minutesTotal / 60);
    var minutes = minutesTotal - (hours * 60);
    hours = hours % 24;
    var isPM = (hours >= 12);
    var isPMString = 'am';
    if (isPM) {
        isPMString = 'pm';
        hours = hours - 12;
    }
    var midnightModifier = 0;
    if (hours < 4) {
        hours = hours + 12;
        midnightModifier = 1;
    }
    var displayDate = new Date(lookupDate.getTime());
    displayDate.setDate(displayDate.getDate() + midnightModifier);
    var minsPad = '';
    if (minutes < 10)
        minsPad = '0';
    $(timeDisplayDOM).text(hours + ':' + minsPad + minutes + ' ' + isPMString);
    $(dateDisplayDOM).text(dayNames[displayDate.getDay() % 7] + ', ' +
                           monthNames[displayDate.getMonth()] + ' ' +
                           displayDate.getDate());
    if (now > lookupDate)
        $(leaveTenseDOM).text('left');
}

if (!isWeekend) {
    // get the weekday schedule
    $.getJSON(weekdayData, function(data) {
        southboundTimes = data.departure_time_minutes_past_midnight.southbound;
        var sfSouthMinsTotal = southboundTimes['San Francisco']['San Jose'];
        setPageTextFromMinutes(sfSouthMinsTotal);
    });
} else {
    // get the weekend schedule
    $.getJSON(weekendData, function(data) {
        if (isSaturday) {
            northboundTimes = data.departure_time_minutes_past_midnight.northbound.saturday;
            southboundTimes = data.departure_time_minutes_past_midnight.southbound.saturday;
        } else {
            // it's sunday
            northboundTimes = data.departure_time_minutes_past_midnight.northbound.sunday;
            southboundTimes = data.departure_time_minutes_past_midnight.southbound.sunday;
        }
        var sfSouthMinsTotal = southboundTimes['San Francisco'];
        setPageTextFromMinutes(sfSouthMinsTotal);
    });
}
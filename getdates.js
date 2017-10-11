//var tk = {
//  local: (name) => {
//    if (name === "%data") {
//      return "\"Gillian Chavez,Happy Gilmore,John Henry\",10,11,3,30,pm,musical_number_name\nPaige Hone,11,20,3,30,pm,musical_number_name";
//    }
//  },
//  global: (name) => {
//    if (name === "%CurrentText") {
//      return "0";
//    }
//  },
//  setGlobal: (name, value) => {
//    console.log(`${name}: ${value}`);
//  },
//  setLocal: (name, value) => {
//    console.log(`${name}: ${value}`);
//  },
//};

String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
  "use strict";
  var str = this.toString();
  if (arguments.length) {
    var t = typeof arguments[0];
    var key;
    var args = ("string" === t || "number" === t) ?
      Array.prototype.slice.call(arguments)
      : arguments[0];

    for (key in args) {
      str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
    }
  }
  return str;
};

// Return array of string values, or NULL if CSV string not well formed.
function csvToArray(text) {
  var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
  var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
  // Return NULL if input string is not well formed CSV string.
  if (!re_valid.test(text)) return null;
  var a = [];           // Initialize array to receive values.
  text.replace(re_value, // "Walk" the string using replace with callback.
    function(m0, m1, m2, m3) {
      // Remove backslash from \' in single quoted values.
      if    (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
      // Remove backslash from \" in double quoted values.
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
      else if (m3 !== undefined) a.push(m3);
      return ''; // Return empty string.
    });
  // Handle special case of empty last value.
  if (/,\s*$/.test(text)) a.push('');
  return a;
}

var buildNameStr = function(names) {
  var nameStr = "";
  for (var i = 0; i < names.length; i++) {
    if (i > 0 && i === names.length -1) {
      if (i === 1) {
        nameStr += " and ";
      } else {
        nameStr += ", and ";
      }
    }
    else if (i > 0) {
      nameStr += ", ";
    }
    nameStr += names[i];
  }
  return nameStr;
};

var getMessage = function(type) {
  var messages = {
    "lost_boy": "Hi, {name}. This is Reed Wilson from the Grove 9th Ward. I am wondering if you are available for a short visit tomorrow between 7 and 8 to get to know you.",
    "visit": "Hi, {name}. This is Reed Wilson from the ward. I am wondering if you are available for a short visit tomorrow between 7 and 8 to get to know you.",
    "game_night": "Does family game night work for everyone on Monday at 7:00?",
    "musical_number_confirm": "Hi, {name}. I am just doing a final check to see if you are still able to perform in Sacrament Meeting tomorrow?",
    "musical_number_name": "Hi, {name}. Do you know the name of the song you will be performing in Sacrament Meeting?",
  };
  switch(type) {
    case "lost_boy":
    case "visit":
    case "musical_number_confirm":
    case "musical_number_name":
      var nameStr = buildNameStr(arguments[1]);
      return messages[type].formatUnicorn({name: nameStr});
    case "game_night":
      return messages[type];
    default:
      return arguments[0];
  }
};

var now = new Date();

var data = tk.local("%data");
var lines = [];
lines = data.split("\n");
var num = parseInt(tk.global("%CurrentText"));
var line = lines[num];
tk.setGlobal("%CurrentText", num + 1);

var parts = csvToArray(line);
var namesStr = parts[0];
var names = [];
var firsts = [];
var lasts = [];
names = namesStr.split(",");
for (var i = 0; i < names.length; i++) {
  var nameparts = names[i].split(" ");
  firsts.push(nameparts[0]);
  lasts.push(nameparts[1]);
}

var now = new Date();
var nowMonth = now.getMonth() + 1;
var month = parseInt(parts[1]);
var diffMonth;
if (month < nowMonth) {
  diffMonth = month + 12 - nowMonth;
} else {
  diffMonth = month - nowMonth;
}

tk.setGlobal("%ScheduledNames", namesStr);
tk.setGlobal("%ScheduledDiffMonth", diffMonth-1);
tk.setGlobal("%ScheduledDate", parts[2]);
tk.setGlobal("%ScheduledHour", parts[3]);
tk.setGlobal("%ScheduledMinute", parts[4]);
tk.setGlobal("%ScheduledAmpm", parts[5]);
tk.setGlobal("%ScheduledMessage", getMessage(parts[6], firsts));

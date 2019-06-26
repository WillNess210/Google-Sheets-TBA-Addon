/*==============================================================================================================================================
  Custom functions built on top of ImportJSON to allow for easier TBA access via Google Sheets. All credit to ImportJSON goes to Trevor Lohrbeer
  Made by Will Ness of FRC 4944, The Hi Fives. If you have any questions or feature requests feel free to email me at: willness210@gmail.com
==============================================================================================================================================*/

//======IMPORTANT====== TBA Auth-Key (generated from https://www.thebluealliance.com/account) ======IMPORTANT======\\
var auth_key = "";


// FUNCTIONS RETURNING TEAM INFORMATION AT A SPECIFIC EVENT (number, name, location, etc..)
function tbaTeamsAtEvent(eventcode){
  return ImportJSON("https://www.thebluealliance.com/api/v3/event/" + eventcode + "/teams?X-TBA-Auth-Key=" + auth_key);
}
function tbaTeamsAtEventSimple(eventcode){
  return ImportJSON("https://www.thebluealliance.com/api/v3/event/" + eventcode + "/teams/simple?X-TBA-Auth-Key=" + auth_key);
}

// FUNCTION RETURNING TEAM STATUS AT AN EVENT (playoff status, rank, W/L)
function tbaTeamStatus(eventcode, teamnum){
  return ImportJSONForStatus("https://www.thebluealliance.com/api/v3/team/frc" + teamnum + "/event/" + eventcode + "/status?X-TBA-Auth-Key=" + auth_key);
}

// FUNCTION RETURNING TEAMS IN A MATCH (alliance should be red/blue)
function tbaTeamsOnAlliance(eventcode, matchcode, alliance){ // A1 A2 A3
  return ImportJSONForTeamsOnAlliance("https://www.thebluealliance.com/api/v3/match/" + eventcode + "_" + matchcode + "/simple?X-TBA-Auth-Key=" + auth_key, alliance);
}
function tbaTeamsInMatch(eventcode, matchcode){ // R1 R2 R3 B1 B2 B3
  return ImportJSONForTeamsInMatch("https://www.thebluealliance.com/api/v3/match/" + eventcode + "_" + matchcode + "/simple?X-TBA-Auth-Key=" + auth_key);
}

// FUNCTION RETURNING ALL MATCH INFORMATION AT AN EVENT
function tbaEventMatches(eventcode){
  return ImportJSONForEventMatches("https://www.thebluealliance.com/api/v3/event/" + eventcode + "/matches/simple?X-TBA-Auth-Key=" + auth_key);
}

// FUNCTION RETURNING ALL TEAMS AND THEIR RANKINGS AT AN EVENT
function tbaEventRankings(eventcode){
  return ImportJSONForEventRankings("https://www.thebluealliance.com/api/v3/event/" + eventcode + "/rankings?X-TBA-Auth-Key=" + auth_key);
}

// FUNCTION RETURNING PLAYOFF ALLIANCES AT AN EVENT
function tbaPlayoffAlliances(eventcode){
  return ImportJSONForPlayoffAlliances("https://www.thebluealliance.com/api/v3/event/" + eventcode + "/alliances?X-TBA-Auth-Key=" + auth_key);
}

// FUNCTION RETURNING PLAYOFF ALLIANCES & INFO AT EVENT
function tbaPlayoffInfo(eventcode){
  return ImportJSONForPlayoffInfo("https://www.thebluealliance.com/api/v3/event/" + eventcode + "/alliances?X-TBA-Auth-Key=" + auth_key);
}

// HELPER FUNCTIONS I BUILT IN --- you can ignore
function ImportJSONForStatus(url, query, options) { // ignore this, used for an above function
  var includeFunc = includeXPath_;
  var transformFunc = defaultTransform_;
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText()).overall_status_str.replaceAll("<b>", "").replaceAll("</b>", "");
  
  return parseJSONObject_(object, query, "noHeaders", includeFunc, transformFunc);
}

function ImportJSONForTeamsOnAlliance(url, alliance, query) { // ignore this, used for an above function
  var includeFunc = includeXPath_;
  var transformFunc = defaultTransform_;
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText()).alliances[alliance].team_keys
  var newObject = {};
  for(var i = 0; i < object.length; i++){
    newObject[i] = object[i].replace("frc", "");
  }
  
  return parseJSONObject_(newObject, query, "noHeaders", includeFunc, transformFunc);
}

function ImportJSONForTeamsInMatch(url, query) { // ignore this, used for an above function
  var includeFunc = includeXPath_;
  var transformFunc = defaultTransform_;
  var jsondata = UrlFetchApp.fetch(url);
  var als = ["red", "blue"];
  var newObject = {};
  var count = 0;
  for(var j = 0; j < als.length; j++){
    var object   = JSON.parse(jsondata.getContentText()).alliances[als[j]].team_keys
    for(var i = 0; i < object.length; i++){
      newObject[count++] = object[i].replace("frc", "");
    }
  }
  
  return parseJSONObject_(newObject, query, "noHeaders", includeFunc, transformFunc);
}

function ImportJSONForEventMatches(url, query, options) { // ignore this, used for an above function
  var als = ["red", "blue"];
  var includeFunc = includeXPath_;
  var transformFunc = defaultTransform_;
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  var newObject = [];
  for(var i = 0; i < object.length; i++){
    var matchInfo = object[i];
    var newMatchInfo = {};
    // key
    newMatchInfo.key = matchInfo.key;
    // adding team numbers
    for(var j = 0; j < als.length; j++){
      var al = als[j];
      for(var k = 0; k < matchInfo.alliances[al].team_keys.length; k++){
        var toAdd = matchInfo.alliances[al].team_keys[k].replace("frc", "");
        if(al == "red"){
          newMatchInfo[("R" + (k + 1))] = toAdd;
        }else{
          newMatchInfo[("B" + (k + 1))] = toAdd;
        }
      }
    }
    // adding scores
    newMatchInfo["Red Score"] = matchInfo.alliances.red.score;
    newMatchInfo["Blue Score"] = matchInfo.alliances.blue.score;
    // adding winner
    newMatchInfo["Winner"] = matchInfo.winning_alliance;
    // adding to array
    newObject.push(newMatchInfo);
  }
  return parseJSONObject_(newObject, query, "", includeFunc, transformFunc);
}

function ImportJSONForEventRankings(url, query, options){
  var includeFunc = includeXPath_;
  var transformFunc = defaultTransform_;
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText()).rankings;
  var newObject = [];
  for(var i = 0; i < object.length; i++){
    var teamObject = {};
    teamObject.rank = object[i].rank;
    teamObject.team_num = object[i].team_key.replace("frc", "");
    teamObject.total_rp = object[i].extra_stats[0];
    teamObject.matches_played = object[i].matches_played;
    teamObject.wins = object[i].record.wins == 0 ? "0" : object[i].record.wins;
    teamObject.losses = object[i].record.losses == 0 ? "0" : object[i].record.losses;
    teamObject.ties = object[i].record.ties == 0 ? "0" : object[i].record.ties;
    teamObject.WLT = teamObject.wins + "-" + teamObject.losses + "-" + teamObject.ties;
    newObject.push(teamObject);
  }
  return parseJSONObject_(newObject, query, "", includeFunc, transformFunc);
}

function ImportJSONForPlayoffAlliances(url, query, options){
  var includeFunc = includeXPath_;
  var transformFunc = defaultTransform_;
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  var newObject = [];
  var fourBots = false;
  for(var i = 0; i < object.length; i++){
    if(object[i].picks.length > 3){
      fourBots = true;
    }
  }
  for(var i = 0; i < object.length; i++){
    var allianceData = object[i];
    var newAllianceData = {};
    if(allianceData.name != null){
      newAllianceData.alliance_number = allianceData.name.split(" ")[1];
    }else{
      newAllianceData.alliance_number = (i + 1) + "";
    }
    newAllianceData.bot_1 = allianceData.picks[0].replace("frc", "");
    newAllianceData.bot_2 = allianceData.picks[1].replace("frc", "");
    newAllianceData.bot_3 = allianceData.picks[2].replace("frc", "");
    if(fourBots){
      if(allianceData.picks[3] != null){
        newAllianceData.bot_4 = allianceData.picks[3].replace("frc", "");
      }else{
        newAllianceData.bot_4 = " ";
      }
    }else if(allianceData.backup != null){
      newAllianceData.backup = allianceData.backup["in"].replace("frc", "");
      var outTeam = allianceData.backup.out.replace("frc", "");
      if(outTeam == newAllianceData.bot_1){
        newAllianceData.bot_1 += "*";
      }else if(outTeam == newAllianceData.bot_2){
        newAllianceData.bot_2 += "*";
      }else if(outTeam == newAllianceData.bot_3){
        newAllianceData.bot_3 += "*";
      }
    }else{
      newAllianceData.backup = " ";
    }
    newObject.push(newAllianceData);
  }
  return parseJSONObject_(newObject, query, "", includeFunc, transformFunc);
}

function ImportJSONForPlayoffInfo(url, query, options){
  var includeFunc = includeXPath_;
  var transformFunc = defaultTransform_;
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  var newObject = [];
  var fourBots = false;
  for(var i = 0; i < object.length; i++){
    if(object[i].picks.length > 3){
      fourBots = true;
    }
  }
  for(var i = 0; i < object.length; i++){
    var allianceData = object[i];
    var newAllianceData = {};
    if(allianceData.name != null){
      newAllianceData.alliance_number = allianceData.name.split(" ")[1];
    }else{
      newAllianceData.alliance_number = (i + 1) + "";
    }
    newAllianceData.bot_1 = allianceData.picks[0].replace("frc", "");
    newAllianceData.bot_2 = allianceData.picks[1].replace("frc", "");
    newAllianceData.bot_3 = allianceData.picks[2].replace("frc", "");
    if(fourBots){
      if(allianceData.picks[3] != null){
        newAllianceData.bot_4 = allianceData.picks[3].replace("frc", "");
      }else{
        newAllianceData.bot_4 = " ";
      }
    }else if(allianceData.backup != null){
      newAllianceData.backup = allianceData.backup["in"].replace("frc", "");
      var outTeam = allianceData.backup.out.replace("frc", "");
      if(outTeam == newAllianceData.bot_1){
        newAllianceData.bot_1 += "*";
      }else if(outTeam == newAllianceData.bot_2){
        newAllianceData.bot_2 += "*";
      }else if(outTeam == newAllianceData.bot_3){
        newAllianceData.bot_3 += "*";
      }
    }else{
      newAllianceData.backup = " ";
    }
    newAllianceData.status = allianceData.status.status;
    newAllianceData.level_of_play = allianceData.status.level;
    newAllianceData.current_wins = allianceData.status.current_level_record.wins > 0 ? allianceData.status.current_level_record.wins : "0";
    newAllianceData.current_losses = allianceData.status.current_level_record.losses > 0 ? allianceData.status.current_level_record.losses : "0";
    newAllianceData.current_ties = allianceData.status.current_level_record.ties > 0 ? allianceData.status.current_level_record.ties : "0";
    newObject.push(newAllianceData);
  }
  return parseJSONObject_(newObject, query, "", includeFunc, transformFunc);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/*====================================================================================================================================*
  ImportJSON by Trevor Lohrbeer (@FastFedora)
  ====================================================================================================================================
  Version:      1.1
  Project Page: http://blog.fastfedora.com/projects/import-json
  Copyright:    (c) 2012 by Trevor Lohrbeer
  License:      GNU General Public License, version 3 (GPL-3.0) 
                http://www.opensource.org/licenses/gpl-3.0.html
  ------------------------------------------------------------------------------------------------------------------------------------
  A library for importing JSON feeds into Google spreadsheets. Functions include:
     ImportJSON            For use by end users to import a JSON feed from a URL 
     ImportJSONAdvanced    For use by script developers to easily extend the functionality of this library
  Future enhancements may include:
   - Support for a real XPath like syntax similar to ImportXML for the query parameter
   - Support for OAuth authenticated APIs
  Or feel free to write these and add on to the library yourself!
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  1.1    Added support for the noHeaders option
  1.0    Initial release
 *====================================================================================================================================*/
/**
 * Imports a JSON feed and returns the results to be inserted into a Google Spreadsheet. The JSON feed is flattened to create 
 * a two-dimensional array. The first row contains the headers, with each column header indicating the path to that data in 
 * the JSON feed. The remaining rows contain the data. 
 * 
 * By default, data gets transformed so it looks more like a normal data import. Specifically:
 *
 *   - Data from parent JSON elements gets inherited to their child elements, so rows representing child elements contain the values 
 *      of the rows representing their parent elements.
 *   - Values longer than 256 characters get truncated.
 *   - Headers have slashes converted to spaces, common prefixes removed and the resulting text converted to title case. 
 *
 * To change this behavior, pass in one of these values in the options parameter:
 *
 *    noInherit:     Don't inherit values from parent elements
 *    noTruncate:    Don't truncate values
 *    rawHeaders:    Don't prettify headers
 *    noHeaders:     Don't include headers, only the data
 *    debugLocation: Prepend each value with the row & column it belongs in
 *
 * For example:
 *
 *   =ImportJSON("http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?v=2&alt=json", "/feed/entry/title,/feed/entry/content",
 *               "noInherit,noTruncate,rawHeaders")
 * 
 * @param {url} the URL to a public JSON feed
 * @param {query} a comma-separated lists of paths to import. Any path starting with one of these paths gets imported.
 * @param {options} a comma-separated list of options that alter processing of the data
 *
 * @return a two-dimensional array containing the data, with the first row containing headers
 **/
function ImportJSON(url, query, options) {
  return ImportJSONAdvanced(url, query, options, includeXPath_, defaultTransform_);
}

/**
 * An advanced version of ImportJSON designed to be easily extended by a script. This version cannot be called from within a 
 * spreadsheet.
 *
 * Imports a JSON feed and returns the results to be inserted into a Google Spreadsheet. The JSON feed is flattened to create 
 * a two-dimensional array. The first row contains the headers, with each column header indicating the path to that data in 
 * the JSON feed. The remaining rows contain the data. 
 *
 * Use the include and transformation functions to determine what to include in the import and how to transform the data after it is
 * imported. 
 *
 * For example:
 *
 *   =ImportJSON("http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?v=2&alt=json", 
 *               "/feed/entry",
 *                function (query, path) { return path.indexOf(query) == 0; },
 *                function (data, row, column) { data[row][column] = data[row][column].toString().substr(0, 100); } )
 *
 * In this example, the import function checks to see if the path to the data being imported starts with the query. The transform 
 * function takes the data and truncates it. For more robust versions of these functions, see the internal code of this library.
 *
 * @param {url}           the URL to a public JSON feed
 * @param {query}         the query passed to the include function
 * @param {options}       a comma-separated list of options that may alter processing of the data
 * @param {includeFunc}   a function with the signature func(query, path, options) that returns true if the data element at the given path
 *                        should be included or false otherwise. 
 * @param {transformFunc} a function with the signature func(data, row, column, options) where data is a 2-dimensional array of the data 
 *                        and row & column are the current row and column being processed. Any return value is ignored. Note that row 0 
 *                        contains the headers for the data, so test for row==0 to process headers only.
 *
 * @return a two-dimensional array containing the data, with the first row containing headers
 **/
function ImportJSONAdvanced(url, query, options, includeFunc, transformFunc) {
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  
  return parseJSONObject_(object, query, options, includeFunc, transformFunc);
}

/** 
 * Encodes the given value to use within a URL.
 *
 * @param {value} the value to be encoded
 * 
 * @return the value encoded using URL percent-encoding
 */
function URLEncode(value) {
  return encodeURIComponent(value.toString());  
}

/** 
 * Parses a JSON object and returns a two-dimensional array containing the data of that object.
 */
function parseJSONObject_(object, query, options, includeFunc, transformFunc) {
  var headers = new Array();
  var data    = new Array();
  
  if (query && !Array.isArray(query) && query.toString().indexOf(",") != -1) {
    query = query.toString().split(",");
  }
  
  if (options) {
    options = options.toString().split(",");
  }
    
  parseData_(headers, data, "", 1, object, query, options, includeFunc);
  parseHeaders_(headers, data);
  transformData_(data, options, transformFunc);
  
  return hasOption_(options, "noHeaders") ? (data.length > 1 ? data.slice(1) : new Array()) : data;
}

/** 
 * Parses the data contained within the given value and inserts it into the data two-dimensional array starting at the rowIndex. 
 * If the data is to be inserted into a new column, a new header is added to the headers array. The value can be an object, 
 * array or scalar value.
 *
 * If the value is an object, it's properties are iterated through and passed back into this function with the name of each 
 * property extending the path. For instance, if the object contains the property "entry" and the path passed in was "/feed",
 * this function is called with the value of the entry property and the path "/feed/entry".
 *
 * If the value is an array containing other arrays or objects, each element in the array is passed into this function with 
 * the rowIndex incremeneted for each element.
 *
 * If the value is an array containing only scalar values, those values are joined together and inserted into the data array as 
 * a single value.
 *
 * If the value is a scalar, the value is inserted directly into the data array.
 */
function parseData_(headers, data, path, rowIndex, value, query, options, includeFunc) {
  var dataInserted = false;
  
  if (isObject_(value)) {
    for (key in value) {
      if (parseData_(headers, data, path + "/" + key, rowIndex, value[key], query, options, includeFunc)) {
        dataInserted = true; 
      }
    }
  } else if (Array.isArray(value) && isObjectArray_(value)) {
    for (var i = 0; i < value.length; i++) {
      if (parseData_(headers, data, path, rowIndex, value[i], query, options, includeFunc)) {
        dataInserted = true;
        rowIndex++;
      }
    }
  } else if (!includeFunc || includeFunc(query, path, options)) {
    // Handle arrays containing only scalar values
    if (Array.isArray(value)) {
      value = value.join(); 
    }
    
    // Insert new row if one doesn't already exist
    if (!data[rowIndex]) {
      data[rowIndex] = new Array();
    }
    
    // Add a new header if one doesn't exist
    if (!headers[path] && headers[path] != 0) {
      headers[path] = Object.keys(headers).length;
    }
    
    // Insert the data
    data[rowIndex][headers[path]] = value;
    dataInserted = true;
  }
  
  return dataInserted;
}

/** 
 * Parses the headers array and inserts it into the first row of the data array.
 */
function parseHeaders_(headers, data) {
  data[0] = new Array();

  for (key in headers) {
    data[0][headers[key]] = key;
  }
}

/** 
 * Applies the transform function for each element in the data array, going through each column of each row.
 */
function transformData_(data, options, transformFunc) {
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      transformFunc(data, i, j, options);
    }
  }
}

/** 
 * Returns true if the given test value is an object; false otherwise.
 */
function isObject_(test) {
  return Object.prototype.toString.call(test) === '[object Object]';
}

/** 
 * Returns true if the given test value is an array containing at least one object; false otherwise.
 */
function isObjectArray_(test) {
  for (var i = 0; i < test.length; i++) {
    if (isObject_(test[i])) {
      return true; 
    }
  }  

  return false;
}

/** 
 * Returns true if the given query applies to the given path. 
 */
function includeXPath_(query, path, options) {
  if (!query) {
    return true; 
  } else if (Array.isArray(query)) {
    for (var i = 0; i < query.length; i++) {
      if (applyXPathRule_(query[i], path, options)) {
        return true; 
      }
    }  
  } else {
    return applyXPathRule_(query, path, options);
  }
  
  return false; 
};

/** 
 * Returns true if the rule applies to the given path. 
 */
function applyXPathRule_(rule, path, options) {
  return path.indexOf(rule) == 0; 
}

/** 
 * By default, this function transforms the value at the given row & column so it looks more like a normal data import. Specifically:
 *
 *   - Data from parent JSON elements gets inherited to their child elements, so rows representing child elements contain the values 
 *     of the rows representing their parent elements.
 *   - Values longer than 256 characters get truncated.
 *   - Values in row 0 (headers) have slashes converted to spaces, common prefixes removed and the resulting text converted to title 
*      case. 
 *
 * To change this behavior, pass in one of these values in the options parameter:
 *
 *    noInherit:     Don't inherit values from parent elements
 *    noTruncate:    Don't truncate values
 *    rawHeaders:    Don't prettify headers
 *    debugLocation: Prepend each value with the row & column it belongs in
 */
function defaultTransform_(data, row, column, options) {
  if (!data[row][column]) {
    if (row < 2 || hasOption_(options, "noInherit")) {
      data[row][column] = "";
    } else {
      data[row][column] = data[row-1][column];
    }
  } 

  if (!hasOption_(options, "rawHeaders") && row == 0) {
    if (column == 0 && data[row].length > 1) {
      removeCommonPrefixes_(data, row);  
    }
    
    data[row][column] = toTitleCase_(data[row][column].toString().replace(/[\/\_]/g, " "));
  }
  
  if (!hasOption_(options, "noTruncate") && data[row][column]) {
    data[row][column] = data[row][column].toString().substr(0, 256);
  }

  if (hasOption_(options, "debugLocation")) {
    data[row][column] = "[" + row + "," + column + "]" + data[row][column];
  }
}

/** 
 * If all the values in the given row share the same prefix, remove that prefix.
 */
function removeCommonPrefixes_(data, row) {
  var matchIndex = data[row][0].length;

  for (var i = 1; i < data[row].length; i++) {
    matchIndex = findEqualityEndpoint_(data[row][i-1], data[row][i], matchIndex);

    if (matchIndex == 0) {
      return;
    }
  }
  
  for (var i = 0; i < data[row].length; i++) {
    data[row][i] = data[row][i].substring(matchIndex, data[row][i].length);
  }
}

/** 
 * Locates the index where the two strings values stop being equal, stopping automatically at the stopAt index.
 */
function findEqualityEndpoint_(string1, string2, stopAt) {
  if (!string1 || !string2) {
    return -1; 
  }
  
  var maxEndpoint = Math.min(stopAt, string1.length, string2.length);
  
  for (var i = 0; i < maxEndpoint; i++) {
    if (string1.charAt(i) != string2.charAt(i)) {
      return i;
    }
  }
  
  return maxEndpoint;
}
  

/** 
 * Converts the text to title case.
 */
function toTitleCase_(text) {
  if (text == null) {
    return null;
  }
  
  return text.replace(/\w\S*/g, function(word) { return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase(); });
}

/** 
 * Returns true if the given set of options contains the given option.
 */
function hasOption_(options, option) {
  return options && options.indexOf(option) >= 0;
}

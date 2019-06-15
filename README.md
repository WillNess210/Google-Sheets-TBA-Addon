# Google-Sheets-TBA-Addon
A google script file that allows you to pull information from The Blue Alliance's V3 API using simple functions inside of Google Sheets.

How to install:

STEP 1 - Create a new google sheets doc and load in the google script
1. Go to your google drive and create a new blank google sheets (alternatively, open an existing one you'd like to start using these features in)
2. Once you're looking at the google sheet, click "Tools" on the navbar, then "Script Editor"
3. On the new tab that has opened up, paste all of the code that is in the Code.gs file in this GitHub repository
4. Click save (or CTRL + S) and give the project a name (Ex: "TBA Sheet Puller")
5. Keep this tab open and proceed to STEP 2 (skip to part 6 if you already have a TBA API Read Auth Key)

STEP 2 - Create your TBA Auth Key
1. Go to https://www.thebluealliance.com/
2. Under the "More" item on the top navigation bar, press Account
3. If you're not already logged in, log in or register (afterwards you should be on https://www.thebluealliance.com/account)
4. Scroll down to "Read API Keys", enter a name for your key in the Description box (ex: "My Google Sheets app!"), and click "Add New Key"
5. Copy your new key that appears below
6. Go to your open Google Script editor from STEP 1, and near the top on line 7 you will see: 'var auth_key = "" '. Paste your API key inside the quotes, and click/press save.

Examples located here: https://www.chiefdelphi.com/t/the-blue-alliance-api-google-sheets-addon/359332

### Working functions:  
=tbaTeamsAtEvent(eventcode)  
=tbaTeamsAtEventSimple(eventcode)  
=tbaTeamStatus(eventcode, teamnum)  
=tbaTeamsOnAlliance(eventcode, matchcode, alliance)  
=tbaTeamsInMatch(eventcode,matchcode)  
=tbaEventMatches(eventcode)  
=tbaEventRankings(eventcode)  

## Underlying API / JSON Importing was created by Trevor Lohrbeer.

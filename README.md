# Change Order Quantity
## **Intro**
This script is designed to take a spreadsheet containing a list of products that need new order quantity settings in DSF. It is part of a larger project, with many different types of scripts to perform different actions in DSF. See https://github.com/DSF-Automation-Scripts for more details.

## **Installation**
This script relies on the following libraries to work:
- [Puppeteer](https://pptr.dev/)
- [read-excel-file](https://www.npmjs.com/package/read-excel-file)
- [File System](https://nodejs.org/api/fs.html)

Installation of all libraries will be the same once Node js is installed. To install Node js, simply navigate to the [following website](https://nodejs.org/en/download/) and install the appropriate version of the installer. Afterwards, you should have a Node js console as an exe on your computer, and you can run node commands from it. To install different libraries, simply type "npm i \<library name\>." In order to install all these libraries, the following commands should be run:
- npm i puppeteer
- npm i read-excel-file
- npm i fs

After Node js and all three libraries are installed, you should be able to navigate into the directory of the downloaded code using the Node js console, and type "node ./run.js" to execute the script. 

## **Code Overview**
The code is broken into 3 main sections, with the last section repeated and being further broken into 4 sections. This code is written specifically for 4 different spreadsheets to be read in from 4 different companies. If you have less than this, you can delete sections of code not needed. If you have more, copy and paste the sections and change values as needed.

### **run.js**
The main body of code, where the entirety of the logic for the script is stored

#### **Dependents**
Importing the necessary code into the script.

1. puppeteer: The Google library being used to navigate the web
2. fs: Library used to write files
3. read-excel-file: Used to read in excel files, the format of information the script is coded for
4. constants: The script expects a file of constants which includes all element and file paths
5. credentials: The script also expects both a username and password to be provided in a seperate file (not included for security purposes)

Potential changes required: likely none, unless new libraries need to be used to add functionality

#### **Functions**
The functions used to assist the script

1. isNumeric: Checks if the character passed in is a numeric character or not
2. getMessageWithTime: Appends the current time to the beginning of a message, to prepare it to be logged
3. logToConsoleAndLog: Logs a message to both the log and to a non volatile text document
4. generateErrorLog: Updates the error log to be current

Potential changes required: likely none, unless new functions are needed to assist script updates

#### **Main Program**
The main logic the script will follow to perform a given task, further broken down into the following sections:

1. Setup Phase: In this phase, the script navigates to the DSF product page, and logs in using a pre provided account found in the credentials file. Nothing should be changed in this section, as any information that needs changing should be altered in the constants or credentials page. The only exception would be removing the chrome executable path parameters to the puppeteer launch phase to use chromium instead of Chrome
2. Acquire Info Phase: In this phase, the script pulls all of the information it needs from outside sources into local variables to be more readily accessible and easier to use. In it's current state, all information it is referencing is stored in an excel file. This section will likely need to be modified a moderate amount, since all information will likely be pulled in slightly differently. If information is being pulled in in a way other than an excel file, this section will need to be heavily modified
3. Search Phase: In this phase, the script parses through all of the pulled information and attempts to find the next product in DSF. It does this by keying both name and display as name, in order to ensure only one product result is found. In its current state, more than one product being found will flag the product, and it will be skipped
4. Execution Phase: In this phase, the script performs whatever action is desired on the product found in the last phase. In it's current state the script is navigating to the settings page, and changing the minimum and maximum order amounts, and the increment products must be ordered in.

### **constants.js**
Any constant that is used by the script. These should be documented well inside the code, but references are provided here for confusing elements just in case. This file will require moderate modification in the form of HTML element path's changing, and new constants being added. If an element doesn't seem to be working, it could be caused by a mismatch of paths. To find the path for an element, simply open the page it appears on, navigate to developer tools (usually F12 or ctrl + i) and find the element in the source. (there is usually an option to click on an element as well.) From here, simply right click on the element, go to copy, and select "copy selector." Paste this into the constants page with the desired identifier, and delete the "Document.querySelector" prefix that comes with copying paths. This will change the path Puppeteer looks for everywhere that path is referenced. Certain paths must be filled in before the script will work at all, namely URL, CHROME_PATH, LOG_PATH, ERROR_LOG_PATH, and SPREADSHEET_PATH

1. URL: The URL of the product page. Logging in directly to the product page allows a login to take the script directly where it needs to go to, without any extra redirects

### **credentials.js**
The script will look to this file to find the username and password to log in to DSF. Both will need to be changed before the script can work.

## Development Info
This script was developed by Max Ostenson while working at BYU Print and Mail. Any questions or bugs can be directed to max.ostenson@gmail.com
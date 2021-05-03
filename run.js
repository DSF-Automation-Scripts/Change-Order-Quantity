const constants = require("./constants");
const credentials = require("./credentials");
const puppeteer = require("puppeteer");
const fs = require("fs");
const readExcelFile = require("read-excel-file/node")

//Takes a message, and appends the time to the beginning
function getMessageWithTime(message) {
    let today = new Date();
    let date = today.getDay() + '/' + today.getMonth() + '/' + today.getFullYear() + ' ';
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    if(String(hours).length === 1) {
        date += ('0' + String(hours)) + ':';
    } else {
        date += hours + ':';
    }
    if(String(minutes).length === 1) {
        date += ('0' + String(minutes)) + ':';
    } else {
        date += minutes + ':';
    }
    if(String(seconds).length === 1) {
        date += ('0' + String(seconds)) + ": ";
    } else {
        date += seconds + ": ";
    }
    return date + message;
}

//Logs to both the console and to the text log
function logToConsoleAndLog(message) {
    console.log(message);
    fs.appendFile(constants.LOG_PATH, message + '\n', function (err) {
        if(err) throw err;
    })
}

//Checks if a given char is a number
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//Overwrites the current error log with an updated one
function generateErrorLog(errors) {
    let errorLog = "Failed attempts:" + '\n';
    for(let i = 0; i < errors.length; i++) {
        errorLog += errors[i] + '\n';
    }
    fs.writeFile(constants.ERROR_LOG_PATH, errorLog, (err) => {
        if(err) throw err;
    });
}

//Main function
async function run() {
    try {
    //Erase log file
    fs.writeFile(constants.LOG_PATH, "", (err) => {
        if(err) throw err;
    });
    
    //Launch Chrome and open a new page
    console.clear();
    logToConsoleAndLog("*** START LOG ***");
    logToConsoleAndLog(getMessageWithTime("Launching Chrome"));
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: constants.CHROME_PATH
    });
    const [page] = await browser.pages();

    //Go to site
    logToConsoleAndLog(getMessageWithTime("Navigating to " + constants.URL));
    await page.goto(constants.URL);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    //Login
    await page.click(constants.DSF_SHOW_ADVANCED_LOGIN_OPTIONS, {
        waitUntil: "networkidle0"
    });

    //Enter username and password
    await page.waitForSelector(constants.DSF_LOGIN_BUTTON);
    await page.type(constants.DSF_USERNAME_TEXT_BOX, credentials.USERNAME);
    await page.type(constants.DSF_PASSWORD_TEXT_BOX, credentials.PASSWORD);
    logToConsoleAndLog(getMessageWithTime("Logging in"));
    await page.click(constants.DSF_LOGIN_BUTTON);
    try {

        //If redirected, successful login
        await page.waitForSelector(constants.DSF_LOGIN_CHECK_ELEMENT, {timeout: 10000});
        logToConsoleAndLog(getMessageWithTime("Successfully logged in"))
    }
    catch (err) {

        //If not redirected, invalid credentials
        throw("loginError");
    }

    //Grab all data from spreadsheets
    //
    //Covenant spreadsheet
    let bookList = [];
    let failedAttempts = [];
    logToConsoleAndLog(getMessageWithTime("Reading in Covenant books"))
    await readExcelFile(constants.COV_SPREADSHEET_PATH).then((rows) =>{

        //Remove all rows prior to book table
        while(rows[0][0] === null) rows.shift();
        rows.shift();

        //Create book object (array)
        //Book array content is:
        //0: Title
        //1. ISBN
        for (let i = 0; i < rows.length; i++) {
            let book = [];

            //Grab title and format to be consistent
            let title = rows[i][constants.COV_SPREADSHEET_TITLE_INDEX].substring(3);

            //Check for spaces at beginning or end and remove
            while(title[0] === ' ') {
                title = title.substring(1);
            }
            while(title[title.length - 1] === ' ') {
                title = title.slice(0, -1);
            }

            //Check for book size at end of title and remove
            if(isNumeric(title[title.length - 1])) {
                while(isNumeric(title[title.length - 1]) || title[title.length - 1] === 'X' || title[title.length - 1] === 'x' || title[title.length - 1] === '.') {
                    title = title.slice(0, -1);
                }

                //Remove trailing space
                title = title.slice(0, -1);
            }

            //Create book object and add it to list of books to update
            book.push(title, rows[i][constants.COV_SPREADSHEET_ISBN_INDEX]);
            bookList.push(book);
        }
    });
    let numCovBooks = bookList.length;
    logToConsoleAndLog(getMessageWithTime("Read in " + numCovBooks + " books"));

    //Cedar Fort
    logToConsoleAndLog(getMessageWithTime("Reading in Cedar Fort books"))
    await readExcelFile(constants.CF_SPREADSHEET_PATH).then((rows) =>{

        //Remove all rows prior to book table
        while(rows[0][0] !== "ISBN") rows.shift();
        rows.shift();
        //Create book object (array)
        //Book array content is:
        //0: Title
        //1. ISBN
        for (let i = 0; i < rows.length; i++) {
            let book = [];

            //Grab title and format to be consistent
            let title = rows[i][constants.CF_SPREADSHEET_TITLE_INDEX];

            //Check if we successfully got a title
            if(title !== null) {

                //Check for un-needed info in parenthesis and remove
                if(title.indexOf('(') > 0 && isNumeric(title[title.indexOf('(') + 1])) {
                    title = title.substring(0, title.indexOf('('));
                }

                //Check for PREMIUM and remove indicator
                if(title.includes("PREMIUM")) {
                    title = title.substring(title.indexOf(' '))
                }
                
                //Check for spaces at beginning or end and remove
                while(title[0] === ' ') {
                    title = title.substring(1);
                }
                while(title[title.length - 1] === ' ') {
                    title = title.slice(0, -1);
                }

                //Create book object and add it to list of books to update
                book.push(title, rows[i][constants.CF_SPREADSHEET_ISBN_INDEX]);
                bookList.push(book);
            }
        }
    });
    let numCfBooks = bookList.length - numCovBooks;
    logToConsoleAndLog(getMessageWithTime("Read in " + numCfBooks + " books"));

    //Deseret Book Short Run
    logToConsoleAndLog(getMessageWithTime("Reading in Deseret Book short run books"));
    await readExcelFile(constants.DB_SPREADSHEET_PATH, { sheet: "Deseret Book SR | BYU Preflight"}).then((rows) =>{

        //Remove all rows prior to book table
        while(rows[0][0] !== "ISBN") rows.shift();
        rows.shift();
        //Create book object (array)
        //Book array content is:
        //0: Title
        //1. ISBN
        for (let i = 0; i < rows.length; i++) {
            let book = [];

            //Grab title and format to be consistent
            let title = rows[i][constants.DB_SR_SPREADSHEET_TITLE_INDEX];

            //Check if we successfully got a title
            if(title !== null) {
                
                //Check for spaces at beginning or end and remove
                while(title[0] === ' ') {
                    title = title.substring(1);
                }
                while(title[title.length - 1] === ' ') {
                    title = title.slice(0, -1);
                }

                //Create book object and add it to list of books to update
                book.push(title, rows[i][constants.DB_SR_SPREADSHEET_ISBN_INDEX]);
                bookList.push(book);
            }
        }
    });
    let numDbShortRunBooks = bookList.length - (numCovBooks + numCfBooks);
    logToConsoleAndLog(getMessageWithTime("Read in " + numDbShortRunBooks + " books"));

    //Deseret Book POD
    logToConsoleAndLog(getMessageWithTime("Reading in Deseret Book POD books"));
    await readExcelFile(constants.DB_SPREADSHEET_PATH, { sheet: "Deseret Book POD| BYU Preflight" }).then((rows) =>{

        //Remove all rows prior to book table
        while(rows[0][0] !== "ISBN") rows.shift();
        rows.shift();
        //Create book object (array)
        //Book array content is:
        //0: Title
        //1. ISBN
        for (let i = 0; i < rows.length; i++) {
            let book = [];

            //Grab title and format to be consistent
            let title = rows[i][constants.DB_POD_SPREADSHEET_TITLE_INDEX];

            //Check if we successfully got a title
            if(title !== null) {
                
                //Check for spaces at beginning or end and remove
                while(title[0] === ' ') {
                    title = title.substring(1);
                }
                while(title[title.length - 1] === ' ') {
                    title = title.slice(0, -1);
                }

                //Create book object and add it to list of books to update
                book.push(title, rows[i][constants.DB_POD_SPREADSHEET_ISBN_INDEX]);
                if(book[1] !== null) {
                    bookList.push(book);
                }
            }
        }
    });
    let numDbPodBooks = bookList.length - (numCovBooks + numCfBooks - numDbShortRunBooks);
    logToConsoleAndLog(getMessageWithTime("Read in " + numDbPodBooks + " books"));
    logToConsoleAndLog(getMessageWithTime("Read in a total of " + bookList.length + " books"));

    //Go through each book and update quantity in DSF
    //
    //Covenant
    //
    //Add COV Book to name text box
    //
    //Allow initial load to finish
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }

    //Input publisher into name box
    await page.type(constants.DSF_NAME_TEXT_BOX, "COV Book");
    await page.keyboard.press("Enter");

    //Iterate through each Covenant book and update quantity
    logToConsoleAndLog(getMessageWithTime("Updating covenant books"));
    for(let i = 0; i < numCovBooks; i++) {

        //Make sure DSF isn't loading
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }   

        //Query title
        logToConsoleAndLog(getMessageWithTime("Querying title: " + bookList[i][0]));
        await page.type(constants.DSF_DISPLAY_AS_SEARCH_TEXT_BOX, bookList[i][0]);
        await page.keyboard.press("Enter");
        
        //Allow load to finish
        await page.waitForSelector(constants.DSF_SEARCH_QUERIED_CHECK);
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }

        //Check if results were found
        if (await page.$(constants.DSF_NO_RESULTS_CHECK) !== null) {
            logToConsoleAndLog("*** WARNING ***");
            logToConsoleAndLog(getMessageWithTime("No results found for book: " + bookList[i][0] + ". Please check that the name in the spreadsheet and in DSF match exactly"));
            failedAttempts.push(bookList[i][0]);
            generateErrorLog(failedAttempts);
        }
        else {

            //Check if multiple results found
            if (await page.$(constants.DSF_AFTER_SEARCH_SECOND_RESULT) !== null) {
                logToConsoleAndLog("*** WARNING ***");
                logToConsoleAndLog(getMessageWithTime("Multiple results found for book: " + bookList[i][0] + ". Please update book manually"));
                failedAttempts.push(bookList[i][0]);
                generateErrorLog(failedAttempts);
            }
            else {
                
                //Enter product tab
                //
                //This will become the new page that is opened by clicking on the product
                const newPagePromise = new Promise(x => browser.once("targetcreated", target => x(target.page())));
                await page.click(constants.DSF_AFTER_SEARCH_FIRST_RESULT);
                const productTab = await newPagePromise;
                logToConsoleAndLog(getMessageWithTime("Updating maximum order quantity for book: " + bookList[i][0]));
                
                //Navigate to settings page
                await productTab.waitForSelector(constants.DSF_PRODUCT_SETTINGS_TAB, {visible: true});
                await productTab.waitForTimeout(1000);
                await productTab.click(constants.DSF_PRODUCT_SETTINGS_TAB);

                //Check if "By Multiples" is order quantities option selected
                await productTab.waitForSelector(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION, {visible: true});
                while(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION) === null) {
                    productTab.waitForTimeout(100);
                    console.log(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION));
                }
                const byMultiplesButton = await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                const isSelected = await (await byMultiplesButton.getProperty("checked")).jsonValue();

                //If it's not selecet, select it and check allow buyer to edit quantity
                if (!isSelected) {

                    //Select "By Multiples" option
                    await productTab.click(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                    await productTab.waitForSelector(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX, { visible: true });
                    await productTab.waitForTimeout(1000);

                    //Select "Allow Buyer to Edit Quantity" button
                    await productTab.click(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX);
                }

                //Enter minimum order quantity
                await productTab.click(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, String(constants.MIN_QUANTITY_TO_SET));

                //Enter multiple order quantity
                await productTab.click(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, String(constants.MULTIPLE_TO_SET));

                //Clear the max quantity and update
                await productTab.click(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, String(constants.QUANTITY_TO_SET));
                await productTab.click(constants.DSF_PRODUCT_SAVE_AND_EXTI_BUTTON);
                logToConsoleAndLog(getMessageWithTime("Successfully updated maximum order quantity for book: " + bookList[i][0]));
                await productTab.close();
            }
        }

        //Clear display as text box
        await page.click(constants.DSF_DISPLAY_AS_CONTAINS_REMOVE);
    }
    logToConsoleAndLog(getMessageWithTime("Finished updating Covenant books"));

    //Clear name text box
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }
    await page.click(constants.DSF_NAME_CONTAINS_REMOVE);
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }

    //Input Cedar Fort for name
    await page.type(constants.DSF_NAME_TEXT_BOX, "CF Book");
    await page.keyboard.press("Enter");
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }

    //Cedar Fort
    logToConsoleAndLog(getMessageWithTime("Updating Cedar Fort books"));
    for(let i = numCovBooks; i < numCovBooks + numCfBooks; i++) {

        //Make sure DSF isn't loading
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }   

        //Query title
        logToConsoleAndLog(getMessageWithTime("Querying title: " + bookList[i][0]));
        await page.type(constants.DSF_DISPLAY_AS_SEARCH_TEXT_BOX, bookList[i][0]);
        await page.keyboard.press("Enter");
        
        //Allow load to finish
        await page.waitForSelector(constants.DSF_SEARCH_QUERIED_CHECK);
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }

        //Check if results were found
        if (await page.$(constants.DSF_NO_RESULTS_CHECK) !== null) {
            logToConsoleAndLog("*** WARNING ***");
            logToConsoleAndLog(getMessageWithTime("No results found for book: " + bookList[i][0] + ". Please check that the name in the spreadsheet and in DSF match exactly"));
            failedAttempts.push(bookList[i][0]);
            generateErrorLog(failedAttempts);
        }
        else {

            //Check if multiple results found
            if (await page.$(constants.DSF_AFTER_SEARCH_SECOND_RESULT) !== null) {
                logToConsoleAndLog("*** WARNING ***");
                logToConsoleAndLog(getMessageWithTime("Multiple results found for book: " + bookList[i][0] + ". Please update book manually"));
                failedAttempts.push(bookList[i][0]);
                generateErrorLog(failedAttempts);
            }
            else {
                
                //Enter product tab
                //
                //This will become the new page that is opened by clicking on the product
                const newPagePromise = new Promise(x => browser.once("targetcreated", target => x(target.page())));
                await page.click(constants.DSF_AFTER_SEARCH_FIRST_RESULT);
                const productTab = await newPagePromise;
                logToConsoleAndLog(getMessageWithTime("Updating maximum order quantity for book: " + bookList[i][0]));
                
                //Navigate to settings page
                await productTab.waitForSelector(constants.DSF_PRODUCT_SETTINGS_TAB, {visible: true});
                await productTab.waitForTimeout(1000);
                await productTab.click(constants.DSF_PRODUCT_SETTINGS_TAB);

                //Check if "By Multiples" is order quantities option selected
                await productTab.waitForSelector(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION, {visible: true});
                while(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION) === null) {
                    productTab.waitForTimeout(100);
                    console.log(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION));
                }
                const byMultiplesButton = await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                const isSelected = await (await byMultiplesButton.getProperty("checked")).jsonValue();

                //If it's not selecet, select it and fill in information
                if (!isSelected) {

                    //Select "By Multiples" option
                    await productTab.click(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                    await productTab.waitForSelector(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX, { visible: true });
                    await productTab.waitForTimeout(1000);

                    //Select "Allow Buyer to Edit Quantity" button
                    await productTab.click(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX);
                }

                //Enter minimum order quantity
                await productTab.click(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, String(constants.MIN_QUANTITY_TO_SET));

                //Enter multiple order quantity
                await productTab.click(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, String(constants.MULTIPLE_TO_SET));

                //Clear the max quantity and update
                await productTab.click(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, String(constants.QUANTITY_TO_SET));
                await productTab.click(constants.DSF_PRODUCT_SAVE_AND_EXTI_BUTTON);
                logToConsoleAndLog(getMessageWithTime("Successfully updated maximum order quantity for book: " + bookList[i][0]));
                await productTab.close();
            }
        }

        //Clear display as text box
        await page.click(constants.DSF_DISPLAY_AS_CONTAINS_REMOVE);
    }
    logToConsoleAndLog(getMessageWithTime("Finished updating Cedar Fort books"));

    //Clear name text box
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }
    await page.click(constants.DSF_NAME_CONTAINS_REMOVE);
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }

    //Input Deseret Book Short Run for name
    await page.type(constants.DSF_NAME_TEXT_BOX, "DB Book");
    await page.keyboard.press("Enter");
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }

    //Deseret Book short run
    logToConsoleAndLog(getMessageWithTime("Updating Deseret Book Short Run books"));
    for(let i = numCovBooks + numCfBooks; i < numCovBooks + numCfBooks + numDbShortRunBooks; i++) {
        
        //Make sure DSF isn't loading
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }   

        //Query title
        logToConsoleAndLog(getMessageWithTime("Querying title: " + bookList[i][0]));
        await page.type(constants.DSF_DISPLAY_AS_SEARCH_TEXT_BOX, bookList[i][0]);
        await page.keyboard.press("Enter");
        
        //Allow load to finish
        await page.waitForSelector(constants.DSF_SEARCH_QUERIED_CHECK);
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }

        //Check if results were found
        if (await page.$(constants.DSF_NO_RESULTS_CHECK) !== null) {
            logToConsoleAndLog("*** WARNING ***");
            logToConsoleAndLog(getMessageWithTime("No results found for book: " + bookList[i][0] + ". Please check that the name in the spreadsheet and in DSF match exactly"));
            failedAttempts.push(bookList[i][0]);
            generateErrorLog(failedAttempts);
        }
        else {

            //Check if multiple results found
            if (await page.$(constants.DSF_AFTER_SEARCH_SECOND_RESULT) !== null) {
                logToConsoleAndLog("*** WARNING ***");
                logToConsoleAndLog(getMessageWithTime("Multiple results found for book: " + bookList[i][0] + ". Please update book manually"));
                failedAttempts.push(bookList[i][0]);
                generateErrorLog(failedAttempts);
            }
            else {
                
                //Enter product tab
                //
                //This will become the new page that is opened by clicking on the product
                const newPagePromise = new Promise(x => browser.once("targetcreated", target => x(target.page())));
                await page.click(constants.DSF_AFTER_SEARCH_FIRST_RESULT);
                const productTab = await newPagePromise;
                logToConsoleAndLog(getMessageWithTime("Updating maximum order quantity for book: " + bookList[i][0]));
                
                //Navigate to settings page
                await productTab.waitForSelector(constants.DSF_PRODUCT_SETTINGS_TAB, {visible: true});
                await productTab.waitForTimeout(1000);
                await productTab.click(constants.DSF_PRODUCT_SETTINGS_TAB);

                //Check if "By Multiples" is order quantities option selected
                await productTab.waitForSelector(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION, {visible: true});
                while(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION) === null) {
                    productTab.waitForTimeout(100);
                    console.log(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION));
                }
                const byMultiplesButton = await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                const isSelected = await (await byMultiplesButton.getProperty("checked")).jsonValue();

                //If it's not selecet, select it and fill in information
                if (!isSelected) {

                    //Select "By Multiples" option
                    await productTab.click(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                    await productTab.waitForSelector(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX, { visible: true });
                    await productTab.waitForTimeout(1000);

                    //Select "Allow Buyer to Edit Quantity" button
                    await productTab.click(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX);
                }

                //Enter minimum order quantity
                await productTab.click(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, String(constants.MIN_QUANTITY_TO_SET));

                //Enter multiple order quantity
                await productTab.click(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, String(constants.MULTIPLE_TO_SET));

                //Clear the max quantity and update
                await productTab.click(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, String(constants.QUANTITY_TO_SET));
                await productTab.click(constants.DSF_PRODUCT_SAVE_AND_EXTI_BUTTON);
                logToConsoleAndLog(getMessageWithTime("Successfully updated maximum order quantity for book: " + bookList[i][0]));
                await productTab.close();
            }
        }

        //Clear display as text box
        await page.click(constants.DSF_DISPLAY_AS_CONTAINS_REMOVE);
    }
    logToConsoleAndLog(getMessageWithTime("Finished updating Deseret Book Short Run books"));

    //Clear name text box
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }
    await page.click(constants.DSF_NAME_CONTAINS_REMOVE);
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }

    //Input Deseret Book POD for name
    await page.type(constants.DSF_NAME_TEXT_BOX, "DB POD Book");
    await page.keyboard.press("Enter");
    while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
        await page.waitForTimeout(100);
    }

    //Deseret Book POD
    logToConsoleAndLog(getMessageWithTime("Updating Deseret Book POD books"));
    for (let i = numCovBooks + numCfBooks + numDbShortRunBooks; i < bookList.length; i++) {
        
        //Make sure DSF isn't loading
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }   

        //Query title
        logToConsoleAndLog(getMessageWithTime("Querying title: " + bookList[i][0]));
        await page.type(constants.DSF_DISPLAY_AS_SEARCH_TEXT_BOX, bookList[i][0]);
        await page.keyboard.press("Enter");
        
        //Allow load to finish
        await page.waitForSelector(constants.DSF_SEARCH_QUERIED_CHECK);
        while(await page.$(constants.DSF_SEARCH_SPINNER) !== null) {
            await page.waitForTimeout(100);
        }

        //Check if results were found
        if (await page.$(constants.DSF_NO_RESULTS_CHECK) !== null) {
            logToConsoleAndLog("*** WARNING ***");
            logToConsoleAndLog(getMessageWithTime("No results found for book: " + bookList[i][0] + ". Please check that the name in the spreadsheet and in DSF match exactly"));
            failedAttempts.push(bookList[i][0]);
            generateErrorLog(failedAttempts);
        }
        else {

            //Check if multiple results found
            if (await page.$(constants.DSF_AFTER_SEARCH_SECOND_RESULT) !== null) {
                logToConsoleAndLog("*** WARNING ***");
                logToConsoleAndLog(getMessageWithTime("Multiple results found for book: " + bookList[i][0] + ". Please update book manually"));
                failedAttempts.push(bookList[i][0]);
                generateErrorLog(failedAttempts);
            }
            else {
                
                //Enter product tab
                //
                //This will become the new page that is opened by clicking on the product
                const newPagePromise = new Promise(x => browser.once("targetcreated", target => x(target.page())));
                await page.click(constants.DSF_AFTER_SEARCH_FIRST_RESULT);
                const productTab = await newPagePromise;
                logToConsoleAndLog(getMessageWithTime("Updating maximum order quantity for book: " + bookList[i][0]));
                
                //Navigate to settings page
                await productTab.waitForSelector(constants.DSF_PRODUCT_SETTINGS_TAB, {visible: true});
                await productTab.waitForTimeout(1000);
                await productTab.click(constants.DSF_PRODUCT_SETTINGS_TAB);

                //Check if "By Multiples" is order quantities option selected
                await productTab.waitForSelector(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION, {visible: true});
                while(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION) === null) {
                    productTab.waitForTimeout(100);
                    console.log(await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION));
                }
                const byMultiplesButton = await productTab.$(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                const isSelected = await (await byMultiplesButton.getProperty("checked")).jsonValue();

                //If it's not selecet, select it and fill in information
                if (!isSelected) {

                    //Select "By Multiples" option
                    await productTab.click(constants.DSF_BY_MULTIPLES_QUANTITY_OPTION);
                    await productTab.waitForSelector(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX, { visible: true });
                    await productTab.waitForTimeout(1000);

                    //Select "Allow Buyer to Edit Quantity" button
                    await productTab.click(constants.DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX);
                }

                //Enter minimum order quantity
                await productTab.click(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX, String(constants.DB_MIN_QUANTITY_TO_SET));

                //Enter multiple order quantity
                await productTab.click(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX, String(constants.DB_MULTIPLE_TO_SET));

                //Clear the max quantity and update
                await productTab.click(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, {clickCount: 2});
                await productTab.keyboard.press("Backspace");
                await productTab.type(constants.DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX, String(constants.QUANTITY_TO_SET));
                await productTab.click(constants.DSF_PRODUCT_SAVE_AND_EXTI_BUTTON);
                logToConsoleAndLog(getMessageWithTime("Successfully updated maximum order quantity for book: " + bookList[i][0]));
                await productTab.close();
            }
        }

        //Clear display as text box
        await page.click(constants.DSF_DISPLAY_AS_CONTAINS_REMOVE);
    }
    logToConsoleAndLog(getMessageWithTime("Finished updating Deseret Book POD books"));

    //Finish up
    logToConsoleAndLog(getMessageWithTime("All products updated. See Log and ErrorLog in the same directory as this script for details on execution"));
    await page.close();

    } catch (err) {
        //Username and/or password were incorrect, or login failed
        if(err === "loginError") {
            logToConsoleAndLog("*** ERROR ***");
            logToConsoleAndLog(getMessageWithTime("Login failed. Check credentials and try again"));
            process.exit(1);
        }

        //Default error case
        else {
            logToConsoleAndLog("*** ERROR ***");
            logToConsoleAndLog(getMessageWithTime("Something went wrong. Error:"));
            logToConsoleAndLog(getMessageWithTime(err));
            // process.exit(2);
        }
    }
}

run();
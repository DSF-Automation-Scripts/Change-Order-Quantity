module.exports = {
    //Path to log and error log
    LOG_PATH: "C:/Users/mco20/Documents/DSF-Scripts/changeQuantity/log.txt",
    ERROR_LOG_PATH: "C:/Users/mco20/Documents/DSF-Scripts/changeQuantity/errorLog.txt",

    //System file path to the Chrome executable
    CHROME_PATH: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",

    //URL of the DSF products page
    URL: "",

    //Show advanced login options button on main login screen of DSF 
    DSF_SHOW_ADVANCED_LOGIN_OPTIONS: "body > div.wrapper.ng-scope > div > div:nth-child(1) > div.login-single.ng-scope > div:nth-child(3) > div > div.modalcontent > form > div:nth-child(4) > a",

    //DSF login username text box
    DSF_USERNAME_TEXT_BOX: "body > div.wrapper.ng-scope > div > div:nth-child(1) > div.login-single.ng-scope > div:nth-child(3) > div > div.modalcontent > form > div:nth-child(5) > div.login-as-customer-container > div.customer-container-column > input.textbox",
   
    //DSF login password text box
    DSF_PASSWORD_TEXT_BOX: "#loginPwd",

    //DSF login button
    DSF_LOGIN_BUTTON: "body > div.wrapper.ng-scope > div > div:nth-child(1) > div.login-single.ng-scope > div:nth-child(3) > div > div.modalcontent > form > div:nth-child(5) > div.login-as-customer-container > div.customer-container-column > div.login-actions > button",

    //Element used to see if login was successful. Currently using header of DSF product view
    DSF_LOGIN_CHECK_ELEMENT: "#displayName_SmartSearchInput",

    //Spreadsheet paths
    COV_SPREADSHEET_PATH: "C:/Users/mco20/OneDrive - BYU/Documents/Print & Mail Digital Clients/Church Covenant/Covenant Product List.xlsx",
    DB_SPREADSHEET_PATH: "C:/Users/mco20/OneDrive - BYU/Documents/Print & Mail Digital Clients/Church Deseret Book/Desert Book Products.xlsx",
    CF_SPREADSHEET_PATH: "C:/Users/mco20/OneDrive - BYU/Documents/Print & Mail Digital Clients/Cedar Fort/Goldenbook Short Run available to Cedar Fort.xlsx",

    //Covenant spreadsheet indexes
    COV_SPREADSHEET_ISBN_INDEX: 1,
    COV_SPREADSHEET_TITLE_INDEX: 5,

    //Cedar Fort spreadsheet indexes
    CF_SPREADSHEET_ISBN_INDEX: 0,
    CF_SPREADSHEET_TITLE_INDEX: 5,

    //Deseret Book short run spreadsheet indexes
    DB_SR_SPREADSHEET_ISBN_INDEX: 0,
    DB_SR_SPREADSHEET_TITLE_INDEX: 4,

    //Deseret Book POD spreadsheet indexes
    //Indexes of values on the spreadsheets
    DB_POD_SPREADSHEET_ISBN_INDEX: 0,
    DB_POD_SPREADSHEET_TITLE_INDEX: 4,

    //DSF "Name" text box
    DSF_NAME_CONTAINS_REMOVE: "#aspnetForm > div.dot-rightpane > div.ctr-page > div > div:nth-child(2) > md-root:nth-child(1) > div > div.dot-wrapper > md-app-mdff > div.dot-rightpane > md-manage-products > div > md-users-filters-views > div.filterstring.row.m-0.bulk-actions-row.ng-star-inserted > div > p-chips > div > ul > li:nth-child(1) > span.ui-chips-token-icon.pi.pi-fw.pi-times.ng-star-inserted",
   
    //DSF "Display As" text box
    DSF_DISPLAY_AS_CONTAINS_REMOVE: "#aspnetForm > div.dot-rightpane > div.ctr-page > div > div:nth-child(2) > md-root:nth-child(1) > div > div.dot-wrapper > md-app-mdff > div.dot-rightpane > md-manage-products > div > md-users-filters-views > div.filterstring.row.m-0.bulk-actions-row.ng-star-inserted > div > p-chips > div > ul > li:nth-child(2) > span.ui-chips-token-icon.pi.pi-fw.pi-times.ng-star-inserted",

    //"Name" text box
    DSF_NAME_TEXT_BOX: "#productName_SmartSearchInput",

    //"Display as" text box
    DSF_DISPLAY_AS_SEARCH_TEXT_BOX: "#displayName_SmartSearchInput",

    //Loading animation that DSF plays while querying results
    DSF_SEARCH_SPINNER: "#aspnetForm > div.dot-rightpane > div.ctr-page > div > div:nth-child(2) > md-root:nth-child(1) > div > div.spinner.ng-star-inserted > p-progressspinner > div > svg",

    //Element used to check if a query has been performed. Currently, it's the little blue box that DSF shows after a search occurs
    DSF_SEARCH_QUERIED_CHECK: "#aspnetForm > div.dot-rightpane > div.ctr-page > div > div:nth-child(2) > md-root:nth-child(1) > div > div.dot-wrapper > md-app-mdff > div.dot-rightpane > md-manage-products > div > md-users-filters-views > div.filterstring.row.m-0.bulk-actions-row.ng-star-inserted > div > p-chips > div > ul > li.ui-chips-token.ui-state-highlight.ui-corner-all.ng-star-inserted",

    //Element to check if a query returned no results, currently "No Results Found" text that appears
    DSF_NO_RESULTS_CHECK: "#inventoryTbl > div > div.ui-table-scrollable-wrapper.ng-star-inserted > div > div.ui-table-scrollable-body > table > tbody > tr > td > span",

    //After search, the result's elements or text values
    DSF_AFTER_SEARCH_FIRST_RESULT: "#inventoryTbl > div > div.ui-table-scrollable-wrapper.ng-star-inserted > div > div.ui-table-scrollable-body > table > tbody > tr:nth-child(1) > td:nth-child(5) > p-celleditor > div > md-grid-link-data > div > a",
    DSF_AFTER_SEARCH_FIRST_RESULT_TEXT_VALUE: "#inventoryTbl > div > div.ui-table-scrollable-wrapper.ng-star-inserted > div > div.ui-table-scrollable-body > table > tbody > tr:nth-child(1) > td:nth-child(5) > p-celleditor > div > md-grid-link-data > div > a > span",
    DSF_AFTER_SEARCH_SECOND_RESULT: "#inventoryTbl > div > div.ui-table-scrollable-wrapper.ng-star-inserted > div > div.ui-table-scrollable-body > table > tbody > tr:nth-child(2) > td:nth-child(5) > p-celleditor > div > md-grid-link-data > div > a",
    DSF_AFTER_SEARCH_SECOND_RESULT_TEXT_VALUE: "#inventoryTbl > div > div.ui-table-scrollable-wrapper.ng-star-inserted > div > div.ui-table-scrollable-body > table > tbody > tr:nth-child(2) > td:nth-child(5) > p-celleditor > div > md-grid-link-data > div > a > span",

    //DSF product settings tab
    DSF_PRODUCT_SETTINGS_TAB: "#TabSettings.rtsLink",

    //DSF settings options
    DSF_PRODUCT_MINIMUM_QUANTITY_TEXT_BOX: "#ctl00_ctl00_C_M_ctl00_W_ctl01_OrderQuantitiesCtrl__Minimum",
    DSF_PRODUCT_MAXIMUM_QUANTITY_TEXT_BOX: "#ctl00_ctl00_C_M_ctl00_W_ctl01_OrderQuantitiesCtrl__Maximum",
    DSF_PRODUCT_MULTIPLE_ORDER_TEXT_BOX: "#ctl00_ctl00_C_M_ctl00_W_ctl01_OrderQuantitiesCtrl__Multiple",
    DSF_ALLOW_BUYER_TO_EDIT_QUANTITY_BOX: "#ctl00_ctl00_C_M_ctl00_W_ctl01_OrderQuantitiesCtrl__AllowBuyerToEditQty",
    DSF_BY_MULTIPLES_QUANTITY_OPTION: "#ctl00_ctl00_C_M_ctl00_W_ctl01_OrderQuantitiesCtrl__Multiples",

    //Save and exit in the product tab
    DSF_PRODUCT_SAVE_AND_EXTI_BUTTON: "#ctl00_ctl00_C_M_ctl00_W_StartNavigationTemplateContainerID_ctl00_BtnSaveAndExit",

    //Quantity to change max order quantity to
    QUANTITY_TO_SET: 2502,
    MIN_QUANTITY_TO_SET: 3,
    MULTIPLE_TO_SET: 3,
    DB_MIN_QUANTITY_TO_SET: 1,
    DB_MULTIPLE_TO_SET: 1
};
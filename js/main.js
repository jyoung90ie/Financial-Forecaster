const minRows = 1; // minimum total number of form rows
const maxRows = 12; // maximum total number of form rows
const startTab = 0; // first tab = 0

const tabIdentifier = 'tab'; // word which identifies all tabs

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const form = document.querySelector('form');
const summaryTab = document.querySelector('#summary-tab');
const progressIndicator = document.querySelector('#progress-indicator');
const contentBox = document.querySelector('.content-box');
const error = document.querySelector('#error-messages');

// stores the html element of the current form tab that the user can see
const getActiveTab = () => document.querySelector(`section[id*="${tabIdentifier}"]:not(.hide)`);
// stores all of the form tabs in a variable
const getTabs = () => document.querySelectorAll(`section[id*="${tabIdentifier}"]`);

/*
    getAttributePrefix: The html attribute values have been setup so that they have a prefix and a suffix. This function returns the prefix only.

    E.g.    <input ... name="income-amount-1"...>
            The 'name' attribute can be split as follows:
            Prefix  =   "income-amount-"
            Suffix  =   "1"
*/
const getAttributePrefix = attributeValue => {
    if (typeof (attributeValue) == "string") {
        let splitStringPosition = parseInt(attributeValue.lastIndexOf('-')) + 1;

        return attributeValue.substr(0, splitStringPosition);
    }
};

/*
    initTab: Initialisation function which is called when the page is first loaded to setup the form.

    The following actions are performed:
    1. The starting tab is displayed (passed to the function via startTab)
    2. Navigation buttons are updated based on the starting tab
    3. The tab indicators are updated to reflect which tab is active
*/
const initTab = (startTab = 0) => {
    // function which will set the current tab
    const allTabs = getTabs();
    const numberOfTabs = allTabs.length;

    let maxTab = numberOfTabs - 2; // array starts at zero therefore -1; another -1 as I want the final tab not to be accessible by next button, only by submit button.

    if (startTab > maxTab) {
        console.log(`ERROR: initTab function called for (tab: ${startTab}) which does not exist. Defaulting to tab(${maxTab}).`);
        startTab = maxTab;
    } else if (startTab < 0) {
        console.log(`ERROR: initTab function called for (tab: ${startTab}) which does not exist. Defaulting to tab(0).`);
        startTab = 0;
    }

    for (let i = 0; i < numberOfTabs; i++) {
        if (i === startTab) {
            allTabs[i].classList.remove('hide');
            allTabs[i].classList.add('slide-in-left');
        } else {
            allTabs[i].classList.add('hide');
        }
    }

    retrieveData();
    updateNavButtons();
    updateTabIndicator();
};

/*
    updateNavButtons:

    Used to determine which buttons should be displayed on each tab, e.g. the first tab should not have a previous button, etc.
*/
const updateNavButtons = () => {
    const numberOfTabs = getTabs().length - 1;
    const activeTab = Array.from(getTabs()).indexOf(getActiveTab());
    const navBtns = document.querySelectorAll('button');

    navBtns.forEach(button => button.classList.add('hide'));

    if (activeTab >= 0 && activeTab < numberOfTabs - 1) {
        // show next button until the penultimate tab - 1
        nextBtn.classList.remove('hide');
    }

    if (activeTab > 0 && activeTab <= numberOfTabs) {
        // show prev button
        prevBtn.classList.remove('hide');
    }

    if (activeTab === numberOfTabs - 1) {
        // show submit button on penultimate tab
        submitBtn.classList.remove('hide');
    }
};

/*
    navigateTabs:

    Used to determine which part of the form should be displayed to the user, dependent on which button they pressed - this is passed to the function via the 'type' variable. 
    CSS styling is also applied dependent whether the form is moving forwards (next) or backwards (previous).

    Once processed a number of other functions are called to update other elements on the tab (e.g. the buttons that should be shown on the new tab, tab indicators, etc.).
*/
const navigateTabs = type => {
    const tabs = Array.from(getTabs());
    const numberOfTabs = tabs.length;
    const activeTab = tabs.indexOf(getActiveTab());

    let nextTab;
    let htmlClass;

    if (type === 'next') {
        nextTab = activeTab + 1;
        htmlClass = 'slide-in-left';
    } else {
        nextTab = activeTab - 1;
        htmlClass = 'slide-in-right';
    }

    for (let i = 0; i < numberOfTabs; i++) {
        if (i === nextTab) {
            tabs[i].classList.remove('hide');
            tabs[i].classList.add(htmlClass);
        } else {
            tabs[i].classList.add('hide');
            tabs[i].classList.remove('slide-in-left', 'slide-in-right');
        }
    }

    updateNavButtons();
    updateTabIndicator();
    resetErrorMsg();
};

/*
    updateTabIndicator:

    Gives the end user a visual indicator as to their progress through the form by updating the circles at the bottom of the form, with the active tab circle being displayed with a different color to the rest.
*/
const updateTabIndicator = () => {
    // determine how many tabs are in the form and use this to add tab indicators for each
    const numberOfTabs = getTabs().length;
    const activeTab = Array.from(getTabs()).indexOf(getActiveTab());
    let progressIndicatorHTML = '';

    for (let i = 0; i < numberOfTabs; i++) {
        let htmlClass = 'tab';
        if (i === activeTab) {
            htmlClass += ' active';
        }
        progressIndicatorHTML += `<span class="${htmlClass}"></span>`;
    }

    progressIndicator.innerHTML = progressIndicatorHTML;
};

/*
    addFormRow:

    This takes an elementId as a pass-through variable, this is used to clone the collection of html elements and append to the parent of said element. As this is a clone the html 'id' and 'name' attributes must be updated to maintain their unique values, this is achieved via the changeAttributeValues function.
*/
const addFormRow = (id, attr = 'id') => {
    const element = document.querySelector(`[${attr}^="${id}"]`);
    const elementPrefix = getAttributePrefix(id);

    const countElements = document.querySelectorAll(`[${attr}^="${getAttributePrefix(id)}"]`).length;

    // check to make sure that there is at least one row before deleting
    if (countElements < maxRows) {
        const idToAppendTo = element.parentNode.id;
        let copyHTML = element.cloneNode(true);

        // see how many of this id already exist and increment it
        const newElementId = elementPrefix + parseInt(countElements + 1);
        // change cloned element id to the new incremented value to keep unique
        copyHTML.id = newElementId;
        // execute the clone
        document.getElementById(idToAppendTo).appendChild(copyHTML);

        const newElementChildren = document.getElementById(newElementId);

        changeAttributeValues(newElementChildren);
        // changeAttributeValues(newElementChildren);
    } else {
        alert("NOTE: You have reached the maximum permittable amount of form rows.");
    }
};

/*
    removeFormRow:

    This takes an elementId as a pass-through variable, which is then used to delete the associated html element and all associated children. Once the row is removed, the element attribute values for id and name need to be updated to ensure that any new rows are not created with the same values as the current.
*/

const removeFormRow = elementId => {
    const element = document.getElementById(elementId);
    const parentDivIdPrefix = getAttributePrefix(elementId);

    const countRemainingRows = document.querySelectorAll(`[id^="${parentDivIdPrefix}"]`).length;

    // check to make sure that there is at least one row before deleting
    if (countRemainingRows > minRows) {
        // delete the relevant form row
        element.remove();
        // invoke function to iterate through element ID's and names to reindex them so they are in consecutive order with no duplicates
        elementReindex();
    } else {
        alert('ERROR: Cannot delete the last form row.');
    }
};

/*
    changeAttributeValues:

    When a new collection of form elements have been added to the form by cloning the previous elements the attribute values for id and name must be updated so that they are unique. This function performs this adjustment. It works by taking the current attribute value prefixes (i.e. ignoring the integer at the end of the value), determining how many of this value currently exist (including the new one) and appending this to the end as the new value.

*/
const changeAttributeValues = (parentElement) => {
    /*
    Function is invoked when a new form row is added. It will iterate through new form elements and update the relevant attribute values
    to ensure they remain unique (e.g. name and id)
    */
    // find all elements under parent that need to be relabelled
    attributes = ['id', 'name'];

    attributes.forEach(attr => {
        elements = parentElement.querySelectorAll(`[${attr}]`);
        elements.forEach(childElement => {
            let childElementPrefix = getAttributePrefix(childElement[attr]);

            // get the number of HTML elements with the same attribute name prefix
            let countAttributeName = document.querySelectorAll(`[${attr}^="${childElementPrefix}"`);

            // change the attribute value
            childElement[attr] = childElementPrefix + countAttributeName.length;
            // set the new element contents to blank and remove any validation styling
            childElement.value = "";
            childElement.classList.remove('success', 'fail');
        });
    });
};

/*
    pushValuesToArray:

    This is used by the elementsReindex function to store the details of all the form elements in which the relevant attributes need to be updated. The array is then processed by the processElementReindex function.
*/
const pushValuesToArray = (array, ref, elementName, elementAttribute, count) => {
    array.push({
        "ref": ref,
        "prefix": elementName,
        "attribute": elementAttribute,
        "count": count,
        "current": 1
    });
};

/* 
    elementReindex: 
    
    This loops through the form and captures the values of all form elements with an 'id' or a 'name' attribute. It then produces an array of the unique form attributes by only looking at the prefix, this information is then stored in an array and a seperate function (processElementReindex) is called to perform the update.
*/
const elementReindex = () => {
    /* 
    Runs when a row has been removed.
    */

    // limit the scope of the application to the current tab
    let parentID = getActiveTab().id;

    // element arrays that need to be changed stored in an array to loop through
    let attributes = ['id', 'name'];

    // cycle through the element attributes that need to be reindexed
    let elements = [];

    attributes.forEach(attr => {
        let arrayOfElements = document.getElementById(parentID).querySelectorAll(`[${attr}]`);

        arrayOfElements.forEach(element => {
            let currentElementAttribute = element[attr];
            let elementAttributePrefix = getAttributePrefix(currentElementAttribute);

            let ref = `[${attr}]${elementAttributePrefix}`;
            let countOfAttribute = document.getElementById(parentID).querySelectorAll(`[${attr}^=${elementAttributePrefix}]`).length;


            if (elements.length === 0) {
                // if there array has no values then set first value
                pushValuesToArray(elements, ref, elementAttributePrefix, attr, countOfAttribute);
            } else {
                // if array has at least one value then check the array to make sure the current ref is not already contained
                let findRefVal = 0;
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i]["ref"] === ref) {
                        // if the current ref ([attribute]elementprefix) is found set the value to 1 which means that the values will NOT be pushed to the array and end the loop
                        findRefVal = 1;
                        break;
                    }
                }

                // if the ref was not found then add it to the array
                if (findRefVal === 0) {
                    pushValuesToArray(elements, ref, elementAttributePrefix, attr, countOfAttribute);
                }
            }
        });
    });
};

/*
    processElementReindex:

    This takes in an array as defined by the pushValuesToArray function. This function then loops through the array and updates the element attribute to the new value to ensure that each form element has a unique name and id.
*/
const processElementReindex = array => {
    if (array.length === 0) {
        console.log('ERROR: empty array passed to function - cannot proceed');
        return;
    }

    for (let i = 0; i < array.length; i++) {
        let attr = array[i]["attribute"];
        let attributePrefix = array[i]["prefix"];
        let elements = document.querySelectorAll(`[${attr}^="${attributePrefix}"]`);

        elements.forEach(element => {
            let currentAttributeName = element[attr];
            let attributeCurrent = array[i]["current"];
            let newAttributeName = attributePrefix + attributeCurrent;

            if (currentAttributeName !== newAttributeName) {
                element[attr] = newAttributeName;
            }
            array[i]["current"]++;
        });
    }
};



/*******************************
  FORM CALCULATION FUNCTIONS
*******************************/
// function to convert the different form frequencies into a yearly amount
const getScalar = frequency => {
    let yearScalar;
    switch (frequency) {
        case '7':
            yearScalar = 52;
            break;
        case '14':
            yearScalar = 26;
            break;
        case '28':
            yearScalar = 13;
            break;
        case '30':
            yearScalar = 12;
            break;
        case '60':
            yearScalar = 6;
            break;
        default:
            yearScalar = 1;
    };
    return yearScalar;
};

const validateText = text => {
    const pattern = /^[a-zA-Z0-9 ]{1,30}$/

    return pattern.test(text);
};

const validateNumber = text => {
    const pattern = /^[0-9]+(\.[0-9][0-9]?)?$/

    return pattern.test(text);
};


/*
    createDataArray: 

    takes the form inputs as an array input and creates a data array from it
*/
const createDataArray = inputData => {
    let inputArray = [];
    let outputData = [];
    let lastRef = '';
    let j = 0;

    if (typeof inputData !== 'object') {
        inputArray = Array.from(inputData);
    } else {
        inputArray = inputData;
    }

    for (let i = 0; i < inputArray.length; i++) {
        let item = inputArray[i];

        if (item.includes('account') || item.includes('income') || item.includes('outgoing')) {
            let source = item.substring(0, item.indexOf('-'));
            let sourceIndex = item.substring(item.lastIndexOf('-') + 1);
            let curRef = `${source}-${sourceIndex}`;
            let fieldName = item.substring(item.indexOf('-') + 1, item.lastIndexOf('-'));

            if (lastRef !== curRef) {
                if (outputData[j]) {
                    j++;
                }
                outputData[j] = {};
                outputData[j]['ref'] = curRef;
                outputData[j]['source'] = source;
            }

            if (fieldName.includes('amount')) {
                outputData[j][fieldName] = Number(form[item].value);
            } else {
                outputData[j][fieldName] = form[item].value;
            }

            lastRef = curRef;
        }
    }
    return outputData;
};

const numberFormat = num => {
    if (typeof num === 'number') {
        return Math.round(num).toLocaleString();
    } else {
        return num;
    }
};

/*
    updateCounter:

    An array is used to keep track of the date that the last income/outgoing value was recorded for each entry, this function is used to update it.
*/
const updateCounter = (array, key, value) => {
    if (array.indexOf(key)) {
        array[key] = value;
    } else {
        array.push({
            [key]: value
        });
    }
    return array;
}

/*
    genMonthlyData:

    produces a monthly dataset for X years as determined by the passthrough variable
*/
const genMonthlyData = (inputData, years = 3) => {
    const today = new Date();
    const months = 12;
    const days = 365.25;
    const iterations = (days * years);
    const startDate = today.getTime();
    const dayTime = 24 * 60 * 60 * 1000; // milliseconds in a day
    const liabilities = ['liability', 'cc', 'outgoing']; // if inputData source or type contains any of these then the amount should be negative

    let curDate;
    let counter = [];
    let outputData = [];

    for (i = 1; i < iterations + 1; i++) {
        /*
            [val array variables]

                amount:
                description:
                frequency:
                ref:
                source:
                type:
                end-date: 
        */
        let loopData = [];

        inputData.forEach((val, index) => {
            let amount = 0;
            if (liabilities.includes(val.source) || liabilities.includes(val.type)) {
                amount = -val.amount;
            } else {
                amount = val.amount;
            }

            if (curDate === undefined) {
                loopData.push({
                    ref: val.ref,
                    date: startDate,
                    amount: amount,
                    description: val.description,
                    type: val.type
                });
                updateCounter(counter, val.ref, startDate);
            } else {
                let freq = Number(val.frequency);

                // accounts should only be created at time 0, so only proceed if the source is not account
                // if frequency === 1 the item is a one off and will have already been accounted for in the initial input
                if (val.source !== 'account' && freq > 1) {
                    // check to see when this specific item was last updated and compare to the frequency
                    let lastUpdated = counter[val.ref];
                    let daysSinceUpdate = Math.round((curDate - lastUpdated) / dayTime);

                    // if the days since last update is equal to the frequency of updates then push update
                    if (daysSinceUpdate === freq) {
                        outputData.push({
                            ref: val.ref,
                            date: curDate,
                            amount: amount,
                            description: val.description,
                            type: val.type
                        });
                        updateCounter(counter, val.ref, curDate);
                    }
                }
            }

        });
        curDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i).getTime();

    }
    return outputData;
};



/*
    validation - runs checks on the active tab of the form to ensure that all tests
    are passed. If successful the function will invoke the function passed through (i.e. func())
*/
const validation = func => {
    // get all elements on current tab with an 'id' that aren't a div, i.e. form data
    const elements = getActiveTab().querySelectorAll(':not(div)[id]');

    let fails = 0;
    let emailPattern = /\S+@\S+/;
    let errorHTML = '';

    elements.forEach(element => {
        const value = element.value.trim();
        const id = element.id;

        // form element names are different on the general tab and need to be handled differently
        const nameStr = getActiveTab().id !== 'general-tab' ? id.slice(id.indexOf('-') + 1, id.lastIndexOf('-')) : element.id.replace(/-/g, ' ');

        const name = nameStr[0].toUpperCase() + nameStr.substr(1).toLowerCase().replace(/-/g, ' ');

        element.classList.remove('success', 'fail');

        // check if the element has a value
        if (!value) {
            element.classList.add('fail');
            fails++;

            errorHTML += `<li>The ${name} field must be populated.</li>`;
        } else {
            // if a value exists then run some more granular tests based on the form id
            if (id.includes('email') && !emailPattern.test(value)) {
                element.classList.add('fail');
                fails++;

                errorHTML += `<li>You must input a valid email address.</li>`
            } else if (id.includes('amount') && isNaN(value)) {
                element.classList.add('fail');
                fails++;
                errorHTML += `<li>You must enter a valid number for the field "${name}".</li>`;
            } else {
                element.classList.add('success');
            }
        }
    });

    // if all tests were passed then invoke passthrough function
    if (!fails) {
        saveData(); // store form values to local data

        resetErrorMsg();
        func(); // callback function
    } else {
        let funcName = func.toString();
        let funcMsg = '';

        if (funcName.includes('navigate')) {
            funcMsg = `You cannot move on to the next section until you address the following errors:`;
        } else if (funcName.includes('addform')) {
            funcMsg = `You cannot add a new form row until you address the following errors:`;
        } else {
            funcMsg = `You cannot continue until you address the following errors:`;
        }

        error.classList.remove('hide');
        error.innerHTML = `<p>${funcMsg}</p>
                        <ul>${errorHTML}</ul>`;
    }
};

/* 
    resetErrorMsg: used to hide the error message container and remove the content
*/
const resetErrorMsg = () => {
    error.classList.add('hide');
    error.innerHTML = '';
};

/*
    getFormData: creates an array of all the form elements which have the 'name' attribute (i.e. all input fields)
*/
const getElementNames = () => {
    return Array.from(form)
        .filter(element => element.name !== '')
        .map(element => element.name);
};

const activeTabElements = () => {
    return Array.from(form)
        .filter(element => getActiveTab().contains(element));
};

/*
    saveData: used to save form data to local storage
*/
const saveData = () => {
    const elements = activeTabElements();
    let formElements = [];

    let tabNum = Array.from(getTabs()).indexOf(getActiveTab()); // get integer position of tab

    elements.forEach(element => {
        localStorage.setItem(element.name, element.value);
        formElements.push(element.name);
    });

    // if tab number > 1 (i.e. from the accounts page onwards)
    if (tabNum > 1) {
        const type = elements[0].id.substr(0, elements[0].id.indexOf('-'));

        const storedItems = Object.keys(localStorage);
        storedItems.forEach(item => {
            if (item.includes(type) && !formElements.includes(item)) {
                localStorage.removeItem(item);
            }
        });
    }
};

/*
    retrieveData: used to retrieve data from local storage and repopulate the form
*/

const retrieveData = () => {

    const storedItems = Object.keys(localStorage);
    let toUpdate = [];

    storedItems.forEach(item => {
        const element = document.querySelector(`[name=${item}]`);
        let lastParent;

        // check if the element exists
        if (element) {
            // if it does then retrieve the stored value and prepopulate the form
            element.value = localStorage.getItem(item);
            lastParent = element.parentElement.parentElement;
        } else {
            const type = item.substr(0, item.indexOf('-'));
            // only continue if type has a string, i.e. it begins with 'name-blahblah' otherwise ignore it
            if (type !== '') {
                lastParent = document.querySelector(`[id^=${type}-fields]`);
                // if element does not exist then create it
                addFormRow(lastParent.id);

                // store element ref and value to array and update it later
                toUpdate.push({
                    ref: [item],
                    value: localStorage.getItem(item)
                });
            }
        }
    });

    // for those form elements that did not exist and had to be created, retrieve the values and populate
    toUpdate.forEach(item => {
        let element = document.querySelector(`[name=${item.ref}]`);

        element.value = item.value;
    })
};




/*******************************
   event listeners
*******************************/

form.addEventListener('click', event => {
    // console.log(event);
    const activeTab = getActiveTab();
    const target = event.target;

    if (target.hasAttribute('class') || target.hasAttribute('id')) {
        // navigation button actions
        if (target.id === 'prev-btn') {
            navigateTabs('prev');
        } else if (target.id === 'next-btn') {
            // validation

            validation(() => navigateTabs('next'));

            // navigateTabs('next');
        } else if (target.id === 'submit-btn') {
            event.preventDefault(); // do not refresh form

            // create an array of form element names by removing any without a name
            const elementNames = getElementNames();

            // split formdata array into specific arrays using function
            const formData = createDataArray(elementNames);
            const monthlyData = genMonthlyData(formData, 1);
            makeGraphs(monthlyData);
            // transfer data arrays to function to determine net worth
            // netWorthCalc(accountData, incomeData, outgoingData, 10);

            // transition to the next tab to show results
            validation(() => navigateTabs('next'));
        }
        // add/remove form elements if icons clicked
        if (target.className.includes('fa-plus')) {
            // append new row
            const parentID = event.path
                .filter(item => item.nodeName === 'DIV' && item.id !== '')
                .map(item => item.id);

            validation(() => addFormRow(parentID[0]));


        } else if (target.className.includes('fa-trash-alt')) {
            // remove clicked row
            const parentID = event.path
                .filter(item => item.nodeName === 'DIV' && item.id !== '')
                .map(item => item.id);

            removeFormRow(parentID[0]);

            // call validation again to refresh error messages (or remove if no longer applicable), pass an empty callback function
            validation(() => {});
        }
    }
});

// initTab(startTab);
initTab(5);
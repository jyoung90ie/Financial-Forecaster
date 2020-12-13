/*
    This contains all the functions used to navigate, update, and validate the form
*/


// stores the html element of the current form tab that the user can see
const getActiveTab = () => {
    let tab = document.querySelector(`section[id*="${tabIdentifier}"]:not(.hide)`);

    if (tab) {
        return tab;
    }

    return false;
};

// stores all of the form tabs in a variable
const getTabs = () => {
    let tabs = document.querySelectorAll(`section[id*="${tabIdentifier}"]`);

    if (tabs) {
        return tabs;
    }

    return false;
};

// variable type checks
const isNumber = val => {
    return typeof val === 'number';
};

const isArray = val => {
    return typeof val === 'object' && val.constructor === Array;
};

const isString = val => {
    return typeof val === 'string';
};

/*
    getAttributePrefix: The html attribute values have been setup so that they have a prefix and a suffix. This function 
    returns the prefix only.

    E.g.    <input ... name="income-amount-1"...>
            The 'name' attribute can be split as follows:
            Prefix  =   "income-amount-"
            Suffix  =   "1"
*/
const getAttributePrefix = attributeValue => {
    if (attributeValue) {
        if (!isString(attributeValue)) {
            attributeValue = attributeValue.toString();
        }
        let splitStringPosition = parseInt(attributeValue.lastIndexOf('-')) + 1;

        return attributeValue.substr(0, splitStringPosition);
    }

    // if no value was passed through
    return '';
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

    // max accessible tab should be maxTab - 1, as last tab should be accessed via submit button and not directly
    let maxTab = numberOfTabs - 1;

    if (startTab > maxTab) {
        console.log(`WARNING: initTab function called for (tab: ${startTab}) which does not exist. Defaulting to tab(${maxTab}).`);
        startTab = maxTab;
    } else if (startTab < 0) {
        console.log(`WARNING: initTab function called for (tab: ${startTab}) which does not exist. Defaulting to tab(0).`);
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

    updateNavButtons();
    updateTabIndicator();
    retrieveData();
};

/*
    updateNavButtons:

    Used to determine which buttons should be displayed on each tab, e.g. the first tab should not have a previous 
    button, etc.
*/
const updateNavButtons = () => {
    const numberOfTabs = getTabs().length - 1; // array starts at zero so need to subtract one
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

    Used to determine which part of the form should be displayed to the user, dependent on which button they pressed 
    - this is passed to the function via the 'type' variable.
    CSS styling is also applied dependent whether the form is moving forwards (next) or backwards (previous).

    Once processed a number of other functions are called to update other elements on the tab (e.g. the buttons that 
    should be shown on the new tab, tab indicators, etc.).
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

    Gives the end user a visual indicator as to their progress through the form by updating the circles at the bottom 
    of the form, with the active tab circle being displayed with a different color to the rest.
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

    if (progressIndicator) {
        progressIndicator.innerHTML = progressIndicatorHTML;
    }
};

/*
    addFormRow:

    This takes an elementId as a pass-through variable, this is used to clone the collection of html elements and append
     to the parent of said element. As this is a clone the html 'id' and 'name' attributes must be updated to maintain 
    their unique values, this is achieved via the changeAttributeValues function.
*/
const addFormRow = (id, attr = 'id') => {
    const element = document.querySelector(`[${attr}^="${id}"]`);

    if (element) {
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

            if (newElementChildren) {
                elementReindex(true);
            } else {
                return false;
            }
        } else {
            alert("NOTE: You have reached the maximum permittable amount of form rows.");
        }
    } else {
        return false;
    }
};

/*
    removeFormRow:

    This takes an elementId as a pass-through variable, which is then used to delete the associated html element and all
     associated children. Once the row is removed, the element attribute values for id and name need to be updated to 
    ensure that any new rows are not created with the same values as the current.
*/

const removeFormRow = elementId => {
    if (isString(elementId)) {
        const element = document.getElementById(elementId);

        if (element) {
            const parentDivIdPrefix = getAttributePrefix(elementId);

            const countRemainingRows = document.querySelectorAll(`[id^="${parentDivIdPrefix}"]`).length;

            // check to make sure that there is at least one row before deleting
            if (countRemainingRows > minRows) {
                // delete the relevant form row
                element.remove();

                // invoke function to iterate through element ID's and names to reindex them so they are in consecutive
                // order with no duplicates
                elementReindex();
            } else {
                alert('ERROR: Cannot delete the last form row.');
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
};

/*
    pushValuesToArray:

    This is used by the elementsReindex function to store the details of all the form elements in which the relevant 
    attributes need to be updated. The array is then processed by the processElementReindex function.
*/
const pushValuesToArray = (array, ref, elementPrefix, elementAttribute, count) => {
    if (isArray(array) && isString(ref) && isString(elementPrefix) && isString(elementAttribute) &&
        isString(elementAttribute) && isNumber(count)) {
        array.push({
            "ref": ref,
            "prefix": elementPrefix,
            "attribute": elementAttribute,
            "count": count,
            "current": 1
        });

        return array;
    } else {
        return false;
    }
};

/*
    elementReindex:

    This loops through the form and captures the values of all form elements with the attributes passed through. It then
    produces an array of the unique form attributes by only looking at the prefix, this information is then stored in an
    array and a seperate function (processElementReindex) is called to perform the update.

    clearElement is used to clear formatting and set the value to empty when adding new form rows
*/
const elementReindex = (clearElement = false, attributes = ['id', 'name']) => {

    // let parentTab = getActiveTab();
    let parentTab = 'financials';

    if (isArray(attributes) && parentTab) {
        // limit the scope of the application to the current tab
        let parentID = parentTab;
        // cycle through the element attributes that need to be reindexed
        let elements = [];

        attributes.forEach(attr => {
            let arrayOfElements = document.getElementById(parentID).querySelectorAll(`[${attr}]`);

            if (arrayOfElements) {
                arrayOfElements.forEach(element => {
                    let currentElementAttribute = element[attr];

                    // ignore section tabs
                    if (currentElementAttribute.includes('tab') || element.nodeName.toLowerCase() == 'section') {
                        return;
                    }

                    let elementAttributePrefix = getAttributePrefix(currentElementAttribute);

                    let ref = `[${attr}]${elementAttributePrefix}`;
                    let countOfAttribute = document.getElementById(parentID)
                        .querySelectorAll(`[${attr}^=${elementAttributePrefix}]`).length;

                    if (elements.length === 0) {
                        // if there array has no values then set first value
                        pushValuesToArray(elements, ref, elementAttributePrefix, attr, countOfAttribute);
                    } else {
                        // if array has at least one value then check the array to make sure the current ref is not 
                        // already contained
                        let findRefVal = 0;
                        for (let i = 0; i < elements.length; i++) {
                            if (elements[i].ref === ref) {
                                // if the current ref ([attribute]elementprefix) is found set the value to 1 which means
                                // that the values will NOT be pushed to the array and end the loop
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
            }
        });

        return processElementReindex(elements, clearElement);
    } else {
        return false;
    }
};

/*
    processElementReindex:

    This takes in an array as defined by the elementReindex function. This function then loops through the array and 
    updates the element attribute to the new value to ensure that each form element has a unique name and id.
*/
const processElementReindex = (array, clearElement = false) => {
    if (!isArray(array) || array.length === 0) {
        console.log('ERROR processElementReindex(): empty array passed to function - cannot proceed');
        return false;
    }

    for (let i = 0; i < array.length; i++) {
        let attr = array[i].attribute;
        let attributePrefix = array[i].prefix;
        let elements = document.querySelectorAll(`[${attr}^="${attributePrefix}"]`);

        elements.forEach(element => {
            let currentAttributeName = element[attr];
            let attributeCurrent = array[i].current;
            let newAttributeName = attributePrefix + attributeCurrent;

            if (currentAttributeName !== newAttributeName) {
                element[attr] = newAttributeName;

                if (clearElement) {
                    element.value = "";
                    // remove validation classes (success, fail) and datepicker class to enable initialisation of new
                    // datepicker field
                    element.classList.remove('success', 'fail', 'hasDatepicker');
                }
            }
            array[i].current++;
        });
    }
};

/*
    convert the different form frequencies into a yearly amount which is used
    to generate a dataset
*/

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
    }
    return yearScalar;
};

// used to validate form text field inputs
const validateText = text => {
    if (text === undefined || text === null) {
        return false;
    }

    const pattern = /^[a-zA-Z0-9 *&-\[\]\{\}\(\)]{1,30}$/;
    return pattern.test(text);
};

// used to validate form number field inputs
const validateNumber = text => {
    if (text === undefined || text === null) {
        return false;
    }

    const pattern = /^-?[0-9]+(\.[0-9][0-9]?)?$/;
    return pattern.test(text);
};


/*
    validation - runs checks on the active tab of the form to ensure that all tests
    are passed. If successful the function will invoke the function passed through (i.e. func())
*/
const validation = func => {
    // get all elements on current tab with an 'id' that aren't a div, i.e. form data
    const elements = getActiveTab().querySelectorAll(':not(div)[id]');

    if (elements) {
        let fails = 0;
        let emailPattern = /\S+@\S+/;
        let errorHTML = '';

        elements.forEach(element => {
            const value = element.value.trim();
            const id = element.id;

            // form element names are different on the general tab and need to be handled differently
            const nameStr = getActiveTab().id !== 'general-tab' ?
                id.slice(id.indexOf('-') + 1, id.lastIndexOf('-')) :
                element.id.replace(/-/g, ' ');

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

                    errorHTML += `<li>You must input a valid email address.</li>`;
                } else if (id.includes('amount') && isNaN(value)) {
                    element.classList.add('fail');
                    fails++;
                    errorHTML += `<li>You must enter a valid number for the field "${name}".</li>`;
                } else if (id.includes('date')) {
                    if (startDate && endDate) {
                        if (startDate >= endDate && id.includes('start')) {
                            element.classList.add('fail');
                            fails++;
                            errorHTML += `<li>Start date must take place before the end date.</li>`;
                        }
                    }
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
            return true;
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
            return false;
        }
    } else {
        return false;
    }
};

/*
    resetErrorMsg: used to hide the error message container and remove the content
*/
const resetErrorMsg = () => {
    if (typeof error == 'undefined' || error === null) {
        return false;
    }

    error.classList.add('hide');
    error.innerHTML = '';

    return true;
};

/*
    Loop through the element provided until the node name matches that specified AND the element has an ID attribute
*/
const getTargetNodeID = (el, targetNode) => {
    // check that nodeName is a part of 'el', and that 'targetNode' has been populated
    if (el.nodeName && targetNode) {
        while (el != document.body) {
            targetNode = targetNode.toUpperCase();
            if (el.nodeName == targetNode && el.id != '') {
                return el.id;
            }
            el = el.parentNode;
        }
    }
    // if it did not find what the relevant element
    return false;
};
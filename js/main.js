let minRows = 1; // minimum total number of form rows
let maxRows = 12; // maximum total number of form rows
let startTab = 0; // first tab = 0

let tabIdentifier = 'tab'; // word which identifies all tabs

const getActiveTab = () => document.querySelectorAll('section[id*="' + tabIdentifier + '"]:not(.hide)')[0];

const getTabs = () => document.querySelectorAll('section[id*="' + tabIdentifier + '"]');

const pushValuesToArray = (array, ref, elementName, elementAttribute, count) => {
    array.push({
        "ref": ref,
        "prefix": elementName,
        "attribute": elementAttribute,
        "count": count,
        "current": 1
    });
};

const getAttributePrefix = attributeValue => {
    if (typeof (attributeValue) == "string") {
        let splitStringPosition = parseInt(attributeValue.lastIndexOf('-')) + 1;

        return attributeValue.substr(0, splitStringPosition);
    }
};

function initTab(startTab) {
    // function which will set the current tab
    let allTabs = getTabs();
    let getTabIndicators = document.querySelectorAll('#progress-indicator span');
    let numberOfTabs = allTabs.length;

    for (let i = 0; i < numberOfTabs; i++) {
        if (i === startTab) {
            allTabs[i].classList.remove('hide');
            getTabIndicators[i].classList.add('active');
        } else {
            allTabs[i].classList.add('hide');
            getTabIndicators[i].classList.remove('active');
        }
    }
}


function navigateTabs(type) {
    let activeTab = getActiveTab();
    let tabs = getTabs();

    let getTabIndicators = document.querySelectorAll('#progress-indicator span');

    tabs.forEach((tab, index) => {

        let currentTabNumber = index + 1; // need to add one as first array item has index of 0
        let numberOfTabs = tabs.length; // length of array indicates number of tabs

        // loop through all elements that match query selector and only continue for the current active tab
        if (tab.id === activeTab.id) {
            let adjTabNumber;
            if (type === 'next') {
                tabs[index + 1].classList.remove('hide');
                adjTabNumber = currentTabNumber + 1;
            } else if (type === 'prev') {
                tabs[index - 1].classList.remove('hide');
                adjTabNumber = currentTabNumber - 1;
            } else {
                console.log('ERROR: Function argument "type" value is not accepted.');
            }

            activeTab.classList.add('hide');

            // buttons to be displayed are based on what the next tab is, i.e. if I clicked the next button whilst on tab 1, then I need to consider what buttons should be shown based on tab 2 - hence adjTabNumber accounts for this
            if (adjTabNumber === 1) {
                document.getElementById('prev-btn').classList.add('hide');
                document.getElementById('next-btn').classList.remove('hide');
                document.getElementById('submit-btn').classList.add('hide');
            } else if (adjTabNumber > 1 && adjTabNumber < numberOfTabs) {
                // show next and previous
                document.getElementById('prev-btn').classList.remove('hide');
                document.getElementById('next-btn').classList.remove('hide');
                document.getElementById('submit-btn').classList.add('hide');
            } else if (adjTabNumber === numberOfTabs) {
                // show prev only
                document.getElementById('prev-btn').classList.remove('hide');
                document.getElementById('next-btn').classList.add('hide');
                document.getElementById('submit-btn').classList.remove('hide');
            } else {
                // show prev only
                document.getElementById('prev-btn').classList.remove('hide');
                document.getElementById('next-btn').classList.add('hide');
                document.getElementById('submit-btn').classList.remove('hide');
            }
        }
    });
}

function addFormRow(el) {
    let parentElement = el.parentNode.parentNode
    let element = document.getElementById(parentElement.id);
    let elementId = element.id;
    let elementIdPrefix = getAttributePrefix(elementId);

    let countElements = element.parentNode.querySelectorAll('[id^="' + elementIdPrefix + '"').length;

    // check to make sure that there is at least one row before deleting
    if (countElements < maxRows) {
        let idToAppendTo = parentElement.parentNode.id;

        let copyHTML = element.cloneNode(true);

        // see how many of this id already exist and increment it

        let newElementId = elementIdPrefix + parseInt(countElements + 1);
        // change cloned element id to the new incremented value to keep unique
        copyHTML.id = newElementId;
        // execute the clone
        document.getElementById(idToAppendTo).appendChild(copyHTML);

        let newElementChildren = document.getElementById(newElementId);

        changeAttributeValues(newElementChildren, 'name');
        changeAttributeValues(newElementChildren, 'id');
    } else {
        alert("NOTE: You have reached the maximum permittable amount of form rows.");
    }
}


function changeAttributeValues(parentElement, attribute) {
    /*
    Function is invoked when a new form row is added. It will iterate through new form elements and update the relevant attribute values
    to ensure they remain unique (e.g. name and id)
    */
    // find all elements under parent that need to be relabelled
    elements = parentElement.querySelectorAll('[' + attribute + ']');

    elements.forEach(childElement => {
        let childElementPrefix = getAttributePrefix(childElement[attribute]);

        // get the number of HTML elements with the same attribute name prefix
        let countAttributeName = document.querySelectorAll('[' + attribute + '^="' + childElementPrefix + '"');

        // change the attribute value
        childElement[attribute] = childElementPrefix + countAttributeName.length;
        // set the new element contents to blank and remove any validation styling
        childElement.value = "";
        childElement.classList.remove('success', 'fail');
    });
}


function removeFormRow(element) {
    let parentDiv = element.parentNode.parentNode;
    let parentDivIdPrefix = getAttributePrefix(parentDiv.id);

    let countRemainingRows = document.querySelectorAll('[id^="' + parentDivIdPrefix + '"]').length;

    // check to make sure that there is at least one row before deleting
    if (countRemainingRows > minRows) {
        // delete the relevant form row
        parentDiv.remove();
        // invoke function to iterate through element ID's and names to reindex them so they are in consecutive order with no duplicates
        elementReindex();
    } else {
        alert('ERROR: Cannot delete the last form row.');
    }
}

function elementReindex() {
    /* 
    Runs when a row has been removed.
    */

    // limit the scope of the application to the current tab
    let parentID = getActiveTab().id;

    // element arrays that need to be changed stored in an array to loop through
    let attributes = ['id', 'name'];

    // cycle through the element attributes that need to be reindexed
    let elements = [];

    attributes.forEach(attribute => {
        let arrayOfElements = document.getElementById(parentID).querySelectorAll('[' + attribute + ']');

        arrayOfElements.forEach(element => {
            let currentElementAttribute = element[attribute];
            let elementAttributePrefix = getAttributePrefix(currentElementAttribute);

            let ref = "[" + attribute + "]" + elementAttributePrefix;
            let countOfAttribute = document.getElementById(parentID).querySelectorAll('[' + attribute + '^="' + elementAttributePrefix + '"]').length;


            if (elements.length === 0) {
                // if there array has no values then set first value
                pushValuesToArray(elements, ref, elementAttributePrefix, attribute, countOfAttribute);
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
                    pushValuesToArray(elements, ref, elementAttributePrefix, attribute, countOfAttribute);
                }
            }
        });
    });

    processElementReindex(elements);
}

function processElementReindex(array) {
    if (array.length === 0) {
        console.log('ERROR: empty array passed to function - cannot proceed');
        return;
    }

    for (let i = 0; i < array.length; i++) {
        let attribute = array[i]["attribute"];
        let attributePrefix = array[i]["prefix"];
        let elements = document.querySelectorAll('[' + attribute + '^="' + attributePrefix + '"]');

        elements.forEach(element => {
            let currentAttributeName = element[attribute];
            let attributeCurrent = array[i]["current"];
            let newAttributeName = attributePrefix + attributeCurrent;

            if (currentAttributeName !== newAttributeName) {
                // console.log('Old: ' + element[attribute] + ' ~ New: ' + newAttributeName);
                element[attribute] = newAttributeName;

            }
            array[i]["current"]++;

        });

    }
}



/* 

FORM CALCULATION FUNCTIONS

*/


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


// event listener
const form = document.querySelector('form');

form.addEventListener('change', event => {
    if (event.target.nodeName === 'INPUT') {
        if (event.target.id.includes('label')) {
            if (validateText(event.target.value)) {
                event.target.classList.add('success');
                event.target.classList.remove('fail');
            } else {
                event.target.classList.add('fail');
                event.target.classList.remove('success');
            }
        } else if (event.target.id.includes('amount')) {
            if (validateNumber(event.target.value)) {
                event.target.classList.add('success');
                event.target.classList.remove('fail');
            } else {
                event.target.classList.add('fail');
                event.target.classList.remove('success');
            }
        }

    } else if (event.target.nodeName === 'SELECT') {
        if (event.target.id.includes('frequency')) {
            if (event.target.value !== "") {
                event.target.classList.add('success');
                event.target.classList.remove('fail');
            } else {
                event.target.classList.add('fail');
                event.target.classList.remove('success');
            }
        }
    }
});




initTab(startTab);
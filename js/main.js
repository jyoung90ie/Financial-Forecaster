let minRows = 1; // minimum total number of form rows
let maxRows = 12; // maximum total number of form rows
let startTab = 0; // first tab = 0

let tabIdentifier = 'tab'; // word which identifies all tabs

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const form = document.querySelector('form');
const summaryTab = document.querySelector('#summary-tab');


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

function initTab(startTab = 0) {
    // function which will set the current tab
    let allTabs = getTabs();
    let getTabIndicators = document.querySelectorAll('#progress-indicator span');
    let numberOfTabs = allTabs.length;

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
            getTabIndicators[i].classList.add('active');
        } else {
            allTabs[i].classList.add('hide');
            getTabIndicators[i].classList.remove('active');
        }
    }

    nextBtn.classList.remove('hide');
    prevBtn.classList.remove('hide');
    submitBtn.classList.remove('hide');

    if (startTab === 0) {
        submitBtn.classList.add('hide');
        prevBtn.classList.add('hide');
    } else if (startTab === maxTab) {
        nextBtn.classList.add('hide');
    } else {
        submitBtn.classList.add('hide');
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
                prevBtn.classList.add('hide');
                nextBtn.classList.remove('hide');
                submitBtn.classList.add('hide');
            } else if (adjTabNumber > 1 && adjTabNumber < numberOfTabs - 1) {
                // show next and previous
                prevBtn.classList.remove('hide');
                nextBtn.classList.remove('hide');
                submitBtn.classList.add('hide');
            } else if (adjTabNumber === numberOfTabs - 1) {
                // show prev only
                prevBtn.classList.remove('hide');
                nextBtn.classList.add('hide');
                submitBtn.classList.remove('hide');
            } else if (adjTabNumber === numberOfTabs) {
                console.log('test');
                prevBtn.classList.remove('hide');
                nextBtn.classList.add('hide');
                submitBtn.classList.add('hide');
            } else {
                // show prev only
                prevBtn.classList.remove('hide');
                nextBtn.classList.add('hide');
                submitBtn.classList.add('hide');
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

// form event listener
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

const filterArray = (data, filter) => {
    let array;

    if (typeof data !== 'object') {
        array = Array.from(data);
    } else {
        array = data;
    }

    const filteredData = array.filter(name => name.includes(filter));

    let newData = [];
    let last;

    for (let i = 0; i < filteredData.length; i++) {
        let item = filteredData[i];
        let curr = item.substr(item.lastIndexOf('-') + 1) - 1;

        if (last === 'undefined') {
            last = curr;
            newData[curr] = {};
        }

        if (last !== curr) {
            newData[curr] = {};
        }

        if (item.includes('label')) {
            newData[curr]['label'] = form[item].value;
        } else if (item.includes('amount')) {
            newData[curr]['amount'] = Number(form[item].value);
        } else if (item.includes('frequency')) {
            newData[curr]['frequency'] = form[item].value;
        } else if (item.includes('type')) {
            newData[curr]['type'] = form[item].value;
        } else {
            newData[curr][item] = form[item].value;
        }
        last = curr;
    }

    return newData;
};

const numberFormat = num => {
    if (typeof num === 'number') {
        return Math.round(num).toLocaleString();
    } else {
        return num;
    }

};


const netWorthCalc = (accounts, incomes, outgoings, years = 3) => {

    console.log(accounts);
    console.log(incomes);
    console.log(outgoings);

    let netWorth = 0;

    console.log('net worth after 1 year ----- ');


    // calculate the total net worth opening position (i.e. total account balance)

    const accountsTotal = accounts.reduce((total, account) => {
        total += account.amount;
        return total;
    }, 0);

    // calculate the yearly total for income and outgoings

    const incomeTotal = incomes.reduce((total, income) => {
        total += income.amount * getScalar(income.frequency);
        return total;
    }, 0);

    const outgoingTotal = outgoings.reduce((total, outgoing) => {
        total -= outgoing.amount * getScalar(outgoing.frequency);
        return total;
    }, 0);

    let netWorthHTML = '';
    let openingBalance = accountsTotal;
    let income = incomeTotal;
    let outgoing = outgoingTotal;
    let closingBalance = openingBalance + income + outgoing;

    // create summary table for data split by year
    for (let i = 0; i <= years; i++) {
        if (i > 0) {
            openingBalance = accountsTotal + (income + outgoing) * i;
            closingBalance = openingBalance + (income + outgoing);
        }
        if (i === years) {
            income = '-';
            outgoing = '-';
            closingBalance = '-';
        }

        netWorthHTML += `
        <tr>
            <td>${i}</td>
            <td>${numberFormat(openingBalance)}</td>
            <td>${numberFormat(income)}</td>
            <td>${numberFormat(outgoing)}</td>
            <td>${numberFormat(closingBalance)}</td>
        </tr>`;
    }

    summaryTab.innerHTML = `
            <h2>Net Worth after ${years} years</h2>
            <table class="table text-center">
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Opening Balance</th>
                        <th>Income</th>
                        <th>Outgoings</th>
                        <th>Closing Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${netWorthHTML}
                </tbody>
            </table>`;

};

form.addEventListener('submit', event => {
    event.preventDefault();

    const formData = Array.from(form)
        .filter(element => element.name !== '')
        .map(element => element.name);

    // console.log(formData);

    const accountData = filterArray(formData, 'account');
    const incomeData = filterArray(formData, 'income');
    const outgoingData = filterArray(formData, 'outgoing');

    navigateTabs('next');
    netWorthCalc(accountData, incomeData, outgoingData, 10);



});



initTab(5);
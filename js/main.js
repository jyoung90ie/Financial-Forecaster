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


const getActiveTab = () => document.querySelector('section[id*="' + tabIdentifier + '"]:not(.hide)');

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

    updateNavButtons();
    updateTabIndicator();
};

const updateNavButtons = () => {
    const numberOfTabs = getTabs().length - 1;
    const activeTab = Array.from(getTabs()).indexOf(getActiveTab());

    nextBtn.classList.add('hide');
    prevBtn.classList.add('hide');
    submitBtn.classList.add('hide');

    if (activeTab === 0) {
        // first tab - only show next button
        nextBtn.classList.remove('hide');
    } else if (activeTab === numberOfTabs) {
        // last tab - only show previous button
        prevBtn.classList.remove('hide');
    } else if (activeTab === numberOfTabs - 1) {
        // penultimate tab - show previous and submit buttons
        prevBtn.classList.remove('hide');
        submitBtn.classList.remove('hide');
    } else {
        // if none of above, show next and previous
        nextBtn.classList.remove('hide');
        prevBtn.classList.remove('hide');
    }
};


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

const addFormRow = elementId => {
    const element = document.getElementById(elementId);
    const elementIdPrefix = getAttributePrefix(elementId);

    const countElements = document.querySelectorAll('[id^="' + elementIdPrefix + '"').length;

    // check to make sure that there is at least one row before deleting
    if (countElements < maxRows) {
        const idToAppendTo = element.parentNode.id;
        let copyHTML = element.cloneNode(true);

        // see how many of this id already exist and increment it
        const newElementId = elementIdPrefix + parseInt(countElements + 1);
        // change cloned element id to the new incremented value to keep unique
        copyHTML.id = newElementId;
        // execute the clone
        document.getElementById(idToAppendTo).appendChild(copyHTML);

        const newElementChildren = document.getElementById(newElementId);

        changeAttributeValues(newElementChildren, 'name');
        changeAttributeValues(newElementChildren, 'id');
    } else {
        alert("NOTE: You have reached the maximum permittable amount of form rows.");
    }
};

const removeFormRow = elementId => {
    const element = document.getElementById(elementId);
    const parentDivIdPrefix = getAttributePrefix(elementId);

    const countRemainingRows = document.querySelectorAll('[id^="' + parentDivIdPrefix + '"]').length;

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


const changeAttributeValues = (parentElement, attribute) => {
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
};

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
};

const processElementReindex = array => {
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
                element[attribute] = newAttributeName;
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

/*
    netWorkCalc takes in 3 data arrays and an integer. The function loops through 
    the data arrays and calculates the cumulative total 
    for a year. It then repeats this for x number of years and outputs a table 
    displaying opening balance, yearly income and outgoing, and closing balance.
*/
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
            <table class="table table-responsive text-center">
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
        console.log(element.id, element.name);
        const value = element.value.trim();
        const id = element.id;



        // form element names are different on the general tab and need to be handled differently
        const nameStr = getActiveTab().id !== 'general-tab' ? id.slice(id.indexOf('-') + 1, id.lastIndexOf('-')) : element.id.replace('-', ' ');

        // let nameStr = '';
        // if (getActiveTab().id !== 'general-tab') {
        //     nameStr = id.slice(id.indexOf('-') + 1, id.lastIndexOf('-'));
        //     console.log(nameStr);
        // } else {
        //     nameStr = element.id.replace('-', ' ');
        // }

        const name = nameStr[0].toUpperCase() + nameStr.substr(1).toLowerCase();


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
        resetErrorMsg();
        func();
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

const resetErrorMsg = () => {
    error.classList.add('hide');
    error.innerHTML = '';
};
/*******************************
   event listeners
*******************************/

form.addEventListener('click', event => {
    // console.log(event);
    const activeTab = getActiveTab();
    const target = event.target;

    // navigation button actions
    if (target.id === 'prev-btn') {
        navigateTabs('prev');
    } else if (target.id === 'next-btn') {
        // validation

        validation(() => navigateTabs('next'));

        // navigateTabs('next');
    } else if (target.id === 'submit-btn') {
        event.preventDefault(); // do not refresh form

        // create data array by removing any fields without a name
        const formData = Array.from(form)
            .filter(element => element.name !== '')
            .map(element => element.name);

        // split formdata array into specific arrays using function
        const accountData = filterArray(formData, 'account');
        const incomeData = filterArray(formData, 'income');
        const outgoingData = filterArray(formData, 'outgoing');

        // transfer data arrays to function to determine net worth
        netWorthCalc(accountData, incomeData, outgoingData, 10);

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
    }
});

initTab(startTab);
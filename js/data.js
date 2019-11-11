/*
    Contains the functions used to generate the data for forecasting
*/

/*
    getElements: creates an array of all the form elements which have the 'name' attribute (i.e. all input fields)

    currentTabFilter: if true this will return only the elements contained on the current tab
*/
const getElements = (inputData, currentTabFilter = false) => {
    if (inputData == undefined) {
        console.log('getElements(): inputData undefined');
        return false;
    }

    let arr;
    let outputArr;

    if (!isArray(inputData)) {
        arr = Array.from(inputData);
    } else {
        arr = inputData;
    }

    if (currentTabFilter) {
        outputArr = arr
            .filter(element => getActiveTab().contains(element));
    } else {
        outputArr = arr
            .filter(element => element.name !== '')
            .map(element => element.name);
    }

    return outputArr;
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

    if (inputData === undefined) {
        console.log('createDataArray(): inputData undefined');
        return false;
    }

    if (!isArray(inputData)) {
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
    if (isNumber(num)) {
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
            /* transform the value to match the type of account and transaction, for example,
                outgoings should always be negative */
            if (liabilities.includes(val.source) || liabilities.includes(val.type)) {
                // check that the user hasn't already input the number as a negative
                if (val.amount > 0) {
                    amount = -val.amount;
                }
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
    saveData: used to save form data to local storage
*/
const saveData = () => {
    const elements = getElements(form, true);
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
            lastParent = getTargetNodeID(element, 'DIV');
        } else {
            const type = item.substr(0, item.indexOf('-'));
            // only continue if type has a string, i.e. it begins with 'name-blahblah' otherwise ignore it
            if (type !== '') {
                let elements = document.querySelectorAll(`[id^=${type}-fields]`);
                lastParent = elements[elements.length - 1].id;

                // if element does not exist then create it
                if (lastParent) {
                    addFormRow(lastParent);
                }

                // store element ref and value to array and update it later
                toUpdate.push({
                    ref: item,
                    value: localStorage.getItem(item)
                });
            }
        }
    });

    // for those form elements that did not exist and had to be created, retrieve the values and populate
    toUpdate.forEach(item => {
        let element = document.querySelector(`[name=${item.ref}]`);

        if (element) {
            element.value = item.value;
        }
    })
};
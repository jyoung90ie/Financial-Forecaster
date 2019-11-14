/*
    Contains the functions used to generate the data for forecasting
*/

/*
    getElements: creates an array of all the form elements which have the 'name' attribute (i.e. form input fields)
    or are part of the active tab.

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
    genMonthlyData:

    produces a monthly dataset for X years as determined by the passthrough variable
*/
const updateDataArray = (dataArray, ref, date, amount, description, type) => {
    dataArray.push({ ref, date, amount, description, type });
    return dataArray;
}


const genMonthlyData = (inputData, startDate, endDate) => {
    // calculate the number of days between the start and end dates
    const dayTime = 24 * 60 * 60 * 1000; // milliseconds in a day
    const amountOfDays = (endDate.getTime() - startDate.getTime()) / (dayTime) // number of days between two dates, this is used as number of iterations    

    const liabilities = ['liability', 'cc', 'outgoing']; // if inputData source or type contains any of these then the amount should be negative

    let dataArray = [];
    let nw = 0;

    inputData.forEach(formInput => {
        let amount = formInput.amount;
        let ref = formInput.ref;
        let desc = formInput.description;
        let type = formInput.type;
        let source = formInput.source;
        let freq = formInput.frequency;

        // convert startDate to timestamp
        let date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        
        /* if the ref/type indicates this is an outgoing amount and the input amount is positive, transfer to negative amount */
        if (liabilities.includes(source) || liabilities.includes(type)
            && amount > 0) {
            // check that the user hasn't already input the number as a negative
            amount = -1 * amount;
        }

        // for adding account entries (i.e. starting balance) and one-off transactions
        if (formInput.source.includes('account')) {
            // check if dataArray has any values
            // if empty, create first record
            if (dataArray.length == 0) {
                ref = 'starting-balance';
                desc = 'Account balance at opening';
                type = 'account';

                updateDataArray(dataArray, ref, date, amount, desc, type);
            } else {
                // update the first entry
                dataArray[0].amount += amount;
            }
            return;
        }

        // need to account for one off transactions
        if (formInput.frequency == 'once') {
            desc = formInput.description + ' [one-off]';
            date += dayTime * 14; // date = startDate + 14 days 

            updateDataArray(dataArray, ref, date, amount, desc, type);
            return;
        }

        // if it has got to this point then the frequency will be an integer
        freq = parseInt(freq);

        // for recurring transactins
        let curDate;
        let daysSinceUpdate;

        for (i = 1; i < amountOfDays + 1; i++) {
            if (curDate === undefined) {
                // first time this item has been entered
                // first entry date will be on (1 month - 1 day) after the start date
                curDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate() - 1).getTime();

                updateDataArray(dataArray, ref, curDate, amount, desc, type);
                daysSinceUpdate = 0;
            } else {
                curDate += dayTime;

                // if the days since last update is equal to the frequency of updates then push update
                if (daysSinceUpdate === freq) {
                    updateDataArray(dataArray, ref, curDate, amount, desc, type);

                    daysSinceUpdate = 0; // reset days counter
                } else {
                    daysSinceUpdate += 1; // increment days counter
                }
            }
        };
    });

    // sort array by date
    dataArray.sort((a, b) => a.date - b.date);

    // now array is sorted, add networth field (nw)
    let outputData = dataArray.map(d => {
        nw += d.amount;
        return {
            amount: +d.amount,
            date: d.date,
            description: d.description,
            ref: d.ref,
            type: d.type,
            nw: nw
        }
    });

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

    // if tab number > 0 (i.e. from the accounts page onwards)
    if (tabNum > 0) {
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
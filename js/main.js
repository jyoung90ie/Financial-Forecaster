function navigateTabs(type) {
    var activeTab = document.querySelectorAll('section[id*="tab-"]:not(.hide)')[0];
    var arrayOfTabs = document.querySelectorAll('section[id*="tab-"]');

    arrayOfTabs.forEach(function (item, index) {

        var currentTabNumber = index + 1; // need to add one as first array item has index of 0
        var numberOfTabs = arrayOfTabs.length; // length of array indicates number of tabs

        // loop through all elements that match query selector and only continue for the current active tab
        if (item.id === activeTab.id) {
            if (type === 'next') {
                arrayOfTabs[index + 1].classList.remove("hide");
                var adjTabNumber = currentTabNumber + 1;
            } else if (type === 'prev') {
                arrayOfTabs[index - 1].classList.remove("hide");
                var adjTabNumber = currentTabNumber - 1;
            } else {
                console.log('ERROR: Function argument "type" value is not accepted.');
            }

            activeTab.classList.add("hide");

            // buttons to be displayed are based on what the next tab is, i.e. if I clicked the next button whilst on tab 1, then I need to consider what buttons should be shown based on tab 2 - hence adjTabNumber accounts for this
            if (adjTabNumber === 1) {
                document.getElementById('prev-btn').classList.add('hide');
                document.getElementById('next-btn').classList.remove('hide');
            } else if (adjTabNumber > 1 && adjTabNumber < numberOfTabs) {
                // show next and previous
                document.getElementById('prev-btn').classList.remove('hide');
                document.getElementById('next-btn').classList.remove('hide');
            } else if (adjTabNumber === numberOfTabs) {
                // show prev only
                document.getElementById('prev-btn').classList.remove('hide');
                document.getElementById('next-btn').classList.add('hide');
            } else {
                // show prev only
                document.getElementById('prev-btn').classList.remove('hide');
                document.getElementById('next-btn').classList.add('hide');
            }
        }
    });
}

function addIncomeRow(el) {
    //var copyHTML = document.getElementById(idToCopy).cloneNode(true);

    var parentElement = el.parentNode.parentNode
    var element = document.getElementById(parentElement.id);
    var elementId = element.id;
    var elementIdPrefix = getAttributePrefix(elementId);

    var idToAppendTo = parentElement.parentNode.id;

    var copyHTML = element.cloneNode(true);

    // see how many of this id already exist and increment it
    var countElements = element.parentNode.querySelectorAll('[id^="' + elementIdPrefix + '"').length;
    var newElementId = elementIdPrefix + parseInt(countElements + 1);
    // change cloned element id to the new incremented value to keep unique
    copyHTML.id = newElementId;
    // execute the clone
    document.getElementById(idToAppendTo).appendChild(copyHTML);

    var newElementChildren = document.getElementById(newElementId);

    changeAttributeValues(newElementChildren, 'name');
    changeAttributeValues(newElementChildren, 'id');

}


function changeAttributeValues(element, attribute) {
    elementAll = element.querySelectorAll('[' + attribute + ']');
    elementAll.forEach(function (item) {
        var childElement = item[attribute];
        var childElementPrefix = getAttributePrefix(childElement);

        var checkElement = document.querySelectorAll('[' + attribute + '^="' + childElementPrefix + '"');

        item[attribute] = childElementPrefix + checkElement.length;
    });
}





function removeIncomeRow(element) {
    var parentDiv = element.parentNode.parentNode;
    var parentDivIdPrefix = getAttributePrefix(parentDiv.id);

    var countRemainingRows = document.querySelectorAll('[id^="' + parentDivIdPrefix + '"]').length;

    // check to make sure that there is at least one row before deleting
    if (countRemainingRows > 1) {
        // delete the relevant form row
        parentDiv.remove();
        // invoke function to iterate through element ID's and names to reindex them so they are in consecutive order with no duplicates
        elementReindex('tab-2');
    } else {
        alert('ERROR: Cannot delete the last row');
    }


}

function elementReindex(parentID) {
    /* 
    Runs when a row has been removed.

    Requirement:
    1. Needs to reindex all ID's
    2. Needs to reindex all Name's

    */

    // element arrays that need to be changed stored in an array to loop through
    var attributes = ['id', 'name'];


    /* define how I want the elements to be identified */


    // cycle through the element attributes that need to be reindexed
    var arrayOfAttributes = [];

    attributes.forEach(function (attribute) {
        // var arrayElementAttributes = [];

        var arrayOfElements = document.getElementById(parentID).querySelectorAll('[' + attribute + ']');

        // arrayElementAttributes.push(attribute);
        arrayOfElements.forEach(function (element) {
            var currentElementAttribute = element[attribute];
            var elementAttributePrefix = getAttributePrefix(currentElementAttribute);

            var ref = "[" + attribute + "]" + elementAttributePrefix;
            var countOfAttribute = document.querySelectorAll('[' + attribute + '^="' + elementAttributePrefix + '"]').length;


            if (arrayOfAttributes.length === 0) {
                // if there array has no values then set first value
                pushValuesToArray(arrayOfAttributes, ref, elementAttributePrefix, attribute, countOfAttribute);
            } else {
                // if array has at least one value then check the array to make sure the current ref is not already contained
                var findRefVal = 0;
                for (i = 0; i < arrayOfAttributes.length; i++) {
                    if (arrayOfAttributes[i]["ref"] === ref) {
                        // if the current ref ([attribute]elementprefix) is found set the value to 1 which means that the values will NOT be pushed to the array and end the loop
                        findRefVal = 1;
                        break;
                    }
                }

                // if the ref was not found then add it to the array
                if (findRefVal === 0) {
                    pushValuesToArray(arrayOfAttributes, ref, elementAttributePrefix, attribute, countOfAttribute);
                }
            }

        });
    });

    processElementReindex(arrayOfAttributes);
}

function processElementReindex(array) {
    if (array.length === 0) {
        console.log('ERROR: empty array passed to function - cannot proceed');
        return;
    }

    for (i = 0; i < array.length; i++) {
        var attribute = array[i]["attribute"];
        var attributePrefix = array[i]["prefix"];
        var elements = document.querySelectorAll('[' + attribute + '^="' + attributePrefix + '"]');

        elements.forEach(function (item) {
            var currentAttributeName = item[attribute];
            var attributeCurrent = array[i]["current"];
            var newAttributeName = attributePrefix + attributeCurrent;

            if (currentAttributeName !== newAttributeName) {
                console.log('Old: ' + item[attribute] + ' ~ New: ' + newAttributeName);
                item[attribute] = newAttributeName;

            }
            array[i]["current"]++;

        });

    }
}

function pushValuesToArray(array, ref, elementName, elementAttribute, count) {
    array.push({
        "ref": ref,
        "prefix": elementName,
        "attribute": elementAttribute,
        "count": count,
        "current": 1
    });
}

function getAttributePrefix(attributeValue) {
    if (typeof (attributeValue) == "string") {
        var splitStringPosition = parseInt(attributeValue.lastIndexOf('-')) + 1;

        return attributeValue.substr(0, splitStringPosition);
    }
}
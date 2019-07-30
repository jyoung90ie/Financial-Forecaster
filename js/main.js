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

    var idToAppendTo = parentElement.parentNode.id;
    var elementId = element.id;
    var copyHTML = element.cloneNode(true);


    var positionOfString = elementId.lastIndexOf('-') + 1;
    // var endOfElementId = parseInt(elementId.substr(positionOfString)) + 1;
    var elementIdPrefix = elementId.substr(0, positionOfString);

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
        var childPositionOfString = childElement.lastIndexOf('-') + 1;

        var childElementPrefix = childElement.substr(0, childPositionOfString);

        var checkElement = document.querySelectorAll('[' + attribute + '^="' + childElementPrefix + '"');

        item[attribute] = childElementPrefix + checkElement.length;
    });
}

function removeIncomeRow(element) {
    var parentDiv = element.parentNode.parentNode;

    parentDiv.remove();



}
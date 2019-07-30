function navigateTabs(type) {
    var activeTab = document.querySelectorAll('section[id*="tab-"]:not(.hide)')[0];
    var arrayOfTabs = document.querySelectorAll('section[id*="tab-"]');

    arrayOfTabs.forEach(function (item, index) {

        var currentTabNumber = index + 1; // need to add one as first array item has index of 0
        var numberOfTabs = arrayOfTabs.length;



        // console.log(item.id + ": index[" + currentTabNumber + "]");
        // console.log("current tab: " + item.id + " - active tab: " + activeTab.id);

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
    // var activeTabPosition = numberOfTabs.indexOf(activeTab);
    // console.log(activeTab);
    // console.log(numberOfTabs);
    // console.log(activeTabPosition);



    // for (var currentElement = element; currentElement !== document && currentElement; currentElement = currentElement.parentNode) {

    //     if (currentElement.id.startsWith('tab-')) {
    //         var currentTabParent = currentElement;

    //         for (var nextElement = currentElement.nextElementSibling; nextElement !== document && nextElement; nextElement = nextElement.nextElementSibling) {
    //             if (nextElement.id.startsWith('tab-')) {
    //                 var nextTabParent = nextElement;
    //                 break; // exit the loop
    //             }
    //         }
    //         break; // stop the loop once value found
    //     }
    // }

    // // var strPosition = currentTabId.lastIndexOf('-') + 1; // adding one as I want the character after the '-'

    // var nextTabId = 'tab-' + (parseInt(currentTabId.substr(strPosition, 1)) + 1); // take the current tab value and increment it by one to get next tab value

    // currentTabParent.classList.add("hide");
    // nextTabParent.classList.remove("hide");
}

function findAllTabs() {
    var activeTabParent = document.querySelectorAll('section[id^="tab-"]:not(.hide)')[0];
    var numberOfTabs = document.querySelectorAll('section[id^="tab-"]').length;

    var strPos = activeTabParent.id.lastIndexOf('-') + 1;


    var activeTabNumber = activeTabParent.id.substr(strPos, 1);

    console.log("Active tab: " + activeTabParent.id);
    console.log("Number of tabs: " + numberOfTabs);
    console.log("Tab: " + activeTabNumber + " of " + numberOfTabs);
    // console.log(document.querySelectorAll('<*(id="*tab-.*")*!(hide)>'));
}

// window.onload = function () {
//     findAllTabs();
// }
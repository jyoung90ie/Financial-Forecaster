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


/*******************************
  event listener used to determine what was clicked on the form
*******************************/
if (form) {
    form.addEventListener('click', event => {

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
                const elementNames = getElements(form);

                // split formdata array into specific arrays using function
                const formData = createDataArray(elementNames);
                const monthlyData = genMonthlyData(formData, 1);
                console.log(monthlyData);

                // transition to the next tab to show results
                validation(() => navigateTabs('next'));

                genChart2(monthlyData);

            }
            // add/remove form elements if icons clicked
            if (target.className.includes('fa-plus')) {
                // append new row

                // find the first parent div with an id attribute
                const parentID = getTargetNodeID(target, 'DIV');
                validation(() => addFormRow(parentID));

            } else if (target.className.includes('fa-trash-alt')) {
                // remove clicked row

                // find the first parent div with an id attribute
                const parentID = getTargetNodeID(target, 'DIV');
                removeFormRow(parentID);

                // call validation again to refresh error messages (or remove if no longer applicable), pass an empty callback function
                validation(() => {});
            }
        }
    });
}

// initTab(startTab);
initTab(5);
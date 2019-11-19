/*
    This is used to bring all the functionality together via the use of a form event listener.

    All settings values are created here.
*/

const minRows = 1; // minimum total number of form rows  - applies to accounts, income, and outgoing tabs.
const maxRows = 12; // maximum total number of form rows - applies to accounts, income, and outgoing tabs.
const startTab = 0; // first tab = 0 - enables the user to specify which tab should be displayed upon opening
const tabIdentifier = 'tab'; // word which identifies all tabs

// capture html elements as js variables
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const form = document.querySelector('form');
const summaryTab = document.querySelector('#summary-tab');
const progressIndicator = document.querySelector('#progress-indicator');
const contentBox = document.querySelector('.content-box');
const error = document.querySelector('#error-messages');
const outputTxt = document.querySelector('.summary-txt');

let startDate, endDate;
/*******************************
  event listener used to determine what was clicked on the form
*******************************/
if (form) {
    form.addEventListener('click', event => {

        const activeTab = getActiveTab();
        const target = event.target;

        // dates are captured in the format mm-dd-yyyy and need to be converted
        const fStartDate = document.querySelector('#start-date').value;
        const fEndDate = document.querySelector('#end-date').value;

        if (fStartDate && fEndDate) {
            // convert html inputs to js dates
            startDate = fStartDate.split("/");
            endDate = fEndDate.split("/");

            startDate = new Date(startDate[2], startDate[1] - 1, startDate[0]);
            endDate = new Date(endDate[2], endDate[1] - 1, endDate[0]);
        }


        if (target.hasAttribute('class') || target.hasAttribute('id')) {
            // navigation button actions
            if (target.id === 'prev-btn') {
                navigateTabs('prev');
            } else if (target.id === 'next-btn') {
                // validation
                validation(() => navigateTabs('next'));

            } else if (target.id === 'submit-btn') {
                event.preventDefault(); // do not refresh form

                // create an array of form element names by removing any without a name
                const elementNames = getElements(form);

                // split formdata array into specific arrays using function
                const formData = createDataArray(elementNames);
                const monthlyData = genMonthlyData(formData, startDate, endDate);

                // transition to the next tab to show results
                validation(() => navigateTabs('next'));

                // produce networth chart using d3
                genChart(monthlyData);

                // create an array with only the value amounts for transactions that take place on the start date
                const startingTrans = monthlyData.filter(d => d.date == monthlyData[0].date).map(d => d.amount);

                // sum the amounts from startingTrans to produce opening net worth figure
                const startNw = startingTrans.reduce((acc, val) => acc + val);
                const endNw = monthlyData[monthlyData.length - 1].nw;

                const differenceNw = (endNw - startNw).toLocaleString();

                const strStartDate = startDate.toLocaleDateString();
                const strEndDate = endDate.toLocaleDateString();

                outputTxt.innerHTML = `<p>Based on the information you have inputted, in the period 
                    (<strong>${strStartDate} - ${strEndDate}</strong>), your net 
                    worth has changed by <strong>${differenceNw}</strong>.</p>`;

                outputTxt.innerHTML += `<p class="row">
                                            <span class="offset-1 col-5">Start Date: ${strStartDate}</span>
                                            <span class="col-5">End Date: ${strEndDate}</span>
                                        </p>`;
                outputTxt.innerHTML += `<p class="row">
                                            <span class="offset-1 col-5">Opening Net Worth: ${startNw.toLocaleString()}</span>
                                            <span class="col-5">Closing Net Worth: ${endNw.toLocaleString()}</span>
                                        </p>`;
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

                // call validation again to refresh error messages (or remove if no longer applicable), 
                // pass an empty callback function
                validation(() => { });
            }
        }
    });
}



// datepicker format
let dFormat = 'dd/mm/yy';

// initialise datepicker if input field has class 'datepicker'
$(document).ready(function () {
    $(document).on("focus", ".datepicker", function () {
        $(this).datepicker();
    });
});

$.datepicker.setDefaults({
    dateFormat: dFormat,
    changeMonth: true,
    changeYear: true
});

initTab(startTab);
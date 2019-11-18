# Financial Scenario Projection

This tool has been created to help you to assess your financial circumstances. It takes your current assets and 
liabilities (e.g. current account and credit card balances), regular incomes and outgoings, and outputs your financial 
status at some point in the future (as determined by you).

This can be used to perform 'what-if analysis' on your income and outgoings, for example, if you decide to sign-up for a
 gym membership, you can see the impact of this on your financial health over X time period.

## UX

The UX has been designed to be simple, intuitive, and make the input experience as fluid as possible. Once a user has 
completed the form atleast once the data will be saved, enabling them to quickly go back and forward between tabs.

For example, a user wants to understand what the impact on their savings will be over a 3 year period if they reduce 
their TV and Internet Bill by 23/month.
- The user populates the form with the following data:
    1) Personal Data, selecting the goal to 'Increase Savings'
    2) Current Assets and Liabilities (i.e. account balances)
    3) Income(s) with frequency (e.g. monthly)
    4) Outgoing(s) with frequency (e.g. weekly) - including the TV and Internet bill at the current price
    5) Submits the data and is presented with a visual representation of their net worth over time
- To then determine the impact of this change in outgoings, the user then does the following:
    6) Clicks the 'Previous' button until they reach the 'Regular Outgoing(s)' tabs
    7) Updates the 'TV and Internet' bill to the new price
    8) Submits the data again and is now presented with their net worth over time
    9) Comparing the outputted values to those outputted at Step 5 gives the impact of reducing this bill


This section is also where you would share links to any wireframes, mockups, diagrams etc. that you created as part of 
the design process. These files should themselves either be included in the project itself (in an separate directory), 
or just hosted elsewhere online and can be in any format that is viewable inside the browser.

## Features

### Existing Features
- Dynamic Forms - the user can add and remove input fields to match their requirements (e.g. for accounts )
- One Page Form - the form is one page of HTML and is made to look like seperate pages through the use of CSS and 
Javascript
- Transitions - CSS transitions are used to improve the user experience and visually indicate the direction of travel
- Progress Indicator - a visual indicator has been placed at the bottom of the form to provide the user with feedback 
on their progress through the form
- Validation - the form is validated each time the user tries to transition to another tab, and when the user tries to 
add a new row for data capture (e.g. a new account). This ensures the data inputs are of a minimum standard before 
processing
- Net Worth - the data provided by the user is converted into a time-series data object which is then used to output 
the relevant net worth information over time. For example the user can determine their net worth at the point-in-time 
X, not just at the end of the time period.
- Net Worth Chart - Using D3.js a chart is produced showing the evolution of the user's net worth over the time 
period specified.

### Features Left to Implement
- Multiple currencies
- Optional start and end dates for Income/Outgoing(s)



## Technologies Used

In this section, you should mention all of the languages, frameworks, libraries, and any other tools that you have used 
to construct this project. For each, provide its name, a link to its official site and a short sentence of why it was used.

- HTML
- CSS
- Javascript
- [Bootstrap v4.3.1](https://getbootstrap.com/)
- [Font Awesome v5.11.2](https://fontawesome.com/)
- [Jasmine v3.5.0](https://jasmine.github.io/): For testing JS functionality
- [JQuery v1.12](https://jquery.com/): Used to add a calendar datepicker to the form.
- [D3-tip v0.9.1](http://labratrevenge.com/d3-tip/): Used for creating chart tooltips.
- [D3.js v5.12.0](https://d3js.org/): This is used to chart the user's net worth over time


## Testing

### Jasmine Testing
- Picked up the need to covert '.nodeName' attributes to lower case and comparison string to lower case
- Picked up that the validateNumber regular expression was only allowing positive numbers, some users may not find this 
intuitive and prefer to input the numbers as negatives. This can then be processed correctly in the background.

### Manual Testing

This was tested across multiple browsers and devices, this resulted in some additional challenges:
    - I used Chrome as my main development browser but upon testing the JS on Microsoft Edge, I noted that Edge did not 
    have the 'event.target.path' attribute. To resolve this required the discontinuation of 'event.target.path' and 
    creation of a new function (getTargetNodeID)

## Deployment

Using GitHub Pages I deployed the website from the Master branch. You can see the deployed website [here]
(https://jyoung90ie.github.io/Financial-Forecaster/).

Using the Master branch means that as I make additional commits these will be reflected on the deployed website.

If you wish to run this project locally, you will need to download and install Git to your computer - see [here]
(https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

Once you have installed Git, you will need to create a folder on your computer and then run the _git clone_ command. A 
demonstration of this code can be seen below:

```terminal
mkdir Financial-Forecaster
cd Financial-Forecaster
git clone https://github.com/jyoung90ie/The-Monkees.git
```

Upon completion open the _index.html_ file within _Financial-Forecaster_ with your preferred browser. The tool will now 
work without any further user requirements.
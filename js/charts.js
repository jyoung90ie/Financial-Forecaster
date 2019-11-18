const margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 50
};
const graphWidth = 650 - margin.right - margin.left;
const graphHeight = 500 - margin.top - margin.bottom;

const svg = d3.select('#netWorthChart')
    .append('svg')
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphHeight + margin.top + margin.bottom);

const chart = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// scales
const x = d3.scaleTime()
    .range([0, graphWidth]);

const y = d3.scaleLinear()
    .range([graphHeight, 0]);

const xAxisGroup = chart.append('g')
    .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = chart.append('g')

// create a line path for user's net worth
const lineNw = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(parseInt(d.nw)));

const lineGroup = chart.append('g')
    .attr('class', 'line');

const tooltip = d3.tip()
    .attr('class', 'tooltip')
    .html(d => {

        return `
        <div class="header">Transaction details</div>
        <div class="body">
            <div><strong>Date:</strong> ${new Date(d.date).toLocaleDateString()}</div>
            <div><strong>Description:</strong> ${d.description}</div>
            <div><strong>Amount:</strong> ${d.amount.toLocaleString()}</div>
        </div>
        <div class="footer">
            <strong>Net Worth:</strong> ${d.nw.toLocaleString()}
        </div>`;
    });

// initialise tooltip
chart.call(tooltip);

// generate d3 chart
const genChart = (data) => {
    // set axes domains
    console.log(d3.extent(data, d => new Date(d.date)));
    x.domain(d3.extent(data, d => new Date(d.date)));
    y.domain([
        Math.min(d3.min(data, d => parseInt(d.nw)), 0),
        d3.max(data, d => parseInt(d.nw))
    ]);


    // networth line
    const line = lineGroup.selectAll('path')
        .data([data]);

    // remove any unneeded paths
    line.exit().remove();

    // update existing paths
    line.attr('d', lineNw);

    // add new paths
    line.enter()
        .append('path')
        .attr('d', lineNw);

    // create axes
    const xAxis = d3.axisBottom(x)
        .ticks(8)
        .tickFormat(d3.timeFormat('%b %Y'));

    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d.toLocaleString());

    // create shapes inside relevant groups
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end');


    // create circles for objects
    const circles = chart.selectAll('circle')
        .data(data);

    // remove unwanted points
    circles.exit().remove();


    // update current points
    circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(parseInt(d.nw)));

    // add new points
    circles.enter()
        .append('circle')
        .attr('r', 3)
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(parseInt(d.nw)))
        .attr('class', 'circle');

    chart.selectAll('circle')
        .on('mouseover', (d, i, n) => {
            d3.select(n[i])
                .attr('r', 4);
            tooltip.show(d, n[i]);
        })
        .on('mouseout', (d, i, n) => {
            d3.select(n[i])
                .attr('r', 3);
            tooltip.hide();
        });


}

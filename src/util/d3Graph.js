var d3 = require('d3');
var actions = require('../actions/actions');

module.exports = {

  create: function(el) {
    el = d3.select(el);
    var svg = el.append('svg')
      .attr('width', this._getContainerWidth(el))
      .attr('height', this._getContainerHeight());

    svg.append('g')
      .attr('class', 'd3-area')
      .attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');

    // Displays date when brushing
    el.append('strong')
      .style('position', 'absolute')
      .attr('class', 'tooltip fill-darken3 hidden round pad1x pad0y small strong z10');
  },

  resize: function(el) {
    el = d3.select(el);
    el.select('svg')
      .attr('width', this._getContainerWidth(el))
      .attr('height', this._getContainerHeight());
  },

  noData: function(el) {
    el.append('text')
      .text('No data found.')
      .attr('transform', 'translate(-40,0)');
  },

  update: function(el, state) {
    el = d3.select(el);
    var g = el.selectAll('.d3-area');
    g.html(''); // TODO This is dirty

    if (!state.data.length) return this.noData(g);

    var _this = this;
    var tooltip = el.select('.tooltip');

    // Normalize the data that came in
    var data = state.data.map(function(d) {
      d.date = new Date(d.start * 1000);
      d.value = +d.count;
      return d;
    });

    var x = d3.time.scale().range([0, this._getWidth(el)]);
    var y = d3.scale.linear().range([this._getHeight(), 0]);

    var xAxis = d3.svg.axis().scale(x).orient('bottom');
    var yAxis = d3.svg.axis()
      .ticks(5)
      .scale(y)
      .orient('left');

    var brush = d3.svg.brush().x(x);

    brush.on('brushend', function() {
      tooltip.classed('hidden', true);
      var extent = brush.extent();
      var from = this._dateFormat(extent[0]);
      var to = this._dateFormat(extent[1]);
      var query = [
        this._queryDateFormat(extent[0]),
        this._queryDateFormat(extent[1])
      ];
      actions.graphUpdated([from, to], query);
    }.bind(this));

    brush.on('brush', function() {
      tooltip.classed('hidden', false);
      var extent = brush.extent();
      var from = this._dateFormat(extent[0]);
      var to = this._dateFormat(extent[1]);

      tooltip
        .style('left', (x(extent[1]) + 85) + 'px')
        .text(from + ' - ' + to);
    }.bind(this));

    var area = d3.svg.area()
        .interpolate('monotone')
        .x(function(d) { return x(d.date); })
        .y0(this._getHeight())
        .y1(function(d) { return y(d.value); });

    x.domain(d3.extent(data.map(function(d) { return d.date; })));
    y.domain([0, d3.max(data.map(function(d) { return d.value; }))]);

    var path = g.append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', area);

    g.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this._getHeight() + ')')
      .call(xAxis);

    g.append('g')
      .attr('class', 'x brush')
      .call(brush)
    .selectAll('rect')
      .attr('y', -6)
      .attr('height', this._getHeight() + 7);

    var from = this._dateFormat(data[0].date);
    var to = this._dateFormat(data[data.length - 1].date);
    var query = [
      this._queryDateFormat(data[0].date),
      this._queryDateFormat(data[data.length - 1].date)
    ];

    actions.graphUpdated([from, to], query);
  },

  destroy: function(el) {},

  // Dimensions
  _margin: { top: 10, right: 10, bottom: 20, left: 40 },

  _getHeight: function() {
    return 100 - (this._margin.top - this._margin.bottom);
  },

  _getWidth: function(el) {
    return parseInt(el.style('width'), 10) - this._margin.left - this._margin.right;
  },

  _getContainerWidth: function(el) {
    return this._getWidth(el) + this._margin.left + this._margin.right;
  },

  _getContainerHeight: function() {
    return this._getHeight() + this._margin.top + this._margin.bottom;
  },

  _dateFormat: function(date) {
    return d3.time.format.utc('%b %e, %Y')(date);
  },

  _queryDateFormat: function(date) {
    return d3.time.format.utc('%Y-%m-%d')(date);
  }

};

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var fs = require('fs');
var store = require('store');
var BingLayer = require('./ext/bing.js');

var templates = {
    map: _(fs.readFileSync('./templates/map.html', 'utf8')).template()
};

// transparent street layer for putting on top of other layers
var contextLayer = L.mapbox.tileLayer('aaronlidman.87d3cc29', {
    detectRetina: false
});

var layers = {
    'Bing Satellite': new BingLayer('Arzdiw4nlOJzRwOz__qailc8NiR31Tt51dN2D7cm57NrnceZnCpgOkmJhNpGoppU'),
    'Mapbox Satellite': L.mapbox.tileLayer('aaronlidman.j5kfpn4g', { detectRetina: false }),
    'Streets': L.mapbox.tileLayer('aaronlidman.jgo996i0'),
    'OSM.org': L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="http://osm.org">© OpenStreetMap contributors</a>'
    })
};

var baseLayer = store.get('baseLayer') || 'Streets';

window.featureStyle = {
    color: '#FF00B7',
    opacity: 1,
    weight: 4
};

window.altStyle = {
    color: '#00BFFF',
    opacity: 1,
    weight: 4
};

module.exports = {
    init: function(div) {

        // map is already initialized
        if ($('#map').length) return;

        div = div || 'map';
        $('#main').append(templates.map());

        window.map = L.mapbox.map('map', {'mapbox_logo': true}, {
            maxZoom: 18,
            keyboard: false
        }).setView([22.76, -25.84], 3);

        window.map.zoomControl.setPosition('topright');

        // Layer controller
        layers[baseLayer].addTo(window.map);
        if (baseLayer == 'Bing Satellite') contextLayer.addTo(window.map).bringToFront();
        L.control.layers(layers).addTo(window.map);
        window.map.on('baselayerchange', function(e) {
            store.set('baseLayer', e.name);
            if (e.name == 'Bing Satellite') {
                contextLayer.addTo(window.map).bringToFront();
            } else {
                if (window.map.hasLayer(contextLayer)) window.map.removeLayer(contextLayer);
            }
        });
        window.featureGroup = L.featureGroup().addTo(window.map);
    },

    clear: function() {
        window.featureGroup.getLayers().forEach(function(layer) {
            window.featureGroup.removeLayer(layer);
        });
    }
};

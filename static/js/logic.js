// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (response) {
    // Once we get a response, send the data.features object to the createFeatures function
    // console.log(response);
    createFeatures(response.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
    function styleInfo(feature) {
        return {
            color: "white",
            // Call the chooseColor function to decide which color to color our neighborhood (color based on borou
            fillColor: colorRange(feature.properties.mag),
            radius: radiusFunc(feature.properties.mag),
            fillOpacity: 0.5,
            weight: 1.5
        };

    }
    // Define colors depending on the magnituge of the earthquake
    function colorRange(magnituge) {
        switch (true) {
            case magnituge >= 5.0:
                return 'red';
                break;
            case magnituge >= 4.0:
                return 'blue';
                break;
            case magnituge >= 3.0:
                return 'purple';
                break;
            case magnituge >= 2.0:
                return 'green';
                break;
            case magnituge >= 1.0:
                return 'pink';
                break;
            default:
                return 'yellow';
        };
    }
    function radiusFunc(mag) {
        if (mag == 0) {
            return 1;
        }
        return mag * 3;
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,

        onEachFeature: onEachFeature
    }
    );


    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    //Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [40.7128, -74.0059],
        zoom: 3,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojson.options.limits;
        var colors = geojson.options.colors;
        var labels = [];
        // Add min & max
        var legendInfo = "<h1>Median Income</h1>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";
        div.innerHTML = legendInfo;
        limits.forEach(function (limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };




    // Create the legend
    //var legend = L.control({ position: "bottomright" });

    //Add legend
    // legend.onAdd = function () {
    // var legend_loc = L.DomUtil.create("div", "info legend");
    // var level = [0, 1, 2, 3, 4, 5];
    // var colors = ['red', 'blue', 'purple', 'green', 'pink', 'yellow'];
    // for (var i = 0; i < level.length; i++) {
    // div.innerHTML +=
    // "<i style='background: " + colors[i] + "'></i> " + level[i] + (level[i + 1] ? "&ndash;" + level[i + 1] + "<br>" : "+");
    // } return div;
    // }
};


// Add legend to the map
legend.addTo(myMap);
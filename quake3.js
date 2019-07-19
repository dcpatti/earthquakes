//define the query url

var URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

//define the marker based on the magnitude size
//the magnitude comes from the geojson  we get from the URL above

function markerSize(magnitude){
	return magnitude * 4;
};


//make a layer group

var allData = new L.LayerGroup(); //L is for leaflet

d3.json(URL, function(data){
	L.geoJSON(data.features, {
		//create the map layer
		pointToLayer: function(feature, coord){
			return L.circleMarker(coord, {
				radius: markerSize(feature.properties.mag)
			});

},
	style: function(dataFeature){
		return {
			fillColor: Color(dataFeature.properties.mag),
			fillOpacity: 0.25,
			weight: 0.5,
			color: 'black'
		}
},
//now we are going to loop through each object in the Features array and create the popups
//we're going to embed the object's Place property into a HTML string
	onEachFeature: function(feature, layer){
		layer.bindPopup('<h3>'+feature.properties.place + '<h3><hr><P>'+
		new Date(feature.properties.time) + '</p>');

    }

}).addTo(allData);
dataMap(allData); 
});

//now create the URL to get the plate mappers

var plates_url = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
var boundary = new L.LayerGroup(); //we're making a new leaflet layer

d3.json(plates_url, function(data){
    L.geoJSON(data.features, {
        style: function (geoJsonFeature){
            return{
                weight: 1,
                color: 'brown'
            }
        },
    }).addTo(boundary);
})


//now make the colors for the magnitudes

function Color(magnitude){
    // console.log(magnitude)
    if (magnitude > 5){
        return 'red'
   
    } else if (magnitude > 3){
        return 'blue'
    
        } else if (magnitude > 1){
        return 'yellow'
    } else {
        return 'lightgreen'
    }
};

//now add the color layers

function dataMap(){
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery � <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery � <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    var baseMaps = {
        'Basic Map': streetmap,
        'Light Map': lightmap,
        'Satellite Map': satellite
    };

    var overlayMaps = {
        "Earthquake Markers": allData,
        'Fault Line': boundary
    };

    var myMap = L.map('map', {
        center: [
            37.09, -95.71
        ],
        zoom: 2,
        layers: [streetmap, allData, lightmap, satellite, boundary]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({
        position: 'topright'
    });

    legend.onAdd = function(myMap){
        var div = L.DomUtil.create("div", "info legend"),
         magnitude = [0, 1,  3,  5];
         color = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h5>"

    for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML += "<i style='background: " + Color(magnitude[i] +1) + "'></i> " +
          magnitude[i] + ( magnitude[i + 1] ? "&ndash;" + magnitude[i + 1] + "<br>" : "+");
      }
      return div;
    };
    legend.addTo(myMap);
}
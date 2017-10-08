// Wait until your documnet is ready
$(function() {
    var map;
    // Function to draw your map
    var drawMap = function() {

        // Create map and set view
        map = L.map('map-container').setView([37.0902, -95.7129], 4);

        // Create a tile layer variable using the appropriate url
        var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

        // Add the layer to your map
        tileLayer.addTo(map);

        // Execute your function to get data
        getData();
    };

    // Function for getting data
    var getData = function() {

        // Execute an AJAX request to get the data in data/data.csv file
        $.get('data/data.csv', function(data, error) {

        // Use the PapaParse library to parse the information returned by your request
            var data = Papa.parse(data, {
                header: true
            }).data;
            console.log(data);
        // When your request is successful, call your customBuild function
            customBuild(data);

        });
    };

    // Loop through your data and add the appropriate layers and points
    var customBuild = function(data) {
        // Be sure to add each layer to the map

        //create markers that represent the number of people injured
        var injuredArr = [];
        data.forEach(function(c) {
            var marker = L.circleMarker([c.lat, c.lng]);
            marker.bindPopup('There were ' + c.injured + ' people injured and '
            					+ c.killed + ' killed in ' + c.state);
            marker.setStyle({
                color: 'red',
                radius: c.injured
            });

            injuredArr.push(marker);
        });

        //create markers that represent the number of people killed
        var killedArr = [];
        data.forEach(function(c) {
            var marker = L.circleMarker([c.lat, c.lng]);
            marker.bindPopup('There were ' + c.injured + ' people injured and '
            					+ c.killed + ' killed in ' + c.city + ', ' + c.state);
            marker.setStyle({
                color: 'black',
                radius: c.killed
            });
            killedArr.push(marker);
        });        

        //add markers to each respective layers
        var injured = L.layerGroup(injuredArr);
        var killed = L.layerGroup(killedArr);
        
        // add layers to map
        injured.addTo(map);
        killed.addTo(map);

        var overlayMaps = {
            "Injured" : injured,
            "Killed" : killed
        }

        L.control.layers(overlayMaps).addTo(map);


        // Once layers are on the map, add a leaflet controller that shows/hides layers

        // Build a table showing calculated aggregate values
        

        var tableDataStorage = {};
        data.forEach(function(d){
            var state = d.state;
            var injured = parseInt(d.injured);
            var killed = parseInt(d.killed);
            // if new object contains state
            if (state in tableDataStorage) {
                tableDataStorage[state].injured += injured;
                tableDataStorage[state].killed += killed;

            // if does not contain state
            } else {
                tableDataStorage[d.state] = {'injured' : injured, 'killed': killed, 'state': state};
            }
        });

        console.log(tableDataStorage);
        var sortTable = [];
        for (var key in tableDataStorage) {
            sortTable.push([key, tableDataStorage[key]]);

        }


        sortTable.sort(function(a, b) {
            return (b[1].injured + b[1].killed) - (a[1].injured + a[1].killed);
        })

        sortTable.forEach(function(d) {
            var tableRow = $('<tr>');

            tableRow.append('<td class="border">' + d[0] + '</td>');
            tableRow.append('<td class="border">' + d[1].injured + '</td>');
            tableRow.append('<td>' + d[1].killed + '</td>');
            $('table').append(tableRow);
        })
    };

    // Execute your drawMap function
    drawMap();

});

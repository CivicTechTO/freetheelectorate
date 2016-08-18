mapboxgl.accessToken = 'pk.eyJ1Ijoic29uYWxyIiwiYSI6ImI3ZGNmNTI1Mzc1NzFlYTExMGJkZTVlZDYxYWY4NzJmIn0.wxeViIZtMPq2IPoD9mB5qQ';


var map = new mapboxgl.Map( {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [ -79.801, 43.559 ],
  zoom: 10
} );

var geocoder = new mapboxgl.Geocoder({
    container: 'geocoder-container' // Optional. Specify a unique container for the control to be added to.
});

function loadCsv(doc, type) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) 
        {
            dat = xhttp.responseText;
            dat = dat.split(/(?:\r\n|\r|\n)/g);
            
            for(i = 0; i < dat.length; i++)
            {
              dat[i] = dat[i].split(",");
              
              switch(type)
              {
                case 'ed':
                  dat[i] = {edid: dat[i][1], year: dat[i][2], variable : dat[i][3], party : dat[i][4], value : dat[i][5] };
                  break;
                case 'pd':
                  dat[i] = {edid: dat[i][1], pdid: dat[i][2], year: dat[i][3], variable : dat[i][4], party : dat[i][5], value : dat[i][6] };
                  break;
              }
            }
            
            console.dir(dat);
        }
    };
    xhttp.open("GET", doc, true);
    xhttp.send();
}

////
ed2014 = loadCsv('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/ed2014total.csv', 'ed');
ed2014 = loadCsv('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/pd2014total.csv', 'pd');

map.addControl(geocoder);

// when map loads, 
map.on('load', function() {
    
    $("#sidebar").toggle(500)
    $("#sidebar-toggle").toggle(500)
    $("#geocoder-container").fadeIn(750)
    document.getElementById("sidebar-toggle").onclick = function()
    {
      
      $("#sidebar").toggle(250)
      $("#sidebar-toggle").toggleClass("glyphicon-arrow-right glyphicon-arrow-le")
    }
    document.getElementById("Turnout").onclick = function()
    {
      document.getElementById("Options").innerHTML = '<input type="radio" name="Turnout" value="Percent Turnout"> Percent Turnout<br>'+
                                                      '<input type="radio" name="Turnout" value="Percent Rejected"> Percent Rejected<br>'+
                                                      '<input type="radio" name="Turnout" value="Percent Unmarked" checked> Percent Unmarked'
    }
    document.getElementById("Results").onclick = function()
    {
      document.getElementById("Options").innerHTML = "<select id = 'party-picker' class = 'form-control'>"+
                                                        "<option value = 'all'>All Parties </option>"+
                                                      "</select>"
    }

    // add an empty point feature
    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    // 
    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function(ev) {
        map.getSource('single-point').setData(ev.result.geometry);
    });
});
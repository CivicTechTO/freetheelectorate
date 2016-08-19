L.mapbox.accessToken = 'pk.eyJ1Ijoic29uYWxyIiwiYSI6ImI3ZGNmNTI1Mzc1NzFlYTExMGJkZTVlZDYxYWY4NzJmIn0.wxeViIZtMPq2IPoD9mB5qQ';
var COLORS = [ '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594' ],
  BREAKS = [ 0, 100, 200, 300, 400, 500, 600 ]

var year = 2011
var mapVariable = "VOTER_TURNOUT"
var valueType = "value"

var map = L.mapbox.map('map', 'mapbox.streets', {zoomControl: false})
    



function loadCsv(doc, type, json) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) 
        {
            dat = xhttp.responseText;
            dat = dat.split(/(?:\r\n|\r|\n)/g);
            
            for(j = 0; j < json.features.length; j++)
            {
              json.features[j].properties['2007']={};
              json.features[j].properties['2011']={};
              json.features[j].properties['2014']={};
            }
           
            for(i = 0; i < dat.length; i++)
            {
              dat[i] = dat[i].split(",");
              switch(type)
              {
                case 'ed':
                  dat[i] = {edid: dat[i][1], year: dat[i][2], variable : dat[i][3], party : dat[i][4], value : dat[i][5] };
                  
                  for(j = 0; j < json.features.length; j++)
                  {
                    
                    if(parseInt(dat[i].edid) == json.features[j].properties['ED_ID'])
                    {
                      json.features[j].properties[dat[i].year][dat[i].variable] = {party : dat[i].party, value : dat[i].value} ;
                    }
                  }

                  break;
              
                  
                
                case 'pd':
                  dat[i] = {edid: dat[i][1], pdid: dat[i][2], year: dat[i][3], variable : dat[i][4], party : dat[i][5], value : dat[i][6] };
                  break;
              }
            }
            
            
            console.dir(json);
            
            L.geoJson(json,{
              style: style
            }).addTo(map)
            
            $("#sidebar").toggle(500)
            $("#sidebar-toggle").toggle(500)
        }
    };
    xhttp.open("GET", doc, true);
    xhttp.send();
}

function loadJson(doc, type, json) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) 
        {
          loadCsv(doc, type, JSON.parse(xhttp.responseText))
        }
    }
    xhttp.open("GET", json, true);
    xhttp.send();
}

function style(feature) {
  console.log(feature.properties[year][mapVariable][valueType]/feature.properties[year]['ELECTORS'][valueType])
    return {
        fillColor: getColor(feature.properties[year][mapVariable][valueType]/feature.properties[year]['ELECTORS'][valueType]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function getColor(d) {
    return d > 0.5 ? '#800026' :
           d > 0.475  ? '#BD0026' :
           d > 0.45  ? '#E31A1C' :
           d > 0.425  ? '#FC4E2A' :
           d > 0.4   ? '#FD8D3C' :
           d > 0.375  ? '#FEB24C' :
           d > 0.35   ? '#FED976' :
                      '#FFEDA0';
}

////



// when map loads, 
map.on('load', function() {
    map.setView([50,-90], 5)
    
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
    loadJson('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/edtotal.csv', 'ed', 'https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/ED_ON_2014.geojson');
    


});
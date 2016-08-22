L.mapbox.accessToken = 'pk.eyJ1Ijoic29uYWxyIiwiYSI6ImI3ZGNmNTI1Mzc1NzFlYTExMGJkZTVlZDYxYWY4NzJmIn0.wxeViIZtMPq2IPoD9mB5qQ';

var year = 2011
var mapVariable = "VOTER_TURNOUT"
var valueType = "value"
var minVal = Infinity
var maxval = 0

var map = L.mapbox.map('map', 'mapbox.streets', {zoomControl: false})
    


function loadCsv(doc, type, json) {
  minVal = Infinity, maxVal = -Infinity, maxVote = -Infinity;
  
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
                  if(dat[i].variable != 'VOTER_TURNOUT' & dat[i].variable != 'REJECTED' & dat[i].variable != 'UNMARKED' & dat[i].value > maxVote)
                  {
                    maxVote = dat[i].value;
                    WINNER = {variable : dat[i].variable, party : dat[i].party, value : dat[i].value}
                  }
                  
                  
                  for(j = 0; j < json.features.length; j++)
                  {
                    
                    if(parseInt(dat[i].edid) == json.features[j].properties['ED_ID'])
                    {
                      json.features[j].properties[dat[i].year][dat[i].variable] = {party : dat[i].party, value : dat[i].value} ;
                      json.features[j].properties[dat[i].year]["WINNER"] = WINNER;
                    }
                    
                  }
                  break;
                
                case 'pd':
                  dat[i] = {edid: dat[i][1], pdid: dat[i][2], year: dat[i][3], variable : dat[i][4], party : dat[i][5], value : dat[i][6] };
                  break;
              }
            }
            
            switch(mapVariable)
            {
              case 'VOTER_TURNOUT':
              case 'REJECTED':
              case 'UNMARKED':
              
                for(j = 0; j < json.features.length; j++)
                {
                    if(parseInt(json.features[j].properties[year][mapVariable].value)/parseInt(json.features[j].properties[year]['ELECTORS'].value) > maxVal)
                    {
                      maxVal = json.features[j].properties[year][mapVariable].value/parseInt(json.features[j].properties[year]['ELECTORS'].value);
                    }
                    if(parseInt(json.features[j].properties[year][mapVariable].value)/parseInt(json.features[j].properties[year]['ELECTORS'].value) < minVal)
                    {
                      minVal = json.features[j].properties[year][mapVariable].value/parseInt(json.features[j].properties[year]['ELECTORS'].value);
                    }
                    
                }
                break;
              
            }   
                    
            console.dir(json);
            
            chloropleth = L.geoJson(json,{style: style, onEachFeature: onEachFeature}).addTo(map)
            
            $("#sidebar").show(500)
            $("#sidebar-toggle").show(500)
            
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

function loadEmptyJson(json) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) 
        {
          return xhttp.responseText
        }
    }
    xhttp.open("GET", json, true);
    xhttp.send();
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties[year][mapVariable][valueType]/feature.properties[year]['ELECTORS'][valueType], minVal, maxVal),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

function getColor(d, minVal, maxVal) {
    var diff = maxVal - minVal;
    return d > minVal+ (7*diff/8) ? '#800026' :
           d > minVal+ (6*diff/8)  ? '#BD0026' :
           d > minVal+ (5*diff/8)  ? '#E31A1C' :
           d > minVal+ (4*diff/8)  ? '#FC4E2A' :
           d > minVal+ (3*diff/8)   ? '#FD8D3C' :
           d > minVal+ (2*diff/8)  ? '#FEB24C' :
           d > minVal+ (1*diff/8)   ? '#FED976' :
                                      '#FFEDA0';
}

function onEachFeature(feature, layer) {
  
  layer.bindPopup("value: " + feature.properties[year][mapVariable][valueType]/feature.properties[year]['ELECTORS'][valueType]+ "<br>min: " + minVal+ "<br>max: " + maxVal)
    //layer.on({
        //mouseover: highlightFeature,
        //mouseout: resetHighlight,
        //click: 
   // });
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
      document.getElementById("Options").innerHTML = '<input type="radio" name="Turnout" value="VOTER_TURNOUT"> Percent Turnout<br>'+
                                                      '<input type="radio" name="Turnout" value="REJECTED"> Percent Rejected<br>'+
                                                      '<input type="radio" name="Turnout" value="UNMARKED"> Percent Unmarked+<br><br>'
    }

    document.getElementById("Results").onclick = function()
    {
      document.getElementById("Options").innerHTML = "<select id = 'party-picker' class = 'form-control'>"+
                                                        "<option value = 'WINNER' default>All Parties </option>"+
                                                        "<option value = 'other' default>Other </option>"+
                                                      "</select>";
    };
    document.getElementById("Options").onchange = function()
    {
      if(document.querySelector('input[type="radio"]:checked').value != null)
      {
        
        chloropleth.clearLayers()
        mapVariable = document.querySelector('input[type="radio"]:checked').value;
        loadJson('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/edtotal.csv', 'ed', 'https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/ED_ON_2014.geojson');
      }
    }
    
    loadJson('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/edtotal.csv', 'ed', 'https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/ED_ON_2014.geojson');

});


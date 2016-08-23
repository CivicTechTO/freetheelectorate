L.mapbox.accessToken = 'pk.eyJ1Ijoic29uYWxyIiwiYSI6ImI3ZGNmNTI1Mzc1NzFlYTExMGJkZTVlZDYxYWY4NzJmIn0.wxeViIZtMPq2IPoD9mB5qQ';

var year = 2011;
var mapVariable = "VOTER_TURNOUT";
var valueType = "value";


var map = L.mapbox.map('map', 'mapbox.streets', {zoomControl: false})
    


function loadCsv(doc, type, json) {
  minVal = Infinity, maxVal = -Infinity;
  
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
            
           
                for(j = 0; j < json.features.length; j++)
                {
                  maxVote = {variable: "", value: -Infinity}
                  for(var k in json.features[j].properties[year])
                    {

                      if(parseInt(json.features[j].properties[year][k].value) > maxVote.value & k!= 'VOTER_TURNOUT'&k!='REJECTED'&k!='UNMARKED'&k!='ELECTORS')                     {
                        WINNER = {name: k, party: json.features[j].properties[year][k].party, value: json.features[j].properties[year][k].value}
                        maxVote.value = json.features[j].properties[year][k].value
                      }
                    }
                    json.features[j].properties[year]['WINNER'] = WINNER;
                    
                    if(parseInt(json.features[j].properties[year][mapVariable].value)/parseInt(json.features[j].properties[year]['ELECTORS'].value) > maxVal)
                    {
                      maxVal = parseInt(json.features[j].properties[year][mapVariable].value)/parseInt(json.features[j].properties[year]['ELECTORS'].value);
                    }
                    if(parseInt(json.features[j].properties[year][mapVariable].value)/parseInt(json.features[j].properties[year]['ELECTORS'].value) < minVal)
                    {
                      minVal = parseInt(json.features[j].properties[year][mapVariable].value)/parseInt(json.features[j].properties[year]['ELECTORS'].value);
                    }
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
    console.log(mapVariable)
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
        fillColor: getColor(feature.properties[year][mapVariable][valueType], feature.properties[year]['ELECTORS'][valueType], minVal, maxVal),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

function getColor(c, div, minVal, maxVal) {
  switch(mapVariable)
  {
    case 'VOTER_TURNOUT':
    case 'REJECTED':
    case 'UNMARKED':
      d = c / div;
      var diff = maxVal - minVal;
      return d > minVal+ (7*diff/8) ? '#800026' :
             d > minVal+ (6*diff/8)  ? '#BD0026' :
             d > minVal+ (5*diff/8)  ? '#E31A1C' :
             d > minVal+ (4*diff/8)  ? '#FC4E2A' :
             d > minVal+ (3*diff/8)   ? '#FD8D3C' :
             d > minVal+ (2*diff/8)  ? '#FEB24C' :
             d > minVal+ (1*diff/8)   ? '#FED976' :
                                        '#FFEDA0';
    case 'WINNER':
      d = c.trim();
      
      return d ==    "LIBERAL"                         ?   "#B0304B"  :
              d ==    "PROGRESSIVE CONSERVATIVE"        ?   "#458BBE"  :
              d ==    "NEW DEMOCRATIC"                  ?   "#D37F36"  :
              d ==    "GREEN"                           ?   "#038543"  :
              d ==    "FAMILY COALITION PARTY OF ONTARIO"   ?   "#64C42B"  :
              d ==    "ONTARIO LIBERTARIAN PARTY"   ?   "#C96BD1"  :
              d ==    "INDEPENDENT" ?   "#725DFB"  :
              d ==    "ONTARIO PROVINCIAL CONFEDERATION OF REGIONS PARTY"   ?   "#5F7CCD"  :
              d ==    "FREEDOM"                         ?   "#9E2E71"  :
              d ==    "COMMUNIST"                      ?   "#C6DF76"  :
              d ==    "REFORM PARTY OF ONTARIO" ?   "#02EF6B"  :
              d ==    "NO AFFILIATION"  ?   "#F307A2"  :
              d ==    "REPUBLICAN PARTY OF ONTARIO" ?   "#27B8AE"  :
              d ==    "PARTY FOR PEOPLE WITH SPECIAL NEEDS" ?   "#3D5A8F"  :
              d ==    "THE ONLY PARTY"  ?   "#F7FF73"  :
              d ==    "PROGRESSIVE CONSERVATIVE PARTY OF ONTARIO"  ?   "#D06BF3"  :
              d ==    "PATRON"                          ?   "#B164F3"  :
              d ==    "PARTY FOR HUMAN RIGHTS IN ONTARIO"   ?   "#068DAA"  :
              d ==    "VEGAN ENVIRONMENTAL PARTY"   ?   "#666B35"  :
              d ==    "SOCIALIST PARTY OF ONTARIO"  ?   "#80A0C6"  :
              d ==    "NORTHERN ONTARIO HERITAGE"       ?   "#70C4F3"  :
              d ==    "PEOPLE FIRST REPUBLIC PARTY OF ONTARIO"  ?   "#DD9CD0"  :
              d ==    "CHRISTIAN CREDIT"                ?   "#A2A6A5"  :
              d ==    "THE GREEN PARTY OF ONTARIO"  ?   "#70DDB5"  :
              d ==    "ONTARIO LIBERAL PARTY"   ?   "#4AC394"  :
              d ==    "NEW DEMOCRATIC PARTY OF ONTARIO" ?   "#C85245"  :
              d ==    "PAUPER PARTY OF ONTARIO" ?   "#746D96"  :
              d ==    "THE PEOPLES POLITICAL PARTY" ?   "#64CF16"  :
              d ==    "ONTARIO MODERATE PARTY"  ?   "#1FC7B0"  :
              d ==    "EQUAL PARENTING PARTY"   ?   "#9A74A3"  :
              d ==    "NONE OF THE ABOVE PARTY OF ONTARIO"  ?   "#D21A60"  :
              d ==    "CANADIANS' CHOICE PARTY" ?   "#B7144F"  :
              d ==    "TRILLIUM PARTY OF ONTARIO"   ?   "#E1397D"  :
                                                      "#E1397D";
  }
}



function onEachFeature(feature, layer) {
  
  layer.bindPopup("value: " + feature.properties[year][mapVariable][valueType]+ "<br>min: " + minVal+ "<br>max: " + maxVal)
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
                                                      '<input type="radio" name="Turnout" value="UNMARKED"> Percent Unmarked<br><br>'

    }

    document.getElementById("Results").onclick = function()
    {
      document.getElementById("Options").innerHTML = "<select id = 'party-picker' class = 'form-control'>"+
                                                      "<option value = '' default>Select </option>"+
                                                      "<option value = 'WINNER' default>All Parties </option>"+
                                                      "</select>";
      document.getElementById("party-picker").onchange = function()
      {
        mapVariable = document.getElementById("party-picker").value
        valueType = 'party';
        console.log(mapVariable)
        chloropleth.clearLayers()
        loadJson('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/edtotal.csv', 'ed', 'https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/ED_ON_2014.geojson');
      }
      
    };
    document.getElementById("Options").onchange = function()
    {
      if(document.querySelector('input[name="Turnout"]:checked').value != null)
      {
        chloropleth.clearLayers()
        mapVariable = document.querySelector('input[type="radio"]:checked').value;
        valueType = 'value';
        loadJson('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/edtotal.csv', 'ed', 'https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/ED_ON_2014.geojson');
      }
    }
    
    loadJson('https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/edtotal.csv', 'ed', 'https://raw.githubusercontent.com/CivicTechTO/freetheelectorate/master/ED_ON_2014.geojson');
    loadCsv()
});



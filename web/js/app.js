/**
 * Created by nishantisme on 24/01/2017.
 */
$( document ).ready(function() {

    $().button('toggle')
var countries = ["indian","pakistani","german","french","spanish"];

 HTMLSelectElement.prototype.populate = function (opts) {
     var omit = opts;
     if (omit == null){
         for (var i in countries){
             this.appendChild(new Option(countries[i], countries[i]));
         }
     }
     else {
         this.innerHTML= '';
         var countriesNew = countries.filter(function(e) { return e !== opts });
         for (var j in countriesNew){
             this.appendChild(new Option(countriesNew[j], countriesNew[j]));
         }
     }

 };

 document.getElementById('countriesList').populate(null);
 document.getElementById('countriesList2').populate('indian');
    var selNationality1 = '';
    var selNationality2 = '';






// set the height and width of network
    var graph_width = window.innerWidth *0.7,
        graph_height = (window.innerHeight *0.7),
        node_radius = 2.0; // the size of nodes


//parameter from outside: countries, attributes to show
    var feature_country1 = "indian";
    var feature_country2 = "pakistani";
// color_for_countries = 1, different colors represent different countries,
// color_for_countries = 0, different colors represent different gender
    var color_for_countries = 1;


    /*
     the real time is different from the time created by new Date, we can use
     http://bl.ocks.org/zanarmstrong/ca0adb7e426c12c06a95
     to get right date
     */

// Set time scale
    var startDate = new Date(2001,0), //which means 2001_01
        endDate = new Date(2016,11), //which means 2016_12
        initialDate = endDate;
    var timeFormat = d3.time.format("%Y_%m"),
        labelFormat = d3.time.format("%b %Y");

    var timeScale = d3.time.scale().domain([startDate, endDate]);


// Create slider with a listener, to refresh the graph, and show the time of current handle
    var slider = d3.slider()
        .scale(timeScale)
        .axis(d3.svg.axis().ticks(16))
        .value(initialDate)
        .on("slide", function(event, value){ // action of dragging
            var fullTime = new Date(value);
            var formatTime = timeFormat(fullTime);
            d3.select("#handle_label").html(formatTime);
            importCSV('js/'+formatTime+'.csv'); //refresh the network
        });


// Initialization

// Call slider at certain place
    d3.select('#slider').call(slider);

// Create the label of handle
    var handle = d3.select("#handle-one"); //handle-one is an element created in slider.js
    handle.append("text")
        .attr("id", "handle_label")
        .attr("class", "d3-slide-handle-text")
        .text(timeFormat(initialDate)); //or use labelFormat


// Get the statistic information from politicians.csv to dict_gender, dict_name, dict_nationality
    var dict_gender = new Map();
    var dict_name = new Map();
    var dict_nationality = new Map();
//import politician data, generate the network
    d3.csv("js/politician-data_2.csv", function(error, lines){
        if (error) throw error;

        lines.forEach(function(line){
            // store gender to dict_gender
            dict_gender.set(line.ID, line.gender);
            // store name to dict_name
            dict_name.set(line.ID, line.name);
            // store name to dict_country
            dict_nationality.set(line.ID, line.nationality.slice(2,-2));

        });
        importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network
    });




// Import csv file, function of generate network
    function importCSV(filename){
        //refresh the space
        if(d3.select("#graph") != null)
        {
            d3.select("#graph").remove();
        }


        // define svg
        var svg = d3.select("#graphHolder").append("svg")
            .attr("id", "graph")
            .attr("width", graph_width)
            .attr("height", graph_height)
            .attr("align", "center");
        // $(svg).css({top:0, left:100});
        // console.log(('#left-sidebar').width);

        // define force
        var force = d3.layout.force()
            .gravity(0.5)
            .distance(5)
            .charge(-50)
            .alpha(0.8)
            .friction(0.3)
            .size([graph_width, graph_height]);

        //import links file
        d3.csv(filename, function(error, links) {
            if (error) throw error;
            var filter_links = []; //to store links relating to two certain countries
            var nodesByName = {}; //to store nodes from above links

            // go through links from csv file, pick links of target countries, store into filter_links
            links.forEach(function(link) {
                var country1 = dict_nationality.get(link.from);
                var country2 = dict_nationality.get(link.to);
                if(((country1 === feature_country1) && (country2 === feature_country1)) ||
                    ((country1 === feature_country2) && (country2 === feature_country2)) ||
                    ((country1 === feature_country1) && (country2 === feature_country2)) ||
                    ((country1 === feature_country2) && (country2 === feature_country1)))
                {
                    var eachLink = new Object();
                    eachLink.source = nodeByName(link.from);
                    eachLink.target = nodeByName(link.to);
                    filter_links.push(eachLink);

                }
            });


            // Extract the array of nodes from the map by name.
            var nodes = d3.values(nodesByName);


            // Create the link lines.
            var link = svg.selectAll(".link")
                .data(filter_links)
                .enter().append("line")
                .style("stroke","silver")
                .on("click", function(){return})
                .attr("class", "link");

            // Create the node circles.
            var node = svg.selectAll(".node")
                .data(nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", node_radius)
                .attr("id", function(d){return "node_"+d.name;})
                /*.style("fill", function(d){ //set color to gender
                 var newcolor;

                 })*/
                .style("fill", function(d){ //set color of nodes depending on countries or gender
                    var newcolor;
                    //if color_for_countries==1, color of nodes depends on countries
                    if (color_for_countries===1){
                        if (dict_nationality.get(d.name) === feature_country1){newcolor = "blue";}
                        else if (dict_nationality.get(d.name)=== feature_country2){newcolor = "orange";}
                        return newcolor;
                    }
                    // color_for_countries==0, color of nodes depends on gender
                    else if(color_for_countries===0){
                        if (dict_gender.get(d.name) === "female"){newcolor = "red";}
                        else if (dict_gender.get(d.name)=== "male"){newcolor = "blue";}
                        else{newcolor = "orange";}
                        return newcolor;
                    }

                })
                .style("visibility", function(d){//hiding the nodes without gender
                    if(color_for_countries===1){return "visible";}//do nothing when color is for countries
                    else{
                        if (dict_gender.get(d.name)=== "female"){return "visible";}
                        else if (dict_gender.get(d.name)==="male"){return "visible";}
                        else {return "hidden";}
                    }

                })
                .style("stroke","none")
                .on('mouseover', function(d){
                    d3.select(this)
                        .style('stroke', 'orange');
                    d3.select("#label_"+d.name)
                        .style("visibility", "visible");
                })
                .on('mouseout', function(d){
                    d3.select(this)
                        .style('stroke', 'none');
                    d3.select("#label_"+d.name)
                        .style("visibility","hidden");
                })
                .on("click", function(){
                    var nextColor = this.style.fill == "black" ? "magenta" : "black";
                    d3.select(this)
                        .style("fill", nextColor);})
                .call(force.drag);


            // Create the node labels
            var nodelabels = svg.selectAll(".nodelabel")
                .data(nodes)
                .enter()
                .append("text")
                .style("visibility", "hidden")
                .attr("id", function(d){return "label_"+d.name;})
                .attr({"x":function(d){return d.x;},
                    "y":function(d){return d.y;},
                    "class":"nodelabel",
                    "stroke":"black"})
                .text(function(d){return dict_name.get(d.name);});

            resize();
            d3.select(window).on("resize", resize);


            // Start the force layout.
            force
                .nodes(nodes)
                .links(filter_links)
                .on("tick", tick)
                .start();

            // function to set the position of nodes, links
            function tick() {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x = Math.max(node_radius, Math.min(graph_width - node_radius, d.x)); })
                    .attr("cy", function(d) { return d.y = Math.max(node_radius, Math.min(graph_height - node_radius, d.y)); });

                nodelabels.attr("x", function(d) { return d.x; })
                    .attr("y", function(d) { return d.y; });

            }
            // function to resize
            function resize() {
                width = (window.innerWidth *0.7), height = (window.innerHeight *0.7);
                svg.attr("width", width).attr("height", height);
                force.size([width, height]).resume();
            }
            //function for extracting nodes from links, it is used when import links file
            function nodeByName(name) {
                return nodesByName[name] || (nodesByName[name] = {name: name});
            }
        });
    }



    $("#countriesList").change(function () {
        selNationality1 = this.value;
        document.getElementById('countriesList2').populate(this.value);
        feature_country1 = this.value;

        feature_country2 = $( "#countriesList2 option:selected" ).text();
        importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network

    })
    $("#countriesList2").change(function () {
        selNationality2 = this.value;
        // feature_country1 = $( "#countriesList1 option:selected" ).text();
        feature_country2 = this.value;
        importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network

    })

    $('#colorPalette input').on('change', function() {
        console.log($('input[name=coloroptions]:checked', '#colorPalette').val());
        color_for_countries = parseInt($('input[name=coloroptions]:checked', '#colorPalette').val());
        importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network

    });





});
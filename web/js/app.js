/**
 * Created by nishantisme on 24/01/2017.
 */
$( document ).ready(function() {


    $( function() {
        $( "#slider-range" ).slider({
            range: true,
            min: 1850,
            max: 1995,
            values: [ 1920, 1980 ],
            slide: function( event, ui ) {
                $( "#amount" ).val(  " "+ui.values[ 0 ] + " - " + ui.values[ 1 ] );

                age_start = ui.values[0];
                age_end = ui.values[1];
                var process = importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network
                $('#graphHolder').LoadingOverlay("show");
                $.when(process).done(function () {
                    $('#graphHolder').LoadingOverlay("hide");
                    console.log("stop");
                })

            }
        });
        $( "#amount" ).val(  " "+$( "#slider-range" ).slider( "values", 0 ) +
            " - " + $( "#slider-range" ).slider( "values", 1 ) );
    } );

    $().button('toggle')
var countries = ["indian","pakistani","german","french","spanish","bangladeshi", "american"];

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

    //constant for age
    var age_start = "1920";
    var age_end = "1980";


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
            var process = importCSV('js/'+formatTime+'.csv'); //refresh the network
            $('#graphHolder').LoadingOverlay("show");
            $.when(process).done(function () {
                $('#graphHolder').LoadingOverlay("hide");
                console.log("stop");
            })
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

    // dictionary for age
    var dict_age = new Map();

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

            // store birth data to dict_age for age
            dict_age.set(line.ID, line.birthDate.slice(3,7));

        });
        var process = importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network
        $('#graphHolder').LoadingOverlay("show");
        $.when(process).done(function () {
            $('#graphHolder').LoadingOverlay("hide");
            console.log("stop");
        })
    });




// Import csv file, function of generate network
    function importCSV(filename){
        //refresh the space
        if(d3.select("#graph") != null)
        {
            d3.select("#graph").remove();
        }
        // define variable for statistics (new codes)
        var number_of_country1 = 0;
        var number_of_country2 = 0;
        var number_of_male_in_country1 = 0;
        var number_of_female_in_country1 = 0;
        var number_of_male_in_country2 = 0;
        var number_of_female_in_country2 = 0;
        var number_of_all_links = 0;
        var number_of_links_cross_country = 0

        // define variables for indegree and kcore
        var average_indegree_male_country1 = 0;
        var average_indegree_female_country1 = 0;
        var average_indegree_male_country2 = 0;
        var average_indegree_female_country2 = 0;
        var average_kcore_male_country1 = 0;
        var average_kcore_female_country1 = 0;
        var average_kcore_male_country2 = 0;
        var average_kcore_female_country2 = 0;

        // define zoom for zoom in
        var zoom = d3.behavior.zoom().translate([0,0]).scaleExtent([1,10]).scale(1).on("zoom", zoomed);
        function zoomed(){
            x = d3.event.translate[0];
            y = d3.event.translate[1];
            s = d3.event.scale;

            d3.select("#container").attr("transform", "translate("+d3.event.translate+") scale(" +d3.event.scale+")");

        }


        // define svg
        var svg = d3.select("#graphHolder").append("svg")
            .attr("id", "graph")
            .attr("width", graph_width)
            .attr("height", graph_height)
            .attr("align", "center")
            svg.call(zoom);


        // define force
        var force = d3.layout.force()
            .gravity(0.3)
            .distance(20)
            .charge(-50)
            .alpha(0.8)
            .friction(0.3)
            .size([graph_width, graph_height]);

        // add a container to store all the elements which are able to zoom in
        var container = svg.append("g").attr("id", "container");

        //import links file
        d3.csv(filename, function(error, links) {
            if (error) throw error;
            var filter_links = []; //to store links relating to two certain countries
            var nodesByName = {}; //to store nodes from above links

            // go through links from csv file, pick links of target countries, store into filter_links
            links.forEach(function(link) {
                var country1 = dict_nationality.get(link.from);
                var country2 = dict_nationality.get(link.to);

                // new variable for age
                var age1 = dict_age.get(link.from);
                var age2 = dict_age.get(link.to);

                if(((country1 === feature_country1) && (country2 === feature_country1)) ||
                    ((country1 === feature_country2) && (country2 === feature_country2)) ||
                    ((country1 === feature_country1) && (country2 === feature_country2)) ||
                    ((country1 === feature_country2) && (country2 === feature_country1)))
                {
                    // add a "if" to make a constraint for age
                    if(age1 >= age_start && age1 <= age_end && age2 >= age_start && age2 <= age_end)
                    {
                        var eachLink = new Object();
                        eachLink.source = nodeByName(link.from);
                        eachLink.target = nodeByName(link.to);
                        filter_links.push(eachLink);

                        // get dynamic statistics of links, accumulate the link connecting different countries (new codes)
                        if(((country1 === feature_country1) && (country2 === feature_country2)) ||
                            ((country1 === feature_country2) && (country2 === feature_country1))){
                            number_of_links_cross_country += 1;
                        }
                    }

                }
            });


            // Extract the array of nodes from the map by name.
            var nodes = d3.values(nodesByName);
            // define dictionaries for indegree and kcore
            var dict_indegree = new Map();
            var dict_kcore = new Map();


            // import file including indegree and kcore (move all the rest previous codes into this d3.csv(), except for the last function, which is nodeByName)
            d3.csv("js/nodevalues_csv/values_"+filename.slice(3), function(error, indegreeKcores){
                if(error) throw error;
                // get data from csv file into dictionaries for indegree and kcore
                indegreeKcores.forEach(function(indegreeKcore){
                    dict_indegree.set(indegreeKcore.node, indegreeKcore.indegree);
                    dict_kcore.set(indegreeKcore.node, indegreeKcore.kcore);
                });


                // get dynamic statistics of nodes
                nodes.forEach(function(node){
                    node_id = node.name;
                    if(dict_nationality.get(node_id) === feature_country1){
                        number_of_country1 += 1;

                        if(dict_gender.get(node_id) === "male"){
                            number_of_male_in_country1 += 1;
                            // accumulate indegree and kcore for male in country1
                            average_indegree_male_country1 += parseInt(dict_indegree.get(node_id));
                            average_kcore_male_country1 += parseInt(dict_kcore.get(node_id));
                        }
                        else if(dict_gender.get(node_id) === "female"){
                            number_of_female_in_country1 += 1;
                            // accumulate indegree and kcore for female in country1
                            average_indegree_female_country1 += parseInt(dict_indegree.get(node_id));
                            average_kcore_female_country1 += parseInt(dict_kcore.get(node_id));
                        }
                    }
                    else{
                        number_of_country2 += 1;
                        if(dict_gender.get(node_id) === "male"){
                            number_of_male_in_country2 += 1;
                            // accumulate indegree and kcore for male in country2
                            average_indegree_male_country2 += parseInt(dict_indegree.get(node_id));
                            average_kcore_male_country2 += parseInt(dict_kcore.get(node_id));
                        }
                        else if(dict_gender.get(node_id) === "female"){
                            number_of_female_in_country2 += 1;
                            // accumulate indegree and kcore for female in country2
                            average_indegree_female_country2 += parseInt(dict_indegree.get(node_id));
                            average_kcore_female_country2 += parseInt(dict_kcore.get(node_id));
                        }
                    }
                });
                // get dynamic statistics of links
                var number_of_all_links = filter_links.length;


                // calculate average indegree and kcore for male/female in country1/country2
                if(number_of_male_in_country1 !== 0){average_indegree_male_country1 /= number_of_male_in_country1;}
                if(number_of_female_in_country1 !== 0){average_indegree_female_country1 /= number_of_female_in_country1;}
                if(number_of_male_in_country2 !== 0){average_indegree_male_country2 /= number_of_male_in_country2;}
                if(number_of_female_in_country2 !== 0){average_indegree_female_country2 /= number_of_female_in_country2;}
                if(number_of_male_in_country1 !== 0){average_kcore_male_country1 /= number_of_male_in_country1;}
                if(number_of_female_in_country1 !== 0){average_kcore_female_country1 /= number_of_female_in_country1;}
                if(number_of_male_in_country2 !== 0){average_kcore_male_country2 /= number_of_male_in_country2;}
                if(number_of_female_in_country2 !== 0){average_kcore_female_country2 /= number_of_female_in_country2;}

            // print related number (new codes)
            // console.log(number_of_country1);
            // console.log(number_of_country2);
            // console.log(number_of_male_in_country1);
            $('#noOfMale1').val(number_of_male_in_country1);
            // console.log(number_of_female_in_country1);
            $('#noOfFemale1').val(number_of_female_in_country1);
            // console.log(number_of_male_in_country2);
            $('#noOfMale2').val(number_of_male_in_country2);
            // console.log(number_of_female_in_country2);
            $('#noOfFemale2').val(number_of_female_in_country2);
            // console.log(number_of_all_links);
            // console.log(number_of_links_cross_country);
            $('#linkbtwc1c2').val(number_of_links_cross_country);

// print indegree and kcore
//                 console.log(Math.round(average_indegree_male_country1*100)/100);
                $('#GACM1').val(Math.round(average_indegree_male_country1*100)/100);
                // console.log(Math.round(average_indegree_female_country1*100)/100);
                $('#GACF1').val(Math.round(average_indegree_female_country1*100)/100);
                // console.log(Math.round(average_indegree_male_country2*100)/100);
                $('#GACM2').val(Math.round(average_indegree_male_country2*100)/100);
                // console.log(Math.round(average_indegree_female_country2*100)/100);
                $('#GACF2').val(Math.round(average_indegree_female_country2*100)/100);
                // console.log(Math.round(average_kcore_male_country1*100)/100);
                $('#GAKCM1').val(Math.round(average_kcore_male_country1*100)/100);
                // console.log(Math.round(average_kcore_female_country1*100)/100);
                $('#GAKCF1').val(Math.round(average_kcore_female_country1*100)/100);
                // console.log(Math.round(average_kcore_male_country2*100)/100);
                $('#GAKCM2').val(Math.round(average_kcore_male_country2*100)/100);
                // console.log(Math.round(average_kcore_female_country2*100)/100);
                $('#GAKCF2').val(Math.round(average_kcore_female_country2*100)/100);

                // Create the link lines.
                var link = container.selectAll(".link") // change "svg" to "container" for zoom in
                    .data(filter_links)
                    .enter().append("line")
                    .style("stroke","silver")
                    .on("click", function(){return})
                    .attr("class", "link")
                    // hide links with empty nodes
                    .style("visibility", function(d){
                        if(dict_gender.get(d.source.name) != "" && dict_gender.get(d.target.name) != ""){return "visible";}
                        else{return "hidden";}
                    });

                // Create the node circles.
                var node = container.selectAll(".node") // change "svg" to "container" for zoom in
                    .data(nodes)
                    .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", node_radius)
                    .attr("id", function(d){return "node_"+d.name;})
                    .style("fill", function(d){ //set color of nodes depending on countries or gender
                        var newcolor;
                        //if color_for_countries==1, color of nodes depends on countries
                        if (color_for_countries===1){
                            if (dict_nationality.get(d.name) === feature_country1){newcolor = "#FF4C40";} // light red
                            else if (dict_nationality.get(d.name)=== feature_country2){newcolor = "#00E138";} // light green
                            return newcolor;
                        }
                        // color_for_countries==0, color of nodes depends on gender
                        else if(color_for_countries===0){
                            if (dict_gender.get(d.name) === "female"){newcolor = "#FEB900";} // light orange
                            else if (dict_gender.get(d.name)=== "male"){newcolor = "#3BA6FF";} // light blue
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
                    .style("stroke", function(d){ //set stroke color of nodes depending on countries or gender
                        var newcolor;
                        //if color_for_countries==1, color of nodes depends on countries
                        if (color_for_countries===1){
                            if (dict_nationality.get(d.name) === feature_country1){newcolor = "#A10017";} // dark red
                            else if (dict_nationality.get(d.name)=== feature_country2){newcolor = "#009111";} // dark green
                            return newcolor;
                        }
                        // color_for_countries==0, color of nodes depends on gender
                        else if(color_for_countries===0){
                            if (dict_gender.get(d.name) === "female"){newcolor = "#FF7F09";} // dark orange
                            else if (dict_gender.get(d.name)=== "male"){newcolor = "#184BFF";} // dark blue
                            else{newcolor = "orange";}
                            return newcolor;
                        }

                    })
                    .style("stroke-width", "1px")
                    .on('mouseover', function(d){
                        previous_stroke = d3.select(this).style("stroke");
                        previous_fill = d3.select(this).style("fill");
                        d3.select(this).style("fill", previous_stroke);
                        d3.select(this).style("stroke", previous_fill);
                        d3.select("#label_"+d.name).style("visibility", "visible");
                    })
                    .on('mouseout', function(d){
                        previous_stroke = d3.select(this).style("stroke");
                        previous_fill = d3.select(this).style("fill");
                        d3.select(this).style("fill", previous_stroke);
                        d3.select(this).style("stroke", previous_fill);
                        d3.select("#label_"+d.name).style("visibility","hidden");
                    })

                .call(force.drag);

                // Create the node labels
                var nodelabels = container.selectAll(".nodelabel") // change "svg" to "container" for zoom in
                    .data(nodes)
                    .enter()
                    .append("text")
                    .style("visibility", "hidden")
                    .attr("id", function(d){return "label_"+d.name;})
                    .attr({"class":"nodelabel",
                        "stroke":"black"})
                    .text(function(d){
                        nodename = dict_name.get(d.name).split(",")[0].slice(2,-2);
                        uppercased = nodename.replace(/\b\w+\b/g, function(word){
                            return word.substring(0,1).toUpperCase()+word.substring(1);})
                        return uppercased; });//only show first name if there are several ones

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

                    nodelabels.attr("x", function(d) { return d.x+8; })
                        .attr("y", function(d) { return d.y-8; });

                }
            // function to resize
            function resize() {
                width = (window.innerWidth *0.7), height = (window.innerHeight *0.7);
                svg.attr("width", width).attr("height", height);
                force.size([width, height]).resume();
            }

            });
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
        var process = importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network
        $('#graphHolder').LoadingOverlay("show");
        $.when(process).done(function () {
            $('#graphHolder').LoadingOverlay("hide");
            console.log("stop");
        })

    })
    $("#countriesList2").change(function () {
        selNationality2 = this.value;
        // feature_country1 = $( "#countriesList1 option:selected" ).text();
        feature_country2 = this.value;
        var process = importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network
        $('#graphHolder').LoadingOverlay("show");
        $.when(process).done(function () {
            $('#graphHolder').LoadingOverlay("hide");
            console.log("stop");
        })

    })

    $('#colorPalette input').on('change', function() {
        console.log($('input[name=coloroptions]:checked', '#colorPalette').val());
        color_for_countries = parseInt($('input[name=coloroptions]:checked', '#colorPalette').val());
        var process = importCSV('js/'+timeFormat(initialDate)+'.csv'); //first time to generate network
        $('#graphHolder').LoadingOverlay("show");
        $.when(process).done(function () {
            $('#graphHolder').LoadingOverlay("hide");
            console.log("stop");
        })

    });




});
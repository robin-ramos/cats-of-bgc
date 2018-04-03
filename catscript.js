
// Initialize variables
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    height2 = 150 - margin.top - margin.bottom;
    height3 = 600 - margin.top - margin.bottom;
  
var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%d/%m/%Y");

var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var y2 = d3.scaleLinear().range([height2, 0]);
var y3 = d3.scaleLinear().range([height3, 0]);
var area = d3.area()
    .x(function(d) { return x(d.time); })
    .y0(function(d) { return y2(d.score); })
    .y1(function(d) { return y2(0); })
    .curve(d3.curveMonotoneX);

var valueline = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.count); })
    
var sentimentline = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y2(d.score); })
    .curve(d3.curveMonotoneX)

var tooltip = d3.select("#post").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

var milestones = [
  {date: parseTime("2015-05-30"), event: "First post in Instagram! The Cats of BGC has been known since 2015."},
  {date: parseTime("2016-08-04"), event: "More people posted about the cats in 2016..."},
  {date: parseTime("2017-08-28"), event: "...and in 2017."},
  {date: parseTime("2018-02-16"), event: "A Facebook post by Lucy M went viral. The post with 4.8K and 12K shares tells the story about how Shangri-La BGC ordered Pestbusters to remove the cats from their perimeter. <br> <br> <div class='iframe-container'> <iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fmarcellejohn.marcelino%2Fposts%2F10216653759442825&width=350&show_text=true&appId=1488368734536934&height=553' width='350' height='553' style='border:none;overflow:hidden' scrolling='yes' frameborder='0' allowTransparency='true'></iframe></div>"},
    {date: parseTime("2018-02-18"), event: "Shangri-La BGC posted a statement on their Facebook account. <br><br> <div class='iframe-container'> <iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fshangrilafort%2Fphotos%2Fa.996102000419770.1073741828.994986307198006%2F1998901190139841%2F%3Ftype%3D3&width=400&show_text=true&height=496&appId' width='400' height='496' style='border:none;overflow:hidden' scrolling='no' frameborder='0' allowTransparency='true'></iframe></div>"},
  {date: parseTime("2018-02-19"), event: "Inquirer.net posted an <a href='http://newsinfo.inquirer.net/969674/loss-of-taguig-park-cats-sparks-outcry' target='_blank'>article</a> about the issue."},
  {date: parseTime("2018-03-01"), event: "Event 7"}];

var nextMilestone = 0;
var transitionDuration = 1000;
var dataMilestone = {}; 
var dataMilestoneScatter = {};
var keywords = {};
var loadTweet = (function(id){
    var tweetdiv = document.createElement("div");
    //tweetdiv.style.width = "400px";
    document.getElementById("tweetcontainer").appendChild(tweetdiv);
    tweetdiv.id = "twit";
    var tweet = document.getElementById("twit");
    twttr.widgets.createTweet(id, tweet)});

var loadIg = (function(link){
  var request = new XMLHttpRequest();
    request.open("GET", "https://api.instagram.com/oembed/?url=" + link + ";omitscript=true;maxwidth=320;", true);
    request.onload = function(){
      var data = JSON.parse(this.response);
      document.getElementById("smpost").innerHTML = data.html;
      window.instgrm.Embeds.process();
    }
    request.send();
})

var reload = (function(){document.getElementById("smpost").innerHTML= "";})
var loadTweet2 = (function(id){
    var tweet = document.getElementById("smpost");
    twttr.widgets.createTweet(id, tweet)});

function textAnchorPosition(d) {
  var textPosition;
  if (x(d.time) > (width * 0.9)) { textPosition = "end"; }
  else if (x(d.time) < (width * 0.1)) { textPosition = "start"; }
  else { textPosition = "middle"; };
  return textPosition;
};

// Popularity Line Chart (svg) ----------------

var svg = d3.select("#chart1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("catsofbgc.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.count = +d.count;
  });

  x.domain(d3.extent(data, function(d) { return d.time; }));
  y.domain([0, d3.max(data, function(d) { return d.count; })]);

  svg.append("clipPath")
    .attr("id", "clip-popularity")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", height);

  svg.append("path")
      .data([data])
      .attr("clip-path", "url(#clip-popularity)")
      .attr("class", "line")
      .attr("id", "popularity-chart")
      .attr("d", valueline);

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

  svg.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0));
});

// Sentiment Line Chart (svg2) ----------------

var svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height2 + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("catsofbgc.csv", function(error, data) {
  if (error) throw error; 

  data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.score = +d.sentiment_score;
  });

  dataMilestone = data;

  x.domain(d3.extent(data, function(d) { return d.time; }));
  y2.domain([-1,1]);

  svg2.append("clipPath")
    .attr("id", "clip-sentiment")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", height2);

  svg2.append("linearGradient")
    .attr("id", "color-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", 0)
    .attr("x2", 0).attr("y2", height2)
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#D5F5E3"},
      {offset: "50%", color: "#D5F5E3"},
      {offset: "50%", color: "#F1948A"},
      {offset: "100%", color: "#F1948A"}
    ])
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })
    .attr("stop-color", function(d) { return d.color; });

  svg2.append("path")
      .data([data])
      .attr("clip-path", "url(#clip-sentiment)")
      .attr("class", "area")
      .attr("d", area)
      .style("fill", "url(#color-gradient)");

  svg2.append("path")
      .data([data])
      .attr("class", "line")
      .attr("id", "sentiment-line")
      .attr("d", sentimentline);

  svg2.append("g")
      .attr("transform", "translate(0," + height2/2 + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

  svg2.append("g").call(d3.axisLeft(y2).tickSizeOuter(0));

  svg2.selectAll(".tick")
      .each(function (d) {
          this.remove();
      });});

// All posts scatterplot (svg3) ----------------

var svg3 = d3.select("#chart3").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height3 + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("allposts.csv", function(error, data) {
  if (error) throw error; 

  data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.popularity = +d.pop_score;
      d.link = d.link;
      d.platform = d.platform;
      d.sentiment = +d.score;
    robin = d.time;})
      

  dataMilestoneScatter = data;

  x.domain(d3.extent(data, function(d) { return d.time; }));
  y3.domain([0, d3.max(data, function(d) { return d.popularity; })]);


  svg3.selectAll("dot")
    .data(dataMilestoneScatter)
    .enter().append("circle")
    .filter(function(d) {return d.time})
    .attr("class", "scatterplots")
    .attr("r", 5)
    .attr("cx", function(d) { return x(d.time); })
    .attr("cy", function(d) { return y3(d.popularity); })
    .attr("fill-opacity", 0)
    .style("fill", function(d){ if (d.sentiment < 0) {return 'red'} else {return 'black'}})
    .on("mouseover", function(d) {   
        d3.select(this).transition().attr('r',8);
        if (this.getAttribute("value") == "show") {
          d3.select(this).style("cursor","pointer")
          if (d.platform == "tw") {
            reload();
            loadTweet2(d.id);}
          else if (d.platform == "ig") {
            reload();
            loadIg(d.link)}}
        else { //if value is hide       
        }})          
    .on("mouseout", function(d) {  
        d3.select(this).transition().attr('r',5);
        if (this.getAttribute("value") == "show") {
          d3.select(this).style("cursor","default")
          if (d.platform == "tw") {
            //reload();
          }
          else if (d.platform == "ig"){
            //reload();
          }}});

  svg3.append("g")
      .attr("transform", "translate(0," + height3 + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

  svg3.append("g").call(d3.axisLeft(y3));
});

// Data story

   var x1 = d3.scaleLinear().range([0, 90]);
   var y1 = d3.scaleBand().range([0, 100]);

function nextStep() {

  if (milestones.length == nextMilestone) {
    svg2.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(1000)
      .attr("width",0);

    svg.selectAll("#clip-popularity").selectAll("rect")
      .transition().duration(1000)
      .attr("width",0);  

    svg3.selectAll("circle")
      .transition()
      .duration(500)
      .style("fill-opacity", 0)
      .attr("value", "hide");

    var circles = document.getElementsByClassName("milestone-circle");
    for (var i = circles.length - 1; i >= 0; i--) {
      circles[i].remove();
    }

    var milestonepoints = document.getElementsByClassName("milestone-point");
    for (var i = milestonepoints.length - 1; i >= 0; i--) {
      milestonepoints[i].remove();
    }

    nextMilestone = 0;
    svg2.selectAll(".circle-label").remove();
    document.getElementById("milestone-btn").innerHTML ="Next";}

  else {

    svg2.selectAll(".circle-label").remove();

    svg2.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(1000)
      .attr("width", x(milestones[nextMilestone].date) );

    svg.selectAll("#clip-popularity").selectAll("rect")
      .transition().duration(1000)
      .attr("width", x(milestones[nextMilestone].date) );

    svg3.selectAll("circle")
      .filter(function(d){return d.time <= milestones[nextMilestone].date})
      .transition()
      .duration(1000)
      .style("fill-opacity", 0.5)
      .attr("value", "show");
  
    var milestonePoint = svg2.selectAll(".milestone-point")
      .data(dataMilestone)
      .enter()
      .filter(function (d) { 
        return d.time.toDateString() == milestones[nextMilestone].date.toDateString() ;
      });

    var milestonePoint2 = svg.selectAll(".milestone-point")
      .data(dataMilestone)
      .enter()
      .filter(function (d) { 
        return d.time.toDateString() == milestones[nextMilestone].date.toDateString() ;
      });


   var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-100, 0])
      .html(function(d)
      {
        return "Date: " + formatTime(d.time) + "<br>"
        + "<div id='tipDiv'></div>" ;
      });

    svg.call(tip)

    milestonePoint.append("g")
      .attr("class", "milestone-point")
      .attr("transform", function (d) { return "translate(" + x(d.time) + ",0)" ; } );

    milestonePoint.append("circle")
      .attr("id", function (d) { return "circle-milestone-" + nextMilestone ; })
      .attr("class", "milestone-circle")
      .attr("cx", function (d) { return x(d.time) } )
      .attr("cy", function (d) { return y2(d.score) } )
      .attr("r", 4)
      .style("fill-opacity", 0)        
      .style("stroke-opacity", 0);

    milestonePoint2.append("circle")
      .attr("id", function (d) { return "circle-milestone2-" + nextMilestone ; })
      .attr("class", "milestone-circle")
      .attr("cx", function (d) { return x(d.time) } )
      .attr("cy", function (d) { return y(d.count) } )
      .attr("r", 4)
      .style("fill-opacity", 0)        
      .style("stroke-opacity", 0)   
      .style("cursor", "pointer")   
      .on("mouseover", function(d) {
          tip.show(d);  
          keytip(d.time)
      })
      .on("mouseout", tip.hide )
      ;


    milestonePoint.selectAll("#circle-milestone-" + nextMilestone)
      .transition()
      .duration(1000)
      .style("stroke-opacity", 0.9)
      .style("fill-opacity", 0.9);

    milestonePoint2.selectAll("#circle-milestone2-" + nextMilestone)
      .transition()
      .duration(1000)
      .style("stroke-opacity", 0.9)
      .style("fill-opacity", 0.9);

      document.getElementById("intro-text").innerHTML = '<br>' + milestones[nextMilestone].event;

    nextMilestone = nextMilestone + 1;

    if (milestones.length == nextMilestone) {
      document.getElementById("milestone-btn").innerHTML ="Reset";
    }}}


function keytip(time){
  time = formatTime(time)
  var svg4 = d3.select("#tipDiv")
              .append("svg")
              .attr("width", 150)
              .attr("height", 90);
              console.log("append svg4")

d3.csv("keywords.csv", function(error,data) {
  if (error) throw error;
  data.forEach(function(d) {
      d.time = d.time;
      d.word = d.word;
      d.freq = +d.tf_idf;
  });

  data.sort(function(x, y){
      return d3.ascending(+x.freq, +y.freq);
  });

  keywords = data.filter(function(d){

    return d.time == time})

  x1.domain([0, d3.max(keywords, function(d) { return d.freq; })]);
  y1.domain(keywords.map(function(d) { return d.word; })).padding(0.2);
  

  svg4.selectAll(".bar")
        .data(keywords)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y1.bandwidth())
        .attr("y", function(d) { return y1(d.word); })
        .attr("width", function(d) { return x1(d.freq); })
})

}

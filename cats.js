
// Initialize variables and functions
var robin;
var allposts;
var margin = {top: 30, right: 20, bottom: 30, left: 70};
var height = 5000 - margin.top - margin.bottom; //global height

var formatDate = d3.timeFormat("%B %d, %Y");  
var formatDecimal = d3.format(".2f");
var parseTime = d3.timeParse("%Y-%m-%d");
var formatComma = d3.format(",");


var reload = (function(){document.getElementById("tweetdiv").innerHTML= "";})
var loadTweet = (function(id){
    var tweet = document.getElementById("tweetdiv");
    twttr.widgets.createTweet(id, tweet)});

// Sentiment Chart 

var sentiment_width = 150 - margin.left - margin.right;
var sentiment_y = d3.scaleTime().range([height, 0]);
var sentiment_x = d3.scaleLinear().range([0, sentiment_width/2]);

var sentimentvertline = d3.line()
    .x(function(d) { return sentiment_x(d.score); })
    .y(function(d) { return sentiment_y(d.time); })
    .curve(d3.curveMonotoneX)

var sentimentsvg = d3.select("#sentimentchart")
    .append("svg")
    .attr("width", sentiment_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("catsofbgc.csv", function(error, data) {
  if (error) throw error; 

  data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.score = +d.sentiment_score;
      robin = d.score;
  });

  sentiment_y.domain(d3.extent(data, function(d) { return d.time; }).reverse());
  sentiment_x.domain([-1,1])

  sentimentsvg.append("clipPath") // clip rectangle
    .attr("id", "clip-sentiment")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 150)
    .attr("height", 0)
    .attr("transform", "translate(-40,0)");

  sentimentsvg.append("linearGradient")
    .attr("id", "color-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", 0)
    .attr("x2", 30).attr("y2", 0)
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#C70039"},
      {offset: "50%", color: "#C70039"},
      {offset: "50%", color: "#737A81"},
      {offset: "100%", color: "#737A81"}
    ])
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })
    .attr("stop-color", function(d) { return d.color; });

  sentimentsvg.append("g")
      .attr("class", "axisLine")
      .attr("transform", "translate(" + sentiment_width/4 + ",0)")
      .call(d3.axisLeft(sentiment_y).tickSizeOuter(0));

  sentimentsvg.append("text")
      .attr("y", -10)
      .attr("x", -14)
      .style("font-size", "12px")
      .text("- Sentiment +");

  sentimentsvg.append("path")
      .data([data])
      .attr("clip-path", "url(#clip-sentiment)")
      .attr("class", "line")
      .attr("id", "sentiment-line")
      .attr("d", sentimentvertline)
      .style("stroke", "url(#color-gradient)");

    var sentiment_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([30, 130])
      .html(function(d)
      {
        return "Sentiment score on " + formatDate(d.time) + ":</b><br>"
        + formatDecimal(d.score) ;
      });

  sentimentsvg.call(sentiment_tip)

  sentimentsvg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "scatterplots")
    .attr("r", 5)
    .attr("cx", function(d) { return sentiment_x(d.score); })
    .attr("cy", function(d) { return sentiment_y(d.time); })
    .attr("fill-opacity", 0)
    .on("mouseover", function(d) { 
      sentiment_tip.show(d)
      d3.select(this).style("cursor","pointer");})
    .on("mouseout", function(d) { 
      sentiment_tip.hide() 
      d3.select(this).style("cursor","default");}
      );  

  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(4000)
      .attr("height", sentiment_y(parseTime("2014-01-01")) );

  sentimentsvg.selectAll(".tick")
      .each(function (d) {
          this.remove();
      });});

// Scatterplot ---

var scatter_width = 900 - margin.left - margin.right;
var scatter_y = d3.scaleTime().range([0, height]);
var scatter_x = d3.scaleLinear().range([0, scatter_width]);


var scatter_svg = d3.select("#scatterplot").append("svg")
    .attr("width", scatter_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("allposts.csv", function(error, data) {
  if (error) throw error; 
  allposts = data;

  data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.popularity = +d.pop_score;
      d.link = d.link;
      d.platform = d.platform;
      d.sentiment = +d.score;
      d.followers =  Math.pow(Math.log10(+d.followers_count+1),2);
      d.followers_count = +d.followers_count;
      })

  scatter_y.domain(d3.extent(data, function(d) { return d.time; }));
  scatter_x.domain([0, 50]);
  //x.domain([0, d3.max(data, function(d) { return d.popularity; }) + 50]);

  //scatter_svg.append("g")
  //    .attr("class", "axisLine")
  //    .call(d3.axisBottom(scatter_x).tickSizeOuter(0));

  scatter_svg.append("g")
      .attr("class", "axisLine").call(d3.axisLeft(scatter_y))
      .call(d3.axisLeft(scatter_y).tickSizeOuter(0));

  scatter_svg.append("text")
      .attr("y", -10)
      .attr("x", -14)
      .style("font-size", "12px")
      .text("Popularity score");


  var scatter_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, 170])
      .html(function(d)
      {
        return "Username (<b>" + formatComma(d.followers_count) + " followers</b>) tweeted on <br><b>" 
        + formatDate(d.time) + "</b>, with a sentiment score of <b>" + formatDecimal(d.sentiment) + "</b>." ;
      });


  scatter_svg.call(scatter_tip)

  scatter_svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "scatterplots")
    .attr("r", 0 )
    .attr("cx", function(d) { return scatter_x(d.popularity); })
    .attr("cy", function(d) { return scatter_y(d.time); })
    .attr("fill-opacity", 0.5)
    .style("fill", function(d) { if (d.sentiment < 0) {return '#C70039'} else {return '#737A81'}})
    .on("mouseover", function(d) {   
        d3.select(this).transition().style('fill', '#00C78E');
        scatter_tip.show(d);
        loadTweet(d.id);
        d3.select(this).style("cursor","pointer");
       })          
    .on("mouseout", function(d) {  
      d3.select(this).transition().style("fill", function(d) { if (d.sentiment < 0) {return '#C70039'} else {return '#737A81'}});
      scatter_tip.hide();
      reload();
      });

  scatter_svg.append("circle")
    .attr("class", "legend")
    .attr("r", 6)
    .attr("cx", scatter_width/2)
    .attr("cy", -15)
    .attr("fill-opacity", 1)
    .style("fill", "#737A81");

  scatter_svg.append("text")
    .attr("y", -13)
    .attr("x", scatter_width/2 + 10)
    .style("font-size", "10px")
    .text("Positive/neutral sentiment");

  scatter_svg.append("circle")
    .attr("class", "legend")
    .attr("r", 6)
    .attr("cx", scatter_width/2)
    .attr("cy", 0)
    .attr("fill-opacity", 1)
    .style("fill", "#C70039"); 

  scatter_svg.append("text")
    .attr("y", 3)
    .attr("x", scatter_width/2 + 10)
    .style("font-size", "10px")
    .text("Negative sentiment");

  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2014-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  // Start animation
      d3.select(this)  // 'this' means the current element
        .attr("r", function(d) { return d.followers })  // Change size
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  // Dynamic delay (i.e. each item delays a little longer)
      })  
});

function step1(data){ // First tweet
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2016-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  // Start animation
      d3.select(this)  // 'this' means the current element
        .attr("r", function(d) { return d.followers })  // Change size
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  // Dynamic delay (i.e. each item delays a little longer)
      })


  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(4000)
      .attr("height", sentiment_y(parseTime("2016-01-01")) );
}

function step2(data){ // Pats for Fancy Cat
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2017-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  // Start animation
      d3.select(this)  // 'this' means the current element
        .attr("r", function(d) { return d.followers })  // Change size
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  // Dynamic delay (i.e. each item delays a little longer)
      })

  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(4000)
      .attr("height", sentiment_y(parseTime("2017-01-01")) );
}

function step3(data){ // Beeline for felines
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2018-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  // Start animation
      d3.select(this)  // 'this' means the current element
        .attr("r", function(d) { return d.followers })  // Change size
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  // Dynamic delay (i.e. each item delays a little longer)
      })


  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(4000)
      .attr("height", sentiment_y(parseTime("2018-01-01")) );
}

function step4(data){ // Year of the Cat
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2018-02-17")})
    .transition()
    .duration(3000) 
    .on("start", function() {  // Start animation
      d3.select(this)  // 'this' means the current element
        .attr("r", function(d) { return d.followers })  // Change size
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  // Dynamic delay (i.e. each item delays a little longer)
      });


  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(4000)
      .attr("height", sentiment_y(parseTime("2018-02-17")) );  
}

function step5(data){ // Adding kindle to the fire
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2018-04-20")})
    .transition()
    .duration(3000) 
    .on("start", function() {  // Start animation
      d3.select(this)  // 'this' means the current element
        .attr("r", function(d) { return d.followers })  // Change size
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  // Dynamic delay (i.e. each item delays a little longer)
      })


  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(4000)
      .attr("height", sentiment_y(parseTime("2018-04-20")) );
}

function updateScatterAxis(data) {
  scatter_x.domain([0, d3.max(data, function(d) { return d.popularity; }) + 10]);
  scatter_svg.selectAll(".scatterplots").transition().duration(2000).attr("cx", function(d) { 
      return scatter_x(d.popularity);});
}

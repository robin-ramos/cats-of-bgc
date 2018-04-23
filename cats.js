
// Initialize variables and functions
var robin;
var allposts;
var margin = {top: 50, right: 50, bottom: 50, left: 70};
var height = 10000 - margin.top - margin.bottom; //global height

var formatDate = d3.timeFormat("%B %d, %Y");  
var formatDecimal = d3.format(".2f");
var formatInteger = d3.format(".0f");
var parseTime = d3.timeParse("%Y-%m-%d");
var formatComma = d3.format(",.0f");


var reload = (function(){document.getElementById("tweetdiv").innerHTML= "";})
var loadTweet = (function(id){
    var tweet = document.getElementById("tweetdiv");
    twttr.widgets.createTweet(id, tweet, {conversation:"none", width:550})});

var sentiment_width = 150 - margin.left - margin.right;
var scatter_width = 900 - margin.left - margin.right;

var chartsvg = d3.select("#svg-div")
    .append("svg")
    .attr("width", scatter_width + sentiment_width + margin.left + margin.right)
    .attr("height", height + margin.bottom)
    .append("g");

// Sentiment Chart 

var sentiment_y = d3.scaleTime().range([height, 0]);
var sentiment_x = d3.scaleLinear().range([0, sentiment_width/2]);

var sentimentvertline = d3.line()
    .x(function(d) { return sentiment_x(d.score); })
    .y(function(d) { return sentiment_y(d.time); })
    .curve(d3.curveMonotoneX)

var area = d3.area()
    .x(function(d) { return sentiment_x(d.score); })
    .y0(function(d) { return sentiment_y(d.time); })
    .y1(function(d) { return sentiment_y(0); })
    .curve(d3.curveMonotoneX);

var sentimentsvg = chartsvg
    .append("svg")
    .attr("width", sentiment_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top/2 + ")");

var axissvg = d3.select("#axes")
    .append("svg")       
        .attr("width", sentiment_width + margin.left + margin.right + scatter_width)
        .attr("height", 20)

d3.csv("catsofbgc.csv", function(error, data) {
  if (error) throw error; 

  data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.score = +d.sentiment_score;
      robin = d.score;
      if (d.score > 0) {d.sign = "positive"} else if (d.score < 0) {d.sign = "negative"} else {d.sign = "neutral"}
  });

  sentiment_y.domain(d3.extent(data, function(d) { return d.time; }).reverse());
  sentiment_x.domain([-0.5,0.5])

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
    .attr("x2", 15).attr("y2", 0)
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#C70039"},
      {offset: "50%", color: "#C70039"},
      {offset: "50%", color: "#858687"},
      {offset: "100%", color: "#858687"}
    ])
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })
    .attr("stop-color", function(d) { return d.color; });

  sentimentsvg.append("g")
      .attr("class", "axisLine")
      .attr("transform", "translate(" + sentiment_width/4 + ",0)")
      .call(d3.axisLeft(sentiment_y).tickSizeOuter(0));

  axissvg.append("text")
      .attr("y", 15)
      .attr("x", 25)
      .style("font-size", "15px")
      .style("fill", "#ABB2B9")
      .text("- Sentiment +")
      .attr("id", "sentiment_axis");

  sentimentsvg.append("path")
      .data([data])
      .attr("clip-path", "url(#clip-sentiment)")
      .attr("class", "line")
      .attr("id", "sentiment-line")
      .attr("d", sentimentvertline)
      .style("stroke", "url(#color-gradient)")
      .style("opacity", 0.8);



    var sentiment_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([30, 130])
      .html(function(d)
      {
        return "Net sentiment on <br><b>" + formatDate(d.time) + "</b><br>"
        +  "is " + d.sign;
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


var scatter_y = d3.scaleTime().range([0, height]);
var scatter_x = d3.scaleLinear().range([0, scatter_width]);


var scatter_svg = chartsvg.append("svg")
    .attr("width", scatter_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + (sentiment_width + margin.left + margin.right +  margin.left) + "," + margin.top/2 + ")");


d3.csv("allposts.csv", function(error, data) {
  if (error) throw error; 
  allposts = data;

  data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.popularity = +d.pop_score;
      d.popularity_jittered = d.popularity + Math.random();
      d.link = d.link;
      d.platform = d.platform;
      d.sentiment = +d.score;
      d.followers =  Math.pow(Math.log10(+d.followers_count+1),2) + 1;
      d.followers_count = +d.followers_count;
      })

  scatter_y.domain(d3.extent(data, function(d) { return d.time; }));
  scatter_x.domain([0, 30]);
  //x.domain([0, d3.max(data, function(d) { return d.popularity; }) + 50]);

  scatter_svg.append("g")
     .attr("class", "axisLine")
     .call(d3.axisBottom(scatter_x).tickSizeOuter(0));


  scatter_svg.append("g")
      .attr("class", "axisLine")
      .call(d3.axisLeft(scatter_y).tickSizeOuter(0));


  axissvg.append("text")
      .attr("y", 15)
      .attr("x", 50 + sentiment_width + margin.left*2)
      .style("font-size", "15px")
      .style("fill", "#ABB2B9")
      .text("Popularity score ");

  axissvg.append("text")
      .attr("y", 15)
      .attr("x", 40 + sentiment_width + margin.left*4)
      .style("font-size", "10px")
      .style("fill", "#ABB2B9")
      .text("(likes + retweets)");      

  chartsvg.append("g")
     .attr("transform", "translate(" + margin.left/2 + ", "+ (scatter_y(parseTime("2012-02-30")) + margin.top)+")")
     .append("line")
     .attr("x2", sentiment_width + scatter_width*0.80)
     .attr("class", "timeLine");

  chartsvg.append("text")
    .attr("transform", "translate(" + (sentiment_width + scatter_width*0.87) + ", "+ (scatter_y(parseTime("2012-02-30"))+15 + margin.top) +")")
    .attr("class", "timeLine")
    .text("2012");

  chartsvg.append("g")
     .attr("transform", "translate(" + margin.left/2 + ", "+ (scatter_y(parseTime("2013-01-01")) + margin.top)+")")
     .append("line")
     .attr("x2", sentiment_width + scatter_width*0.80)
     .attr("class", "timeLine");

  chartsvg.append("text")
    .attr("transform", "translate(" + (sentiment_width + scatter_width*0.87) + ", "+ (scatter_y(parseTime("2013-01-01"))+15 + margin.top) +")")
    .attr("class", "timeLine")
    .text("2013");

  chartsvg.append("g")
     .attr("transform", "translate(" + margin.left/2 + ", "+ (scatter_y(parseTime("2014-01-01")) + margin.top)+")")
     .append("line")
     .attr("x2", sentiment_width + scatter_width*0.80)
     .attr("class", "timeLine");

  chartsvg.append("text")
    .attr("transform", "translate(" + (sentiment_width + scatter_width*0.87) + ", "+ (scatter_y(parseTime("2014-01-01"))+15 + margin.top) +")")
    .attr("class", "timeLine")
    .text("2014");

  chartsvg.append("g")
     .attr("transform", "translate(" + margin.left/2 + ", "+ (scatter_y(parseTime("2015-01-01")) + margin.top)+")")
     .append("line")
     .attr("x2", sentiment_width + scatter_width*0.80)
     .attr("class", "timeLine");

  chartsvg.append("text")
    .attr("transform", "translate(" + (sentiment_width + scatter_width*0.87) + ", "+ (scatter_y(parseTime("2015-01-01"))+15 + margin.top) +")")
    .attr("class", "timeLine")
    .text("2015");

  chartsvg.append("g")
     .attr("transform", "translate(" + margin.left/2 + ", "+ (scatter_y(parseTime("2016-01-01")) + margin.top) +")")
     .append("line")
     .attr("x2", sentiment_width + scatter_width*0.80)
     .attr("class", "timeLine");

  chartsvg.append("text")
    .attr("transform", "translate(" + (sentiment_width + scatter_width*0.87) + ", "+ (scatter_y(parseTime("2016-01-01"))+15 + margin.top) +")")
    .attr("class", "timeLine")
    .text("2016");

  chartsvg.append("g")
     .attr("transform", "translate(" + margin.left/2 + ", "+ (scatter_y(parseTime("2017-01-01")) + margin.top)+")")
     .append("line")
     .attr("x2", sentiment_width + scatter_width*0.80)
     .attr("class", "timeLine");

  chartsvg.append("text")
    .attr("transform", "translate(" + (sentiment_width + scatter_width*0.87) + ", "+ (scatter_y(parseTime("2017-01-01"))+15  + margin.top) +")")
    .attr("class", "timeLine")
    .text("2017");

  chartsvg.append("g")
     .attr("transform", "translate(" + margin.left/2 + ", "+ (scatter_y(parseTime("2018-01-01")) + margin.top)+")")
     .append("line")
     .attr("x2", sentiment_width + scatter_width*0.80)
     .attr("class", "timeLine");

  chartsvg.append("text")
    .attr("transform", "translate(" + (sentiment_width + scatter_width*0.87) + ", "+ (scatter_y(parseTime("2018-01-01"))+15  + margin.top) +")")
    .attr("class", "timeLine")
    .text("2018");

  var scatter_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, 170])
      .html(function(d)
      {
        return "<div align='left'>Username (<b>" + formatComma(d.followers_count) + " followers</b>) <br> tweeted on <b>" 
        + formatDate(d.time) + "</b> <br> with a sentiment score of <b>" + formatDecimal(d.sentiment) + "</b>.<br>" 
        + "Likes: " + "<br>Retweets:</div>"
        ;
      });


  scatter_svg.call(scatter_tip)

  scatter_svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "scatterplots")
    .attr("r", 0 )
    .attr("cx", function(d) { return scatter_x(d.popularity_jittered); })
    .attr("cy", function(d) { return scatter_y(d.time); })
    .attr("fill-opacity", 0.3)
    .style("fill", function(d) { if (d.sentiment < 0) {return '#C70039'} else {return '#858687'}})
    .on("mouseover", function(d) {   
        d3.select(this).transition().style('fill', '#00C78E');
        scatter_tip.show(d);
        loadTweet(d.id);
        d3.select(this).style("cursor","pointer");
       })          
    .on("mouseout", function(d) {  
      d3.select(this).transition().style("fill", function(d) { if (d.sentiment < 0) {return '#C70039'} else {return '#858687'}});
      scatter_tip.hide();
      reload();
      });

  var color_legends = scatter_svg.append("g")
      .attr("class", "color-legend")
      .attr("transform", "translate(100,40)");

  color_legends.append("circle")
    .attr("class", "legend")
    .attr("r", 6)
    .attr("cx", scatter_width/2)
    .attr("cy", -15)
    .attr("fill-opacity", 1)
    .style("fill", "#858687");

  color_legends.append("text")
    .attr("y", -13)
    .attr("x", scatter_width/2 + 10)
    .style("font-size", "12px")
    .style("fill", "#ABB2B9")
    .text("Positive/neutral sentiment")


  color_legends.append("circle")
    .attr("class", "legend")
    .attr("r", 6)
    .attr("cx", scatter_width/2)
    .attr("cy", 0)
    .attr("fill-opacity", 1)
    .style("fill", "#C70039"); 

  color_legends.append("text")
    .attr("y", 3)
    .attr("x", scatter_width/2 + 10)
    .style("font-size", "12px")
    .style("fill", "#ABB2B9")
    .text("Negative sentiment");

  var size_legends = scatter_svg.append("g")
      .attr("class", "size-legend")
      .attr("transform", "translate(110,60)");

  size_legends.append("circle") //500 followers
    .attr("class", "legend")
    .attr("r", Math.pow(Math.log10(500+1),2) + 1)
    .attr("cx", scatter_width/2)
    .attr("cy", 15)
    .attr("fill-opacity", 0.2)
    .style("fill", "white"); 

  size_legends.append("text")
    .attr("y", 20)
    .attr("x", scatter_width/2)
    .style("font-size", "12px")
    .style("fill", "#ABB2B9")
    .text("500 followers")

  size_legends.append("circle") // 5K followers
    .attr("class", "legend")
    .attr("r", Math.pow(Math.log10(5000+1),2) + 1)
    .attr("cx", scatter_width/2)
    .attr("cy", 15 + Math.pow(Math.log10(500+1),2) + 1)
    .attr("fill-opacity", 0.2)
    .style("fill", "white"); 

  size_legends.append("text")
    .attr("y", 35)
    .attr("x", scatter_width/2)
    .style("font-size", "12px")
    .style("fill", "#ABB2B9")
    .text("5K followers")

  size_legends.append("circle") // 50K followers
    .attr("class", "legend")
    .attr("r", Math.pow(Math.log10(50000+1),2) + 1)
    .attr("cx", scatter_width/2)
    .attr("cy", 15 + Math.pow(Math.log10(5000+1),2) + 1)
    .attr("fill-opacity", 0.2)
    .style("fill", "white"); 

  size_legends.append("text")
    .attr("y", 50)
    .attr("x", scatter_width/2)
    .style("font-size", "12px")
    .style("fill", "#ABB2B9")
    .text("50K followers")

  size_legends.append("circle")  //500K followers
    .attr("class", "legend")
    .attr("r", Math.pow(Math.log10(500000+1),2) + 1)
    .attr("cx", scatter_width/2)
    .attr("cy", 15 + Math.pow(Math.log10(50000+1),2) + 1)
    .attr("fill-opacity", 0.2)
    .style("fill", "white"); 

  size_legends.append("text")
    .attr("y", 65)
    .attr("x", scatter_width/2)
    .style("font-size", "12px")
    .style("fill", "#ABB2B9")
    .text("500K followers")

  scatter_svg.selectAll(".tick")
      .each(function (d) {
          this.remove();
      });

  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2014-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  
      d3.select(this)  
        .attr("r", function(d) { return d.followers })  
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  
      })  
});

function step1(data){ // First tweet
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2016-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  
      d3.select(this)  
        .attr("r", function(d) { return d.followers })  
      })
    .delay(function(d, i) {
        return i / data.length * 4000; 
      })


  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(7000)
      .attr("height", sentiment_y(parseTime("2016-01-01")) );
}

function step2(data){ // Pats for Fancy Cat
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2017-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  
      d3.select(this)  
        .attr("r", function(d) { return d.followers })  
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  
      })

  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(7000)
      .attr("height", sentiment_y(parseTime("2017-01-01")) );
}

function step3(data){ // Beeline for felines
  scatter_svg.selectAll("circle")
    .data(data)
    .filter(function(d){return d.time <= parseTime("2018-01-01")})
    .transition()
    .duration(3000) 
    .on("start", function() {  
      d3.select(this) 
        .attr("r", function(d) { return d.followers })  
      })
    .delay(function(d, i) {
        return i / data.length * 4000;  
      })


  sentimentsvg.selectAll("#clip-sentiment").selectAll("rect")
      .transition().duration(7000)
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
      .transition().duration(7000)
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
      .transition().duration(7000)
      .attr("height", sentiment_y(parseTime("2018-04-20")) );
}

function updateScatterAxis(data) {
  scatter_x.domain([0, d3.max(data, function(d) { return d.popularity_jittered; }) + 10]);
  scatter_svg.selectAll(".scatterplots").transition().duration(2000).attr("cx", function(d) { 
      return scatter_x(d.popularity_jittered);});
}

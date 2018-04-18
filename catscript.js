
// Initialize variables
var margin = {top: 20, right: 20, bottom: 30, left: 50},
      
    height = 400 - margin.top - margin.bottom;
    height2 = 150 - margin.top - margin.bottom;
    height3 = 6000 - margin.top - margin.bottom;
  
var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%d/%m/%Y");
var formatDate = d3.timeFormat("%B %d, %Y");
var formatComma = d3.format(",");
var formatDecimal = d3.format(".2f");

var y3 = d3.scaleTime().range([0, height3]); //scatterplot
var y = d3.scaleLinear().range([height, 0]);
var y2 = d3.scaleLinear().range([height2, 0]);
var x = d3.scaleLinear().range([0, width]);
var area = d3.area()
    .x(function(d) { return x(d.time); })
    .y0(function(d) { return y2(d.score); })
    .y1(function(d) { return y2(0); })
    .curve(d3.curveMonotoneX);

var sentimentline = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y2(d.score); })
    //.curve(d3.curveMonotoneX)

var tooltip = d3.select("#post").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 1);

var milestones = [
  {date: parseTime("2014-05-12"), event: "First tweet! People have been started tweeting about Cats of BGC since 2014.  <div class='iframe-container'><blockquote class='twitter-tweet' data-lang='en'><p lang='en' dir='ltr'>Some idiot put handcuffs on the neck of this poor cat. Seen moments ago at BGC 7th cor 32nd near the bus stop. <a href='https://twitter.com/hashtag/PAWS?src=hash&amp;ref_src=twsrc%5Etfw'>#PAWS</a> <a href='http://t.co/oXoAA7irNy'>pic.twitter.com/oXoAA7irNy</a></p>&mdash; TJS Daily (@TJSDaily) <a href='https://twitter.com/TJSDaily/status/465790905224404992?ref_src=twsrc%5Etfw'>May 12, 2014</a></blockquote><script async src='https://platform.twitter.com/widgets.js' charset='utf-8'></script> </div>"},
  {date: parseTime("2016-08-20"), event: "More people posted about the cats in 2016..."},
  {date: parseTime("2017-12-31"), event: "...and in 2017."},
  {date: parseTime("2018-02-16"), event: "A Facebook post by Lucy M went viral. The post with 4.8K and 12K shares tells the story about how Shangri-La BGC ordered Pestbusters to remove the cats from their perimeter. <br> <br> <div class='iframe-container'> <iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fmarcellejohn.marcelino%2Fposts%2F10216653759442825&width=350&show_text=true&appId=1488368734536934&height=553' width='350' height='553' style='border:none;overflow:hidden' scrolling='yes' frameborder='0' allowTransparency='true'></iframe></div>"},
  {date: parseTime("2018-02-18"), event: "Shangri-La BGC posted a statement on their Facebook account. <br><br> <div class='iframe-container'> <iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fshangrilafort%2Fphotos%2Fa.996102000419770.1073741828.994986307198006%2F1998901190139841%2F%3Ftype%3D3&width=350&show_text=true&height=452&appId' width='350' height='452' style='border:none;overflow:hidden' scrolling='no' frameborder='0' allowTransparency='true'></iframe></div>"},
  {date: parseTime("2018-02-19"), event: "Inquirer.net posted an <a href='http://newsinfo.inquirer.net/969674/loss-of-taguig-park-cats-sparks-outcry' target='_blank'>article</a> about the issue."},
  {date: parseTime("2018-02-20"), event: "Shangri-La BGC's manager posted a public apology on their Facebook account <br> <iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fweb.facebook.com%2Fshangrilafort%2Fposts%2F2001217123241581%3A0&width=350&show_text=true&appId=1488368734536934&height=144' width='350' height='144' style='border:none;overflow:hidden' scrolling='no' frameborder='0' allowTransparency='true'></iframe>"},
  {date: parseTime("2018-02-23"), event: "After being silent for a few days, Pestbusters has finally voiced out their side. <br> <div class='iframe-container'><iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fweb.facebook.com%2Fzeropests%2Fposts%2F899416996900761&width=350&show_text=true&appId=1488368734536934&height=541' width='350' height='541' style='border:none;overflow:hidden' scrolling='no' frameborder='0' allowTransparency='true'></iframe></div>"},
  {date: parseTime("2018-03-31"), event: "Until today, netizens does not seem to forget about the incident."}];

var nextMilestone = -1;
var transitionDuration = 2000;
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


// Sentiment line vertical -----

var sentiment_width = 150 - margin.left - margin.right;

var sentiment_y = d3.scaleTime().range([height3, 0]);
var sentiment_x = d3.scaleLinear().range([0, sentiment_width/2]);

var sentimentvertline = d3.line()
    .x(function(d) { return sentiment_x(d.score); })
    .y(function(d) { return sentiment_y(d.time); })
    //.curve(d3.curveMonotoneX)
var sentimentvertline = d3.line()
    .x(function(d) { return sentiment_x(d.score); })
    .y(function(d) { return sentiment_y(d.time); })
    .curve(d3.curveMonotoneX)

var sentimentsvg = d3.select("#sentimentchart")
    .append("svg")
    .attr("width", sentiment_width + margin.left + margin.right)
    .attr("height", height3 + margin.top + margin.bottom)
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

  sentimentsvg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("id", "sentiment-line")
      .attr("d", sentimentvertline);

  sentimentsvg.append("g")
      .attr("class", "axisLine")
      .attr("transform", "translate(" + sentiment_width/4 + ",0)")
      .call(d3.axisLeft(sentiment_y).tickSizeOuter(0));

    var sentiment_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, 150])
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

  sentimentsvg.selectAll(".tick")
      .each(function (d) {
          this.remove();
      });});
// All posts scatterplot (svg3) ----------------

var svg3 = d3.select("#scatterchart").append("svg")
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
      d.followers =  Math.pow(Math.log10(+d.followers_count+1),2);
      d.followers_count = +d.followers_count;
      })

  y3.domain(d3.extent(data, function(d) { return d.time; }));
  x.domain([0, 50]);
  //x.domain([0, d3.max(data, function(d) { return d.popularity; }) + 50]);

  svg3.append("g")
      .attr("class", "axisLine")
      .attr("transform", "translate(0," + height3 + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

  svg3.append("g")
      .attr("class", "axisLine").call(d3.axisLeft(y3));

  svg3.append("text")
      .attr("class", "axisLine")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height3 / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#A2C2B9")
      .style("font-size", "14px")
      .text("Popularity score");

  var tip2 = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, 150])
      .html(function(d)
      {
        return "A tweet posted on <b>" + formatDate(d.time) + "</b><br>"
        + "by a user with <b>" + formatComma(d.followers_count) + "</b> followers." ;
      });

  svg3.call(tip2)

  svg3.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "scatterplots")
    .attr("r", function(d) { return d.followers})
    .attr("cx", function(d) { return x(d.popularity); })
    .attr("cy", function(d) { return y3(d.time); })
    .attr("fill-opacity", 0.5)
    .style("fill", function(d){ if (d.sentiment < 0) {return '#FD1772'} else {return '#737A81'}})
    .on("mouseover", function(d) {   
        d3.select(this).transition().style('fill', '#1F2929');
          tip2.show(d);
          d3.select(this).style("cursor","pointer");
            reload();
            loadTweet2(d.id);
       })          
    .on("mouseout", function(d) {  
      d3.select(this).transition().style("fill", function(d){ if (d.sentiment < 0) {return '#FD1772'} else {return '#737A81'}});
          tip2.hide();
          d3.select(this).style("cursor","default");
          });


});


function updateAxis3(data) {
  y3.domain([0, d3.max(data, function(d) { return d.popularity; })]);
  svg3.select(".axisLine").remove()
  svg3.transition().duration(2000).attr("class", "axisLine").call(d3.axisLeft(y3));
  svg3.append("g")
      .attr("class", "axisLine")
      .attr("transform", "translate(0," + height3 + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));
  svg3.selectAll("circle").transition().duration(1000).attr("cy", function(d) { 
      return y3(d.popularity);});
}

function reupdateAxis3() {
  y3.domain([0, 100]);
  svg3.select(".axisLine").remove()
  svg3.transition().duration(2000).attr("class", "axisLine").call(d3.axisLeft(y3));
  svg3.append("g")
      .attr("class", "axisLine")
      .attr("transform", "translate(0," + height3 + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));
}
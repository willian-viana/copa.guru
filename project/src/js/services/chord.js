module.factory('chord',['$window', function ($window){
  var service = {
    render :  function (id, data, grupo, $scope){

          var width = Math.min(grupo ? 460 : 1024, $window.innerWidth - 60),
              height = Math.min(grupo ? 460 : 1024, $window.innerWidth - 60),
              outerRadius = Math.min(grupo ? 240 : 760, grupo ? $window.innerWidth *5/8 : $window.innerWidth * 3/8),
              innerRadius = outerRadius - (grupo ? 140 : outerRadius/2);

          var padding = $window.innerWidth > 500 ? ($window.innerWidth > 900 ? 12 : 8) : 6;

          var noPoints =  $window.innerWidth <= 500;

          var fill = d3.scale.category10();

          var chord = d3.layout.chord()
              .padding(grupo ? 0.6 : 0.04)
              .sortSubgroups(d3.descending)
              .sortChords(d3.descending);

          var bgArcs = d3.map();
          for(var i = 1; i <= 9; i++){
            bgArcs.set(i, d3.svg.arc()
                .innerRadius(innerRadius + i * padding)
                .outerRadius(innerRadius + ((i+1) * padding))
                .startAngle(0)
                .endAngle(Math.PI * 2));
          }

          var arc2 = d3.svg.arc()
              .innerRadius(innerRadius)
              .outerRadius(innerRadius + padding);

          var arcs = d3.map();
          for(i = 0; i <= 9; i++){
             var arc = d3.svg.arc()
              .innerRadius(innerRadius + padding)
              .outerRadius(innerRadius + padding + ((i+1) * padding));

            arcs.set(i,arc);
          }

          var svg = d3.select("#" + id)
              .attr("width", width)
              .attr("height", height)
            .append("g")
              .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

          var defs = svg.append("defs");
          var filter = defs.append("filter")
              .attr("id", "drop-shadow-" + id)
              .attr("width","200%")
              .attr("height","200%");
          filter.append("feGaussianBlur")
              .attr("in", "SourceAlpha")
              .attr("stdDeviation", 2)
              .attr("result", "blur");
          filter.append("feOffset")
              .attr("in", "blur")
              .attr("dx", 2)
              .attr("dy", 2)
              .attr("result", "offsetBlur");
          var feMerge = filter.append("feMerge");
          feMerge.append("feMergeNode")
              .attr("in", "offsetBlur");
          feMerge.append("feMergeNode")
              .attr("in", "SourceGraphic");

          var bg = svg.append('g');

          for(i = 1; i <= 9; i++){
            var bgg = bg.append("g").attr("class","bg");
            bgg.append("path")
              .style("fill", "#ddd" )
              .style("fill-opacity", 0.4)
              .attr("d", bgArcs.get(i)).style("stroke", "#fff").style("stroke-opacity",0.4);
            if(!noPoints)
              bgg.append("text").classed("points_text",true).text(i).attr("y", -(innerRadius + padding * i + 2)).attr("x",-10)
                 .style("fill", "#fff").style("font-size",8);
          }

          if(!noPoints)
            bg.append("text").classed("points_text",true).text("Pontos").attr("y", -(innerRadius + padding * 10 + 2)).attr("x",-8).style("fill", "#fff")
              .style("text-anchor", "middle").style("font-size",8);

            var indexByName = d3.map(),
                nameByIndex = d3.map(),
                colorByIndex = d3.map(),
                color2ByIndex = d3.map(),
                imgByIndex = d3.map(),
                golsFeitosByIndex = d3.map(),
                partidaByIndex = d3.map(),
                dataByIndex = d3.map(),
                matrix = [],
                n = 0;

            var paises = [];

            data.paises.forEach(function(d) {
              if(!grupo || d.grupo == grupo)
                paises.push(d);
            });

            paises.forEach(function(d) {
              if (!indexByName.has(d.nome)) {
                nameByIndex.set(n, d.nome);
                colorByIndex.set(n,d.cor1);
                color2ByIndex.set(n,d.cor2);
                imgByIndex.set(n,d.img);
                dataByIndex.set(n,d);
                indexByName.set(d.nome, n++);
              }
            });

            paises.forEach(function(d) {
              var source = indexByName.get(d.nome),
                  row = matrix[source];
              if (!row) {
               row = matrix[source] = [];
               for (var i = -1; ++i < n;) row[i] = 0;
              }

              data.jogos.forEach(function(j) {
                if(j.time1 == d.nome){
                  golsFeitosByIndex.set(indexByName.get(j.time1) + "_" + indexByName.get(j.time2),j.gols1);
                  partidaByIndex.set(indexByName.get(j.time1) + "_" + indexByName.get(j.time2),j);
                  row[indexByName.get(j.time2)]++;

                }else if(j.time2 == d.nome){
                  golsFeitosByIndex.set(indexByName.get(j.time2) + "_" + indexByName.get(j.time1),j.gols2);
                  partidaByIndex.set(indexByName.get(j.time2) + "_" + indexByName.get(j.time1),j);
                  row[indexByName.get(j.time1)]++;
                }
              });
            });

            chord.matrix(matrix);

            var g = svg.selectAll(".team")
                .data(chord.groups)
              .enter().append("g")
                .attr("class", "team")
                .on("mouseover",function(d){
                  $scope.selected = { type : 'team', data : dataByIndex.get(d.index) };
                  safeDigest($scope);


                  for(i = 0; i <= 9; i++){
                    d3.select(this).selectAll(".points_"+i)
                    .style('fill',fillSelectFunc(i))
                    .style("fill-opacity", opacitySelectFunc(i));
                  }

                })
                .on("mouseout",function(d){
                  $scope.selected = null;
                  safeDigest($scope);

                  for(i = 0; i <= 9; i++){
                    d3.select(this).selectAll(".points_"+i)
                    .style('fill',fillFunc)
                    .style("fill-opacity", opacityFunc(i));
                  }
                });

            g.append("path")
                  .style("fill", function(d) { return color2ByIndex.get(d.index); })
                  .style("fill-opacity", 0.4)
                  .attr("d", arc2);


            var fillFunc =  function(d) { return colorByIndex.get(d.index); };
            var opacityFunc = function(i){return function(d){return dataByIndex.get(d.index).pontos() > i ? 0.3 : 0;};};
            var fillSelectFunc = function(i){return function(d){
              return dataByIndex.get(d.index).pontos() <= i ? '#ccc' : colorByIndex.get(d.index);
            };};
            var opacitySelectFunc = function(i){return function(d){return dataByIndex.get(d.index).pontos() > i ? 0.3 : 0.2;};};

            for(i = 8; i >= 0; i--){
              g.append("path").attr('class', 'points points_'+i)
                  .style("fill", fillFunc)
                  .style("fill-opacity", opacityFunc(i))
                  .attr("d", arcs.get(i));
            }
          /*
            g.append("text")
                .attr("class", "title")
                font-size: paddingpx;
            font-weight: bold;
            font-family: Arial;
            fill : white;
            fill-opacity : 0.9;
                .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
                .attr("dy", "44px")
                .attr("transform", function(d) {
                  return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                      + "translate(" + (innerRadius + padding * 4.5) + ")"
                      + "rotate(" + -(d.angle * 180 / Math.PI - 90) + ")";
                })
                .style("text-anchor", "middle")
                .style("filter", "url(#drop-shadow-"+id+")")
                .text(function(d) { return nameByIndex.get(d.index); });
          */
            g.append("svg:image")
             .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
             .attr("xlink:href", function(d){return "/img/48/" + imgByIndex.get(d.index);})
             .attr("x", "-24")
             .attr("y", "-24")
             .attr("width", "48")
             .attr("height", "48")
             .style("filter", "url(#drop-shadow-"+id+")")
             .style("opacity", 0.7)
             .attr("transform", function(d) {
                  return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius + padding * 4.5) + ")"+ "rotate(" + -(d.angle * 180 / Math.PI - 90) + ")";
                });


            var chordG = svg.selectAll(".chord")
                .data(chord.chords)
              .enter().append("g")
                .on("mouseover",function(d){
                  this.parentNode.appendChild(this);
                  d3.select(this).classed("active",true);
                  d3.select(this).selectAll("text.goals").style("visibility","visible");
                  d3.select(this).selectAll(".chord")
                          .style("fill-opacity", 0.8);

                  $scope.selected = { type : 'match', data : partidaByIndex.get(d.source.index + "_" + d.target.index) };
                  safeDigest($scope);

                })
                .on("mouseout",function(d){
                  d3.select(this).classed("active",false);
                  d3.select(this).selectAll("text.goals").style("visibility","hidden");
                  d3.select(this).selectAll(".chord")
                          .style("fill-opacity", 0.2);

                  $scope.selected = null;
                  safeDigest($scope);
                });

            chordG.append("path")
                .attr("class", "chord")
                .style("fill-opacity", 0.67)
                .style("fill", function(d,i){return "url(#grad_" + d.source.index + "_" + d.target.index + "_" + id + ")";})
                .style("fill-opacity", 0.2)
                .attr("d", d3.svg.chord().radius(innerRadius));


             chordG.append("text")
                .attr("class", "goals goals1")
                .style("visibility","hidden")
                .style("font-size","paddingpx")
                .style("font-weight","bold")
                .style("fill","white")
                .style("fill-opacity","0.9")
                .each(function(d) { d.angle = (d.source.startAngle + d.source.endAngle) / 2; })
                .attr("transform", function(d) {return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius - 20) + ")" + "rotate(" + -(d.angle * 180 / Math.PI - 90) + ")"; })
                .style("text-anchor", "middle")
                .style("filter", "url(#drop-shadow-"+id+")")
                .text(function(d) { return golsFeitosByIndex.get(d.source.index + "_" + d.target.index); });

             chordG.append("text")
                .attr("class", "goals goals2")
                .style("visibility","hidden")
                .style("font-size","paddingpx")
                .style("font-weight","bold")
                .style("fill","white")
                .style("fill-opacity","0.9")
                .each(function(d) { d.angle = (d.target.startAngle + d.target.endAngle) / 2; })
                .attr("transform", function(d) {
                  return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius - 20) + ")"+ "rotate(" + -(d.angle * 180 / Math.PI - 90) + ")";
                })
                .style("text-anchor", "middle")
                .style("filter", "url(#drop-shadow-"+id+")")
                .text(function(d) { return golsFeitosByIndex.get(d.target.index + "_" + d.source.index); });

            var gradient = chordG.append("svg:defs")
              .append("svg:linearGradient")
                .attr("id", function(d,i){return "grad_" + d.source.index + "_" + d.target.index + "_" + id;})
                .attr("x1", function(d){ return (getSide(d.source) <= getSide(d.target)) ? "0%" : "100%";})
                .attr("y1", function(d){ return (getHemisphere(d.source) <= getHemisphere(d.target)) ? "0%" : "100%";})
                .attr("x2", function(d){ return (getSide(d.source) >= getSide(d.target)) ? "0%":"100%";})
                .attr("y2", function(d){ return (getHemisphere(d.source) >= getHemisphere(d.target)) ? "0%":"100%";})
                .attr("spreadMethod", "pad");

            gradient.append("svg:stop")
                .attr("offset", "0%")
                .attr("stop-color", function(d){return colorByIndex.get(d.source.index);})
                .attr("stop-opacity", 1);


            gradient.append("svg:stop")
                .attr("offset", "100%")
                .attr("stop-color", function(d){return colorByIndex.get(d.target.index);})
                .attr("stop-opacity", 1);


             svg.selectAll("*").style("cursor","default");

        },


        transform : function(id,data,grupo){
          var paises = [];

          data.paises.forEach(function(d) {
              if(!grupo || d.grupo == grupo)
                paises.push(d);
          });

          var chord = d3.layout.chord()
              .padding(0.6)
              .sortSubgroups(d3.descending)
              .sortChords(d3.descending);

          var indexByName = d3.map(),
                nameByIndex = d3.map(),
                colorByIndex = d3.map(),
                color2ByIndex = d3.map(),
                imgByIndex = d3.map(),
                golsFeitosByIndex = d3.map(),
                partidaByIndex = d3.map(),
                dataByIndex = d3.map(),
                matrix = [],
                n = 0;

          paises.forEach(function(d) {
              if (!indexByName.has(d.nome)) {
                nameByIndex.set(n, d.nome);
                colorByIndex.set(n,d.cor1);
                color2ByIndex.set(n,d.cor2);
                imgByIndex.set(n,d.img);
                dataByIndex.set(n,d);
                indexByName.set(d.nome, n++);
              }
            });

          paises.forEach(function(d) {
            var source = indexByName.get(d.nome),
                row = matrix[source];
            if (!row) {
             row = matrix[source] = [];
             for (var i = -1; ++i < n;) row[i] = 0;
            }

            data.jogos.forEach(function(j) {
              if(j.time1 == d.nome){
                golsFeitosByIndex.set(indexByName.get(j.time1) + "_" + indexByName.get(j.time2),j.gols1);
                row[indexByName.get(j.time2)]++;

              }else if(j.time2 == d.nome){
                golsFeitosByIndex.set(indexByName.get(j.time2) + "_" + indexByName.get(j.time1),j.gols2);
                row[indexByName.get(j.time1)]++;
              }
            });
          });

          chord.matrix(matrix);

          var svg = d3.select("#"+id);

          svg.selectAll(".team")
             .data(chord.groups);

          var opacityFunc = function(i){return function(d){
            return dataByIndex.get(d.index).pontos() > i ? 0.3 : 0;};
          };

          for(var i = 0; i <= 9; i++){
            svg.selectAll('.points_'+i)
               .transition()
               .duration(750)
               .style("fill-opacity", opacityFunc(i));
          }


          svg.selectAll(".chord").data(chord.chords);



          svg.selectAll(".goals1")
                .attr("class", "goals goals1")
                .each(function(d) { d.angle = (d.source.startAngle + d.source.endAngle) / 2; })
                .text(function(d) {
                  return golsFeitosByIndex.get(d.source.index + "_" + d.target.index);
                });

          svg.selectAll(".goals2")
                .attr("class", "goals goals2")
                .each(function(d) { d.angle = (d.target.startAngle + d.target.endAngle) / 2; })
                .text(function(d) {
                  return golsFeitosByIndex.get(d.target.index + "_" + d.source.index);
                });



        }
  };

  return service;

}]);




function quarter(d){
  var angle = (d.endAngle % (Math.PI*2) + d.startAngle % (Math.PI*2))/2;

  if(angle < Math.PI/2)
    return 1;
  else if(angle < Math.PI)
    return 2;
  else if(angle < 3*Math.PI/2)
    return 3;
  else
    return 4;
}

function getHemisphere(d){
   return north(d) ? 1 : 2;
}

function getSide(d){
   return east(d) ? 1 : 2;
}

function sameHemisphere(d){
   return (north(d.source) == north(d.target));
}

function sameSide(d){
   return (east(d.source) == east(d.target));
}

function north(d){
  var q = quarter(d);
  return (q == 1) || (q == 4);
}

function south(d){
  var q = quarter(d);
  return (q == 2) || (q == 3);
}

function east(d){
  var q = quarter(d);
  return (q == 3) || (q == 4);
}

function west(d){
  var q = quarter(d);
  return (q == 1) || (q == 2);
}
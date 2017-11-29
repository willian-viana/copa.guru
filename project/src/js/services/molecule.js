module.factory('molecule',['$window', '$filter', function ($window, $filter){
  

  function tick(node,link) {
          return function(){
             link.selectAll("line")
                 .each(function(d) { 
                        d.h = Math.sqrt( Math.pow(d.source.y - d.target.y,2) +  Math.pow(d.source.x - d.target.x,2) ); 
                 })
                 .attr("x1", function(d) { return d.source.x; })
                 .attr("y1", function(d) { return d.source.y; })
                 .attr("x2", function(d) { return d.target.x; })
                 .attr("y2", function(d) { return d.target.y; });

             node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          };
  }


  var service = {
    render :  function (id, teams, $scope){

       var width = Math.min($window.innerWidth - 17, 960),
           height = 600;

       var svg = d3.select("#"+id)
           .attr("width", width)
           .attr("height", height);
       
       var size = $window.innerWidth > 800 ? 8 : 6;
       var edge = $window.innerWidth > 800 ? 16 : 8;

       teams[0].size = size;
       teams[1].size = size;
       teams[2].size = size;
       teams[3].size = size;
       teams[4].size = size;
       teams[5].size = size;
       teams[6].size = size;
       teams[7].size = size;
       teams[8].size = size;
       teams[9].size = size;
       teams[10].size = size;
       teams[11].size = size;
       teams[12].size = size;
       teams[13].size = size;
       teams[14].size = size;
       teams[15].size = size;
       teams[16].size = size * 2;
       teams[17].size = size * 2;
       teams[18].size = size * 2;
       teams[19].size = size * 2;
       teams[20].size = size * 2;
       teams[21].size = size * 2;
       teams[22].size = size * 2;
       teams[23].size = size * 2;
       teams[24].size = size * 3;
       teams[25].size = size * 3;
       teams[26].size = size * 3;
       teams[27].size = size * 3;
       teams[28].size = size * 4;
       teams[29].size = size * 4;
       teams[30].size = size * 5;
       teams[31].size = size * 2;
       teams[32].size = size * 2;
       teams[33].size = size * 3;
           
       
       var links = [
           {source: 0, target: 16},
           {source: 1, target: 16},
           {source: 2, target: 17},
           {source: 3, target: 17},
           {source: 4, target: 18},
           {source: 5, target: 18},
           {source: 6, target: 19},
           {source: 7, target: 19},
           {source: 8, target: 20},
           {source: 9, target: 20},
           {source: 10, target: 21},
           {source: 11, target: 21},
           {source: 12, target: 22},
           {source: 13, target: 22},
           {source: 14, target: 23},
           {source: 15, target: 23},

           {source: 16, target: 24},
           {source: 17, target: 24},
           {source: 18, target: 25},
           {source: 19, target: 25},
           {source: 20, target: 26},
           {source: 21, target: 26},
           {source: 22, target: 27},
           {source: 23, target: 27},


           {source: 24, target: 28},
           {source: 25, target: 28},
           {source: 26, target: 29},
           {source: 27, target: 29},


           {source: 28, target: 30},
           {source: 29, target: 30},
        /*
           {source: 24, target: 31},
           {source: 25, target: 31},
           {source: 26, target: 32},
           {source: 27, target: 32},
        */
           {source: 31, target: 33},
           {source: 32, target: 33}

         ];

         var tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0])
                  .html(function(d) {
                    return d.time ? "<strong>" + d.time + "</strong>" : "";
                  });

         svg.call(tip);         


         var radius = d3.scale.sqrt()
                   .range([0, 6]);

               
         var force = d3.layout.force()
           .size([width, height])
           .charge(-200)
           .linkDistance(function(d) { return radius(d.source.size) + radius(d.target.size) + edge; });

               

         var link = svg.selectAll(".link")
             .data(links)
           .enter().append("g")
             .attr("class", "link");

         link.append("line")
             .style("opacity", 0.3)
             .style("stroke", "#ffffff")
             .style("stroke-width", function(d){return teams[d.source].size/3;});

         var node = svg.selectAll(".node")
             .data(teams)
           .enter().append("g")
             .attr("class", "node");

          force
             .nodes(teams)
             .links(links)
             .on("tick", tick(node,link))
             .start();


         node.call(force.drag);

         node.append("circle")
             .attr("r", function(d) { return d.size; })
             .style("opacity", 0.5) 
             .style("fill", function(d) { return "#cccccc"; })
             .style("stroke", "rgba(255,0,0,0.5)")
             .style("stroke-width", function(d){
              return $scope.selected && $scope.selected.data && d.jogo && d.jogo.jogo == $scope.selected.data.jogo ? 4 : 0; 
            });
        
         node.append("svg:image")
              .attr("x", function(d) { return -d.size; })
              .attr("y", function(d) { return -d.size; })
              .attr("width", function(d) { return d.size*2; })
              .attr("height", function(d) { return d.size*2; })
              .style("opacity", 0.7)
              .attr("xlink:href", function(d){ return "/img/96/" +  (d.img ? d.img : "default.png");});

         node.append("text").attr("class", "shadow")
             .attr("dy", function(d){return d.size + 16;}) 
             .attr("fill", "white")
             .attr("text-anchor", "middle")
             .text(function(d) { 
              return d.gols; 
            });   

         node.on("mouseover", tip.show)
         .on("mouseout", tip.hide)
         .on("click",function(d){
            $scope.selected = { type : 'match', data : d.jogo };
            safeDigest($scope);
            svg.selectAll("circle").style("stroke-width", 0);
            d3.select(this).select("circle").style("stroke-width", 4);
          })
          .on("blur",function(d){
            $scope.selected = null;
            safeDigest($scope);
          });  

    },

     transform :  function (id, teams, $scope){

      d3.select("#"+id).selectAll('g').remove();
      d3.select("#"+id).selectAll('line').remove();

      this.render(id, teams, $scope);
        
     }
  };

  return service;

}]);


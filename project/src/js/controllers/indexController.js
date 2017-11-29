
module.controller('indexController', ['$scope','$http','$filter','chord','molecule','$window', function($scope,$http,$filter,chord, molecule, $window){

//$('#fase1').on('mouseover', function(){
//    $('#submenu').toggle();
//});

 // $http.get('https://docs.google.com/uc?export=download&id=0B8ehuP2OymivOFFMVnpveW5oNlk').success(function(data){
$http.get('https://dl.dropboxusercontent.com/s/14pnkenarq1yvt7/data.json?dl=1').success(function(data){

    $scope.ie = $window.ie;
    $scope.dropdown = false;

    $scope.hideDropdown = function(){
      $scope.dropdown = false;
    };

    $scope.toggleDropdown = function() {
      $scope.dropdown = !$scope.dropdown;
    };

    data.jogos.forEach(function(d){
      d.pontos = function(time){
        if(parseInt(d.gols1) == parseInt(d.gols2))
            return 1;
        if((d.time1 == time && parseInt(d.gols1) > parseInt(d.gols2)) || (d.time2 == time && parseInt(d.gols2) > parseInt(d.gols1) ))
            return 3;

        return 0;
      };

      d.golsPro = function(time){

        if(d.time1 == time)
            return d.gols1 ? parseInt(d.gols1) : 0;

        if(d.time2 == time)
            return d.gols2 ? parseInt(d.gols2) : 0;

        return 0;
      };

      d.golsContra = function(time){

        if(d.time1 == time)
            return d.gols2 ? parseInt(d.gols2) : 0;

        if(d.time2 == time)
            return d.gols1 ? parseInt(d.gols1) : 0;

        return 0;
      };

      d.participou = function(nome){return d.time1 == nome || d.time2 == nome;};

      d.finalizado = function(){return d.gols1 !== null && d.gols2 !== null;};

      d.desabilitado = d.finalizado();

      d.quemGanhou = function(){
        if(!d.gols1 || !d.gols2 || (d.gols1 == d.gols2 && (!d.penalty1 || !d.penalty2 || d.penalty1 == d.penalty2)))
          return {nome : "???" };

        if(parseInt(d.gols1) > parseInt(d.gols2))
            return d.time1;

        if(d.penalty1 && d.penalty2 && (parseInt(d.penalty1) > parseInt(d.penalty2)))
            return d.time1;

        return d.time2;
      };

      d.quemPerdeu = function(){
        if(!d.gols1 || !d.gols2 || (d.gols1 == d.gols2 && (!d.penalty1 || !d.penalty2 || d.penalty1 == d.penalty2)))
          return { nome : "???" };

        if(parseInt(d.gols1) > parseInt(d.gols2))
            return d.time2;

        if(d.penalty1 && d.penalty2 && (parseInt(d.penalty1) > parseInt(d.penalty2)))
            return d.time2;

        return d.time1;
      };

    });

    data.paises.forEach(function(d){
      d.j = function(){
        var j = 0;
        data.jogos.forEach(function(p){
            if(p.participou(d.nome) && p.finalizado())
                j++;
        });
        return j;
      };

      d.pontos = function(){
        var pontos = 0;
        data.jogos.forEach(function(p){
            if(p.participou(d.nome) && p.finalizado())
                pontos += p.pontos(d.nome);
        });
        return pontos;

      };

      d.v = function(){
        var v = 0;
        data.jogos.forEach(function(p){
            if(p.participou(d.nome) && p.finalizado() && p.pontos(d.nome) == 3)
                v++;
        });
        return v;
      };

      d.d = function(){
        var de = 0;
        data.jogos.forEach(function(p){
            if(p.participou(d.nome) && p.finalizado() && p.pontos(d.nome) === 0)
                de++;
        });
        return de;
      };

      d.e = function(){
        var e = 0;
        data.jogos.forEach(function(p){
            if(p.participou(d.nome) && p.finalizado() && p.pontos(d.nome) == 1)
                e++;
        });
        return e;
      };

      d.gp = function(){
        var gp = 0;
        data.jogos.forEach(function(p){
            if(p.participou(d.nome) && p.finalizado())
                gp += p.golsPro(d.nome);
        });
        return gp;
      };

      d.gc = function(){
        var gc = 0;
        data.jogos.forEach(function(p){
            if(p.participou(d.nome) && p.finalizado())
                gc += p.golsContra(d.nome);
        });
        return gc;
      };


      d.sg = function(){
        return d.gp() - d.gc();
      };

      d.pos = function(){
        var pos = 0;
        var groups = $filter('filter')(data.paises,{grupo : d.grupo});

        var orderBy = ['pontos()','sg()','gp()'];

        $filter('orderBy')(groups,orderBy,true).forEach(function(p,i){
            if(d.nome == p.nome)
                pos = i + 1;
        });

        return pos;
      };

    });

    $scope.data = data;
    $scope.teams = data.paises;
    $scope.matches = data.jogos;
    $scope.stadiums = data.estadios;
    $scope.cities = data.cidades;

    molecule.render("svg_fase_2",calc2ndStageTeams(),$scope);

    chord.render("svg_grupo_A",data,"A",$scope);
    chord.render("svg_grupo_B",data,"B",$scope);
    chord.render("svg_grupo_C",data,"C",$scope);
    chord.render("svg_grupo_D",data,"D",$scope);
    chord.render("svg_grupo_E",data,"E",$scope);
    chord.render("svg_grupo_F",data,"F",$scope);
    chord.render("svg_grupo_G",data,"G",$scope);
    chord.render("svg_grupo_H",data,"H",$scope);
    chord.render("svg_all",data,"",$scope);


    $scope.sel = function(t){
        $scope.selected = {data : t, type : 'team'};
    };

    $scope.unsel = function(){
        $scope.selected = null;
    };


    $scope.toRgba =  function (hex,opacity){
        hex = hex.replace('#','');
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);

        result = 'rgba('+r+','+g+','+b+','+opacity+')';
        return result;
    };

    $scope.change = function(g){
      if(g)
        chord.transform("svg_grupo_" + g, $scope.data, g);

      chord.transform("svg_all", $scope.data, "");

      molecule.transform("svg_fase_2",calc2ndStageTeams(),$scope);
    };



    function calc2ndStageTeams(){

        var size = 8;

        function getTeam(group,pos){
          return $filter('orderBy')($filter('filter')(data.paises,{grupo : group}), 'pos()')[pos-1];
         }

         var getMatch = $scope.getMatch = function(num){
          return $filter('filter')(data.jogos,{fase2 : true, jogo : num})[0];
         };

          var a1 = getTeam('A',1);
          var b2 = getTeam('B',2);
          var c1 = getTeam('C',1);
          var d2 = getTeam('D',2);
          var e1 = getTeam('E',1);
          var f2 = getTeam('F',2);
          var g1 = getTeam('G',1);
          var h2 = getTeam('H',2);
          var b1 = getTeam('B',1);
          var a2 = getTeam('A',2);
          var d1 = getTeam('D',1);
          var c2 = getTeam('C',2);
          var f1 = getTeam('F',1);
          var e2 = getTeam('E',2);
          var h1 = getTeam('H',1);
          var g2 = getTeam('G',2);

          var m1 = getMatch(1);
          var m2 = getMatch(2);
          var m3 = getMatch(3);
          var m4 = getMatch(4);
          var m5 = getMatch(5);
          var m6 = getMatch(6);
          var m7 = getMatch(7);
          var m8 = getMatch(8);
          var m9 = getMatch(9);
          var m10 = getMatch(10);
          var m11 = getMatch(11);
          var m12 = getMatch(12);
          var m13 = getMatch(13);
          var m14 = getMatch(14);
          var m15 = getMatch(15);
          var m16 = getMatch(16);

          m1.time1 =  a1;
          m1.time2 =  b2;
          m2.time1 =  c1;
          m2.time2 =  d2;
          m3.time1 =  e1;
          m3.time2 =  f2;
          m4.time1 =  g1;
          m4.time2 =  h2;
          m5.time1 =  b1;
          m5.time2 =  a2;
          m6.time1 =  d1;
          m6.time2 =  c2;
          m7.time1 =  f1;
          m7.time2 =  e2;
          m8.time1 =  h1;
          m8.time2 =  g2;

          var v1 = m1.quemGanhou();
          var v2 = m2.quemGanhou();
          var v3 = m3.quemGanhou();
          var v4 = m4.quemGanhou();
          var v5 = m5.quemGanhou();
          var v6 = m6.quemGanhou();
          var v7 = m7.quemGanhou();
          var v8 = m8.quemGanhou();

          m9.time1 =  v1;
          m9.time2 =  v2;
          m10.time1 = v3;
          m10.time2 = v4;
          m11.time1 = v5;
          m11.time2 = v6;
          m12.time1 = v7;
          m12.time2 = v8;

          var v9 = m9.quemGanhou();
          var v10 = m10.quemGanhou();
          var v11 = m11.quemGanhou();
          var v12 = m12.quemGanhou();

          m13.time1 = v9;
          m13.time2 = v10;
          m14.time1 = v11;
          m14.time2 = v12;

          var v13 = m13.quemGanhou();
          var v14 = m14.quemGanhou();
          var p13 =m13.quemPerdeu();
          var p14 =m14.quemPerdeu();

          m15.time1 = p13;
          m15.time2 = p14;
          m16.time1 = v13;
          m16.time2 = v14;

          var v15 = m15.quemGanhou();
          var v16 = m16.quemGanhou();


      return [
           {time: a1.nome,  gols: m1.gols1,  penalty: m1.penalty1, img: a1.img, cor: a1.cor1},
           {time: b2.nome,  gols: m1.gols2,  penalty: m1.penalty2, img: b2.img, cor: b2.cor1},
           {time: c1.nome,  gols: m2.gols1,  penalty: m2.penalty1, img: c1.img, cor: c1.cor1},
           {time: d2.nome,  gols: m2.gols2,  penalty: m2.penalty2, img: d2.img, cor: d2.cor1},
           {time: e1.nome,  gols: m3.gols1,  penalty: m3.penalty1, img: e1.img, cor: e1.cor1},
           {time: f2.nome,  gols: m3.gols2,  penalty: m3.penalty2, img: f2.img, cor: f2.cor1},
           {time: g1.nome,  gols: m4.gols1,  penalty: m4.penalty1, img: g1.img, cor: g1.cor1},
           {time: h2.nome,  gols: m4.gols2,  penalty: m4.penalty2, img: h2.img, cor: h2.cor1},
           {time: b1.nome,  gols: m5.gols1,  penalty: m5.penalty1, img: b1.img, cor: b1.cor1},
           {time: a2.nome,  gols: m5.gols2,  penalty: m5.penalty2, img: a2.img, cor: a2.cor1},
           {time: d1.nome,  gols: m6.gols1,  penalty: m6.penalty1, img: d1.img, cor: d1.cor1},
           {time: c2.nome,  gols: m6.gols2,  penalty: m6.penalty2, img: c2.img, cor: c2.cor1},
           {time: f1.nome,  gols: m7.gols1,  penalty: m7.penalty1, img: f1.img, cor: f1.cor1},
           {time: e2.nome,  gols: m7.gols2,  penalty: m7.penalty2, img: e2.img, cor: e2.cor1},
           {time: h1.nome,  gols: m8.gols1,  penalty: m8.penalty1, img: h1.img, cor: h1.cor1},
           {time: g2.nome,  gols: m8.gols2,  penalty: m8.penalty2, img: g2.img, cor: g2.cor1},

           {time: v1.nome,  gols: m9.gols1,  penalty: m9.penalty1,  img: v1.img,  cor: v1.cor1, jogo : m1},
           {time: v2.nome,  gols: m9.gols2,  penalty: m9.penalty2,  img: v2.img,  cor: v2.cor1, jogo : m2},
           {time: v3.nome,  gols: m10.gols1, penalty: m10.penalty1, img: v3.img,  cor: v3.cor1, jogo : m3},
           {time: v4.nome,  gols: m10.gols2, penalty: m10.penalty2, img: v4.img,  cor: v4.cor1, jogo : m4},
           {time: v5.nome,  gols: m11.gols1, penalty: m11.penalty1, img: v5.img,  cor: v5.cor1, jogo : m5},
           {time: v6.nome,  gols: m11.gols2, penalty: m11.penalty2, img: v6.img,  cor: v6.cor1, jogo : m6},
           {time: v7.nome,  gols: m12.gols1, penalty: m12.penalty1, img: v7.img,  cor: v7.cor1, jogo : m7},
           {time: v8.nome,  gols: m12.gols2, penalty: m12.penalty2, img: v8.img,  cor: v8.cor1, jogo : m8},

           {time: v9.nome,  gols: m13.gols1, penalty: m13.penalty1, img: v9.img,  cor: v9.cor1, jogo : m9},
           {time: v10.nome, gols: m13.gols2, penalty: m13.penalty2, img: v10.img, cor: v10.cor1, jogo : m10},
           {time: v11.nome, gols: m14.gols1, penalty: m14.penalty1, img: v11.img, cor: v11.cor1, jogo : m11},
           {time: v12.nome, gols: m14.gols2, penalty: m14.penalty2, img: v12.img, cor: v12.cor1, jogo : m12},
           {time: v13.nome, gols: m16.gols1, penalty: m16.penalty1, img: v13.img, cor: v13.cor1, jogo : m13},
           {time: v14.nome, gols: m16.gols2, penalty: m16.penalty2, img: v14.img, cor: v14.cor1, jogo : m14},

           {time: v16.nome,  img: v16.img,  cor: v16.cor1, jogo : m16},

           {time: p13.nome, gols: m15.gols1, penalty: m15.penalty1, img: p13.img, cor: p13.cor1},
           {time: p14.nome, gols: m15.gols2, penalty: m15.penalty2, img: p14.img, cor: p14.cor1},

           {time: v15.nome,  img: v15.img,  cor: v15.cor1, jogo : m15}
         ];
    }



  });

}]);




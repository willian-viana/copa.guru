

var isApp = false;


var module = angular.module('copaGuru', ['ui.bootstrap','angularSpinner', 'smoothScroll']);



function safeDigest(scope) {
    if(!scope.$$phase && !scope.$root.$$phase)
      scope.$digest();
}


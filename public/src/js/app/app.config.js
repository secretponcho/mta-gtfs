angular.module('GTFSApp', ['ngRoute'])
  .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider
      .when('/', {
        template: "<h1>HI</h1>"
      });
  }]);
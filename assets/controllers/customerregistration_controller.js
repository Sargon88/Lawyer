// Define the `phonecatApp` module
var regApp = angular.module('regApp', []);

// Define the `PhoneListController` controller on the `phonecatApp` module
regApp.controller('RegistrationController', ['$scope', '$http', function ($scope, $http) {

  $scope.user = {
  	"name": "paolo",
  	"surname": "rossi",
    "age": 49,
  	"gender": "m",
  }

  $scope.customers = [];

  $scope.senddata = function(){

  	console.log(angular.toJson($scope.user, true));

    var data = [$scope.user];

  	$http.post(
  		'/submit', 
  		angular.toJson(data, false),
  		{
        headers: {
        	'Content-type': 'application/json',
        	'Accept': 'application/pdf'
    	  }
      }).then(
  		function(data, status, headers, config){ 
  			console.log(data);
  			var blob = new Blob([data.data], {type: "application/pdf"});
		    var objectUrl = URL.createObjectURL(blob);
		    window.open(objectUrl);

        $scope.loadcustomers();
	    }, 
  		function(data, status, headers, config){ console.log("NOK", data);
  	});
  };

  $scope.loadcustomers = function(){
    $http.get('/customers')
    .then(
      function(data, status, headers, config){
        $scope.customers = data.data;
      },
      function(data, status, headers, config){console.log("LOAD NOK", data)}
    )
  };




  setTimeout(function(){
    console.log("LOADING CUSTOMERS");
    $scope.loadcustomers();
  }, 1000);
}]);

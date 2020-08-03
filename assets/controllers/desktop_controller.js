// Define the `phonecatApp` module
var desktopApp = angular.module('desktopApp', []);

// Define the `DesktopController` controller on the `desktopApp` module
desktopApp.controller('DesktopController', ['$scope', '$http', function ($scope, $http) {
	$scope.test = "Hello World";
}]);

// Define the `LoadModalController` controller on the `desktopApp` module
desktopApp.controller('LoadModalController', ['$scope', '$http', function ($scope, $http) {
	$scope.test = "Hello World2";
	$scope.customers = [];

	$scope.loadcustomers = function(){
		$http.get('/customers')
		.then(
			function(data, status, headers, config){
				var d = data.data;
				$.each(d, function(el){
					el.checked = false;
				});
				$scope.customers = d;
			},
			function(data, status, headers, config){console.log("LOAD NOK", data)}
		)
	}();

	$scope.load = function(){
		console.log("load", $scope.customers);
	}

}]);





desktopApp.service('desktopService', function(){

	var directoryList = [], getDirectoryList, addDirectory;

	getDirectories = function(){
		return directoryList;
	};

	addDirectory = function(directory){

		var found = false;
		for(var i=0; i<directoryList.length; i++){
			var d = directoryList[i];
			if(d.id == directory.id){
				found = true;
				break;
			}
		}

		if(!found){
			directoryList.push(directory);
		}
	}

	return {
		getDirectoryList: getDirectoryList,
		addDirectory: addDirectory
	}
});
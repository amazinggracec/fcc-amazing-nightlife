var app = angular.module('nightlife-app', []);

app.controller("locationCtrl", function($scope, $http, $location, $window){
	$scope.check_authentication = function(){
		$scope.loggedin = false;

		$http.get('authentication').then(function(response){
			$scope.loading = false;
			if (response.data.authenticated == true){
				$scope.curr_location = (response.data.curr_location == "undefined"? "": response.data.curr_location);
				$scope.search_bars();
				$scope.loggedin = true;
			}
		});
	};
	
	$scope.search_bars = function(){
		$scope.loading = true;
		if ($scope.curr_location == ""){
			$scope.curr_location = undefined;
		}
		$http.get('location/' + $scope.curr_location).then(function(response){
			$scope.businesses = response.data;
			console.log(response.data);
			$scope.businesses.forEach(function(business, key){
				$http.get('business/' + business.id + '/init').then(function(response){
					$scope.loading = false;
					$scope.businesses[key].going = response.data.num_going;
					$('.grid').masonry('destroy')
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.grid-item',
						fitWidth: true,
						gutter: 10 ,
						isInitLayout: false,
						OriginTop: true
					});
					$('.grid').masonry();
				});

			});
		});			
		
	};
	
	$scope.toggle_going = function(index, business_id){
		$scope.businesses[0].going = 0;
		$http.get('business/' + business_id + '/toggle').then(function(response){
			if (response.data.status == true){
				$scope.businesses[index].going = response.data.num_going;
			}
			else{
				$window.location.href = $location.absUrl() + "auth/twitter";
			}
		});
	};
});
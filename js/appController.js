function appController ($scope) {
    $scope.files = [];

    // input file 
    $scope.$watch ('file', function (newVal, oldVal) {
        if (newVal) {
            console.log(newVal);

            Array.prototype.push.apply($scope.files,newVal);

            angular.forEach ($scope.files, function (f) {
                f.src = URL.createObjectURL(f); 
            });
        }
    });

}

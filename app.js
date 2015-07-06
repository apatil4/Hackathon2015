$(function() {
  $("#catalog").accordion();
});
var App = angular.module('drag-and-drop', ['ngDragDrop']);

App.factory("XLSXReaderService", ['$q', '$rootScope',
    function($q, $rootScope) {
        var service = function(data) {
            angular.extend(this, data);
        };

        service.readFile = function(file, showPreview) {
            var deferred = $q.defer();

            XLSXReader(file, true, true, function(data){
                $rootScope.$apply(function() {
                    deferred.resolve(data);
                });
            });

            return deferred.promise;
        };

        return service;
    }
]);


App.factory('sharedProperties', function(){

      shared = {}
      shared.showProducts = false;
      shared.list = [];
      shared.listCount = 0;
      return shared;
});


App.controller("BrandController", function($scope, sharedProperties, XLSXReaderService) {

    $scope.shared = sharedProperties;
    $scope.shared.textGroup = "";

    $scope.fileChanged = function(files) {

        $scope.excelFile = files[0];
        XLSXReaderService.readFile($scope.excelFile, $scope.showPreview).then(function(xlsxData) {
            $scope.columns = xlsxData.sheets["Full data model dump without assets"];
            $scope.brand = $scope.columns[0].Brand;
        });
    };

    $scope.update = function(brand){
        $scope.shared.list = $scope.getList(brand.Brand);
        $scope.shared.showProducts = true;
    };

    $scope.getList = function(brand) {
        var tempList = [];
        for(var i=0; i < $scope.columns.length ;i++) {
            if($scope.columns[i].Brand === brand) {
                tempList.push(($scope.columns[i]["Internal Product Name"]));
            }
        }
        return tempList;
    };

});


App.controller("ProductController", function($scope, sharedProperties) {

    $scope.shared = sharedProperties;
});


App.filter('unique', function () {

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
});

App.directive("addDiv", function($compile){

    return function(scope , element, attrs){

        var listCount = 0;
        element.bind("click", function(){
                  listCount++;
                  var list = "list" + listCount.toString();
                  scope.shared[list] = []
                  angular.element(document.getElementById("group-container")).append($compile('<h1 class="ui-widget-header">' + scope.shared.textGroup + '</h1><div class="ui-widget-content"><ol data-drop="true" ng-model="shared.'+ list+'" jqyoui-droppable="{multiple:true}"><li ng-repeat="item in shared.' + list + ' track by $index" ng-show="item" data-drag="true" data-jqyoui-options="{revert: \'invalid\', helper: \'clone\'}" ng-model="shared.' + list + '" jqyoui-draggable="{index: {{$index}},animate:true}">{{item}}</li></ol></div>')(scope));
        });
    };
});
/*global angular */
'use strict';

var app = angular.module('app', ['file-model'])

.filter('trustUrl', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl (url);
    };
})
.directive ('filePreview', function () {
    return {
        restrict: 'EA',
        scope:{
            file: '=ngModel'
        },
        template:
             '<video style="width:640px;height:360px;" controls>' + 
               '<source src="{{file.src | trustUrl}}"/>' +
             '</video>',
        transclude: true,
        link: function (scope, elem, attrs) {
            var video = angular.element(elem)[0].children[0];

            scope.file.play = function () {
                video.play ();
            };
            scope.file.pause = function () {
                video.pause ();
            };
            scope.file.markIn = function () {
                scope.file.inTs = video.currentTime;
            };
            scope.file.markOut = function () {
                scope.file.outTs = video.currentTime;
            };
            scope.file.toStart = function () {
                video.startTime = 0;
            };
            scope.file.toEnd = function () {
                video.play ();
            };
            scope.file.cancel = function () {
                
            };
        }
    }; 
})

.controller('appCtrl', appController);

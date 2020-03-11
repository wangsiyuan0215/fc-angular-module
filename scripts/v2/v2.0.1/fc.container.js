/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:43 PM
 * @Description: fc.container
 */
(function(_) {
    var template =
        '<section class="fc-container"><div class="fc-container__inner" ng-transclude></div><div ng-if="!!showFooterImage" class="fc-container__footer"><img ng-src="{{imageSrc}}" alt=""></div></section>';
    _.angular.module('fc').directive('fcContainer', [
        function() {
            return {
                scope: {
                    imageSrc: '@?'
                },
                replace: true,
                restrict: 'E',
                template: template,
                transclude: true,
                link: function(scope) {
                    scope.showFooterImage = 'undefined' !== typeof scope.imageSrc;
                }
            };
        }
    ]);
})(window);

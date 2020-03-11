/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 2:32 PM
 * @Description: fc.demo
 */

(function(_) {

    var template =
        '<li class="fc-item fc-btn--like" ng-click="onClick()"><div class="fc-item__container" ng-transclude></div><div ng-if="arrow" class="fc-item__arrow"><svg class="fc-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M287.232 951.13671111c-21.39022222-21.39022222-21.39022222-55.86488889 0-77.25511111l361.81333333-361.81333333-361.81333333-361.81333334c-21.39022222-21.39022222-21.39022222-55.97866667 0-77.25511111 21.39022222-21.39022222 55.86488889-21.39022222 77.25511111 0l400.49777777 400.49777778c21.39022222 21.39022222 21.39022222 55.97866667 0 77.25511111l-400.49777777 400.49777778c-10.69511111 10.69511111-24.68977778 15.92888889-38.68444445 15.92888889C311.92177778 967.0656 297.92711111 961.83182222 287.232 951.13671111z"></path></svg></div></li>';
    _.angular.module('fc').directive('fcItem', [
        function() {
            return {
                scope: {
                    arrow: '=?',
                    onClick: '&?'
                },
                replace: true,
                restrict: 'E',
                template: template,
                transclude: true,
                link: function(scope) {
                    scope.arrow = scope.arrow !== false;
                }
            };
        }
    ]);
    
})(window);

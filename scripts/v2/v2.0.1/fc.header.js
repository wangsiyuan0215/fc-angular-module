/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:41 PM
 * @Description: fc.header
 */
(function(_) {
    var leftArrowSVG =
        '<svg class="fc-icon" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M384 349.866667l166.4 166.4L384 682.666667a41.258667 41.258667 0 0 0 0 59.733333 41.258667 41.258667 0 0 0 59.733333 0l196.266667-196.266667a41.258667 41.258667 0 0 0 0-59.733333l-196.266667-196.266667A42.24 42.24 0 1 0 384 349.866667z"></path></svg>';
    var template = _.FC.template(
        '<div class="fc-header" ng-cloak ng-if="!!show"><div class="fc-header__left" ng-if="back" ng-click="goBack()"><span class="fc-header__icon">%s</span></div><div class="fc-header__title" ng-bind="title">Loading...</div></div>',
        leftArrowSVG
    );
    _.angular.module('fc').directive('fcHeader', [
        '$route',
        '$timeout',
        '$location',
        function($route, $timeout, $location) {
            var __getRouteConfig = function() {
                return $route.routes[$location.path()] || {};
            };

            return {
                scope: false,
                replace: true,
                restrict: 'E',
                link: function(scope) {
                    var timer = null;
                    scope.back = true;
                    scope.title = 'Loading...';
                    scope.cancel = false;
                    scope.showHeader = true;
                    scope.onBack = _.FC.noop;
                    scope.onCancel = _.FC.noop;

                    scope.$on('$locationChangeStart', function() {
                        timer && $timeout.cancel(timer);
                        timer = $timeout(function() {
                            var _currentRouteConfig = __getRouteConfig();
                            if (!_currentRouteConfig) return (scope.showHeader = false);

                            scope.back =
                                'undefined' === typeof _currentRouteConfig.back
                                    ? true
                                    : !!_currentRouteConfig.back;
                            scope.title = _currentRouteConfig.name || 'Loading...';
                            scope.cancel = 'function' === typeof _currentRouteConfig.onCancel;
                            scope.onBack = _currentRouteConfig.onBack || _.FC.noop;
                            scope.onCancel = _currentRouteConfig.onCancel || _.FC.noop;
                            scope.show =
                                'undefined' === typeof _currentRouteConfig.show
                                    ? true
                                    : _currentRouteConfig.show;

                            window.document.title = scope.title;
                        }, 0);
                    });
                    scope.goBack = function() {
                        if (scope.cancel) return scope.onCancel();

                        scope.onBack();
                        window.history.back();
                    };
                },
                template: template
            };
        }
    ]);
})(window);

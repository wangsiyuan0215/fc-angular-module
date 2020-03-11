/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:45 PM
 * @Description: fc.loading
 */
(function(_) {

    _.angular
        .module('fc')
        .constant('$fcLoadingConfig', {
            watches: {
                FC_LOADING: 'fcLoading'
            },
            subscriptions: {
                show: 'fc.loading.show',
                hide: 'fc.loading.hide'
            },
            elements: {
                DIV: 'div',
                SPAN: 'span'
            },
            positions: {
                STATIC: 'static',
                RELATIVE: 'relative'
            },
            classNames: {
                container: 'fc-loading--container',
                box: 'fc-loading--box',
                item: 'fc-loading--item'
            }
        })
        .service(
            '$fc.loading',
            ['$rootScope', '$fcLoadingConfig'].concat(function($rootScope, $config) {
                this.show = function() {
                    $rootScope.$broadcast($config.subscriptions.show, true);
                };
                this.hide = function() {
                    $rootScope.$broadcast($config.subscriptions.hide, true);
                };
            })
        )
        .directive(
            'fcLoading',
            ['$fcLoadingConfig'].concat(function($config) {
                var _scope = {};

                function __createLoadingDom() {
                    var $loadingContainer = document.createElement($config.elements.DIV),
                        $loadingBox = document.createElement($config.elements.DIV),
                        $span = document.createElement($config.elements.SPAN);

                    $loadingContainer.className = $config.classNames.container;
                    $loadingBox.className = $config.classNames.box;
                    $span.className = $config.classNames.item;

                    $loadingBox.appendChild($span);
                    $loadingBox.appendChild($span.cloneNode());
                    $loadingContainer.appendChild($loadingBox);

                    return $loadingContainer;
                }

                function __appendLoadingDomTo(parentElement, loadingDom) {
                    var _style = window.getComputedStyle(parentElement);

                    if (_style.position === $config.positions.STATIC) {
                        parentElement.style.position = $config.positions.RELATIVE;
                    }
                    parentElement.appendChild(loadingDom);

                    return _style;
                }

                _scope[$config.watches.FC_LOADING] = '=';

                return {
                    restrict: 'A',
                    scope: _scope,
                    link: function(scope, tElement) {
                        var currentElement = tElement[0],
                            $loading = __createLoadingDom(),
                            originStyle = __appendLoadingDomTo(currentElement, $loading);

                        scope.$watch($config.watches.FC_LOADING, function(newValue) {
                            if (newValue) {
                                __appendLoadingDomTo(currentElement, $loading);
                            } else {
                                currentElement.style = originStyle;
                                currentElement.removeChild($loading);
                            }
                        });
                    }
                };
            })
        )
        .directive(
            'fcLoading',
            ['$fcLoadingConfig'].concat(function($config) {
                return {
                    restrict: 'E',
                    replace: true,
                    template: '<div class="fc-loading" ng-show="loading" fc-loading="true"></div>',
                    link: function(scope) {
                        scope.$on($config.subscriptions.show, function() {
                            scope.loading = true;
                        });
                        scope.$on($config.subscriptions.hide, function() {
                            scope.loading = false;
                        });
                    }
                };
            })
        );
    
})(window);

/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:51 PM
 * @Description: fc.checkbox
 */
(function(_) {
    var template =
        '<div class="fc-checkbox" ng-class="{ \'checked\': checked }" ng-click="onClick4changing()"><div class="fc-checkbox__indicator"><svg class="fc-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M913.017 237.02c-25.311-25.312-66.349-25.312-91.66 0l-412.475 412.474-206.237-206.237c-25.312-25.312-66.35-25.312-91.661 0s-25.312 66.35 0 91.66l252.067 252.067c0.729 0.73 1.439 1.402 2.134 2.029 25.434 23.257 64.913 22.585 89.527-2.029l458.303-458.303c25.313-25.312 25.313-66.35 0.001-91.661z"></path></svg></div><div class="fc-checkbox__content" ng-transclude></div></div>';
    _.angular.module('fc').directive('fcCheckbox', [
        function() {
            return {
                scope: {
                    id: '@?',
                    checked: '=',
                    onChange: '&?'
                },
                replace: true,
                restrict: 'E',
                template: template,
                transclude: true,
                link: function(scope) {
                    scope.onClick4changing = function() {
                        return (
                            typeof scope.onChange === 'function' &&
                            scope.onChange({ id: scope.id, value: !scope.checked })
                        );
                    };
                }
            };
        }
    ]);
})(window);

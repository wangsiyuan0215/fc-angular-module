/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:40 PM
 * @Description: fc.icon
 */
(function(_) {
    _.angular.module('fc').directive('fcIcon', [
        function() {
            return {
                scope: {
                    name: '@'
                },
                replace: true,
                restrict: 'E',
                template:
                    '<svg class="fc-icon" aria-hidden="true"><use ng-attr-xlink:href="{{iconName}}" xlink:href=""></use></svg>',
                link: function(scope) {
                    scope.iconName = '#icon-' + scope.name;
                }
            };
        }
    ]);
})(window);

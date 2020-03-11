/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:32 PM
 * @Description: fc.toast
 */
(function(_) {
    _.angular
        .module('fc')
        .constant('$fcToastConfig', {
            delayDuration: 0,
            types: {
                ERROR: 'error',
                INFO: 'info',
                SUCCESS: 'success'
            },
            subscriptions: {
                OPEN: 'fc.toast.open',
                CLOSE: 'fc.toast.close'
            },
            classNames: {
                container: 'fc-toast',
                active: 'fc-toast__active',
                types: {
                    info: 'fc-toast__info',
                    error: 'fc-toast__error',
                    success: 'fc-toast__success'
                },
                box: 'fc-toast--box',
                content: 'fc-toast--content'
            }
        })
        .factory(
            '$fc.toast',
            ['$rootScope', '$timeout', '$fcToastConfig', '$fc'].concat(function(
                $rootScope,
                $timeout,
                $config,
                $fc
            ) {
                var __timer = null,
                    __duration = $fc.toast.__getDuration();

                function __trigger(type, message, duration) {
                    __timer && $timeout.cancel(__timer);
                    $timeout(function() {
                        $rootScope.$broadcast($config.subscriptions.OPEN, {
                            type: type || $config.types.ERROR,
                            message: message || '',
                            duration: duration || __duration
                        });
                    }, $config.delayDuration);
                }

                function __abort() {
                    __timer
                        ? $timeout.cancel(__timer)
                        : $rootScope.$broadcast($config.subscriptions.CLOSE, true);
                }

                return {
                    info: function(message, duration) {
                        return __trigger($config.types.INFO, message, duration || __duration);
                    },
                    abort: __abort,
                    error: function(message, duration) {
                        return __trigger($config.types.ERROR, message, duration || __duration);
                    },
                    types: $config.types,
                    success: function(message, duration) {
                        return __trigger($config.types.SUCCESS, message, duration || __duration);
                    }
                };
            })
        )
        .directive(
            'fcToast',
            ['$rootScope', '$timeout', '$fcToastConfig'].concat(function(
                $rootScope,
                $timeout,
                $config
            ) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {},
                    link: function(scope) {
                        var timer = null;
                        scope.$on(
                            $config.subscriptions.OPEN,
                            /**
                             * @param $event
                             * @param data {{ type: string, message: string, duration: number }}
                             */
                            function($event, data) {
                                if (data) {
                                    scope.visible = true;
                                    scope.message = data.message || '';
                                    scope.type = data.type || $config.types.ERROR;
                                    timer && $timeout.cancel(timer);
                                    timer = $timeout(function() {
                                        scope.visible = false;
                                    }, data.duration);
                                }
                            }
                        );
                        scope.$on($config.subscriptions.CLOSE, function($event, data) {
                            if (data) {
                                timer && $timeout.cancel(timer);
                                scope.visible = false;
                            }
                        });
                    },
                    template: _.FC.template(
                        "<div class=\"%s\" ng-class=\"{ '%s': visible, '%s': type === '%s', '%s': type === '%s', '%s': type === '%s' }\"><div class=\"%s\"><div class=\"%s\">{{message}}</div></div></div>",
                        $config.classNames.container,
                        $config.classNames.active,
                        $config.classNames.types.success,
                        $config.types.SUCCESS,
                        $config.classNames.types.error,
                        $config.types.ERROR,
                        $config.classNames.types.info,
                        $config.types.INFO,
                        $config.classNames.box,
                        $config.classNames.content
                    )
                };
            })
        );
})(window);

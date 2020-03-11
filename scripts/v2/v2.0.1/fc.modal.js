/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:32 PM
 * @Description: fc.modal
 */
(function(_) {
    _.angular
        .module('fc')
        .constant('$fcModalConfig', {
            subscriptions: {
                SHOW: 'fc.modal.show',
                HIDE: 'fc.modal.hide'
            },
            classNames: {
                bodyHidden: 'fc-modal-in-body__show',
                container: 'fc-modal',
                box: 'fc-modal--box',
                bg: 'fc-modal--bg',
                modalActive: 'fc-modal__active',
                boxActive: 'fc-modal--box__active'
            }
        })
        .factory(
            '$fc.modal',
            ['$rootScope', '$timeout', '$fcModalConfig'].concat(function(
                $rootScope,
                $timeout,
                $config
            ) {
                var __timer = null;
                return {
                    show: function(id, cb) {
                        _.FC.invariant(
                            id,
                            "Error: param 'id' is required for method show of fcModal in fc."
                        );
                        __timer && $timeout.cancel(__timer);
                        $timeout(function() {
                            $rootScope.$broadcast($config.subscriptions.SHOW, {
                                id: id,
                                callback: cb
                            });
                        }, 0);
                    },
                    hide: function(id, cb) {
                        _.FC.invariant(
                            id,
                            "Error: param 'id' is required for method show of fcModal in fc."
                        );
                        return __timer
                            ? $timeout.cancel(__timer)
                            : $rootScope.$broadcast($config.subscriptions.HIDE, {
                                id: id,
                                callback: cb
                            });
                    }
                };
            })
        )
        .directive(
            'fcModal',
            ['$timeout', '$fcModalConfig'].concat(function($timeout, $config) {
                var _ids = [];
                return {
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    link: function(scope, tElement, attrs, ctrl, transclude) {
                        var $__body = document.body,
                            $__modal = tElement[0],
                            $__modalBox = tElement[0].firstChild,
                            __id = attrs.id || null;

                        _.FC.invariant(__id, "Error: property 'id' is required in fc-modal.");
                        _.FC.invariant(
                            __id !== '' && __id !== null,
                            "Error: property 'id' is empty in fc-modal."
                        );

                        if (!~_ids.indexOf(__id)) _ids.push(__id);

                        transclude(scope, function(clone) {
                            for (var index = 0; index < clone.length; index++) {
                                if (clone[index].nodeType === 1) {
                                    $__modalBox.appendChild(clone[index]);
                                }
                            }
                        });

                        scope.$on(
                            $config.subscriptions.SHOW,
                            /**
                             * @param _
                             * @param data {{ id: string, callback?: function }}
                             */
                            function(_, data) {
                                if (data) {
                                    _.FC.invariant(
                                        _ids.indexOf(data.id) >= 0,
                                        'Error: the modal `%s` for showing is not found.',
                                        data.id
                                    );
                                    if (__id === data.id) {
                                        data && data.callback && data.callback();

                                        !$__body.classList.contains(
                                            $config.classNames.bodyHidden
                                        ) && $__body.classList.add($config.classNames.bodyHidden);
                                        !$__modal.classList.contains(
                                            $config.classNames.modalActive
                                        ) && $__modal.classList.add($config.classNames.modalActive);
                                        $timeout(function() {
                                            !$__modalBox.classList.contains(
                                                $config.classNames.boxActive
                                            ) &&
                                                $__modalBox.classList.add(
                                                    $config.classNames.boxActive
                                                );
                                        }, 200);
                                    }
                                }
                            }
                        );

                        scope.$on(
                            $config.subscriptions.HIDE,
                            /**
                             * @param _
                             * @param data {{ id: string, callback?: function }}
                             */
                            function(_, data) {
                                if (data) {
                                    _.FC.invariant(
                                        _ids.indexOf(data.id) >= 0,
                                        'Error: the modal `%s` for hiding is not found.',
                                        data.id
                                    );
                                    if (__id === data.id) {
                                        $__modalBox.classList.remove($config.classNames.boxActive);
                                        $timeout(function() {
                                            $__modal.classList.remove(
                                                $config.classNames.modalActive
                                            );
                                            $__body.classList.remove($config.classNames.bodyHidden);
                                            data && data.callback && data.callback();
                                        }, 200);
                                    }
                                }
                            }
                        );
                    },
                    template: _.FC.template(
                        '<div class="%s"><div class="%s"></div><div class="%s"></div></div>',
                        $config.classNames.container,
                        $config.classNames.box,
                        $config.classNames.bg
                    )
                };
            })
        );
})(window);

'use strict';

/*!
 * flash-components v1.4.2
 * (c) 2018 LivingSpace.
 */
/**
 * CAUTIONS:
 *
 *      1. 组件的静态常量配置，请以 $fc{ComponentName}Config 的形式命名;
 *      2. 尽可能的将所有 硬编码 的代码提取出来，以 constant 方式声明；
 *      3. 将每个涉及到 dom class 的组件中的 class names 提取出来，放到 constant 中；
 *      4. 所提供于 controller 的 services 均需要以 'fc.' 开头，以保证依赖之间的独立性，避免因为命名导致冲突；
 *      5. directives 的命名均以 fc 开头并使用驼峰式命名规则；
 */
(function(angular) {
    if (!angular) throw new Error('ReferenceError: please import angular.js@1.X first.');

    var _version = angular.version,
        _major = Number(_version.major) || 0;

    if (isNaN(_major)) throw new Error('UnknownError: please confirm your angular.js is valid.');
    if (_major >= 2) throw new Error('VersionError: please ensure that the version of angular.js is "1.x.x" .');

    function invariant(condition, format, a, b, c, d, e, f) {
        if (!condition) {
            var args = [a, b, c, d, e, f];
            var argsIndex = 0;
            throw new Error(
                format.replace(/%s/g, function() {
                    return args[argsIndex++];
                })
            );
        }
    }

    var currentVersion = '1.4.2';

    console.log('fc-v' + currentVersion + '...loading!');

    var noop = function() {};

    /**
     * fc 之 自定义 provider
     * 提供各个组件的自定义 provider，以便可以在 config 中直接设置对应组件的初始配置
     */
    angular.module('fc.provider', []).provider('$fc', function $fcProvider() {
        function __creator(isSuccess) {
            return function(payload) {
                return {
                    success: isSuccess,
                    payload: payload
                };
            };
        }

        function __getOption(scope, key) {
            if (angular.isUndefined(scope))
                throw new ReferenceError('$fc: __getOption ->' + scope + 'in context is undefined.');
            if (angular.isUndefined(key)) return scope;
            return scope[key];
        }

        function __setOption(scope, key, value) {
            if (angular.isUndefined(scope))
                throw new ReferenceError('$fc: __setOption ->' + scope + 'in context is undefined.');
            if (angular.isUndefined(key)) throw new ReferenceError('$fc: __setOption -> param:key is required.');
            scope[key] = value;
        }

        var _self = this,
            _toast = { duration: 2500 },
            _validationRegExp = {},
            _httpOptions = {
                headers: {},
                successCreator: __creator(true),
                errorCreator: __creator(false),
                errorHandler: noop,
                timeout: 5000,
                withCredentials: true
            };

        this.http = {
            __getOptions: function(key) {
                return __getOption(_httpOptions, key);
            },
            setOptions: function(options) {
                _httpOptions = angular.merge(_httpOptions, options);
            }
        };

        angular.forEach(_httpOptions, function(item, index) {
            var _metaName = index.slice(0, 1).toUpperCase() + index.slice(1),
                _getName = 'get' + _metaName,
                _setName = 'set' + _metaName;

            _self.http[_getName] = function() {
                return __getOption(_httpOptions, index);
            };
            _self.http[_setName] = function(value) {
                return __setOption(_httpOptions, index, value);
            };

            if (index === 'headers') {
                _self.http[_setName] = function(value) {
                    /* eslint no-undefined:["off"] */
                    _httpOptions[index] = !!value ? angular.merge(_httpOptions[index], value) : undefined;
                    return false;
                };
            }
        });

        this.toast = {
            __getDuration: function() {
                return __getOption(_toast, 'duration');
            },
            setDuration: function(duration) {
                return __setOption(_toast, 'duration', duration);
            }
        };
        this.validation = {
            __getRegExp: function(key) {
                return __getOption(_validationRegExp, key);
            },
            setRegExp: function(key, regExp) {
                return __setOption(_validationRegExp, key, regExp);
            }
        };

        this.$get = function() {
            return {
                http: this.http,
                toast: this.toast,
                validation: this.validation
            };
        };
    });

    /**
     * fc 之 loading 组件，使用方法：
     *      <ElementTag fc-loading="loading"></ElementTag>
     */
    angular
        .module('fc.loading', [])
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
        /* fc-loading attribute */
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
        /* fc-loading element */
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

    /**
     * fc 之 modal 组件，使用方法：
     * in html:
     *      <fc-modal id="uniqueId">
     *          ...
     *      </fc-modal>
     * in javascript:
     *      angular.module("xxxModule", ["fcModule"])
     *             .controller("xxxController", ['$fc.modal', function ($modal) {
     *                 $modal.show("uniqueId");
     *                 $modal.hide("uniqueId");
     *             }]);
     */
    angular
        .module('fc.modal', [])
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
            ['$rootScope', '$timeout', '$fcModalConfig'].concat(function($rootScope, $timeout, $config) {
                var __timer = null;
                return {
                    show: function(id, cb) {
                        invariant(id, "Error: param 'id' is required for method show of fcModal in fc.");
                        __timer && $timeout.cancel(__timer);
                        $timeout(function() {
                            $rootScope.$broadcast($config.subscriptions.SHOW, {
                                id: id,
                                callback: cb
                            });
                        }, 0);
                    },
                    hide: function(id, cb) {
                        invariant(id, "Error: param 'id' is required for method show of fcModal in fc.");
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
                            __hasHiddenInBody = window.getComputedStyle($__body).overflow === 'hidden',
                            __id = attrs.id || null;

                        invariant(__id, "Error: property 'id' is required in fc-modal.");
                        invariant(__id !== '' && __id !== null, "Error: property 'id' is empty in fc-modal.");
                        invariant(
                            _ids.indexOf(__id) === -1,
                            "Error: property 'id' is unique but %s is duplicated in fc-modal.",
                            __id
                        );

                        _ids.push(__id);

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
                                    invariant(
                                        _ids.indexOf(data.id) >= 0,
                                        'Error: the modal `%s` for showing is not found.',
                                        data.id
                                    );
                                    if (__id === data.id) {
                                        data && data.callback && data.callback();
                                        $__body.className += __hasHiddenInBody
                                            ? ''
                                            : ' ' + $config.classNames.bodyHidden;
                                        $__modal.className += ' ' + $config.classNames.modalActive;
                                        $timeout(function() {
                                            $__modalBox.className += ' ' + $config.classNames.boxActive;
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
                                    invariant(
                                        _ids.indexOf(data.id) >= 0,
                                        'Error: the modal `%s` for hiding is not found.',
                                        data.id
                                    );
                                    if (__id === data.id) {
                                        $__modalBox.className = $__modalBox.className.replace(
                                            new RegExp('\\ ' + $config.classNames.boxActive, 'g'),
                                            ''
                                        );
                                        $timeout(function() {
                                            $__modal.className = $__modal.className.replace(
                                                new RegExp('\\ ' + $config.classNames.modalActive, 'g'),
                                                ''
                                            );
                                            $__body.className = __hasHiddenInBody
                                                ? $__body.className
                                                : $__body.className.replace(
                                                    new RegExp('\\ ' + $config.classNames.bodyHidden, 'g'),
                                                    ''
                                                );
                                            data && data.callback && data.callback();
                                        }, 200);
                                    }
                                }
                            }
                        );
                    },
                    template:
                        '<div class="' +
                        $config.classNames.container +
                        '">' +
                        '<div class="' +
                        $config.classNames.box +
                        '"></div>' +
                        '<div class="' +
                        $config.classNames.bg +
                        '"></div>' +
                        '</div>'
                };
            })
        );

    /**
     * fc 之 hinter 组件，使用方法：
     *      html files
     *          <fc-hinter/>
     *      js file
     *          dependence: fcModule
     *          injector: $fc.hinter
     *
     *          $hinter.alert({
     *              title: string,
     *              message: string,
     *              closeText: string,
     *              okText: string,
     *              onOk: function,
     *              onClose: function
     *          })
     */
    angular
        .module('fc.hinter', [])
        .constant('$fcHinterConfig', {
            types: {
                ALERT: 'ALERT',
                CONFIRM: 'CONFIRM'
            },
            subscriptions: {
                OPEN: 'fc.hinter.open',
                CLOSE: 'fc.hinter.close'
            },
            classNames: {
                bodyHidden: ' fc-hinter__body--hidden'
            }
        })
        .factory(
            '$fc.hinter',
            ['$rootScope', '$timeout', '$fcHinterConfig', '$fc'].concat(function($rootScope, $timeout, $config) {
                function __open(type, options) {
                    $rootScope.$broadcast($config.subscriptions.OPEN, {
                        type: type || $config.types.ALERT,
                        options: options || {}
                    });
                }

                return {
                    types: $config.types,
                    trigger: function(type, options) {
                        return __open(type, options);
                    },
                    alert: function(options) {
                        return __open($config.types.ALERT, options);
                    },
                    confirm: function(options) {
                        return __open($config.types.CONFIRM, options);
                    }
                };
            })
        )
        .directive(
            'fcHinter',
            ['$rootScope', '$timeout', '$sce', '$fcHinterConfig'].concat(function($rootScope, $timeout, $sce, $config) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {},
                    link: function(scope) {
                        var onOk4callback = null;
                        var onClose4callback = null;
                        var $body = window.document.body;
                        var hasHiddenInBody = window.getComputedStyle($body).overflow === 'hidden';

                        scope.visible = false;
                        scope.onClose = function(isOk) {
                            scope.visible = false;
                            $body.className = hasHiddenInBody
                                ? $body.className
                                : $body.className.replace(
                                    new RegExp('\\ ' + $config.classNames.bodyHidden.slice(1), 'g'),
                                    ''
                                );
                            isOk && typeof onOk4callback === 'function' && onOk4callback();
                            !isOk && typeof onClose4callback === 'function' && onClose4callback();
                        };

                        scope.$on(
                            $config.subscriptions.OPEN,
                            /**
                             * @param $event
                             * @param data {{ type: string, options: { onOk: function, onClose: function, title: string } }}
                             */
                            function($event, data) {
                                if (data) {
                                    scope.type = data.type;
                                    scope.types = $config.types;

                                    var options = data.options;

                                    scope.title = options.title || '提示';
                                    scope.okText = options.okText || '确定';
                                    scope.message = $sce.trustAsHtml(options.message || '您还没有输入提示信息');
                                    scope.closeText = options.closeText || '取消';

                                    $body.className += hasHiddenInBody ? '' : $config.classNames.bodyHidden;
                                    scope.visible = true;

                                    onOk4callback = options.onOk || null;
                                    onClose4callback = options.onClose || null;
                                }
                            }
                        );
                    },
                    template: hinterTemplateString
                };
            })
        );

    /**
     * fc 之 toast 组件，使用方法：
     *      html files
     *          <fc-toast/>
     *      js file
     *          dependence: fcModule
     *          injector: $fc.toast
     *
     *          toast.error(errorMessage)
     */
    angular
        .module('fc.toast', ['fc.provider'])
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
            ['$rootScope', '$timeout', '$fcToastConfig', '$fc'].concat(function($rootScope, $timeout, $config, $fc) {
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
                    __timer ? $timeout.cancel(__timer) : $rootScope.$broadcast($config.subscriptions.CLOSE, true);
                }

                return {
                    types: $config.types,
                    abort: __abort,
                    trigger: __trigger,
                    error: function(message, duration) {
                        return __trigger($config.types.ERROR, message, duration || __duration);
                    },
                    info: function(message, duration) {
                        return __trigger($config.types.INFO, message, duration || __duration);
                    },
                    success: function(message, duration) {
                        return __trigger($config.types.SUCCESS, message, duration || __duration);
                    }
                };
            })
        )
        .directive(
            'fcToast',
            ['$rootScope', '$timeout', '$fcToastConfig'].concat(function($rootScope, $timeout, $config) {
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
                    template:
                        '<div class="' +
                        $config.classNames.container +
                        '"' +
                        '   ng-class="{ ' +
                        "'" +
                        $config.classNames.active +
                        "': visible," +
                        "'" +
                        $config.classNames.types.success +
                        "': type === '" +
                        $config.types.SUCCESS +
                        "'," +
                        "'" +
                        $config.classNames.types.error +
                        "': type === '" +
                        $config.types.ERROR +
                        "'," +
                        "'" +
                        $config.classNames.types.info +
                        "': type === '" +
                        $config.types.INFO +
                        '\' }">' +
                        '<div class="' +
                        $config.classNames.box +
                        '">' +
                        '<div class="' +
                        $config.classNames.content +
                        '">{{message}}</div>' +
                        '</div>' +
                        '</div>'
                };
            })
        );

    /**
     * fc 之 empty 组件，使用方法：
     *      html files
     *          <fc-empty/>
     *      js file
     *          dependence: fcModule
     *
     */
    angular.module('fc.empty', []).directive('fcEmpty', [
        function() {
            return {
                scope: {
                    title: '=?',
                    message: '=?',
                    imageSrc: '=?'
                },
                replace: true,
                restrict: 'E',
                template: emptyTemplateString,
                link: function(scope) {
                    scope.title = typeof scope.title === 'undefined' ? '' : scope.title;
                    scope.message = typeof scope.message === 'undefined' ? '' : scope.message;
                    scope.imageSrc = typeof scope.imageSrc === 'undefined' ? noDataBase64 : scope.imageSrc;
                }
            };
        }
    ]);

    /**
     * fc 之 item 组件，使用方法：
     *      html files
     *          <fc-item/>
     *      js file
     *          dependence: fcModule
     *
     */
    angular.module('fc.item', []).directive('fcItem', [
        function() {
            return {
                scope: {
                    arrow: '=?',
                    onClick: '&?'
                },
                replace: true,
                restrict: 'E',
                template: itemTemplateString,
                transclude: true,
                link: function(scope) {
                    scope.arrow = scope.arrow !== false;
                }
            };
        }
    ]);

    /**
     * fc 之 validation 组件，使用方法：
     *      js file
     *          dependence: fcModule
     *          injector: $fc.validation
     *
     *      angular.config(['']
     *
     *      $scope.testValidation = {
     *          a: 1,
     *          b: 3,
     *          c: {
     *              d: 4
     *          }
     *      };
     *      var result = validation.run($scope, ['testValidation.a', 'testValidation.b', 'testValidation.c.d'], {
     *          'testValidation.a': {
     *              isRequired: true,
     *              emptyMessage: 'a = 1'
     *          },
     *          'testValidation.b': {
     *              validate: function (prop) { return prop === 2 },
     *              errorMessage: 'b === 2' // or errorMessage: ['b === 2']
     *          },
     *          testValidation.c.d': {
     *              validate: [
     *                  function (prop) { return prop === 1 },
     *                  function (prop) { return prop === 2 },
     *                  function (prop) { return prop === 3 },
     *              ],
     *              errorMessage: [
     *                  '1 - c.d === 4',
     *                  '2 - c.d === 4',
     *                  '3 - c.d === 4'
     *              ]
     *          }
     *      });
     *
     *      console.log(result); // { isError: boolean, message: string }
     */
    angular
        .module('fc.validation', ['fc.provider'])
        .config([
            '$fcProvider',
            function($fc) {
                $fc.validation.setRegExp('mobile', /0?(13|14|15|17|18|19)[0-9]{9}/);
                $fc.validation.setRegExp('bankCardNo', /^([1-9])(\d{15}|\d{18})$/);
            }
        ])
        .factory(
            '$fc.validation',
            ['$fc'].concat(function($fc) {
                function _setError(isError, message) {
                    return {
                        isError: !angular.isUndefined(isError) ? isError : false,
                        message: isError ? message : null
                    };
                }

                function _getObjectType(target) {
                    return Object.prototype.toString.call(target);
                }

                return {
                    /**
                     * @param context {object}
                     * @param props {array}
                     * @param rules {{
                     *      isRequired: boolean,
                     *      emptyMessage: string,
                     *
                     *      validation: function,
                     *      errorMessage: string,
                     *
                     *      validations: array,
                     *      errorMessages: string
                     *  }}
                     */
                    run: function __validation(context, props, rules) {
                        var errorResult = _setError();
                        if (!props || !rules) return errorResult;

                        invariant(
                            angular.isArray(props),
                            '$fc.validation: props must be Array:[prop1, prop2, ...] type.'
                        );

                        invariant(
                            angular.isObject(rules) && !angular.isArray(rules),
                            '$fc.validation: rules must be Object:{ prop: Object } type.'
                        );

                        angular.forEach([].concat(props).reverse(), function(prop) {
                            if (typeof prop === 'string' && prop in rules) {
                                var currentProp = context,
                                    _propPath = prop.split('.');

                                angular.forEach(_propPath, function(path) {
                                    if (angular.isUndefined(currentProp)) return false;
                                    currentProp = currentProp[path];
                                });

                                invariant(
                                    !angular.isUndefined(currentProp),
                                    '$fc.validation: context.%s is undefined.',
                                    prop
                                );

                                if (rules[prop].validate) {
                                    switch (_getObjectType(rules[prop].validate)) {
                                        case '[object Function]':
                                            if (!rules[prop].validate(currentProp)) {
                                                errorResult = _setError(
                                                    true,
                                                    angular.isArray(rules[prop].errorMessage)
                                                        ? rules[prop].errorMessage[0]
                                                        : rules[prop].errorMessage
                                                );
                                            }
                                            break;
                                        case '[object Array]':
                                            invariant(
                                                angular.isArray(rules[prop].errorMessage),
                                                '$fc.validation: rules.%s.errorMessage should be same with validate:Array in type.',
                                                prop
                                            );
                                            invariant(
                                                rules[prop].validate.length === rules[prop].errorMessage.length,
                                                '$fc.validation: rules.%s.errorMessage should be same with validate in length.',
                                                prop
                                            );

                                            angular.forEach(rules[prop].validate, function(f, index) {
                                                invariant(
                                                    angular.isFunction(f),
                                                    '$fc.validation: rules.%s.validate[%s] is not a Function.',
                                                    prop,
                                                    index
                                                );
                                                if (!f(currentProp))
                                                    errorResult = _setError(true, rules[prop].errorMessage[index]);
                                            });
                                            break;
                                        default:
                                            invariant(
                                                false,
                                                '$fc.validation: [validate] is just allowed to be Function or Array type.'
                                            );
                                    }
                                }
                                if (rules[prop].isRequired && (currentProp === '' || currentProp === null)) {
                                    errorResult = _setError(true, rules[prop].emptyMessage);
                                }
                            }
                        });
                        return errorResult;
                    },
                    regs: $fc.validation.__getRegExp()
                };
            })
        );

    /**
     * $[get|delete|head|post|put|patch]
     * @params url
     * @params params
     * @params options
     */
    // todo...
    angular.module('fc.http', ['fc.provider']).service(
        '$fc.http',
        ['$http', '$q', '$fc'].concat(function($http, $q, $fc) {
            var __methodsEnumNormal = ['GET', 'DELETE', 'HEAD', 'POST', 'PUT', 'PATCH'],
                // _methodsEnumForm = ['FORM.GET', 'FORM.POST'],
                _options = $fc.http.__getOptions();

            function __http(method, url, params, options, startTime) {
                var _httpPromise = null,
                    _optionsNew = angular.merge({}, _options, options || {});

                // GET / DELETE / HEAD
                if (__methodsEnumNormal.slice(0, 3).indexOf(method.toUpperCase()) !== -1) {
                    _httpPromise = $http[method.toLowerCase()](url, {
                        params: params || {},
                        headers: _optionsNew.headers,
                        timeout: _optionsNew.timeout,
                        withCredentials: _optionsNew.withCredentials
                    });
                    // POST / PUT / PATCH
                } else if (__methodsEnumNormal.slice(3).indexOf(method.toUpperCase()) !== -1) {
                    _httpPromise = $http[method.toLowerCase()](url, params, {
                        headers: _optionsNew.headers,
                        timeout: _optionsNew.timeout,
                        withCredentials: _optionsNew.withCredentials
                    });
                }

                return _httpPromise
                    .then(function(response) {
                        return _optionsNew.successCreator(response.data);
                    })
                    .catch(function(error) {
                        var finalError = {
                            data: error.data || {},
                            status: error.status || -1,
                            statusText: error.statusText || ''
                        };
                        if (startTime && Date.now() - startTime > _optionsNew.timeout) {
                            finalError.status = -99;
                            finalError.statusText = 'TIMEOUT';
                        }
                        typeof _optionsNew.errorHandler === 'function' &&
                        _optionsNew.errorHandler(_optionsNew.errorCreator(finalError));
                        return $q.reject(_optionsNew.errorCreator(finalError));
                    });
            }

            this.$get = function(url, params, options) {
                return __http(__methodsEnumNormal[0], url, params, options, Date.now());
            };
            this.$delete = function(url, params, options) {
                return __http(__methodsEnumNormal[1], url, params, options, Date.now());
            };
            this.$head = function(url, params, options) {
                return __http(__methodsEnumNormal[2], url, params, options, Date.now());
            };
            this.$post = function(url, params, options) {
                return __http(__methodsEnumNormal[3], url, params, options, Date.now());
            };
            this.$put = function(url, params, options) {
                return __http(__methodsEnumNormal[4], url, params, options, Date.now());
            };
            this.$patch = function(url, params, options) {
                return __http(__methodsEnumNormal[5], url, params, options, Date.now());
            };
        })
    );

    angular.module('fc.helpers', []).factory('$fc.helpers', [
        '$q',
        '$timeout',
        function($q, $timeout) {
            /**
             * 格式化时间工具类
             * @param dateString 时间字符串（时间戳、new Date() 返回的结果或 2018-01-01 类似格式的字符串）
             * @param format
             * @returns {*}
             * @private
             */
            function __timeFormatter(dateString, format) {
                var _date = new Date(dateString),
                    _regFormatter = {
                        'M+': _date.getMonth() + 1,
                        'd+': _date.getDate(),
                        'H+': _date.getHours(),
                        'm+': _date.getMinutes(),
                        's+': _date.getSeconds()
                    };

                if (/(Y+)/.test(format)) {
                    format = format.replace(RegExp.$1, ('' + _date.getFullYear()).slice(-RegExp.$1.length));
                }

                angular.forEach(_regFormatter, function(item, index) {
                    if (new RegExp('(' + index + ')').test(format)) {
                        format = format.replace(RegExp.$1, ('00' + item).slice(-RegExp.$1.length));
                    }
                });

                return format;
            }

            /**
             * 将 param 转化为小数点后两位的字符串
             * @param param
             * @returns {string}
             * @private
             */
            function __fixedTo2(param) {
                var _paramFloat = parseFloat(param);
                return (isNaN(_paramFloat) ? 0.0 : _paramFloat).toFixed(2);
            }

            /**
             * promise 序列执行方法
             *
             * promises 是以函数（若有参数，则为前者函数返回的结果）为项的数组
             * 如果执行的 promise/函数 需要上一个 promise/函数 执行返回的结果,
             * 需要将其结果当做参数传递到当前执行的函数中
             * 同时，若函数为 Promise 类型，
             * 那么 catch 需要以 return $q.reject(some reason..) 的形式进行传递或捕获。
             * 具体使用，请参照 prescription/index.controller.js
             *
             * eg: __promiseSequence([
             *      function A(): a,
             *      function B(a: form A): b
             * ])
             *
             * @param promises
             * @returns {Promise}
             * @private
             */
            function __promiseSequence(promises) {
                var result = $q.resolve();
                angular.forEach(promises, function(promise) {
                    result = result.then(promise);
                });

                return result.catch(function(error) {
                    return $q.reject(error);
                });
            }

            /**
             * 倒计时（1s）构造函数
             *
             * 若要使用，请使用 new 创建对象，如：
             *
             *      new $helpers.$$CountDown(continueCB: function, timeoutCB: function)
             *
             * @param continueCB 相隔 1s 执行的回调方法
             * @param timeoutCB 倒计时到 0 时所执行的回调函数
             * @returns {boolean}
             * @private
             */
            function __CountDown(continueCB, timeoutCB) {
                function noop() {}
                this.timer = null;
                this.continued = false;
                this.timeoutCB = timeoutCB || noop;
                this.continueCB = continueCB || noop;
            }

            /**
             * 开始执行倒计时
             *
             * @param targetExpireTimestamp 目标超时的时间戳
             * @returns {__CountDown}
             */
            __CountDown.prototype.start = function(targetExpireTimestamp) {
                this.continued = true;
                this.targetExpireTimestamp = targetExpireTimestamp;
                this.__run(this.continueCB, this.timeoutCB);

                return this;
            };
            __CountDown.prototype.__run = function(continueCB, timeoutCB) {
                if (!this.continued) return false;

                var offsetTimestamp = this.targetExpireTimestamp - Date.now();

                if (offsetTimestamp <= 0) {
                    console.log('countDown：closed...');
                    this.timer && $timeout.cancel(this.timer);
                    return timeoutCB();
                }

                var self = this;
                this.timer = $timeout(function() {
                    self.timer && $timeout.cancel(self.timer);
                    self.__run(continueCB, timeoutCB);
                }, 1000 - new Date().getMilliseconds());

                continueCB(offsetTimestamp);

                return this;
            };
            /**
             * 取消倒计时
             * @returns {__CountDown}
             */
            __CountDown.prototype.cancel = function() {
                this.continued = false;
                this.timer && $timeout.cancel(this.timer);

                return this;
            };

            return {
                // Constructor
                $$CountDown: __CountDown,

                // methods
                fixedTo2: __fixedTo2,
                timeFormatter: __timeFormatter,
                promiseSequence: __promiseSequence
            };
        }
    ]);

    angular.module('fc.header', ['ngRoute']).directive('fcHeader', [
        '$route',
        '$timeout',
        '$location',
        function($route, $timeout, $location) {
            var __getRouteConfig = function() {
                return ($route.routes[$location.path()] && $route.routes[$location.path()].config) || false;
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
                    scope.onBack = noop;
                    scope.onCancel = noop;

                    scope.$on('$locationChangeStart', function() {
                        timer && $timeout.cancel(timer);
                        timer = $timeout(function() {
                            var _currentRouteConfig = __getRouteConfig();
                            if (!_currentRouteConfig) return (scope.showHeader = false);
                            scope.back =
                                'undefined' === typeof _currentRouteConfig.back ? true : !!_currentRouteConfig.back;
                            scope.title = _currentRouteConfig.title || 'Loading...';
                            scope.cancel = _currentRouteConfig.cancel || false;
                            scope.onBack = _currentRouteConfig.onBack || noop;
                            scope.onCancel = _currentRouteConfig.onCancel || noop;
                        }, 0);
                    });
                    scope.goBack = function() {
                        if (scope.cancel) return scope.onCancel();

                        scope.onBack();
                        window.history.back();
                    };
                },
                /* eslint no-use-before-define: ["off"] */
                template: headerTemplateString
            };
        }
    ]);

    angular.module('fc.container', []).directive('fcContainer', [
        function() {
            return {
                scope: {
                    imageUrl: '=?',
                    hasFooter: '='
                },
                replace: true,
                restrict: 'E',
                template: containerTemplateString,
                transclude: true,
                link: function(scope) {
                    scope.image = scope.imageUrl || bottomLogoBase64;
                    scope.showFooter = scope.hasFooter !== false;
                }
            };
        }
    ]);

    var arrowLeftIconBase64 =
        'data:image/png;base64,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';
    var arrowRightIconBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAWCAYAAAAb+hYkAAAAAXNSR0IArs4c6QAAAJtJREFUOBGV1MENgCAMBVDgwAZO4RQO4QIc3ceEEws4hFM4hRtwQT4HEgLF9p9IyGubkKJUjvf+CCEsOHNiAFJKZ4zx5kJjrb201k+GKxdqjIMOAIAokAttzrmXGrUgKaxIAhvEhR3iwCH6gySawSmioMGFNNNO1KOTiAKYaohmYIj+QIc4oEFcUJEEFCQFQCYv385dPoAa6cfyAYbO5apgr27UAAAAAElFTkSuQmCC';
    var bottomLogoBase64 =
        'data:image/png;base64,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';
    var noDataBase64 =
        'data:image/png;base64,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';

    var headerTemplateString =
        '<div class="fc-header" ng-cloak ng-if="!!showHeader"><div class="fc-header__left" ng-if="back" ng-click="goBack()"><img src="' +
        arrowLeftIconBase64 +
        '" alt=""></div><div class="fc-header__title" ng-bind="title">Loading...</div></div>';

    var containerTemplateString =
        '<section class="fc-container"><div class="fc-container__inner" ng-transclude></div><div ng-if="!!showFooter" class="fc-container__footer"><img ng-src="{{image}}" alt=""></div></section>';

    var hinterTemplateString =
        '<div class="fc-hinter__container" ng-show="visible"><div class="hinter__box"><h1 class="hinter__header">{{title}}</h1><div class="hinter__content" ng-bind-html="message"></div><div class="hinter__footer"><button ng-if="type === types.CONFIRM" class="fc-btn--like" ng-click="onClose(false)">{{closeText}}</button> <button class="fc-btn--like highlight" ng-click="onClose(true)">{{okText}}</button></div></div></div>';

    var emptyTemplateString =
        '<div class="fc-empty"><img ng-src="{{imageSrc}}" alt=""><p ng-if="title" class="fc-empty__title">{{title}}</p><p ng-if="message" class="fc-empty__desc" ng-bind="message"></p></div>';

    var itemTemplateString =
        '<li class="fc-item fc-btn--like" ng-click="onClick()"><div class="fc-item__container" ng-transclude></div><div ng-if="arrow" class="fc-item__arrow"><img src="' +
        arrowRightIconBase64 +
        '" alt=""></div></li>';

    angular.module('fc', [
        'fc.item',
        'fc.http',
        'fc.modal',
        'fc.empty',
        'fc.toast',
        'fc.hinter',
        'fc.header',
        'fc.loading',
        'fc.helpers',
        'fc.provider',
        'fc.container',
        'fc.validation'
    ]);
    console.log('fc-v' + currentVersion + '...done!');
})(window.angular);

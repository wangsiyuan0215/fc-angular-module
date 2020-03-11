'use strict';

/*!
 * flash-components v1.4.4
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

    var currentVersion = '1.4.4';

    console.log('Current `fc` module version is ' + currentVersion);

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
                        
                        if (!~_ids.indexOf(__id))
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

    angular.module('fc.checkbox', []).directive('fcCheckbox', [
        function () {
            return {
                scope: {
                    id: '@?',
                    checked: '=',
                    onChange: '&?'
                },
                replace: true,
                restrict: 'E',
                template: checkboxTemplateString,
                transclude: true,
                link: function(scope) {
                    scope.onClick4changing = function() {
                        return typeof scope.onChange === 'function'
                            && scope.onChange({ id: scope.id, value: !scope.checked });
                    };
                }
            }
        }
    ]);

    angular.module('fc.icon', []).directive('fcIcon', [
        function () {
            return {
                scope: {
                    id: '@'
                },
                replace: true,
                restrict: 'E',
                template: '<svg class="fc-icon" aria-hidden="true"><use ng-attr-xlink:href="{{iconName}}" xlink:href=""></use></svg>',
                link: function(scope) {
                    scope.iconName = '#icon-' + scope.id;
                }
            }
        }
    ]);

    var arrowLeftIconBase64 =
        'data:image/png;base64,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';
    var bottomLogoBase64 =
        'data:image/png;base64,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';
    var noDataBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAEsCAYAAAA1u0HIAAAgAElEQVR4Aex9B7gc9XV94jiJu+NeEsctjlsct3/sOLEdx8Td2MbYYLAxvSM6SIAEAiFEURfqnSIhCSEECBDFQgiEhQRCBiG9sv3t7Mzsm/52yu6K+//ur8zO7tsnPTWQni7fN99DW2fO7uyZc+659/dXf0X/EQKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIXAQEDAMeFdXzvtiTjG/nVfM72R6+r5S8rwPHIS3opckBAgB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UEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBQQCggFhAJCAaGAUEAoIBTYbRX4/6MX9j0D0GX+AAAAAElFTkSuQmCC';

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
        '<li class="fc-item fc-btn--like" ng-click="onClick()"><div class="fc-item__container" ng-transclude></div><div ng-if="arrow" class="fc-item__arrow"><svg class="fc-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M287.232 951.13671111c-21.39022222-21.39022222-21.39022222-55.86488889 0-77.25511111l361.81333333-361.81333333-361.81333333-361.81333334c-21.39022222-21.39022222-21.39022222-55.97866667 0-77.25511111 21.39022222-21.39022222 55.86488889-21.39022222 77.25511111 0l400.49777777 400.49777778c21.39022222 21.39022222 21.39022222 55.97866667 0 77.25511111l-400.49777777 400.49777778c-10.69511111 10.69511111-24.68977778 15.92888889-38.68444445 15.92888889C311.92177778 967.0656 297.92711111 961.83182222 287.232 951.13671111z"></path></svg></div></li>';
    
    var checkboxTemplateString = '<div class="fc-checkbox" ng-class="{ \'checked\': checked }" ng-click="onClick4changing()"><div class="fc-checkbox__indicator"><svg class="fc-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M913.017 237.02c-25.311-25.312-66.349-25.312-91.66 0l-412.475 412.474-206.237-206.237c-25.312-25.312-66.35-25.312-91.661 0s-25.312 66.35 0 91.66l252.067 252.067c0.729 0.73 1.439 1.402 2.134 2.029 25.434 23.257 64.913 22.585 89.527-2.029l458.303-458.303c25.313-25.312 25.313-66.35 0.001-91.661z"></path></svg></div><div class="fc-checkbox__content" ng-transclude></div></div>';

    angular.module('fc', [
        'fc.icon',
        'fc.item',
        'fc.http',
        'fc.modal',
        'fc.empty',
        'fc.toast',
        'fc.hinter',
        'fc.header',
        'fc.loading',
        'fc.helpers',
        'fc.checkbox',
        'fc.provider',
        'fc.container',
        'fc.validation'
    ]);
})(window.angular);

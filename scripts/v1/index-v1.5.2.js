'use strict';

/*!
 * flash-components v1.5.2
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

    var currentVersion = '1.5.2';

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
                    imageSrc: '@?'
                },
                replace: true,
                restrict: 'E',
                template: emptyTemplateString,
                link: function(scope) {
                    scope.title = typeof scope.title === 'undefined' ? '' : scope.title;
                    scope.message = typeof scope.message === 'undefined' ? '' : scope.message;
                    scope.default = typeof scope.imageSrc === 'undefined';
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
                _options = $fc.http.__getOptions();

            function __http(method, url, params, options, startTime) {
                var _optionsNew = angular.merge({}, _options, options || {}),
                    // default to GET / DELETE
                    _httpPromise = $http[method.toLowerCase()];

                if (~__methodsEnumNormal.slice(0, 3).indexOf(method.toUpperCase())) {
                    _httpPromise = _httpPromise(url, {
                        params: params || {},
                        headers: _optionsNew.headers,
                        timeout: _optionsNew.timeout,
                        withCredentials: _optionsNew.withCredentials
                    });
                } else if (~__methodsEnumNormal.slice(3).indexOf(method.toUpperCase())) {
                    // POST / PUT / PATCH
                    _httpPromise = _httpPromise(url, params, {
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
             * ], initialValue)
             *
             * @param promises
             * @param initialValue
             * @returns {Promise}
             * @private
             */
            function __promiseSequence(promises, initialValue) {
                var result = $q.resolve(initialValue);
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
                    scope.onBack = noop;
                    scope.onCancel = noop;

                    scope.$on('$locationChangeStart', function() {
                        timer && $timeout.cancel(timer);
                        timer = $timeout(function() {
                            var _currentRouteConfig = __getRouteConfig();
                            if (!_currentRouteConfig) return (scope.showHeader = false);

                            scope.back =
                                'undefined' === typeof _currentRouteConfig.back ? true : !!_currentRouteConfig.back;
                            scope.title = _currentRouteConfig.name || 'Loading...';
                            scope.cancel = 'function' === typeof _currentRouteConfig.onCancel;
                            scope.onBack = _currentRouteConfig.onBack || noop;
                            scope.onCancel = _currentRouteConfig.onCancel || noop;
                            scope.show =
                                'undefined' === typeof _currentRouteConfig.show ? true : _currentRouteConfig.show;

                            window.document.title = scope.title;
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
                    imageSrc: '@?'
                },
                replace: true,
                restrict: 'E',
                template: containerTemplateString,
                transclude: true,
                link: function(scope) {
                    scope.showFooterImage = 'undefined' !== typeof scope.imageSrc;
                }
            };
        }
    ]);
    angular.module('fc.checkbox', []).directive('fcCheckbox', [
        function() {
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
                        return (
                            typeof scope.onChange === 'function' &&
                            scope.onChange({ id: scope.id, value: !scope.checked })
                        );
                    };
                }
            };
        }
    ]);
    angular.module('fc.icon', []).directive('fcIcon', [
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

    var leftArrowSVG =
        '<svg class="fc-icon" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M384 349.866667l166.4 166.4L384 682.666667a41.258667 41.258667 0 0 0 0 59.733333 41.258667 41.258667 0 0 0 59.733333 0l196.266667-196.266667a41.258667 41.258667 0 0 0 0-59.733333l-196.266667-196.266667A42.24 42.24 0 1 0 384 349.866667z"></path></svg>';
    var noDataSVG =
        '<svg class="fc-icon" viewBox="0 0 1571 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path d="M156.402321 698.579053h21.058442a10.427603 10.427603 0 0 1 10.224367 10.427603c0 5.75316-4.48684 10.427603-10.224367 10.427604h-21.058442v21.058442a10.427603 10.427603 0 0 1-10.427603 10.21655 10.26345 10.26345 0 0 1-10.427603-10.21655v-21.058442h-21.058443a10.427603 10.427603 0 0 1-10.21655-10.427604c0-5.760977 4.479023-10.427603 10.21655-10.427603h21.058443v-21.066259a10.427603 10.427603 0 0 1 10.427603-10.21655c5.75316 0 10.427603 4.48684 10.427603 10.21655v21.066259z m1376.3029-83.413007v-21.058443a10.26345 10.26345 0 0 0-10.427603-10.224366c-5.674992 0-10.318168 4.541557-10.427603 10.224366v21.058443h-21.058442a10.26345 10.26345 0 0 0-10.21655 10.427603c0 5.589008 4.588458 10.427603 10.21655 10.427603h21.058442v21.058443c0 5.737527 4.674443 10.21655 10.427603 10.216549 5.674992 0 10.318168-4.53374 10.427603-10.216549v-21.058443h21.058443c5.737527 0 10.224366-4.674443 10.224367-10.427603 0-5.682809-4.541557-10.318168-10.224367-10.427603h-21.058443z m-757.548946 344.071817h-524.975878a20.769221 20.769221 0 0 1-20.792672-20.84739 20.91774 20.91774 0 0 1 20.792672-20.855206h94.567572a82.873649 82.873649 0 0 1-11.099847-41.600977V270.984794A83.350473 83.350473 0 0 1 417.154931 187.681221h62.479634v-20.964641a83.350473 83.350473 0 0 1 83.491175-83.303572h500.306077a83.311389 83.311389 0 0 1 83.498992 83.303572V771.673893c0 15.16458-4.049099 29.359878-11.115481 41.600977h115.360245a20.808305 20.808305 0 0 1 20.870839 20.855206 20.823939 20.823939 0 0 1-20.855206 20.855206h-250.231206v20.949008c0 15.16458-4.049099 29.367695-11.115481 41.608794h11.178015a20.784855 20.784855 0 0 1 20.792672 20.855206 20.91774 20.91774 0 0 1-20.792672 20.847389h-109.708702a41.585344 41.585344 0 0 1-6.401954 50.777894 41.600977 41.600977 0 0 1-58.969893 0l-50.777893-50.777894z m76.237191-41.702596h66.309862c22.94229 0 41.538443-18.557069 41.538443-41.81203v-605.723359c0-22.512366-18.01771-40.616061-40.240855-40.616061h-503.401527c-22.223145 0-40.240855 18.181863-40.240855 40.623878v605.715542c0 23.082992 18.768122 41.812031 41.52281 41.81203h316.548885l-10.724641-10.740275a41.624427 41.624427 0 0 1-10.841893-40.311206l-19.682687-19.69832c-61.338382 45.650076-147.502901 36.246473-197.553832-21.550901-50.058748-57.789557-47.049282-144.415267 6.894412-198.601283 54.107847-54.303267 141.014962-57.500336 198.960855-7.308702 57.95371 50.183817 67.200977 136.653191 21.183511 197.968122l19.706138 19.706138a41.561893 41.561893 0 0 1 40.311206 10.818442l69.710168 69.717985z m149.558717-104.268214h62.745405a41.726046 41.726046 0 0 0 41.522809-41.702595V166.826015c0-23.106443-18.603969-41.710412-41.522809-41.710412H562.828702a41.726046 41.726046 0 0 0-41.499358 41.710412v20.855206h396.123847a83.311389 83.311389 0 0 1 83.498992 83.303573v542.282259zM265.884336 46.916397h31.071756c8.754809 0 15.844641 6.94913 15.844641 15.641405 0 8.637557-7.089832 15.641405-15.844641 15.641404h-31.071756v31.071756a15.711756 15.711756 0 0 1-15.641405 15.844641 15.743023 15.743023 0 0 1-15.641404-15.844641v-31.071756h-31.071756a15.703939 15.703939 0 0 1-15.844641-15.633588c0-8.637557 7.089832-15.649221 15.844641-15.649221h31.071756V15.844641a15.711756 15.711756 0 0 1 15.633588-15.844641c8.637557 0 15.649221 7.089832 15.649221 15.844641v31.079573zM20.859115 938.390473a20.91774 20.91774 0 0 1 20.792671-20.855206H166.892458a20.784855 20.784855 0 0 1 20.792672 20.855206 20.91774 20.91774 0 0 1-20.792672 20.84739H41.643969a20.769221 20.769221 0 0 1-20.792671-20.84739z m657.62687-134.792794A104.276031 104.276031 0 1 0 530.998718 656.118229c-40.725496 40.725496-40.725496 106.753954 0 147.47945 40.725496 40.725496 106.746137 40.725496 147.471633 0zM458.771542 312.796824a20.855206 20.855206 0 0 1 20.831756-20.855206h229.407267a20.855206 20.855206 0 1 1 0 41.710413H479.626748a20.792672 20.792672 0 0 1-20.855206-20.855207z m0 104.268214a20.792672 20.792672 0 0 1 20.714504-20.855206h333.933435a20.737954 20.737954 0 0 1 20.714504 20.855206 20.792672 20.792672 0 0 1-20.714504 20.847389H479.486046a20.730137 20.730137 0 0 1-20.714504-20.847389z m0 104.260397a20.823939 20.823939 0 0 1 20.808305-20.855206h146.056794a20.784855 20.784855 0 0 1 20.808306 20.855206 20.823939 20.823939 0 0 1-20.808306 20.855206H479.579847a20.769221 20.769221 0 0 1-20.808305-20.855206zM62.56171 396.209832a62.557802 62.557802 0 1 1 0-125.12342 62.557802 62.557802 0 0 1 0 125.12342z m0-31.282809a31.282809 31.282809 0 1 0 0-62.557802 31.282809 31.282809 0 0 0 0 62.557802z m1292.89771-93.840611a62.557802 62.557802 0 1 1 0-125.115603 62.557802 62.557802 0 0 1 0 125.115603z m0-31.274992a31.282809 31.282809 0 1 0 0-62.557802 31.282809 31.282809 0 0 0 0 62.557802z"></path></svg>';

    var headerTemplateString =
        '<div class="fc-header" ng-cloak ng-if="!!show">' +
        '<div class="fc-header__left" ng-if="back" ng-click="goBack()">' +
        '<span class="fc-header__icon">' +
        leftArrowSVG +
        '</span>' +
        '</div>' +
        '<div class="fc-header__title" ng-bind="title">Loading...</div>' +
        '</div>';

    var containerTemplateString =
        '<section class="fc-container">' +
        '<div class="fc-container__inner" ng-transclude></div>' +
        '<div ng-if="!!showFooterImage" class="fc-container__footer"><img ng-src="{{imageSrc}}" alt=""></div>' +
        '</section>';

    var hinterTemplateString =
        '<div class="fc-hinter__container" ng-show="visible"><div class="hinter__box"><h1 class="hinter__header">{{title}}</h1><div class="hinter__content" ng-bind-html="message"></div><div class="hinter__footer"><button ng-if="type === types.CONFIRM" class="fc-btn--like" ng-click="onClose(false)">{{closeText}}</button> <button class="fc-btn--like highlight" ng-click="onClose(true)">{{okText}}</button></div></div></div>';

    var emptyTemplateString =
        '<div class="fc-empty">' +
        '<span class="fc-empty__icon" ng-if="default">' +
        noDataSVG +
        '</span>' +
        '<img class="fc-empty__image" ng-if="!default" ng-src="{{imageSrc}}" alt="">' +
        '<p ng-if="title" class="fc-empty__title">{{title}}</p>' +
        '<p ng-if="message" class="fc-empty__desc" ng-bind="message"></p>' +
        '</div>';

    var itemTemplateString =
        '<li class="fc-item fc-btn--like" ng-click="onClick()"><div class="fc-item__container" ng-transclude></div><div ng-if="arrow" class="fc-item__arrow"><svg class="fc-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M287.232 951.13671111c-21.39022222-21.39022222-21.39022222-55.86488889 0-77.25511111l361.81333333-361.81333333-361.81333333-361.81333334c-21.39022222-21.39022222-21.39022222-55.97866667 0-77.25511111 21.39022222-21.39022222 55.86488889-21.39022222 77.25511111 0l400.49777777 400.49777778c21.39022222 21.39022222 21.39022222 55.97866667 0 77.25511111l-400.49777777 400.49777778c-10.69511111 10.69511111-24.68977778 15.92888889-38.68444445 15.92888889C311.92177778 967.0656 297.92711111 961.83182222 287.232 951.13671111z"></path></svg></div></li>';

    var checkboxTemplateString =
        '<div class="fc-checkbox" ng-class="{ \'checked\': checked }" ng-click="onClick4changing()"><div class="fc-checkbox__indicator"><svg class="fc-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M913.017 237.02c-25.311-25.312-66.349-25.312-91.66 0l-412.475 412.474-206.237-206.237c-25.312-25.312-66.35-25.312-91.661 0s-25.312 66.35 0 91.66l252.067 252.067c0.729 0.73 1.439 1.402 2.134 2.029 25.434 23.257 64.913 22.585 89.527-2.029l458.303-458.303c25.313-25.312 25.313-66.35 0.001-91.661z"></path></svg></div><div class="fc-checkbox__content" ng-transclude></div></div>';

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

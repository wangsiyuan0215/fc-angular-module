'use strict';

/*!
 * flash-components v1.3.2
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
    if (_major >= 2)
        throw new Error('VersionError: please ensure that the version of angular.js is "1.x.x" .');

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

    var currentVersion = '1.3.2';

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
                throw new ReferenceError(
                    '$fc: __getOption ->' + scope + 'in context is undefined.'
                );
            if (angular.isUndefined(key)) return scope;
            return scope[key];
        }

        function __setOption(scope, key, value) {
            if (angular.isUndefined(scope))
                throw new ReferenceError(
                    '$fc: __setOption ->' + scope + 'in context is undefined.'
                );
            if (angular.isUndefined(key))
                throw new ReferenceError('$fc: __setOption -> param:key is required.');
            scope[key] = value;
        }

        var _self = this,
            _toast = { duration: 2000 },
            _validationRegExp = {},
            _httpOptions = {
                headers: {},
                successCreator: __creator(true),
                errorCreator: __creator(false),
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
                    _httpOptions[index] = !!value
                        ? angular.merge(_httpOptions[index], value)
                        : undefined;
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
            ['$rootScope', '$timeout', '$fcModalConfig'].concat(function(
                $rootScope,
                $timeout,
                $config
            ) {
                var __timer = null;
                return {
                    show: function(id, cb) {
                        invariant(
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
                        invariant(
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
                            __hasHiddenInBody =
                                window.getComputedStyle($__body).overflow === 'hidden',
                            __id = attrs.id || null;

                        invariant(__id, "Error: property 'id' is required in fc-modal.");
                        invariant(
                            __id !== '' && __id !== null,
                            "Error: property 'id' is empty in fc-modal."
                        );
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
                                            $__modalBox.className +=
                                                ' ' + $config.classNames.boxActive;
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
                                                new RegExp(
                                                    '\\ ' + $config.classNames.modalActive,
                                                    'g'
                                                ),
                                                ''
                                            );
                                            $__body.className = __hasHiddenInBody
                                                ? $__body.className
                                                : $__body.className.replace(
                                                      new RegExp(
                                                          '\\ ' + $config.classNames.bodyHidden,
                                                          'g'
                                                      ),
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
     * fc 之 toast 组件，使用方法：
     *      html files
     *          <fc-toast/>
     *      js file
     *          dependence: fcModule
     *          injector: $fc.toast
     *          controller: $toast[error|info|success|trigger|abort]
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
                                                rules[prop].validate.length ===
                                                    rules[prop].errorMessage.length,
                                                '$fc.validation: rules.%s.errorMessage should be same with validate in length.',
                                                prop
                                            );

                                            angular.forEach(rules[prop].validate, function(
                                                f,
                                                index
                                            ) {
                                                invariant(
                                                    angular.isFunction(f),
                                                    '$fc.validation: rules.%s.validate[%s] is not a Function.',
                                                    prop,
                                                    index
                                                );
                                                if (!f(currentProp))
                                                    errorResult = _setError(
                                                        true,
                                                        rules[prop].errorMessage[index]
                                                    );
                                            });
                                            break;
                                        default:
                                            invariant(
                                                false,
                                                '$fc.validation: [validate] is just allowed to be Function or Array type.'
                                            );
                                    }
                                }
                                if (
                                    rules[prop].isRequired &&
                                    (currentProp === '' || currentProp === null)
                                ) {
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
    angular.module('fc.request', ['fc.provider']).service(
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
                        if (startTime && Date.now() - startTime > _optionsNew.timeout) {
                            return $q.reject(
                                angular.merge({}, { timeout: true }, _optionsNew.errorCreator())
                            );
                        }
                        return $q.reject(_optionsNew.errorCreator(error.data || {}));
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
                    format = format.replace(
                        RegExp.$1,
                        ('' + _date.getFullYear()).slice(-RegExp.$1.length)
                    );
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
                return (
                    ($route.routes[$location.path()] && $route.routes[$location.path()].config) ||
                    false
                );
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
                                'undefined' === typeof _currentRouteConfig.back
                                    ? true
                                    : !!_currentRouteConfig.back;
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
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAcCAYAAABh2p9gAAAAAXNSR0IArs4c6QAAANBJREFUSA2tlsEKwkAMRIt/KYIoQkEQBEEQCv1yq2YOcwkbIcMMhF42b5Nukt1p0rQPt3fYN9mq4A4FbFFgx3DawnJkLwV2LmBPBXYJp09YjuyhwOYCdldg1wJ2U2BwyikibWzSFtIZwZB+W/jRIxgOpi2UQIah7lAybaE4RzAUc1tomwxDr6LN2lrDYwTDAGhr98cDm8iypsworIdCaFU2Jy5QvtbCZgDW1iPUOhwItY4vQq0DllDrFUCo9ZIiFJPHdo0Sigk0ejWgfWWVT5EfkfOd0pVG+scAAAAASUVORK5CYII=';
    var bottomLogoBase64 =
        'data:image/png;base64,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';
    var headerTemplateString =
        '<div class="fc-header" ng-cloak ng-if="!!showHeader"><div class="fc-header__left" ng-if="back" ng-click="goBack()"><img src="' +
        arrowLeftIconBase64 +
        '" alt=""></div><div class="fc-header__title" ng-bind="title">Loading...</div></div>';
    var containerTemplateString =
        '<section class="fc-container"><div class="fc-container__inner" ng-transclude></div><div ng-if="!!showFooter" class="fc-container__footer"><img ng-src="{{image}}" alt=""></div></section>';

    angular.module('fc', [
        'fc.modal',
        'fc.toast',
        'fc.loading',
        'fc.request',
        'fc.helpers',
        'fc.provider',
        'fc.container',
        'fc.validation'
    ]);
    console.log('fc-v' + currentVersion + '...done!');
})(window.angular);

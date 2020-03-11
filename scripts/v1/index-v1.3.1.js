'use strict';

/*!
 * flash-components v1.3.1
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

    console.log('fc...done!');

    var arrowLeftIconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAcCAYAAABh2p9gAAAAAXNSR0IArs4c6QAAANBJREFUSA2tlsEKwkAMRIt/KYIoQkEQBEEQCv1yq2YOcwkbIcMMhF42b5Nukt1p0rQPt3fYN9mq4A4FbFFgx3DawnJkLwV2LmBPBXYJp09YjuyhwOYCdldg1wJ2U2BwyikibWzSFtIZwZB+W/jRIxgOpi2UQIah7lAybaE4RzAUc1tomwxDr6LN2lrDYwTDAGhr98cDm8iypsworIdCaFU2Jy5QvtbCZgDW1iPUOhwItY4vQq0DllDrFUCo9ZIiFJPHdo0Sigk0ejWgfWWVT5EfkfOd0pVG+scAAAAASUVORK5CYII=';

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
                        if (!id)
                            throw new Error(
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
                        if (!id)
                            throw new Error(
                                "Error: param 'id' is required for method hide of fcModal in fc."
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

                        if (!__id) throw new Error("Error: property 'id' is required in fc-modal.");
                        if (__id === '' || __id === null)
                            throw new Error("Error: property 'id' is empty in fc-modal.");

                        scope._ids = !scope._ids ? [] : scope._ids;
                        if (scope._ids.indexOf(__id) !== -1) {
                            throw new Error(
                                "Error: property 'id' is unique but " +
                                    __id +
                                    ' is duplicated in fc-modal.'
                            );
                        }
                        scope._ids.push(__id);

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
                                    if (scope._ids.indexOf(data.id) === -1)
                                        throw new Error(
                                            'Error: the modal ' +
                                                data.id +
                                                ' for showing is not found.'
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
                                    if (scope._ids.indexOf(data.id) === -1)
                                        throw new Error(
                                            'Error: the modal ' +
                                                data.id +
                                                ' for hiding is not found.'
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
                        if (!angular.isArray(props))
                            throw new TypeError(
                                '$fc.validation: props must be Array:[prop1, prop2, ...] type.'
                            );
                        if (!angular.isObject(rules) || angular.isArray(rules))
                            throw new TypeError(
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

                                if (angular.isUndefined(currentProp))
                                    throw new ReferenceError(
                                        '$fc.validation: context.' + prop + ' is undefined.'
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
                                            if (!angular.isArray(rules[prop].errorMessage))
                                                throw new TypeError(
                                                    '$fc.validation: rules.' +
                                                        prop +
                                                        '.errorMessage should be same with validate:Array in type.'
                                                );

                                            if (
                                                rules[prop].validate.length !==
                                                rules[prop].errorMessage.length
                                            )
                                                throw new Error(
                                                    '$fc.validation: rules.' +
                                                        prop +
                                                        '.errorMessage should be same with validate in length.'
                                                );

                                            angular.forEach(rules[prop].validate, function(
                                                f,
                                                index
                                            ) {
                                                if (!angular.isFunction(f))
                                                    throw new TypeError(
                                                        '$fc.validation: rules.' +
                                                            prop +
                                                            '.validate[' +
                                                            index +
                                                            '] is not a Function.'
                                                    );
                                                if (!f(currentProp))
                                                    errorResult = _setError(
                                                        true,
                                                        rules[prop].errorMessage[index]
                                                    );
                                            });
                                            break;
                                        default:
                                            throw new TypeError(
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

    angular.module('fc.header', ['ngRoute'])
        .directive('fcHeader', [
            '$route',
            '$location',
            function($route, $location) {
                var __getRouteConfig = function() {
                    return (
                        ($route.routes[$location.path()] && $route.routes[$location.path()].config) ||
                        false
                    );
                };
                
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        
                    },
                    link: function($scope) {
                        $scope.$on('$locationChangeStart', function() {
                            var currentRouteConfig = __getRouteConfig();
                            if (!currentRouteConfig) return ($scope.header = false);
    
                            $scope.header = {
                                back:
                                    'undefined' === typeof currentRouteConfig.back
                                        ? true
                                        : !!currentRouteConfig.back,
                                cancel: currentRouteConfig.cancel || false,
                                title: currentRouteConfig.title || 'Loading...'
                            };
                        });
                        $scope.goBack = function() {
                            !$scope.header.cancel && window.history.back();
                        };
                    },
                    template:
                        '<div class="header" ng-cloak ng-if="!!header">\n' +
                        '    <div class="header__left" ng-if="header.back" ng-click="goBack()">\n' +
                        '                <img src="' + arrowLeftIconBase64 + '" alt="">\n' +
                        '            </div>\n' +
                        '            <div class="header__title" ng-bind="header.title">Loading...</div>\n' +
                        '        </div>'
                };
            }
        ]);

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

    angular.module('fc', [
        'fc.provider',
        'fc.loading',
        'fc.modal',
        'fc.toast',
        'fc.validation',
        'fc.request'
    ]);
})(window.angular);

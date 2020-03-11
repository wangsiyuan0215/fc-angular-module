/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 2:32 PM
 * @Description: fc.provider
 */

(function(_) {
    /**
     * fc 之 自定义 provider
     * 提供各个组件的自定义 provider，以便可以在 config 中直接设置对应组件的初始配置
     */
    _.angular.module('fc').provider('$fc', function __$fcProvider__() {
        function __creator(isSuccess) {
            return function(payload) {
                return {
                    success: isSuccess,
                    payload: payload
                };
            };
        }

        function __getOption(scope, key) {
            if (_.angular.isUndefined(scope))
                throw new ReferenceError(
                    '$fc: __getOption ->' + scope + 'in context is undefined.'
                );
            if (_.angular.isUndefined(key)) return scope;
            return scope[key];
        }

        function __setOption(scope, key, value) {
            if (_.angular.isUndefined(scope))
                throw new ReferenceError(
                    '$fc: __setOption ->' + scope + 'in context is undefined.'
                );
            if (_.angular.isUndefined(key))
                throw new ReferenceError('$fc: __setOption -> param:key is required.');
            scope[key] = value;
        }

        var _self = this,
            _toast = { duration: 2500 },
            _validationRegExp = {},
            _httpOptions = {
                headers: {},
                successCreator: __creator(true),
                errorCreator: __creator(false),
                errorHandler: _.FC.noop,
                timeout: 5000,
                withCredentials: true
            };

        this.http = {
            __getOptions: function(key) {
                return __getOption(_httpOptions, key);
            },
            setOptions: function(options) {
                _httpOptions = _.angular.merge(_httpOptions, options);
            }
        };

        _.angular.forEach(_httpOptions, function(item, index) {
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
                        ? _.angular.merge(_httpOptions[index], value)
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
})(window);

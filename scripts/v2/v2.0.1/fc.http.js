/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:52 PM
 * @Description: fc.http
 */
(function(_) {
    _.angular.module('fc').service(
        '$fc.http',
        ['$http', '$q', '$fc'].concat(function($http, $q, $fc) {
            var __methodsEnumNormal = ['GET', 'DELETE', 'HEAD', 'POST', 'PUT', 'PATCH'],
                _options = $fc.http.__getOptions();

            function __http(method, url, params, options, startTime) {
                var _optionsNew = _.angular.merge({}, _options, options || {}),
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
})(window);

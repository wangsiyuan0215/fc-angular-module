/*
 * @Author: siyuan.wang
 * @Date: 2020/3/11 4:52 PM
 * @Description: fc.validation
 */
(function(_) {
    _.angular
        .module('fc')
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
                        isError: !_.angular.isUndefined(isError) ? isError : false,
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

                        _.FC.invariant(
                            _.angular.isArray(props),
                            '$fc.validation: props must be Array:[prop1, prop2, ...] type.'
                        );

                        _.FC.invariant(
                            _.angular.isObject(rules) && !_.angular.isArray(rules),
                            '$fc.validation: rules must be Object:{ prop: Object } type.'
                        );

                        _.angular.forEach([].concat(props).reverse(), function(prop) {
                            if (typeof prop === 'string' && prop in rules) {
                                var currentProp = context,
                                    _propPath = prop.split('.');

                                _.angular.forEach(_propPath, function(path) {
                                    if (_.angular.isUndefined(currentProp)) return false;
                                    currentProp = currentProp[path];
                                });

                                _.FC.invariant(
                                    !_.angular.isUndefined(currentProp),
                                    '$fc.validation: context.%s is undefined.',
                                    prop
                                );

                                if (rules[prop].validate) {
                                    switch (_getObjectType(rules[prop].validate)) {
                                        case '[object Function]':
                                            if (!rules[prop].validate(currentProp)) {
                                                errorResult = _setError(
                                                    true,
                                                    _.angular.isArray(rules[prop].errorMessage)
                                                        ? rules[prop].errorMessage[0]
                                                        : rules[prop].errorMessage
                                                );
                                            }
                                            break;
                                        case '[object Array]':
                                            _.FC.invariant(
                                                _.angular.isArray(rules[prop].errorMessage),
                                                '$fc.validation: rules.%s.errorMessage should be same with validate:Array in type.',
                                                prop
                                            );
                                            _.FC.invariant(
                                                rules[prop].validate.length ===
                                                    rules[prop].errorMessage.length,
                                                '$fc.validation: rules.%s.errorMessage should be same with validate in length.',
                                                prop
                                            );

                                            _.angular.forEach(rules[prop].validate, function(
                                                f,
                                                index
                                            ) {
                                                _.FC.invariant(
                                                    _.angular.isFunction(f),
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
                                            _.FC.invariant(
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
})(window);

/*
 * @Author: siyuan.wang
 * @Date: 2020/3/9 4:12 PM
 * @Description: fc.core
 */

(function(_) {
    _.FC = {};

    function template(format) {
        var index = 0,
            arg4parent = arguments;

        return format.replace(/%s/g, function() {
            return arg4parent[++index];
        });
    }

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
    
    _.FC.noop = function() {};
    _.FC.version = 'v<%= version %>';
    _.FC.template = template;
    _.FC.invariant = invariant;
    _.FC.module = _.angular.module('fc', []);
    
    console.log(_.FC.template('🎉🎉 Current `FC` module\'s version is %s. 🎉🎉', _.FC.version));
})(window);

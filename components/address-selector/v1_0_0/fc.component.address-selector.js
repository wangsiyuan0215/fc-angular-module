/*
 * @Author: SiYuan Wang
 * @Date: 2020-02-17 09:56:25
 * @Description: fc.component.address-selector
 */

(function(_) {
    'use strict';

    _.angular
        .module('fc.component.address-selector', [])
        .constant('$addressConfig', {
            unit: 'px',
            tabItemSelector: '.tabs__item'
        })
        .component('fcAddressSelector', {
            bindings: {
                // props
                data: '<',
                initialLocation: '<',
                // methods
                onClick: '&'
            },
            replace: true,
            template:
                '<div class="fc-as-tabs">' +
                '<div class="tabs__item" ng-repeat="item in as.location" ng-click="as.chooseThisInTabs($event, $index)">' +
                '{{item.name}}' +
                '</div>' +
                '<div class="tabs__item tabs__last" ng-show="as.location.length < as.data.length" ng-click="as.chooseThisInTabs($event, as.location.length)">' +
                '请选择</div>' +
                '<div class="tab__line" ng-style="{ width: as.currentLineStyle.width, left: as.currentLineStyle.left }"></div>' +
                '</div>' +
                '<div class="fc-as-panels">' +
                "<div class=\"panel__inner\" ng-style=\"{width: as.data.length * as.viewportWidth + 'px',transform: 'translateX(' + (as.nextLocationIndex * as.viewportWidth) * -1 + 'px)'}\">" +
                '<div class="panel__item" ng-style="{ width: 100 / as.data.length + \'%\' }" ng-repeat="(index, item) in as.data">' +
                "<div class=\"panel__itemInner\" ng-style=\"{ 'overflow-y': index !== as.nextLocationIndex ? 'hidden' : 'auto' }\">" +
                '<ul><li ng-repeat="i in item track by i.id" ng-class="{ checked: as.location[index].id === i.id }" ng-click="as.chooseThisItemInPanel(i, index)">{{i.name}}</li></ul>' +
                '</div></div></div></div>',
            controllerAs: 'as',
            controller: [
                '$scope',
                '$timeout',
                '$addressConfig',
                function($scope, $timeout, $config) {
                    var asCtrl = this,
                        $window = _.angular.element(_),
                        /* eslint no-use-before-define: ["off"] */
                        viewportWidth =
                            _.innerWidth || _.document.documentElement.clientWidth || _.document.body.clientWidth;

                    /**
                     * 获取所有 tab items 元素并转化为数组
                     * @returns {T[]}
                     * @private
                     */
                    function __getAllTabs() {
                        return Array.prototype.slice.call(document.querySelectorAll($config.tabItemSelector), 0);
                    }
                    /**
                     * 设置 line 宽度
                     * @param element
                     * @returns {string}
                     * @private
                     */
                    function __setWidth(element) {
                        return _.getComputedStyle(element).width;
                    }

                    /**
                     * 设置 line 与父元素的左边的距离
                     * @param element
                     * @returns {string}
                     * @private
                     */
                    function __setLeft(element) {
                        return element.offsetLeft + $config.unit;
                    }

                    /**
                     * 监听窗口布局 resize 时执行的函数，调整 panel__inner 的宽度与滚动距离
                     */
                    function __resize() {
                        asCtrl.viewportWidth =
                            _.innerWidth || _.document.documentElement.clientWidth || _.document.body.clientWidth;
                    }

                    /**
                     * 设置 line 的样式
                     * @param target
                     * @returns {{left: string, width: string}}
                     * @private
                     */
                    function __setLineStyle(target) {
                        return {
                            left: __setLeft(target),
                            width: __setWidth(target)
                        };
                    }

                    /**
                     * 点击 tab item 后执行的逻辑的函数
                     * @param event
                     * @param index
                     * @returns {boolean}
                     * @private
                     */
                    function __chooseThisInTabs(event, index) {
                        if (index === asCtrl.nextLocationIndex) return false;

                        asCtrl.nextLocationIndex = index;
                        asCtrl.currentLineStyle = __setLineStyle(event.target);
                    }

                    /**
                     * 点击某一个 panel 中的列表项时执行的逻辑的函数
                     * @param item
                     * @param index
                     * @private
                     */
                    function __chooseThisItemInPanel(item, index) {
                        if (
                            !!asCtrl.location[asCtrl.nextLocationIndex] &&
                            item.id !== asCtrl.location[asCtrl.nextLocationIndex].id
                        ) {
                            asCtrl.location.length = index + 1;
                        }

                        asCtrl.currentIndex = index;
                        asCtrl.location[index] = item;
                        asCtrl.location.length = index + 1;

                        'function' === typeof asCtrl.onClick && asCtrl.onClick({ location: asCtrl.location });
                    }

                    /**
                     * 父组件传递的 props 值改变时执行 onChanges 函数钩子
                     *
                     * 由于是浅比较，因此仅在组件初始化的时候执行一次
                     *
                     * @param value
                     */
                    asCtrl.$onChanges = function(value) {
                        if ('data' in value) {
                            var newData = value.data.currentValue;
                            asCtrl.max = _.angular.isArray(newData) ? newData.length : 0;
                            asCtrl.data = _.angular.isArray(newData) ? newData : [];
                        }

                        if ('initialLocation' in value) {
                            asCtrl.location = value.initialLocation.currentValue;
                        }
                    };
                    asCtrl.$onInit = function() {
                        $window.on('resize', __resize);
                    };
                    /**
                     * 组件内部所有元素均挂载与渲染后执行的钩子
                     *
                     * 但是需要注意的是，带有控制元素的 ng-repeat 之类的指令尚未执行
                     * 因此无法操作此类元素节点
                     *
                     * @returns {boolean}
                     */
                    asCtrl.$postLink = function() {
                        asCtrl.nextLocationIndex = (asCtrl.location.length && asCtrl.location.length - 1) || 0;

                        if (asCtrl.location.length) {
                            $timeout(function() {
                                asCtrl.currentLineStyle = __setLineStyle(__getAllTabs()[asCtrl.location.length - 1]);
                            }, 0);

                            return false;
                        }

                        asCtrl.currentLineStyle = __setLineStyle(document.querySelector('.tabs__last'));
                    };

                    asCtrl.$onDestroy = function _onDestroy() {
                        $window.off('resize', __resize);
                    };

                    _.angular.extend(asCtrl, {
                        max: 0,
                        data: [],
                        location: [],
                        nextLocationIndex: 0,
                        viewportWidth: viewportWidth,
                        currentLineStyle: { left: 0, width: 0 },
                        chooseThisInTabs: __chooseThisInTabs,
                        chooseThisItemInPanel: __chooseThisItemInPanel
                    });

                    $scope.$watchCollection(
                        'as.data',
                        function(newValue) {
                            asCtrl.max = _.angular.isArray(newValue) ? newValue.length : 0;
                            asCtrl.data = _.angular.isArray(newValue) ? newValue : [];

                            if (!asCtrl.data.length) {
                                asCtrl.nextLocationIndex = 0;
                                /* eslint no-undefined: ["off"] */
                                asCtrl.currentIndex = undefined;
                                return false;
                            }

                            $timeout(function() {
                                var $tabs = __getAllTabs(),
                                    $lastTab = $tabs.slice(-1)[0];
                                
                                asCtrl.currentIndex =
                                    Math.max(asCtrl.location.length - 1, 0);

                                var _currentTab = asCtrl.location[asCtrl.currentIndex + 1]
                                    ? $tabs[asCtrl.currentIndex + 1]
                                    : asCtrl.currentIndex + 1 === asCtrl.max
                                        ? $tabs[asCtrl.currentIndex]
                                        : $lastTab;

                                asCtrl.nextLocationIndex =
                                    asCtrl.currentIndex + 1 >= asCtrl.max
                                        ? asCtrl.currentIndex
                                        : asCtrl.currentIndex + 1;
                                asCtrl.currentLineStyle = __setLineStyle(_currentTab);
                            }, 0);
                        },
                        true
                    );
                }
            ]
        });
})(window);

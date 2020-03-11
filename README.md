# fc-angular-module@1.5.3

## 一、前提

**基于 `angular js@1.5+`，在引用前请明确版本号！**

**基于 `angular js@1.5+` ，在引用前请明确版本号！**

**基于 `angular js@1.5+` ，在引用前请明确版本号！**

指令以及组件的声明（`E|C|M|A` ）和引用模块是以 `fc-` 开头，比如：

```html
<!-- 指令的 Element 模式 -->
<fc-toast></fc-toast>

<!-- 指令的 Attribute 模式 -->
<div fc-loading="loading">Hello World!</div>
```

😄 如在使用过程中发现问题，欢迎 issue：[传送门](https://manager.ihrss.neusoft.com:7002/siyuan/fc-angular-module/issues/new)。

## 二、安装方法

本组件库目前仅支持传统的基于 script 标签的引入方式，暂不支持 ES Module 和 require.js。

**当前线上获取地址的前缀是 `https://h5.ihrss.neusoft.com/ihrss/source-libs/yx/release/`**。

主要分为两个文件，基础样式文件（.min.css）和脚本文件（.min.js），**样式文件需要置于 head 标签内，并将其放置于其他三方库的样式文件下，项目业务样式文件上的位置（防止被三方样式进行篡改，由于样式类名中带了 fc- 前缀，被篡改的可能性较小）。**

**脚本文件则需要确保该脚本的执行是在 `angular` 执行之后（即使使用 defer 异步下载）。**

```html
<!-- in index.html or entry html file -->
<!-- version 表示引入组件库的版本 -->

<!-- head -->
<link rel="stylesheet" href="https://h5.ihrss.neusoft.com/ihrss/fc/yx/release/fc-v{version}.min.css" />

<!-- body -->
<script src="https://h5.ihrss.neusoft.com/ihrss/source-libs/yx/release/scripts/fc-v{version}.min.js"></script>
```

在项目的入口文件（`main.js`）中，请将 `fc` 作主模块的依赖，如下：

```javascript
// in main.js or any main javascript file

// 请注意，无关顺序。
angular.module('appModule', ['fc', 'module1', 'module2']).controller(/*
       ...
   */);
```

## 三、全局配置

本组件库提供了基本的配置 provider —— \$fcProvider，用于在项目 config 阶段对 fc module 进行全局配置。
使用方式：

```javascript
angular.module('appModule', ['fc']).config([
    '$fcProvider',
    function($fcp) {
        // ...
    }
]);
```

目前提供了三个 directives 和 services 的配置接口， **如果有任何定制化的需求，请使用「**[传送门](https://manager.ihrss.neusoft.com:7002/siyuan/fc-angular-module/issues/new)**」** 。

### 1. Http - `$fcProvider.http`

Http service 的可配置项如下：

```javascript
function __creator(isSuccess) {
    return function(payload) {
        return {
            success: isSuccess,
            payload: payload
        };
    };
}

httpOptions = {
    // 请求的头部信息
    headers: {},
    // 请求成功数据返回格式处理
    successCreator: __creator(true),
    // 错误返回格式处理
    errorCreator: __creator(false),
    // 全局的错误处理
    errorHandler: noop,
    // 超时时间
    timeout: 5000,
    // 是否允许携带 cookie
    withCredentials: true
};
```

以上配置项均提供 set 和 get 方法，比如： `setHeaders` 和 `getHeaders` 等，具体方法如下：

#### 1.1. `getHeaders: Object`

#### 1.2. `setHeaders(header: Object)`

需要注意的是，如果需要配置 http 的 header ，需要先获取原 header 后再将需要新增的 header 项与原 header 合并，再调用 setHeaders 配置 http 的新的 header，相关代码如下：

```javascript
angular.module('appModule', ['fc']).config([
    '$fcProvider',
    function($fcp) {
        $fcp.http.setHeaders(
            // 通过 angular.extend 进行数据合并
            angular.merge({}, $fcp.http.getHeaders(), {
                'Content-Type': 'multipart/form-data'
            })
        );
    }
]);
```

#### 1.3. `getSuccessCreator: Function` 和 `getErrorCreator: Function`

#### 1.4. `setSuccessCreator(callback: Function(payload: Response))` 和 `setSuccessCreator(callback: Function(payload: Response))`

对请求返回成功/失败后的数据格式进行处理，若没有调用该方法，默认的错误处理方法返回的格式为：

```javascript
// 默认返回的数据格式
return {
    success: true,
    // 接口返回的数据会被赋在 payload 属性中
    payload: {
        ...response.data
    }
};
```

若想要设置需要注意的是， `callback`  的参数表示接口实际返回的数据；

#### 1.5. `getErrorHandler: Function`

#### 1.6. `setErrorHandler(callback: Function(error: Error))`

对请求异常或失败时，捕获由 \$http promise 的 catch 或者 then 中抛出的异常的全局处理，如果配置了 errorCreator，则 callback 的参数 error 需要根据 errorCreator 返回的格式来处理。

```javascript
angular.module('appModule', ['fc']).config([
    '$fcProvider',
    function($fcp) {
        $fcp.http.setErrorHandler(function(error) {
            if (error.success) return false;

            var payload = error.payload || {};
            var errorMessage = (payload.status && $lang.errorMessages.network[payload.status]) || false;
            errorMessage && $ftp.$get().error(errorMessage);
        });
    }
]);
```

#### 1.7. `getTimeout: Number`

#### 1.8. `setTimeout(timeout: Number)`

设定请求的超时时间，以毫秒为单位；

```javascript
angular.module('appModule', ['fc']).config([
    '$fcProvider',
    function($fcp) {
        $fcp.http.setTimeout(10000);
    }
]);
```

如果请求超时，异常的数据格式会以  `errorCreator`  执行的结果为准，如不设置 errorCreator 默认会返回：

```javascript
{
  	success: false,
		payload: {
				status: -99,
				statusText: 'TIMEOUT'
		}
}
```

#### 1.9. `getWithCredentials: Boolean`

#### 1.10. `setWithCredentials(credentials: Boolean)`

设定请求时是否允许携带 `cookie`，其参数类型为 `Boolean` 类型，默认为 `true`；

```javascript
angular.module('appModule', ['fc']).config([
    '$fcProvider',
    function($fcp) {
        // 如 false，则不允许携带 cookie 信息
        $fcp.http.setWithCredentials(false);
    }
]);
```

---

### 2. Toast - `$fcProvider.toast`

Toast directive 的可配置项如下：

```javascript
toast = {
    // toast 显示时长
    duration: 2500
};
```

以上配置项均提供 set 和 get 方法，比如： `setDuration` 和 `__getDuration`。

#### 2.1. `__getDuration: number`

#### 2.2. `setDuration(duration: number)`

---

### 3. Validation - `$fcProvider.validation`

Validation service 为了减少硬编码带来的效率损耗，提供了 regs 属性用于正则表达式的存取，_具备“一处配置，处处使用”的方便性_，相关的配置如下：

```javascript
// 预设了手机号码和银行卡号的验证正则
regs = {
		mobile: /0?(13|14|15|17|18|19)[0-9]{9}/),
		bankCardNo: /^([1-9])(\d{15}|\d{18})$/
}
```

具体使用方法见下文，这里如何存储正则表达式，即 `setRegExp` 的使用方法。

#### 3.1. `setRegExp(key: String, regExp: RegExp)`

```javascript
angular.module('appModule', ['fc']).config([
    '$fcProvider',
    function($fcp) {
        $fcp.validation.setRegExp('chineseName', /^[\u4E00-\u9FA5\uF900-\uFA2D]+$/);
        /* .... */
    }
]);
```

## 四、指令

### 4.1. Modal - `fc-modal`

在 HTML 中引用该组件有两种方式：

-  第一种是在 body 内部的下方引用 `<fc-modal></fc-modal>` 标签，**这种方式会导致在 modal 内部的 scope 参数无法追溯到 controller，因此可能需要使用 `rootScope` 或广播 `$boradcast`** **进行数据传播；**
-  第二种是在 pages 中的 template 中引用 `<fc-modal></fc-modal>` 标签；

以上两种方式均需要注意：**`<fc-modal></fc-modal>` 标签中必须设定 id 属性，否则调用相应方法时无法找到确切的 modal 对象**；

#### 4.1.1. 使用方法

```html
<!-- index.html -->
<!-- property "id" in tag fc-modal is required and unique. -->
<fc-modal id="uniqueId">
    <div class="class1">
        <div class="class1-1">
            <!-- ... -->
        </div>
    </div>
    <div class="class2">
        <!-- ... -->
    </div>
    <div class="class3">
        <!-- ... -->
    </div>
</fc-modal>
```

```javascript
angualr /* ... */
    .contoller('demoController', [
        '$fc.modal',
        function($modal) {
            // 显示 modal
            $modal.show('uniqueId');
            // 隐藏 modal
            $modal.hide('uniqueId');
        }
    ]);
```

#### 4.1.1. 属性

| 属性 | 说明                                   | 类型   | 默认值 |
| ---- | -------------------------------------- | ------ | ------ |
| id   | modal 的唯一标识，显示与隐藏的依赖标识 | string | -      |

#### 4.1.2. 方法

| 方法名 | 说明                     | 参数及其类型                             | 返回类型 |
| ------ | ------------------------ | ---------------------------------------- | -------- |
| show   | 根据 id 显示对应的 modal | id: String, callback? Function() => void | void     |
| hide   | 根据 id 隐藏对应的 modal | id: String, callback? Function() => void | void     |

---

### 4.2. Toast - `fc.toast`

全局展示操作反馈信息。

#### 4.2.1. 使用方法

该组件需要在 `<body></body>` 内声明且仅需要声明一次即可：

```html
<body>
    <!-- other HTML -->
    <fc-toast></fc-toast>
    <!-- // .... -->
</body>
```

```javascript
angualr /* ... */
    .controller(
        'demoController',
        ['$fc.toast'].concat(function($toast) {
            // 终止 toast 显示（立刻隐藏）
            $toast.abort();

            // => trigger
            $toast.trigger(toast.types.ERROR, 'this is a toast!');
            // 以 ERROR 的样式弹出 3s，并显示消息 this is a toast!
            $toast.trigger(toast.types.ERROR, 'this is a toast!', 3000);

            // => type info
            $toast.info('this is a info toast!');
            $toast.info('this is a info toast!', 3000);

            // => type error
            $toast.error('this is a error toast!');
            $toast.error('this is a error toast!', 3000);

            // => type success
            $toast.success('this is a successful toast!', 3000);
            $toast.success('this is a successful toast!');
        })
    );
```

#### 4.2.2. 方法

组件提供了一些静态方法，使用方式和参数如下：

-   `$toast.info(content, [duration])`
-   `$toast.error(content, [duration])`
-   `$toast.success(content, [duration])`

| 方法名  | 说明                            | 参数及其类型                       | 返回类型 |
| ------- | ------------------------------- | ---------------------------------- | -------- |
| abort   | 立刻终止 toast 的显示           | -                                  | void     |
| info    | 以 types.INFO 类型展示 toast    | content: String, duration?: Number | void     |
| error   | 以 types.ERROR 类型展示 toast   | content: String, duration?: Number | void     |
| success | 以 types.SUCCESS 类型展示 toast | content: String, duration?: Number | void     |

**`duration` 参数默认为 2.5s，且参数单位为毫秒。**

#### 4.2.3. FAQ

##### Q1. 如何在 angular 的 config 阶段使用 toast？

**A1.** 如果需要在 config 阶段使用 `$fc.toast`，由于 config 阶段只能注入 provider，因此可以使用 `$fc.toastProvider` 的 `$get()` 方法获取相应的 toast 方法;

```javascript
angualr/* ... */
		.config('$fc.toastProvider'].concat(function ($ftp) {
    		$ftp.$get().success('this is a toast!', 3000);
   	}));
```

---

### 4.3. Header - `fc.header`

顶部导航条，依赖 `ngRoute`，用于移动端显示当前路由对应的 title（浏览器的 title 或者自定义 title）、后退、关闭功能；该组件的 config 需要嵌入在具体项目中的路由配置中；

#### 4.3.1. 使用方法

```html
<!-- so easy -->
<fc-header></fc-header>
```

```javascript
fc.config.js
fc.config.js /* ... */
    .config([
        '$routeProvider',
        function($rp) {
            $rp.when('/home', {
                templateUrl: 'html/pages/home.html',
                config: {
                    // 当前路由下是否显示 header 组件
                    show: true,
                    // 是否显示后退箭头
                    back: true,
                    // 点击后退箭头时是否执行 onCancel 回调
                    // 若 cancel = true 时将不会执行 go back，而执行 onCancel
                    cancel: true,
                    // 当前页面的 title
                    name: $lang.headers.home,
                    // 当 cancel === true 时，执行的方法
                    onCancel: $routerProvider.$get().close,
                    // 执行 go back 后的回调
                    onBack: function() {
                        console.log('onBack');
                    }
                }
            });
        }
    ]);
```

#### 4.3.2. 配置

| 配置项   | 说明                                                                                                                                            | 类型     | 默认值       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ |
| show     | 当前路由下是否显示 header 组件，false 为不显示                                                                                                  | Boolean  | true         |
| back     | 左上角按钮是否显示后退                                                                                                                          | Boolean  | true         |
| cancel   | 左上角按钮是否显示关闭                                                                                                                          | Boolean  | false        |
| name     | 当前路由对应展示的标题                                                                                                                          | String   | 'Loading...' |
| onBack   | 用户点击后退按钮时触发，于路由后退动作之前执行，需要注意的是，如果配置了 onBack，那么 back = true                                               | Function | noop         |
| onCancel | 用户点击关闭按钮时触发，需要注意的是，如果配置了 onCancel，那么 cancel = true 且优先级高于 back（即 back 与 cancel 同为 true，会执行 onCancel） | Function | noop         |

---

### 4.4. Container - `fc.container`

外层容器，内部支持滚动，封装了底部 logo。组件高度根据外层父元素的高度而定，因此使用本组件需要对外层父元素设定 CSS 的 hegiht 属性。
内部采用 flex 布局，且 `flex-direction: column`。

#### 4.4.1. 使用方法

```css
.container {
    /* ... */
    height: 100vh;
    /* ... */
}
```

```html
<div class="container">
    <fc-container has-footer="false">
        <!-- ... -->
    </fc-container>
</div>
```

####

#### 4.4.2. 属性

| 属性      | 说明                                                        | 类型   | 默认值 |
| --------- | ----------------------------------------------------------- | ------ | ------ |
| image-src | 页脚 logo 的图片资源地址，若为 undefined，则默认不显示 logo | string | -      |

---

### 4.5. Loading - `fc.loading`

用于页面的加载中状态。页面局部处于等待异步数据或正在渲染过程时，合适的加载动效会有效缓解用户的焦虑。

#### 4.5.1. 使用方法

```html
<div fc-loading="loading">Hello Angular!</div>
```

```javascript
angular.controller('demoController', [
    '$scope',
    '$timeout',
    function($scope, $timeout) {
        $scope.loading = true;

        $timeout(function() {
            $scope.loading = false;
        }, 3000);
    }
]);
```

**在 loading 显示时会暂时的将宿主标签的 position 属性改为 relative**，因此对于 position: absolute 的标签，请谨慎使用。如遇上述情况，请将 `fc-loading` 的宿主改为其子元素即可。

---

### 4.6. Item - `fc.item`

通用的移动端的列表项。

#### 4.6.1. 使用方法

```html
<fc-item on-click="onClickHandler()">
    <div class="row">
        <p class="row__key">缴费年度</p>
        <!-- ... -->
    </div>
    <div class="row">
        <p class="row__key">缴费金额</p>
        <!-- ... -->
    </div>
</fc-item>
```

#### 4.6.2. 属性

**本组件内部采用 flex 布局，因此在 `fc-item` 标签的内部 flex 属性方向是 `column`**。

| 属性名   | 说明                         | 类型     | 默认值 |
| -------- | ---------------------------- | -------- | ------ |
| arrow    | 可选，是否显示右侧向右的箭头 | Boolean  | true   |
| on-click | 可选，点击 item 时触发的事件 | Function | noop   |

---

### 4.7. Empty - `fc.empty`

空状态组件，当数据为空时，显式的提示用户。

#### 4.7.1. 使用方法

```html
<fc-empty ng-if="!order.orders.length" message="'暂无缴费订单'"></fc-empty>
```

#### 4.7.2.属性

| 属性名    | 说明                         | 类型   | 默认值     |
| --------- | ---------------------------- | ------ | ---------- |
| title     | 可选，主要显示的信息         | String | 空         |
| message   | 可选，描述                   | String | 空         |
| image-src | 可选，点击 item 时触发的事件 | String | 空占位图片 |

#### 4.7.3. FAQ

##### Q1. 如何在 title 或者 message 中使用自定义的 html 格式的提示？

**A1.** title 和 message 支持 HTML 格式，但是需要自己通过 \$sce 进行转换转换。

```javascript
angular.controller('demo.ctrl', ['$scope', '$sce', function($scope, $sce){
		$scope.title = $sce.trustAsHtml(
		    '「未找到你要访问的页面」<span class="font__highlight--gray">请您检查所访问的路径是否正确</span>'
		);
}]);
```

##### Q2. 如何在无数据时显示组件，在有数据时隐藏组件？

**A2.** 使用 angular 的 ng-if 组件。

### 4.8. Icon - `fc.icon`

语义化的矢量图形组件。

主要对接 iconfont 平台导出的 iconfont.js，具体操作流程如下：

-   首先需要在 iconfont 平台（其他平台亦可）下载需要的图标 svg symbol 集合（iconfont.js)；
-   将 iconfont.js （自定义名称亦可）引入到项目中；

#### 4.8.1. 使用方法

```html
<body>
    <!-- ... -->
    <script defer src="${iconfont_path}/iconfont.js"></script>
    <!-- ... -->
</body>
```

```html
<fc-icon name="close"></fc-icon>
```

#### 4.8.2. 属性

| 属性名 | 说明                   | 类型   | 默认值 |
| ------ | ---------------------- | ------ | ------ |
| name   | SVG 图标的 symbol 名字 | String | -      |

**需要注意的是，SVG 名称需要以 icon- 为前缀。**

---

### 4.9. Checkbox - `fc.checkbox`

多选框。
可用于在一组可选项中进行多项选择时；单独使用可以表示两种状态之间的切换，

#### 4.9.1. 使用方法

如下所示，**是否选中的状态通过组件的属性 checked 控制，如果需要改变选中状态，需要在 on-change 方法中修改 checked4read 变量。**

```html
<fc-checkbox id="read" checked="checked4read" on-change="onclick4checked(id, value)">
    <span class="checkboxes-item__label">是否阅读？</span>
</fc-checkbox>
```

```javascript
$scope.onclick4checked = function(id, value) {
    $scope.id4checked = id;
    $scope.checked4read = value;
};
```

#### 4.9.2. 属性

| 属性名    | 说明                                                                                                                                | 类型                                 | 默认值 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------ |
| id        | 可选，checkbox 的 id                                                                                                                | String                               | -      |
| checked   | 必选，控制 checkbox 的是否选中的状态                                                                                                | Boolean                              | -      |
| on-change | 可选，点击 checkbox 时执行的方法，参数为 id 和 value，id 即设置的 id 属性（若未设置则为 undefiend），value 则为当前选中状态的反状态 | Function(id: String, value: Boolean) | -      |

---

## 五、服务

### 5.1. Http - `fc.http`

基于 `angular` 内置的 `$http` 进行的再一次封装。
具有请求超时、全局错误、返回数据格式化处理等特点；

相关配置已经在「全局配置」中已经说明；

#### 5.1.1. 使用方法

```javascript
angular /* ... */
    .factory('demoFactory', [
        '$fc.http',
        function($http) {
            function fetchInsuranceLevels(methodId) {
                // 返回的 Promise 类型
                return (
                    $http
                        .$post($apis.fetchInsuranceLevels, { insuranceTypeCode: methodId }, {})
                        .then(function(value) {
                            if (value.success) return value.payload;
                            return $q.reject(value);
                        })
                        // 异常返回
                        .catch(function(reason) {
                            return $q.reject(reason);
                        })
                );
            }
        }
    ]);
```

#### 5.1.2. 方法

根据 Restful API 的规范共有 6 种请求方式：

| 方法名 | 说明          | 类型                                      | 参数说明        |
| ------ | ------------- | ----------------------------------------- | --------------- |
| `$get` | 发起 GET 请求 | Function(url, params, options) => Promise | url: 请求地址；params: 请求参数；options：其他配置项（比如 headers）； |
| `$delete` | 发起 DELETE 请求 | Function(url, params, options) => Promise | url: 请求地址；params: 请求参数；options：其他配置项（比如 headers）； |
| `$head` | 发起 HEAD 请求 | Function(url, params, options) => Promise | url: 请求地址；params: 请求参数；options：其他配置项（比如 headers）； |
| `$post` | 发起 POST 请求 | Function(url, params, options) => Promise | url: 请求地址；params: 请求参数；options：其他配置项（比如 headers）； |
| `$put` | 发起 PUT 请求 | Function(url, params, options) => Promise | url: 请求地址；params: 请求参数；options：其他配置项（比如 headers）； |
| `$patch` | 发起 PATCH 请求 | Function(url, params, options) => Promise | url: 请求地址；params: 请求参数；options：其他配置项（比如 headers）； |

需要注意的是：`options` 接口请求配置，包括配置 headers/withCredentials 等等，具体请参考 `angular.$http` 的 [config](https://docs.angularjs.org/api/ng/service/$http#$http-arguments)，**`options` 会与全局 `$fc.provider` 配置的 `httpOptions` 合并**。

---

### 5.2. Validation - `fc.validation`

校验服务，用于在提交表单时，根据规则验证表单项。

#### 5.2.1. 使用方法

```javascript
angular /* ... */
    .controller('demoController', [
        '$fc.validation',
        function($validation) {
            // result: { isError: Boolean, message: String }
            var result = $validation.run(aeCtrl, ['mobile', 'username'], {
                mobile: {
                    isRequired: true,
                    emptyMessage: $lang.errorMessages.addressMobileNull,
                    validate: function(prop) {
                        return $validation.regs.mobile.test(prop);
                    },
                    errorMessage: $lang.errorMessages.addressMobileError
                },
                username: {
                    isRequired: true,
                    emptyMessage: $lang.errorMessages.addressNameNull
                }
            });
        }
    ]);
```

#### 5.2.2. 方法

| 方法名 | 说明     | 类型                                                                                                            | 参数说明                                | 返回说明 |
| ------ | -------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------- |
| run    | 执行校验 | Function(context: Object, props: Array<String>, rules: Object) => Object<{ isError: Boolean, message: String }> | context: 校验项的上下文，比如 \$scope; props: 校验项 key 的数组，校验项的访问路径是相对于 context 的，同时支持多级访问，如 `a.b.c`；rules: 校验规则，`key` 需要对应 `props` 中的项（不要求顺序），具体见下表。 | isError：校验是否异常，若 isError === false 时校验通过；message：若 isError === true 时，对应校验规则中的错误提示信息； |

**rules props**

| 属性名                                                                          | 说明                                                                                 | 类型                              | 参数说明                                    |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------- |
| isRequired                                                                      | 判定 prop 不能为空                                                                   | Boolean                           | -                                           |
| emptyMessage                                                                    | 若为空时，提示的信息，若 isRequired = true 时，必选                                  | String                            | -                                           |
| validate                                                                        | 验证条件单一时，可设置此属性                                                         | Function(prop: String) => Boolean | 参数 prop：对应 context[key of prop] 的值； |
| 返回值：其内部必须 return，如果为 true 则表示验证通过，如为 false，表示验证失败 |
| errorMessage                                                                    | 验证条件如果为 false 提示的信息，若 validate 存在时，必选                            | String                            | -                                           |
| validates                                                                       | validate 的集合数组                                                                  | Array<Validate>                   | -                                           |
| errorMessages                                                                   | validates 验证失败后提示的信息集合，顺序与 validates 一致，若 validates 存在时，必选 | Array<String>                     | -                                           |

---

### 5.3. Helpers - fc.helper

提供了一些帮助、工具方法。

#### 5.3.1. `fixedTo2: Function(param: String|Number)`

将 param 转化为小数点后两位的字符串，该方法是 `Number.toFixed` 的封装，解决了 `parseFloat` 参数后是 `NaN` 的情况；

```javascript
angular /* ... */
    .controller('demoController', [
        '$fc.helpers',
        function($helpers) {
            var money = $helpers.fixedTo2(response.pay.pay_money);
        }
    ]);
```

---

#### 5.3.2. `timeFormatter: Function(dateString: string|number, format: String)`

格式化时间工具方法；

-   第一个参数是时间字符串，可以是时间格式的字符串、时间戳（一切可以被 Date 识别的类型）；
-   第二个参数是想要转换的时间格式，`Y` 表示年，`M` 表示月，`d` 表示日，`H` 表示时， `m` 表示分，`s` 表示秒；

```javascript
angular/* ... */
		.controller('demoController', ['$fc.helpers', function($helpers) {
 				// 转化后格式为 2019-06-24 10:09:12
 				var time = $helpers.timeFormatter(response.order_create, 'YYYY-MM-dd HH:mm:ss')；
		}]);
```

---

#### 5.3.3. `promiseSequence: Function(promises: Array<Function: Promise>, initialValue: any)`

序列执行方法。

`promises` 是以函数（若有参数，则为前者函数返回的结果）为项的数组;
如果执行的 promise/函数 需要上一个 promise/函数 执行返回的结果,需要将其结果当做参数传递到当前执行的函数中；同时，若函数为 Promise 类型，那么 catch 需要以 `return $q.reject(some reason..)` 的形式进行传递或捕获。

```javascript
var initialValue = 123;
// execution order is promise1 -> promise2
promiseSequence([
    function promise1 (value) {
        // return Promise
      	// call creatingOrderForPayment(123, type, params4creatingOrder);
       	return creatingOrderForPayment(value, type, params4creatingOrder)
           	.then(function(response) {
               	return response;
           	})
           	.catch(function(reason) {
                return $q.reject(reason);
           	});
   	},
   	function promise2 (order) {
       	if (order.fee_sn) {
           	return $os
               	.paying4order(order.fee_sn)
               	.then(function(response) {
                   	return response;
               	})
               	.catch(function(error) {
                   	return $q.reject(error);
               	});
       	}
       	return $q.reject('NO_FEE_SN');
   	}
])(initialValue)
.then(function(value) {
		console.log('promise2\'s value is', value);
})
.catch(function(error) {
		console.log('promise1 or promise2\'s error is', error);
});
```

#### 5.3.4. `$$CountDown`

倒计时（step is 1s）**构造函数**，请使用 new 创建对象。
如：`new $helpers.$$CountDown(continueCB: function, timeoutCB: function)`；
其中，`continueCB` 和 `timeoutCB` 均为回调函数，`continueCB` 可以接收参数，该参数表示当前剩余时间；

```javascript
function __setTimer(offsetTimestamp) {
    var minutes = Math.round(offsetTimestamp / offsetMinute);
    var seconds = Math.round((offsetTimestamp % offsetMinute) / 1000);
    // 计算每秒的时间
    orderDetail.timer.minutes = minutes < 10 ? ('00' + minutes).slice(-2) : minutes;
    orderDetail.timer.seconds = ('00' + seconds).slice(-2);
}
// ...
var timer = new $helpers.$$CountDown(__setTimer, function() {
    // 时间减少到 0 时，执行的函数
});
// 倒计时开始，参数为结束时间
timer.start(response.order_expire);
```

## 六、组件

暂无，持续更新中...

## 七、资源

目前仅有占位符图片资源，统一资源以便于统一风格。

### 7.1. 占位符

资源路径： `https://h5.ihrss.neusoft.com/ihrss/fc/yx/assets/images/placeholders/`；
资源类型： `PNG`;
资源列表：

| 资源名                         |                                                                                                                        图片                                                                                                                         | 说明                 |
| ------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------- |
| 404 & 404**@2x**               | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115761575-d86eede2-69b6-4b0a-b631-64cd7399816f.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=23496&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| done & done**@2x**             | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115738167-03a7f158-3c06-4fb7-a633-da30d504e5f9.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=21554&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| info & info**@2x**             | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115848282-0fad8cec-4015-4c01-8da4-f7bb3907258b.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=20748&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| no_card & no_card**@2x**       | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115854465-4d2ea4f7-fba3-48be-97ef-34b6fe891927.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=20063&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| no_content & no_content**@2x** | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115861117-a689042d-53f7-4a80-91d6-551cfa621617.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=20999&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| no_network & no_network**@2x** | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115890727-74329157-2a2a-4890-8436-92e513744851.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=23401&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| no_order & no_order**@2x**     | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115897064-e999f603-1f89-4f06-bd3e-1fdc25da7886.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=21834&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| no_service & no_service**@2x** | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115902887-b2f5a31e-0c1e-42d6-83f0-7aab9d2286f3.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=21484&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |
| welcome & welcome**@2x**       | ![image.png](https://cdn.nlark.com/yuque/0/2020/png/268827/1583115908054-576c4e23-e35e-43b6-b5a2-491d80789026.png#align=left&display=inline&height=150&name=image.png&originHeight=150&originWidth=250&size=21392&status=done&style=none&width=250) | 正常尺寸：250 \* 100；2x 尺寸： 500 \* 200； |

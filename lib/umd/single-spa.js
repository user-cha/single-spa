(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
}(this, (function (exports) { 'use strict';

    // 描述应用的整个状态

    const NOT_LOADED = 'NOT_LOADED'; //应用初是状态
    const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE'; //加载资源
    const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'; //还没有调用 bootstarp方法
    const BOOTSTRAPPING = 'BOOTSTRAPPING'; //启动中
    const NOT_MOUNTED = 'NOT_MOUNTED'; //还没有调用 mounted
    const MOUNTED = 'MOUNTED'; //挂载完成
    const UNLOADING = 'UNLOADING'; //完全卸载中
    //当前这个应用是否要被激活
    function shouldBeActive(app){  // 返回true 就应该开始初始化等一系列操作
        return app.activeWhen(window.location)
    }

    /**
     * 
     * @param {} appName 应用名字
     * @param {*} loadApp 加载的应用
     * @param {*} activeWhen 当激活时会调用 loadApp
     * @param {*} customProps 自定义属性
     */
    const apps = []; //用来存放所有的应用
    //维护应用所有的状态 状态机
    function registerApplocation(appName, loadApp, activeWhen, customProps) {
        apps.push({ //将应用注册好了
            name: appName,
            loadApp,
            activeWhen,
            customProps,
            status: NOT_LOADED
        });
        console.log(apps);
        reroute();
    }

    function getAppChanges() {
        const appsToUnmount = []; // 要卸载的app
        const appsToLoad = []; //要加载的app
        const appsToMount = []; //需要挂载的
        apps.forEach(app => {
            const appShouldActive = shouldBeActive(app); //判断是否需要被加载
            switch (app.status) {
                case NOT_LOADED:
                case LOADING_SOURCE_CODE:
                    if (appShouldActive) {
                        appsToLoad.push(app);
                    }
                    break;
                case NOT_BOOTSTRAPPED:
                case BOOTSTRAPPING:
                case NOT_MOUNTED:
                    if (appShouldActive) {
                        appsToMount.push(app);
                    }
                    break;
                case MOUNTED:
                    if (!appShouldActive) {
                        appsToUnmount.push(app);
                    }
                    break;
            }
        });
        return {
            appsToUnmount,
            appsToLoad,
            appsToMount
        }
    }

    // function flattenFnArray(fns) {
    //     fns = Array.isArray(fns) ? fns : [fns]
    //     // Promise.resolve().then(() => fn(props))
    //     return props => fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve())
    // }
    function flattenFnArray(fns) {
        fns = Array.isArray(fns) ? fns : [fns]; // Promise.resolve().then(() => fn(props))
        return (props) => {
            return fns.reduce(
                // reduce第一个参数是上一个即prev, 这边p是一个异步函数，所以这边要then一下
                (p, fn) => p.then(() => {
                    // 执行
                    fn(props);
                }),
                // 这个是当前的，也就是指的是当前方法这边resolve就是让任务进行下去的意思
                Promise.resolve()
            );
        };
    }
    async function toLoadPromise(app) {
        console.log(app);
        if (app.loadPromise) {
            return app.loadPromise //缓存机制
        }
        return (app.loadPromise = Promise.resolve().then(async () => {
            app.status = LOADING_SOURCE_CODE;
            let {
                bootstarp,
                mount,
                unmount
            } = await app.loadApp(app.customProps);
            app.status = NOT_BOOTSTRAPPED; //没有调用 bootstrap方法
            // flattenFnArray  拍平数组函数
            app.bootstarp = flattenFnArray(bootstarp);
            app.mount = flattenFnArray(mount);
            app.unmount = flattenFnArray(unmount);
            delete app.loadPromise;
            return app
        }))

    }

    async function toUnmountPromise(app) {
        console.log(app);
        if (app.status != MOUNTED) {
            return app
        }
        app.status = UNLOADING;
        await app.unmount(app.customProps);
        app.status = NOT_MOUNTED;
        return app
    }

    async function toBootstrapPromise(app) {
        if (app.status != NOT_BOOTSTRAPPED) {
            return app
        }
        app.status = BOOTSTRAPPING;

        await app.bootstarp(app.costomProps);
        app.status = NOT_MOUNTED; //没有调用 bootstrap方法
        return app
    }

    // hashchange  popstate
    const routingEventsListeningTo = ['hashchange', 'popstate'];

    function urlReRoute() { //会根据路径加载不同的应用
        reroute();
    }

    const capturedEventListeners = { //后续挂载的事件先暂存起来
        hashchange:[],
        popstate:[]  //当应用切换完成后可以调用
    };
    //处理应用加载的逻辑在最前面
    window.addEventListener('hashchange', urlReRoute);

    window.addEventListener('popstate', urlReRoute);

    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;


    window.addEventListener = function (eventName,fn){
        // console.log(capturedEventListeners.eventName)
        if(routingEventsListeningTo.includes(eventName) && !capturedEventListeners[eventName].some(listener => listener == fn)){
            capturedEventListeners[eventName].push(fn);
            return
        }
        console.log(arguments);
        return originalAddEventListener.apply(this,arguments)
    };
    window.removeEventListener = function (eventName,fn){
        if(routingEventsListeningTo.includes(eventName)){
            capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(l => l == fn);
            return
        }
        return originalRemoveEventListener.apply(this,arguments)
    };

    /**
     * hash路由  hash变化时可以切换
     * 浏览器路由 切换时不会触发 popstate
     */

    function patchedUpdateState(updateState,methodName){
        return function(){
            const location = window.location.href;
            updateState.apply(this,arguments); //调用切换方法
            const afterUrl = window.location.href;
            if(location != afterUrl){ 
                //路径变了 重写路由 重新加载应用 传入事件源   窗口历史发生变化时发生的事件属于PopStateEvent对象
                urlReRoute(new PopStateEvent('popstate'));
            }
        }
    }
    window.history.pushState = patchedUpdateState(window.history.pushState);
    window.history.replaceState = patchedUpdateState(window.history.replaceState);
    //用户可能还会绑定自己的路由事件 vue


    //当应用切换后 还需要处理原来的方法 需要在应用切换后再执行

    function reroute() {
        const {
            appsToLoad,
            appsToMount,
            appsToUnmount
        } = getAppChanges();
        console.log(appsToLoad, appsToMount, appsToUnmount);
        if (started) {
            return perfromAppChanges() //根据路径装载应用
        } else {
            return loadApps() //预加载应用
        }

        async function loadApps() {
            await Promise.all(appsToLoad.map(toLoadPromise));
        }
        async function perfromAppChanges() { //根据路径来装载应用
            //先卸载不需要的应用
            //去加载需要的应用

            let unMountApps = appsToUnmount.map(toUnmountPromise);
            console.log(unMountApps);
            //这个应用可能需要加载 路径不匹配 加载app1的时候 切换到了app2
            appsToLoad.map(async app => { // 将需要加载的应用拿到 => 加载 => 启动 => 挂载
                app = await toLoadPromise(app);
                app = await toBootstrapPromise(app);
                return toUnmountPromise(app)
            });
            appsToMount.map(async app => {
                app = await toBootstrapPromise(app);
                return toUnmountPromise(app)
            });
            // appsToUnmount.map(toUnmountPromise)  

        }
    }

    //以上是用于初始化操作的 我们还需要 当路径切换时重新加载应用
    /**
     * 重写路由相关的方法
     */

    let started = false;
    function start() {
        // 需要挂载应用
        started = true;
        reroute();
    }

    exports.registerApplocation = registerApplocation;
    exports.start = start;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=single-spa.js.map

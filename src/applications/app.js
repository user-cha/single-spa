import {
    BOOTSTRAPPING,
    LOADING_SOURCE_CODE,
    MOUNTED,
    NOT_BOOTSTRAPPED,
    NOT_LOADED,
    NOT_MOUNTED,
    shouldBeActive
} from './app.helpers'
import { reroute } from "../nav/reroute";
/**
 * 
 * @param {} appName 应用名字
 * @param {*} loadApp 加载的应用
 * @param {*} activeWhen 当激活时会调用 loadApp
 * @param {*} customProps 自定义属性
 */
const apps = [] //用来存放所有的应用
//维护应用所有的状态 状态机
export function registerApplocation(appName, loadApp, activeWhen, customProps) {
    apps.push({ //将应用注册好了
        name: appName,
        loadApp,
        activeWhen,
        customProps,
        status: NOT_LOADED
    })
    console.log(apps)
    reroute();
}

export function getAppChanges() {
    const appsToUnmount = [] // 要卸载的app
    const appsToLoad = [] //要加载的app
    const appsToMount = [] //需要挂载的
    apps.forEach(app => {
        const appShouldActive = shouldBeActive(app) //判断是否需要被加载
        switch (app.status) {
            case NOT_LOADED:
            case LOADING_SOURCE_CODE:
                if (appShouldActive) {
                    appsToLoad.push(app)
                }
                break;
            case NOT_BOOTSTRAPPED:
            case BOOTSTRAPPING:
            case NOT_MOUNTED:
                if (appShouldActive) {
                    appsToMount.push(app)
                }
                break;
            case MOUNTED:
                if (!appShouldActive) {
                    appsToUnmount.push(app)
                }
                break;
        }
    })
    return {
        appsToUnmount,
        appsToLoad,
        appsToMount
    }
}
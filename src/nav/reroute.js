import {
    getAppChanges
} from '../applications/app'
import {
    started
} from '../start'
import {
    toLoadPromise
} from '../lifecyles/load'
import {
    toUnmountPromise
} from '../lifecyles/unmount'
import {
    toBootstrapPromise
} from '../lifecyles/bootstrap'
import './navigator-event'
export function reroute() {
    const {
        appsToLoad,
        appsToMount,
        appsToUnmount
    } = getAppChanges()
    console.log(appsToLoad, appsToMount, appsToUnmount)
    if (started) {
        return perfromAppChanges() //根据路径装载应用
    } else {
        return loadApps() //预加载应用
    }

    async function loadApps() {
        let apps = await Promise.all(appsToLoad.map(toLoadPromise))
    }
    async function perfromAppChanges() { //根据路径来装载应用
        //先卸载不需要的应用
        //去加载需要的应用

        let unMountApps = appsToUnmount.map(toUnmountPromise)
        console.log(unMountApps)
        //这个应用可能需要加载 路径不匹配 加载app1的时候 切换到了app2
        appsToLoad.map(async app => { // 将需要加载的应用拿到 => 加载 => 启动 => 挂载
            app = await toLoadPromise(app)
            app = await toBootstrapPromise(app)
            return toUnmountPromise(app)
        })
        appsToMount.map(async app => {
            app = await toBootstrapPromise(app)
            return toUnmountPromise(app)
        })
        // appsToUnmount.map(toUnmountPromise)  

    }
}

//以上是用于初始化操作的 我们还需要 当路径切换时重新加载应用
/**
 * 重写路由相关的方法
 */
// hashchange  popstate
import {
    reroute
} from './reroute'
export const routingEventsListeningTo = ['hashchange', 'popstate']

function urlReRoute() { //会根据路径加载不同的应用
    reroute([], arguments)
}

const capturedEventListeners = { //后续挂载的事件先暂存起来
    hashchange:[],
    popstate:[]  //当应用切换完成后可以调用
}
//处理应用加载的逻辑在最前面
window.addEventListener('hashchange', urlReRoute)

window.addEventListener('popstate', urlReRoute)

const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener


window.addEventListener = function (eventName,fn){
    // console.log(capturedEventListeners.eventName)
    if(routingEventsListeningTo.includes(eventName) && !capturedEventListeners[eventName].some(listener => listener == fn)){
        capturedEventListeners[eventName].push(fn)
        return
    }
    console.log(arguments)
    return originalAddEventListener.apply(this,arguments)
}
window.removeEventListener = function (eventName,fn){
    if(routingEventsListeningTo.includes(eventName)){
        capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(l => l == fn)
        return
    }
    return originalRemoveEventListener.apply(this,arguments)
}

/**
 * hash路由  hash变化时可以切换
 * 浏览器路由 切换时不会触发 popstate
 */

function patchedUpdateState(updateState,methodName){
    return function(){
        const location = window.location.href
        updateState.apply(this,arguments) //调用切换方法
        const afterUrl = window.location.href
        if(location != afterUrl){ 
            //路径变了 重写路由 重新加载应用 传入事件源   窗口历史发生变化时发生的事件属于PopStateEvent对象
            urlReRoute(new PopStateEvent('popstate'))
        }
    }
}
window.history.pushState = patchedUpdateState(window.history.pushState,'pushState')
window.history.replaceState = patchedUpdateState(window.history.replaceState,'replaceState')
//用户可能还会绑定自己的路由事件 vue


//当应用切换后 还需要处理原来的方法 需要在应用切换后再执行

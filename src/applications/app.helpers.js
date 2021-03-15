// 描述应用的整个状态

export const NOT_LOADED = 'NOT_LOADED' //应用初是状态
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE' //加载资源
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED' //还没有调用 bootstarp方法
export const BOOTSTRAPPING = 'BOOTSTRAPPING' //启动中
export const NOT_MOUNTED = 'NOT_MOUNTED' //还没有调用 mounted
export const MOUNTING = 'MOUNTING' //正在挂载中
export const MOUNTED = 'MOUNTED' //挂载完成
export const UPDATINMG = 'UPDATINMG' //更新中
export const UNMOUNTED = 'UNMOUNTED' //解除挂载
export const UNLOADING = 'UNLOADING' //完全卸载中
export const LOAD_ERR = 'LOAD_ERR' //
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN' //

//当前应用是否被激活
export function isActive(app){
    return app.status === MOUNTED
}
//当前这个应用是否要被激活
export function shouldBeActive(app){  // 返回true 就应该开始初始化等一系列操作
    return app.activeWhen(window.location)
}
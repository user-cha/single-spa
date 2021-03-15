import {
    LOADING_SOURCE_CODE,
    NOT_BOOTSTRAPPED
} from "../applications/app.helpers";


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
                fn(props)
            }),
            // 这个是当前的，也就是指的是当前方法这边resolve就是让任务进行下去的意思
            Promise.resolve()
        );
    };
}
export async function toLoadPromise(app) {
    console.log(app)
    if (app.loadPromise) {
        return app.loadPromise //缓存机制
    }
    return (app.loadPromise = Promise.resolve().then(async () => {
        app.status = LOADING_SOURCE_CODE
        let {
            bootstarp,
            mount,
            unmount
        } = await app.loadApp(app.customProps)
        app.status = NOT_BOOTSTRAPPED //没有调用 bootstrap方法
        // flattenFnArray  拍平数组函数
        app.bootstarp = flattenFnArray(bootstarp)
        app.mount = flattenFnArray(mount)
        app.unmount = flattenFnArray(unmount)
        delete app.loadPromise
        return app
    }))

}
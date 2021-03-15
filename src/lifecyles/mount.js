import {
    MOUNTED,
    MOUNTING,
    NOT_MOUNTED
} from "../applications/app.helpers";
export async function toBootstrapPromise(app) {
    if (app.status != NOT_MOUNTED) {
        return app
    }
    app.status = MOUNTING

    await app.bootstarp(app.costomProps)
    app.status = MOUNTED //没有调用 bootstrap方法
    return app
}
import {
    MOUNTED,
    NOT_MOUNTED,
    UNLOADING
} from "../applications/app.helpers";
export async function toUnmountPromise(app) {
    console.log(app)
    if (app.status != MOUNTED) {
        return app
    }
    app.status = UNLOADING
    await app.unmount(app.customProps)
    app.status = NOT_MOUNTED
    return app
}
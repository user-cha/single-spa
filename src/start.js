import { reroute } from "./nav/reroute";


export let started = false
export function start() {
    // 需要挂载应用
    started = true
    reroute()
} 
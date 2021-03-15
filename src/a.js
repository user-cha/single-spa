var arr = [async a => {console.log(a)}, async b => {console.log(b)}]

function flattenFnArray(fns) {
    fns = Array.isArray(fns) ? fns : [fns]
    // Promise.resolve().then(() => fn(props))
    return props => fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve())
}

flattenFnArray(arr)
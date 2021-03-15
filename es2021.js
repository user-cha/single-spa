/**
 * 1.数字分隔符
 */

const count = 123_345_678
console.log(count)
/**
 * 2.String.prototype.replaceAll()  新的 replaceAll() 可以直接替换全部匹配的字符
 */
const str = '好一朵美丽的茉莉花，茉莉花啊，茉莉花啊，你又香又好看'
str.replaceAll('茉莉花','丁香花')
console.log(str)
const str1 = '好一朵美丽的茉莉花，茉莉花啊，茉莉花啊，你又香又好看'
const str2 = str1.replace('茉莉花','丁香花')
console.log(str2)

/**
 * 3.逻辑赋值运算符 &&=  ||=  ??=
 * &&= 当左操作表达式为true时 执行赋值语句
 * ||= 当左操作表达式为false时 执行赋值语句
 * ??= 当左操作表达式为null 或者 undefined时 执行赋值语句
 */

let a = 1 
let b = 2
a &&= b
console.log(a)

//等价于
if(a){
    a = b
}

let a = 1 
let b = 2
a ||= b
console.log(a)

//等价于
if(!a){
    a = b
}

let a = null
let b = 2
a ??= b
console.log(a)

//等价于
if(a == null || a == undefined){
    a = b
}
/**
 * 4.Promise.any
 * 跟 Promise.all 正好相反，只要有一个是 promise 是 fulfilled 时，则直接返回该结果，如果都是 rejected ，则报错
 */

 Promise.any([
   Promise.reject('rejected'),
   Promise.resolve('fulfilled')
])
.then(res => console.log(res))
.catch(err => console.error(err));
// fulfilled
Promise
  .any([
    Promise.reject('rejected1'),
    Promise.reject('rejected2')
 ])
 .then(res => console.log(res))
 .catch(err => console.error(err));
// AggregateError: All promises were rejected

Promise
  .any([
    Promise.resolve('resolve1'),
    Promise.resolve('resolve1')
 ])
 .then(res => console.log(res))
 .catch(err => console.error(err));
// resolve1

/**
 * WeakRefs
 * eakRef 是 Weak References（弱引用） 的简写，其主要用途是对另一个对象进行弱引用。这就意味着它不会阻止GC（garbage collector 垃圾收集器）收集对象。
 * 当我们不想将对象永远保存在内存中时，这就很有用了。但是使用的时候要慎重，因为有可能出现要使用时，被引用对象已经被回收的情况。就连 TC39 提案都建议能不用就不用。
 * deref方法返回WeakRef 实例的目标对象，如果目标对象已被垃圾收集，则返回undefined 。
 */

 const newRef = new WeakRef({
    name: '小仙女',
    age: '24',
    sex: '女'
});
const obj = newRef.deref();
console.log(obj); // {name: "小仙女", age: "24", sex: "女"}
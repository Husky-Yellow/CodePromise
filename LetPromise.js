class MyPromise {
  //定义 MyPromise 的三种状态
  static PENDING = "pending";
  static RESOLVED = "resolved";
  static REJECTED = "rejected";
  constructor(excutor) {
      this.state = MyPromise.PENDING;
      this.value = "";
      this.reason = "";
      //将成功的回调函数缓存在 resolvedCallback 中
      this.resolvedCallback = [];
      //将失败的回调函数缓存在 rejectedCallback 中
      this.rejectedCallback = [];
      let resolve = (value) => {
          //只有 PENDING 状态才可以被修改，保证 MyPromise 状态的不可逆
          if (this.state === MyPromise.PENDING) {
              this.state = MyPromise.RESOLVED;
              this.value = value;
              this.resolvedCallback.forEach(fn => fn(value));
          }
      }
      let reject = (reason) => {
          if (this.state === MyPromise.PENDING) {
              this.state = MyPromise.REJECTED;
              this.reason = reason;
              this.rejectedCallback.forEach(fn => fn(reason));
          }
      }
      try {
          //同步执行传进来的 excutor 函数
          excutor(resolve, reject);
      } catch (e) {
          console.log("excutor error", e);
          reject(e);
      }
  }
  then(onResolved, onRejected) {
      //穿透传递
      if (typeof onResolved !== "function") {
          onResolved = value => value;
      }
      if (typeof onRejected !== "function") {
          onRejected = reason => reason;
      }
      //返回一个新的 MyPromise 实例
      return new MyPromise((resolve, reject) => {
           // 异步代码，then 方法比 resolve 先执行的。回调函数要缓存起来
          if (this.state === MyPromise.PENDING) {
              this.resolvedCallback.push(() => {
                  const result = onResolved(this.value);
                  if (result instanceof MyPromise) {
                      result.then(resolve, reject);
                  } else {
                      resolve(result);
                  }
              })
              this.rejectedCallback.push(() => {
                  const result = onRejected(this.reason);
                  if (result instanceof MyPromise) {
                      result.then(resolve, reject);
                  } else {
                      resolve(result);
                  }
              })
          }
          //说明都是同步代码，resolve方法已经执行完了
          if (this.state === MyPromise.RESOLVED) {
              setTimeout(() => {
                  const result = onResolved(this.value);
                  if (result instanceof MyPromise) {
                      result.then(resolve, reject);
                  } else {
                      resolve(result);
                  }
              })
          }
          //说明都是同步代码，rejected方法已经执行完了
          if (this.state === MyPromise.REJECTED) {
              setTimeout(() => {
                  const result = onRejected(this.reason);
                  if (result instanceof MyPromise) {
                      result.then(resolve, reject);
                  } else {
                      resolve(result);
                  }
              })
          }
      })
  }
  //resolve方法
  static resolve(promise) {
      return new MyPromise((resolve, reject) => {
          if (promise instanceof MyPromise) {
              //promise实例 原封不动
              promise.then(resolve, reject);
          } else {
              resolve(promise);
          }
      })
  }
  //reject
  static reject(promise) {
      return new MyPromise((resolve, reject) => {
          reject(promise);
      })
  }
  static all(promises) {
      const result = [];
      return new MyPromise((resolve, reject) => {
          promises.forEach(item => {
              item.then(res => {
                  result.push(res);
                  if (result.length == promises.length) {
                      resolve(result);
                  }
              }, error => {
                  reject(error);
              })
          })
      })
  }
  static race(promises) {
      return new MyPromise((resolve, reject) => {
          promises.forEach(item => {
              item.then(res => {
                  resolve(res);
              }, error => {
                  reject(error);
              })
          })
      })
  }
  static allSettled(promises) {
      const result = [];
      return new MyPromise((resolve, reject) => {
          promises.forEach(item => {
              item.then(res => {
                  result.push(item);
                  if (result.length === promises.length) {
                      resolve(result);
                  }
              }, error => {
                  result.push(item);
                  if (result.length === promises.length) {
                      resolve(result);
                  }
              })
          })
      })
  }
}

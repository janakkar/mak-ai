const _ = require('ramda');
const Task = require('data.task');
const curry = _.curry;

var toArray = Function.call.bind(Array.prototype.slice);

const inspect = (x) => {
  return (typeof x === 'function') ? inspectFn(x) :  inspectArgs(x);
}

const inspectFn = (f) => {
  return (f.name) ? f.name : f.toString();
}

const inspectArgs = (args) =>  {
  // if (!args || !args.reduce) {
  //   return `{${Object.keys(args)}}`;
  // }
  return args.reduce(function(acc, x){
    return acc += inspect(x);
  }, '(') + ')';
}

// const curry = (fx) => {
//   var arity = fx.length;

//   return function f1() {
//     var args = toArray(arguments, 0);
//     if (args.length >= arity) {
//       return fx.apply(null, args);
//     }
//     else {
//       var f2 = function f2() {
//         var args2 = toArray(arguments, 0);
//         return f1.apply(null, args.concat(args2));
//       }
//       f2.toString = function() {
//         return inspectFn(fx) + inspectArgs(args);
//       }
//       return f2;
//     }
//   };
// }

// const compose = () => {
//   var fns = toArray(arguments),
//       arglen = fns.length;

//   return function(){
//     for(var i = arglen; --i >= 0;) {
//       var fn = fns[i]
//         , args = fn.length ? toArray(arguments, 0, fn.length) : arguments
//         , next_args = toArray(arguments, (fn.length || 1)); //not right with *args
//       next_args.unshift(fn.apply(this,args));
//       arguments = next_args;
//     }
//     return arguments[0];
//   }
// }

const replace = curry(function(what, replacement, x) {
    return x.replace(what, replacement);
});

const filter = curry(function(f, xs) {
    return xs.filter(f);
});

const map = curry(function map(f, xs) {
    return xs.map(f);
});

const reduce = curry(function(f, a, xs) {
    return xs.reduce(f, a);
});

const split = curry(function(what, x) {
    return x.split(what);
});

const toUpperCase = function(x) {
    return x.toUpperCase()
};

const toLowerCase = function(x) {
    return x.toLowerCase()
};


// Identity
const Identity = function(x) {
  this.__value = x;
};

Identity.of = function(x) { return new Identity(x); };

Identity.prototype.map = function(f) {
  return Identity.of(f(this.__value));
};

Identity.prototype.inspect = function() {
  return 'Identity('+inspect(this.__value)+')';
};

// Maybe
const Maybe = function(x) {
  this.__value = x;
};

Maybe.of = function(x) {
  return new Maybe(x);
};

Maybe.prototype.isNothing = function(f) {
  return (this.__value === null || this.__value === undefined);
};

Maybe.prototype.map = function(f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value));
};

Maybe.prototype.chain = function(f) {
  return this.map(f).join();
};

Maybe.prototype.ap = function(other) {
  return this.isNothing() ? Maybe.of(null) : other.map(this.__value);
};

Maybe.prototype.join = function() {
  return this.isNothing() ? Maybe.of(null) : this.__value;
}

// Maybe.prototype.inspect = function() {
//   return 'Maybe('+inspect(this.__value)+')';
// }


// Either
const Either = function() {};
Either.of = function(x) {
  return new Right(x);
}

const Left = function(x) {
  this.__value = x;
}

// TODO: remove this nonsense
Left.of = function(x) {
  return new Left(x);
}

Left.prototype.map = function(f) { return this; }
Left.prototype.ap = function(other) { return this; }
Left.prototype.join = function() { return this; }
Left.prototype.chain = function() { return this; }
Left.prototype.inspect = function() {
  return 'Left('+inspect(this.__value)+')';
}


const Right = function(x) {
  this.__value = x;
}

// TODO: remove in favor of Either.of
Right.of = function(x) {
  return new Right(x);
}

Right.prototype.map = function(f) {
  return Right.of(f(this.__value));
}

Right.prototype.join = function() {
  return this.__value;
}

Right.prototype.chain = function(f) {
  return f(this.__value);
}

Right.prototype.ap = function(other) {
  return this.chain(function(f) {
    return other.map(f);
  });
}

Right.prototype.join = function() {
  return this.__value;
}

Right.prototype.chain = function(f) {
  return f(this.__value);
}

Right.prototype.inspect = function() {
  return 'Right('+inspect(this.__value)+')';
}

// IO
const IO = function(f) {
  this.unsafePerformIO = f;
}

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
}

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.unsafePerformIO));
}

IO.prototype.join = function() {
  return this.unsafePerformIO();
}

IO.prototype.chain = function(f) {
  return this.map(f).join();
}

IO.prototype.ap = function(a) {
  return this.chain(function(f) {
    return a.map(f);
  });
}

IO.prototype.inspect = function() {
  return 'IO('+inspect(this.unsafePerformIO)+')';
}

const unsafePerformIO = function(x) { return x.unsafePerformIO(); }

const either = curry(function(f, g, e) {
  switch(e.constructor) {
    case Left: return f(e.__value);
    case Right: return g(e.__value);
  }
});

// overwriting join from pt 1
const join = function(m){ return m.join(); };

const chain = curry(function(f, m){
  return m.map(f).join(); // or compose(join, map(f))(m)
});

const liftA2 = curry(function(f, a1, a2){
  return a1.map(f).ap(a2);
});

const liftA3 = curry(function(f, a1, a2, a3){
  return a1.map(f).ap(a2).ap(a3);
});


Task.prototype.join = function(){ return this.chain(_.identity); }
  
module.exports = {Maybe, IO, Left, Right, either, unsafePerformIO, map};

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var R = require('ramda');
var R__default = _interopDefault(R);
var RS = require('ramdasauce');
var RS__default = _interopDefault(RS);

var isIoValid = function isIoValid(io) {
  return !R__default.isNil(io);
};
var isHostValid = R__default.allPass([R__default.complement(RS__default.isNilOrEmpty), R__default.is(String)]);
var isPortValid = R__default.allPass([R__default.complement(R__default.isNil), R__default.is(Number), RS__default.isWithin(1, 65535)]);
var onCommandValid = function onCommandValid(fn) {
  return typeof fn === 'function';
};

/**
 * Ensures the options are sane to run this baby.  Throw if not.  These
 * are basically sanity checks.
 */
var validate = function validate(options) {
  var io = options.io,
      host = options.host,
      port = options.port,
      onCommand = options.onCommand;


  if (!isIoValid(io)) throw new Error('invalid io function');
  if (!isHostValid(host)) throw new Error('invalid host');
  if (!isPortValid(port)) throw new Error('invalid port');
  if (!onCommandValid(onCommand)) throw new Error('invalid onCommand handler');
};

/**
 * Provides 4 features for logging.  log & debug are the same.
 */
var logger = (function () {
  return function (reactotron) {
    return {
      features: {
        log: function log(message) {
          var important = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          return reactotron.send('log', { level: 'debug', message: message }, !!important);
        },
        debug: function debug(message) {
          var important = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          return reactotron.send('log', { level: 'debug', message: message }, !!important);
        },
        warn: function warn(message) {
          return reactotron.send('log', { level: 'warn', message: message }, true);
        },
        error: function error(message, stack) {
          return reactotron.send('log', { level: 'error', message: message, stack: stack }, true);
        }
      }
    };
  };
});

/**
 * Provides an image.
 */
var image$1 = (function () {
  return function (reactotron) {
    return {
      features: {
        // expanded just to show the specs
        image: function image(_ref) {
          var uri = _ref.uri,
              preview = _ref.preview,
              filename = _ref.filename,
              width = _ref.width,
              height = _ref.height,
              caption = _ref.caption;
          return reactotron.send('image', { uri: uri, preview: preview, filename: filename, width: width, height: height, caption: caption });
        }
      }
    };
  };
});

/**
 * Runs small high-unscientific benchmarks for you.
 */
var benchmark = (function () {
  return function (reactotron) {
    var startTimer = reactotron.startTimer;


    var benchmark = function benchmark(title) {
      var steps = [];
      var elapsed = startTimer();
      var step = function step(stepTitle) {
        var previousTime = R.length(steps) === 0 ? 0 : R.last(steps).time;
        var nextTime = elapsed();
        steps.push({ title: stepTitle, time: nextTime, delta: nextTime - previousTime });
      };
      steps.push({ title: title, time: 0, delta: 0 });
      var stop = function stop(stopTitle) {
        step(stopTitle);
        reactotron.send('benchmark.report', { title: title, steps: steps });
      };
      return { step: step, stop: stop, last: stop };
    };

    return {
      features: { benchmark: benchmark }
    };
  };
});

/**
 * Provides helper functions for send state responses.
 */
var stateResponses = (function () {
  return function (reactotron) {
    return {
      features: {
        stateActionComplete: function stateActionComplete(name, action) {
          var important = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
          return reactotron.send('state.action.complete', { name: name, action: action }, !!important);
        },

        stateValuesResponse: function stateValuesResponse(path, value) {
          var valid = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
          return reactotron.send('state.values.response', { path: path, value: value, valid: valid });
        },

        stateKeysResponse: function stateKeysResponse(path, keys) {
          var valid = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
          return reactotron.send('state.keys.response', { path: path, keys: keys, valid: valid });
        },

        stateValuesChange: function stateValuesChange(changes) {
          return reactotron.send('state.values.change', { changes: changes });
        },

        // sends the state backup over to the server
        stateBackupResponse: function stateBackupResponse(state) {
          return reactotron.send('state.backup.response', { state: state });
        }
      }
    };
  };
});

/**
 * Sends API request/response information.
 */
var apiResponse$1 = (function () {
  return function (reactotron) {
    return {
      features: {
        apiResponse: function apiResponse(request, response, duration) {
          var ok = response && response.status && RS.isWithin(200, 299, response.status);
          var important = !ok;
          reactotron.send('api.response', { request: request, response: response, duration: duration }, important);
        }
      }
    };
  };
});

/**
 * Clears the reactotron server.
 */
var clear$1 = (function () {
  return function (reactotron) {
    return {
      features: {
        clear: function clear() {
          return reactotron.send('clear');
        }
      }
    };
  };
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var hasHirezNodeTimer = false && (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && process && process.hrtime && typeof process.hrtime === 'function';

// the default timer
var defaultPerformanceNow = function defaultPerformanceNow() {
  return Date.now();
};

// try to find the browser-based performance timer
var nativePerformance = typeof window !== 'undefined' && window && (window.performance || window.msPerformance || window.webkitPerformance);

// if we do find it, let's setup to call it
var nativePerformanceNow = function nativePerformanceNow() {
  return nativePerformance.now();
};

// the function we're trying to assign
var performanceNow = defaultPerformanceNow;

// accepts an already started time and returns the number of milliseconds
var delta = function delta(started) {
  return performanceNow() - started;
};

// node will use a high rez timer
if (hasHirezNodeTimer) {
  performanceNow = process.hrtime;
  delta = function delta(started) {
    return performanceNow(started)[1] / 1000000;
  };
} else if (nativePerformance) {
  performanceNow = nativePerformanceNow;
}

// this is the interface the callers will use
// export const performanceNow = nativePerformance ? nativePerformanceNow : defaultPerformanceNow

/**
 * Starts a lame, low-res timer.  Returns a function which when invoked,
 * gives you the number of milliseconds since passing.  ish.
 */
var start = function start() {
  //  record the start time
  var started = performanceNow();
  return function () {
    return delta(started);
  };
};

var CorePlugins = [image$1(), logger(), benchmark(), stateResponses(), apiResponse$1(), clear$1()];

var DEFAULTS = {
  io: null, // the socket.io function to create a socket
  host: 'localhost', // the server to connect (required)
  port: 9090, // the port to connect (required)
  name: 'reactotron-core-client', // some human-friendly session name
  secure: false, // use wss instead of ws
  plugins: CorePlugins, // needed to make society function
  onCommand: function onCommand(cmd) {
    return null;
  }, // the function called when we receive a command
  onConnect: function onConnect() {
    return null;
  }, // fires when we connect
  onDisconnect: function onDisconnect() {
    return null;
  } // fires when we disconnect
};

// these are not for you.
var isReservedFeature = R__default.contains(R__default.__, ['options', 'connected', 'socket', 'plugins', 'configure', 'connect', 'send', 'use', 'startTimer']);

var Client = function () {
  function Client() {
    classCallCheck(this, Client);
    this.options = R__default.merge({}, DEFAULTS);
    this.connected = false;
    this.socket = null;
    this.plugins = [];

    this.startTimer = function () {
      return start();
    };

    // we will be invoking send from callbacks other than inside this file
    this.send = this.send.bind(this);
  }

  /**
   * Set the configuration options.
   */


  // the configuration options


  createClass(Client, [{
    key: 'configure',
    value: function configure() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // options get merged & validated before getting set
      var newOptions = R__default.merge(this.options, options);
      validate(newOptions);
      this.options = newOptions;

      // if we have plugins, let's add them here
      if (R__default.isArrayLike(this.options.plugins)) {
        R__default.forEach(this.use.bind(this), this.options.plugins);
      }

      return this;
    }

    /**
     * Connect to the Reactotron server.
     */

  }, {
    key: 'connect',
    value: function connect() {
      var _this = this;

      this.connected = true;
      var _options = this.options,
          io = _options.io,
          secure = _options.secure,
          host = _options.host,
          port = _options.port,
          name = _options.name,
          userAgent = _options.userAgent,
          environment = _options.environment,
          reactotronVersion = _options.reactotronVersion;
      var _options2 = this.options,
          onCommand = _options2.onCommand,
          onConnect = _options2.onConnect,
          onDisconnect = _options2.onDisconnect;

      // establish a socket.io connection to the server

      var protocol = secure ? 'wss' : 'ws';
      var socket = io(protocol + '://' + host + ':' + port, {
        jsonp: false,
        transports: ['websocket', 'polling']
      });

      // fires when we talk to the server
      socket.on('connect', function () {
        // fire our optional onConnect handler
        onConnect && onConnect();

        // trigger our plugins onConnect
        R__default.forEach(function (plugin) {
          return plugin.onConnect && plugin.onConnect();
        }, _this.plugins);

        // introduce ourselves
        _this.send('client.intro', { host: host, port: port, name: name, userAgent: userAgent, reactotronVersion: reactotronVersion, environment: environment });
      });

      // fires when we disconnect
      socket.on('disconnect', function () {
        // trigger our disconnect handler
        onDisconnect && onDisconnect();

        // as well as the plugin's onDisconnect
        R__default.forEach(function (plugin) {
          return plugin.onDisconnect && plugin.onDisconnect();
        }, _this.plugins);
      });

      // fires when we receive a command, just forward it off
      socket.on('command', function (command) {
        // trigger our own command handler
        onCommand && onCommand(command);

        // trigger our plugins onCommand
        R__default.forEach(function (plugin) {
          return plugin.onCommand && plugin.onCommand(command);
        }, _this.plugins);
      });

      // assign the socket to the instance
      this.socket = socket;

      return this;
    }
  }, {
    key: 'testing',
    value: function testing() {
      return true;
    }

    /**
     * Sends a command to the server
     */

  }, {
    key: 'send',
    value: function send(type) {
      var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var important = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      this.socket && this.socket.emit('command', { type: type, payload: payload, important: !!important });
    }

    /**
     * Sends a custom command to the server to displays nicely.
     */

  }, {
    key: 'display',
    value: function display(_ref) {
      var name = _ref.name,
          value = _ref.value,
          preview = _ref.preview,
          image = _ref.image,
          _ref$important = _ref.important,
          important = _ref$important === undefined ? false : _ref$important;

      this.send('display', { name: name, value: value, preview: preview, image: image }, important);
    }

    /**
     * Adds a plugin to the system
     */

  }, {
    key: 'use',
    value: function use(pluginCreator) {
      var _this2 = this;

      // we're supposed to be given a function
      if (typeof pluginCreator !== 'function') throw new Error('plugins must be a function');

      // execute it immediately passing the send function
      var plugin = pluginCreator.bind(this)(this);

      // ensure we get an Object-like creature back
      if (!R__default.is(Object, plugin)) throw new Error('plugins must return an object');

      // do we have features to mixin?
      if (plugin.features) {
        // validate
        if (!R__default.is(Object, plugin.features)) throw new Error('features must be an object');

        // here's how we're going to inject these in
        var inject = function inject(key) {
          // grab the function
          var featureFunction = plugin.features[key];

          // only functions may pass
          if (typeof featureFunction !== 'function') throw new Error('feature ' + key + ' is not a function');

          // ditch reserved names
          if (isReservedFeature(key)) throw new Error('feature ' + key + ' is a reserved name');

          // ok, let's glue it up... and lose all respect from elite JS champions.
          _this2[key] = featureFunction;
        };

        // let's inject
        R__default.forEach(inject, R__default.keys(plugin.features));
      }

      // add it to the list
      this.plugins.push(plugin);

      // call the plugins onPlugin
      plugin.onPlugin && typeof plugin.onPlugin === 'function' && plugin.onPlugin.bind(this)(this);

      // chain-friendly
      return this;
    }
  }]);
  return Client;
}();

// convenience factory function
var createClient = function createClient(options) {
  var client = new Client();
  client.configure(options);
  return client;
};

exports.CorePlugins = CorePlugins;
exports.Client = Client;
exports.createClient = createClient;
exports.start = start;

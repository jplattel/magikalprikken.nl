
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // canvas-confetti v1.3.3 built on 2021-01-16T22:50:46.932Z
    var module = {};

    // source content
    (function main(global, module, isWorker, workerSize) {
      var canUseWorker = !!(
        global.Worker &&
        global.Blob &&
        global.Promise &&
        global.OffscreenCanvas &&
        global.OffscreenCanvasRenderingContext2D &&
        global.HTMLCanvasElement &&
        global.HTMLCanvasElement.prototype.transferControlToOffscreen &&
        global.URL &&
        global.URL.createObjectURL);

      function noop() {}

      // create a promise if it exists, otherwise, just
      // call the function directly
      function promise(func) {
        var ModulePromise = module.exports.Promise;
        var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;

        if (typeof Prom === 'function') {
          return new Prom(func);
        }

        func(noop, noop);

        return null;
      }

      var raf = (function () {
        var TIME = Math.floor(1000 / 60);
        var frame, cancel;
        var frames = {};
        var lastFrameTime = 0;

        if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
          frame = function (cb) {
            var id = Math.random();

            frames[id] = requestAnimationFrame(function onFrame(time) {
              if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
                lastFrameTime = time;
                delete frames[id];

                cb();
              } else {
                frames[id] = requestAnimationFrame(onFrame);
              }
            });

            return id;
          };
          cancel = function (id) {
            if (frames[id]) {
              cancelAnimationFrame(frames[id]);
            }
          };
        } else {
          frame = function (cb) {
            return setTimeout(cb, TIME);
          };
          cancel = function (timer) {
            return clearTimeout(timer);
          };
        }

        return { frame: frame, cancel: cancel };
      }());

      var getWorker = (function () {
        var worker;
        var prom;
        var resolves = {};

        function decorate(worker) {
          function execute(options, callback) {
            worker.postMessage({ options: options || {}, callback: callback });
          }
          worker.init = function initWorker(canvas) {
            var offscreen = canvas.transferControlToOffscreen();
            worker.postMessage({ canvas: offscreen }, [offscreen]);
          };

          worker.fire = function fireWorker(options, size, done) {
            if (prom) {
              execute(options, null);
              return prom;
            }

            var id = Math.random().toString(36).slice(2);

            prom = promise(function (resolve) {
              function workerDone(msg) {
                if (msg.data.callback !== id) {
                  return;
                }

                delete resolves[id];
                worker.removeEventListener('message', workerDone);

                prom = null;
                done();
                resolve();
              }

              worker.addEventListener('message', workerDone);
              execute(options, id);

              resolves[id] = workerDone.bind(null, { data: { callback: id }});
            });

            return prom;
          };

          worker.reset = function resetWorker() {
            worker.postMessage({ reset: true });

            for (var id in resolves) {
              resolves[id]();
              delete resolves[id];
            }
          };
        }

        return function () {
          if (worker) {
            return worker;
          }

          if (!isWorker && canUseWorker) {
            var code = [
              'var CONFETTI, SIZE = {}, module = {};',
              '(' + main.toString() + ')(this, module, true, SIZE);',
              'onmessage = function(msg) {',
              '  if (msg.data.options) {',
              '    CONFETTI(msg.data.options).then(function () {',
              '      if (msg.data.callback) {',
              '        postMessage({ callback: msg.data.callback });',
              '      }',
              '    });',
              '  } else if (msg.data.reset) {',
              '    CONFETTI.reset();',
              '  } else if (msg.data.resize) {',
              '    SIZE.width = msg.data.resize.width;',
              '    SIZE.height = msg.data.resize.height;',
              '  } else if (msg.data.canvas) {',
              '    SIZE.width = msg.data.canvas.width;',
              '    SIZE.height = msg.data.canvas.height;',
              '    CONFETTI = module.exports.create(msg.data.canvas);',
              '  }',
              '}',
            ].join('\n');
            try {
              worker = new Worker(URL.createObjectURL(new Blob([code])));
            } catch (e) {
              // eslint-disable-next-line no-console
              typeof console !== undefined && typeof console.warn === 'function' ? console.warn('🎊 Could not load worker', e) : null;

              return null;
            }

            decorate(worker);
          }

          return worker;
        };
      })();

      var defaults = {
        particleCount: 50,
        angle: 90,
        spread: 45,
        startVelocity: 45,
        decay: 0.9,
        gravity: 1,
        ticks: 200,
        x: 0.5,
        y: 0.5,
        shapes: ['square', 'circle'],
        zIndex: 100,
        colors: [
          '#26ccff',
          '#a25afd',
          '#ff5e7e',
          '#88ff5a',
          '#fcff42',
          '#ffa62d',
          '#ff36ff'
        ],
        // probably should be true, but back-compat
        disableForReducedMotion: false,
        scalar: 1
      };

      function convert(val, transform) {
        return transform ? transform(val) : val;
      }

      function isOk(val) {
        return !(val === null || val === undefined);
      }

      function prop(options, name, transform) {
        return convert(
          options && isOk(options[name]) ? options[name] : defaults[name],
          transform
        );
      }

      function onlyPositiveInt(number){
        return number < 0 ? 0 : Math.floor(number);
      }

      function randomInt(min, max) {
        // [min, max)
        return Math.floor(Math.random() * (max - min)) + min;
      }

      function toDecimal(str) {
        return parseInt(str, 16);
      }

      function colorsToRgb(colors) {
        return colors.map(hexToRgb);
      }

      function hexToRgb(str) {
        var val = String(str).replace(/[^0-9a-f]/gi, '');

        if (val.length < 6) {
            val = val[0]+val[0]+val[1]+val[1]+val[2]+val[2];
        }

        return {
          r: toDecimal(val.substring(0,2)),
          g: toDecimal(val.substring(2,4)),
          b: toDecimal(val.substring(4,6))
        };
      }

      function getOrigin(options) {
        var origin = prop(options, 'origin', Object);
        origin.x = prop(origin, 'x', Number);
        origin.y = prop(origin, 'y', Number);

        return origin;
      }

      function setCanvasWindowSize(canvas) {
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
      }

      function setCanvasRectSize(canvas) {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      function getCanvas(zIndex) {
        var canvas = document.createElement('canvas');

        canvas.style.position = 'fixed';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = zIndex;

        return canvas;
      }

      function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
        context.save();
        context.translate(x, y);
        context.rotate(rotation);
        context.scale(radiusX, radiusY);
        context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
        context.restore();
      }

      function randomPhysics(opts) {
        var radAngle = opts.angle * (Math.PI / 180);
        var radSpread = opts.spread * (Math.PI / 180);

        return {
          x: opts.x,
          y: opts.y,
          wobble: Math.random() * 10,
          velocity: (opts.startVelocity * 0.5) + (Math.random() * opts.startVelocity),
          angle2D: -radAngle + ((0.5 * radSpread) - (Math.random() * radSpread)),
          tiltAngle: Math.random() * Math.PI,
          color: opts.color,
          shape: opts.shape,
          tick: 0,
          totalTicks: opts.ticks,
          decay: opts.decay,
          random: Math.random() + 5,
          tiltSin: 0,
          tiltCos: 0,
          wobbleX: 0,
          wobbleY: 0,
          gravity: opts.gravity * 3,
          ovalScalar: 0.6,
          scalar: opts.scalar
        };
      }

      function updateFetti(context, fetti) {
        fetti.x += Math.cos(fetti.angle2D) * fetti.velocity;
        fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
        fetti.wobble += 0.1;
        fetti.velocity *= fetti.decay;
        fetti.tiltAngle += 0.1;
        fetti.tiltSin = Math.sin(fetti.tiltAngle);
        fetti.tiltCos = Math.cos(fetti.tiltAngle);
        fetti.random = Math.random() + 5;
        fetti.wobbleX = fetti.x + ((10 * fetti.scalar) * Math.cos(fetti.wobble));
        fetti.wobbleY = fetti.y + ((10 * fetti.scalar) * Math.sin(fetti.wobble));

        var progress = (fetti.tick++) / fetti.totalTicks;

        var x1 = fetti.x + (fetti.random * fetti.tiltCos);
        var y1 = fetti.y + (fetti.random * fetti.tiltSin);
        var x2 = fetti.wobbleX + (fetti.random * fetti.tiltCos);
        var y2 = fetti.wobbleY + (fetti.random * fetti.tiltSin);

        context.fillStyle = 'rgba(' + fetti.color.r + ', ' + fetti.color.g + ', ' + fetti.color.b + ', ' + (1 - progress) + ')';
        context.beginPath();

        if (fetti.shape === 'circle') {
          context.ellipse ?
            context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) :
            ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
        } else {
          context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
          context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
          context.lineTo(Math.floor(x2), Math.floor(y2));
          context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
        }

        context.closePath();
        context.fill();

        return fetti.tick < fetti.totalTicks;
      }

      function animate(canvas, fettis, resizer, size, done) {
        var animatingFettis = fettis.slice();
        var context = canvas.getContext('2d');
        var animationFrame;
        var destroy;

        var prom = promise(function (resolve) {
          function onDone() {
            animationFrame = destroy = null;

            context.clearRect(0, 0, size.width, size.height);

            done();
            resolve();
          }

          function update() {
            if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
              size.width = canvas.width = workerSize.width;
              size.height = canvas.height = workerSize.height;
            }

            if (!size.width && !size.height) {
              resizer(canvas);
              size.width = canvas.width;
              size.height = canvas.height;
            }

            context.clearRect(0, 0, size.width, size.height);

            animatingFettis = animatingFettis.filter(function (fetti) {
              return updateFetti(context, fetti);
            });

            if (animatingFettis.length) {
              animationFrame = raf.frame(update);
            } else {
              onDone();
            }
          }

          animationFrame = raf.frame(update);
          destroy = onDone;
        });

        return {
          addFettis: function (fettis) {
            animatingFettis = animatingFettis.concat(fettis);

            return prom;
          },
          canvas: canvas,
          promise: prom,
          reset: function () {
            if (animationFrame) {
              raf.cancel(animationFrame);
            }

            if (destroy) {
              destroy();
            }
          }
        };
      }

      function confettiCannon(canvas, globalOpts) {
        var isLibCanvas = !canvas;
        var allowResize = !!prop(globalOpts || {}, 'resize');
        var globalDisableForReducedMotion = prop(globalOpts, 'disableForReducedMotion', Boolean);
        var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, 'useWorker');
        var worker = shouldUseWorker ? getWorker() : null;
        var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
        var initialized = (canvas && worker) ? !!canvas.__confetti_initialized : false;
        var preferLessMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion)').matches;
        var animationObj;

        function fireLocal(options, size, done) {
          var particleCount = prop(options, 'particleCount', onlyPositiveInt);
          var angle = prop(options, 'angle', Number);
          var spread = prop(options, 'spread', Number);
          var startVelocity = prop(options, 'startVelocity', Number);
          var decay = prop(options, 'decay', Number);
          var gravity = prop(options, 'gravity', Number);
          var colors = prop(options, 'colors', colorsToRgb);
          var ticks = prop(options, 'ticks', Number);
          var shapes = prop(options, 'shapes');
          var scalar = prop(options, 'scalar');
          var origin = getOrigin(options);

          var temp = particleCount;
          var fettis = [];

          var startX = canvas.width * origin.x;
          var startY = canvas.height * origin.y;

          while (temp--) {
            fettis.push(
              randomPhysics({
                x: startX,
                y: startY,
                angle: angle,
                spread: spread,
                startVelocity: startVelocity,
                color: colors[temp % colors.length],
                shape: shapes[randomInt(0, shapes.length)],
                ticks: ticks,
                decay: decay,
                gravity: gravity,
                scalar: scalar
              })
            );
          }

          // if we have a previous canvas already animating,
          // add to it
          if (animationObj) {
            return animationObj.addFettis(fettis);
          }

          animationObj = animate(canvas, fettis, resizer, size , done);

          return animationObj.promise;
        }

        function fire(options) {
          var disableForReducedMotion = globalDisableForReducedMotion || prop(options, 'disableForReducedMotion', Boolean);
          var zIndex = prop(options, 'zIndex', Number);

          if (disableForReducedMotion && preferLessMotion) {
            return promise(function (resolve) {
              resolve();
            });
          }

          if (isLibCanvas && animationObj) {
            // use existing canvas from in-progress animation
            canvas = animationObj.canvas;
          } else if (isLibCanvas && !canvas) {
            // create and initialize a new canvas
            canvas = getCanvas(zIndex);
            document.body.appendChild(canvas);
          }

          if (allowResize && !initialized) {
            // initialize the size of a user-supplied canvas
            resizer(canvas);
          }

          var size = {
            width: canvas.width,
            height: canvas.height
          };

          if (worker && !initialized) {
            worker.init(canvas);
          }

          initialized = true;

          if (worker) {
            canvas.__confetti_initialized = true;
          }

          function onResize() {
            if (worker) {
              // TODO this really shouldn't be immediate, because it is expensive
              var obj = {
                getBoundingClientRect: function () {
                  if (!isLibCanvas) {
                    return canvas.getBoundingClientRect();
                  }
                }
              };

              resizer(obj);

              worker.postMessage({
                resize: {
                  width: obj.width,
                  height: obj.height
                }
              });
              return;
            }

            // don't actually query the size here, since this
            // can execute frequently and rapidly
            size.width = size.height = null;
          }

          function done() {
            animationObj = null;

            if (allowResize) {
              global.removeEventListener('resize', onResize);
            }

            if (isLibCanvas && canvas) {
              document.body.removeChild(canvas);
              canvas = null;
              initialized = false;
            }
          }

          if (allowResize) {
            global.addEventListener('resize', onResize, false);
          }

          if (worker) {
            return worker.fire(options, size, done);
          }

          return fireLocal(options, size, done);
        }

        fire.reset = function () {
          if (worker) {
            worker.reset();
          }

          if (animationObj) {
            animationObj.reset();
          }
        };

        return fire;
      }

      module.exports = confettiCannon(null, { useWorker: true, resize: true });
      module.exports.create = confettiCannon;
    }((function () {
      if (typeof window !== 'undefined') {
        return window;
      }

      if (typeof self !== 'undefined') {
        return self;
      }

      return this || {};
    })(), module, false));

    // end source content

    var confetti = module.exports;
    module.exports.create;

    /* src/components/Question.svelte generated by Svelte v3.32.3 */
    const file = "src/components/Question.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (4:8) {#if description}
    function create_if_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*description*/ ctx[0]);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file, 4, 12, 147);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 1) set_data_dev(t, /*description*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(4:8) {#if description}",
    		ctx
    	});

    	return block;
    }

    // (8:12) {#each answers as answer}
    function create_each_block(ctx) {
    	let button;
    	let t_value = /*answer*/ ctx[6].text + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", button_class_value = "btn " + /*answer*/ ctx[6].class);
    			add_location(button, file, 8, 16, 343);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*clickAnswer*/ ctx[4](/*answer*/ ctx[6].newState))) /*clickAnswer*/ ctx[4](/*answer*/ ctx[6].newState).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*answers*/ 8 && t_value !== (t_value = /*answer*/ ctx[6].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*answers*/ 8 && button_class_value !== (button_class_value = "btn " + /*answer*/ ctx[6].class)) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:12) {#each answers as answer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let div2_class_value;
    	let if_block = /*description*/ ctx[0] && create_if_block(ctx);
    	let each_value = /*answers*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(/*text*/ ctx[2]);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "card-title mb-3");
    			add_location(h3, file, 2, 8, 68);
    			attr_dev(div0, "class", "btn-group btn-group-lg d-flex");
    			attr_dev(div0, "role", "group");
    			attr_dev(div0, "aria-label", "Antwoorden");
    			add_location(div0, file, 6, 8, 208);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file, 1, 4, 36);
    			attr_dev(div2, "class", div2_class_value = "card card-" + /*type*/ ctx[1]);
    			add_location(div2, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 4) set_data_dev(t0, /*text*/ ctx[2]);

    			if (/*description*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*answers, clickAnswer*/ 24) {
    				each_value = /*answers*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*type*/ 2 && div2_class_value !== (div2_class_value = "card card-" + /*type*/ ctx[1])) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Question", slots, []);
    	let { description } = $$props;
    	let { type } = $$props;
    	let { text } = $$props;
    	let { answers } = $$props;
    	const dispatch = createEventDispatcher();

    	function clickAnswer(newState) {
    		dispatch("answer", { newState });
    	}

    	const writable_props = ["description", "type", "text", "answers"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Question> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("answers" in $$props) $$invalidate(3, answers = $$props.answers);
    	};

    	$$self.$capture_state = () => ({
    		description,
    		type,
    		text,
    		answers,
    		createEventDispatcher,
    		dispatch,
    		clickAnswer
    	});

    	$$self.$inject_state = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("answers" in $$props) $$invalidate(3, answers = $$props.answers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, type, text, answers, clickAnswer];
    }

    class Question extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			description: 0,
    			type: 1,
    			text: 2,
    			answers: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*description*/ ctx[0] === undefined && !("description" in props)) {
    			console.warn("<Question> was created without expected prop 'description'");
    		}

    		if (/*type*/ ctx[1] === undefined && !("type" in props)) {
    			console.warn("<Question> was created without expected prop 'type'");
    		}

    		if (/*text*/ ctx[2] === undefined && !("text" in props)) {
    			console.warn("<Question> was created without expected prop 'text'");
    		}

    		if (/*answers*/ ctx[3] === undefined && !("answers" in props)) {
    			console.warn("<Question> was created without expected prop 'answers'");
    		}
    	}

    	get description() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get answers() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answers(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Answer.svelte generated by Svelte v3.32.3 */

    const file$1 = "src/components/Answer.svelte";

    // (2:4) {#if image}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "card-img-top");
    			if (img.src !== (img_src_value = "/images/" + /*image*/ ctx[5])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 2, 8, 121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*image*/ 32 && img.src !== (img_src_value = "/images/" + /*image*/ ctx[5])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(2:4) {#if image}",
    		ctx
    	});

    	return block;
    }

    // (7:8) {#if description}
    function create_if_block_1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*description*/ ctx[0]);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$1, 7, 12, 302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 1) set_data_dev(t, /*description*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(7:8) {#if description}",
    		ctx
    	});

    	return block;
    }

    // (11:8) {#if link}
    function create_if_block$1(ctx) {
    	let p;
    	let i;
    	let t0;
    	let a;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i = element("i");
    			t0 = text("Check voor de zekerheid ");
    			a = element("a");
    			t1 = text("de tabel op Rijksoverheid.nl");
    			attr_dev(a, "href", /*link*/ ctx[3]);
    			add_location(a, file$1, 12, 43, 453);
    			add_location(i, file$1, 12, 16, 426);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$1, 11, 12, 388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i);
    			append_dev(i, t0);
    			append_dev(i, a);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*link*/ 8) {
    				attr_dev(a, "href", /*link*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:8) {#if link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let h3;
    	let t1;
    	let t2;
    	let t3;
    	let div1_class_value;
    	let if_block0 = /*image*/ ctx[5] && create_if_block_2(ctx);
    	let if_block1 = /*description*/ ctx[0] && create_if_block_1(ctx);
    	let if_block2 = /*link*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(/*text*/ ctx[2]);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(h3, "class", "card-title mb-3");
    			add_location(h3, file$1, 5, 8, 223);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$1, 4, 4, 191);
    			attr_dev(div1, "class", div1_class_value = "card card-" + /*type*/ ctx[1]);
    			toggle_class(div1, "border-success", /*confetti*/ ctx[4]);
    			toggle_class(div1, "text-success", /*confetti*/ ctx[4]);
    			add_location(div1, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block2) if_block2.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*image*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*text*/ 4) set_data_dev(t1, /*text*/ ctx[2]);

    			if (/*description*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div0, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*link*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*type*/ 2 && div1_class_value !== (div1_class_value = "card card-" + /*type*/ ctx[1])) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*type, confetti*/ 18) {
    				toggle_class(div1, "border-success", /*confetti*/ ctx[4]);
    			}

    			if (dirty & /*type, confetti*/ 18) {
    				toggle_class(div1, "text-success", /*confetti*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Answer", slots, []);
    	let { description } = $$props;
    	let { type } = $$props;
    	let { text } = $$props;
    	let { link } = $$props;
    	let { confetti } = $$props;
    	let { image } = $$props;
    	const writable_props = ["description", "type", "text", "link", "confetti", "image"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Answer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("link" in $$props) $$invalidate(3, link = $$props.link);
    		if ("confetti" in $$props) $$invalidate(4, confetti = $$props.confetti);
    		if ("image" in $$props) $$invalidate(5, image = $$props.image);
    	};

    	$$self.$capture_state = () => ({
    		description,
    		type,
    		text,
    		link,
    		confetti,
    		image
    	});

    	$$self.$inject_state = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("link" in $$props) $$invalidate(3, link = $$props.link);
    		if ("confetti" in $$props) $$invalidate(4, confetti = $$props.confetti);
    		if ("image" in $$props) $$invalidate(5, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, type, text, link, confetti, image];
    }

    class Answer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			description: 0,
    			type: 1,
    			text: 2,
    			link: 3,
    			confetti: 4,
    			image: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Answer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*description*/ ctx[0] === undefined && !("description" in props)) {
    			console.warn("<Answer> was created without expected prop 'description'");
    		}

    		if (/*type*/ ctx[1] === undefined && !("type" in props)) {
    			console.warn("<Answer> was created without expected prop 'type'");
    		}

    		if (/*text*/ ctx[2] === undefined && !("text" in props)) {
    			console.warn("<Answer> was created without expected prop 'text'");
    		}

    		if (/*link*/ ctx[3] === undefined && !("link" in props)) {
    			console.warn("<Answer> was created without expected prop 'link'");
    		}

    		if (/*confetti*/ ctx[4] === undefined && !("confetti" in props)) {
    			console.warn("<Answer> was created without expected prop 'confetti'");
    		}

    		if (/*image*/ ctx[5] === undefined && !("image" in props)) {
    			console.warn("<Answer> was created without expected prop 'image'");
    		}
    	}

    	get description() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get confetti() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set confetti(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/QuestionList.svelte generated by Svelte v3.32.3 */
    const file$2 = "src/components/QuestionList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (4:8) {#if description}
    function create_if_block$2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*description*/ ctx[0]);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$2, 4, 12, 142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 1) set_data_dev(t, /*description*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(4:8) {#if description}",
    		ctx
    	});

    	return block;
    }

    // (8:12) {#each answers as answer}
    function create_each_block$1(ctx) {
    	let button;
    	let t_value = /*answer*/ ctx[6].text + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-outline-secondary");
    			add_location(button, file$2, 8, 16, 347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*clickAnswer*/ ctx[4](/*answer*/ ctx[6].newState))) /*clickAnswer*/ ctx[4](/*answer*/ ctx[6].newState).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*answers*/ 8 && t_value !== (t_value = /*answer*/ ctx[6].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(8:12) {#each answers as answer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let div2_class_value;
    	let if_block = /*description*/ ctx[0] && create_if_block$2(ctx);
    	let each_value = /*answers*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(/*text*/ ctx[2]);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "card-title");
    			add_location(h3, file$2, 2, 8, 68);
    			attr_dev(div0, "class", "btn-group-vertical btn-group-lg d-flex");
    			attr_dev(div0, "role", "group");
    			attr_dev(div0, "aria-label", "Antwoorden");
    			add_location(div0, file$2, 6, 8, 203);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$2, 1, 4, 36);
    			attr_dev(div2, "class", div2_class_value = "card card-" + /*type*/ ctx[1]);
    			add_location(div2, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 4) set_data_dev(t0, /*text*/ ctx[2]);

    			if (/*description*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*clickAnswer, answers*/ 24) {
    				each_value = /*answers*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*type*/ 2 && div2_class_value !== (div2_class_value = "card card-" + /*type*/ ctx[1])) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuestionList", slots, []);
    	let { description } = $$props;
    	let { type } = $$props;
    	let { text } = $$props;
    	let { answers } = $$props;
    	const dispatch = createEventDispatcher();

    	function clickAnswer(newState) {
    		dispatch("answer", { newState });
    	}

    	const writable_props = ["description", "type", "text", "answers"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QuestionList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("answers" in $$props) $$invalidate(3, answers = $$props.answers);
    	};

    	$$self.$capture_state = () => ({
    		description,
    		type,
    		text,
    		answers,
    		createEventDispatcher,
    		dispatch,
    		clickAnswer
    	});

    	$$self.$inject_state = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("answers" in $$props) $$invalidate(3, answers = $$props.answers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, type, text, answers, clickAnswer];
    }

    class QuestionList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			description: 0,
    			type: 1,
    			text: 2,
    			answers: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuestionList",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*description*/ ctx[0] === undefined && !("description" in props)) {
    			console.warn("<QuestionList> was created without expected prop 'description'");
    		}

    		if (/*type*/ ctx[1] === undefined && !("type" in props)) {
    			console.warn("<QuestionList> was created without expected prop 'type'");
    		}

    		if (/*text*/ ctx[2] === undefined && !("text" in props)) {
    			console.warn("<QuestionList> was created without expected prop 'text'");
    		}

    		if (/*answers*/ ctx[3] === undefined && !("answers" in props)) {
    			console.warn("<QuestionList> was created without expected prop 'answers'");
    		}
    	}

    	get description() {
    		throw new Error("<QuestionList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<QuestionList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<QuestionList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<QuestionList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<QuestionList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<QuestionList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get answers() {
    		throw new Error("<QuestionList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answers(value) {
    		throw new Error("<QuestionList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var steps = {
        '1': {
            'type': Question,
            'text': 'Werk je in de zorg?',
            'description': 'Als zorgverlener, arts of andere uitvoerende rol?',
            'answers': [
                {
                    'text': "Ja",
                    'class': 'btn-success',
                    'newState': '100'
                },
                {
                    'text': "Nee",
                    'class': 'btn-danger',
                    'newState': '2'
                }
            ]
        },
        '2': {
            'type': Question,
            'text': 'Ben je 60 jaar of ouder?',
            'description': 'Je leeftijd bepaalt wanneer je het vaccin krijgt',
            'answers': [
                {
                    'text': "Ja",
                    'class': 'btn-success',
                    'newState': '200'
                },
                {
                    'text': "Nee",
                    'class': 'btn-danger',
                    'newState': '3'
                }
            ]
        },
        '3': {
            'type': Question,
            'text': 'Woon je in een kleinschalige woonvorm OF heb je een verstandelijke beperking en woon je in een instelling?',
            'answers': [
                {
                    'text': "Ja",
                    'class': 'btn-success',
                    'newState': '300'
                },
                {
                    'text': "Nee",
                    'class': 'btn-danger',
                    'newState': '4'
                }
            ]
        },
        '4': {
            'type': Question,
            'text': 'Woon je op st. Eustasius of Saba?',
            'answers': [
                {
                    'text': "Ja",
                    'class': 'btn-success',
                    'newState': '400'
                },
                {
                    'text': "Nee",
                    'class': 'btn-danger',
                    'newState': '500'
                }
            ]
        },
        '100': {
            'type': QuestionList,
            'text': 'Bij wat voor soort zorg organisatie werk je?',
            'answers': [
                {
                    'text': "Een verpleeghuis",
                    'newState': '102'
                },
                {
                    'text': "Directe COVID zorg in een ziekenhuis",
                    'newState': '103'
                },
                {
                    'text': "GGZ en crisisdienst",
                    'newState': '102'
                },
                {
                    'text': "Wijkverpleging, WMO ondersteuning of PGB zorgverleners",
                    'newState': '104'
                },
                {
                    'text': "Een ambulance",
                    'newState': '103'
                },
                {
                    'text': "Klinish medische specialistische revalidatie of gehandicaptenzorg",
                    'newState': '102'
                },
                {
                    'text': "Bij een zorgorganisatie op de waddeneilanden",
                    'newState': '105'
                },
                {
                    'text': "Bij een zorgorganisatie op de BES & CAS eilanden",
                    'newState': '102'
                },
                {
                    'text': "Wel in de zorg maar niet in eerder genoemde",
                    'newState': '101'
                }
            ]
        },
        '101': {
            'type': Answer,
            'text': 'Vanaf mei is het mogelijk dat je het vaccin zou kunnen ontvangen',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
            'confetti': true,
            'image': 'waiting.gif'
        },
        '102': {
            'type': Answer,
            'text': 'Je krijgt een uitnodiging voor een vaccin bij een GGD priklocatie',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
            'confetti': true,
            'image': 'mail.gif'
        },
        '103': {
            'type': Answer,
            'text': 'Vraag je leidinggevende voor een vaccin in het ziekenhuis',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
            'confetti': true,
            'image': 'vaccine.gif'
        },
        '104': {
            'type': Answer,
            'text': 'Vanaf begin maart kan je een vaccin krijgen',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
            'image': 'waiting.gif'
        },
        '105': {
            'type': Answer,
            'text': 'Je kan het vaccin krijgen via de GGD of de huisarts',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
            'confetti': true,
            'image': 'vaccine.gif'
        },
        '200': {
            'type': Answer,
            'text': 'Je ontvangt een bericht wanneer je een vaccin kan ontvangen',
            'description': 'Je ontvangt een brief wanneer je een vaccin krijgt of je krijgt een bericht van je huisarts',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
            'confetti': true,
            'image': 'mail.gif'
        },
        '300': {
            'type': Answer,
            'text': 'Vraag je instellings arts wanneer je een vaccin kan ontvangen',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
            'image': 'vaccine.gif'
        },
        '400': {
            'type': Answer,
            'text': 'Je ontvangt een brief van de GGD voor het vaccin',
            'description': 'Je ontvangt een brief wanneer je een vaccin krijgt of je krijgt een bericht van je huisarts',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
            'confetti': true,
            'image': 'mail.gif'
        },
        '500': {
            'type': Answer,
            'text': 'De verwachting is dat het vaccin vanaf mei beschikbaar is.',
            'description': 'Zodra er speciekere data beschikbaar is vullen we dit aan! #duurtlang',
            'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
            'image': 'waiting.gif'
        }
    };

    /* src/App.svelte generated by Svelte v3.32.3 */

    const { console: console_1 } = globals;
    const file$3 = "src/App.svelte";

    // (27:28) 
    function create_if_block_1$1(ctx) {
    	let div2;
    	let h3;
    	let t0;
    	let a0;
    	let t2;
    	let a1;
    	let t4;
    	let div0;
    	let h40;
    	let t6;
    	let p0;
    	let t7;
    	let strong;
    	let t9;
    	let ul;
    	let li0;
    	let a2;
    	let t11;
    	let li1;
    	let a3;
    	let t13;
    	let p1;
    	let t15;
    	let p2;
    	let t16;
    	let a4;
    	let t18;
    	let t19;
    	let h41;
    	let t21;
    	let p3;
    	let t22;
    	let a5;
    	let t24;
    	let a6;
    	let t26;
    	let a7;
    	let t28;
    	let a8;
    	let t30;
    	let t31;
    	let p4;
    	let i0;
    	let t33;
    	let p5;
    	let i1;
    	let t34;
    	let a9;
    	let t36;
    	let t37;
    	let p6;
    	let i2;
    	let t39;
    	let p7;
    	let t40;
    	let a10;
    	let t42;
    	let t43;
    	let h42;
    	let t45;
    	let p8;
    	let t46;
    	let a11;
    	let t48;
    	let t49;
    	let h43;
    	let t51;
    	let p9;
    	let t52;
    	let a12;
    	let t54;
    	let code;
    	let t56;
    	let t57;
    	let div1;
    	let a13;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			t0 = text("Over ");
    			a0 = element("a");
    			a0.textContent = "magikalprikken.nl";
    			t2 = text(" / ");
    			a1 = element("a");
    			a1.textContent = "magikaleenprik.nl";
    			t4 = space();
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Waarom bestaat deze pagina?";
    			t6 = space();
    			p0 = element("p");
    			t7 = text("De twee beschikbare tabellen van de Rijksoverheid zijn lang/groot en niet gebruiksvriendelijk als je wilt weten wanneer jij een COVID-19 vaccin zou kunnen krijgen.\n\t\t\t\t\t\tMet deze pagina hopen we dat meer mensen een duidelijk antwoord kunnen te geven. \n\t\t\t\t\t\t");
    			strong = element("strong");
    			strong.textContent = "Let op! Het is altijd goed om dubbel te checken bij de Rijksoverheid zelf, \n\t\t\t\t\t\thiervoor kun je de twee volgende tabellen gebruiken:";
    			t9 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a2 = element("a");
    			a2.textContent = "Zorgmedewerkers";
    			t11 = space();
    			li1 = element("li");
    			a3 = element("a");
    			a3.textContent = "Mensen die niet in de zorg werken";
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "Wij doen ons best om de volgorde en data up to date te houden, maar bevestig altijd de uitkomst met de data van de rijksoverheid zelf. Er kunnen dus absoluut geen rechten worden ontleend aan deze website.";
    			t15 = space();
    			p2 = element("p");
    			t16 = text("Vind je een bug of klopt de data niet meer? Laat het ons weten door het aanmaken ");
    			a4 = element("a");
    			a4.textContent = "van een Github issue";
    			t18 = text(".");
    			t19 = space();
    			h41 = element("h4");
    			h41.textContent = "Wie heeft dit bedacht en waarom?";
    			t21 = space();
    			p3 = element("p");
    			t22 = text("Wij (");
    			a5 = element("a");
    			a5.textContent = "Arjan";
    			t24 = text(", ");
    			a6 = element("a");
    			a6.textContent = "Chantal";
    			t26 = text(", ");
    			a7 = element("a");
    			a7.textContent = "Channah";
    			t28 = text(" & ");
    			a8 = element("a");
    			a8.textContent = "Joost";
    			t30 = text(") hebben in een avond dit systeem bedacht en gemaakt.\n\t\t\t\t\t\tDit systeem heeft een simpel doel: mensen informeren wanneer ze worden geprikt. We\n\t\t\t\t\t\tsnappen ook niet waarom het zo moeilijk was, maar nemen je graag mee in het verhaal. Het\n\t\t\t\t\t\tbegon allemaal zo:");
    			t31 = space();
    			p4 = element("p");
    			i0 = element("i");
    			i0.textContent = "De ouders van Chantal zouden mogelijk in aanmerking komen voor een COVID-19 vaccin, maar\n\t\t\t\t\t\twas dat ook echt zo? Chantal, opgeleid psychologe en nu consultant (waarom dit ertoe doet\n\t\t\t\t\t\tvertellen we je zo) keek op de website van de overheid maar kwam er niet uit. Krijgen haar\n\t\t\t\t\t\touders nou een prik? Wanneer dan? En hoe?";
    			t33 = space();
    			p5 = element("p");
    			i1 = element("i");
    			t34 = text("Ze vroegen het Arjan (Arts, oprichter van ");
    			a9 = element("a");
    			a9.textContent = "Stichting Vaccinatie-Team";
    			t36 = text(", ervaring op Corona afdeling, \n\t\t\t\t\t\tdie zal het vast weten). Die wist het ook niet, dus\n\t\t\t\t\t\thij keek op de website van de Rijksoverheid (die organisatie die ons ook een tip gaf over hoe\n\t\t\t\t\t\tvoetbal te kijken en sneeuwballen te gooien tijdens corona). Samen met Channah (praktiserend\n\t\t\t\t\t\tpsycholoog) en Joost (ondernemer & data strateeg) kwamen we er ook niet uit.");
    			t37 = space();
    			p6 = element("p");
    			i2 = element("i");
    			i2.textContent = "Dus waarom is het belangrijk dat Chantal consultant is, Arjan arts, Channah psycholoog en\n\t\t\t\t\t\tJoost data-strateeg? Omdat deze club semi-intellectuelen het systeem blijkbaar ook niet\n\t\t\t\t\t\tsnappen. Dan zijn wij niet slim genoeg of is de uitleg te complex (of beiden 🤓).";
    			t39 = space();
    			p7 = element("p");
    			t40 = text("We denken niet dat het ligt aan de Rijksoverheid, maar aan de complexe onderneming die het vaccineren\n\t\t\t\t\t\tgeworden is. Dus vandaar ");
    			a10 = element("a");
    			a10.textContent = "magikalprikken.nl";
    			t42 = text(" als oplossing!");
    			t43 = space();
    			h42 = element("h4");
    			h42.textContent = "En verder?";
    			t45 = space();
    			p8 = element("p");
    			t46 = text("Ben je van de Rijksoverheid en vind je het interessant om dit verder op te pakken zodat het wat makkelijk wordt? Of ben je van de pers en nieuwsgierig naar het hele verhaal? Volg dan ");
    			a11 = element("a");
    			a11.textContent = "Joost op twitter";
    			t48 = text(" en stuur een DM/mention.");
    			t49 = space();
    			h43 = element("h4");
    			h43.textContent = "Privacy & data verzameling";
    			t51 = space();
    			p9 = element("p");
    			t52 = text("Er wordt op deze website geen enkele data verzameld of verzonden naar derden. Geen cookies & geen tracking. \n\t\t\t\t\t\tDe pagina's staan gehost op ");
    			a12 = element("a");
    			a12.textContent = "Github";
    			t54 = text(", als mede ook alle code, dus die kan je zelf ook bekijken. \n\t\t\t\t\t\tDaarnaast maken we gebruik van Cloudflare for caching en de beveiligde verbinding (");
    			code = element("code");
    			code.textContent = "https";
    			t56 = text(").");
    			t57 = space();
    			div1 = element("div");
    			a13 = element("a");
    			a13.textContent = "« terug naar de vragen";
    			attr_dev(a0, "href", "https://magikalprikken.nl");
    			add_location(a0, file$3, 29, 26, 1730);
    			attr_dev(a1, "href", "https://magikaleenprik.nl");
    			add_location(a1, file$3, 29, 86, 1790);
    			attr_dev(h3, "class", "mb-5");
    			add_location(h3, file$3, 29, 4, 1708);
    			add_location(h40, file$3, 32, 5, 1888);
    			add_location(strong, file$3, 37, 6, 2199);
    			add_location(p0, file$3, 34, 5, 1931);
    			attr_dev(a2, "href", "https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers");
    			add_location(a2, file$3, 42, 10, 2383);
    			add_location(li0, file$3, 42, 6, 2379);
    			attr_dev(a3, "href", "https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken");
    			add_location(a3, file$3, 43, 10, 2574);
    			add_location(li1, file$3, 43, 6, 2570);
    			add_location(ul, file$3, 41, 5, 2368);
    			add_location(p1, file$3, 46, 5, 2813);
    			attr_dev(a4, "href", "https://github.com/jplattel/magikalprikken.nl/issues/new");
    			add_location(a4, file$3, 48, 89, 3115);
    			add_location(p2, file$3, 48, 5, 3031);
    			add_location(h41, file$3, 50, 5, 3218);
    			attr_dev(a5, "href", "https://nl.linkedin.com/in/arjan-sammani");
    			add_location(a5, file$3, 53, 11, 3281);
    			attr_dev(a6, "href", "https://www.linkedin.com/in/chantalvankempen/");
    			add_location(a6, file$3, 53, 73, 3343);
    			attr_dev(a7, "href", "https://www.linkedin.com/in/channah-ruiter/");
    			add_location(a7, file$3, 53, 142, 3412);
    			attr_dev(a8, "href", "https://jplattel.nl");
    			add_location(a8, file$3, 53, 210, 3480);
    			add_location(p3, file$3, 52, 5, 3266);
    			add_location(i0, file$3, 59, 6, 3807);
    			add_location(p4, file$3, 58, 5, 3797);
    			attr_dev(a9, "href", "http://vaccinatie-team.nl/");
    			add_location(a9, file$3, 68, 48, 4235);
    			add_location(i1, file$3, 67, 6, 4183);
    			add_location(p5, file$3, 66, 5, 4173);
    			add_location(i2, file$3, 76, 6, 4709);
    			add_location(p6, file$3, 75, 5, 4699);
    			attr_dev(a10, "href", "magikalprikken.nl");
    			add_location(a10, file$3, 84, 31, 5161);
    			add_location(p7, file$3, 82, 5, 5018);
    			add_location(h42, file$3, 87, 5, 5243);
    			attr_dev(a11, "href", "https://twitter.com/jplattel");
    			add_location(a11, file$3, 90, 189, 5462);
    			add_location(p8, file$3, 89, 5, 5269);
    			add_location(h43, file$3, 93, 5, 5563);
    			attr_dev(a12, "href", "https://github.com/jplattel/magikalprikken.nl");
    			add_location(a12, file$3, 97, 34, 5758);
    			add_location(code, file$3, 98, 89, 5974);
    			add_location(p9, file$3, 95, 5, 5605);
    			attr_dev(div0, "class", "text-start");
    			add_location(div0, file$3, 31, 4, 1858);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "btn btn-outline-primary");
    			add_location(a13, file$3, 103, 5, 6056);
    			attr_dev(div1, "class", "d-grid mb-3");
    			add_location(div1, file$3, 102, 4, 6025);
    			attr_dev(div2, "class", "col-md-8");
    			add_location(div2, file$3, 27, 3, 1680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(h3, t0);
    			append_dev(h3, a0);
    			append_dev(h3, t2);
    			append_dev(h3, a1);
    			append_dev(div2, t4);
    			append_dev(div2, div0);
    			append_dev(div0, h40);
    			append_dev(div0, t6);
    			append_dev(div0, p0);
    			append_dev(p0, t7);
    			append_dev(p0, strong);
    			append_dev(div0, t9);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a2);
    			append_dev(ul, t11);
    			append_dev(ul, li1);
    			append_dev(li1, a3);
    			append_dev(div0, t13);
    			append_dev(div0, p1);
    			append_dev(div0, t15);
    			append_dev(div0, p2);
    			append_dev(p2, t16);
    			append_dev(p2, a4);
    			append_dev(p2, t18);
    			append_dev(div0, t19);
    			append_dev(div0, h41);
    			append_dev(div0, t21);
    			append_dev(div0, p3);
    			append_dev(p3, t22);
    			append_dev(p3, a5);
    			append_dev(p3, t24);
    			append_dev(p3, a6);
    			append_dev(p3, t26);
    			append_dev(p3, a7);
    			append_dev(p3, t28);
    			append_dev(p3, a8);
    			append_dev(p3, t30);
    			append_dev(div0, t31);
    			append_dev(div0, p4);
    			append_dev(p4, i0);
    			append_dev(div0, t33);
    			append_dev(div0, p5);
    			append_dev(p5, i1);
    			append_dev(i1, t34);
    			append_dev(i1, a9);
    			append_dev(i1, t36);
    			append_dev(div0, t37);
    			append_dev(div0, p6);
    			append_dev(p6, i2);
    			append_dev(div0, t39);
    			append_dev(div0, p7);
    			append_dev(p7, t40);
    			append_dev(p7, a10);
    			append_dev(p7, t42);
    			append_dev(div0, t43);
    			append_dev(div0, h42);
    			append_dev(div0, t45);
    			append_dev(div0, p8);
    			append_dev(p8, t46);
    			append_dev(p8, a11);
    			append_dev(p8, t48);
    			append_dev(div0, t49);
    			append_dev(div0, h43);
    			append_dev(div0, t51);
    			append_dev(div0, p9);
    			append_dev(p9, t52);
    			append_dev(p9, a12);
    			append_dev(p9, t54);
    			append_dev(p9, code);
    			append_dev(p9, t56);
    			append_dev(div2, t57);
    			append_dev(div2, div1);
    			append_dev(div1, a13);

    			if (!mounted) {
    				dispose = listen_dev(a13, "click", /*readMore*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(27:28) ",
    		ctx
    	});

    	return block;
    }

    // (5:2) {#if page == 'start'}
    function create_if_block$3(ctx) {
    	let div;
    	let p0;
    	let i;
    	let t1;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let strong;
    	let t7;
    	let t8;
    	let hr0;
    	let t9;
    	let switch_instance;
    	let t10;
    	let button;
    	let t12;
    	let hr1;
    	let t13;
    	let p1;
    	let t14;
    	let a2;
    	let t16;
    	let a3;
    	let t18;
    	let a4;
    	let t20;
    	let a5;
    	let t22;
    	let current;
    	let mounted;
    	let dispose;
    	const switch_instance_spread_levels = [steps[/*state*/ ctx[0]]];
    	var switch_value = steps[/*state*/ ctx[0]].type;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("answer", /*setState*/ ctx[2]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			i = element("i");
    			i.textContent = "Goeie vraag!";
    			t1 = text(" In plaats van de ");
    			a0 = element("a");
    			a0.textContent = "tabellen van";
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "de Rijksoverheid";
    			t5 = text(" door te speuren \n\t\t\t\t\thelpen wij jou met een paar vragen te bepalen wanneer je een ");
    			strong = element("strong");
    			strong.textContent = "COVID-19 vaccin";
    			t7 = text(" kan krijgen!");
    			t8 = space();
    			hr0 = element("hr");
    			t9 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t10 = space();
    			button = element("button");
    			button.textContent = "Reset ⟲";
    			t12 = space();
    			hr1 = element("hr");
    			t13 = space();
    			p1 = element("p");
    			t14 = text("Nieuwsgierig wie dit heeft gemaakt en waarom? Lees er ");
    			a2 = element("a");
    			a2.textContent = "hier";
    			t16 = text(" meer over. \n\t\t\t\t\tVragen of opmerkingen, ");
    			a3 = element("a");
    			a3.textContent = "maak een issue aan op Github";
    			t18 = text("!\n\t\t\t\t\tVind je dit tof? Deel deze pagina dan op ");
    			a4 = element("a");
    			a4.textContent = "Twitter";
    			t20 = text(" \n\t\t\t\t\tof ");
    			a5 = element("a");
    			a5.textContent = "Facebook";
    			t22 = text("! 👋");
    			add_location(i, file$3, 7, 5, 214);
    			attr_dev(a0, "href", "https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken");
    			add_location(a0, file$3, 7, 42, 251);
    			attr_dev(a1, "href", "https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers");
    			add_location(a1, file$3, 7, 238, 447);
    			add_location(strong, file$3, 8, 66, 707);
    			attr_dev(p0, "class", "text-start");
    			add_location(p0, file$3, 6, 4, 186);
    			add_location(hr0, file$3, 11, 4, 772);
    			attr_dev(button, "class", "btn btn-secondary mt-3");
    			attr_dev(button, "id", "reset");
    			add_location(button, file$3, 15, 4, 875);
    			add_location(hr1, file$3, 17, 4, 964);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$3, 20, 59, 1056);
    			attr_dev(a3, "href", "https://github.com/jplattel/magikalprikken.nl/issues");
    			add_location(a3, file$3, 21, 28, 1137);
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "href", "https://twitter.com/intent/tweet?url=https://magikaleenprik.nl/&text=Ook nieuwsgierig wanneer je een COVID-19 vaccin krijgt?&hashtags=covid19,magikaleenprik,magikalprikken,corona,vaccin");
    			add_location(a4, file$3, 22, 46, 1280);
    			attr_dev(a5, "href", "https://www.facebook.com/sharer/sharer.php?u=https://magikaleenprik.nl/");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$3, 23, 8, 1513);
    			attr_dev(p1, "class", "text-start");
    			add_location(p1, file$3, 19, 4, 974);
    			attr_dev(div, "class", "col-md-6");
    			add_location(div, file$3, 5, 3, 158);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, i);
    			append_dev(p0, t1);
    			append_dev(p0, a0);
    			append_dev(p0, t3);
    			append_dev(p0, a1);
    			append_dev(p0, t5);
    			append_dev(p0, strong);
    			append_dev(p0, t7);
    			append_dev(div, t8);
    			append_dev(div, hr0);
    			append_dev(div, t9);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t10);
    			append_dev(div, button);
    			append_dev(div, t12);
    			append_dev(div, hr1);
    			append_dev(div, t13);
    			append_dev(div, p1);
    			append_dev(p1, t14);
    			append_dev(p1, a2);
    			append_dev(p1, t16);
    			append_dev(p1, a3);
    			append_dev(p1, t18);
    			append_dev(p1, a4);
    			append_dev(p1, t20);
    			append_dev(p1, a5);
    			append_dev(p1, t22);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*reset*/ ctx[3], false, false, false),
    					listen_dev(a2, "click", /*readMore*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*steps, state*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(steps[/*state*/ ctx[0]])])
    			: {};

    			if (switch_value !== (switch_value = steps[/*state*/ ctx[0]].type)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("answer", /*setState*/ ctx[2]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t10);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(5:2) {#if page == 'start'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let div;
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[1] == "start") return 0;
    		if (/*page*/ ctx[1] == "info") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Mag ik al een prik? 💉";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "my-5");
    			add_location(h1, file$3, 2, 2, 84);
    			attr_dev(div, "class", "row justify-content-md-center");
    			add_location(div, file$3, 1, 1, 38);
    			attr_dev(main, "class", "container text-center svelte-1m67v3r");
    			add_location(main, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, h1);
    			append_dev(div, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let state = "1";
    	let page = "start";

    	// After answering, a question fires and 'answer' event for which we listen
    	const setState = event => {
    		console.debug("Setting state:", event.detail.newState);
    		$$invalidate(0, state = event.detail.newState);

    		// TODO, still need to add confetti
    		if (steps[state].confetti && steps[state].confetti === true) {
    			console.debug("Throw some confetti!");
    		}
    	};

    	// Back to the first question
    	const reset = () => $$invalidate(0, state = 1);

    	// Instead of toggle, this allows for more pages if we need those later...
    	const readMore = () => {
    		if (page === "start") {
    			$$invalidate(1, page = "info");
    		} else {
    			$$invalidate(1, page = "start");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		confetti,
    		Question,
    		Answer,
    		steps,
    		state,
    		page,
    		setState,
    		reset,
    		readMore
    	});

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, page, setState, reset, readMore];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

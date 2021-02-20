
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
    			add_location(p, file, 4, 12, 142);
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
    			add_location(button, file, 8, 16, 338);
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

    			attr_dev(h3, "class", "card-title");
    			add_location(h3, file, 2, 8, 68);
    			attr_dev(div0, "class", "btn-group btn-group-lg d-flex");
    			attr_dev(div0, "role", "group");
    			attr_dev(div0, "aria-label", "Antwoorden");
    			add_location(div0, file, 6, 8, 203);
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

    // (4:8) {#if description}
    function create_if_block$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*description*/ ctx[0]);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$1, 4, 12, 142);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(4:8) {#if description}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let h3;
    	let t0;
    	let t1;
    	let div1_class_value;
    	let if_block = /*description*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(/*text*/ ctx[2]);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(h3, "class", "card-title");
    			add_location(h3, file$1, 2, 8, 68);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$1, 1, 4, 36);
    			attr_dev(div1, "class", div1_class_value = "card card-" + /*type*/ ctx[1]);
    			add_location(div1, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 4) set_data_dev(t0, /*text*/ ctx[2]);

    			if (/*description*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*type*/ 2 && div1_class_value !== (div1_class_value = "card card-" + /*type*/ ctx[1])) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
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
    	const writable_props = ["description", "type", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Answer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ description, type, text });

    	$$self.$inject_state = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, type, text];
    }

    class Answer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { description: 0, type: 1, text: 2 });

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
            'description': 'Als zorgverlener',
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
            'description': 'Longer text here....',
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
            'text': 'Woon je in een kleinschalige woonvorm of heb je een verstandelijke beperking en woon je in een instelling?',
            'description': 'Longer text here....',
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
            'text': 'Woon e op st. Eustasius of Saba?',
            'description': 'Longer text here....',
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
            'text': 'Bij wat voor soort zorg organisatie werkt u?',
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
                    'newState': '102'
                },
                {
                    'text': "Een ambulance",
                    'newState': '103'
                },
                {
                    'text': "Klinish medische specialistische, revalidatie of gehandicaptenzorg",
                    'newState': '102'
                },
                {
                    'text': "Bij een zorgorganisatie op de waddeneilanden",
                    'newState': '102'
                },
                {
                    'text': "Bij een zorgorganisatie op DE BES & CAS eilanden",
                    'newState': '102'
                },
            ]
        },
        '101': {
            'type': Answer,
            'text': 'Ja! Je ontvangt een brief per post voor een datum!'
        },
        '102': {
            'type': Answer,
            'text': 'Ja! Je krijgt een uitnodiging voor een vaccin bij een GGD priklocatie'
        },
        '103': {
            'type': Answer,
            'text': 'Vraag je leidinggevende voor een vaccin in het ziekenhuis'
        },
        '200': {
            'type': Answer,
            'text': 'Je ontvangt een bericht wanneer je een vaccin krijgt',
            'description': 'Je ontvangt een brief wanneer je een vaccin krijgt of je krijgt een bericht van je huisarts'
        },
        '300': {
            'type': Answer,
            'text': 'Vraag je instellings arts wanneer je een vaccin kunt krijgt'
        },
        '400': {
            'type': Answer,
            'text': 'Je ontvangt een brief van de GGD voor het vaccin'
        },
        '500': {
            'type': Answer,
            'text': 'De verwachting is dat het vaccin vanaf mei beschikbaar is.'
        }
    };

    /* src/App.svelte generated by Svelte v3.32.3 */

    const { console: console_1 } = globals;
    const file$3 = "src/App.svelte";

    // (28:28) 
    function create_if_block_1(ctx) {
    	let div2;
    	let h3;
    	let t1;
    	let div0;
    	let h40;
    	let t3;
    	let p0;
    	let t5;
    	let ul;
    	let li0;
    	let a0;
    	let t7;
    	let li1;
    	let a1;
    	let t9;
    	let p1;
    	let t11;
    	let h41;
    	let t13;
    	let p2;
    	let t14;
    	let code;
    	let t16;
    	let t17;
    	let div1;
    	let a2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Over";
    			t1 = space();
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Waarom bestaat deze pagina?";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "De twee beschikbare tabellen van de Rijksoverheid zijn nogal groot en niet gebruiksvriendelijk als je wilt weten wanneer jij een COVID-19 vaccin zou kunnen krijgen.\n\t\t\t\t\t\tMet deze pagina hopen we dat meer mensen een duidelijk antwoord kunnen te geven. Let wel! Het is altijd goed om dubbel te checken bij de Rijksoverheid zelf, \n\t\t\t\t\t\thiervoor kun je de twee volgende tabellen gebruiken:";
    			t5 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Zorgmedewerkers";
    			t7 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Mensen die niet in de zorg werken";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "Wij doen ons best om de volgorde en data up to date te houden, maar bevestig altijd de uitkomst met de data van de rijksoverheid zelf. Er kunnen dus absoluut geen rechten worden ontleend aan deze website.";
    			t11 = space();
    			h41 = element("h4");
    			h41.textContent = "Privacy & data verzameling";
    			t13 = space();
    			p2 = element("p");
    			t14 = text("Er wordt op deze website geen enkele data verzameld of verzonden naar derden. Geen cookies & geen tracking. \n\t\t\t\t\t\tDe pagina's staan gehost op Github, als mede ook alle code, dus die kan je zelf ook bekijken. \n\t\t\t\t\t\tDaarnaast maken we gebruik van Cloudflare for caching en de beveiligde verbinding (");
    			code = element("code");
    			code.textContent = "https";
    			t16 = text(").");
    			t17 = space();
    			div1 = element("div");
    			a2 = element("a");
    			a2.textContent = "« terug naar de vragen";
    			add_location(h3, file$3, 30, 4, 1712);
    			add_location(h40, file$3, 33, 5, 1761);
    			add_location(p0, file$3, 35, 5, 1804);
    			attr_dev(a0, "href", "https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers");
    			add_location(a0, file$3, 42, 10, 2234);
    			add_location(li0, file$3, 42, 6, 2230);
    			attr_dev(a1, "href", "https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken");
    			add_location(a1, file$3, 43, 10, 2425);
    			add_location(li1, file$3, 43, 6, 2421);
    			add_location(ul, file$3, 41, 5, 2219);
    			add_location(p1, file$3, 46, 5, 2664);
    			add_location(h41, file$3, 49, 5, 2883);
    			add_location(code, file$3, 54, 89, 3234);
    			add_location(p2, file$3, 51, 5, 2925);
    			attr_dev(div0, "class", "text-start");
    			add_location(div0, file$3, 32, 4, 1731);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "btn btn-outline-primary");
    			add_location(a2, file$3, 58, 5, 3310);
    			attr_dev(div1, "class", "d-grid mb-3");
    			add_location(div1, file$3, 57, 4, 3279);
    			attr_dev(div2, "class", "col-md-8");
    			add_location(div2, file$3, 28, 3, 1684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, h40);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(div0, t9);
    			append_dev(div0, p1);
    			append_dev(div0, t11);
    			append_dev(div0, h41);
    			append_dev(div0, t13);
    			append_dev(div0, p2);
    			append_dev(p2, t14);
    			append_dev(p2, code);
    			append_dev(p2, t16);
    			append_dev(div2, t17);
    			append_dev(div2, div1);
    			append_dev(div1, a2);

    			if (!mounted) {
    				dispose = listen_dev(a2, "click", /*readMore*/ ctx[4], false, false, false);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(28:28) ",
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
    			t18 = text("!\n\t\t\t\t\t👋\n\t\t\t\t\tVind je dit tof? Deel deze pagina dan op ");
    			a4 = element("a");
    			a4.textContent = "Twitter";
    			t20 = text(" \n\t\t\t\t\tof ");
    			a5 = element("a");
    			a5.textContent = "Facebook";
    			t22 = text("!");
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
    			add_location(a4, file$3, 23, 46, 1288);
    			attr_dev(a5, "href", "https://www.facebook.com/sharer/sharer.php?u=https://magikaleenprik.nl/");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$3, 24, 8, 1521);
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
    	const if_block_creators = [create_if_block$3, create_if_block_1];
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

    	const setState = event => {
    		console.log("Setting state:", event.detail.newState);
    		$$invalidate(0, state = event.detail.newState);
    	};

    	const reset = () => $$invalidate(0, state = 1);

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

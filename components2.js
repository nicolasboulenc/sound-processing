"use strict";

const audio_env = {
	next_id: 0,
	ctx: null,
	nodes: new Map()
}

const NODE_BASE = `
	<div class="title"></div>
	<div class="connections"></div>
	<div class="params"></div>
`

const NODE_OSCILLATOR = `
<div class="param">
	<div>Freq</div>
	<div>
	<select data-param="freq">
		<option value="261.63">c4</options>
		<option value="277.18">c#4</options>
		<option value="293.66">d4</options>
		<option value="311.13">d#4</options>
		<option value="329.63">e4</options>
		<option value="349.43">f4</options>
		<option value="369.99">f#4</options>
		<option value="392.00">g4</options>
		<option value="415.30">g#4</options>
		<option value="440.00">a4</options>
		<option value="466.16">a#4</options>
		<option value="493.88">b4</options>
	</select>
	</div>
</div>
<div class="param">
	<div>Detune</div>
	<div><input type="range" min="-100" max="100" step="1" data-param="detune"></input></div>
</div>
<div class="param">
	<div>Type</div>
	<div>
	<select data-param="type">
		<option value="sine">sine</options>
		<option value="square">square</options>
		<option value="sawtooth">sawtooth</options>
		<option value="triangle">triangle</options>		
	</select>
	</div>
</div>`

const NODE_GAIN = `
<div class="param">
	<div>Gain</div>
	<div><input type="range" min="0" max="1" step="0.1" data-param="gain"></input></div>
</div>`


function node_create(options = {}) {

	if(typeof options.class === "undefined") {
		return
	}

	if(audio_env.ctx === null) {
		audio_env.ctx = new AudioContext()
	}

	const node = {
		id: "",					// id of the html element
		class: "",
		audio_ctx: null,
		audio_node: null,
		elem: null,				// the html element
		input_nodes: {},		// { "input_name": node_object } e.g. { "" }
		output_nodes: {},		// { "output_name": node_object } e.g. { "R": object, "G": object, "B": null }
		outputs: { "default": null }
	}

	const ctx = audio_env.ctx
	const id = generate_id(audio_env)
	const destination = audio_env.ctx.destination
	audio_env.nodes.set(id, node)

	node.id = id
	node.audio_ctx = ctx
	node.class = options.class
	node.elem = document.createElement("div")
	node.elem.id = id
	node.elem.classList.add("component")
	node.elem.classList.add(options.class)
	node.elem.innerHTML = NODE_BASE

	const title = options.class.charAt(0).toUpperCase() + options.class.slice(1)
	node.elem.querySelector(".title").innerHTML = title

	// process specific to classes
	if(options.class === "oscillator") {
		options.connections = [{type: "output", name: "output"}]
		node.audio_node = new OscillatorNode(ctx)
		node.audio_node.frequency.value = 440
		node.audio_node.type = "sine"
		node.audio_node.start()
	}
	else if(options.class === "gain") {
		options.connections = [{type: "input", name: "input"}, {type: "output", name: "output"}]
		node.audio_node = new GainNode(ctx)
		node.audio_node.gain.value = 1
	}
	else if(options.class === "output") {
		options.connections = [{type: "input", name: "input"}]
		node.audio_node = destination
	}

	// process inputs / outputs
	node.input_nodes = {}
	node.output_nodes = {}
	let html_conn = ""
	for(const conn of options.connections) {
		if(conn.type === "input") {
			node.input_nodes[conn.name] = null
			html_conn += `<div class="input"><div class="connector" data-id="${node.id}" data-type="input" data-name="${conn.name}"></div><div class="label">${conn.name}</div></div>`
		}
		else if(conn.type === "output") {
			node.output_nodes[conn.name] = null
			html_conn += `<div class="output"><div class="label">${conn.name}</div><div class="connector" data-id="${node.id}" data-type="output" data-name="${conn.name}"></div></div>`
		}
	}
	node.elem.querySelector(".connections").innerHTML = html_conn

	// process html and event listeners
	if(options.class === "oscillator") {
		node.elem.querySelector(".params").innerHTML = NODE_OSCILLATOR
		// should select the default options value
	}
	else if(options.class === "gain") {
		node.elem.querySelector(".params").innerHTML = NODE_GAIN
	}

	let params = node.elem.querySelectorAll(".params [data-param]")
	for(let param of params) {
		param.dataset["id"] = node.id
		param.addEventListener("input", node_on_event)
	}

	return node
}


function node_get_input(node, name) {
	return node.input_nodes[name]
}

function node_set_input(inode, name, node) {
	if(typeof inode.input_nodes[name] !== "undefined") {
		inode.input_nodes[name] = node
	}
}

function node_get_output(node, for_node=null) {

	if(for_node === null) return node.outputs["default"] 

	const names = Object.getOwnPropertyNames(node.output_nodes)
	for(const name of names) {
		if(node.output_nodes[name] === for_node) {
			return node.outputs[name]
		}
	}
	return node.outputs["default"]
}

function node_set_output(inode, name, node) {
	if(typeof inode.output_nodes[name] !== "undefined") {
		inode.output_nodes[name] = node
	}
}

function node_get_outputs(node) {
	return Object.values(node.output_nodes)
}

function node_on_event(evt) {

	const id = evt.currentTarget.dataset["id"]
	const node = audio_env.nodes.get(id)
	const param = evt.currentTarget.dataset.param
	const value = evt.currentTarget.value 

	if(node.class === "oscillator") {
		if(param === "freq") {
			node.audio_node.frequency.setValueAtTime(value, node.audio_ctx.currentTime)
		}
		else if(param === "detune") {
			node.audio_node.detune.setValueAtTime(value, node.audio_ctx.currentTime)
		}
		else if(param === "type") {
			node.audio_node.type = value
		}
	}
	else if(node.class === "gain") {
		if(param === "gain") {
			node.audio_node.gain.setValueAtTime(value, node.audio_ctx.currentTime)
		}
	}

}

function generate_id(env) {
	return `c${ (''+env.next_id++).padStart(2, '0')}`
}

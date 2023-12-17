"use strict";


class Node_Template {

	#id

	constructor(options = {}) {

		this.#id = ""				// id of the html element
		this.audio_node = null
		this.callback = null		// called when?
		this.elem = null			// the html element
		this.input_nodes = {}		// { "input_name": node_object } e.g. { "" }
		this.output_nodes = {}		// { "output_name": node_object } e.g. { "R": object, "G": object, "B": null }
		this.outputs = { "default": null }

		if(typeof options.id !== "undefined") {
			this.#id = options.id
		}

		if(typeof options.callback !== "undefined") {
			this.callback = options.callback
		}

		if(typeof options.connections !== "undefined") {
			this.init_connections(options.connections)
		}
	}

	init_connections(connections) {

		this.input_nodes = {}
		this.output_nodes = {}

		for(const conn of connections) {
			if(conn.type === "input") {
				this.input_nodes[conn.name] = null
			}
			else if(conn.type === "output") {
				this.output_nodes[conn.name] = null
			}
		}
	}

	get id() {
		return this.#id
	}

	set id(id) {
		this.#id = id
		this.elem.setAttribute("id", id)
	}

	get title() {
		return this.elem.querySelector(".title").innerHTML
	}

	set title(t) {
		this.elem.querySelector(".title").innerHTML = t
	}

	get_input(name) {
		return this.input_nodes[name]
	}

	set_input(name, node) {
		if(typeof this.input_nodes[name] !== "undefined") {
			this.input_nodes[name] = node
		}
	}

	get_output(for_node=null) {

		if(for_node === null) return this.outputs["default"] 

		const names = Object.getOwnPropertyNames(this.output_nodes)
		for(const name of names) {
			if(this.output_nodes[name] === for_node) {
				return this.outputs[name]
			}
		}
		return this.outputs["default"]
	}

	set_output(name, node) {
		if(typeof this.output_nodes[name] !== "undefined") {
			this.output_nodes[name] = node
		}
	}

	get_outputs() {
		return Object.values(this.output_nodes)
	}

	build(options = {}) {

		this.elem = document.createElement("div")
		this.elem.classList.add("component")
		if(this.#id !== "") {
			this.elem.setAttribute("id", this.#id)
		}

		const title = (typeof options.title !== "undefined" ? options.title : "")
		const ttl = `<div class="title">${title}</div>`

		
		let conns = `<div class="connections">`

		const inputs = Object.keys(this.input_nodes)
		for(const input of inputs) {
			conns += `<div class="input"><div class="connector" data-id="${this.#id}" data-type="input" data-name="${input}"></div><div class="label">${input}</div></div>`
		}

		const outputs = Object.keys(this.output_nodes)
		for(const output of outputs) {
			conns += `<div class="output"><div class="label">${output}</div><div class="connector" data-id="${this.#id}" data-type="output" data-name="${output}"></div></div>`
		}

		conns += "</div>"

		const params = `<div class="params"></div>`

		this.elem.innerHTML  = `${ttl}${conns}${params}`
	}

	process() {
	}
}


class Node_Oscillator extends Node_Template {

	constructor(options = {}) {
		options.connections = [{type: "output", name: "output"}]
		super(options)

		this.audio_node = new OscillatorNode(options.ctx)
		this.audio_node.frequency.value = 440
		this.audio_node.type = "sine"
		this.audio_node.start()

		this.build({ title: "Oscillator" })
		this.build_params()
	}

	build_params() {

		const prms = this.elem.querySelector(".params")

		// freq
		let div = document.createElement("div")

		let label = document.createElement("label")
		label.textContent = "Freq"
		div.appendChild(label)

		let input = document.createElement("select")
		const frequencies = [
			{ n: "c4",	f: 261.63 },
			{ n: "c#4", f: 277.18 },
			{ n: "d4",	f: 293.66 },
			{ n: "d#4",	f: 311.13 },
			{ n: "e4",	f: 329.63 },
			{ n: "f4",	f: 349.43 },
			{ n: "f#4", f: 369.99 },
			{ n: "g4",	f: 392.00 },
			{ n: "g#4", f: 415.30 },
			{ n: "a4",	f: 440.00 },
			{ n: "a#4", f: 466.16 },
			{ n: "b4",	f: 493.88 },
		]
		for(const f of frequencies) {
			let option = document.createElement("option")
			option.setAttribute("value", f.f)
			option.innerHTML = f.n
			input.appendChild(option)
		}		
		input.addEventListener("change", this.param_onchange.bind(this))
		div.appendChild(input)
		prms.appendChild(div)

		// detune
		div = document.createElement("div")
		// id = `id-${Math.floor(Math.random() * 1000000)}`

		label = document.createElement("label")
		label.textContent = "Detune"
		div.appendChild(label)

		input = document.createElement("input")
		input.setAttribute("type", "range")
		// input.setAttribute("id", id)
		input.addEventListener("change", this.param_onchange.bind(this))
		div.appendChild(input)
		prms.appendChild(div)

		// type
		div = document.createElement("div")
		// id = `id-${Math.floor(Math.random() * 1000000)}`

		label = document.createElement("label")
		// label.setAttribute("for", id)
		label.textContent = "Type"
		div.appendChild(label)

		input = document.createElement("select")
		// input.setAttribute("id", id)
		const types = ["sine", "square", "sawtouth", "triangle"]
		for(const type of types) {
			let option = document.createElement("option")
			option.setAttribute("value", type)
			option.innerHTML = type
			input.appendChild(option)
		}
		input.addEventListener("change", this.param_onchange.bind(this))
		div.appendChild(input)
		prms.appendChild(div)
	}

	param_onchange(evt) {
		
		console.log(evt.currentTarget.value)
	}
}


class Node_Output extends Node_Template {

	constructor(options = {}) {
		options.connections = [{ type: "input", name: "input" }]
		super(options)
		this.audio_node = options.ctx.destination
		this.build({ title: "Output" })
	}
}


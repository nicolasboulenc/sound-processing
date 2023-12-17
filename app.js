'use strict';

const app = {
	scale: 1,
	canvas: null,
	ctx: null,
	nodes: [],
	id: 0,
	selected_node: null,
	rendering_node: null,
	conn_start:  null,
	conn_line : null,
	draggables: [],
	connections: []
}


init()


function init() {

	app.canvas = document.getElementById('canvas')
	app.ctx = canvas.getContext('2d')

	const elems = document.querySelectorAll('[data-op]')
	for(const elem of elems) {
		elem.addEventListener('click', button_onclick)
	}
	
	document.addEventListener('keypress', window_onkeypressed)
	window.addEventListener('mouseup', window_onmouseup)
	window.addEventListener('mousemove', window_onmousemove)
}


function make_draggable(node) {

	const draggable = new PlainDraggable(node.elem)
	draggable.onDrag = node_ondrag
	app.draggables.push(draggable)

	let elems = node.elem.querySelectorAll('.params div')
	for(const elem of elems) {
		elem.addEventListener('mousedown', function(evt) { evt.stopImmediatePropagation() /* to prevent dragging on inputs */ })
	}
}


function make_connectable(node) {

	const elems = node.elem.querySelectorAll('.connections .connector')
	for(const elem of elems) {
		elem.addEventListener('mousedown', connector_onmousedown)
		elem.addEventListener('mouseup', connector_onmouseup)
	}
}


function button_onclick(evt) {

	let node = null
	let op = evt.currentTarget.dataset['op']

	if(op === 'oscillator') {
		const options = { id: generate_id(), callback: render }
		node = new Node_Oscillator(options)
	}
	else if(op === 'output') {
		const options = { id: generate_id(), callback: render }
		node = new Node_Output(options)
	}

	document.querySelector('.components').append(node.elem)

	node.elem.addEventListener('mousedown', node_onmousedown)
	make_draggable(node)
	make_connectable(node)

	app.nodes.push(node)

	if(node !== null && app.nodes.length === 1) {
		make_rendering(node.id)
	}

	render()
}


function render(node=null) {

	if(app.rendering_node === null) return

	// process all nodes after 'node changed'
	process(node)
	process(app.rendering_node)

	const buffer = app.rendering_node.get_output()
	if(buffer === null) return

	app.canvas.width = buffer.width / app.scale
	app.canvas.height = buffer.height / app.scale
	app.ctx.putImageData(buffer, 0, 0)
}


function process(probe) {

	if(probe === null) return

	probe.process()
	const outputs = probe.get_outputs()
	for(const node of outputs) {
		process(node)
	}
}


function make_selected(id) {

	if(app.selected_node !== null && app.selected_node.id === id) return
	
	if(app.selected_node !== null) {
		app.selected_node.elem.classList.remove("selected")
	}

	for(const node of app.nodes) {
		if(node.id === id) {
			app.selected_node = node
			break
		}
	}

	app.selected_node.elem.classList.add("selected")
}


function make_rendering(id) {

	if(app.rendering_node !== null && app.rendering_node.id === id) return
	
	if(app.rendering_node !== null) {
		app.rendering_node.elem.classList.remove("rendering")
	}

	for(const node of app.nodes) {
		if(node.id === id) {
			app.rendering_node = node
			break
		}
	}

	app.rendering_node.elem.classList.add("rendering")
}


function generate_id() {
	return `c${ (''+app.id++).padStart(2, '0')}`
}


function connector_onmousedown(evt) {

	// to stop component dragging from connector
	evt.stopImmediatePropagation()

	if(evt.currentTarget.dataset["type"] === "input") {
		return;
	}

	app.conn_start = evt.currentTarget
	const attach = LeaderLine.pointAnchor(document.body, {x: evt.clientX, y: evt.clientY})
	app.conn_line = new LeaderLine(app.conn_start, attach, {dash: {animation: true}})
}


function connector_onmouseup(evt) {

	const conn_end = evt.currentTarget
	const conn_start = app.conn_start

	if(app.conn_start === null) return

	if(conn_start.dataset.type === conn_end.dataset.type) {
		console.log('same type')
		app.conn_start = null
		app.conn_line.remove()
		app.conn_line = null
		return	
	}

	if(conn_start.dataset.id === conn_end.dataset.id) {
		console.log('same id')
		app.conn_start = null
		app.conn_line.remove()
		app.conn_line = null
		return	
	}

	let input_node = null
	for(const node of app.nodes) {
		if(node.id === conn_end.dataset.id) {
			input_node = node
			break
		}
	}

	let output_node = null
	for(const node of app.nodes) {
		if(node.id === conn_start.dataset.id) {
			output_node = node
			break
		}
	}

	const name = evt.currentTarget.dataset['name']

	const curr_input = input_node.get_input(name)
	if(curr_input !== null && curr_input.id === output_node.id) {
		console.log('same connection')
		app.conn_start = null
		app.conn_line.remove()
		app.conn_line = null
		return
	}
	else if(curr_input !== null) {
		console.error('re-connect')
	}

	output_node.set_output(app.conn_start.dataset["name"], input_node)
	input_node.set_input(name, output_node)
	// input_node.process()
	const line = new LeaderLine(conn_start, conn_end)
	// app.lines.push(line)
	app.connections.push({ output: output_node, input: input_node, line: line })
	
	document.querySelector(`svg > g > use[href="#leader-line-${line._id}-line-shape"]`).addEventListener("mousemove", evt=>console.log(evt))


	app.conn_start = null
	app.conn_line.remove()
	app.conn_line = null

	render()
}


function window_onmouseup(evt) {

	if(app.conn_line !== null) {
		app.conn_start = null
		app.conn_line.remove()
		app.conn_line = null
	}
}


function window_onmousemove(evt) {

	if(app.conn_line !== null) {
		const attach = LeaderLine.pointAnchor(document.body, {x: evt.clientX, y: evt.clientY})
		app.conn_line.end = attach
		app.conn_line.position()
	}
}


function window_onkeypressed(evt) {
	if(evt.code === "Delete") {
		console.log("To impletement: delete node")
		console.log(`Remove: current ${app.selected_node.id}`)
		// remove from draggable
		// remove dom elem
		// remove svg lines
		// remove connections to and from other nodes

	}

	if(evt.code === "KeyR") {
		make_rendering(app.selected_node.id)
		render()
	}
}


function node_ondrag(evt) {

	// this is a plain-draggable.js event, this.element === evt.currentTarget
	const id = this.element.id
	for(const conn of app.connections) {
		if(conn.input.id === id || conn.output.id === id) {
			conn.line.position()
		}
	}
}


function node_onmousedown(evt) {
	
	const id = evt.currentTarget.getAttribute('id')
	make_selected(id)
}


function connection_remove(id) {

	console.log(`#leader-line-${id}-line-path`)
	const elem = document.querySelector(`#leader-line-${id}-line-path`)
	const parent = elem.parentNode.parentNode.remove()
	// parent.remove()
}

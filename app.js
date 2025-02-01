'use strict';

const app = {
	draggables: [],
	connections: [],
	audio_env: null,
	selected_node: null,
	connection_src:  null,
	connection_line : null,
}


init(app)


function init(app) {

	app.audio_env = env_create()

	const elems = document.querySelectorAll('[data-op]')
	for(const elem of elems) {
		elem.addEventListener('click', button_onclick)
	}
	
	document.addEventListener('keypress', window_onkeypressed)
	window.addEventListener('mouseup', window_onmouseup)
	window.addEventListener('mousemove', window_onmousemove)
}


function button_onclick(evt) {

	let node = null
	let op = evt.currentTarget.dataset.op

	let options = {}
	if(op === "oscillator") {
		options = { class: "oscillator" }
	}
	else if(op === "gain") {
		options = { class: "gain" }
	}
	else if(op === "media-element-source") {
		options = { class: "media-element-source" }
	}
	else if(op === "channel-merger") {
		options = { class: "channel-merger" }
	}
	else if(op === "analyser") {
		options = {  class: "analyser" }
	}
	else if(op === "output") {
		options = { class: "output" }
	}
	node = node_create(app.audio_env, options)


	document.querySelector('.components').append(node.elem)

	node.elem.addEventListener('mousedown', node_onmousedown)
	make_draggable(node)
	make_connectable(node)
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


function make_selected(id) {

	if(app.selected_node !== null && app.selected_node.id === id) return
	
	if(app.selected_node !== null) {
		app.selected_node.elem.classList.remove("selected")
	}

	app.selected_node = app.audio_env.nodes.get(id)
	app.selected_node.elem.classList.add("selected")
}


function connector_onmousedown(evt) {

	// to stop component dragging from connector
	evt.stopImmediatePropagation()

	const connector = evt.currentTarget
	const connector_type = connector.dataset.type 
	const connector_is_connected = (evt.currentTarget.dataset.is_connected === "y") 

	if(	( connector_type === "output" && connector_is_connected === true ) ||
		( connector_type === "input" && connector_is_connected === false ) ) {
		return;
	}

	if(connector_type === "output") {
		// clicked on output not already connected 
		app.connection_src = connector
		const attach = LeaderLine.pointAnchor(document.body, {x: evt.clientX, y: evt.clientY})
		app.connection_line = new LeaderLine(app.connection_src, attach, {dash: {animation: true}})
	}
	else {
		// clicked on input already connected 
		let i=0
		while(i < app.connections.length) {
			if(app.connections[i].dst_id === connector.dataset.id && app.connections[i].dst_num === connector.dataset.num) break
			i++
		}

		const src_id = app.connections[i].src_id
		const src_num = app.connections[i].src_num
		const line = app.connections[i].line
		// remove connection and disconnect
		connector.dataset.is_connected = "n"
		app.connections.splice(i, 1)
		node_disconnect(app.audio_env, src_id)

		app.connection_src = document.querySelector(`.connector[data-id="${src_id}"][data-type="output"][data-num="${src_num}"]`)
		app.connection_src.dataset.is_connected = "n"
		app.connection_line = line
	}
}


function connector_onmouseup(evt) {

	if(app.connection_src === null) return

	const connection_dst = evt.currentTarget
	let early_exit = false

	if(connection_dst.is_connected === "y") {
		console.log("Info: Cannot connect 2 sources to the same destination.")
		app.connection_src.dataset.is_connected = "n"
		early_exit = true
	}
	
	if(app.connection_src.dataset.type === connection_dst.dataset.type) {
		console.log("Info: trying to connect input->input or output->ouput.")
		app.connection_src.dataset.is_connected = "n"
		early_exit = true
	}
	
	if(app.connection_src.dataset.id === connection_dst.dataset.id) {
		console.log("Info: trying to connect node to itself.")
		early_exit = true
	}

	if(early_exit === true) {
		app.connection_src.dataset.is_connected = "n"
		app.connection_src = null
		app.connection_line.remove()
		app.connection_line = null
		return
	}

	const src_id = app.connection_src.dataset.id
	const src_num = app.connection_src.dataset.num
	const dst_id = connection_dst.dataset.id
	const dst_num = connection_dst.dataset.num
	node_connect(app.audio_env, src_id, dst_id, src_num, dst_num)

	const line = new LeaderLine(app.connection_src, connection_dst)
	app.connections.push({ src_id: src_id, src_num: src_num, dst_id: dst_id, dst_num: dst_num, line: line })

	app.connection_src.dataset.is_connected = "y"
	connection_dst.dataset.is_connected = "y"

	app.connection_src = null
	app.connection_line.remove()
	app.connection_line = null
}


function window_onmouseup(evt) {

	if(app.connection_line !== null) {
		app.connection_src = null
		app.connection_line.remove()
		app.connection_line = null
	}
}


function window_onmousemove(evt) {

	if(app.connection_line !== null) {
		const attach = LeaderLine.pointAnchor(document.body, {x: evt.clientX, y: evt.clientY})
		app.connection_line.end = attach
		app.connection_line.position()
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
}


function node_ondrag(evt) {

	// this is a plain-draggable.js event, this.element === evt.currentTarget
	const id = this.element.id
	for(const conn of app.connections) {
		if(conn.src_id === id || conn.dst_id === id) {
			conn.line.position()
		}
	}
}


function node_onmousedown(evt) {
	
	const id = evt.currentTarget.getAttribute('id')
	make_selected(id)
}



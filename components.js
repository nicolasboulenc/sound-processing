"use strict";

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

const NODE_MEDIAELEMENTSOURCE = `
<div class="param">
	<div><audio controls="true" src="IMSLP197806-PMLP02397-3-ClairDeLune-j.mp3"></audio></div>
</div>`

const NODE_CHANNELMERGER = ``

const NODE_STEREOPANNER = `
<div class="param">
	<div>Pan</div>
	<div><input type="range" min="-1" max="1" step="0.1" data-param="pan"></input></div>
</div>`

const NODE_BIQUADFILTER = `
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
	<div>Q</div>
	<div><input type="range" min="0" max="1000" step="10" data-param="Q"></input></div>
</div>
<div class="param">
	<div>Gain</div>
	<div><input type="range" min="0" max="100" step="1" data-param="gain"></input></div>
</div>
<div class="param">
	<div>Type</div>
	<div>
	<select data-param="type">
		<option value="lowpass">lowpass</options>
		<option value="highpass">highpass</options>
		<option value="bandpass">bandpass</options>
		<option value="lowshelf">lowshelf</options>
		<option value="highshelf">highshelf</options>
		<option value="peaking">peaking</options>
		<option value="notch">notch</options>
		<option value="allpass">allpass</options>
	</select>
	</div>
</div>`


const NODE_CHANNELSPLITTER = ``

const NODE_DELAY = `
<div class="param">
	<div>Delay</div>
	<div><input type="range" min="0" max="3" step="0.1" data-param="delay"></input></div>
</div>`

const NODE_DYNAMICSCOMPRESSOR = `
<div class="param">
	<div>Threshold</div>
	<div><input type="range" min="-100" max="0" step="1" data-param="threshold"></input></div>
</div>
<div class="param">
	<div>Knee</div>
	<div><input type="range" min="0" max="40" step="1" data-param="knee"></input></div>
</div>
<div class="param">
	<div>Ratio</div>
	<div><input type="range" min="1" max="20" step="1" data-param="ratio"></input></div>
</div>
<div class="param">
	<div>Reduction</div>
	<div><input type="range" min="-20" max="0" step="1" data-param="reduction"></input></div>
</div>
<div class="param">
	<div>Attack</div>
	<div><input type="range" min="0" max="1" step="0.1" data-param="attack"></input></div>
</div>
<div class="param">
	<div>Release</div>
	<div><input type="range" min="0" max="1" step="0.1" data-param="release"></input></div>
</div>`


function env_create() {
	
	const env = {
		next_id: 0,
		ctx: null,
		nodes: null
	}

	env.ctx = new AudioContext()
	env.nodes = new Map()
	return env
}


function node_create(env, options = {}) {

	if(typeof options.class === "undefined") {
		return
	}

	if(env.ctx.state === "suspended") {
		env.ctx.resume()
	}

	const node = {
		id: "",					// id of the html element
		class: "",
		audio_node: null,
		elem: null,				// the html element
		input_nodes: {},		// { "input_name": node_object } e.g. { "" }
		output_nodes: {},		// { "output_name": node_object } e.g. { "R": object, "G": object, "B": null }
		outputs: { "default": null }
	}

	node.id = generate_id(env)
	node.class = options.class
	node.elem = document.createElement("div")
	node.elem.id = node.id
	node.elem.classList.add("component")
	node.elem.classList.add(options.class)
	node.elem.innerHTML = NODE_BASE
	env.nodes.set(node.id, node)

	const title = options.class.charAt(0).toUpperCase() + options.class.slice(1)
	node.elem.querySelector(".title").innerHTML = title
	let connections = []

	// process specific to classes
	if(options.class === "oscillator") {
		node.elem.querySelector(".params").innerHTML = NODE_OSCILLATOR
		node.audio_node = new OscillatorNode(env.ctx)
		node.audio_node.frequency.value = 440
		node.audio_node.type = "sine"
		node.audio_node.start()
		node.elem.querySelector("[data-param=freq]").value = "440.00"
		node.elem.querySelector("[data-param=detune]").value = node.audio_node.detune.value
		node.elem.querySelector("[data-param=type]").value = node.audio_node.type
		connections = [{type: "output", name: "output", num: 0}]
	}
	else if(options.class === "gain") {
		node.elem.querySelector(".params").innerHTML = NODE_GAIN
		node.audio_node = new GainNode(env.ctx)
		node.audio_node.gain.value = 0.8
		node.elem.querySelector("[data-param=gain]").value = node.audio_node.gain.value
		connections = [{type: "input", name: "input", num: 0}, {type: "output", name: "output", num: 0}]
	}
	else if(options.class === "stereo-panner") {
		node.elem.querySelector(".params").innerHTML = NODE_STEREOPANNER
		node.audio_node = new StereoPannerNode(env.ctx)
		node.audio_node.pan.value = 0
		node.elem.querySelector("[data-param=pan]").value = node.audio_node.pan.value
		connections = [{type: "input", name: "input", num: 0}, {type: "output", name: "output", num: 0}]
	}
	else if(options.class === "channel-merger") {
		node.elem.querySelector(".params").innerHTML = NODE_CHANNELMERGER
		node.audio_node = new ChannelMergerNode(env.ctx, { numberOfInputs: 2 })
		connections = [{type: "input", name: "L", num: 0}, {type: "input", name: "R", num: 1}, {type: "output", name: "output", num: 0}]
	}
	else if(options.class === "channel-splitter") {
		node.elem.querySelector(".params").innerHTML = NODE_CHANNELSPLITTER
		node.audio_node = new ChannelSplitterNode(env.ctx, { numberOfOutputs: 2 })
		connections = [{type: "input", name: "input", num: 0}, {type: "output", name: "L", num: 0}, {type: "output", name: "R", num: 1}]
	}
	else if(options.class === "media-element-source") {
		node.elem.querySelector(".params").innerHTML = NODE_MEDIAELEMENTSOURCE
		const media_elem = node.elem.querySelector("audio")
		node.audio_node = new MediaElementAudioSourceNode(env.ctx, { mediaElement: media_elem })
		connections = [{type: "output", name: "output", num: 0}]
	}
	else if(options.class === "biquad-filter") {
		node.elem.querySelector(".params").innerHTML = NODE_BIQUADFILTER
		node.audio_node = new BiquadFilterNode(env.ctx)
		node.audio_node.frequency.value = 440
		node.elem.querySelector("[data-param=freq]").value = "440.00"
		node.elem.querySelector("[data-param=detune]").value = node.audio_node.detune.value
		node.elem.querySelector("[data-param=Q]").value = node.audio_node.Q.value
		node.elem.querySelector("[data-param=gain]").value = node.audio_node.gain.value
		node.elem.querySelector("[data-param=type]").value = node.audio_node.type
		connections = [{type: "input", name: "input0", num: 0}, {type: "output", name: "output", num: 0}]
	}
	else if(options.class === "delay") {
		node.elem.querySelector(".params").innerHTML = NODE_DELAY
		node.audio_node = new DelayNode(env.ctx, { maxDelayTime: 3.0 })
		node.audio_node.delayTime.value = 0.2
		node.elem.querySelector("[data-param=delay]").value = node.audio_node.delayTime.value
		connections = [{type: "input", name: "input", num: 0}, {type: "output", name: "output", num: 0}]
	}
	else if(options.class === "dynamics-compressor") {
		node.elem.querySelector(".params").innerHTML = NODE_DYNAMICSCOMPRESSOR
		node.audio_node = new DynamicsCompressorNode(env.ctx)
		node.elem.querySelector("[data-param=threshold]").value = node.audio_node.threshold.value
		node.elem.querySelector("[data-param=knee]").value = node.audio_node.knee.value
		node.elem.querySelector("[data-param=ratio]").value = node.audio_node.ratio.value
		node.elem.querySelector("[data-param=reduction]").value = node.audio_node.reduction.value
		node.elem.querySelector("[data-param=attack]").value = node.audio_node.attack.value
		node.elem.querySelector("[data-param=release]").value = node.audio_node.release.value
		connections = [{type: "input", name: "input", num: 0}, {type: "output", name: "output", num: 0}]
	}
	else if(options.class === "convolver") {
	}
	else if(options.class === "periodic-wave") {
	}
	else if(options.class === "wave-shaper") {
	}
	else if(options.class === "analyser") {
	}
	else if(options.class === "output") {
		node.audio_node = env.ctx.destination
		connections = [{type: "input", name: "input", num: 0}]
	}

	// add event listeners to params
	let params = node.elem.querySelectorAll(".params [data-param]")
	for(let param of params) {
		param.dataset["id"] = node.id
		param.addEventListener("input", node_on_event.bind(env))
	}

	// process inputs / outputs
	node.input_nodes = {}
	node.output_nodes = {}
	let html_conn = ""
	for(const conn of connections) {
		if(conn.type === "input") {
			node.input_nodes[conn.name] = null
			html_conn += `<div class="input"><div class="connector" data-id="${node.id}" data-type="input" data-name="${conn.name}" data-num="${conn.num}"></div><div class="label">${conn.name}</div></div>`
		}
		else if(conn.type === "output") {
			node.output_nodes[conn.name] = null
			html_conn += `<div class="output"><div class="label">${conn.name}</div><div class="connector" data-id="${node.id}" data-type="output" data-name="${conn.name}" data-num="${conn.num}"></div></div>`
		}
	}
	node.elem.querySelector(".connections").innerHTML = html_conn

	return node
}


function node_connect(env, node_src_id, node_dst_id, output_num=0, input_num=0) {

	const node_src = env.nodes.get(node_src_id)
	const node_dst = env.nodes.get(node_dst_id)
	node_src.audio_node.connect(node_dst.audio_node, output_num, input_num)
}


function node_disconnect(env, node_id) {

	const node = env.nodes.get(node_id)
	node.audio_node.disconnect()
}


function node_on_event(evt) {

	const env = this
	const id = evt.currentTarget.dataset.id
	const node = env.nodes.get(id)
	const param = evt.currentTarget.dataset.param
	const value = evt.currentTarget.value 

	if(node.class === "oscillator") {
		if(param === "freq") {
			node.audio_node.frequency.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "detune") {
			node.audio_node.detune.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "type") {
			node.audio_node.type = value
		}
	}
	else if(node.class === "gain") {
		if(param === "gain") {
			node.audio_node.gain.setValueAtTime(value, node.audio_node.context.currentTime)
		}
	}
	else if(node.class === "stereo-panner") {
		if(param === "pan") {
			node.audio_node.pan.setValueAtTime(value, node.audio_node.context.currentTime)
		}
	}
	else if(node.class === "biquad-filter") {
		if(param === "freq") {
			node.audio_node.frequency.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "detune") {
			node.audio_node.detune.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "Q") {
			node.audio_node.Q.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "gain") {
			node.audio_node.gain.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "type") {
			node.audio_node.type = value
		}
	}
	else if(node.class === "delay") {
		if(param === "delay") {
			node.audio_node.delayTime.setValueAtTime(value, node.audio_node.context.currentTime)
		}
	}
	else if(node.class === "dynamics-compressor") {
		if(param === "threshold") {
			node.audio_node.threshold.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "knee") {
			node.audio_node.knee.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "ratio") {
			node.audio_node.ratio.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "reduction") {
			node.audio_node.reduction.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "attack") {
			node.audio_node.attack.setValueAtTime(value, node.audio_node.context.currentTime)
		}
		else if(param === "release") {
			node.audio_node.release.setValueAtTime(value, node.audio_node.context.currentTime)
		}
	}
}


function generate_id(env) {
	return `c${ (''+env.next_id++).padStart(2, '0')}`
}


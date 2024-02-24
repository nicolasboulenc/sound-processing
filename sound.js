class Simple_Sound {

    constructor(ctx) {
        
        this.ctx = ctx

        // create Oscillator node
        this.osc_node = this.ctx.createOscillator()
        this.osc_node.type = "triangle"

        this.gain_node = this.ctx.createGain()

        this.osc_node.connect(this.gain_node)
        this.gain_node.connect(this.ctx.destination)
    }


    play(freq=440, speed=100, delay=0) {

        const future_time = this.ctx.currentTime + delay
        
        this.osc_node.frequency.linearRampToValueAtTime(freq, future_time + 0.1)
        this.gain_node.gain.linearRampToValueAtTime(1 * speed / 100, future_time + 0.1)
        this.osc_node.start(future_time)
    }
    
    
    stop() {
        
        const duration = 0.5
        const future_time = this.ctx.currentTime + duration

        this.osc_node.frequency.exponentialRampToValueAtTime(0.01, future_time)
        this.gain_node.gain.exponentialRampToValueAtTime(0.01, future_time)
        this.osc_node.stop(future_time + 0.1)
    }
}
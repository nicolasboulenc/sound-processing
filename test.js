"use strict";

let audio_ctx = null
let oscillator = null

document.querySelector("#start").addEventListener("click", start)
document.querySelector("#play1").addEventListener("click", play1)
document.querySelector("#play2").addEventListener("click", play2)

const sound_length = .5
const sound = { osc: null, gain: null, attack: 0.05, decay: 0.02, sustain: 0.48, release: 0.45 }

function start() {
    audio_ctx = new AudioContext()

    // create Oscillator node
    sound.osc = audio_ctx.createOscillator()
    sound.osc.type = "sawtooth"
    sound.osc.frequency.setValueAtTime(400, audio_ctx.currentTime)
    sound.osc.start()

    sound.gain = audio_ctx.createGain()
    sound.gain.gain.setValueAtTime(0, audio_ctx.currentTime)

    sound.osc.connect(sound.gain)
    sound.gain.connect(audio_ctx.destination)


    // this.osc.frequency.setValueAtTime(150, time);
    // this.gain.gain.setValueAtTime(1, time);
  
    // this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    // this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
  
    // this.osc.start(time);
  
    // this.osc.stop(time + 0.5);


}


function play1() {

    const now = audio_ctx.currentTime

    sound.gain.gain.setValueAtTime(0, audio_ctx.currentTime)
    
    // attack
    sound.gain.gain.linearRampToValueAtTime(1.0, now + sound_length * (sound.attack))

    // decay
    sound.gain.gain.linearRampToValueAtTime(0.9, now + sound_length * (sound.attack + sound.decay))

    // release
    sound.gain.gain.setTargetAtTime(0.0, now + sound_length * (sound.attack + sound.decay + sound.sustain), sound_length * sound.release / 5)

    // oscillator.frequency.setValueAtTime(400)
    // oscillator.frequency.setValueAtTime(0, audio_ctx.currentTime + 2)
}

function play2() {

    const now = audio_ctx.currentTime
    sound.gain.gain.setValueAtTime(1.0, audio_ctx.currentTime)
    sound.gain.gain.setValueAtTime(0.0, now + sound_length)
}
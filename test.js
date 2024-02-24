"use strict";

let audio_ctx = null
let oscillator = null

document.querySelector("#start").addEventListener("click", start)
document.querySelector("#play1").addEventListener("click", play1)
document.querySelector("#play2").addEventListener("click", play2)

const sound_length = .5
const sound = { osc: null, gain: null, attack: 0.05, decay: 0.02, sustain: 0.48, release: 0.45 }

let kick = null
let snar = null


function start() {
    audio_ctx = new AudioContext({latecyHint: "Interactive", sampleRare: 44100.0})
    
    console.log(audio_ctx.sampleRate)
    console.log(audio_ctx.destination.channelCount);
    
    kick = new Kick(audio_ctx)
    snar = new Snare(audio_ctx)
    
    // create Oscillator node
    sound.osc = audio_ctx.createOscillator()
    sound.osc.type = "sawtooth"
    sound.osc.frequency.setValueAtTime(400, audio_ctx.currentTime)
    sound.osc.start()

    sound.gain = audio_ctx.createGain()
    sound.gain.gain.setValueAtTime(0, audio_ctx.currentTime)

    sound.osc.connect(sound.gain)
    sound.gain.connect(audio_ctx.destination)
}


function play1() {
    
    const now = audio_ctx.currentTime
    kick.trigger(now)
    return

    // sound.gain.gain.setValueAtTime(0, audio_ctx.currentTime)
    
    // // attack
    // sound.gain.gain.linearRampToValueAtTime(1.0, now + sound_length * (sound.attack))

    // // decay
    // sound.gain.gain.linearRampToValueAtTime(0.9, now + sound_length * (sound.attack + sound.decay))

    // // release
    // sound.gain.gain.setTargetAtTime(0.0, now + sound_length * (sound.attack + sound.decay + sound.sustain), sound_length * sound.release / 5)

    // oscillator.frequency.setValueAtTime(400)
    // oscillator.frequency.setValueAtTime(0, audio_ctx.currentTime + 2)
}

function play2() {


    // const now = audio_ctx.currentTime
    // snar.trigger(now)
    // return

    this.osc.frequency.setValueAtTime(300, time);
    this.gain.gain.setValueAtTime(1, time);
  
    this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
  
    this.osc.start(time);
  
    this.osc.stop(time + 0.5);


    const time = audio_ctx.currentTime
    sound.osc.frequency.setValueAtTime(150, time);
    sound.gain.gain.setValueAtTime(1, time);

    sound.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    sound.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    sound.osc.start(time);
    sound.osc.stop(time + 0.5);
 
    // sound.gain.gain.setValueAtTime(1.0, audio_ctx.currentTime)
    // sound.gain.gain.setValueAtTime(0.0, now + sound_length)
}
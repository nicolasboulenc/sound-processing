
let midi = null
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)

let music = {}

// create web audio api context
let audioCtx = null

document.addEventListener("click", (evt) => { if(audioCtx === null) { audioCtx = new window.AudioContext(); console.log("Audio context created.") } })


function onMIDISuccess(midiAccess) {

    console.log("MIDI ready!")
    midi = midiAccess

    midiAccess.inputs.forEach(input => {
        input.addEventListener("midimessage", onMIDIMessage)
    })
}


function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`)
}


function onMIDIMessage(evt) {

    const message = process_event(evt)

    if(message.type === "key-down") {

        if(typeof music[message.key] === "undefined") {
            music[message.key] = []
        }

        const sound = new Simple_Sound(audioCtx)
        music[message.key].push(sound)
        sound.play(message.freq, message.speed)
    }
    else if(message.type === "key-up") {
        const sound = music[message.key].shift()
        if(typeof sound === "undefined") return
        sound.stop()
    }
}


function process_event(evt) {

    const message_type = evt.data[0]
    const message = { type: "", timestamp: 0, key: "", freq: 0, speed: 0 }

    message.timestamp = evt.timeStamp

    // message type
    if(message_type === 144) {
        message.type = "key-down"
    }
    else if (message_type === 128) {
        message.type = "key-up"
    }

    if(message.type === "") return

    // note
    const note = evt.data[1]
    if(note > 20 && note < 128) {
        message.key = notes[note].desc
        message.freq = notes[note].freq
    }

    if(message.freq === 0) return

    // speed
    message.speed = Math.round(evt.data[2] / 127 * 100)

    return message
}


const notes = []
notes[21] = {"desc": "A0",  "freq": 27.50 }
notes[22] = {"desc": "A#0", "freq": 29.14 }
notes[23] = {"desc": "B0",  "freq": 30.87 }
notes[24] = {"desc": "C1",  "freq": 32.70 }
notes[25] = {"desc": "C#1", "freq": 34.65 }
notes[26] = {"desc": "D1",  "freq": 36.71 }
notes[27] = {"desc": "D#1", "freq": 38.89 }
notes[28] = {"desc": "E1",  "freq": 41.20 }
notes[29] = {"desc": "F1",  "freq": 43.65 }
notes[30] = {"desc": "F#1", "freq": 46.25 }
notes[31] = {"desc": "G1",  "freq": 49.00 }
notes[32] = {"desc": "G#1", "freq": 51.91 }
notes[33] = {"desc": "A1",  "freq": 55.00 }
notes[34] = {"desc": "A#1", "freq": 58.27 }
notes[35] = {"desc": "B1",  "freq": 61.74 }
notes[36] = {"desc": "C2",  "freq": 65.41 }
notes[37] = {"desc": "C#2", "freq": 69.30 }
notes[38] = {"desc": "D2",  "freq": 73.42 }
notes[39] = {"desc": "D#2", "freq": 77.78 }
notes[40] = {"desc": "E2",  "freq": 82.41 }
notes[41] = {"desc": "F2",  "freq": 87.31 }
notes[42] = {"desc": "F#2", "freq": 92.50 }
notes[43] = {"desc": "G2",  "freq": 98.00 }
notes[44] = {"desc": "G#2", "freq": 103.83 }
notes[45] = {"desc": "A2",  "freq": 110.00 }
notes[46] = {"desc": "A#2", "freq": 116.54 }
notes[47] = {"desc": "B2",  "freq": 123.47 }
notes[48] = {"desc": "C3",  "freq": 130.81 }
notes[49] = {"desc": "C#3", "freq": 138.59 }
notes[50] = {"desc": "D3",  "freq": 146.83 }
notes[51] = {"desc": "D#3", "freq": 155.56 }
notes[52] = {"desc": "E3",  "freq": 164.81 }
notes[53] = {"desc": "F3",  "freq": 174.61 }
notes[54] = {"desc": "F#3", "freq": 185.00 }
notes[55] = {"desc": "G3",  "freq": 196.00 }
notes[56] = {"desc": "G#3", "freq": 207.65 }
notes[57] = {"desc": "A3",  "freq": 220.00 }
notes[58] = {"desc": "A#3", "freq": 233.08 }
notes[59] = {"desc": "B3",  "freq": 246.94 }
notes[60] = {"desc": "C4",  "freq": 261.63 }
notes[61] = {"desc": "C#4", "freq": 277.18 }
notes[62] = {"desc": "D4",  "freq": 293.66 }
notes[63] = {"desc": "D#4", "freq": 311.13 }
notes[64] = {"desc": "E4",  "freq": 329.63 }
notes[65] = {"desc": "F4",  "freq": 349.23 }
notes[66] = {"desc": "F#4", "freq": 369.99 }
notes[67] = {"desc": "G4",  "freq": 392.00 }
notes[68] = {"desc": "G#4", "freq": 415.30 }
notes[69] = {"desc": "A4",  "freq": 440.00 }
notes[70] = {"desc": "A#4", "freq": 466.16 }
notes[71] = {"desc": "B4",  "freq": 493.88 }
notes[72] = {"desc": "C5",  "freq": 523.25 }
notes[73] = {"desc": "C#5", "freq": 554.37 }
notes[74] = {"desc": "D5",  "freq": 587.33 }
notes[75] = {"desc": "D#5", "freq": 622.25 }
notes[76] = {"desc": "E5",  "freq": 659.26 }
notes[77] = {"desc": "F5",  "freq": 698.46 }
notes[78] = {"desc": "F#5", "freq": 739.99 }
notes[79] = {"desc": "G5",  "freq": 783.99 }
notes[80] = {"desc": "G#5", "freq": 830.61 }
notes[81] = {"desc": "A5",  "freq": 880.00 }
notes[82] = {"desc": "A#5", "freq": 932.33 }
notes[83] = {"desc": "B5",  "freq": 987.77 }
notes[84] = {"desc": "C6",  "freq": 1046.50 }
notes[85] = {"desc": "C#6", "freq": 1108.73 }
notes[86] = {"desc": "D6",  "freq": 1174.66 }
notes[87] = {"desc": "D#6", "freq": 1244.51 }
notes[88] = {"desc": "E6",  "freq": 1318.51 }
notes[89] = {"desc": "F6",  "freq": 1396.91 }
notes[90] = {"desc": "F#6", "freq": 1479.98 }
notes[91] = {"desc": "G6",  "freq": 1567.98 }
notes[92] = {"desc": "G#6", "freq": 1661.22 }
notes[93] = {"desc": "A6",  "freq": 1760.00 }
notes[94] = {"desc": "A#6", "freq": 1864.66 }
notes[95] = {"desc": "B6",  "freq": 1975.53 }
notes[96] = {"desc": "C7",  "freq": 2093.00 }
notes[97] = {"desc": "C#7", "freq": 2217.46 }
notes[98] = {"desc": "D7",  "freq": 2349.32 }
notes[99] = {"desc": "D#7", "freq": 2489.02 }
notes[100] = {"desc": "E7",  "freq": 2637.02 }
notes[101] = {"desc": "F7",  "freq": 2793.83 }
notes[102] = {"desc": "F#7", "freq": 2959.96 }
notes[103] = {"desc": "G7",  "freq": 3135.96 }
notes[104] = {"desc": "G#7", "freq": 3322.44 }
notes[105] = {"desc": "A7",  "freq": 3520.00 }
notes[106] = {"desc": "A#7", "freq": 3729.31 }
notes[107] = {"desc": "B7",  "freq": 3951.07 }
notes[108] = {"desc": "C8",  "freq": 4186.01 }
notes[109] = {"desc": "C#8", "freq": 4434.92 }
notes[110] = {"desc": "D8",  "freq": 4698.64 }
notes[111] = {"desc": "D#8", "freq": 4978.03 }
notes[112] = {"desc": "E8",  "freq": 5274.04 }
notes[113] = {"desc": "F8",  "freq": 5587.65 }
notes[114] = {"desc": "F#8", "freq": 5919.91 }
notes[115] = {"desc": "G8",  "freq": 6271.93 }
notes[116] = {"desc": "G#8", "freq": 6644.88 }
notes[117] = {"desc": "A8",  "freq": 7040.00 }
notes[118] = {"desc": "A#8", "freq": 7458.62 }
notes[119] = {"desc": "B8",  "freq": 7902.13 }
notes[120] = {"desc": "C9",  "freq": 8372.02 }
notes[121] = {"desc": "C#9", "freq": 8869.84 }
notes[122] = {"desc": "D9",  "freq": 9397.27 }
notes[123] = {"desc": "D#9", "freq": 9956.06 }
notes[124] = {"desc": "E9",  "freq": 10548.08 }
notes[125] = {"desc": "F9",  "freq": 11175.30 }
notes[126] = {"desc": "F#9", "freq": 11839.82 }
notes[127] = {"desc": "G9",  "freq": 12543.85 }

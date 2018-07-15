const MidiConvert = require('midiconvert');
const MidiSynth = require('./src/synth');

MidiConvert.load("midi-files/test-5.mid", (midi) => {
    const synth = new MidiSynth();
    synth.createTimelapse(midi.tracks);
    console.log(midi);
    // console.log(synth.timelapse);
    console.log(synth);
});
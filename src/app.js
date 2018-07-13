const MidiConvert = require('midiconvert');
const MidiSynth = require('./src/synth');

MidiConvert.load("midi-files/test-1.mid", (midi) => {
    const synth = new MidiSynth();
    console.log(midi);
    const track2 = midi.tracks[3]; // SOPSAX 166
    const track6 = midi.tracks[5]; // GUITAR
    const track8 = midi.tracks[7]; // Don Carroll
    const track9 = midi.tracks[8]; // Houston, Texas

    synth.playTrack(track2);
    synth.playTrack(track6);
    synth.playTrack(track8);
    synth.playTrack(track9);
});
  
// MidiConvert.load("midi-files/test-2.mid", (midi) => {
//     const synth = new MidiSynth();
//     console.log(midi);
//     const track2 = midi.tracks[1]; // bass
//     const track3 = midi.tracks[2]; // piano
//     // const track5 = midi.tracks[3]; // Hi-hat only
//     const track6 = midi.tracks[5]; // jazzguitar

//     synth.playTrack(track2);
//     synth.playTrack(track3);
//     // synth.playTrack(track5);
//     synth.playTrack(track6);
// });
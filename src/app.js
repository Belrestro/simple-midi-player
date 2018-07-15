const MidiConvert = require('midiconvert');
const MidiSynth = require('./src/synth');

const trackSeletor = document.querySelector('#track-selector');
const playButton = document.querySelector('#play');
const stopButton = document.querySelector('#stop');

const synth = new MidiSynth();

const loadTrack = (trackName) => {
    MidiConvert.load(`midi-files/${trackName}.mid`, (midi) => {
    
        synth.createTimelapse(midi.tracks);
        console.log(midi);
    });
}

loadTrack(trackSeletor.value);

trackSeletor.addEventListener('change', () => {
    const {value} = trackSeletor;
    synth.stop();
    loadTrack(value);
})

playButton.addEventListener('click', () => synth.play());
stopButton.addEventListener('click', () => synth.stop());

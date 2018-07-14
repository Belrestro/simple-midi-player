const freqFromMidi = (midiNote) => {
    const tuning = 440; // A4
    
    return midiNote === 0 || (m > 0 && m < 128) 
        ? Math.pow(2, (m - 69) / 12) * tuning 
        : null;
    
};

const freqFromNote = (note) => {
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    let  octave, keyNumber;

    if (note.length === 3) {
        octave = note.charAt(2);
    } else {
        octave = note.charAt(1);
    }

    keyNumber = notes.indexOf(note.slice(0, -1));

    if (keyNumber < 3) {
        keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1; 
    } else {
        keyNumber = keyNumber + ((octave - 1) * 12) + 1; 
    }

    // Return frequency of note
    return 440 * Math.pow(2, (keyNumber- 49) / 12);
};

const secondsToMilliseconds = (seconds = 0) => {
    return Math.floor(seconds * 270);
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

class MidiSynth {
    constructor () {
        this.notes = {};
        this.instruments = {};
        this.timelapse = {};
        this.tracker = {
            endTime: 0,
            currentTime: 0
        };
        this.interval = 0;
        this.instrumentMap = {
            'bass': Bass,
            'piano': Piano
        };
    }

    createOscillator (freq) {
        const oscillator = audioCtx.createOscillator();

        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        return oscillator;
    }

    createTimelapseSegment (time) {
        this.timelapse[time] = {
            notesOn: [],
            notesOff: []
        };
    }

    timelapseSegmentExistst (time) {
        return this.timelapse[time] !== undefined;
    }

    createTimelapse (tracks = []) {
        this.timelapse = {};
        let lastNote = 0;
        tracks.forEach(track => {
            const {notes = [], instrumentFamily, id} = track;
            let instrument;

            if (instrumentFamily in this.instrumentMap) {
                instrument = new this.instrumentMap[instrumentFamily];
            } else {
                instrument = new MidiSynth();
            }
            this.instruments[id] = instrument;
            notes.forEach(midiNote => {
                const {duration, noteOn, noteOff} = midiNote;
                const start = secondsToMilliseconds(noteOn);
                const end = secondsToMilliseconds(noteOff);

                if (!this.timelapseSegmentExistst(start)) {
                    this.createTimelapseSegment(start);
                }
                if (!this.timelapseSegmentExistst(end)) {
                    this.createTimelapseSegment(end);
                }
                if (lastNote < end) {
                    lastNote = end;
                }
                const segmentStart = this.timelapse[start];
                const segmentEnd = this.timelapse[end];

                segmentStart.notesOn.push({
                    midiNote,
                    instrument
                });
                segmentEnd.notesOff.push({
                    midiNote,
                    instrument
                });
            });
        });
        this.tracker.endTime = lastNote;
    }

    play () {
        this.interval = setInterval(() => {
            const {currentTime, endTime} = this.tracker;
            const currentTimelapseSegment = this.timelapse[currentTime];
            console.log(currentTime);
            if (currentTimelapseSegment) {
                const {notesOn, notesOff} = currentTimelapseSegment;
                notesOn.forEach(({instrument, midiNote}) => {
                    const {midi, name} = midiNote;
                    instrument.playNote(name || midi);
                });
                notesOff.forEach(({instrument, midiNote}) => {
                    const {midi, name} = midiNote;
                    instrument.stopNote(name || midi);
                });
            }

            if (currentTime === endTime) {
                clearInterval(this.interval);
            } else {
                this.tracker.currentTime += 1;
            }
        }, 1);
    }

    stop () {
        clearInterval(this.interval);
    }

    playTrack (track) {
        const {instrumentFamily, id, isPercussion, notes} = track;
        let instrument;
        if (instrumentFamily in this.instrumentMap) {
            instrument = new this.instrumentMap[instrumentFamily];
        } else {
            instrument = new MidiSynth();
        }
        this.instruments[id] = instrument;
        instrument.playNotes(notes);
    }

    playNotes (notes = []) {
        // notes = notes.slice(0, 1);
        let lastNote = 0;
        notes.forEach(midiNote => {
            const {midi, name, duration, noteOn, noteOff} = midiNote;
            const durationInMilliseconds = secondsToMilliseconds(duration);
            const start = secondsToMilliseconds(noteOn);
            const end = secondsToMilliseconds(noteOff);
            if (lastNote < end) {
                lastNote = end;
            }
            setTimeout(() => {
                this.playNoteWithRelese({midi, name}, durationInMilliseconds);
            }, start);    
            
        });
    }

    playNoteWithRelese({midi, name}, duration) {
        this.playNote(name || midi);
        setTimeout(() => {
            this.stopNote(name || midi)
        }, duration);
    }

    playNote (note) {
        if (this.notes[note]) {
            this.notes[note].stop();
        }
        const freq = typeof note === 'string'
            ? freqFromNote(note)
            : freqFromMidi(note);
        const oscillator = this.createOscillator(freq);
        this.notes[note] = oscillator;
    }

    stopNote (note) {
        const oscillator = this.notes[note];
        if (oscillator) {
            oscillator.stop();
        }
    }
}

class Bass extends MidiSynth {
    createOscillator (freq) {
        const oscillator = audioCtx.createOscillator();
        
        oscillator.type = 'triangle';

        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        gainNode.gain.value = 0;

        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        return oscillator;
    }
}

class Piano extends MidiSynth {
    createOscillator (freq) {
        const oscillator = audioCtx.createOscillator();
        
        oscillator.type = 'triangle';

        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        gainNode.gain.value = 0;

        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        return oscillator;
    }
}

module.exports = MidiSynth;

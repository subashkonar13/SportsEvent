// This is a client-side simulation for GitHub Pages
// In a real implementation, you would send data to a server

document.addEventListener('DOMContentLoaded', function() {
  const categorySelect = document.getElementById('category');
  const sameGenderPartnerSection = document.getElementById('sameGenderPartnerSection');
  const mixedDoublesPartnerSection = document.getElementById('mixedDoublesPartnerSection');
  const registrationForm = document.getElementById('registrationForm');
  const successModal = new bootstrap.Modal(document.getElementById('successModal'));

  // Show/hide partner sections based on category selection
  categorySelect.addEventListener('change', function() {
    if (this.value === 'mens_doubles' || this.value === 'womens_doubles') {
      sameGenderPartnerSection.style.display = 'block';
      mixedDoublesPartnerSection.style.display = 'none';
    } else if (this.value === 'mixed_doubles') {
      sameGenderPartnerSection.style.display = 'none';
      mixedDoublesPartnerSection.style.display = 'block';
    } else {
      sameGenderPartnerSection.style.display = 'none';
      mixedDoublesPartnerSection.style.display = 'none';
    }
  });

  // Form submission with detailed logging and validation
  registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    // Get form elements directly
    const eventTypeEl = document.getElementById('eventType');
    const nameEl = document.getElementById('name');
    const flatNumberEl = document.getElementById('flatNumber');
    const mobileNumberEl = document.getElementById('mobileNumber');
    const categoryEl = document.getElementById('category');
    
    // Validate required fields
    if (!eventTypeEl || !nameEl || !flatNumberEl || !mobileNumberEl || !categoryEl) {
      console.error('Error: One or more required form elements not found in the DOM');
      alert('Form error: Required fields are missing. Please refresh the page and try again.');
      return;
    }
    
    // Collect form data with validation
    const formData = {
      eventType: eventTypeEl.value,
      name: nameEl.value,
      flatNumber: flatNumberEl.value,
      mobileNumber: mobileNumberEl.value,
      category: categoryEl.value,
      partnerName: document.getElementById('partnerName')?.value || '',
      partnerFlatNumber: document.getElementById('partnerFlatNumber')?.value || '',
      mixedPartnerName: document.getElementById('mixedPartnerName')?.value || '',
      mixedPartnerFlatNumber: document.getElementById('mixedPartnerFlatNumber')?.value || ''
    };
    
    // Validate required values
    const missingFields = [];
    if (!formData.eventType) missingFields.push('Event Type');
    if (!formData.name) missingFields.push('Name');
    if (!formData.flatNumber) missingFields.push('Flat Number');
    if (!formData.mobileNumber) missingFields.push('Mobile Number');
    if (!formData.category) missingFields.push('Category');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    console.log('Form data collected:', formData);
    
    // Send data to server with detailed error handling
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Server responded with status ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Registration successful:', data);
      successModal.show();
      registrationForm.reset();
      sameGenderPartnerSection.style.display = 'none';
      mixedDoublesPartnerSection.style.display = 'none';
    })
    .catch(error => {
      console.error('Error submitting registration:', error);
      alert(`Registration failed: ${error.message}`);
    });
  });
});

// Badminton sound generator
class BadmintonSoundGenerator {
  constructor() {
    this.isInitialized = false;
    this.setupAudio();
  }
  
  async setupAudio() {
    try {
      // Create synthesizer for racquet hit sound with moderate volume
      this.hitSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle8"
        },
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0.1,
          release: 0.3
        },
        volume: -20 // Moderate volume
      }).toDestination();
      
      // Create noise for whoosh sound
      this.whooshNoise = new Tone.Noise({
        type: "white",
        volume: -25 // Moderate volume
      }).toDestination();
      
      // Create filter for whoosh
      this.whooshFilter = new Tone.Filter({
        frequency: 1000,
        type: "lowpass",
        Q: 2
      });
      
      // Create compressor for better dynamics
      this.compressor = new Tone.Compressor({
        threshold: -24,
        ratio: 4,
        attack: 0.005,
        release: 0.1
      }).toDestination();
      
      // Create distortion for smash effect
      this.distortion = new Tone.Distortion({
        distortion: 0.2,
        wet: 0.3
      });
      
      // Connect effects chain
      this.whooshNoise.connect(this.whooshFilter);
      this.whooshFilter.connect(this.compressor);
      this.hitSynth.connect(this.distortion);
      this.distortion.connect(this.compressor);
      
      this.isInitialized = true;
    } catch (error) {
      console.log("Audio setup failed:", error);
    }
  }
  
  async playSmashSound() {
    if (!this.isInitialized) return;
    
    try {
      // Ensure audio context is started
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // Play whoosh sound (racquet swing)
      this.whooshNoise.start();
      this.whooshFilter.frequency.rampTo(2000, 0.1);
      this.whooshFilter.frequency.rampTo(200, 0.2);
      this.whooshNoise.stop("+0.3");
      
      // Play hit sound (contact with shuttlecock) - more pronounced smash
      setTimeout(() => {
        // Play a chord for more impact
        this.hitSynth.triggerAttackRelease(["C4", "G4", "E4"], "16n");
        
        // Add a quick follow-up note for the "ping" effect
        setTimeout(() => {
          this.hitSynth.triggerAttackRelease("A4", "32n", undefined, 0.8);
        }, 30);
      }, 150);
      
    } catch (error) {
      console.log("Sound playback failed:", error);
    }
  }
  
  // New method specifically for racquet-shuttlecock collision
  async playRacquetHitSound() {
    if (!this.isInitialized) return;
    
    try {
      // Ensure audio context is started
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // Create a more pronounced "smack" sound
      this.hitSynth.triggerAttackRelease(["C3", "G3"], "16n", undefined, 0.9);
      
      // Add a quick high-pitched "ping" for the shuttlecock
      setTimeout(() => {
        this.hitSynth.triggerAttackRelease("C5", "32n", undefined, 0.7);
      }, 10);
      
    } catch (error) {
      console.log("Sound playback failed:", error);
    }
  }
}

// Initialize sound generator
const soundGen = new BadmintonSoundGenerator();

// Calculate collision points between racquets and shuttlecocks
function calculateCollisionTimes() {
  const collisionTimes = [];
  
  // Racquet 1 animation is 8s with 1s delay
  // Shuttlecock 1 animation is 10s with 0s delay
  collisionTimes.push(3000); // Approximate collision time in ms
  
  // Racquet 2 animation is 8s with 4s delay
  // Shuttlecock 2 animation is 10s with 3s delay
  collisionTimes.push(7000); // Approximate collision time in ms
  
  // Racquet 3 animation is 8s with 7s delay
  // Shuttlecock 3 animation is 10s with 6s delay
  collisionTimes.push(11000); // Approximate collision time in ms
  
  return collisionTimes;
}

// Play sounds at calculated collision times
function playCollisionSounds() {
  const collisionTimes = calculateCollisionTimes();
  
  // Set up recurring collision sounds
  collisionTimes.forEach((time, index) => {
    // Initial collision
    setTimeout(() => {
      soundGen.playRacquetHitSound();
    }, time);
    
    // Recurring collisions
    setInterval(() => {
      soundGen.playRacquetHitSound();
    }, 10000); // Every 10 seconds (animation cycle)
  });
}

// Try to start audio as soon as possible
document.addEventListener('DOMContentLoaded', () => {
  // Try to auto-start with a silent sound to unlock audio
  const context = Tone.context;
  const silent = new Tone.Oscillator().toDestination();
  silent.volume.value = -100; // Virtually silent
  silent.start();
  silent.stop("+0.1");
});

// Start sounds on any user interaction (required by browsers)
function startAudioOnInteraction() {
  Tone.start().then(() => {
    // Play regular smash sounds
    setInterval(() => {
      soundGen.playSmashSound();
    }, 4000);
    
    // Play collision sounds
    playCollisionSounds();
    
    // Play one sound immediately
    soundGen.playSmashSound();
  }).catch(error => {
    console.log("Could not start audio context:", error);
  });
}

// Attach to various user interaction events
['click', 'touchstart', 'keydown', 'scroll'].forEach(eventType => {
  document.addEventListener(eventType, function onFirstInteraction() {
    startAudioOnInteraction();
    // Remove all event listeners after first interaction
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(e => {
      document.removeEventListener(e, onFirstInteraction);
    });
  }, { once: true });
});

// Config
const videoList = [
  "Part_01_edited_v3.mp4",
  "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
  "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

class VideoPlayer {
  constructor() {
    this.currentIndex = 0;
    this.videos = [];
    this.isAppStarted = false;
    this.loadingScreen = document.getElementById("loading-screen");
    this.videoContainer = document.getElementById("video-container");
    this.startOverlay = document.getElementById("start-overlay");
    
    // Bind methods
    this.onTap = this.onTap.bind(this);
    this.handleVideoEnd = this.handleVideoEnd.bind(this);
  }

  async init() {
    try {
      await this.preloadVideos();
      this.setupEventListeners();
      this.loadingScreen.style.display = "none";
      this.startOverlay.classList.remove("hidden");
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }

  async preloadVideos() {
    const loadPromises = videoList.map((src, index) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        
        // Set video properties
        Object.assign(video, {
          src,
          preload: "auto",
          muted: true,
          playsInline: true,
          webkitPlaysinline: true,
          loop: false
        });

        // Set styles
        Object.assign(video.style, {
          width: "100%",
          height: "100%",
          opacity: "0",
          position: "absolute",
          top: "0",
          left: "0",
          objectFit: "cover"
        });

        // Event listeners
        video.addEventListener("canplaythrough", () => resolve(video), { once: true });
        video.addEventListener("error", reject);
        
        // Start loading
        this.videoContainer.appendChild(video);
        this.videos.push(video);
      });
    });

    // Wait for all videos to load
    await Promise.all(loadPromises);
  }

  setupEventListeners() {
    document.body.addEventListener("click", this.onTap);
    document.body.addEventListener("touchstart", this.onTap);
    
    // Add ended event listeners to all videos except the last one
    this.videos.forEach((video, index) => {
      if (index < this.videos.length - 1) {
        video.addEventListener("ended", () => this.handleVideoEnd(index));
      }
    });
  }

  async transitionToVideo(newIndex) {
    if (newIndex >= this.videos.length) return;

    const currentVideo = this.videos[this.currentIndex];
    const nextVideo = this.videos[newIndex];

    // Prepare next video
    nextVideo.currentTime = 0;
    
    try {
      // Start playing next video before fading
      await nextVideo.play();
      
      // Crossfade videos
      requestAnimationFrame(() => {
        nextVideo.style.opacity = "1";
        currentVideo.style.opacity = "0";
      });

      // Update current index
      this.currentIndex = newIndex;

      // Stop previous video after fade
      setTimeout(() => {
        currentVideo.pause();
      }, 800); // Match this with CSS transition duration
    } catch (error) {
      console.error("Error during transition:", error);
    }
  }

  handleVideoEnd(index) {
    if (index < this.videos.length - 1) {
      this.transitionToVideo(index + 1);
    }
  }

  async onTap(event) {
    event.preventDefault();

    if (!this.isAppStarted) {
      this.isAppStarted = true;
      this.startOverlay.classList.add("hidden");
      
      // Start first video
      const firstVideo = this.videos[0];
      firstVideo.style.opacity = "1";
      await firstVideo.play();
    } else if (this.currentIndex < this.videos.length - 1) {
      // Manual transition to next video
      await this.transitionToVideo(this.currentIndex + 1);
    }
  }
}

// Initialize the player
const player = new VideoPlayer();
player.init();
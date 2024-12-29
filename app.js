/**********************************************
 * Config: List your video files here
 **********************************************/
const videoList = [
  "Part_01_edited_v3.mp4",
  "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
  "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

/**********************************************
 * Video Player Implementation
 **********************************************/
class VideoPlayer {
  constructor() {
    this.currentIndex = 0;
    this.videos = [];
    this.isAppStarted = false;
    this.loadingScreen = document.getElementById("loading-screen");
    this.videoContainer = document.getElementById("video-container");
    this.startOverlay = document.getElementById("start-overlay");
    this.loadingText = document.querySelector(".loading-text");
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Bind methods
    this.onTap = this.onTap.bind(this);
  }

  async init() {
    try {
      this.loadingText.textContent = "Preparing videos...";
      await this.preloadVideos();
      this.setupEventListeners();
      
      // Pre-buffer the first two videos
      if (this.videos[0]) {
        await this.prepareVideo(this.videos[0]);
        if (this.videos[1]) {
          await this.prepareVideo(this.videos[1]);
        }
      }
      
      this.loadingScreen.style.display = "none";
      this.startOverlay.classList.remove("hidden");
    } catch (error) {
      console.error("Initialization error:", error);
      this.loadingText.textContent = "Error loading videos. Please refresh.";
    }
  }

  async prepareVideo(video) {
    try {
      // Load a small portion of the video
      video.currentTime = 0;
      await video.load();
      
      // Start playing but immediately pause
      await video.play();
      video.pause();
      video.currentTime = 0;
    } catch (error) {
      console.error("Error preparing video:", error);
    }
  }

  async preloadVideos() {
    const loadPromises = videoList.map((src, index) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        
        video.innerHTML = `
          <source src="${src}" type="video/mp4">
        `;
        
        Object.assign(video, {
          preload: "auto",
          muted: true,
          playsInline: true,
          playsinline: true,
          'webkit-playsinline': true,
          controls: false,
          loop: false,
          defaultMuted: true
        });

        Object.assign(video.style, {
          width: "100%",
          height: "100%",
          opacity: "0",
          position: "absolute",
          top: "0",
          left: "0",
          objectFit: "cover",
          transition: "opacity 0.3s ease-out"
        });

        video.addEventListener('loadedmetadata', () => {
          resolve(video);
        }, { once: true });

        video.addEventListener("error", (e) => {
          console.error(`Error loading video ${index}:`, e);
          reject(e);
        });
        
        this.videoContainer.appendChild(video);
        this.videos.push(video);
      });
    });

    await Promise.all(loadPromises);
  }

  setupEventListeners() {
    document.body.removeEventListener("click", this.onTap);
    document.body.removeEventListener("touchstart", this.onTap);
    
    document.body.addEventListener("click", this.onTap, { passive: false });
    document.body.addEventListener("touchstart", this.onTap, { passive: false });
  }

  async transitionToVideo(newIndex) {
    if (newIndex >= this.videos.length) return;

    const currentVideo = this.videos[this.currentIndex];
    const nextVideo = this.videos[newIndex];

    try {
      // Make sure next video is ready to play
      nextVideo.currentTime = 0;
      
      // Start playing next video while it's still invisible
      await nextVideo.play();
      
      // Quick fade transition
      requestAnimationFrame(() => {
        nextVideo.style.opacity = "1";
        currentVideo.style.opacity = "0";
      });

      // Update current index
      this.currentIndex = newIndex;
      
      // Cleanup previous video
      setTimeout(() => {
        currentVideo.pause();
        currentVideo.currentTime = 0;
        
        // Pre-buffer the next video if it exists
        const upcomingIndex = newIndex + 1;
        if (upcomingIndex < this.videos.length) {
          this.prepareVideo(this.videos[upcomingIndex]);
        }
      }, 300); // Shorter timeout for faster transitions
      
    } catch (error) {
      console.error("Error during transition:", error);
    }
  }

  async onTap(event) {
    event.preventDefault();
    
    try {
      if (!this.isAppStarted) {
        this.isAppStarted = true;
        this.startOverlay.classList.add("hidden");
        
        const firstVideo = this.videos[0];
        firstVideo.style.opacity = "1";
        await firstVideo.play();
      } else if (this.currentIndex < this.videos.length - 1) {
        await this.transitionToVideo(this.currentIndex + 1);
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  }
}

/**********************************************
 * Initialize the player
 **********************************************/
document.addEventListener('DOMContentLoaded', () => {
  const player = new VideoPlayer();
  player.init().catch(error => {
    console.error("Player initialization error:", error);
    document.querySelector(".loading-text").textContent = "Error initializing player. Please refresh.";
  });
});
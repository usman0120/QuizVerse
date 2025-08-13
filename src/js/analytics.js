// User Statistics Tracker
class UserStats {
  constructor() {
    this.STORAGE_KEY = 'quizverse_stats';
    this.currentPage = window.location.pathname;
    this.isHomepage = this.currentPage === '/' || this.currentPage === '/index.html';
    this.stats = this.loadStats();
    this.startTime = Date.now();
    this.initialize();
  }

  loadStats() {
    const defaultStats = {
      totalUsers: 0,
      totalViews: 0,
      totalTime: 0, // in seconds
      lastUserId: 0,
      userSessions: {}
    };

    try {
      const savedStats = localStorage.getItem(this.STORAGE_KEY);
      return savedStats ? JSON.parse(savedStats) : defaultStats;
    } catch (e) {
      return defaultStats;
    }
  }

  saveStats() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
  }

  getOrCreateUserId() {
    const userIdKey = 'quizverse_user_id';
    let userId = localStorage.getItem(userIdKey);

    if (!userId) {
      userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem(userIdKey, userId);
      this.stats.totalUsers++;
      this.stats.lastUserId = userId;
    }

    return userId;
  }

  trackView() {
    const userId = this.getOrCreateUserId();
    this.stats.totalViews++;
    
    // Track session start time
    if (!this.stats.userSessions[userId]) {
      this.stats.userSessions[userId] = {
        lastActive: Date.now(),
        totalTime: 0
      };
    } else {
      this.stats.userSessions[userId].lastActive = Date.now();
    }
    
    this.saveStats();
  }

  trackTime() {
    const now = Date.now();
    const timeSpent = Math.floor((now - this.startTime) / 1000); // in seconds
    
    if (timeSpent > 5) { // Only track if spent more than 5 seconds
      const userId = this.getOrCreateUserId();
      if (this.stats.userSessions[userId]) {
        this.stats.userSessions[userId].totalTime += timeSpent;
        this.stats.totalTime += timeSpent;
        this.saveStats();
      }
    }
    
    this.startTime = now; // Reset for next interval
  }

  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      
      if (remainingMinutes > 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
      }
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
  }

  updateDisplay() {
    if (this.isHomepage) {
      const container = document.getElementById('stats-container');
      if (container) {
        container.classList.remove('hidden');
        document.getElementById('total-users').textContent = this.stats.totalUsers.toLocaleString();
        document.getElementById('total-views').textContent = this.stats.totalViews.toLocaleString();
        
        // Format time with proper units
        document.getElementById('total-time').textContent = this.formatTime(this.stats.totalTime);
      }
    }
  }

  initialize() {
    this.trackView();
    
    // Set up time tracking (update every 30 seconds)
    setInterval(() => this.trackTime(), 30000);
    
    // Update stats display on homepage every second for live feel
    if (this.isHomepage) {
      setInterval(() => this.updateDisplay(), 1000);
    } else {
      this.updateDisplay(); // Initial update
    }
    
    // Save stats when page is unloaded
    window.addEventListener('beforeunload', () => {
      this.trackTime();
      this.saveStats();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UserStats();
});
/**
 * Activity Tracker
 * Tracks user interactions with the portfolio website
 */

class ActivityTracker {
  constructor() {
    this.activities = [];
    this.startTime = new Date();
    this.init();
  }

  init() {
    // Track page load
    this.logActivity('page_view', {
      page: window.location.pathname,
      referrer: document.referrer
    });

    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, .clickable');
      if (target) {
        this.logActivity('click', {
          element: target.tagName,
          id: target.id || null,
          class: target.className || null,
          text: target.innerText || null,
          href: target.href || null
        });
      }
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', this.debounce(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.logActivity('scroll_depth', {
          depth: Math.round(maxScroll)
        });
      }
    }, 500));

    // Track time spent
    setInterval(() => {
      const timeSpent = Math.round((new Date() - this.startTime) / 1000);
      this.logActivity('time_spent', {
        seconds: timeSpent
      });
    }, 60000); // Log every minute

    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        this.logActivity('form_submit', {
          formId: form.id || null,
          formAction: form.action || null
        });
      });
    });
  }

  logActivity(type, data) {
    const activity = {
      type,
      timestamp: new Date().toISOString(),
      data
    };
    
    this.activities.push(activity);
    
    // In a real application, you might send this to a server
    console.log('Activity logged:', activity);
    
    // Store in localStorage for persistence
    this.saveActivities();
  }

  saveActivities() {
    try {
      localStorage.setItem('user_activities', JSON.stringify(this.activities));
    } catch (e) {
      console.error('Failed to save activities to localStorage', e);
    }
  }

  getActivities() {
    return this.activities;
  }

  clearActivities() {
    this.activities = [];
    localStorage.removeItem('user_activities');
  }

  // Helper function to limit event firing frequency
  debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.activityTracker = new ActivityTracker();
});
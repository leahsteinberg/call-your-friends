// Script to prevent FOUC (Flash of Unstyled Content)
if (typeof document !== 'undefined') {
  // Add loaded class to body when React has mounted
  document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure React has rendered
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100);
  });
}

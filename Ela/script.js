
// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = themeToggle?.querySelector('.theme-toggle__icon');

const syncThemeIcon = () => {
  if (!themeToggleIcon) return;
  themeToggleIcon.textContent = document.body.classList.contains('dark-mode') ? '☀' : '☾';
};

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode);
    syncThemeIcon();
  });
}

// Check for saved dark mode preference or OS preference
const savedDarkMode = localStorage.getItem('dark-mode');
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedDarkMode === 'true' || (savedDarkMode === null && prefersDarkMode)) {
  document.body.classList.add('dark-mode');
}

if (savedDarkMode === null && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (localStorage.getItem('dark-mode') !== null) return;
    document.body.classList.toggle('dark-mode', event.matches);
    syncThemeIcon();
  });
}

syncThemeIcon();

// Font Awesome fallback handling
const enableFontAwesomeIfReady = () => {
  if (!('fonts' in document)) {
    document.body.classList.add('fontawesome-ready');
    return;
  }

  const markIfLoaded = () => {
    const hasSolid = document.fonts.check('1em "Font Awesome 6 Free"');
    const hasBrands = document.fonts.check('1em "Font Awesome 6 Brands"');
    if (hasSolid || hasBrands) {
      document.body.classList.add('fontawesome-ready');
    }
  };

  markIfLoaded();

  document.fonts.ready.then(() => {
    markIfLoaded();
    if (!document.body.classList.contains('fontawesome-ready')) {
      setTimeout(markIfLoaded, 400);
    }
  });

  setTimeout(markIfLoaded, 2500);
};

enableFontAwesomeIfReady();

// Show More Projects
const showMoreButton = document.getElementById('show-more');

if (showMoreButton) {
  showMoreButton.addEventListener('click', () => {
    document.querySelectorAll('.portfolio-item.hidden, .portfolio-item[style*="display: none"]')
      .forEach((item) => {
        item.classList.remove('hidden');
        item.style.removeProperty('display');
      });
    showMoreButton.style.display = 'none';
  });
}

// Project Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

if (filterButtons.length > 0 && portfolioItems.length > 0) {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || filter === category) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1
});

const elementsToAnimate = document.querySelectorAll('.portfolio-item, .fun-facts, .contact-container');
elementsToAnimate.forEach(element => {
  observer.observe(element);
});

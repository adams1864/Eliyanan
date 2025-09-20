
// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode);
  });
}

// Check for saved dark mode preference
const savedDarkMode = localStorage.getItem('dark-mode');
if (savedDarkMode === 'true') {
  document.body.classList.add('dark-mode');
}

// Show More Projects
const showMoreButton = document.getElementById('show-more');
const projectCards = document.querySelectorAll('.project-card');

if (showMoreButton) {
  showMoreButton.addEventListener('click', () => {
    projectCards.forEach((card) => {
      card.style.display = 'block';
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

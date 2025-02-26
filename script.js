// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('dark-mode', isDarkMode);
});

// Check for saved dark mode preference
const savedDarkMode = localStorage.getItem('dark-mode');
if (savedDarkMode === 'true') {
  document.body.classList.add('dark-mode');
}

// Show More Projects
const showMoreButton = document.getElementById('show-more');
const projectCards = document.querySelectorAll('.project-card');

showMoreButton.addEventListener('click', () => {
  projectCards.forEach((card) => {
    card.style.display = 'block';
  });
  showMoreButton.style.display = 'none';
});
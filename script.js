/*
 * Placeholder JavaScript for the AI in Space poster session site.
 *
 * You can add interactive behaviour here.  For example, you might use this
 * script to load assignment data, generate charts with Chart.js or
 * implement smooth scrolling.  Keep this script lightweight: avoid
 * frameworks and ensure it runs efficiently in the browser.
 */

// Example: Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: 'smooth'
      });
    }
  });
});

// Example: function to fetch assignments CSV (not used by default)
// This demonstrates how you could dynamically load team data from
// assignments.csv and display it in the topics section.  To enable it
// uncomment the call to loadAssignments() at the end of this file.

function loadAssignments() {
  fetch('assignments.csv')
    .then(response => response.text())
    .then(text => {
      const rows = text.trim().split('\n');
      const headers = rows[0].split(',');
      const data = rows.slice(1).map(r => {
        const cols = r.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h.trim()] = cols[i]; });
        return obj;
      });
      console.log('Loaded assignments:', data);
      // You could use this data to build tables or charts
    });
}

// Uncomment the following line to load assignments at runtime.
// loadAssignments();
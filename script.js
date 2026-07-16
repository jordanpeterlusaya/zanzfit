const modal = document.querySelector('.booking-modal');
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
const bookingForm = document.querySelector('#booking-form');
const toast = document.querySelector('.toast');
const dateInput = document.querySelector('#booking-date');
const packageSelect = document.querySelector('#package-select');
const trainerSelect = document.querySelector('#trainer-select');
const progressBar = document.querySelector('.scroll-progress span');
const header = document.querySelector('.site-header');
const summaryPackage = document.querySelector('#summary-package');
const summaryLocation = document.querySelector('#summary-location');
const summaryDate = document.querySelector('#summary-date');
const WHATSAPP_NUMBER = '255717318156';

const today = new Date();
dateInput.min = today.toISOString().split('T')[0];
document.querySelector('#year').textContent = today.getFullYear();

function toggleMenu(force) {
  const open = typeof force === 'boolean' ? force : !mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', open);
  menuButton.classList.toggle('active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  mobileNav.setAttribute('aria-hidden', String(!open));
}

function openBooking(trigger) {
  const selectedPackage = trigger?.dataset.package;
  const selectedTrainer = trigger?.dataset.trainer;
  if (selectedPackage) packageSelect.value = selectedPackage;
  if (selectedTrainer) trainerSelect.value = selectedTrainer;
  updateBookingSummary();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  toggleMenu(false);
  setTimeout(() => bookingForm.elements.name.focus(), 400);
}

function closeBooking() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

menuButton.addEventListener('click', () => toggleMenu());
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
document.querySelectorAll('[data-open-booking]').forEach(button => button.addEventListener('click', () => openBooking(button)));
document.querySelectorAll('[data-close-booking]').forEach(button => button.addEventListener('click', closeBooking));

function updateBookingSummary() {
  summaryPackage.textContent = packageSelect.value || 'Choose session';
  summaryLocation.textContent = bookingForm.elements.location.value || 'Select area';
  summaryDate.textContent = bookingForm.elements.date.value
    ? new Date(`${bookingForm.elements.date.value}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : 'Choose date';
}

bookingForm.addEventListener('input', updateBookingSummary);

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

document.querySelectorAll('.faq-item button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const willOpen = !item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(faq => {
      faq.classList.remove('open');
      faq.querySelector('button').setAttribute('aria-expanded', 'false');
      faq.querySelector('button i').textContent = '+';
    });
    if (willOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('i').textContent = '−';
    }
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeBooking();
    toggleMenu(false);
  }
});

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(bookingForm);
  const lines = [
    'Hello ZanziFit! 👋 I would like to book a trainer.',
    '',
    `*Name:* ${data.get('name')}`,
    `*Guest WhatsApp:* ${data.get('phone')}`,
    `*Area / Stay:* ${data.get('location')}`,
    `*Trainer:* ${data.get('trainer')}`,
    `*Session:* ${data.get('package')}`,
    `*Date:* ${data.get('date')}`,
    `*Time:* ${data.get('time')}`,
    `*Fitness level:* ${data.get('level')}`,
    `*Notes:* ${data.get('notes') || 'None'}`,
    '',
    'Please confirm availability and final price. Thank you!'
  ];
  const booking = Object.fromEntries(data.entries());
  localStorage.setItem('zanzifit-last-booking', JSON.stringify({ ...booking, createdAt: new Date().toISOString() }));
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(whatsappUrl, '_blank', 'noopener');
  setTimeout(closeBooking, 250);
  toast.querySelector('strong').textContent = 'WhatsApp opened!';
  toast.querySelector('small').textContent = 'Review your details and tap Send to finish.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

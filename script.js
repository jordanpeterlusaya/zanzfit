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
const backToTop = document.querySelector('.back-to-top');
const WHATSAPP_NUMBER = '255717318156';

const today = new Date();
dateInput.min = today.toISOString().split('T')[0];
document.querySelector('#year').textContent = today.getFullYear();

/* ---------- Mobile menu ---------- */
function toggleMenu(force) {
  const open = typeof force === 'boolean' ? force : !mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', open);
  menuButton.classList.toggle('active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  mobileNav.setAttribute('aria-hidden', String(!open));
}

/* ---------- Booking wizard ---------- */
const steps = Array.from(bookingForm.querySelectorAll('.wizard-step'));
const dots = Array.from(document.querySelectorAll('.wizard-dots li'));
const wizardFill = document.querySelector('.wizard-fill');
const wizardError = document.querySelector('.wizard-error');
const nextBtn = document.querySelector('[data-wizard-next]');
const backBtn = document.querySelector('[data-wizard-back]');
let currentStep = 1;

const stepFields = {
  1: ['location'],
  2: ['date', 'time'],
  3: ['name', 'phone']
};

function renderStep() {
  steps.forEach(step => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  dots.forEach(dot => {
    const n = Number(dot.dataset.stepDot);
    dot.classList.toggle('active', n === currentStep);
    dot.classList.toggle('done', n < currentStep);
  });
  wizardFill.style.width = `${(currentStep / steps.length) * 100}%`;
  bookingForm.classList.toggle('on-first-step', currentStep === 1);
  bookingForm.classList.toggle('on-last-step', currentStep === steps.length);
  wizardError.textContent = '';
}

function validateStep(step) {
  const fields = stepFields[step] || [];
  let firstInvalid = null;
  fields.forEach(name => {
    const field = bookingForm.elements[name];
    if (!field) return;
    const valid = field.value.trim() !== '';
    field.classList.toggle('invalid', !valid);
    if (!valid && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    wizardError.textContent = 'Please fill in the highlighted field to continue.';
    firstInvalid.focus();
    return false;
  }
  wizardError.textContent = '';
  return true;
}

function goToStep(step) {
  currentStep = Math.min(Math.max(step, 1), steps.length);
  renderStep();
}

nextBtn.addEventListener('click', () => {
  if (validateStep(currentStep)) goToStep(currentStep + 1);
});
backBtn.addEventListener('click', () => goToStep(currentStep - 1));

function openBooking(trigger) {
  const selectedPackage = trigger?.dataset.package;
  const selectedTrainer = trigger?.dataset.trainer;
  if (selectedPackage) packageSelect.value = selectedPackage;
  if (selectedTrainer) trainerSelect.value = selectedTrainer;
  goToStep(1);
  updateBookingSummary();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  toggleMenu(false);
  setTimeout(() => bookingForm.elements.location.focus(), 420);
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

bookingForm.addEventListener('input', event => {
  updateBookingSummary();
  if (event.target.classList.contains('invalid') && event.target.value.trim() !== '') {
    event.target.classList.remove('invalid');
  }
});

/* ---------- Scroll progress + header + back-to-top + scroll-spy ---------- */
const spySections = Array.from(document.querySelectorAll('main section[id], header[id]'));
const navLinks = Array.from(document.querySelectorAll('.desktop-nav a'));

function onScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  header.classList.toggle('scrolled', window.scrollY > 20);
  backToTop.classList.toggle('show', window.scrollY > 600);

  const pos = window.scrollY + 140;
  let activeId = spySections[0]?.id;
  for (const section of spySections) {
    if (section.offsetTop <= pos) activeId = section.id;
  }
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- FAQ accordion ---------- */
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

/* ---------- Submit -> WhatsApp ---------- */
bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateStep(3)) return;
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

/* ---------- Staggered scroll reveals ---------- */
const grouped = new Map();
document.querySelectorAll('.reveal').forEach(el => {
  const parent = el.parentElement;
  const list = grouped.get(parent) || [];
  list.push(el);
  grouped.set(parent, list);
});
grouped.forEach(list => list.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`; }));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

/* ---------- Animated stat counters ---------- */
const counters = Array.from(document.querySelectorAll('.stat strong[data-count]'));
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });
counters.forEach(counter => counterObserver.observe(counter));

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = value.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(frame);
}

/* ---------- Testimonials carousel ---------- */
const testimonials = Array.from(document.querySelectorAll('.testimonial'));
const testimonialDots = Array.from(document.querySelectorAll('.testimonial-dots button'));
let testimonialIndex = 0;
let testimonialTimer;

function showTestimonial(index) {
  testimonialIndex = (index + testimonials.length) % testimonials.length;
  testimonials.forEach((t, i) => t.classList.toggle('active', i === testimonialIndex));
  testimonialDots.forEach((d, i) => d.classList.toggle('active', i === testimonialIndex));
}

function startTestimonialAuto() {
  clearInterval(testimonialTimer);
  testimonialTimer = setInterval(() => showTestimonial(testimonialIndex + 1), 6000);
}

if (testimonials.length) {
  testimonialDots.forEach(dot => dot.addEventListener('click', () => {
    showTestimonial(Number(dot.dataset.testimonial));
    startTestimonialAuto();
  }));
  document.querySelector('.t-next')?.addEventListener('click', () => { showTestimonial(testimonialIndex + 1); startTestimonialAuto(); });
  document.querySelector('.t-prev')?.addEventListener('click', () => { showTestimonial(testimonialIndex - 1); startTestimonialAuto(); });
  startTestimonialAuto();
}

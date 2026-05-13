// ===== UI & UTILITY FUNCTIONS =====

// POPUP
let popupShown = false;
setTimeout(() => { if(!popupShown) openPopup(); }, 3000);

function openPopup() {
  popupShown = true;
  document.getElementById('popupOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

function closePopupOuter(e) {
  if(e.target === document.getElementById('popupOverlay')) closePopup();
}

async function submitRegistration() {
  const name = document.getElementById('pName').value.trim();
  const phone = document.getElementById('pPhone').value.trim();
  const email = document.getElementById('pEmail').value.trim();
  const gender = document.getElementById('pGender').value;
  const college = document.getElementById('pCollege').value.trim();
  const course = document.getElementById('pCourse').value.trim();
  const room = document.getElementById('pRoom').value;
  const checkin = document.getElementById('pCheckin').value;
  const parent = document.getElementById('pParent').value.trim();
  const food = document.getElementById('pFood').value;
  const notes = document.getElementById('pNotes').value.trim();
  const terms = document.getElementById('pTerms').checked;

  if(!name || !phone || !gender || !college) {
    showToast('Please fill in all required fields (Name, Phone, Gender, College)', 'error');
    return;
  }
  if(!terms) {
    showToast('Please accept the Terms & Conditions to proceed', 'error');
    return;
  }
  if(phone.length < 10) {
    showToast('Please enter a valid phone number', 'error');
    return;
  }
  if(email && submittedEmails.includes(email)) {
    showToast('This email has already been registered. We will contact you soon!', 'error');
    return;
  }

  const btn = document.querySelector('.popup-submit');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  const record = {
    full_name: name, phone, email, gender,
    college_name: college, course,
    room_preference: room, check_in_date: checkin || null,
    parent_contact: parent, food_preference: food,
    additional_notes: notes, status: 'new',
    created_at: new Date().toISOString()
  };

  // Try backend first
  const result = await submitRegistrationToBackend(record);

  // Always store locally as well
  leads.push({...record, id: Date.now()});
  localStorage.setItem('mlv_leads', JSON.stringify(leads));
  if(email) {
    submittedEmails.push(email);
    localStorage.setItem('mlv_emails', JSON.stringify(submittedEmails));
  }

  updateAdminMetrics();

  document.getElementById('popupContent').innerHTML = `
    <div class="popup-success">
      <div class="icon">🎉</div>
      <h3>Registration Successful!</h3>
      <p>Thank you, <strong>${name}</strong>! Your pre-registration has been received.<br><br>
      Our team will contact you at <strong>${phone}</strong> within 24 hours to confirm your booking and guide you through the next steps.<br><br>
      You can also reach us directly on WhatsApp for faster response.</p>
      <a href="https://wa.me/918809630649?text=Hi%2C%20I%20just%20registered%20-%20${encodeURIComponent(name)}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px">💬 Chat on WhatsApp</a>
    </div>`;

  btn.textContent = 'Submit Registration';
  btn.disabled = false;
  setTimeout(() => closePopup(), 8000);
}

// CONTACT FORM
async function submitContact() {
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const msg = document.getElementById('cMsg').value.trim();

  if(!name || !phone) {
    showToast('Please enter your name and phone number', 'error');
    return;
  }

  await submitContactFormToBackend({ name, phone, email, message: msg });
  showToast(`Message sent! We'll contact you at ${phone} within 24 hours. 📞`, 'success');

  document.getElementById('cName').value = '';
  document.getElementById('cPhone').value = '';
  document.getElementById('cEmail').value = '';
  document.getElementById('cMsg').value = '';
}

// PAGES
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if(page === 'admin') { updateAdminMetrics(); }
  window.scrollTo(0,0);
}

// GALLERY FILTER
function filterGallery(cat, btn) {
  document.querySelectorAll('.gf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.style.display = (cat === 'all' || item.dataset.cat === cat) ? 'block' : 'none';
  });
}

// FAQ
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if(!wasOpen) item.classList.add('open');
}

// SCROLL
function scrollTo(id) {
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
}

// TOAST
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' error' : '');
  setTimeout(() => t.classList.remove('show'), 4000);
}

// MOBILE MENU
function toggleMobileMenu() {
  const links = document.getElementById('navLinks');
  if(!links) return;
  const isOpen = links.style.display === 'flex';
  links.style.cssText = isOpen ? '' : 'display:flex;flex-direction:column;position:absolute;top:70px;left:0;right:0;background:var(--navy);padding:20px 5%;gap:16px;border-bottom:1px solid rgba(201,168,76,.2)';
}

// SECRET ADMIN ACCESS
let adminKeySeq = [];
document.addEventListener('keydown', e => {
  adminKeySeq.push(e.key);
  adminKeySeq = adminKeySeq.slice(-4);
  if(adminKeySeq.join('') === 'mlva') showPage('admin');
});

// ===== ADMIN FUNCTIONS =====

function updateAdminMetrics() {
  document.getElementById('mLeads').textContent = leads.length;
  document.getElementById('mPending').textContent = leads.filter(l => l.status === 'new').length;
  renderAdminTable(leads);
}

function renderAdminTable(data) {
  const tbody = document.getElementById('adminTbody');
  if(!data.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">No leads yet. Students who submit the registration form will appear here.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map((l,i) => `
    <tr>
      <td style="color:var(--muted)">${i+1}</td>
      <td><strong>${l.full_name}</strong></td>
      <td>${l.phone}</td>
      <td style="color:var(--muted)">${l.email || '—'}</td>
      <td>${l.college_name || '—'}</td>
      <td>${l.room_preference || '—'}</td>
      <td>${l.check_in_date || '—'}</td>
      <td><span class="status-badge status-${l.status || 'new'}">${l.status || 'New'}</span></td>
      <td>
        <select onchange="updateStatus(${leads.indexOf(l)},this.value)" style="padding:5px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer">
          <option ${l.status==='new'?'selected':''} value="new">New</option>
          <option ${l.status==='contacted'?'selected':''} value="contacted">Contacted</option>
          <option ${l.status==='confirmed'?'selected':''} value="confirmed">Confirmed</option>
        </select>
      </td>
    </tr>`).join('');
}

function updateStatus(idx, status) {
  leads[idx].status = status;
  localStorage.setItem('mlv_leads', JSON.stringify(leads));
  updateLeadStatus(leads[idx].id, status); // Call backend API
  updateAdminMetrics();
  showToast(`Status updated to "${status}" ✓`, 'success');
}

function filterTable() {
  const q = document.getElementById('adminSearch').value.toLowerCase();
  const filtered = leads.filter(l =>
    (l.full_name||'').toLowerCase().includes(q) ||
    (l.phone||'').includes(q) ||
    (l.college_name||'').toLowerCase().includes(q) ||
    (l.email||'').toLowerCase().includes(q)
  );
  renderAdminTable(filtered);
}

function exportCSV() {
  if(!leads.length) { showToast('No data to export yet', 'error'); return; }
  const headers = ['Name','Phone','Email','Gender','College','Course','Room','Check-in','Parent Contact','Food','Notes','Status','Date'];
  const rows = leads.map(l => [l.full_name,l.phone,l.email,l.gender,l.college_name,l.course,l.room_preference,l.check_in_date,l.parent_contact,l.food_preference,l.additional_notes,l.status,l.created_at]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `mlv_leads_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  showToast('CSV exported successfully! 📊', 'success');
}

// Initialize
updateAdminMetrics();

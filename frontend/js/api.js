// ===== API CALLS TO BACKEND =====

async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (e) {
    console.error('API call failed:', e);
    return null;
  }
}

async function submitRegistrationToBackend(formData) {
  return apiCall('/registrations', 'POST', formData);
}

async function submitContactFormToBackend(formData) {
  return apiCall('/contact', 'POST', formData);
}

async function fetchLeadsFromBackend() {
  return apiCall('/registrations', 'GET');
}

async function updateLeadStatus(id, status) {
  return apiCall(`/registrations/${id}`, 'PATCH', { status });
}

async function exportLeadsAsCSV() {
  return apiCall('/registrations/export/csv', 'GET');
}

const $ = id => document.getElementById(id);

let currentAdminCode = '';

async function loadEmployees() {
  const adminCode = $('adminCode').value.trim();
  if (!adminCode) {
    $('auth-msg').textContent = 'Please enter admin code.';
    return;
  }

  $('auth-msg').textContent = 'Loading...';
  try {
    const res = await fetch('/api/admin/list-employees', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ adminCode })
    });
    const data = await res.json();

    if (!res.ok) {
      $('auth-msg').textContent = data && data.error ? `⚠️ ${data.error}` : '⚠️ Unable to load employees.';
      $('employee-list-section').classList.add('hidden');
      return;
    }

    currentAdminCode = adminCode;
    $('auth-msg').textContent = '';
    displayEmployees(data.employees);
    $('employee-list-section').classList.remove('hidden');
  } catch (err) {
    $('auth-msg').textContent = '⚠️ Network error. Please check your connection and try again.';
    $('employee-list-section').classList.add('hidden');
  }
}

function displayEmployees(employees) {
  const list = $('employee-list');
  
  if (!employees || employees.length === 0) {
    list.innerHTML = '<p class="muted">No employees found.</p>';
    return;
  }

  list.innerHTML = '';
  const table = document.createElement('table');
  table.style.width = '100%';
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Passcode</th>
        <th>Pay Rate</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody id="employee-tbody"></tbody>
  `;
  list.appendChild(table);

  const tbody = document.getElementById('employee-tbody');
  employees.forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.passcode}</td>
      <td>$${Number(emp.pay_rate).toFixed(2)}/hr</td>
      <td>
        <button class="delete-btn" data-id="${emp.id}" data-name="${emp.name}" 
                style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteEmployee(btn.dataset.id, btn.dataset.name));
  });
}

async function deleteEmployee(employeeId, employeeName) {
  if (!confirm(`Are you sure you want to delete ${employeeName}?\n\nTheir attendance records will be preserved.`)) {
    return;
  }

  try {
    const res = await fetch('/api/admin/delete-employee', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ adminCode: currentAdminCode, employeeId })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data && data.error ? data.error : 'Unable to delete employee.');
      return;
    }

    alert(`${employeeName} has been deleted successfully.`);
    // Reload the employee list
    loadEmployees();
  } catch (err) {
    alert('Network error. Please check your connection and try again.');
  }
}

$('load-btn').addEventListener('click', loadEmployees);

// Allow pressing Enter in admin code field
$('adminCode').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loadEmployees();
});

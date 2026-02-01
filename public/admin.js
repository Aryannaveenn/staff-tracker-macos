const $ = id => document.getElementById(id);

let currentAdminCode = '';

function authenticate() {
  const adminCode = $('adminCode').value.trim();
  if (!adminCode) {
    $('auth-msg').textContent = 'Please enter admin code.';
    return;
  }
  if (adminCode !== '0123') {
    $('auth-msg').textContent = '⚠️ Invalid admin code.';
    return;
  }
  currentAdminCode = adminCode;
  $('auth-msg').textContent = '';
  $('add-employee-section').classList.remove('hidden');
  // Scroll to form
  $('add-employee-section').scrollIntoView({ behavior: 'smooth' });
}

async function addEmployee() {
  const name = $('empName').value.trim();
  const passcode = $('empPass').value.trim();
  const pay_rate = parseFloat($('empRate').value) || 0;
  
  if (!name || !passcode) {
    $('result').textContent = '⚠️ Please provide both name and passcode.';
    return;
  }
  
  $('result').textContent = 'Working...';
  try {
    const res = await fetch('/api/admin/add-employee', {
      method: 'POST', headers: {'content-type':'application/json'},
      body: JSON.stringify({ adminCode: currentAdminCode, name, passcode, pay_rate })
    });
    const data = await res.json();
    if (!res.ok) {
      $('result').textContent = data && data.error ? `⚠️ ${data.error}` : '⚠️ Unable to add employee. Please try again.';
      return;
    }
    $('result').textContent = `✓ Added ${data.name} (id ${data.id}) with pay rate $${Number(data.pay_rate).toFixed(2)}`;
    $('empName').value = '';
    $('empPass').value = '';
    $('empRate').value = '';
  } catch (err) {
    $('result').textContent = '⚠️ Network error. Please check your connection and try again.';
  }
}

$('auth-btn').addEventListener('click', authenticate);
$('add-btn').addEventListener('click', addEmployee);
$('clear-btn').addEventListener('click', ()=>{ $('empName').value=''; $('empPass').value=''; $('empRate').value=''; $('result').textContent=''; });

// Allow pressing Enter in admin code field
$('adminCode').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') authenticate();
});

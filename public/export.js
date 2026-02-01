const $ = id => document.getElementById(id);

let isAuthenticated = false;

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
  isAuthenticated = true;
  $('auth-msg').textContent = '';
  $('export-section').classList.remove('hidden');
  // Scroll to export section
  $('export-section').scrollIntoView({ behavior: 'smooth' });
}

async function exportData() {
  if (!isAuthenticated) {
    $('export-msg').textContent = '⚠️ Please authenticate first.';
    return;
  }

  $('export-msg').textContent = 'Generating spreadsheet...';
  $('export-btn').disabled = true;

  try {
    const res = await fetch('/api/export');
    
    if (!res.ok) {
      const data = await res.json();
      $('export-msg').textContent = data && data.error ? `⚠️ ${data.error}` : '⚠️ Unable to export data.';
      $('export-btn').disabled = false;
      return;
    }

    // Download the file
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    $('export-msg').textContent = '✓ Spreadsheet downloaded successfully!';
    $('export-btn').disabled = false;
  } catch (err) {
    $('export-msg').textContent = '⚠️ Network error. Please check your connection and try again.';
    $('export-btn').disabled = false;
  }
}

$('auth-btn').addEventListener('click', authenticate);
$('export-btn').addEventListener('click', exportData);

// Allow pressing Enter in admin code field
$('adminCode').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') authenticate();
});

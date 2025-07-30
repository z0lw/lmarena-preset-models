// Load saved preferences when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const result = await browser.storage.local.get(['model1', 'model2']);
    
    if (result.model1) {
      document.getElementById('model1').value = result.model1;
    }
    
    if (result.model2) {
      document.getElementById('model2').value = result.model2;
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
});

// Save preferences when button is clicked
document.getElementById('save').addEventListener('click', async () => {
  const model1 = document.getElementById('model1').value.trim();
  const model2 = document.getElementById('model2').value.trim();
  const statusDiv = document.getElementById('status');
  
  try {
    // Save to browser storage
    await browser.storage.local.set({
      model1: model1,
      model2: model2
    });
    
    // Show success message
    statusDiv.textContent = 'Preferences saved successfully!';
    statusDiv.className = 'success';
    statusDiv.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    // Show error message
    statusDiv.textContent = 'Error saving preferences: ' + error.message;
    statusDiv.className = 'error';
    statusDiv.style.display = 'block';
  }
});
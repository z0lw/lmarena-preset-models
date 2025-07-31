// Wait for the page to load
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
}

// Function to click an element
function clickElement(element) {
  // Try multiple click methods
  try {
    element.click();
  } catch (e) {
    try {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
    } catch (e2) {
      console.error('Failed to click element:', e2);
    }
  }
}

// Function to select a model in a dropdown
async function selectModel(dropdownElement, modelName) {
  try {
    console.log(`Attempting to select model: ${modelName}`);
    
    // Click the dropdown
    clickElement(dropdownElement);
    
    // Wait for dropdown/dialog to open
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Additional wait for dialog to fully render
    const dialogAppeared = await waitForElement('[role="dialog"], [role="listbox"], .ant-select-dropdown', 2000).catch(() => null);
    if (dialogAppeared) {
      console.log('Dialog/dropdown appeared');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Try multiple selectors for dropdown options
    const optionSelectors = [
      // For dialog-based dropdowns (like in the HTML you provided)
      '[role="dialog"] button',
      '[role="dialog"] [role="option"]',
      // For standard dropdowns
      '.ant-select-item-option',
      '[role="option"]',
      '.rc-virtual-list-holder-inner [role="option"]',
      '.ant-select-dropdown [role="option"]',
      'div[role="listbox"] div[role="option"]',
      // For any button inside a dialog that might contain model names
      'div[id^="radix-"] button'
    ];
    
    let options = [];
    for (const selector of optionSelectors) {
      options = document.querySelectorAll(selector);
      if (options.length > 0) {
        console.log(`Found ${options.length} options with selector: ${selector}`);
        break;
      }
    }
    
    // If no options found, look for any clickable elements with model names
    if (options.length === 0) {
      const allElements = document.querySelectorAll('button, div[role="option"], [tabindex="0"]');
      options = Array.from(allElements).filter(el => {
        const text = el.textContent || '';
        return text.includes('gpt') || text.includes('claude') || text.includes('gemini') || 
               text.includes('llama') || text.includes('mistral');
      });
      console.log(`Found ${options.length} potential model elements`);
    }
    
    // Log first few options for debugging
    console.log('Available options:');
    for (let i = 0; i < Math.min(5, options.length); i++) {
      const text = options[i].textContent || options[i].innerText || '';
      console.log(`  Option ${i}: "${text.trim()}"`);
    }
    if (options.length > 5) {
      console.log(`  ... and ${options.length - 5} more options`);
    }
    
    // Look for the model
    for (const option of options) {
      const text = option.textContent || option.innerText || '';
      const trimmedText = text.trim();
      
      // Check for exact match or partial match
      // Also check for search mode variants
      const modelNameLower = modelName.toLowerCase();
      const trimmedTextLower = trimmedText.toLowerCase();
      
      if (trimmedText && (
        trimmedTextLower === modelNameLower ||
        trimmedTextLower.includes(modelNameLower) ||
        modelNameLower.includes(trimmedTextLower) ||
        // Check for search mode variants
        (modelNameLower.includes('o3') && trimmedTextLower.includes('o3-search')) ||
        (modelNameLower.includes('gemini') && trimmedTextLower.includes('gemini') && trimmedTextLower.includes('grounding')) ||
        (modelNameLower.includes('claude') && trimmedTextLower.includes('claude') && trimmedTextLower.includes('search')) ||
        (modelNameLower.includes('gpt') && trimmedTextLower.includes('gpt') && trimmedTextLower.includes('search'))
      )) {
        console.log(`Found matching option: "${trimmedText}"`);
        
        // Try multiple click methods to ensure selection
        clickElement(option);
        
        // Also try keyboard selection
        option.focus && option.focus();
        
        // Wait for selection to register
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Simulate Enter key to confirm selection
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true
        });
        option.dispatchEvent(enterEvent);
        
        // Additional wait
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
      }
    }
    
    console.log(`Model "${modelName}" not found among ${options.length} options`);
    
    // Try to close dropdown/dialog if still open
    // Look for close button or click outside
    const closeButton = document.querySelector('[role="dialog"] button[aria-label="Close"]');
    if (closeButton) {
      clickElement(closeButton);
    } else {
      // Click the dropdown button again to close
      clickElement(dropdownElement);
    }
    
    return false;
  } catch (error) {
    console.error('Error selecting model:', error);
    return false;
  }
}

// Check if we're in search mode
async function isSearchMode() {
  // Check URL for chat-modality=search parameter
  if (window.location.href.includes('chat-modality=search')) {
    console.log('Search mode detected from URL parameter');
    return true;
  }
  
  // Fallback: Check if dropdown is already populated with search models
  await new Promise(resolve => setTimeout(resolve, 100));
  const comboboxes = document.querySelectorAll('[role="combobox"]');
  for (const box of comboboxes) {
    const text = box.textContent || '';
    if (text.includes('-search') || text.includes('-grounding')) {
      console.log('Search mode detected: dropdown contains search model');
      return true;
    }
  }
  
  return false;
}

// Apply saved preferences
async function applyPreferences() {
  try {
    // Get saved preferences from storage
    const result = await browser.storage.local.get(['model1', 'model2', 'searchModel1', 'searchModel2']);
    
    // Detect if we're in search mode
    const searchMode = await isSearchMode();
    console.log('Mode detected:', searchMode ? 'Search Mode' : 'Normal Mode');
    
    // Select appropriate preferences based on mode
    let selectedModel1, selectedModel2;
    if (searchMode) {
      selectedModel1 = result.searchModel1;
      selectedModel2 = result.searchModel2;
    } else {
      selectedModel1 = result.model1;
      selectedModel2 = result.model2;
    }
    
    if (!selectedModel1 && !selectedModel2) {
      console.log(`No saved preferences found for ${searchMode ? 'search' : 'normal'} mode`);
      return;
    }
    
    console.log('Using preferences:', { model1: selectedModel1, model2: selectedModel2 });
    
    // Wait for the page to be ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Additional wait to ensure all elements are loaded
    await waitForElement('button[role="combobox"]').catch(() => {
      console.log('Timeout waiting for combobox buttons');
    });
    
    // Check current mode
    const url = window.location.href;
    const isDirectMode = url.includes('mode=direct');
    const isSideBySideMode = url.includes('mode=side-by-side');
    
    if (isDirectMode) {
      console.log('Direct Chat mode detected');
    } else if (isSideBySideMode) {
      console.log('Side-by-side mode detected');
    }
    
    // Apply models for both direct and side-by-side modes
    if (isDirectMode || isSideBySideMode) {
      
      // First, find and exclude the mode selector
      const allComboboxes = document.querySelectorAll('button[role="combobox"]');
      let modeSelector = null;
      
      // Identify the mode selector button
      for (const btn of allComboboxes) {
        const text = btn.textContent || '';
        if (text.includes('Battle') || text.includes('Direct Chat') || 
            text.includes('Side by Side') || text.includes('Compare 2 models')) {
          modeSelector = btn;
          console.log('Identified mode selector:', text.trim());
          break;
        }
      }
      
      // Get model dropdowns by excluding the mode selector
      let dropdowns = Array.from(allComboboxes).filter(btn => {
        // Skip the mode selector
        if (btn === modeSelector) {
          console.log('Excluding mode selector from dropdowns');
          return false;
        }
        
        // Also double-check by text content
        const text = btn.textContent || '';
        if (text.includes('Battle') || text.includes('Direct Chat') || 
            text.includes('Side by Side') || text.includes('Compare 2 models')) {
          console.log('Excluding mode-related button:', text.trim());
          return false;
        }
        
        return true;
      });
      
      console.log(`Found ${dropdowns.length} potential model dropdowns after excluding mode selector`);
      
      // Remove duplicates based on element reference
      dropdowns = [...new Set(dropdowns)];
      console.log(`After removing duplicates: ${dropdowns.length} dropdowns`);
      
      // Take only first 2 dropdowns if we have more
      if (dropdowns.length > 2) {
        dropdowns = dropdowns.slice(0, 2);
        console.log(`Using first 2 model dropdowns`);
      }
      
      if (dropdowns.length >= 1) {
        console.log(`Using ${dropdowns.length} model dropdown(s)`);
        
        // Select first model
        if (selectedModel1) {
          console.log(`Setting model 1 to: ${selectedModel1}`);
          const success1 = await selectModel(dropdowns[0], selectedModel1);
          if (success1) {
            console.log('Model 1 selected successfully');
            // Verify the selection by checking button text
            await new Promise(resolve => setTimeout(resolve, 100));
            const newText1 = dropdowns[0].textContent || '';
            if (newText1.includes(selectedModel1)) {
              console.log('Model 1 selection verified');
            } else {
              console.log('Model 1 selection may not have been applied properly');
            }
          } else {
            console.log('Failed to select model 1');
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Select second model only in side-by-side mode
        if (selectedModel2 && isSideBySideMode && dropdowns.length >= 2) {
          console.log(`Setting model 2 to: ${selectedModel2}`);
          const success2 = await selectModel(dropdowns[1], selectedModel2);
          if (success2) {
            console.log('Model 2 selected successfully');
            // Verify the selection by checking button text
            await new Promise(resolve => setTimeout(resolve, 100));
            const newText2 = dropdowns[1].textContent || '';
            if (newText2.includes(selectedModel2)) {
              console.log('Model 2 selection verified');
            } else {
              console.log('Model 2 selection may not have been applied properly');
            }
          } else {
            console.log('Failed to select model 2');
          }
        }
        
        console.log('Model selection process completed');
      } else {
        console.log(`Could not find model selection dropdown(s). Found: ${dropdowns.length}`);
        // Log what we did find for debugging
        dropdowns.forEach((d, i) => {
          console.log(`Dropdown ${i}: ${d.textContent?.substring(0, 50)}...`);
        });
      }
    }
  } catch (error) {
    console.error('Error applying preferences:', error);
  }
}

// Track if we've already applied preferences
let hasAppliedPreferences = false;

// Function to check if models are already selected
function areModelsAlreadySelected() {
  const buttons = document.querySelectorAll('[data-sentry-component="SideBySideSelector"] button[role="combobox"]');
  if (buttons.length >= 2) {
    const model1Text = buttons[0]?.textContent || '';
    const model2Text = buttons[1]?.textContent || '';
    
    // Check if buttons contain actual model names (not "Select model" or empty)
    return model1Text.includes('gpt') || model1Text.includes('claude') || 
           model1Text.includes('gemini') || model1Text.includes('o3') ||
           model1Text.includes('llama') || model1Text.includes('mistral');
  }
  return false;
}

// Wrapper function to apply preferences only when needed
async function applyPreferencesIfNeeded() {
  // Check if we're on the right page (side-by-side or direct mode)
  const url = window.location.href;
  if (!url.includes('mode=side-by-side') && !url.includes('mode=direct')) {
    return;
  }
  
  // Skip the check for already selected models - always try to apply preferences
  // if (areModelsAlreadySelected()) {
  //   console.log('Models already selected, skipping auto-selection');
  //   return;
  // }
  
  // Check if we've already tried
  if (hasAppliedPreferences) {
    console.log('Already attempted to apply preferences');
    return;
  }
  
  hasAppliedPreferences = true;
  await applyPreferences();
}

// Run when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(applyPreferencesIfNeeded, 300);
  });
} else {
  setTimeout(applyPreferencesIfNeeded, 300);
}

// Also run when URL changes (for single-page app navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    hasAppliedPreferences = false; // Reset flag when URL changes
    if (url.includes('mode=side-by-side') || url.includes('mode=direct')) {
      setTimeout(applyPreferencesIfNeeded, 300);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Add a keyboard shortcut to manually trigger selection (for debugging)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'M') {
    console.log('Manual trigger activated');
    hasAppliedPreferences = false; // Reset flag for manual trigger
    applyPreferencesIfNeeded();
  }
});
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
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Additional wait for dialog to fully render
    const dialogAppeared = await waitForElement('[role="dialog"], [role="listbox"], .ant-select-dropdown', 2000).catch(() => null);
    if (dialogAppeared) {
      console.log('Dialog/dropdown appeared');
      await new Promise(resolve => setTimeout(resolve, 300));
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
      if (trimmedText && (
        trimmedText.toLowerCase() === modelName.toLowerCase() ||
        trimmedText.toLowerCase().includes(modelName.toLowerCase()) ||
        modelName.toLowerCase().includes(trimmedText.toLowerCase())
      )) {
        console.log(`Found matching option: "${trimmedText}"`);
        
        // Try multiple click methods to ensure selection
        clickElement(option);
        
        // Also try keyboard selection
        option.focus && option.focus();
        
        // Wait for selection to register
        await new Promise(resolve => setTimeout(resolve, 300));
        
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
        await new Promise(resolve => setTimeout(resolve, 500));
        
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

// Apply saved preferences
async function applyPreferences() {
  try {
    // Get saved preferences from storage
    const result = await browser.storage.local.get(['model1', 'model2']);
    
    if (!result.model1 && !result.model2) {
      console.log('No saved preferences found');
      return;
    }
    
    console.log('Saved preferences:', result);
    
    // Wait for the page to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Additional wait to ensure all elements are loaded
    await waitForElement('button[role="combobox"]').catch(() => {
      console.log('Timeout waiting for combobox buttons');
    });
    
    // Check if we're in side-by-side mode
    if (window.location.href.includes('mode=side-by-side')) {
      console.log('Side-by-side mode detected');
      
      // Try multiple selectors for model dropdowns
      const dropdownSelectors = [
        // Look specifically for the model selector container
        '[data-sentry-component="SideBySideSelector"] button[role="combobox"]',
        '[data-sentry-source-file="model-selector.tsx"] button[role="combobox"]',
        // Look for buttons with model icons
        'button:has(svg[viewBox="0 0 16 16"])',
        'button:has(svg[viewBox="0 0 24 24"])',
        // General selectors
        'button[role="combobox"]',
        'button[aria-haspopup="dialog"]',
        '.ant-select-selector',
        '[data-testid*="model"]',
        'div[role="combobox"]',
        'button[aria-haspopup="listbox"]'
      ];
      
      let dropdowns = [];
      for (const selector of dropdownSelectors) {
        try {
          dropdowns = document.querySelectorAll(selector);
          if (dropdowns.length >= 2) {
            console.log(`Found ${dropdowns.length} dropdowns with selector: ${selector}`);
            
            // Log what we found for debugging
            dropdowns.forEach((d, i) => {
              console.log(`  Dropdown ${i}: "${(d.textContent || '').trim().substring(0, 50)}..."`);
            });
            
            break;
          }
        } catch (e) {
          // Some selectors might not be supported
        }
      }
      
      // Convert NodeList to Array if necessary
      if (!Array.isArray(dropdowns)) {
        dropdowns = Array.from(dropdowns);
      }
      
      // If we still don't have dropdowns, try a more general approach
      if (dropdowns.length < 2) {
        // Look for buttons that might be model selectors
        const allButtons = document.querySelectorAll('button');
        dropdowns = Array.from(allButtons).filter(btn => {
          const text = btn.textContent || '';
          // Look for buttons that contain model names or are in the model selector area
          return (text.includes('gpt') || text.includes('claude') || 
                 text.includes('gemini') || text.includes('llama') ||
                 text.includes('mistral') || text.includes('o3') ||
                 text.includes('Select model')) && 
                 !text.includes('Battle') && !text.includes('Chat');
        });
        console.log(`Found ${dropdowns.length} potential model buttons`);
      }
      
      // Additional filter: make sure we're getting the model selector buttons, not mode selector
      if (dropdowns.length > 2) {
        // Filter out buttons that are clearly not model selectors
        dropdowns = dropdowns.filter(btn => {
          const text = btn.textContent || '';
          return !text.includes('Battle') && !text.includes('Direct Chat') && 
                 !text.includes('Side by Side');
        });
        console.log(`After filtering: ${dropdowns.length} model buttons`);
      }
      
      // If we have too many dropdowns, try to get only the model ones
      if (dropdowns.length > 2) {
        // Check if we can find the specific container
        const modelSelectorContainer = document.querySelector('[data-sentry-component="SideBySideSelector"]');
        if (modelSelectorContainer) {
          const containerButtons = modelSelectorContainer.querySelectorAll('button[role="combobox"]');
          if (containerButtons.length >= 2) {
            dropdowns = Array.from(containerButtons);
            console.log(`Found ${dropdowns.length} model dropdowns in SideBySideSelector`);
            
            // If we have 4 dropdowns, it might be 2 pairs (visible/hidden)
            // Try to filter to get unique ones based on their position or content
            if (dropdowns.length === 4) {
              // Get unique dropdowns based on text content
              const uniqueDropdowns = [];
              const seenTexts = new Set();
              
              for (const dropdown of dropdowns) {
                const text = (dropdown.textContent || '').trim();
                if (!seenTexts.has(text) && text !== '') {
                  uniqueDropdowns.push(dropdown);
                  seenTexts.add(text);
                }
              }
              
              if (uniqueDropdowns.length >= 2) {
                dropdowns = uniqueDropdowns;
                console.log(`Filtered to ${dropdowns.length} unique dropdowns`);
              } else {
                // If that didn't work, just take the first 2
                dropdowns = Array.from(containerButtons).slice(0, 2);
                console.log(`Using first 2 dropdowns`);
              }
            }
          }
        }
      }
      
      if (dropdowns.length >= 2) {
        console.log(`Using ${Math.min(2, dropdowns.length)} model dropdowns`);
        
        // Select first model
        if (result.model1) {
          console.log(`Setting model 1 to: ${result.model1}`);
          const success1 = await selectModel(dropdowns[0], result.model1);
          if (success1) {
            console.log('Model 1 selected successfully');
            // Verify the selection by checking button text
            await new Promise(resolve => setTimeout(resolve, 500));
            const newText1 = dropdowns[0].textContent || '';
            if (newText1.includes(result.model1)) {
              console.log('Model 1 selection verified');
            } else {
              console.log('Model 1 selection may not have been applied properly');
            }
          } else {
            console.log('Failed to select model 1');
          }
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // Select second model
        if (result.model2) {
          console.log(`Setting model 2 to: ${result.model2}`);
          const success2 = await selectModel(dropdowns[1], result.model2);
          if (success2) {
            console.log('Model 2 selected successfully');
            // Verify the selection by checking button text
            await new Promise(resolve => setTimeout(resolve, 500));
            const newText2 = dropdowns[1].textContent || '';
            if (newText2.includes(result.model2)) {
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
        console.log(`Could not find enough model selection dropdowns. Found: ${dropdowns.length}`);
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
  // Check if we're on the right page
  if (!window.location.href.includes('mode=side-by-side')) {
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
    setTimeout(applyPreferencesIfNeeded, 1000);
  });
} else {
  setTimeout(applyPreferencesIfNeeded, 1000);
}

// Also run when URL changes (for single-page app navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    hasAppliedPreferences = false; // Reset flag when URL changes
    if (url.includes('mode=side-by-side')) {
      setTimeout(applyPreferencesIfNeeded, 1000);
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
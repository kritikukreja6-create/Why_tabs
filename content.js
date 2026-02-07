// content.js - Injected into every webpage

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showIntentPrompt') {
    showIntentPrompt(message.tabInfo);
  }
});

// Function to show the intent prompt overlay
function showIntentPrompt(tabInfo) {
  // Check if prompt already exists (avoid duplicates)
  if (document.getElementById('why-tab-prompt')) {
    return;
  }
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'why-tab-prompt';
  overlay.innerHTML = `
    <div class="why-tab-overlay">
      <div class="why-tab-prompt-box">
        <div class="why-tab-header">
          <h2>🎯 Why did you open this tab?</h2>
          <button class="why-tab-close" id="why-tab-close">×</button>
        </div>
        
        <div class="why-tab-content">
          <p class="why-tab-subtitle">Help yourself stay focused by noting your intent</p>
          
          <div class="why-tab-options">
            <button class="why-tab-option" data-intent="Study">📚 Study</button>
            <button class="why-tab-option" data-intent="Work">💼 Work</button>
            <button class="why-tab-option" data-intent="Shopping">🛒 Shopping</button>
            <button class="why-tab-option" data-intent="Browsing">🌐 Browsing</button>
          </div>
          
          <div class="why-tab-custom">
            <label for="why-tab-custom-note">Or write a custom note:</label>
            <input 
              type="text" 
              id="why-tab-custom-note" 
              placeholder="e.g., Research for project, Looking for gift ideas..."
              maxlength="100"
            />
          </div>
          
          <div class="why-tab-actions">
            <button class="why-tab-skip" id="why-tab-skip">Skip</button>
            <button class="why-tab-save" id="why-tab-save">Save Intent</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .why-tab-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .why-tab-prompt-box {
      background: white;
      border-radius: 16px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      animation: why-tab-slide-in 0.3s ease-out;
    }
    
    @keyframes why-tab-slide-in {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .why-tab-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px 24px;
      border-radius: 16px 16px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .why-tab-header h2 {
      color: white;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
    
    .why-tab-close {
      background: none;
      border: none;
      color: white;
      font-size: 32px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }
    
    .why-tab-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .why-tab-content {
      padding: 24px;
    }
    
    .why-tab-subtitle {
      color: #718096;
      margin: 0 0 20px 0;
      font-size: 14px;
    }
    
    .why-tab-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .why-tab-option {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      padding: 14px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s;
      color: #2d3748;
    }
    
    .why-tab-option:hover {
      border-color: #667eea;
      background: #f0f4ff;
    }
    
    .why-tab-option.selected {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }
    
    .why-tab-custom {
      margin-bottom: 20px;
    }
    
    .why-tab-custom label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #4a5568;
      font-weight: 500;
    }
    
    .why-tab-custom input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    
    .why-tab-custom input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .why-tab-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    
    .why-tab-skip,
    .why-tab-save {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .why-tab-skip {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    .why-tab-skip:hover {
      background: #cbd5e0;
    }
    
    .why-tab-save {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .why-tab-save:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  `;
  
  overlay.appendChild(style);
  document.body.appendChild(overlay);
  
  // Handle preset option clicks
  let selectedIntent = '';
  const optionButtons = overlay.querySelectorAll('.why-tab-option');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove selected class from all
      optionButtons.forEach(b => b.classList.remove('selected'));
      // Add to clicked button
      btn.classList.add('selected');
      selectedIntent = btn.dataset.intent;
    });
  });
  
  // Handle save button
  document.getElementById('why-tab-save').addEventListener('click', () => {
    const customNote = document.getElementById('why-tab-custom-note').value.trim();
    
    // Use custom note if provided, otherwise use selected preset
    const finalIntent = customNote || selectedIntent || 'Browsing';
    
    // Send to background script to save
    chrome.runtime.sendMessage({
      action: 'saveTabIntent',
      data: {
        tabId: tabInfo.id,
        url: tabInfo.url,
        title: tabInfo.title,
        intent: selectedIntent,
        customNote: customNote
      }
    });
    
    // Remove the prompt
    overlay.remove();
  });
  
  // Handle skip/close buttons
  document.getElementById('why-tab-skip').addEventListener('click', () => {
    overlay.remove();
  });
  
  document.getElementById('why-tab-close').addEventListener('click', () => {
    overlay.remove();
  });
  
  // Close on overlay click (outside the box)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay.querySelector('.why-tab-overlay')) {
      overlay.remove();
    }
  });
}
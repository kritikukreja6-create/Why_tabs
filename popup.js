let currentTabInfo = null;
let selectedIntent = '';

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Why Tab popup loaded!');
  
  checkForPendingTab();
  
  // Setup intent option buttons
  const optionButtons = document.querySelectorAll('.intent-option');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      optionButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedIntent = btn.dataset.intent;
    });
  });
  
  // Save button
  document.getElementById('save-btn').addEventListener('click', saveIntent);
  
  // Skip button
  document.getElementById('skip-btn').addEventListener('click', skipIntent);
});

// Check if current tab is a pending new tab
function checkForPendingTab() {
  console.log('🔍 Checking for pending tab...');
  
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.log('❌ No active tab found');
      showTabList();
      return;
    }
    
    const tab = tabs[0];
    console.log('🔍 Current tab:', tab.id, tab.url);
    console.log('🔍 Looking for: pendingTab_' + tab.id);
    
    // Check if this tab has pending intent data
    chrome.storage.local.get([`pendingTab_${tab.id}`], (result) => {
      console.log('🔍 Storage lookup result:', result);
      
      const pendingTab = result[`pendingTab_${tab.id}`];
      
      if (pendingTab) {
        console.log('✅ FOUND pending tab! Showing prompt...');
        showIntentPrompt(pendingTab);
      } else {
        console.log('❌ No pending tab found for this tab ID');
        
        // DEBUG: Let's see ALL pending tabs
        chrome.storage.local.get(null, (allData) => {
          console.log('🔍 ALL STORAGE:', allData);
          const pendingKeys = Object.keys(allData).filter(key => key.startsWith('pendingTab_'));
          console.log('🔍 All pending tabs:', pendingKeys);
        });
        
        showTabList();
      }
    });
  });
}

// Show the intent prompt
function showIntentPrompt(pendingTab) {
  currentTabInfo = pendingTab;
  document.getElementById('intent-prompt').style.display = 'block';
  document.getElementById('tab-list').style.display = 'none';
}

// Show the tab list
function showTabList() {
  document.getElementById('intent-prompt').style.display = 'none';
  document.getElementById('tab-list').style.display = 'block';
  loadTabList();
}

// Save the intent
function saveIntent() {
  console.log('💾 Saving intent...');
  const customNote = document.getElementById('custom-note').value.trim();
  const finalIntent = customNote || selectedIntent || 'Browsing';
  
  console.log('Intent:', selectedIntent, 'Custom note:', customNote);
  
  chrome.runtime.sendMessage({
    action: 'saveTabIntent',
    data: {
      tabId: currentTabInfo.id,
      url: currentTabInfo.url,
      title: currentTabInfo.title,
      intent: selectedIntent,
      customNote: customNote,
      timestamp: currentTabInfo.timestamp
    }
  }, (response) => {
    console.log('✅ Save response:', response);
    if (response && response.success) {
      showTabList();
    }
  });
}


function skipIntent() {
  console.log('⏭️ Skipping intent...');
  chrome.runtime.sendMessage({
    action: 'skipTab',
    tabId: currentTabInfo.id
  }, () => {
    showTabList();
  });
}

// Load and display saved tabs
function loadTabList() {
  console.log('📋 Loading tab list...');
  chrome.storage.local.get(['tabs'], (result) => {
    const tabs = result.tabs || [];
    console.log('Tabs found:', tabs.length);
    const tabList = document.getElementById('tab-list');
    
    if (tabs.length === 0) {
      tabList.innerHTML = '<p class="empty-state">No tabs tracked yet!</p>';
    } else {
      tabList.innerHTML = `<p class="empty-state">You have ${tabs.length} tracked tab(s)!<br>Dashboard coming in Step 3!</p>`;
    }
  });
}
 
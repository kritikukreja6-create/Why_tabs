// background.js - Why Tab background service worker

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Why Tab installed successfully! 🎯');
  
  // Initialize storage with default settings
  chrome.storage.local.set({
    tabs: [],
    settings: {
      reminderTime: 6,
      cleanupDays: 3
    }
  });
});

// Track which tabs we've already processed
let processedTabs = new Set();

// Listen for tabs being updated (this catches when URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process when page has finished loading AND has a real URL
  if (changeInfo.status === 'complete' && tab.url) {
    
    // Skip chrome:// pages, extension pages, and already processed tabs
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url === 'about:blank' ||
        processedTabs.has(tabId)) {
      console.log('Skipping:', tab.url);
      return;
    }
    
    console.log('✅ New real page loaded:', tab.url);
    
    // Mark as processed
    processedTabs.add(tabId);
    
    // Show badge to remind user to set intent
    chrome.action.setBadgeText({ text: '!', tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId: tabId });
    
    // Store tab info temporarily
    chrome.storage.local.set({
      [`pendingTab_${tabId}`]: {
        id: tabId,
        url: tab.url,
        title: tab.title || 'Untitled',
        timestamp: Date.now()
      }
    }, () => {
      console.log('Pending tab stored:', tabId);
    });
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  processedTabs.delete(tabId);
  chrome.storage.local.remove(`pendingTab_${tabId}`);
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveTabIntent') {
    saveTabIntent(message.data);
    
    // Clear the badge
    chrome.action.setBadgeText({ text: '', tabId: message.data.tabId });
    
    sendResponse({ success: true });
  }
  
  if (message.action === 'getCurrentTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'skipTab') {
    // Clear the badge when user skips
    chrome.action.setBadgeText({ text: '', tabId: message.tabId });
    chrome.storage.local.remove(`pendingTab_${message.tabId}`);
    sendResponse({ success: true });
  }
});

// Function to save tab intent to storage
function saveTabIntent(data) {
  chrome.storage.local.get(['tabs'], (result) => {
    let tabs = result.tabs || [];
    
    const newTab = {
      id: data.tabId,
      url: data.url,
      title: data.title,
      intent: data.intent,
      customNote: data.customNote,
      timestamp: data.timestamp || Date.now(),
      status: 'pending'
    };
    
    tabs.push(newTab);
    
    chrome.storage.local.set({ tabs: tabs }, () => {
      console.log('✅ Tab intent saved:', newTab);
      
      // Remove pending tab data
      chrome.storage.local.remove(`pendingTab_${data.tabId}`);
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const status = document.getElementById('status');
    const saveBtn = document.getElementById('saveBtn');

    // Load saved key
    chrome.storage.sync.get(['openaiApiKey'], (result) => {
        if (result.openaiApiKey) {
            apiKeyInput.value = result.openaiApiKey;
        }
    });

    // Save key
    saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        chrome.storage.sync.set({ openaiApiKey: key }, () => {
            status.textContent = 'API key saved!';
            setTimeout(() => { status.textContent = ''; }, 1500);
        });
    });
});

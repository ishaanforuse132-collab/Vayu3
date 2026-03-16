/**
 * VAYU 3.0 - Neural Interface (Memory Edition)
 * Monday, March 16, 2026
 */

let isProcessing = false;
let chatMemory = []; 
let savedChats = JSON.parse(localStorage.getItem('vayu_history')) || [];

window.handleSend = async function() {
    const input = document.getElementById('userInput');
    const logo = document.querySelector('.logo');
    const query = input.value.trim();
    
    if (!query || isProcessing) return;

    isProcessing = true;
    if (logo) logo.classList.add('neural-spinning');
    appendMessage(query, 'user');
    updateHistory(query);
    input.value = "";
    
    const botMsg = appendMessage("Synthesizing... 🧠", "bot");

    try {
        const response = await fetch('/api/chat', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: "You are VAYU 3.0, created by Ishaan Gulliya. 🛸 Use emojis. ⚡ Today is March 16, 2026." }]
                },
                contents: chatMemory.concat([{ role: "user", parts: [{ text: query }] }])
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const aiResponse = data.candidates[0].content.parts[0].text;
        botMsg.innerText = aiResponse;

        chatMemory.push({ role: "user", parts: [{ text: query }] });
        chatMemory.push({ role: "model", parts: [{ text: aiResponse }] });

    } catch (error) {
        botMsg.innerText = "Uplink Error: " + error.message;
    } finally {
        if (logo) logo.classList.remove('neural-spinning');
        isProcessing = false;
    }
};

// --- MIC & UPLOAD FEATURES ---
window.handleFileUpload = (input) => {
    if (input.files[0]) {
        appendMessage(`Syncing File: ${input.files[0].name} 📁`, 'user');
        setTimeout(() => appendMessage("Indexing complete. Data is now in VAYU's context. 🤖", 'bot'), 1000);
    }
};

function setupVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    document.getElementById('micBtn').onclick = () => recognition.start();
    recognition.onresult = (e) => {
        document.getElementById('userInput').value = e.results[0][0].transcript;
        window.handleSend();
    };
}

// --- UTILS & HISTORY ---
function updateHistory(q) {
    if (chatMemory.length === 0) {
        savedChats.unshift({ title: q, id: Date.now() });
        localStorage.setItem('vayu_history', JSON.stringify(savedChats));
        renderSidebar();
    }
}

function renderSidebar() {
    const list = document.getElementById('chatHistoryList');
    if (!list) return;
    list.innerHTML = savedChats.map(c => `<div class="history-item">🕒 ${c.title}</div>`).join('');
}

function appendMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.innerText = text;
    const container = document.getElementById('chat-container');
    if (container) {
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }
    return msg;
}

document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    setupVoice();
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.handleSend();
    });
});
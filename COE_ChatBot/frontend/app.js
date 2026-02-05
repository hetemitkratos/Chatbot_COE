// Configuration
const API_BASE_URL = "/api";

// DOM Elements
const messagesContainer = document.getElementById("messagesContainer");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");
const clearChatBtn = document.getElementById("clearChat");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  // Focus input on load
  if (userInput) userInput.focus();
});

function setupEventListeners() {
  // Send message
  if (sendButton) {
    sendButton.addEventListener("click", sendMessage);
  }

  if (userInput) {
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize
    userInput.addEventListener("input", function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
  }

  // Clear chat
  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", clearChat);
  }

  // Event Delegation for Feature Cards (Welcome Screen)
  if (messagesContainer) {
    messagesContainer.addEventListener("click", (e) => {
      // Find closest feature-card or feature-item
      const featureItem = e.target.closest(".feature-item") || e.target.closest(".feature-card");
      
      if (featureItem) {
        const question = featureItem.dataset.question;
        if (question) {
          // Send the question directly
          sendMessage(question);
        }
      }
    });
  }
}

async function sendMessage(manualMessage = null) {
  const message = manualMessage || userInput.value.trim();

  if (!message || (isTyping && !manualMessage)) return;

  // Clear input if it was user typed
  if (!manualMessage && userInput) {
    userInput.value = "";
    userInput.style.height = 'auto';
  }

  // Hide Hero Welcome Screen if it exists (first message)
  const heroWelcome = document.querySelector(".hero-welcome");
  if (heroWelcome) {
    heroWelcome.style.display = "none";
  }

  // Add user message to chat
  addMessageToChat("user", message);

  // Show typing indicator
  showTypingIndicator();
  isTyping = true;

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    hideTypingIndicator();
    isTyping = false;

    if (response.ok) {
      addBotResponse(data);
    } else {
      addMessageToChat(
        "bot",
        data.error || "Sorry, something went wrong. Please try again."
      );
    }
  } catch (error) {
    hideTypingIndicator();
    isTyping = false;
    console.error("Error sending message:", error);
    addMessageToChat(
      "bot",
      "⚠️ Connection error. Please check if the backend server is running."
    );
  }
}

let isTyping = false;

function addMessageToChat(sender, content) {
  const messageWrapper = document.createElement("div");
  messageWrapper.className = `message-wrapper ${sender}-wrapper`;

  // Avatar
  const avatar = document.createElement("div");
  avatar.className = `message-avatar ${sender}-avatar`;
  
  if (sender === 'bot') {
    avatar.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
        </svg>
    `;
  } else {
    avatar.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    `;
  }

  // Content Bubble
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";

  const bubble = document.createElement("div");
  // CRITICAL FIX: Use 'message-bubble' to match CSS, not 'message-text'
  bubble.className = "message-bubble"; 
  bubble.innerHTML = formatText(content);

  messageContent.appendChild(bubble);
  messageWrapper.appendChild(avatar);
  messageWrapper.appendChild(messageContent);

  messagesContainer.appendChild(messageWrapper);
  scrollToBottom();
}

function addBotResponse(data) {
    const messageWrapper = document.createElement("div");
    messageWrapper.className = "message-wrapper bot-wrapper";

    // Bot Avatar
    const avatar = document.createElement("div");
    avatar.className = "message-avatar bot-avatar";
    avatar.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
        </svg>
    `;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    // Main Answer
    let htmlContent = `<p>${formatText(data.answer)}</p>`;

    // Steps
    if (data.steps && data.steps.length > 0) {
        htmlContent += `<div style="margin-top:10px;"><strong>📝 Steps:</strong><ol style="padding-left:20px; margin-top:5px;">`;
        data.steps.forEach(step => {
            htmlContent += `<li>${formatText(step)}</li>`;
        });
        htmlContent += `</ol></div>`;
    }

    // Important Notes
    if (data.important_notes && data.important_notes.length > 0) {
        htmlContent += `<div style="margin-top:10px; color:#ff0055;"><strong>⚠️ Important:</strong><ul style="padding-left:20px; margin-top:5px;">`;
        data.important_notes.forEach(note => {
            htmlContent += `<li>${formatText(note)}</li>`;
        });
        htmlContent += `</ul></div>`;
    }

    // Links
    if (data.related_links && data.related_links.length > 0) {
        htmlContent += `<div style="margin-top:10px;"><strong>🔗 Links:</strong><ul style="padding-left:20px; margin-top:5px;">`;
        data.related_links.forEach(link => {
            const url = typeof link === 'object' ? link.url : link;
            const text = typeof link === 'object' ? link.text : 'Click here';
            htmlContent += `<li><a href="${url}" target="_blank">${text}</a></li>`;
        });
        htmlContent += `</ul></div>`;
    }

    bubble.innerHTML = htmlContent;
    messageContent.appendChild(bubble);

    // Suggestions (Clickable Chips)
    if (data.suggestions && data.suggestions.length > 0) {
        const suggestionsContainer = document.createElement("div");
        suggestionsContainer.className = "suggestions-container";
        suggestionsContainer.style.marginTop = "10px";
        suggestionsContainer.style.display = "flex";
        suggestionsContainer.style.flexWrap = "wrap";
        suggestionsContainer.style.gap = "8px";

        data.suggestions.forEach(suggestion => {
            const chip = document.createElement("button");
            chip.className = "suggestion-chip";
            chip.textContent = suggestion;
            chip.onclick = () => sendMessage(suggestion);
            
            // Inline styles for chips (can be moved to CSS later)
            chip.style.padding = "8px 16px";
            chip.style.background = "rgba(255, 255, 255, 0.1)";
            chip.style.border = "1px solid rgba(255, 255, 255, 0.2)";
            chip.style.borderRadius = "20px";
            chip.style.color = "white";
            chip.style.cursor = "pointer";
            chip.style.fontSize = "0.9rem";
            chip.style.transition = "all 0.3s ease";
            
            chip.onmouseover = () => {
                chip.style.background = "rgba(0, 242, 234, 0.2)";
                chip.style.borderColor = "#00f2ea";
            };
            chip.onmouseout = () => {
                chip.style.background = "rgba(255, 255, 255, 0.1)";
                chip.style.borderColor = "rgba(255, 255, 255, 0.2)";
            };

            suggestionsContainer.appendChild(chip);
        });
        
        messageContent.appendChild(suggestionsContainer);
    }



    // Add contact info if available
    if (data.contact_info) {
        const contactInfo = document.createElement("div");
        contactInfo.className = "contact-info-container";
        contactInfo.style.marginTop = "15px";
        contactInfo.style.padding = "15px";
        contactInfo.style.background = "rgba(255, 255, 255, 0.05)";
        contactInfo.style.borderRadius = "12px";
        contactInfo.style.border = "1px solid rgba(255, 255, 255, 0.1)";

        // Phone Section
        const phoneHtml = `
            <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <strong style="display:block; font-size:0.85rem; color:rgba(255,255,255,0.7);">PHONE</strong>
                    <span style="font-size:1rem;">${data.contact_info.phone}</span>
                </div>
                <button onclick="copyToClipboard('${data.contact_info.phone}')" class="action-icon-btn" title="Copy Number" style="background:none; border:none; cursor:pointer; color:#00f2ea; padding:5px; transition: opacity 0.2s;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
        `;

        // Email Section (Gmail Link)
        const emailHtml = `
            <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <strong style="display:block; font-size:0.85rem; color:rgba(255,255,255,0.7);">EMAIL</strong>
                    <span style="font-size:1rem;">${data.contact_info.email}</span>
                </div>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${data.contact_info.email}" target="_blank" class="action-icon-btn" title="Draft on Gmail" style="text-decoration:none; color:#ff0055; padding:5px; display:flex; align-items:center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </a>
            </div>
        `;

        // Location & Office
        const detailsHtml = `
            <div style="font-size:0.9rem; color:rgba(255,255,255,0.8); margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <p style="margin:0 0 5px 0;"><strong>Office:</strong> ${data.contact_info.office}</p>
                <p style="margin:0;"><strong>Location:</strong> ${data.contact_info.location}</p>
            </div>
        `;

        contactInfo.innerHTML = phoneHtml + emailHtml + detailsHtml;
        messageContent.appendChild(contactInfo);
    }

    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(messageContent);
    messagesContainer.appendChild(messageWrapper);
    scrollToBottom();
}

function formatText(text) {
    if (!text) return "";
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\n/g, "<br>");
    return text;
}

function showTypingIndicator() {
  if (typingIndicator) {
      typingIndicator.style.display = "flex";
      scrollToBottom();
  }
}

function hideTypingIndicator() {
  if (typingIndicator) typingIndicator.style.display = "none";
}

function clearChat() {
  // Clear messages
  messagesContainer.innerHTML = "";
  
  // Restore Hero Welcome if we want (Lazy reload)
  location.reload(); 
}

function scrollToBottom() {
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

// Helper to copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification("Number copied! 📋", "success");
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) showNotification("Number copied! 📋", "success");
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
}

// Toast Notification
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">✨</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300); // Wait for transition
    }, 3000);
}

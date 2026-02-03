// Configuration
const API_BASE_URL = "/api";

// DOM Elements
const messagesContainer = document.getElementById("messagesContainer");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");
const clearChatBtn = document.getElementById("clearChat");
const helpBtn = document.getElementById("helpBtn");
const charCount = document.getElementById("charCount");
const quickActionsContainer = document.getElementById("quickActionsContainer");

// Modal Elements
const feedbackModal = document.getElementById("feedbackModal");
const helpModal = document.getElementById("helpModal");
const closeFeedbackModal = document.getElementById("closeFeedbackModal");
const closeHelpModal = document.getElementById("closeHelpModal");

// State
let currentConversationId = null;
let isTyping = false;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupEventListeners();
  updateWelcomeTime();
});

function initializeApp() {
  // Check backend health
  checkBackendHealth();

  // Auto-resize textarea
  userInput.addEventListener("input", () => {
    autoResizeTextarea();
    updateCharCount();
  });

  // Load conversation history from localStorage
  loadConversationHistory();
}

function setupEventListeners() {
  // Send message
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Quick action buttons
  document.querySelectorAll(".quick-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const question = btn.dataset.question;
      userInput.value = question;
      sendMessage();
    });
  });

  // Clear chat
  clearChatBtn.addEventListener("click", clearChat);

  // Help button
  helpBtn.addEventListener("click", () => {
    helpModal.style.display = "flex";
  });

  // Close modals
  closeHelpModal.addEventListener("click", () => {
    helpModal.style.display = "none";
  });

  closeFeedbackModal.addEventListener("click", () => {
    feedbackModal.style.display = "none";
  });

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = "none";
    }
    if (e.target === feedbackModal) {
      feedbackModal.style.display = "none";
    }
  });
}

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log("Backend is healthy");
    }
  } catch (error) {
    console.error("Backend health check failed:", error);
    showNotification(
      "Connection error. Please check if the backend is running.",
      "error",
    );
  }
}

async function sendMessage() {
  const message = userInput.value.trim();

  if (!message || isTyping) return;

  // Hide quick actions after first message
  if (quickActionsContainer) {
    quickActionsContainer.style.display = "none";
  }

  // Add user message to chat
  addMessageToChat("user", message);

  // Clear input
  userInput.value = "";
  autoResizeTextarea();
  updateCharCount();

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
      // Store conversation ID for feedback
      currentConversationId = data.conversation_id;

      // Add bot response
      addBotResponse(data);

      // Save to localStorage
      saveConversationToLocalStorage(message, data);
    } else {
      addMessageToChat(
        "bot",
        data.error || "Sorry, something went wrong. Please try again.",
      );
    }
  } catch (error) {
    hideTypingIndicator();
    isTyping = false;
    console.error("Error sending message:", error);
    addMessageToChat(
      "bot",
      "⚠️ Connection error. Please check if the backend server is running on port 5000.",
    );
  }
}

function addMessageToChat(sender, content) {
  const messageWrapper = document.createElement("div");
  messageWrapper.className = `message-wrapper ${sender}-wrapper`;

  if (sender === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar bot-avatar";
    avatar.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
        `;
    messageWrapper.appendChild(avatar);
  }

  const messageContent = document.createElement("div");
  messageContent.className = `message-content ${sender}-message`;

  const messageHeader = document.createElement("div");
  messageHeader.className = "message-header";
  messageHeader.innerHTML = `
        <strong>${sender === "bot" ? "COE Assistant" : "You"}</strong>
        <span class="message-time">${getCurrentTime()}</span>
    `;

  const messageText = document.createElement("div");
  messageText.className = "message-text";
  messageText.innerHTML = `<p>${escapeHtml(content)}</p>`;

  messageContent.appendChild(messageHeader);
  messageContent.appendChild(messageText);
  messageWrapper.appendChild(messageContent);

  messagesContainer.appendChild(messageWrapper);
  scrollToBottom();
}

function addBotResponse(data) {
  const messageWrapper = document.createElement("div");
  messageWrapper.className = "message-wrapper bot-wrapper";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar bot-avatar";
  avatar.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    `;
  messageWrapper.appendChild(avatar);

  const messageContent = document.createElement("div");
  messageContent.className = "message-content bot-message";

  const messageHeader = document.createElement("div");
  messageHeader.className = "message-header";
  messageHeader.innerHTML = `
        <strong>COE Assistant</strong>
        <span class="message-time">${getCurrentTime()}</span>
    `;

  const messageText = document.createElement("div");
  messageText.className = "message-text";

  // Main answer
  messageText.innerHTML = `<p>${formatText(data.answer)}</p>`;

  // Add steps if available
  if (data.steps && data.steps.length > 0) {
    const stepsList = document.createElement("div");
    stepsList.className = "steps-container";
    stepsList.innerHTML =
      "<strong>📝 Steps:</strong><ol>" +
      data.steps.map((step) => `<li>${formatText(step)}</li>`).join("") +
      "</ol>";
    messageText.appendChild(stepsList);
  }

  // Add important notes if available
  if (data.important_notes && data.important_notes.length > 0) {
    const notesList = document.createElement("div");
    notesList.className = "notes-container";
    notesList.innerHTML =
      "<strong>⚠️ Important Notes:</strong><ul>" +
      data.important_notes
        .map((note) => `<li>${formatText(note)}</li>`)
        .join("") +
      "</ul>";
    messageText.appendChild(notesList);
  }

  // Add additional info if available
  if (data.additional_info && data.additional_info.length > 0) {
    const infoList = document.createElement("div");
    infoList.className = "info-container";
    infoList.innerHTML =
      "<strong>ℹ️ Additional Information:</strong><ul>" +
      data.additional_info
        .map((info) => `<li>${formatText(info)}</li>`)
        .join("") +
      "</ul>";
    messageText.appendChild(infoList);
  }

  // Add related links if available
  if (data.related_links && data.related_links.length > 0) {
    const linksList = document.createElement("div");
    linksList.className = "links-container";
    linksList.innerHTML =
      "<strong>🔗 Related Links:</strong><ul>" +
      data.related_links
        .map((link) => {
          if (typeof link === "object") {
            return `<li><a href="${link.url}" target="_blank">${link.title}</a></li>`;
          }
          return `<li><a href="${link}" target="_blank">${link}</a></li>`;
        })
        .join("") +
      "</ul>";
    messageText.appendChild(linksList);
  }

  // Add suggestions if available
  if (data.suggestions && data.suggestions.length > 0) {
    const suggestionsList = document.createElement("div");
    suggestionsList.className = "suggestions-container";
    suggestionsList.innerHTML =
      "<strong>💡 I can help you with:</strong><ul>" +
      data.suggestions
        .map((suggestion) => `<li>${formatText(suggestion)}</li>`)
        .join("") +
      "</ul>";
    messageText.appendChild(suggestionsList);
  }

  // Add contact info if available
  if (data.contact_info) {
    const contactInfo = document.createElement("div");
    contactInfo.className = "contact-info-container";
    contactInfo.innerHTML = `
            <strong>📞 Contact Information:</strong>
            <p><strong>Office:</strong> ${data.contact_info.office}</p>
            <p><strong>Location:</strong> ${data.contact_info.location}</p>
            <p><strong>Phone:</strong> ${data.contact_info.phone}</p>
            <p><strong>Email:</strong> ${data.contact_info.email}</p>
        `;
    messageText.appendChild(contactInfo);
  }

  // Add confidence indicator if high confidence
  if (data.confidence && data.confidence > 70) {
    const confidence = document.createElement("div");
    confidence.className = "confidence-indicator";
    confidence.innerHTML = `<small>🎯 Confidence: ${data.confidence}%</small>`;
    messageText.appendChild(confidence);
  }

  // Add feedback buttons
  const feedbackButtons = document.createElement("div");
  feedbackButtons.className = "feedback-buttons";
  feedbackButtons.innerHTML = `
        <button class="feedback-btn thumbs-up" title="Helpful" data-rating="5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
        </button>
        <button class="feedback-btn thumbs-down" title="Not helpful" data-rating="1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
            </svg>
        </button>
    `;

  messageContent.appendChild(messageHeader);
  messageContent.appendChild(messageText);
  messageContent.appendChild(feedbackButtons);
  messageWrapper.appendChild(messageContent);

  messagesContainer.appendChild(messageWrapper);

  // Add feedback event listeners
  feedbackButtons.querySelectorAll(".feedback-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const rating = parseInt(btn.dataset.rating);
      submitFeedback(rating);
      btn.style.opacity = "0.5";
      btn.disabled = true;
    });
  });

  scrollToBottom();
}

async function submitFeedback(rating) {
  if (!currentConversationId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        conversation_id: currentConversationId,
        rating: rating,
        comments: "",
      }),
    });

    const data = await response.json();

    if (data.success) {
      showNotification("Thank you for your feedback!", "success");
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
  }
}

function showTypingIndicator() {
  typingIndicator.style.display = "flex";
  scrollToBottom();
}

function hideTypingIndicator() {
  typingIndicator.style.display = "none";
}

function clearChat() {
  if (confirm("Are you sure you want to clear the chat history?")) {
    // Keep only the welcome message and quick actions
    const welcomeMessage = messagesContainer.querySelector(".bot-wrapper");
    const quickActions = document.getElementById("quickActionsContainer");

    messagesContainer.innerHTML = "";
    if (welcomeMessage) {
      messagesContainer.appendChild(welcomeMessage.cloneNode(true));
    }
    if (quickActions) {
      messagesContainer.appendChild(quickActions);
      quickActions.style.display = "block";
    }

    // Clear localStorage
    localStorage.removeItem("chatHistory");

    showNotification("Chat cleared", "success");
  }
}

function autoResizeTextarea() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
}

function updateCharCount() {
  const count = userInput.value.length;
  charCount.textContent = count;

  if (count > 450) {
    charCount.style.color = "#dc2626";
  } else if (count > 400) {
    charCount.style.color = "#f59e0b";
  } else {
    charCount.style.color = "#6b7280";
  }
}

function scrollToBottom() {
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function updateWelcomeTime() {
  const welcomeTimeElement = document.getElementById("welcomeTime");
  if (welcomeTimeElement) {
    welcomeTimeElement.textContent = getCurrentTime();
  }
}

function formatText(text) {
  // Convert URLs to links
  text = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>',
  );

  // Convert bold text **text** to <strong>
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Convert line breaks
  text = text.replace(/\n/g, "<br>");

  return text;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function saveConversationToLocalStorage(userMessage, botResponse) {
  try {
    let history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    history.push({
      user: userMessage,
      bot: botResponse,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 conversations
    if (history.length > 50) {
      history = history.slice(-50);
    }

    localStorage.setItem("chatHistory", JSON.stringify(history));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

function loadConversationHistory() {
  try {
    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    // Don't auto-load history to keep UI clean
    // Users can reload if they want to see previous conversations
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
}

// Add CSS for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

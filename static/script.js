document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview');
    const removeImageButton = document.getElementById('remove-image');

    // Auto-resize textarea as user types
    userInput.addEventListener('input', () => {
        // Reset height to auto to get the right scrollHeight
        userInput.style.height = 'auto';
        // Set new height based on scrollHeight
        userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
    });

    // Setup quick action buttons
    document.querySelectorAll('button:not(#send-button, #remove-image)').forEach(button => {
        button.addEventListener('click', () => {
            const message = button.textContent.trim();
            userInput.value = message;
            // Trigger input event to resize textarea
            userInput.dispatchEvent(new Event('input'));
            sendMessage();
        });
    });

    // Handle send button click
    sendButton.addEventListener('click', sendMessage);

    // Handle Enter key press (Shift+Enter for new line)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Handle image upload
    imageUpload.addEventListener('change', handleImageUpload);
    removeImageButton.addEventListener('click', removeImage);

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    function removeImage() {
        imageUpload.value = '';
        imagePreview.classList.add('hidden');
        previewImage.src = '';
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        const imageFile = imageUpload.files[0];

        if (!message && !imageFile) return;

        // Store the message and clear input
        const messageToSend = message;
        userInput.value = '';
        // Reset textarea height
        userInput.style.height = '56px';

        // Add user message to chat immediately
        if (messageToSend) {
            const userMessageDiv = addMessage('user', messageToSend);
            // Scroll to the user's message
            userMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        if (imageFile) {
            addImageMessage(imageFile);
        }

        // Show loading state with animated dots
        const loadingMessage = addMessage('bot', '✨ Thinking...', true);
        const dots = ['', '.', '..', '...'];
        let dotIndex = 0;
        const loadingInterval = setInterval(() => {
            const loadingDiv = loadingMessage.querySelector('div div');
            if (loadingDiv) {
                loadingDiv.textContent = '✨ Thinking' + dots[dotIndex];
                dotIndex = (dotIndex + 1) % dots.length;
            }
        }, 500);

        try {
            let response;
        
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
        
                response = await fetch('/analyze_image', {
                    method: 'POST',
                    body: formData,
                });
        
                removeImage();
            } else {
                response = await fetch('/send_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: messageToSend }),
                });
            }
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const data = await response.json();
            clearInterval(loadingInterval);
            loadingMessage.remove();
        
            if (data.success) {
                // Update chat with the complete history
                if (data.chat_history) {
                    updateChatHistory(data.chat_history);
                } else {
                    // Fallback to just adding the bot response
                    const botMessageDiv = addMessage('bot', data.response);
                    botMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        
        } catch (error) {
            clearInterval(loadingInterval);
            if (loadingMessage) loadingMessage.remove();
        
            addMessage('bot', '💔 Sorry, I encountered an error. Please try again.', false, true);
            console.error('Error:', error);
        }        
    }

    function updateChatHistory(history) {
        // Clear existing messages except the initial greeting
        const chatMessages = document.getElementById('chat-messages');
        const initialGreeting = chatMessages.firstElementChild;
        chatMessages.innerHTML = '';
        chatMessages.appendChild(initialGreeting);

        // Add all messages from history
        history.forEach(message => {
            const messageDiv = addMessage(message.role, message.content);
        });

        // Scroll to the latest message
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    function addInitialGreeting() {
        const greetingDiv = document.createElement('div');
        greetingDiv.className = 'flex justify-start mb-4';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-end space-x-2';
        
        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 rounded-full bg-[#FFE8E8] flex items-center justify-center text-sm mb-1';
        avatar.innerHTML = '👗';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'bg-gray-100 rounded-3xl p-6 shadow-sm max-w-[80%]';
        messageBubble.innerHTML = `
            <p class="text-xl">Hello! I'm your virtual stylist.</p>
            <p class="text-xl mt-2">How can I assist you today?</p>
        `;
        
        wrapper.appendChild(avatar);
        wrapper.appendChild(messageBubble);
        greetingDiv.appendChild(wrapper);
        chatMessages.appendChild(greetingDiv);
    }

    function addImageMessage(file) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-end mb-4';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-end space-x-2 flex-row-reverse space-x-reverse';
        
        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 rounded-full bg-[#E6B8B7] flex items-center justify-center text-white text-sm mb-1';
        avatar.innerHTML = '👤';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'max-w-[80%] rounded-3xl p-2 bg-[#FDF7FA] border-2 border-[#E6B8B7]';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'max-h-60 rounded-2xl';
        img.alt = 'Uploaded outfit';
        
        messageBubble.appendChild(img);
        wrapper.appendChild(avatar);
        wrapper.appendChild(messageBubble);
        messageDiv.appendChild(wrapper);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(sender, text, isTemporary = false, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-[80%] rounded-3xl p-6 ${
            sender === 'user' 
                ? 'bg-[#FDF7FA] text-gray-800 font-medium text-lg border-2 border-[#E6B8B7]' 
                : isError 
                    ? 'bg-red-100' 
                    : 'bg-gray-100'
        } shadow-sm`;
        
        // Format the text with proper line breaks and styling
        let formattedText;
        if (sender === 'user') {
            // For user messages, display the text as is with minimal formatting
            formattedText = `<div class="whitespace-pre-wrap leading-relaxed">${text}</div>`;
        } else {
            // For bot messages, apply full formatting
            formattedText = text
                .split('\n')
                .map(line => {
                    if (line.trim().startsWith('•')) {
                        return `<div class="flex items-start mt-2">
                            <span class="mr-2">•</span>
                            <span>${line.substring(1).trim()}</span>
                        </div>`;
                    }
                    if (line.includes('**')) {
                        return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    }
                    return `<div class="mt-2">${line}</div>`;
                })
                .join('');
        }
        
        // Add avatar and message wrapper for better chat-like appearance
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-end space-x-2';
        
        if (sender === 'user') {
            wrapper.className += ' flex-row-reverse space-x-reverse';
            const avatar = document.createElement('div');
            avatar.className = 'w-8 h-8 rounded-full bg-[#E6B8B7] flex items-center justify-center text-white text-sm mb-1 shadow-sm';
            avatar.innerHTML = '👤';
            wrapper.appendChild(avatar);
        } else if (!isTemporary && !isError) {
            const avatar = document.createElement('div');
            avatar.className = 'w-8 h-8 rounded-full bg-[#FFE8E8] flex items-center justify-center text-sm mb-1 shadow-sm';
            avatar.innerHTML = '👗';
            wrapper.appendChild(avatar);
        }
        
        messageBubble.innerHTML = formattedText;
        wrapper.appendChild(messageBubble);
        messageDiv.appendChild(wrapper);
        
        if (isTemporary) {
            messageDiv.id = 'loading-message';
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }
}); 
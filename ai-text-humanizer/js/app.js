// App.js — UI logic for AI Text Humanizer
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('aiText');
    const humanizeBtn = document.getElementById('humanizeBtn');
    const outputSection = document.getElementById('outputSection');
    const output = document.getElementById('output');
    const copyBtn = document.getElementById('copyBtn');
    const showDiffBtn = document.getElementById('showDiffBtn');
    const diffSection = document.getElementById('diffSection');
    const diffList = document.getElementById('diffList');
    const styleBtns = document.querySelectorAll('.style-btn');
    
    let currentStyle = 'natural';
    let lastChanges = [];

    // Style selector
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
        });
    });

    // Humanize button
    humanizeBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        
        if (!text) {
            showNotification('Please paste some text first!', 'warning');
            textarea.focus();
            return;
        }

        if (text.length < 20) {
            showNotification('Text is too short. Please paste at least 20 characters.', 'warning');
            return;
        }

        // Loading state
        humanizeBtn.classList.add('loading');
        humanizeBtn.textContent = 'Humanizing...';

        // Simulate processing time for UX
        setTimeout(() => {
            const result = Humanizer.humanize(text, currentStyle);
            
            output.textContent = result.text;
            lastChanges = result.changes;
            
            // Show output
            outputSection.classList.remove('hidden');
            setTimeout(() => outputSection.classList.add('visible'), 10);
            
            // Reset button
            humanizeBtn.classList.remove('loading');
            humanizeBtn.textContent = '✨ Humanize My Text';
            
            // Reset diff
            diffSection.classList.add('hidden');
            
            // Scroll to output
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        const text = output.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.style.background = '#dcfce7';
            copyBtn.style.color = '#16a34a';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = text;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
            showNotification('Copied to clipboard!', 'success');
        });
    });

    // Show diff
    showDiffBtn.addEventListener('click', () => {
        if (diffSection.classList.contains('hidden')) {
            diffList.innerHTML = '';
            if (lastChanges.length === 0) {
                diffList.innerHTML = '<li>No significant changes made — text was already quite natural!</li>';
            } else {
                // Show unique changes (deduplicate)
                const uniqueChanges = [...new Set(lastChanges)].slice(0, 20);
                uniqueChanges.forEach(change => {
                    const li = document.createElement('li');
                    li.textContent = change;
                    diffList.appendChild(li);
                });
                if (lastChanges.length > 20) {
                    const li = document.createElement('li');
                    li.textContent = `...and ${lastChanges.length - 20} more changes`;
                    li.style.fontStyle = 'italic';
                    diffList.appendChild(li);
                }
            }
            diffSection.classList.remove('hidden');
            showDiffBtn.textContent = '🔍 Hide changes';
        } else {
            diffSection.classList.add('hidden');
            showDiffBtn.textContent = '🔍 Show what changed';
        }
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            humanizeBtn.click();
        }
    });

    // Notification helper
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        if (type === 'warning') {
            notification.style.background = '#f59e0b';
        }
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});

// Simple custom toast implementation
let toastContainer = null;

const createToastContainer = () => {
  if (toastContainer) return toastContainer;
  
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  document.body.appendChild(container);
  toastContainer = container;
  return container;
};

const showToast = (message, type = 'success') => {
  const container = createToastContainer();
  const toast = document.createElement('div');
  
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    info: '#2196f3'
  };
  
  toast.style.backgroundColor = colors[type];
  toast.style.color = 'white';
  toast.style.padding = '12px 20px';
  toast.style.margin = '10px';
  toast.style.borderRadius = '5px';
  toast.style.fontSize = '14px';
  toast.style.fontFamily = 'Arial, sans-serif';
  toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  toast.style.animation = 'slideIn 0.3s ease';
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Add animations if not already added
if (!document.querySelector('#toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
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
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info')
};

export default toast;
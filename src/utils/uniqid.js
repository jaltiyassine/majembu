export default function uniqid(prefix = '', moreEntropy = false) {
    const now = Date.now();
    const sec = Math.floor(now / 1000).toString(16);
    const usec = (now % 1000).toString(16).padStart(3, '0') + Math.floor(Math.random() * 1000).toString(16).padStart(3, '0');
    let id = prefix + sec + usec;
  
    if (moreEntropy) {
      id += (Math.random() * 10).toFixed(8).toString();
    }
  
    return id;
  }
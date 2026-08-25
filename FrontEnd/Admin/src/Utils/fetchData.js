const getBaseUrl = () => {
    let base = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5005/api/';
    if (!base.endsWith('/')) {
        base += '/';
    }
    return base;
};

const fetchData = async (url, option = {}) => {
    try {
        const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        const fullUrl = getBaseUrl() + cleanUrl;
        const res = await fetch(fullUrl, option);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, message: 'Connection Lost' };
    }
};

export default fetchData;
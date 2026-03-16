// api/chat.js - VAYU 3.0 Multi-Key Proxy
export default async function handler(req, res) {
    // 1. Get the keys from Vercel (stored as key1,key2,key3)
    const rawKeys = process.env.GEMINI_API_KEY;

    if (!rawKeys) {
        return res.status(500).json({ error: "No API keys found in Vercel Vault." });
    }

    // 2. Split the string into an array of individual keys
    const keyPool = rawKeys.split(',').map(k => k.trim());
    
    // 3. Pick a random key from the pool to balance the load
    const activeKey = keyPool[Math.floor(Math.random() * keyPool.length)];

    try {
        // 4. Forward the request to Google with the chosen key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${activeKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        // If this specific key is exhausted, tell the user
        if (data.error && data.error.status === "RESOURCE_EXHAUSTED") {
            return res.status(429).json({ 
                error: "This Neural Link is exhausted. Try sending again to switch keys! 🔄" 
            });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Vercel Proxy Error:", error);
        res.status(500).json({ error: "Neural Uplink Failed. 📡" });
    }
}
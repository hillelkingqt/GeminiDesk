const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const translations = require('../translations.js');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-3-flash-preview';

if (!OPENROUTER_API_KEY) {
    console.warn('WARNING: No OPENROUTER_API_KEY found in .env. Skipping automatic translation.');
    process.exit(0);
}

// Function to send a request to OpenRouter
async function translateBatch(sourceTexts, targetLang) {
    console.log(`Translating ${Object.keys(sourceTexts).length} entries to ${targetLang}...`);

    const targetLangName = targetLang === 'de' ? 'German' : targetLang;

    const prompt = `You are a professional translator for software interfaces. 
    Translate the values of the following JSON object from English to ${targetLangName}. 
    Keep the keys EXACTLY as they are. 
    Reply ONLY with the valid JSON object, no markdown, no explanatory text.
    
    JSON:
    ${JSON.stringify(sourceTexts, null, 2)}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // 'HTTP-Referer': 'https://github.com/hillelkingqt/GeminiDesk', // Optional
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that translates JSON content. Output ONLY valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Try to remove Markdown code blocks if present
        content = content.replace(/```json\n?|\n?```/g, '').trim();

        return JSON.parse(content);
    } catch (error) {
        console.error(`Error translating to ${targetLang}:`, error.message);
        return null;
    }
}

async function main() {
    const en = translations['en'];
    let hasChanges = false;

    // Iterate through all languages except English
    for (const lang of Object.keys(translations)) {
        if (lang === 'en') continue;

        const missingKeys = {};
        for (const key of Object.keys(en)) {
            if (!translations[lang].hasOwnProperty(key)) {
                missingKeys[key] = en[key];
            }
        }

        const missingCount = Object.keys(missingKeys).length;
        if (missingCount > 0) {
            console.log(`Language '${lang}': ${missingCount} missing translations found.`);

            // To avoid hitting limits, we could batch here.
            // We assume for now it fits in one request, otherwise we would need to chunk.
            // Simple chunking for batch size of approx. 50
            const keys = Object.keys(missingKeys);
            const CHUNK_SIZE = 50;

            for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
                const chunkKeys = keys.slice(i, i + CHUNK_SIZE);
                const chunkObj = {};
                chunkKeys.forEach(k => chunkObj[k] = missingKeys[k]);

                const translatedChunk = await translateBatch(chunkObj, lang);

                if (translatedChunk) {
                    // Merge new translations
                    translations[lang] = { ...translations[lang], ...translatedChunk };
                    hasChanges = true;
                } else {
                    console.error(`Could not translate chunk for ${lang}. Skipping.`);
                }
            }

        } else {
            // console.log(`Language '${lang}' is up to date.`);
        }
    }

    if (hasChanges) {
        console.log('Changes detected, saving translations.js ...');
        const filePath = path.join(__dirname, '..', 'translations.js');
        const fileContent = `const translations = ${JSON.stringify(translations, null, 4)};\n\nmodule.exports = translations;\n`;

        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log('translations.js successfully updated.');
    } else {
        console.log('No new translations required.');
    }
}

main().catch(console.error);

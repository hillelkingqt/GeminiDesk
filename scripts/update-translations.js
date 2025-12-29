const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const translations = require('../translations.js');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-3-flash-preview';

if (!OPENROUTER_API_KEY) {
    console.warn('WARNUNG: Kein OPENROUTER_API_KEY in .env gefunden. Überspringe automatische Übersetzung.');
    process.exit(0);
}

// Funktion zum Senden einer Anfrage an OpenRouter
async function translateBatch(sourceTexts, targetLang) {
    console.log(`Übersetze ${Object.keys(sourceTexts).length} Einträge nach ${targetLang}...`);

    const prompt = `Du bist ein professioneller Übersetzer für Software-Interfaces. 
    Übersetze die Werte des folgenden JSON-Objekts vom Englischen ins ${targetLang === 'de' ? 'Deutsche' : targetLang}. 
    Behalte die Schlüssel EXAKT bei. 
    Antworte NUR mit dem validen JSON-Objekt, kein Markdown, kein erklärender Text.
    
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
            throw new Error(`API Fehler: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Versuchen, Markdown-Codeblöcke zu entfernen, falls vorhanden
        content = content.replace(/```json\n?|\n?```/g, '').trim();

        return JSON.parse(content);
    } catch (error) {
        console.error(`Fehler bei der Übersetzung nach ${targetLang}:`, error.message);
        return null;
    }
}

async function main() {
    const en = translations['en'];
    let hasChanges = false;

    // Alle Sprachen außer Englisch durchgehen
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
            console.log(`Sprache '${lang}': ${missingCount} fehlende Übersetzungen gefunden.`);

            // Um Limits nicht zu sprengen, könnte man hier batchen.
            // Wir nehmen erstmal an, dass es in einen Request passt, ansonsten müssten wir chunken.
            // Einfaches Chunking für Batch-Größe von ca. 50
            const keys = Object.keys(missingKeys);
            const CHUNK_SIZE = 50;

            for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
                const chunkKeys = keys.slice(i, i + CHUNK_SIZE);
                const chunkObj = {};
                chunkKeys.forEach(k => chunkObj[k] = missingKeys[k]);

                const translatedChunk = await translateBatch(chunkObj, lang);

                if (translatedChunk) {
                    // Mischen der neuen Übersetzungen
                    translations[lang] = { ...translations[lang], ...translatedChunk };
                    hasChanges = true;
                } else {
                    console.error(`Konnte Chunk für ${lang} nicht übersetzen. Überspringe.`);
                }
            }

        } else {
            // console.log(`Sprache '${lang}' ist aktuell.`);
        }
    }

    if (hasChanges) {
        console.log('Änderungen erkannt, speichere translations.js ...');
        const filePath = path.join(__dirname, '..', 'translations.js');
        const fileContent = `const translations = ${JSON.stringify(translations, null, 4)};\n\nmodule.exports = translations;\n`;

        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log('translations.js erfolgreich aktualisiert.');
    } else {
        console.log('Keine neuen Übersetzungen erforderlich.');
    }
}

main().catch(console.error);

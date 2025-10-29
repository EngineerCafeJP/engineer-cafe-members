// To run this script:
// 1. Install dependencies: npm install @google/genai typescript ts-node dotenv
// 2. Add your Gemini API key to a .env file: API_KEY="YOUR_API_KEY"
// 3. Run: npx ts-node --require dotenv/config scripts/translate-members.ts

import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs/promises';
import * as path from 'path';
// FIX: Import the 'process' module to provide types for process.cwd() and process.env,
// which resolves type errors when Node.js global types are not automatically recognized.
import * as process from 'process';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY not found in environment variables. Please create a .env file.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Sanitize translated hashtags while keeping '#'
function sanitizeTags(tags: string[] | undefined, targetLang: 'Japanese' | 'English'): string[] | undefined {
  if (!tags) return tags;
  const toCamel = (s: string) => s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => {
      if (/^[A-Z0-9]{2,}$/.test(w)) return w; // keep acronyms like AI, STEAM
      // TitleCase
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join('');
  return tags.map(raw => {
    const str = String(raw).trim();
    const body = str.replace(/^#+/, '');
    if (targetLang === 'English') {
      const noTrail = body.replace(/_+$/g, '').trim();
        // Build base output preserving existing CamelCase when no separators
        let out: string;
        if (!/[^A-Za-z0-9]/.test(noTrail)) {
          out = '#' + noTrail;
        } else {
          const camel = toCamel(noTrail);
          out = '#' + camel;
        }
  // Heuristic fixes for common acronyms/words
  out = out.replace(/^#Iot/, '#IoT');
  out = out.replace(/^#IoT([a-z])/, (_m, c: string) => '#IoT' + c.toUpperCase());
  out = out.replace(/^#Steam([A-Z])/, '#STEAM$1');
  out = out.replace(/^#Steam([a-z])/, (_m, c: string) => '#STEAM' + c.toUpperCase());
        out = out.replace(/^#STEAM([a-z])/, (_m, c: string) => '#STEAM' + c.toUpperCase());
  out = out.replace(/^#Studygroup/, '#StudyGroup');
  return out;
    }
    // Japanese: just ensure single # and trim trailing underscores/spaces
    return '#' + body.replace(/\s+/g, '').replace(/_+$/g, '');
  });
}

interface MemberData {
  id: number;
  avatarUrl: string;
  name: { ja: string; en: string };
  role: { ja: string; en: string };
  bio: { ja: string; en: string };
    tags?: { ja: string[]; en: string[] };
}

const membersFilePath = path.join(process.cwd(), 'data', 'members.json');

const translationSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    role: { type: Type.STRING },
    bio: { type: Type.STRING },
    tags: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
  },
  required: ['name', 'role', 'bio'],
};

async function translateText(
  textToTranslate: { name: string; role: string; bio: string; tags?: string[] },
  sourceLang: 'Japanese' | 'English',
  targetLang: 'Japanese' | 'English'
): Promise<{ name: string; role: string; bio: string; tags?: string[] } | null> {
  const prompt = `
    Translate the following JSON object's string values from ${sourceLang} to ${targetLang}.
    Preserve the markdown formatting (like \`code\`, **bold**, lists, etc.) in the 'bio' field.
    For hashtags in the 'tags' array, keep the '#' symbol and translate only the text after it.
    Output tags without spaces. For English, format tags in CamelCase (e.g., #AIDrivenDevelopment) with no trailing underscores.
    Only return a valid JSON object with the translated values. Do not add any other text or explanations.

    Input (${sourceLang}):
    ${JSON.stringify(textToTranslate, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: translationSchema,
      },
    });
    
    const translatedText = response.text;
    if (translatedText) {
      return JSON.parse(translatedText);
    }
    return null;
  } catch (error) {
    console.error(`Error translating from ${sourceLang} to ${targetLang}:`, error);
    return null;
  }
}

async function main() {
  console.log('Starting translation script...');
  
  try {
    const fileContent = await fs.readFile(membersFilePath, 'utf-8');
    const members: MemberData[] = JSON.parse(fileContent);

    let changesMade = false;

  for (const member of members) {
      const needsEnTranslation = member.name.ja && (!member.name.en || member.name.en.trim() === '');
      const needsJaTranslation = member.name.en && (!member.name.ja || member.name.ja.trim() === '');
    const needsEnTagsTranslation = member.tags?.ja && member.tags.ja.length > 0 && (!member.tags.en || member.tags.en.length === 0);
    const needsJaTagsTranslation = member.tags?.en && member.tags.en.length > 0 && (!member.tags.ja || member.tags.ja.length === 0);

    if (needsEnTranslation || needsEnTagsTranslation) {
        console.log(`Translating member ID ${member.id} (${member.name.ja}) to English...`);
        const translated = await translateText(
            { name: member.name.ja, role: member.role.ja, bio: member.bio.ja, tags: member.tags?.ja },
          'Japanese',
          'English'
        );
        if (translated) {
            if (needsEnTranslation) {
              member.name.en = translated.name;
              member.role.en = translated.role;
              member.bio.en = translated.bio;
            }
          if (translated.tags) {
              if (!member.tags) {
                member.tags = { ja: member.tags?.ja || [], en: [] };
              }
              member.tags.en = sanitizeTags(translated.tags, 'English') || [];
          }
          changesMade = true;
          console.log(` -> Success.`);
        } else {
          console.log(` -> Failed.`);
        }
    } else if (needsJaTranslation || needsJaTagsTranslation) {
        console.log(`Translating member ID ${member.id} (${member.name.en}) to Japanese...`);
        const translated = await translateText(
            { name: member.name.en, role: member.role.en, bio: member.bio.en, tags: member.tags?.en },
          'English',
          'Japanese'
        );
        if (translated) {
            if (needsJaTranslation) {
              member.name.ja = translated.name;
              member.role.ja = translated.role;
              member.bio.ja = translated.bio;
            }
          if (translated.tags) {
              if (!member.tags) {
                member.tags = { ja: [], en: member.tags?.en || [] };
              }
              member.tags.ja = sanitizeTags(translated.tags, 'Japanese') || [];
          }
          changesMade = true;
          console.log(` -> Success.`);
        } else {
          console.log(` -> Failed.`);
        }
      }
    }

    // Post-process: sanitize existing tags even if no translation was needed
    for (const member of members) {
      if (member.tags?.en) {
        const sanitized = sanitizeTags(member.tags.en, 'English') || [];
        if (JSON.stringify(sanitized) !== JSON.stringify(member.tags.en)) {
          member.tags.en = sanitized;
          changesMade = true;
        }
      }
      if (member.tags?.ja) {
        const sanitizedJa = sanitizeTags(member.tags.ja, 'Japanese') || [];
        if (JSON.stringify(sanitizedJa) !== JSON.stringify(member.tags.ja)) {
          member.tags.ja = sanitizedJa;
          changesMade = true;
        }
      }
    }

    if (changesMade) {
      await fs.writeFile(membersFilePath, JSON.stringify(members, null, 2));
      console.log('Successfully updated members.json with new translations.');
    } else {
      console.log('No new translations needed. File is up to date.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

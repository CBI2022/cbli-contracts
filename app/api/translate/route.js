import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { conditions, languages } = await request.json();

    if (!conditions?.trim() || !languages?.length) {
      return NextResponse.json({ translation: '' });
    }

    const LANGS = {
      en: 'English', nl: 'Nederlands', fr: 'Français', de: 'Deutsch', ru: 'Русский'
    };
    const langNames = languages.map(c => LANGS[c] || c).join(', ');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a legal translator specializing in Spanish real estate law. Translate the following clause into: ${langNames}. Use proper legal terminology. Label each translation by language.\n\n${conditions}`
        }]
      })
    });

    const data = await res.json();
    const translation = data.content?.map(b => b.text || '').join('') || '';

    return NextResponse.json({ translation });
  } catch (e) {
    console.error('Translation API error:', e);
    return NextResponse.json({ translation: '[Translation unavailable]' });
  }
}

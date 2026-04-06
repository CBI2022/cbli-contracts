import { NextResponse } from 'next/server';
import { generateContract } from '@/lib/contract-generator';

export async function POST(request) {
  try {
    const formData = await request.json();

    // Rewrite special conditions as legal clause + translate if needed
    let rewrittenConditions = formData.conditions?.trim() || '';
    let translatedConditions = {};
    if (rewrittenConditions) {
      try {
        const hasLanguages = formData.languages?.length > 0;
        const langNames = hasLanguages ? formData.languages.join(', ') : '';
        const translateInstruction = hasLanguages
          ? `\n\nThen translate the rewritten Spanish legal clause into these languages: ${langNames}. Use proper legal terminology for property purchase contracts.\n\nReturn a JSON object with key "es" for the rewritten Spanish clause${hasLanguages ? `, and keys for each language code (${langNames}) with the translations` : ''}. Return ONLY the JSON, no explanation.`
          : `\n\nReturn a JSON object with key "es" containing the rewritten Spanish clause. Return ONLY the JSON, no explanation.`;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            messages: [{
              role: 'user',
              content: `You are a legal expert specializing in Spanish real estate law and property purchase contracts. The following text was written by a real estate agent as special conditions for a property purchase contract. Rewrite it as a proper, formal legal clause in Spanish, using appropriate legal terminology, structure, and phrasing suitable for a binding property purchase agreement (contrato de arras or contrato de reserva). Keep the same meaning and intent but make it sound professional and legally precise.${translateInstruction}\n\nAgent's text:\n${rewrittenConditions}`
            }]
          })
        });
        const data = await res.json();
        const text = data.content?.map(b => b.text || '').join('') || '{}';
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          if (parsed.es) rewrittenConditions = parsed.es;
          if (hasLanguages) {
            formData.languages.forEach(lang => {
              if (parsed[lang]) translatedConditions[lang] = parsed[lang];
            });
          }
        } catch (e2) {
          // If parsing fails, use original text
          if (hasLanguages) {
            formData.languages.forEach(lang => {
              translatedConditions[lang] = text;
            });
          }
        }
      } catch (e) {
        console.error('Legal rewrite/translation error:', e);
      }
    }

    // Generate the PDF
    const buffer = await generateContract({ ...formData, conditions: rewrittenConditions, translatedConditions });

    // Return as downloadable file
    const buyerName = formData.buyer?.name?.replace(/\s+/g, '_') || 'contract';
    const type = formData.type === 'arras' ? 'Arras' : 'Reserva';
    const filename = `${type}_${buyerName}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Contract generation error:', error);
    return NextResponse.json({ error: 'Failed to generate contract' }, { status: 500 });
  }
}

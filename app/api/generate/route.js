import { NextResponse } from 'next/server';
import { generateContract } from '@/lib/contract-generator';
import { generateContractDocx } from '@/lib/contract-generator-docx';
import { Resend } from 'resend';

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

    const contractData = { ...formData, conditions: rewrittenConditions, translatedConditions };
    const buyerName = formData.buyer?.name?.replace(/\s+/g, '_') || 'contract';
    const type = formData.type === 'arras' ? 'Arras' : 'Reserva';
    const dateStr = new Date().toISOString().split('T')[0];

    // Generate both PDF and Word
    const pdfBuffer = await generateContract(contractData);
    const docxBuffer = await generateContractDocx(contractData);

    const pdfFilename = `${type}_${buyerName}_${dateStr}.pdf`;
    const docxFilename = `${type}_${buyerName}_${dateStr}.docx`;

    // Send email with both attachments
    const resend = new Resend(process.env.RESEND_API_KEY);

    const propertyInfo = formData.property?.address || 'N/A';
    const priceInfo = formData.price?.total ? Number(formData.price.total).toLocaleString('es-ES') + ' EUR' : 'N/A';
    const sellerName = formData.seller?.name || 'N/A';
    const contractType = type === 'Arras' ? 'Contrato de Arras' : 'Contrato de Reserva';
    const langs = formData.languages?.length > 0 ? 'ES + ' + formData.languages.map(l => l.toUpperCase()).join(', ') : 'ES only';

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'CBLI Contracts <contracts@costablancainvestments.com>',
      to: ['legal@costablancainvestments.com'],
      subject: `New ${contractType} - ${formData.buyer?.name || 'Buyer'} - ${propertyInfo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; padding: 20px; text-align: center;">
            <h1 style="color: #C8956C; margin: 0; font-size: 20px;">COSTA BLANCA LUXURY INVESTMENTS</h1>
            <p style="color: #fff; margin: 4px 0 0; font-size: 12px;">Contract Generation System</p>
          </div>
          <div style="padding: 24px; background: #f9f8f6;">
            <h2 style="color: #1A3A5C; margin-top: 0;">New Contract for Review</h2>
            <p style="color: #333; line-height: 1.6;">A new contract has been generated and requires your review. Both PDF and Word versions are attached.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C; width: 140px;">Contract Type</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${contractType}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Buyer</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.buyer?.name || 'N/A'}${formData.buyer?.hasPartner && formData.buyer?.partner?.name ? ' y ' + formData.buyer.partner.name : ''}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Seller</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${sellerName}${formData.seller?.hasPartner && formData.seller?.partner?.name ? ' y ' + formData.seller.partner.name : ''}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Property</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.property?.type || ''} - ${propertyInfo}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Ref.</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.property?.ref || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Price</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${priceInfo}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Languages</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${langs}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Date</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.date || dateStr}, ${formData.city || 'Altea'}</td></tr>
            </table>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">Please review the attached contract documents and confirm when ready for signing.</p>
          </div>
          <div style="background: #1A3A5C; padding: 16px; text-align: center;">
            <p style="color: #C8956C; margin: 0; font-size: 12px;">Generated by CBLI Contract System - cbidocs.com</p>
          </div>
        </div>
      `,
      attachments: [
        { filename: pdfFilename, content: pdfBuffer.toString('base64') },
        { filename: docxFilename, content: Buffer.from(docxBuffer).toString('base64') },
      ],
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json({ error: 'Failed to send email: ' + emailError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Contract sent to legal@costablancainvestments.com`,
      emailId: emailData?.id
    });
  } catch (error) {
    console.error('Contract generation error:', error);
    return NextResponse.json({ error: 'Failed to generate contract: ' + error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { generateContractDocx } from '@/lib/contract-generator-docx';
import { generateFicha } from '@/lib/ficha-generator';
import { Resend } from 'resend';

// Allow longer execution for file processing
export const maxDuration = 30;

export async function POST(request) {
  try {
    let formData;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads for ficha
      const fd = await request.formData();
      formData = JSON.parse(fd.get('formData') || '{}');
      const files = fd.getAll('files');
      formData.fichaFiles = files;
    } else {
      formData = await request.json();
    }

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

    const resend = new Resend(process.env.RESEND_API_KEY);
    const dateStr = new Date().toISOString().split('T')[0];

    if (formData.type === 'ficha') {
      // Handle Ficha Producto
      const pdfBuffer = await generateFicha(formData);
      const agentName = formData.agentName?.trim() || 'Unknown Agent';
      const address = formData.ficha?.address || 'N/A';
      const fichaFilename = `Ficha_${address.replace(/\s+/g, '_')}_${dateStr}.pdf`;

      // Build attachments array with uploaded files
      const attachments = [
        { filename: fichaFilename, content: Buffer.from(pdfBuffer).toString('base64') },
      ];

      // Add user-uploaded files if they exist
      if (formData.fichaFiles && Array.isArray(formData.fichaFiles)) {
        for (const fileObj of formData.fichaFiles) {
          if (fileObj instanceof File) {
            const buffer = Buffer.from(await fileObj.arrayBuffer());
            attachments.push({
              filename: fileObj.name,
              content: buffer.toString('base64'),
            });
          }
        }
      }

      const agentEmail = formData.ficha?.agentEmailName
        ? formData.ficha.agentEmailName + '@costablancainvestments.com'
        : 'info@costablancainvestments.com';

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'CBLI Contracts <contracts@costablancainvestments.com>',
        to: [agentEmail],
        subject: `New Property Listing - ${address} - by ${agentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #000; padding: 20px; text-align: center;">
              <h1 style="color: #C8956C; margin: 0; font-size: 20px;">COSTA BLANCA LUXURY INVESTMENTS</h1>
              <p style="color: #fff; margin: 4px 0 0; font-size: 12px;">Property Listing System</p>
            </div>
            <div style="padding: 24px; background: #f9f8f6;">
              <h2 style="color: #1A3A5C; margin-top: 0;">New Property Listing</h2>
              <p style="color: #333; line-height: 1.6;">A new property listing has been submitted for upload to portals.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C; width: 140px;">Agent</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${agentName}</td></tr>
                <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Property</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.ficha?.propertyType || 'N/A'} - ${address}</td></tr>
                <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">City</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.ficha?.city || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Price</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.ficha?.price ? Number(formData.ficha.price).toLocaleString('es-ES') + ' EUR' : 'N/A'}</td></tr>
                <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Date</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.date || dateStr}</td></tr>
              </table>
              <p style="color: #666; font-size: 13px; line-height: 1.5;">The Ficha PDF and all supporting documents are attached.</p>
            </div>
            <div style="background: #1A3A5C; padding: 16px; text-align: center;">
              <p style="color: #C8956C; margin: 0; font-size: 12px;">Generated by CBLI Listing System - cbidocs.com</p>
            </div>
          </div>
        `,
        attachments,
      });

      if (emailError) {
        console.error('Email send error:', emailError);
        return NextResponse.json({ error: 'Failed to send email: ' + emailError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Ficha sent to ${agentEmail}`,
        emailId: emailData?.id
      });
    }

    // Handle regular contracts (arras, reservation, commission)
    const contractData = { ...formData, conditions: rewrittenConditions, translatedConditions };
    const buyerName = formData.buyer?.name?.replace(/\s+/g, '_') || 'contract';
    let type, contractTypeName;
    if (formData.type === 'arras') {
      type = 'Arras';
      contractTypeName = 'Contrato de Arras';
    } else if (formData.type === 'commission') {
      type = 'Honorarios';
      contractTypeName = 'Reconocimiento de Honorarios';
    } else {
      type = 'Reserva';
      contractTypeName = 'Contrato de Reserva';
    }

    // Generate Word document only
    const docxBuffer = await generateContractDocx(contractData);
    const docxFilename = `${type}_${buyerName}_${dateStr}.docx`;

    const agentName = formData.agentName?.trim() || 'Unknown Agent';
    const propertyInfo = formData.property?.address || 'N/A';
    const priceInfo = formData.price?.total ? Number(formData.price.total).toLocaleString('es-ES') + ' EUR' : 'N/A';
    const sellerName = formData.seller?.name || 'N/A';
    const langs = formData.languages?.length > 0 ? 'ES + ' + formData.languages.map(l => l.toUpperCase()).join(', ') : 'ES only';

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'CBLI Contracts <contracts@costablancainvestments.com>',
      to: ['legal@costablancainvestments.com'],
      subject: `New ${contractTypeName} - ${formData.buyer?.name || 'Buyer'} - by ${agentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; padding: 20px; text-align: center;">
            <h1 style="color: #C8956C; margin: 0; font-size: 20px;">COSTA BLANCA LUXURY INVESTMENTS</h1>
            <p style="color: #fff; margin: 4px 0 0; font-size: 12px;">Contract Generation System</p>
          </div>
          <div style="padding: 24px; background: #f9f8f6;">
            <h2 style="color: #1A3A5C; margin-top: 0;">New Contract for Review</h2>
            <p style="color: #333; line-height: 1.6;">A new contract has been generated and requires your review. The Word document is attached.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C; width: 140px;">Agent</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold;">${agentName}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C; width: 140px;">Contract Type</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${contractTypeName}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Buyer</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.buyer?.name || 'N/A'}${formData.buyer?.hasPartner && formData.buyer?.partner?.name ? ' y ' + formData.buyer.partner.name : ''}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Seller</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${sellerName}${formData.seller?.hasPartner && formData.seller?.partner?.name ? ' y ' + formData.seller.partner.name : ''}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Property</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.property?.type || ''} - ${propertyInfo}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Ref.</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.property?.ref || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Price</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${priceInfo}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Languages</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${langs}</td></tr>
              <tr><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5; font-weight: bold; color: #1A3A5C;">Date</td><td style="padding: 8px 12px; background: #fff; border: 1px solid #e0dcd5;">${formData.date || dateStr}, ${formData.city || 'Altea'}</td></tr>
            </table>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">Please review the attached contract document and confirm when ready for signing.</p>
          </div>
          <div style="background: #1A3A5C; padding: 16px; text-align: center;">
            <p style="color: #C8956C; margin: 0; font-size: 12px;">Generated by CBLI Contract System - cbidocs.com</p>
          </div>
        </div>
      `,
      attachments: [
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

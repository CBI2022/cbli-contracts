import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header, AlignmentType, PageBreak, BorderStyle, WidthType, VerticalAlign, ShadingType } from 'docx';
import fs from 'fs';
import path from 'path';

// ============ BRAND COLORS ============
const BRAND = {
  black: '000000',
  gold: 'C9A84C',
  white: 'FFFFFF',
  darkGray: '333333',
};

// ============ HELPER FUNCTIONS ============
function numberToSpanishWords(n) {
  if (!n || isNaN(n)) return "";
  n = Math.floor(Number(n));
  if (n === 0) return "CERO";
  const units = ["","UN","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE"];
  const teens = ["DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE"];
  const tens = ["","DIEZ","VEINTE","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
  const hundreds = ["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"];
  function below1000(x) {
    if (x === 0) return "";
    if (x === 100) return "CIEN";
    let r = "";
    if (x >= 100) { r += hundreds[Math.floor(x/100)] + " "; x %= 100; }
    if (x >= 20) { const t = Math.floor(x/10), u = x%10; if (t===2&&u>0) r += "VEINTI"+units[u]; else { r += tens[t]; if (u>0) r += " Y "+units[u]; } }
    else if (x >= 10) r += teens[x-10];
    else if (x > 0) r += units[x];
    return r.trim();
  }
  if (n >= 1000000) { const m = Math.floor(n/1000000), rest = n%1000000; let r = m===1 ? "UN MILLÓN" : below1000(m)+" MILLONES"; if (rest>0) r += " "+numberToSpanishWords(rest); return r; }
  if (n >= 1000) { const t = Math.floor(n/1000), rest = n%1000; let r = t===1 ? "MIL" : below1000(t)+" MIL"; if (rest>0) r += " "+below1000(rest); return r; }
  return below1000(n);
}

function numberToEnglishWords(n) {
  if (!n || isNaN(n)) return "";
  n = Math.floor(Number(n));
  if (n === 0) return "ZERO";
  const units = ["","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE"];
  const teens = ["TEN","ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN","SIXTEEN","SEVENTEEN","EIGHTEEN","NINETEEN"];
  const tens = ["","TEN","TWENTY","THIRTY","FORTY","FIFTY","SIXTY","SEVENTY","EIGHTY","NINETY"];
  function below1000(x) {
    if (x === 0) return "";
    let r = "";
    if (x >= 100) { r += units[Math.floor(x/100)] + " HUNDRED "; x %= 100; }
    if (x >= 20) { const t = Math.floor(x/10), u = x%10; r += tens[t]; if (u > 0) r += "-" + units[u]; }
    else if (x >= 10) r += teens[x-10];
    else if (x > 0) r += units[x];
    return r.trim();
  }
  if (n >= 1000000) { const m = Math.floor(n/1000000), rest = n%1000000; let r = below1000(m) + " MILLION"; if (rest > 0) r += " " + numberToEnglishWords(rest); return r; }
  if (n >= 1000) { const t = Math.floor(n/1000), rest = n%1000; let r = below1000(t) + " THOUSAND"; if (rest > 0) r += " " + below1000(rest); return r; }
  return below1000(n);
}

function numberToDutchWords(n) {
  if (!n || isNaN(n)) return "";
  n = Math.floor(Number(n));
  if (n === 0) return "NUL";
  const units = ["","EEN","TWEE","DRIE","VIER","VIJF","ZES","ZEVEN","ACHT","NEGEN"];
  const teens = ["TIEN","ELF","TWAALF","DERTIEN","VEERTIEN","VIJFTIEN","ZESTIEN","ZEVENTIEN","ACHTTIEN","NEGENTIEN"];
  const tens = ["","TIEN","TWINTIG","DERTIG","VEERTIG","VIJFTIG","ZESTIG","ZEVENTIG","TACHTIG","NEGENTIG"];
  function below1000(x) {
    if (x === 0) return "";
    let r = "";
    if (x >= 100) { r += (x >= 200 ? units[Math.floor(x/100)] : "") + "HONDERD"; x %= 100; }
    if (x >= 20) { const t = Math.floor(x/10), u = x%10; if (u > 0) r += units[u] + "EN"; r += tens[t]; }
    else if (x >= 10) r += teens[x-10];
    else if (x > 0) r += units[x];
    return r.trim();
  }
  if (n >= 1000000) { const m = Math.floor(n/1000000), rest = n%1000000; let r = (m === 1 ? "EEN" : below1000(m)) + " MILJOEN"; if (rest > 0) r += " " + numberToDutchWords(rest); return r; }
  if (n >= 1000) { const t = Math.floor(n/1000), rest = n%1000; let r = (t === 1 ? "" : below1000(t)) + "DUIZEND"; if (rest > 0) r += " " + below1000(rest); return r; }
  return below1000(n);
}

function numberToFrenchWords(n) {
  if (!n || isNaN(n)) return "";
  n = Math.floor(Number(n));
  if (n === 0) return "ZERO";
  const units = ["","UN","DEUX","TROIS","QUATRE","CINQ","SIX","SEPT","HUIT","NEUF"];
  const teens = ["DIX","ONZE","DOUZE","TREIZE","QUATORZE","QUINZE","SEIZE","DIX-SEPT","DIX-HUIT","DIX-NEUF"];
  const tens = ["","DIX","VINGT","TRENTE","QUARANTE","CINQUANTE","SOIXANTE","SOIXANTE","QUATRE-VINGT","QUATRE-VINGT"];
  function below1000(x) {
    if (x === 0) return "";
    let r = "";
    if (x >= 100) { r += (x >= 200 ? units[Math.floor(x/100)] + " " : "") + "CENT"; if (x % 100 === 0 && x >= 200) r += "S"; x %= 100; if (x > 0) r += " "; }
    if (x >= 70 && x < 80) { r += "SOIXANTE-" + teens[x-70]; x = 0; }
    else if (x >= 90) { r += "QUATRE-VINGT-" + teens[x-90]; x = 0; }
    else if (x >= 80 && x < 90) { if (x === 80) r += "QUATRE-VINGTS"; else r += "QUATRE-VINGT-" + units[x-80]; x = 0; }
    else if (x >= 20) { const t = Math.floor(x/10), u = x%10; r += tens[t]; if (u === 1) r += " ET UN"; else if (u > 0) r += "-" + units[u]; x = 0; }
    else if (x >= 10) { r += teens[x-10]; x = 0; }
    else if (x > 0) r += units[x];
    return r.trim();
  }
  if (n >= 1000000) { const m = Math.floor(n/1000000), rest = n%1000000; let r = (m === 1 ? "UN" : below1000(m)) + " MILLION"; if (m > 1) r += "S"; if (rest > 0) r += " " + numberToFrenchWords(rest); return r; }
  if (n >= 1000) { const t = Math.floor(n/1000), rest = n%1000; let r = (t === 1 ? "" : below1000(t) + " ") + "MILLE"; if (rest > 0) r += " " + below1000(rest); return r; }
  return below1000(n);
}

function numberToGermanWords(n) {
  if (!n || isNaN(n)) return "";
  n = Math.floor(Number(n));
  if (n === 0) return "NULL";
  const units = ["","EINS","ZWEI","DREI","VIER","FÜNF","SECHS","SIEBEN","ACHT","NEUN"];
  const teens = ["ZEHN","ELF","ZWÖLF","DREIZEHN","VIERZEHN","FÜNFZEHN","SECHZEHN","SIEBZEHN","ACHTZEHN","NEUNZEHN"];
  const tens = ["","ZEHN","ZWANZIG","DREISSIG","VIERZIG","FÜNFZIG","SECHZIG","SIEBZIG","ACHTZIG","NEUNZIG"];
  function below1000(x) {
    if (x === 0) return "";
    let r = "";
    if (x >= 100) { r += (x >= 200 ? units[Math.floor(x/100)].replace('EINS','EIN') : "EIN") + "HUNDERT"; x %= 100; }
    if (x >= 20) { const t = Math.floor(x/10), u = x%10; if (u > 0) r += (u === 1 ? "EIN" : units[u]) + "UND"; r += tens[t]; }
    else if (x >= 10) r += teens[x-10];
    else if (x > 0) r += (x === 1 ? "EIN" : units[x]);
    return r.trim();
  }
  if (n >= 1000000) { const m = Math.floor(n/1000000), rest = n%1000000; let r = (m === 1 ? "EINE" : below1000(m)) + " MILLION"; if (m > 1) r += "EN"; if (rest > 0) r += " " + numberToGermanWords(rest); return r; }
  if (n >= 1000) { const t = Math.floor(n/1000), rest = n%1000; let r = (t === 1 ? "EIN" : below1000(t)) + "TAUSEND"; if (rest > 0) r += " " + below1000(rest); return r; }
  return below1000(n);
}

function numberToRussianWords(n) {
  if (!n || isNaN(n)) return "";
  n = Math.floor(Number(n));
  if (n === 0) return "NOL";
  const units = ["","ODIN","DVA","TRI","CHETYRE","PYAT","SHEST","SEM","VOSEM","DEVYAT"];
  const teens = ["DESYAT","ODINNADTSAT","DVENADTSAT","TRINADTSAT","CHETYRNADTSAT","PYATNADTSAT","SHESTNADTSAT","SEMNADTSAT","VOSEMNADTSAT","DEVYATNADTSAT"];
  const tens = ["","DESYAT","DVADTSAT","TRIDTSAT","SOROK","PYATDESYAT","SHESTDESYAT","SEMDESYAT","VOSEMDESYAT","DEVYANOSTO"];
  const hundreds = ["","STO","DVESTI","TRISTA","CHETYRESTA","PYATSOT","SHESTSOT","SEMSOT","VOSEMSOT","DEVYATSOT"];
  function below1000(x) {
    if (x === 0) return "";
    let r = "";
    if (x >= 100) { r += hundreds[Math.floor(x/100)] + " "; x %= 100; }
    if (x >= 20) { const t = Math.floor(x/10), u = x%10; r += tens[t]; if (u > 0) r += " " + units[u]; }
    else if (x >= 10) r += teens[x-10];
    else if (x > 0) r += units[x];
    return r.trim();
  }
  if (n >= 1000000) { const m = Math.floor(n/1000000), rest = n%1000000; let r = below1000(m) + " MILLION"; if (rest > 0) r += " " + numberToRussianWords(rest); return r; }
  if (n >= 1000) { const t = Math.floor(n/1000), rest = n%1000; let r = below1000(t) + " TYSYACH"; if (rest > 0) r += " " + below1000(rest); return r; }
  return below1000(n);
}

function numberToWords(n, lang) {
  if (lang === 'en') return numberToEnglishWords(n);
  if (lang === 'nl') return numberToDutchWords(n);
  if (lang === 'fr') return numberToFrenchWords(n);
  if (lang === 'de') return numberToGermanWords(n);
  if (lang === 'ru') return numberToRussianWords(n);
  return numberToSpanishWords(n);
}

// ============ TRANSLATIONS ============
const translations = {
  es: {
    arras_title: "CONTRATO DE ARRAS",
    reservation_title: "CONTRATO DE RESERVA",
    reunidos: "REUNIDOS",
    on_one_part: "De una parte",
    of_legal_age: "mayor de edad",
    of_nationality: "de nacionalidad",
    with_valid: "con",
    number: "número",
    and_nie: "y NIE número",
    with_address: "con domicilio a efectos de notificaciones en",
    hereinafter: "en adelante",
    the_buyer: "EL COMPRADOR",
    the_seller: "EL VENDEDOR",
    and_other_part: "Y de otra parte",
    and_partner: "y",
    both_parties_intro: "Ambas partes intervienen en su propio nombre y derecho, reconociéndose mutuamente capacidad suficiente para otorgar el presente contrato, y",
    declare: "EXPONEN",
    declare_1: "Que la parte vendedora es propietaria y está interesada en la venta del siguiente inmueble:",
    type_of_property: "TIPO DE INMUEBLE",
    located_in: "sito en",
    registered_in: "inscrito en el Registro de la Propiedad de",
    property_nr: "con finca nr.",
    volume: "Tomo",
    book: "Libro",
    folio: "folio",
    cadastral_ref: "con referencia catastral número",
    declare_2: "Que la parte compradora está interesada en la adquisición del inmueble descrito en el expositivo I.",
    declare_3: "Ambas partes en su propio interés, regulan el presente contrato mediante las siguientes,",
    clauses: "CLÁUSULAS",
    first_arras: "se compromete a vender a",
    who_agrees: "quien(es) se compromete(n) a comprar, las fincas descritas en el expositivo I, ya conocidas por la parte compradora, en el estado físico, técnico, constructivo, urbanístico y jurídico que declara conocer y aceptar, libre de hipotecas, cargas, gravámenes, arrendatarios u ocupantes y con todos los derechos y usos, así como con todos los recibos e impuestos correspondientes pagados al día.",
    second_price: "El precio de la finca objeto de la compraventa convenido por ambas partes es de",
    plus_taxes: "MAS LOS CORRESPONDIENTES IMPUESTOS.",
    furniture_included: "La finca se transmitirá dotada de los muebles y electrodomésticos presentes en la propiedad.",
    furniture_not_included: "Los muebles no están incluidos en la venta.",
    furniture_partial: "Muebles incluidos según lista de inventario separada.",
    amounts_paid: "Las citadas cantidades se harán efectivas en la forma, plazos y condiciones siguientes:",
    reservation_paid: "ha sido abonada en concepto de reserva a la parte intermediaria COSTA BLANCA LUXURY INVESTMENTS SL en fecha",
    through_transfer: "mediante transferencia bancaria.",
    arras_to_pay: "a abonar en concepto de arras a la parte VENDEDORA mediante transferencia bancaria.",
    account: "Cuenta",
    bank: "Banco",
    beneficiary: "Beneficiario",
    concept_arras: "Concepto: Arras",
    transfer_effective: "Dicha transferencia habrá de hacerse efectiva en la referida cuenta dentro del día",
    or_before: "o antes, cobrando plena eficacia el presente documento.",
    arras_penitenciales: "Las referidas cantidades tienen el concepto de arras penitenciales según el artículo 1.454 del vigente código civil. Si el comprador incumpliera cualquiera de las cláusulas pactadas en el presente documento, no compareciere en el acto de la firma de escritura pública o no pagara el precio pactado, la venta quedará resuelta y la señal perdida en favor del vendedor. Si fuera este último el que incumpliera cualquiera de las cláusulas previstas en el presente documento, o no compareciera al otorgamiento de la escritura pública en los términos pactados, el comprador podrá optar por resolver la compra, con obligación del vendedor de pagar el importe doble de la señal.",
    remaining_payment: "a pagar mediante transferencia bancaria a la cuenta bancaria de la parte vendedora",
    concept_purchase: "Concepto: Compraventa",
    at_signing: "a la firma de la escritura pública de compraventa ante el Notario de",
    on_or_before: "que tendrá lugar el mismo día o antes del",
    third_clause: "El vendedor se compromete a no ceder, gravar o arrendar la finca, objeto del presente contrato a un tercero, hasta el vencimiento del plazo citado anteriormente, para el pago del precio y la consiguiente formalización y elevación a escritura pública.",
    fourth_clause: "La parte compradora hará frente al pago del impuesto de transmisiones patrimoniales, actos jurídicos documentados e importes notariales y registrales que se deriven del otorgamiento de la presente escritura. La parte vendedora abonará el Impuesto Municipal sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (Plusvalía) si se devengara.",
    fifth_clause_1: "La entrega de la posesión de la finca a la compradora, tendrá lugar en el acto de la firma de la escritura ante notario.",
    fifth_clause_2: "Serán a cargo y por cuenta de la compradora desde la entrega de posesión de las fincas, todos los gastos, y tributos que se devenguen inherentes a la propiedad de las fincas, tales como luz, agua, etc.",
    fifth_clause_3: "Todos los gastos, y tributos que se hayan devengado inherentes a la propiedad, con anterioridad a la entrega de posesión, serán por cuenta de la vendedora.",
    fifth_clause_4: "La parte vendedora expresamente manifiesta que todos los servicios de la vivienda (electricidad, agua, gas etc), funcionan correctamente y se obliga a su mantenimiento y pago hasta la entrega de la posesión de la propiedad.",
    fifth_clause_5: "El IBI y la basura correspondiente al año en curso serán pagados proporcionalmente por ambas partes.",
    sixth_clause: "Las partes, con renuncia a cualquier otro fuero que pudiera corresponderles, se someten expresamente a la jurisdicción y competencia de los Juzgados y Tribunales de Benidorm, para solventar cualquier litigio, discrepancia, cuestión o reclamación resultantes de la ejecución o interpretación del presente Contrato.",
    seventh_clause: "En caso de discrepancia en la interpretación del contenido del presente, prevalecerá lo establecido en lengua española.",
    closing: "Y, en prueba de conformidad, ambas partes firman el presente documento, en lugar y fecha indicados en el encabezamiento.",
    seller_label: "VENDEDOR",
    buyer_label: "COMPRADOR",
    res_all_parties: "Todas las partes intervienen en su propio nombre y derecho, acordando en este acto firmar este contrato de reserva respecto al inmueble que se identifica a continuación.",
    res_owners: "son propietarios de la totalidad del inmueble que se detalla a continuación:",
    res_capacity: "Las partes se reconocen mutuamente en la posición en la que respectivamente actúan con la capacidad jurídica necesaria para vincularse a este contrato.",
    res_price_clause: "El precio de venta del inmueble es de",
    res_furniture_not: "sin mobiliario incluido",
    res_excl_taxes: "(impuestos no incluidos).",
    res_buyers_shall: "Los Compradores abonarán dicha cantidad a los Vendedores en el momento de la firma de la escritura pública de compraventa, deduciendo de dicha cantidad los pagos previamente realizados según se detalla a continuación:",
    res_non_refundable: "que se abonará como RESERVA NO REEMBOLSABLE a la firma del presente Acuerdo, se ingresará a nombre de COSTA BLANCA LUXURY INVESTMENTS SL en la cuenta que se indica a continuación, y dicha suma permanecerá en depósito de la citada empresa hasta la firma del contrato de arras por ambas partes, momento en el cual se transferirá a la cuenta del vendedor:",
    res_concept: "Concepto: Reserva Ref.",
    res_arras_commit: "Ambas partes se comprometen a firmar un contrato de arras dentro de",
    res_calendar_days: "días naturales desde la fecha de firma del presente documento por ambas partes, con entrega dentro de",
    res_working_days: "días hábiles después de la firma de dicho documento, de",
    res_to_seller: "a la parte vendedora",
    res_as_arras: "en concepto de arras penitenciales, que se considerarán parte del pago por el inmueble. El resto del precio se abonará en el momento de la firma de la escritura pública y entrega de posesión.",
    res_max_date: "En el citado contrato de arras, la fecha máxima para la firma de la escritura, la entrega de posesión y el pago total del precio acordado se fijará como",
    res_transfer_free: "El inmueble se transmitirá libre de cargas, arrendamientos, ocupantes y gravámenes urbanísticos. El inmueble se entregará al corriente de pago de impuestos, tasas y gastos asociados, siendo los Vendedores los propietarios registrales en pleno dominio, sin limitaciones ni restricciones para su transmisión.",
    res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL actúa en esta operación únicamente como intermediario inmobiliario y depositario del importe de reserva y no será responsable del estado jurídico, urbanístico o técnico del inmueble, cuya verificación corresponde a las partes.",
    res_seller_fault: "En el supuesto de que la compraventa no pueda formalizarse exclusivamente por causas imputables al Vendedor, tales como la existencia de irregularidades legales que afecten al inmueble o la imposibilidad de obtener la documentación legalmente exigida necesaria para otorgar la escritura pública de compraventa ante Notario, el Comprador tendrá derecho a desistir de la operación sin penalización ni obligación económica alguna.",
    res_seller_refund: "En tal caso, el Vendedor estará obligado a devolver íntegramente al Comprador todas las cantidades entregadas hasta ese momento a cuenta del precio de compra.",
    res_withdraw_market: "Una vez firmado este contrato por ambas partes, el vendedor estará obligado a retirar el inmueble del mercado y a notificarlo a cualquier otro Agente Inmobiliario que tuviera el encargo de venderlo, procediendo en su caso a eliminar, publicitar o intervenir en su mediación, con la retirada inmediata de cualquier cartel publicitario de venta, tanto propios como de otros Agentes.",
    res_sole_purpose: "Las partes acuerdan que el presente Acuerdo tiene como único objeto reservar el inmueble y retirarlo temporalmente del mercado y no constituye un contrato privado de compraventa ni un depósito penitencial, que en su caso se regulará en el posterior contrato de arras.",
    res_spanish_prevails: "En caso de discrepancia en la interpretación del presente contrato, prevalecerá la versión en español.",
    res_closing: "Y, en prueba de conformidad, ambas partes firman el presente documento, en el lugar y en la fecha indicados en el encabezamiento del documento.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "PRIMERA", clause_2: "SEGUNDA", clause_3: "TERCERA", clause_4: "CUARTA",
    clause_5: "QUINTA", clause_6: "SEXTA", clause_7: "SÉPTIMA", clause_8: "OCTAVA",
    clause_9: "NOVENA", clause_10: "DÉCIMA",
  },
  en: {
    arras_title: "DEPOSIT CONTRACT (ARRAS)",
    reservation_title: "RESERVATION AGREEMENT",
    reunidos: "GATHERED",
    on_one_part: "On the one part",
    of_legal_age: "of legal age",
    of_nationality: "of nationality",
    with_valid: "with valid",
    number: "number",
    and_nie: "and NIE number",
    with_address: "with address for notification purposes at",
    hereinafter: "hereinafter",
    the_buyer: "THE BUYER",
    the_seller: "THE SELLER",
    and_other_part: "And of the other part",
    and_partner: "and",
    both_parties_intro: "Both parties involved in their own name and right, recognizing with sufficient capacity to award this contract, and,",
    declare: "DECLARE",
    declare_1: "That the selling party is owner and is interested in the selling of the following property:",
    type_of_property: "TYPE OF PROPERTY",
    located_in: "located in",
    registered_in: "registered in the Property Registry of",
    property_nr: "with property nr.",
    volume: "Volume",
    book: "Book",
    folio: "folio",
    cadastral_ref: "with cadastral reference number",
    declare_2: "That the buying party is interested in the acquisition of the property described in declaration I.",
    declare_3: "Both sides in their own interest, regulate the present agreement by using the following,",
    clauses: "CLAUSES",
    first_arras: "agrees to sell to",
    who_agrees: "who agrees to purchase, the property described in declaration I, already known by the buying party, in the physical, technical, constructive, urbanistic and juridical state that they declare to know and accept, free of mortgages, charges, liens, tenants, or occupants and with all rights and uses, as well as all receipts and corresponding taxes paid up to date.",
    second_price: "The price of the property object of sale agreed by both parties is",
    plus_taxes: "PLUS THE CORRESPONDING TAXES.",
    furniture_included: "The property will be transmitted with the furniture and appliances present in the property.",
    furniture_not_included: "Furniture is not included in the sale.",
    furniture_partial: "Furniture included as per separate inventory list.",
    amounts_paid: "These amounts will be paid in the form, terms and conditions as follows:",
    reservation_paid: "was paid as a reservation deposit to the intermediary party COSTA BLANCA LUXURY INVESTMENTS SL on",
    through_transfer: "through bank transfer.",
    arras_to_pay: "to be paid as arras deposit to the SELLER party through bank transfer.",
    account: "Account",
    bank: "Bank",
    beneficiary: "Beneficiary",
    concept_arras: "Concept: Arras Deposit",
    transfer_effective: "Such transfer shall be made effective on the referred account on",
    or_before: "or before, becoming fully effective in the present document.",
    arras_penitenciales: "The aforementioned amounts have the concept of arras penitenciales, according to article 1.454 of the Spanish civil code. If the buyer breaches any clause of the contract, does not appear at the act of signing the public deed or does not pay the agreed price, the sale will be resolved and the deposit paid lost in favor of the seller. If the seller breaches any clause of the contract or does not appear at the granting of the public deed in the agreed terms, the buyer may choose to resolve the purchase, with the seller's obligation to pay double the amount of the deposit.",
    remaining_payment: "through bank transfer to the account of the selling party",
    concept_purchase: "Concept: Purchase",
    at_signing: "to be paid at the signing of the public deed of sale before the Notary of",
    on_or_before: "on or before",
    third_clause: "The seller agrees not to assign, encumber, or lease the property object of the present contract to a third party, until the expiry of the period referred to above, for the payment of the price and the subsequent formalization and conversion into public deed.",
    fourth_clause: "The buying party will pay the cost of the property transfer tax, stamp duty tax, notarial and land registry fees derived from the granting of this deed. The selling party will pay the Capital Gain Tax (Plusvalia) if applicable.",
    fifth_clause_1: "The delivery of the possession of the property to the buyer will take place at the act of signing the deed before a notary.",
    fifth_clause_2: "The purchasing party shall pay from the date of the handing over of the possession of the properties, all the expenses (electricity, water etc.), taxes that accrue inherent in the ownership of the properties.",
    fifth_clause_3: "All expenses, taxes that have accrued inherent in the ownership of the property prior to the handing over possession of the property shall be paid by the selling party.",
    fifth_clause_4: "The selling party expressly states that all housing services (electricity, water, gas, etc.) work correctly and are obliged to maintain and pay until the delivery of possession of the property.",
    fifth_clause_5: "The IBI and the garbage for the current year will be paid by both parties proportionally.",
    sixth_clause: "The parties expressly waive their own codes of law and expressly agree to submit any litigation, discrepancy, issue or claim resulting from the performance or interpretation of this contract to the jurisdiction and authority of the Judges and Courts of Benidorm.",
    seventh_clause: "In case of disagreement or discrepancy between the parties over the interpretation of the present contract, the Spanish language or version will prevail over the translated version.",
    closing: "And in proof of compliance with the above, both parties sign this document or by e-mail, to a single effect, in the place and date indicated above.",
    seller_label: "SELLER",
    buyer_label: "BUYER",
    res_all_parties: "All the parties intervene in their own name and right, agreeing in this act to sign this reservation agreement with respect to the property that is identified below.",
    res_owners: "are owners of the entirety of the property detailed below:",
    res_capacity: "The parties acknowledge each other in the position that they are respectively herein acting with the necessary legal capacity to bind themselves to this contract agreement.",
    res_price_clause: "The sale price of the property is",
    res_furniture_not: "furniture not included",
    res_excl_taxes: "(excluding taxes).",
    res_buyers_shall: "The Buyers shall pay said amount to the Sellers at the time of execution of the public deed of sale, deducting from such amount any payments previously made as detailed below:",
    res_non_refundable: "which shall be paid as a NON-REFUNDABLE RESERVATION FEE upon the signing of this Agreement, shall be paid into the name of COSTA BLANCA LUXURY INVESTMENTS SL in the account indicated below, and said sum shall remain in the deposit of the aforementioned company until the signing of the deposit contract by both parties, at which time it shall be transferred to the seller's account:",
    res_concept: "Concept: Reservation Ref.",
    res_arras_commit: "Both parties commit to signing a deposit contract within",
    res_calendar_days: "calendar days from the date of signing of this document by both parties, with delivery within",
    res_working_days: "working days after the signing of said document, of",
    res_to_seller: "to the selling party",
    res_as_arras: "as arras penitenciales, which shall be considered part of the payment for the property. The remainder of the price shall be paid at the time of the execution of the public deed and handover of possession.",
    res_max_date: "In the aforementioned deposit contract, the maximum date for signing the deed, handing over possession and full payment of the agreed price shall be set as",
    res_transfer_free: "The property shall be transferred free of charges, leases, occupants and urban planning encumbrances. The property shall be delivered up to date with the payment of taxes, duties and associated expenses, with the Sellers being the registered owners in full legal title, without limitations or restrictions for its transfer.",
    res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL acts in this transaction solely as a real estate intermediary and holder of the reservation amount and shall not be responsible for the legal, urban planning or technical status of the property, whose verification corresponds to the parties.",
    res_seller_fault: "In the event that the purchase cannot be formalised exclusively due to reasons attributable to the Seller, such as the existence of legal irregularities affecting the property or the impossibility of obtaining the legally required documentation necessary to execute the public deed of sale before a Notary, the Buyer shall be entitled to withdraw from the transaction without penalty or financial obligation.",
    res_seller_refund: "In such case, the Seller shall be obliged to fully refund to the Buyer all amounts paid up to that moment on account of the purchase price.",
    res_withdraw_market: "Once this contract is signed by both parties, the seller will be obliged to withdraw the property from the market and notify any other Real Estate Agent who had the order to sell it, proceeding where appropriate to eliminate, publicize or intervene in their mediation, with the immediate withdrawal of any advertising poster for sale, both their own and those of other Agents.",
    res_sole_purpose: "The parties agree that this Agreement has the sole purpose of reserving the property and temporarily removing it from the market and does not constitute a private purchase contract nor a penitential deposit, which shall, if applicable, be regulated in the subsequent deposit contract.",
    res_spanish_prevails: "In the event of disagreement over interpretation of the present contract, the Spanish version will prevail.",
    res_closing: "And, as proof of compliance, both parties sign this document, at the place and on the date indicated in the header of the document.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "FIRST", clause_2: "SECOND", clause_3: "THIRD", clause_4: "FOURTH",
    clause_5: "FIFTH", clause_6: "SIXTH", clause_7: "SEVENTH", clause_8: "EIGHTH",
    clause_9: "NINTH", clause_10: "TENTH",
  },
  nl: {
    arras_title: "WAARBORGCONTRACT (ARRAS)",
    reservation_title: "RESERVERINGSOVEREENKOMST",
    reunidos: "BIJEENGEKOMEN",
    on_one_part: "Enerzijds",
    of_legal_age: "meerderjarig",
    of_nationality: "van nationaliteit",
    with_valid: "met geldig",
    number: "nummer",
    and_nie: "en NIE-nummer",
    with_address: "met domicilie",
    hereinafter: "hierna te noemen",
    the_buyer: "DE KOPER",
    the_seller: "DE VERKOPER",
    and_other_part: "En anderzijds",
    and_partner: "en",
    both_parties_intro: "Beide partijen handelen in eigen naam en recht, en erkennen wederzijds voldoende bevoegdheid om dit contract aan te gaan, en",
    declare: "VERKLAREN",
    declare_1: "Dat de verkopende partij eigenaar is en geinteresseerd is in de verkoop van het volgende onroerend goed:",
    type_of_property: "TYPE ONROEREND GOED",
    located_in: "gelegen te",
    registered_in: "ingeschreven in het Eigendomsregister van",
    property_nr: "met eigendomsnr.",
    volume: "Deel",
    book: "Boek",
    folio: "folio",
    cadastral_ref: "met kadastrale referentie",
    declare_2: "Dat de kopende partij geinteresseerd is in de aankoop van het in verklaring I beschreven onroerend goed.",
    declare_3: "Beide partijen reguleren in hun eigen belang deze overeenkomst door middel van de volgende,",
    clauses: "CLAUSULES",
    first_arras: "verbindt zich ertoe te verkopen aan",
    who_agrees: "die ermee instemt het in verklaring I beschreven onroerend goed te kopen, reeds bekend bij de kopende partij, in de fysieke, technische, constructieve, stedenbouwkundige en juridische staat die zij verklaart te kennen en te aanvaarden, vrij van hypotheken, lasten, pandrechten, huurders of bewoners en met alle rechten en gebruiken, alsmede alle ontvangsten en bijbehorende belastingen betaald tot op heden.",
    second_price: "De prijs van het onroerend goed dat het voorwerp uitmaakt van de verkoop, zoals overeengekomen door beide partijen, bedraagt",
    plus_taxes: "PLUS DE BIJBEHORENDE BELASTINGEN.",
    furniture_included: "Het onroerend goed zal worden overgedragen met het meubilair en de apparaten die aanwezig zijn in het onroerend goed.",
    furniture_not_included: "Meubilair is niet inbegrepen in de verkoop.",
    furniture_partial: "Meubilair inbegrepen volgens afzonderlijke inventarislijst.",
    amounts_paid: "Deze bedragen zullen worden betaald in de vorm, termijnen en voorwaarden als volgt:",
    reservation_paid: "is betaald als reserveringsaanbetaling aan de tussenpersoon COSTA BLANCA LUXURY INVESTMENTS SL op",
    through_transfer: "via bankoverschrijving.",
    arras_to_pay: "te betalen als waarborgsom aan de VERKOPENDE partij via bankoverschrijving.",
    account: "Rekening",
    bank: "Bank",
    beneficiary: "Begunstigde",
    concept_arras: "Concept: Waarborgsom",
    transfer_effective: "De overschrijving dient te worden uitgevoerd op de genoemde rekening op",
    or_before: "of eerder, waarbij dit document volledig van kracht wordt.",
    arras_penitenciales: "De voornoemde bedragen hebben het karakter van arras penitenciales, conform artikel 1.454 van het Spaanse Burgerlijk Wetboek. Indien de koper een clausule van het contract schendt, niet verschijnt bij de ondertekening van de openbare akte of de overeengekomen prijs niet betaalt, wordt de verkoop ontbonden en is de betaalde aanbetaling verloren ten gunste van de verkoper. Indien de verkoper een clausule van het contract schendt of niet verschijnt bij het verlijden van de openbare akte onder de overeengekomen voorwaarden, kan de koper ervoor kiezen de koop te ontbinden, met de verplichting van de verkoper om het dubbele bedrag van de aanbetaling te betalen.",
    remaining_payment: "via bankoverschrijving naar de rekening van de verkopende partij",
    concept_purchase: "Concept: Aankoop",
    at_signing: "te betalen bij de ondertekening van de openbare koopakte voor de Notaris van",
    on_or_before: "op of voor",
    third_clause: "De verkoper verbindt zich ertoe het onroerend goed dat het voorwerp uitmaakt van dit contract niet over te dragen, te bezwaren of te verhuren aan een derde partij, tot het verstrijken van de hierboven genoemde termijn, voor de betaling van de prijs en de daaropvolgende formalisering en opneming in een openbare akte.",
    fourth_clause: "De kopende partij betaalt de kosten van de overdrachtsbelasting, zegelrecht, notaris- en kadasterkosten die voortvloeien uit het verlijden van deze akte. De verkopende partij betaalt de vermogenswinstbelasting (Plusvalia) indien van toepassing.",
    fifth_clause_1: "De levering van het bezit van het onroerend goed aan de koper vindt plaats bij de ondertekening van de akte voor een notaris.",
    fifth_clause_2: "De kopende partij betaalt vanaf de datum van overdracht van het bezit van het onroerend goed alle kosten (elektriciteit, water etc.) en belastingen die inherent zijn aan het eigendom.",
    fifth_clause_3: "Alle kosten en belastingen die zijn opgebouwd inherent aan het eigendom voor de overdracht van het bezit worden betaald door de verkopende partij.",
    fifth_clause_4: "De verkopende partij verklaart uitdrukkelijk dat alle huisvestingsdiensten (elektriciteit, water, gas, etc.) correct functioneren en verplicht zich tot onderhoud en betaling tot de levering van het bezit van het onroerend goed.",
    fifth_clause_5: "De IBI en de vuilnisbelasting voor het lopende jaar worden proportioneel door beide partijen betaald.",
    sixth_clause: "De partijen doen uitdrukkelijk afstand van hun eigen wetboeken en komen uitdrukkelijk overeen elk geschil, discrepantie, kwestie of claim voortvloeiend uit de uitvoering of interpretatie van dit contract voor te leggen aan de rechtbanken van Benidorm.",
    seventh_clause: "In geval van onenigheid of discrepantie tussen de partijen over de interpretatie van dit contract, prevaleert de Spaanse taal of versie boven de vertaalde versie.",
    closing: "En ten bewijze van overeenstemming met het bovenstaande, ondertekenen beide partijen dit document of per e-mail, voor een exemplaar, op de hierboven vermelde plaats en datum.",
    seller_label: "VERKOPER",
    buyer_label: "KOPER",
    res_all_parties: "Alle partijen handelen in eigen naam en in hun eigen recht en komen hierbij overeen deze reserveringsovereenkomst aan te gaan met betrekking tot het hieronder geidentificeerde onroerend goed.",
    res_owners: "zijn eigenaren van het gehele hieronder beschreven eigendom:",
    res_capacity: "De partijen erkennen wederzijds dat zij in hun respectieve hoedanigheid handelen met de nodige juridische bevoegdheid om zich aan deze contractovereenkomst te binden.",
    res_price_clause: "De verkoopprijs van het onroerend goed bedraagt",
    res_furniture_not: "exclusief meubilair",
    res_excl_taxes: "(exclusief belastingen).",
    res_buyers_shall: "De Kopers zullen dit bedrag aan de Verkopers betalen op het moment van het verlijden van de notariele akte van levering, onder aftrek van de bedragen die eerder zijn betaald en hieronder worden vermeld:",
    res_non_refundable: "die bij ondertekening van deze overeenkomst zal worden betaald als een NIET-RESTITUEERBARE RESERVERINGSVERGOEDING, zal gestort worden op naam van COSTA BLANCA LUXURY INVESTMENTS SL op de hieronder aangegeven rekening, en deze som zal in het depot van voornoemde vennootschap blijven tot de ondertekening van het waarborgcontract door beide partijen, op welk ogenblik ze zal overgeschreven worden op de rekening van de verkoper:",
    res_concept: "Concept: Reservering Ref.",
    res_arras_commit: "Beide partijen verbinden zich ertoe om binnen",
    res_calendar_days: "kalenderdagen vanaf de datum van ondertekening van dit document door beide partijen, met levering binnen",
    res_working_days: "werkdagen na de ondertekening van voornoemd document, een depotovereenkomst te ondertekenen voor een bedrag van",
    res_to_seller: "aan de verkopende partij",
    res_as_arras: "als arras penitenciales, die als deel van de betaling voor het onroerend goed worden beschouwd. De rest van de prijs wordt betaald op het moment van het verlijden van de openbare akte en de overdracht van het bezit.",
    res_max_date: "In het bovengenoemde depotcontract wordt de uiterste datum voor de ondertekening van de akte, de overdracht van het bezit en de volledige betaling van de overeengekomen prijs vastgesteld op",
    res_transfer_free: "Het onroerend goed wordt overgedragen vrij van lasten, huurovereenkomsten, bewoners en stedenbouwkundige beperkingen. Het onroerend goed zal worden geleverd met betaling van belastingen, heffingen en bijbehorende kosten in orde, waarbij de Verkopers de geregistreerde eigenaren zijn met volledig eigendomsrecht, zonder beperkingen of restricties voor de overdracht.",
    res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL treedt in deze transactie uitsluitend op als vastgoedbemiddelaar en bewaarder van het reserveringsbedrag en is niet verantwoordelijk voor de juridische, stedenbouwkundige of technische status van het onroerend goed, waarvan de verificatie bij de partijen ligt.",
    res_seller_fault: "Indien de koopovereenkomst uitsluitend niet kan worden geformaliseerd om redenen die aan de verkoper zijn toe te rekenen, zoals het bestaan van juridische onregelmatigheden met betrekking tot het onroerend goed of het niet kunnen verkrijgen van de wettelijk vereiste documentatie voor het verlijden van de notariele akte van levering, heeft de koper het recht om van de transactie af te zien zonder enige boete of financiele verplichting.",
    res_seller_refund: "In dat geval is de verkoper verplicht alle door de koper tot dat moment betaalde bedragen die als voorschot op de koopprijs zijn voldaan, volledig terug te betalen.",
    res_withdraw_market: "Zodra dit contract door beide partijen is ondertekend, is de verkoper verplicht het goed uit de handel te nemen en elke andere makelaar die opdracht heeft gekregen om het te verkopen hiervan in kennis te stellen, waarbij hij in voorkomend geval zal overgaan tot verwijdering van alle reclameborden voor de verkoop.",
    res_sole_purpose: "Partijen komen overeen dat deze overeenkomst uitsluitend tot doel heeft het onroerend goed te reserveren en tijdelijk uit de markt te nemen en geen onderhandse koopovereenkomst of waarborgsom vormt, welke indien van toepassing zal worden geregeld in een latere waarborgovereenkomst.",
    res_spanish_prevails: "In geval van twijfel of verschil in interpretatie van de inhoud van deze overeenkomst, prevaleert de Spaanse versie.",
    res_closing: "Ten blijke waarvan beide partijen dit document hebben ondertekend op de plaats en op de datum die in het opschrift zijn vermeld.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "EERSTE", clause_2: "TWEEDE", clause_3: "DERDE", clause_4: "VIERDE",
    clause_5: "VIJFDE", clause_6: "ZESDE", clause_7: "ZEVENDE", clause_8: "ACHTSTE",
    clause_9: "NEGENDE", clause_10: "TIENDE",
  },
  fr: {
    arras_title: "CONTRAT D'ARRHES", reservation_title: "CONTRAT DE RESERVATION",
    reunidos: "COMPARUTION", on_one_part: "D'une part", of_legal_age: "majeur(e)", of_nationality: "de nationalite", with_valid: "muni(e) de", number: "numero", and_nie: "et numero NIE", with_address: "domicile", hereinafter: "denomme(e) ci-apres", the_buyer: "L'ACHETEUR", the_seller: "LE VENDEUR", and_other_part: "D'autre part", and_partner: "et",
    both_parties_intro: "Les deux parties agissent en leur nom propre et de plein droit, se reconnaissant mutuellement la capacite suffisante pour conclure ce contrat, et",
    declare: "DECLARENT", declare_1: "Que la partie vendeuse est proprietaire et desireu(se) de vendre le bien immobilier suivant:", type_of_property: "TYPE DE PROPRIETE", located_in: "sise", registered_in: "inscrite au registre de la propriete de", property_nr: "avec numero de propriete", volume: "Tome", book: "Livre", folio: "folio", cadastral_ref: "avec numero de reference cadastrale", declare_2: "Que la partie acheteur est interessee par l'acquisition du bien decrit dans la declaration I.", declare_3: "Les deux parties, dans leur propre interet, reglementent le present contrat par les dispositions suivantes,",
    clauses: "CLAUSES", first_arras: "s'engage a vendre a", who_agrees: "qui s'engage a acheter, la propriete decrite dans la declaration I, deja connue par la partie acheteur, dans l'etat physique, technique, constructif, urbanistique et juridique qu'elle declare connaitre et accepter, libre d'hypotheques, de charges, de privileges, de locataires ou d'occupants et avec tous les droits et usages, ainsi que avec tous les revenus et les taxes correspondantes payes a ce jour.",
    second_price: "Le prix de la propriete objet de la vente convenu par les deux parties est", plus_taxes: "PLUS LES TAXES CORRESPONDANTES.", furniture_included: "La propriete sera transmise avec les meubles et appareils presents dans la propriete.", furniture_not_included: "Les meubles ne sont pas inclus dans la vente.", furniture_partial: "Meubles inclus selon la liste d'inventaire separee.",
    amounts_paid: "Ces montants seront payes sous la forme, les conditions et les modalites suivantes:", reservation_paid: "a ete verse en tant que depot de reservation a la partie intermediaire COSTA BLANCA LUXURY INVESTMENTS SL le", through_transfer: "par virement bancaire.", arras_to_pay: "a verser en tant qu'arrhes a la partie VENDEUR par virement bancaire.",
    account: "Compte", bank: "Banque", beneficiary: "Beneficiaire", concept_arras: "Concept: Arrhes", transfer_effective: "Ce virement doit etre effectue sur le compte susmentonne le", or_before: "ou avant, ce document devenant entierement effectif.",
    arras_penitenciales: "Les montants susmentionnes ont le caractere d'arrhes penitenciales, selon l'article 1.454 du code civil espagnol. Si l'acheteur viole l'une quelconque des clauses du contrat, ne comparait pas a l'acte de signature de l'acte public ou ne paie pas le prix convenu, la vente sera resolue et le depot verse sera perdu au profit du vendeur. Si c'est le vendeur qui viole l'une quelconque des clauses du contrat ou ne comparait pas a la passation de l'acte public selon les conditions convenues, l'acheteur peut opter pour la resolution de l'achat, le vendeur etant oblige de payer le double du montant du depot.",
    remaining_payment: "par virement bancaire au compte du vendeur", concept_purchase: "Concept: Achat", at_signing: "a payer a la signature de l'acte public de vente devant le Notaire de", on_or_before: "sur ou avant",
    third_clause: "Le vendeur s'engage a ne pas ceder, grever ni louer la propriete objet du present contrat a un tiers, jusqu'a l'expiration du delai mentonne ci-dessus, pour le paiement du prix et la formalisitation et conversion subsequentes en acte public.",
    fourth_clause: "La partie acheteur supportera le cout de l'impot de transmission immobiliere, de l'impot de timbre, des honoraires notariaux et de l'enregistrement decoulant du passage de cet acte. La partie vendeur paiera l'impot municipal sur l'augmentation de la valeur des terrains de nature urbaine (Plusvalia) si applicable.",
    fifth_clause_1: "La livraison de la possession de la propriete a l'acheteur aura lieu lors de la signature de l'acte devant un notaire.", fifth_clause_2: "La partie acheteur paiera a partir de la date de remise de la possession de la propriete, toutes les depenses (electricite, eau, etc.) et taxes inherentes a la propriete.", fifth_clause_3: "Toutes les depenses et taxes qui ont accumule inherentes a la propriete avant la livraison de la possession seront payees par la partie vendeur.", fifth_clause_4: "La partie vendeur declare expressement que tous les services d'habitation (electricite, eau, gaz, etc.) fonctionnent correctement et s'engage a maintenir et payer jusqu'a la livraison de la possession de la propriete.", fifth_clause_5: "L'IBI et l'ordure pour l'annee en cours seront payes proportionnellement par les deux parties.",
    sixth_clause: "Les parties renoncent expressement a leurs propres codes de loi et s'engagent expressement a soumettre tout litige, divergence, question ou reclamation resultant de l'execution ou de l'interpretation du present contrat a la juridiction et l'autorite des tribunaux de Benidorm.",
    seventh_clause: "En cas de desaccord ou de divergence entre les parties sur l'interpretation du present contrat, la langue espagnole ou la version prevalera sur la version traduite.",
    closing: "Et en preuve de conformite avec ce qui precede, les deux parties signent ce document ou par e-mail, a titre unique, au lieu et a la date indiques ci-dessus.",
    seller_label: "VENDEUR", buyer_label: "ACHETEUR",
    res_all_parties: "Toutes les parties interviennent en leur nom et de plein droit, acceptant en cet acte de signer cet accord de reservation concernant la propriete qui est identifiee ci-dessous.",
    res_owners: "sont proprietaires de la totalite de la propriete detaillee ci-dessous:", res_capacity: "Les parties se reconnaissent mutuellement dans la position qu'elles exercent respectivement avec la capacite juridique necessaire pour se lier par cet accord de contrat.", res_price_clause: "Le prix de vente de la propriete est", res_furniture_not: "meubles non inclus", res_excl_taxes: "(impots exclus).",
    res_buyers_shall: "Les Acheteurs paieront ladite somme aux Vendeurs au moment de l'execution de l'acte notarie de vente, en deduisant de cette somme tout paiement anterieur detaille ci-dessous:",
    res_non_refundable: "qui sera verse en tant que FRAIS DE RESERVATION NON-REMBOURSABLES lors de la signature de cet Accord, seront verses au nom de COSTA BLANCA LUXURY INVESTMENTS SL dans le compte indique ci-dessous, et ladite somme restera en depot de la societe susmentionnee jusqu'a la signature du contrat de depot par les deux parties, moment auquel elle sera transferee au compte du vendeur:",
    res_concept: "Concept: Reservation Ref.", res_arras_commit: "Les deux parties s'engagent a signer un contrat de depot dans les", res_calendar_days: "jours civils a compter de la date de signature du present document par les deux parties, avec livraison dans les", res_working_days: "jours ouvres apres la signature dudit document, de", res_to_seller: "a la partie vendeuse", res_as_arras: "en tant qu'arrhes penitenciales, qui seront considerees comme faisant partie du paiement de la propriete. Le reste du prix sera verse au moment de l'execution de l'acte public et de la livraison de la possession.",
    res_max_date: "Dans le contrat de depot susmentonne, la date maximale pour la signature de l'acte, la livraison de la possession et le paiement complet du prix convenu sera fixee comme", res_transfer_free: "La propriete sera transferee libre de charges, de locations, de residents et de restrictions d'urbanisme. La propriete sera livree avec paiement des taxes, droits et depenses associes a jour, les Vendeurs etant les proprietaires enregistres en pleine propriete, sans limitations ou restrictions pour son transfert.",
    res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL agit dans cette transaction uniquement en tant qu'intermediaire immobilier et detenteur du montant de reservation et ne sera pas responsable du statut juridique, d'urbanisme ou technique de la propriete, dont la verification incombe aux parties.",
    res_seller_fault: "Dans le cas ou la vente ne pourrait pas etre formalisee exclusivement en raison de raisons imputables au Vendeur, telles que l'existence d'irregularites juridiques affectant la propriete ou l'impossibilite d'obtenir la documentation legalement requise necessaire pour l'execution de l'acte notarie de vente devant un Notaire, l'Acheteur aura le droit de se retirer de la transaction sans penalite ni obligation financiere.",
    res_seller_refund: "Dans ce cas, le Vendeur sera oblige de rembourser integralement a l'Acheteur tous les montants verses jusqu'a ce moment au compte du prix d'achat.",
    res_withdraw_market: "Une fois ce contrat signe par les deux parties, le vendeur sera oblige de retirer la propriete du marche et d'informer tout autre agent immobilier qui avait l'ordre de la vendre.",
    res_sole_purpose: "Les parties conviennent que cet Accord a pour seul objet de reserver la propriete et de la retirer temporairement du marche et ne constitue pas un contrat d'achat prive ni un depot penitentiel.",
    res_spanish_prevails: "En cas de desaccord sur l'interpretation du present contrat, la version espagnole prevalera.",
    res_closing: "Et, en preuve de conformite, les deux parties signent ce document, au lieu et a la date indiques dans l'en-tete du document.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "PREMIER", clause_2: "DEUXIEME", clause_3: "TROISIEME", clause_4: "QUATRIEME", clause_5: "CINQUIEME", clause_6: "SIXIEME", clause_7: "SEPTIEME", clause_8: "HUITIEME", clause_9: "NEUVIEME", clause_10: "DIXIEME",
  },
  de: {
    arras_title: "KAUTION (ARRAS)", reservation_title: "RESERVIERUNGSVEREINBARUNG",
    reunidos: "VERSAMMELT", on_one_part: "Einerseits", of_legal_age: "volljährig", of_nationality: "von Nationalität", with_valid: "mit gültig", number: "Nummer", and_nie: "und NIE-Nummer", with_address: "mit Adresse", hereinafter: "nachstehend genannt", the_buyer: "DER KÄUFER", the_seller: "DER VERKÄUFER", and_other_part: "Andererseits", and_partner: "und",
    both_parties_intro: "Beide Parteien handeln in ihrem eigenen Namen und Recht, gegenseitig anerkennend, dass sie die ausreichende Kapazität haben, diesen Vertrag zu schließen, und",
    declare: "ERKLÄREN", declare_1: "Dass die verkaufende Partei Eigentümer ist und an dem Verkauf der folgenden Immobilie interessiert ist:", type_of_property: "GRUNDSTÜCKSTYP", located_in: "gelegen in", registered_in: "eingetragen im Grundbuch von", property_nr: "mit Grundstücksnummer", volume: "Band", book: "Buch", folio: "Blatt", cadastral_ref: "mit Flurstücksreferenznummer", declare_2: "Dass die kaufende Partei an dem Erwerb der in Erklärung I beschriebenen Immobilie interessiert ist.", declare_3: "Beide Parteien regeln im Falle ihres eigenen Interesses diesen Vertrag nach den folgenden",
    clauses: "KLAUSELN", first_arras: "erklärt sich bereit zu verkaufen an", who_agrees: "die sich bereit erklärt zu kaufen, die in Erklärung I beschriebene Immobilie, die der kaufenden Partei bereits bekannt ist, im physischen, technischen, konstruktiven, städtebaulichen und rechtlichen Zustand, den sie erklärt zu kennen und zu akzeptieren, frei von Hypotheken, Lasten, Pfandrechten, Mietern oder Bewohnern und mit allen Rechten und Nutzungen, sowie mit allen Einnahmen und entsprechenden Steuern bezahlt bis zum heutigen Tag.",
    second_price: "Der von beiden Parteien vereinbarte Preis für die Immobilie beträgt", plus_taxes: "PLUS DIE ENTSPRECHENDEN STEUERN.", furniture_included: "Die Immobilie wird mit den Möbeln und Geräten, die sich in der Immobilie befinden, übertragen.", furniture_not_included: "Möbel sind nicht im Verkauf enthalten.", furniture_partial: "Möbel gemäß separater Inventarliste enthalten.",
    amounts_paid: "Diese Beträge werden wie folgt gezahlt:", reservation_paid: "als Reservierungskaution an die Vermittlungspartei COSTA BLANCA LUXURY INVESTMENTS SL am", through_transfer: "durch Banküberweisung.", arras_to_pay: "als Kaution an die VERKÄUFERPARTEI durch Banküberweisung zu zahlen.",
    account: "Konto", bank: "Bank", beneficiary: "Begünstigter", concept_arras: "Konzept: Kaution", transfer_effective: "Die Überweisung muss auf das genannte Konto am", or_before: "oder früher erfolgen, um vollständig wirksam zu werden in diesem Dokument.",
    arras_penitenciales: "Die oben genannten Beträge haben den Charakter von Arras penitenciales, gemäß Artikel 1.454 des spanischen Zivilgesetzbuches. Wenn der Käufer gegen eine Klausel des Vertrags verstößt, nicht bei der Unterzeichnung der Urkunde erscheint oder den vereinbarten Preis nicht zahlt, wird der Verkauf aufgelöst und die gezahlte Kaution geht zugunsten des Verkäufers verloren. Wenn der Verkäufer gegen eine Klausel des Vertrags verstößt oder nicht bei der Ausstellung der Urkunde unter den vereinbarten Bedingungen erscheint, kann der Käufer den Kauf auflösen, wobei der Verkäufer verpflichtet ist, den doppelten Betrag der Kaution zu zahlen.",
    remaining_payment: "durch Banküberweisung auf das Konto des Verkäufers", concept_purchase: "Konzept: Kauf", at_signing: "bei der Unterzeichnung der Urkunde vor dem Notar von", on_or_before: "am oder vor",
    third_clause: "Der Verkäufer verpflichtet sich nicht, die Immobilie, die Gegenstand dieses Vertrags ist, an einen Dritten abzutreten, zu belasten oder zu vermieten, bis die oben genannte Frist abläuft.",
    fourth_clause: "Die kaufende Partei trägt die Kosten der Grunderwerbsteuer, Urkundensteuer, notariellen und Grundbuchgebühren. Die verkaufende Partei zahlt die Kapitalertragssteuer (Plusvalia), wenn anwendbar.",
    fifth_clause_1: "Die Übergabe der Immobilie an den Käufer findet bei der Unterzeichnung der Urkunde vor einem Notar statt.", fifth_clause_2: "Die kaufende Partei zahlt ab dem Datum der Übergabe der Immobilie alle Kosten und Steuern, die mit dem Eigentum verbunden sind.", fifth_clause_3: "Alle Kosten und Steuern, die mit dem Eigentum vor der Übergabe verbunden sind, werden von der verkaufenden Partei gezahlt.", fifth_clause_4: "Die verkaufende Partei erklärt ausdrücklich, dass alle Wohndienstleistungen ordnungsgemäß funktionieren und verpflichtet sich zur Wartung und Zahlung bis zur Übergabe.", fifth_clause_5: "Die IBI und der Müll für das aktuelle Jahr werden proportional von beiden Parteien gezahlt.",
    sixth_clause: "Die Parteien verzichten ausdrücklich auf ihre eigenen Gesetzbücher und stimmen ausdrücklich zu, alle Rechtsstreitigkeiten der Gerichtsbarkeit der Gerichte von Benidorm zu unterwerfen.",
    seventh_clause: "Im Falle von Meinungsverschiedenheiten über die Auslegung dieses Vertrags wird die spanische Version der übersetzten Version vorgezogen.",
    closing: "Und zum Beweis der Einhaltung unterzeichnen beide Parteien dieses Dokument am angegebenen Ort und Datum oben.",
    seller_label: "VERKÄUFER", buyer_label: "KÄUFER",
    res_all_parties: "Alle Parteien treten in ihrem eigenen Namen und Recht auf und einigen sich darauf, diese Reservierungsvereinbarung bezüglich der unten identifizierten Immobilie zu unterzeichnen.",
    res_owners: "sind Eigentümer der unten detailliert beschriebenen gesamten Immobilie:", res_capacity: "Die Parteien erkennen sich gegenseitig in der Position an, in der sie jeweils mit der erforderlichen Rechtsfähigkeit handeln.", res_price_clause: "Der Verkaufspreis der Immobilie beträgt", res_furniture_not: "Möbel nicht enthalten", res_excl_taxes: "(ohne Steuern).",
    res_buyers_shall: "Die Käufer zahlen diesen Betrag an die Verkäufer bei Ausführung der notariellen Verkaufsurkunde, abzüglich aller zuvor bezahlten Beträge:",
    res_non_refundable: "das bei Unterzeichnung dieser Vereinbarung als NICHT RÜCKERSTATTBARE RESERVIERUNGSGEBÜHR gezahlt wird, auf den Namen von COSTA BLANCA LUXURY INVESTMENTS SL auf dem unten angegebenen Konto eingezahlt werden muss:",
    res_concept: "Konzept: Reservierungsreferenz.", res_arras_commit: "Beide Parteien verpflichten sich, innerhalb von", res_calendar_days: "Kalendertagen ab dem Datum der Unterzeichnung einen Depositvertrag zu unterzeichnen, mit Lieferung innerhalb von", res_working_days: "Arbeitstagen nach Unterzeichnung des genannten Dokuments von", res_to_seller: "an die Verkäuferpartei", res_as_arras: "als Arras penitenciales, die als Teil der Immobilienzahlung betrachtet werden.",
    res_max_date: "In dem oben genannten Depositvertrag wird das Maximaldatum festgelegt als", res_transfer_free: "Die Immobilie wird ohne Lasten, Mietverträge, Bewohner und Stadtplanungsbeschränkungen übertragen.", res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL agiert ausschließlich als Immobilienmakler und Inhaber des Reservierungsbetrags.",
    res_seller_fault: "Falls der Kauf ausschließlich nicht formalisiert werden kann, weil der Verkäufer dies zu verantworten hat, hat der Käufer das Recht, ohne Strafgebühr vom Vertrag zurückzutreten.",
    res_seller_refund: "In diesem Fall muss der Verkäufer dem Käufer alle gezahlten Beträge vollständig erstatten.",
    res_withdraw_market: "Nach Unterzeichnung dieses Vertrags muss der Verkäufer die Immobilie vom Markt nehmen.",
    res_sole_purpose: "Die Parteien vereinbaren, dass diese Vereinbarung ausschließlich der Reservierung der Immobilie dient.",
    res_spanish_prevails: "Im Falle von Meinungsverschiedenheiten hat die spanische Version Vorrang.",
    res_closing: "Zum Beweis der Einhaltung unterzeichnen beide Parteien dieses Dokument.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "ERSTE", clause_2: "ZWEITE", clause_3: "DRITTE", clause_4: "VIERTE", clause_5: "FÜNFTE", clause_6: "SECHSTE", clause_7: "SIEBENTE", clause_8: "ACHTE", clause_9: "NEUNTE", clause_10: "ZEHNTE",
  },
  ru: {
    arras_title: "ДОГОВОР ЗАДАТКА (АРРА)", reservation_title: "СОГЛАШЕНИЕ О РЕЗЕРВИРОВАНИИ",
    reunidos: "СОБРАЛИСЬ", on_one_part: "С одной стороны", of_legal_age: "совершеннолетний", of_nationality: "гражданство", with_valid: "с действительным", number: "номер", and_nie: "и номер NIE", with_address: "с адресом", hereinafter: "далее именуемый", the_buyer: "ПОКУПАТЕЛЬ", the_seller: "ПРОДАВЕЦ", and_other_part: "С другой стороны", and_partner: "и",
    both_parties_intro: "Обе стороны действуют от своего имени и по праву, признавая взаимно достаточную способность заключить этот договор, и",
    declare: "ЗАЯВЛЯЮТ", declare_1: "Что продающая сторона является собственником и заинтересована в продаже следующего имущества:", type_of_property: "ВИД ИМУЩЕСТВА", located_in: "расположено в", registered_in: "зарегистрировано в реестре собственности", property_nr: "с номером имущества", volume: "Том", book: "Книга", folio: "лист", cadastral_ref: "с номером кадастрового справочника", declare_2: "Что покупающая сторона заинтересована в приобретении имущества, описанного в декларации I.", declare_3: "Обе стороны в своих собственных интересах регулируют настоящий договор следующим образом",
    clauses: "ПУНКТЫ", first_arras: "согласился продать", who_agrees: "который согласен приобрести имущество, описанное в декларации I, в физическом, техническом, конструктивном, городском и юридическом состояниях, которые он заявляет, что знает и принимает.",
    second_price: "Цена имущества составляет", plus_taxes: "ПЛЮС СООТВЕТСТВУЮЩИЕ НАЛОГИ.", furniture_included: "Имущество будет передано с мебелью и техникой.", furniture_not_included: "Мебель не включена в продажу.", furniture_partial: "Мебель включена согласно отдельному инвентарному списку.",
    amounts_paid: "Эти суммы будут выплачены следующим образом:", reservation_paid: "было выплачено в качестве резервного взноса COSTA BLANCA LUXURY INVESTMENTS SL на", through_transfer: "путем банковского перевода.", arras_to_pay: "подлежит выплате в качестве задатка стороне ПРОДАВЦА посредством банковского перевода.",
    account: "Счет", bank: "Банк", beneficiary: "Бенефициар", concept_arras: "Концепция: Задаток", transfer_effective: "Такой перевод должен быть осуществлен на указанный счет на", or_before: "или раньше.",
    arras_penitenciales: "Вышеупомянутые суммы имеют характер арас пенитенциалес в соответствии со статьей 1.454 испанского гражданского кодекса.",
    remaining_payment: "путем банковского перевода на счет продавца", concept_purchase: "Концепция: Покупка", at_signing: "подлежит выплате при подписании нотариального акта", on_or_before: "на или раньше",
    third_clause: "Продавец обязуется не передавать имущество третьей стороне до истечения указанного периода.",
    fourth_clause: "Покупающая сторона будет нести расходы на налог на передачу имущества. Продающая сторона выплатит налог Plusvalia, если применимо.",
    fifth_clause_1: "Передача имущества покупателю будет произведена при подписании акта перед нотариусом.", fifth_clause_2: "Покупающая сторона будет нести все расходы с даты передачи.", fifth_clause_3: "Все расходы до передачи будут оплачены продающей стороной.", fifth_clause_4: "Продающая сторона указывает, что все услуги работают надлежащим образом.", fifth_clause_5: "Налог IBI будет оплачен обеими сторонами пропорционально.",
    sixth_clause: "Стороны согласны подчинить споры юрисдикции судов Бенидорма.",
    seventh_clause: "В случае разногласий испанская версия будет преобладать.",
    closing: "И в доказательство обе стороны подписывают этот документ.",
    seller_label: "ПРОДАВЕЦ", buyer_label: "ПОКУПАТЕЛЬ",
    res_all_parties: "Все стороны действуют от своего имени, согласившись подписать это соглашение о резервировании.",
    res_owners: "являются собственниками всего имущества:", res_capacity: "Стороны признают друг друга с необходимой правоспособностью.", res_price_clause: "Цена продажи имущества составляет", res_furniture_not: "мебель не включена", res_excl_taxes: "(без учета налогов).",
    res_buyers_shall: "Покупатели выплатят указанную сумму Продавцам в момент совершения нотариального акта:",
    res_non_refundable: "что будет выплачено в качестве НЕВОЗВРАТНОГО СБОРА ЗА РЕЗЕРВИРОВАНИЕ при подписании данного Соглашения, на счет COSTA BLANCA LUXURY INVESTMENTS SL:",
    res_concept: "Концепция: Резервирование.", res_arras_commit: "Обе стороны обязуются подписать договор задатка в течение", res_calendar_days: "календарных дней с даты подписания с доставкой в течение", res_working_days: "рабочих дней после подписания от", res_to_seller: "продающей стороне", res_as_arras: "в качестве арас пенитенциалес.",
    res_max_date: "Максимальная дата устанавливается как", res_transfer_free: "Имущество передается свободным от обременений.", res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL действует исключительно как агент по недвижимости.",
    res_seller_fault: "В случае невозможности оформления по вине Продавца, Покупатель имеет право отказаться от сделки.",
    res_seller_refund: "Продавец обязан полностью возместить все уплаченные суммы.",
    res_withdraw_market: "Продавец обязуется снять имущество с рынка.",
    res_sole_purpose: "Стороны согласны, что это Соглашение имеет исключительную цель резервирования.",
    res_spanish_prevails: "В случае разногласий испанская версия преобладает.",
    res_closing: "Обе стороны подписывают этот документ.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "ПЕРВЫЙ", clause_2: "ВТОРОЙ", clause_3: "ТРЕТИЙ", clause_4: "ЧЕТВЕРТЫЙ", clause_5: "ПЯТЫЙ", clause_6: "ШЕСТОЙ", clause_7: "СЕДЬМОЙ", clause_8: "ВОСЬМОЙ", clause_9: "ДЕВЯТЫЙ", clause_10: "ДЕСЯТЫЙ",
  },
};

const NATIONALITY_TRANSLATIONS = {
  en: { española: "Spanish", inglesa: "British", italiana: "Italian", alemana: "German", francesa: "French", rusa: "Russian", holandesa: "Dutch", noruega: "Norwegian", belga: "Belgian", sueca: "Swedish", estadounidense: "American", canadiense: "Canadian", irlandesa: "Irish", checa: "Czech" },
  nl: { española: "Spaans", inglesa: "Brits", italiana: "Italiaans", alemana: "Duits", francesa: "Frans", rusa: "Russisch", holandesa: "Nederlands", noruega: "Noors", belga: "Belgisch", sueca: "Zweeds", estadounidense: "Amerikaans", canadiense: "Canadees", irlandesa: "Iers", checa: "Tsjechisch" },
  fr: { española: "espagnole", inglesa: "britannique", italiana: "italienne", alemana: "allemande", francesa: "française", rusa: "russe", holandesa: "néerlandaise", noruega: "norvégienne", belga: "belge", sueca: "suédoise", estadounidense: "américaine", canadiense: "canadienne", irlandesa: "irlandaise", checa: "tchèque" },
  de: { española: "spanisch", inglesa: "britisch", italiana: "italienisch", alemana: "deutsch", francesa: "französisch", rusa: "russisch", holandesa: "niederländisch", noruega: "norwegisch", belga: "belgisch", sueca: "schwedisch", estadounidense: "amerikanisch", canadiense: "kanadisch", irlandesa: "irisch", checa: "tschechisch" },
  ru: { española: "ispanskaya", inglesa: "britanskaya", italiana: "italyanskaya", alemana: "nemetskaya", francesa: "frantsuzskaya", rusa: "russkaya", holandesa: "niderlandskaya", noruega: "norvezhskaya", belga: "belgiyskaya", sueca: "shvedskaya", estadounidense: "amerikanskaya", canadiense: "kanadskaya", irlandesa: "irlandskaya", checa: "cheshskaya" },
};

const LANG_COLORS = {
  en: '0000CC',
  nl: '006600',
  fr: '990099',
  de: 'CC6600',
  ru: 'CC0000',
};

function translateNat(nationality, lang) {
  if (!lang || lang === 'es') return nationality || '___';
  const key = (nationality || '').toLowerCase();
  return NATIONALITY_TRANSLATIONS[lang]?.[key] || nationality || '___';
}

function formatMoney(amount, lang = 'es') {
  if (!amount) return '___';
  const num = parseFloat(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const euros = Math.floor(absNum);
  const cents = Math.round((absNum - euros) * 100);
  const formatted = euros.toLocaleString('es-ES') + ',' + (cents < 10 ? '0' : '') + cents;
  return (isNegative ? '-' : '') + formatted + ' EUR';
}

// Full money format: "WORDS EUROS (number€)"
const EURO_WORD = { es: 'EUROS', en: 'EUROS', nl: 'EURO', fr: 'EUROS', de: 'EURO', ru: 'EVRO' };
function formatMoneyFull(amount, lang = 'es') {
  if (!amount) return '___';
  const num = parseFloat(amount);
  const absNum = Math.abs(num);
  const euros = Math.floor(absNum);
  const cents = Math.round((absNum - euros) * 100);
  const formatted = euros.toLocaleString('es-ES') + ',' + (cents < 10 ? '0' : '') + cents;
  const words = numberToWords(euros, lang);
  const euroWord = EURO_WORD[lang] || 'EUROS';
  return `${words} ${euroWord} (${formatted}€)`;
}

function formatDate(dateStr, lang = 'es') {
  if (!dateStr) return '___';
  try {
    let day, month, year;
    // Handle DD/MM/YYYY format (European)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
    // Handle YYYY-MM-DD format (ISO)
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
    // Fallback: try native Date parsing
    else {
      const date = new Date(dateStr + 'T12:00:00');
      day = date.getDate();
      month = date.getMonth() + 1;
      year = date.getFullYear();
    }
    if (isNaN(day) || isNaN(month) || isNaN(year)) return dateStr;
    if (lang === 'en') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${day} of ${months[month - 1]} of ${year}`;
    }
    if (lang === 'nl') {
      const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
      return `${day} ${months[month - 1]} ${year}`;
    }
    if (lang === 'fr') {
      const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
      return `${day} ${months[month - 1]} ${year}`;
    }
    if (lang === 'de') {
      const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
      return `${day}. ${months[month - 1]} ${year}`;
    }
    if (lang === 'ru') {
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      return `${day} ${months[month - 1]} ${year}`;
    }
    const esMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${day} de ${esMonths[month - 1]} de ${year}`;
  } catch (e) {
    return dateStr;
  }
}

function v(val) {
  return val || '___';
}

// CBLI default bank details
const CBLI_BANK = {
  iban: 'ES21 0081 0569 4100 0207 4720',
  bankName: 'Banco Sabadell',
  beneficiary: 'COSTA BLANCA LUXURY INVESTMENTS SL',
};

// Create colored text runs for bilingual paragraphs
function createBilingualRuns(esText, langEntries, transTextOrFn) {
  const runs = [];

  // Spanish text (always bold, black)
  if (typeof esText === 'string') {
    runs.push(new TextRun({ text: esText, bold: true }));
  } else if (Array.isArray(esText)) {
    esText.forEach((seg) => {
      runs.push(new TextRun({
        text: seg.text,
        bold: seg.bold !== false,
        italic: seg.italic || false,
      }));
    });
  }

  // Translations in color (with blank line separator)
  if (langEntries && langEntries.length > 0 && typeof transTextOrFn === 'function') {
    langEntries.forEach((entry, idx) => {
      // Add a blank line before each translation for visual spacing
      runs.push(new TextRun({ text: '\n', bold: false, size: 12 }));
      runs.push(new TextRun({ text: '\n', bold: false, size: 12 }));
      const color = LANG_COLORS[entry.lang] || '333333';
      const transText = transTextOrFn(entry.t, entry.lang);

      if (typeof transText === 'string') {
        runs.push(new TextRun({
          text: transText,
          italic: true,
          color: color,
        }));
      } else if (Array.isArray(transText)) {
        transText.forEach((seg) => {
          runs.push(new TextRun({
            text: seg.text,
            italic: true,
            bold: seg.bold || false,
            color: color,
          }));
        });
      }
    });
  }

  return runs;
}

export async function generateContractDocx(formData) {
  const d = formData;
  const esT = translations.es; // ALWAYS use Spanish as primary
  const languages = formData.languages && formData.languages.length > 0 ? formData.languages : [];

  let langEntries = [];
  if (languages.length > 0) {
    langEntries = languages.map(lang => ({
      lang,
      t: translations[lang] || translations.en,
    }));
  }

  const isMultiLang = langEntries.length > 0;

  // Resolve bank details: use form data if provided, else CBLI defaults
  const bankIban = d.bank?.iban?.trim() || CBLI_BANK.iban;
  const bankName = d.bank?.bankName?.trim() || CBLI_BANK.bankName;
  const bankBeneficiary = d.bank?.beneficiary?.trim() || CBLI_BANK.beneficiary;

  // Load header image
  let headerImage = null;
  try {
    const headerPath = path.join(process.cwd(), 'public', 'header.png');
    headerImage = fs.readFileSync(headerPath);
  } catch (e) {
    console.log('Header image not found');
  }

  const paragraphs = [];

  // ---- FIXED addPara: Calibri font, size 24 half-points = 12pt ----
  const FONT = 'Calibri';
  const FONT_SIZE = 24; // 12pt in half-points
  const addPara = (text, opts = {}) => {
    const { bold = false, italic = false, align = 'left', fontSize = FONT_SIZE, spacing = 200, color = null, underline = false, indent = 0 } = opts;
    const paraOpts = {
      alignment: align === 'center' ? AlignmentType.CENTER : align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: spacing, line: 240, lineRule: 'auto' },
      children: [new TextRun({
        text,
        bold,
        italic,
        size: fontSize,
        color: color || undefined,
        font: FONT,
        underline: underline ? {} : undefined,
      })],
    };
    if (indent) paraOpts.indent = { left: indent };
    paragraphs.push(new Paragraph(paraOpts));
  };

  // ---- addBilingual: Spanish primary + each translation as SEPARATE paragraph ----
  // Text is NOT bold by default. Use array segments with { text, bold: true } for form data.
  const addBilingual = (esText, transTextOrFn, spacingAfter = 200, indentLeft = 0) => {
    // Spanish paragraph
    const esRuns = [];
    if (typeof esText === 'string') {
      esRuns.push(new TextRun({ text: esText, font: FONT, size: FONT_SIZE }));
    } else if (Array.isArray(esText)) {
      esText.forEach((seg) => {
        esRuns.push(new TextRun({ text: seg.text, bold: seg.bold || false, italic: seg.italic || false, font: FONT, size: FONT_SIZE }));
      });
    }
    const hasTranslations = isMultiLang && langEntries.length > 0 && typeof transTextOrFn === 'function';
    const paraOpts = {
      children: esRuns,
      spacing: { after: hasTranslations ? 120 : spacingAfter, line: 240, lineRule: 'auto' },
    };
    if (indentLeft) paraOpts.indent = { left: indentLeft };
    paragraphs.push(new Paragraph(paraOpts));

    // Each translation as its own paragraph with spacing
    if (hasTranslations) {
      langEntries.forEach((entry, idx) => {
        const isLast = idx === langEntries.length - 1;
        const color = LANG_COLORS[entry.lang] || '333333';
        const transText = transTextOrFn(entry.t, entry.lang);
        const transRuns = [];
        if (typeof transText === 'string') {
          transRuns.push(new TextRun({ text: transText, italic: true, color, font: FONT, size: FONT_SIZE }));
        } else if (Array.isArray(transText)) {
          transText.forEach((seg) => {
            transRuns.push(new TextRun({ text: seg.text, italic: true, bold: seg.bold || false, color, font: FONT, size: FONT_SIZE }));
          });
        }
        const transParaOpts = {
          children: transRuns,
          spacing: { after: isLast ? spacingAfter : 120, line: 240, lineRule: 'auto' },
        };
        if (indentLeft) transParaOpts.indent = { left: indentLeft };
        paragraphs.push(new Paragraph(transParaOpts));
      });
    }
  };

  // ---- addImage ----
  const addImage = (imageBuffer, opts = {}) => {
    if (!imageBuffer) return;
    const { width = 500, height = 80, align = 'center' } = opts;
    paragraphs.push(new Paragraph({
      alignment: align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new ImageRun({
        data: imageBuffer,
        transformation: { width, height },
        type: 'png',
      })],
      spacing: { after: 200 },
    }));
  };

  // ========== DOCUMENT HEADER ==========
  if (headerImage) {
    // Image is 1348x316 (4.27:1 ratio). Page width between margins = ~6.3in = ~453pt ≈ 595px
    // Use full width and proportional height
    addImage(headerImage, { width: 595, height: 139, align: 'center' });
  }

  // Date and location (top left, above title) — form data in bold
  paragraphs.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 200, line: 240, lineRule: 'auto' },
    children: [
      new TextRun({ text: formatDate(d.date, 'es'), bold: true, font: FONT, size: FONT_SIZE }),
      new TextRun({ text: ', en ', font: FONT, size: FONT_SIZE }),
      new TextRun({ text: v(d.city), bold: true, font: FONT, size: FONT_SIZE }),
    ],
  }));

  // Contract title — black, underlined, NOT translated
  let titleEs;
  if (d.type === 'arras') {
    titleEs = esT.arras_title;
  } else if (d.type === 'commission') {
    titleEs = 'RECONOCIMIENTO DE HONORARIOS / COMMISSION AGREEMENT';
  } else {
    titleEs = esT.reservation_title;
  }
  paragraphs.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200, line: 240, lineRule: 'auto' },
    children: [new TextRun({
      text: titleEs,
      bold: true,
      size: 28,
      color: BRAND.black,
      underline: {},
      font: FONT,
    })],
  }));

  // ========== REUNIDOS — black, bold, underlined, NOT translated ==========
  addPara(esT.reunidos, { bold: true, align: 'center', spacing: 200, color: BRAND.black, fontSize: 24, underline: true });

  // Helper: NIE fragment only if filled
  const nieEs = (nie) => nie && nie.trim() && nie.trim() !== '___' ? [{ text: ' y NIE número ' }, { text: nie.trim(), bold: true }, { text: ',' }] : [{ text: ',' }];
  const nieTr = (nie, trans) => nie && nie.trim() && nie.trim() !== '___' ? ` ${trans.and_nie} ${nie.trim()},` : ',';

  // Helper: build person ID as segments with form data bold (ES)
  const personSegs = (title, name, nat, idType, idNumber, nie, address, label) => {
    const segs = [
      { text: `${title} ` }, { text: name, bold: true },
      { text: `, mayor de edad, de nacionalidad ` }, { text: v(nat), bold: true },
      { text: `, provisto de ${v(idType)} vigente numero ` }, { text: v(idNumber), bold: true },
      ...nieEs(nie),
      { text: ` con domicilio a efectos de notificaciones ` }, { text: v(address), bold: true },
      { text: `, en adelante ${label},` },
    ];
    return segs;
  };

  // Helper: build combined partner person ID segments (ES)
  const partnerSegs = (t1, n1, t2, n2, nat1, nat2, idT1, idN1, idT2, idN2, nie, address, label) => {
    const segs = [
      { text: `${t1} ` }, { text: n1, bold: true },
      { text: ' y ' }, { text: `${t2} `, }, { text: n2, bold: true },
      { text: `, mayores de edad, con nacionalidad ` }, { text: v(nat1), bold: true },
      { text: ' e ' }, { text: v(nat2), bold: true },
      { text: `, provistos de ${v(idT1)} vigente numero ` }, { text: v(idN1), bold: true },
      { text: ` y ${v(idT2)} numero ` }, { text: v(idN2), bold: true },
      ...nieEs(nie),
      { text: ` con domicilio a efectos de notificaciones ` }, { text: v(address), bold: true },
      { text: `, en adelante ${label},` },
    ];
    return segs;
  };

  // Seller identification
  const sellerTitle = d.seller?.title === 'Don' ? 'D.' : 'Dña.';
  const sellerName = v(d.seller?.name);

  if (d.seller?.hasPartner && d.seller?.partner?.name) {
    const sp = d.seller.partner;
    const spTitle = sp.title === 'Don' ? 'D.' : 'Dña.';
    addBilingual(
      [{ text: `${esT.on_one_part}, ` }, ...partnerSegs(sellerTitle, sellerName, spTitle, v(sp.name), d.seller?.nationality, sp.nationality, d.seller?.idType, d.seller?.idNumber, sp.idType, sp.idNumber, d.seller?.nie, d.seller?.address, esT.the_seller)],
      (trans, lang) => `${trans.on_one_part}, ${sellerTitle} ${sellerName} and ${spTitle} ${v(sp.name)}, ${trans.of_legal_age}, ${trans.of_nationality} ${translateNat(d.seller?.nationality, lang)} and ${translateNat(sp.nationality, lang)}, ${trans.with_valid} ${v(d.seller?.idType)} ${trans.number} ${v(d.seller?.idNumber)} and ${v(sp.idType)} ${trans.number} ${v(sp.idNumber)}${nieTr(d.seller?.nie, trans)} ${trans.with_address} ${v(d.seller?.address)}, ${trans.hereinafter} ${trans.the_seller},`,
      200
    );
  } else {
    addBilingual(
      [{ text: `${esT.on_one_part}, ` }, ...personSegs(sellerTitle, sellerName, d.seller?.nationality, d.seller?.idType, d.seller?.idNumber, d.seller?.nie, d.seller?.address, esT.the_seller)],
      (trans, lang) => `${trans.on_one_part}, ${sellerTitle} ${sellerName}, ${trans.of_legal_age}, ${trans.of_nationality} ${translateNat(d.seller?.nationality, lang)}, ${trans.with_valid} ${v(d.seller?.idType)} ${trans.number} ${v(d.seller?.idNumber)}${nieTr(d.seller?.nie, trans)} ${trans.with_address} ${v(d.seller?.address)}, ${trans.hereinafter} ${trans.the_seller},`,
      200
    );
  }

  // Buyer identification
  const buyerTitle = d.buyer?.title === 'Don' ? 'D.' : 'Dña.';
  const buyerName = v(d.buyer?.name);

  if (d.buyer?.hasPartner && d.buyer?.partner?.name) {
    const bp = d.buyer.partner;
    const bpTitle = bp.title === 'Don' ? 'D.' : 'Dña.';
    addBilingual(
      [{ text: `${esT.and_other_part}, ` }, ...partnerSegs(buyerTitle, buyerName, bpTitle, v(bp.name), d.buyer?.nationality, bp.nationality, d.buyer?.idType, d.buyer?.idNumber, bp.idType, bp.idNumber, d.buyer?.nie, d.buyer?.address, esT.the_buyer)],
      (trans, lang) => `${trans.and_other_part}, ${buyerTitle} ${buyerName} and ${bpTitle} ${v(bp.name)}, ${trans.of_legal_age}, ${trans.of_nationality} ${translateNat(d.buyer?.nationality, lang)} and ${translateNat(bp.nationality, lang)}, ${trans.with_valid} ${v(d.buyer?.idType)} ${trans.number} ${v(d.buyer?.idNumber)} and ${v(bp.idType)} ${trans.number} ${v(bp.idNumber)}${nieTr(d.buyer?.nie, trans)} ${trans.with_address} ${v(d.buyer?.address)}, ${trans.hereinafter} ${trans.the_buyer},`,
      200
    );
  } else {
    addBilingual(
      [{ text: `${esT.and_other_part}, ` }, ...personSegs(buyerTitle, buyerName, d.buyer?.nationality, d.buyer?.idType, d.buyer?.idNumber, d.buyer?.nie, d.buyer?.address, esT.the_buyer)],
      (trans, lang) => `${trans.and_other_part}, ${sellerTitle} ${buyerName}, ${trans.of_legal_age}, ${trans.of_nationality} ${translateNat(d.buyer?.nationality, lang)}, ${trans.with_valid} ${v(d.buyer?.idType)} ${trans.number} ${v(d.buyer?.idNumber)}${nieTr(d.buyer?.nie, trans)} ${trans.with_address} ${v(d.buyer?.address)}, ${trans.hereinafter} ${trans.the_buyer},`,
      200
    );
  }

  addBilingual(
    esT.both_parties_intro,
    (trans, lang) => trans.both_parties_intro,
    200
  );

  // ========== EXPONEN — black, bold, underlined, NOT translated ==========
  addPara(esT.declare, { bold: true, align: 'center', spacing: 200, color: BRAND.black, fontSize: 24, underline: true });

  // Declaration I
  addBilingual(
    `I. ${esT.declare_1}`,
    (trans, lang) => `I. ${trans.declare_1}`,
    200
  );

  // Property details — form data in bold, skip empty optional fields
  const propType = v(d.property?.type);
  const hasVal = (val) => val && val.trim() && val.trim() !== '___';
  // Helper: build property segments as indented list item with "- " prefix
  const INDENT = 720; // 0.5 inch indent in twips
  const addPropertyItem = (segs) => {
    paragraphs.push(new Paragraph({
      indent: { left: INDENT },
      spacing: { after: 120, line: 240, lineRule: 'auto' },
      children: segs.map(seg => new TextRun({ text: seg.text, bold: seg.bold || false, font: FONT, size: FONT_SIZE })),
    }));
  };

  const buildPropSegs = () => {
    const segs = [
      { text: '- ' }, { text: v(d.property?.type), bold: true },
      { text: `, ${esT.located_in} ` }, { text: v(d.property?.address), bold: true },
    ];
    if (hasVal(d.property?.registry)) segs.push({ text: `, ${esT.registered_in} ` }, { text: d.property.registry.trim(), bold: true });
    if (hasVal(d.property?.finca)) segs.push({ text: `, ${esT.property_nr} ` }, { text: d.property.finca.trim(), bold: true });
    if (hasVal(d.property?.tomo)) segs.push({ text: `, ${esT.volume} ` }, { text: d.property.tomo.trim(), bold: true });
    if (hasVal(d.property?.libro)) segs.push({ text: `, ${esT.book} ` }, { text: d.property.libro.trim(), bold: true });
    if (hasVal(d.property?.folio)) segs.push({ text: `, ${esT.folio} ` }, { text: d.property.folio.trim(), bold: true });
    if (hasVal(d.property?.catastral)) segs.push({ text: `, ${esT.cadastral_ref} ` }, { text: d.property.catastral.trim(), bold: true });
    segs.push({ text: '.' });
    return segs;
  };
  addPropertyItem(buildPropSegs());

  // Extra properties — as indented list items with "- " prefix
  if (d.extraProperties && d.extraProperties.length > 0) {
    d.extraProperties.forEach((prop, idx) => {
      if (prop.enabled) {
        const buildExtraSegs = () => {
          const segs = [{ text: '- ' }, { text: v(prop.type), bold: true }];
          if (hasVal(prop.catastral)) segs.push({ text: `, ${esT.cadastral_ref} ` }, { text: prop.catastral.trim(), bold: true });
          if (hasVal(prop.finca)) segs.push({ text: `, ${esT.property_nr} ` }, { text: prop.finca.trim(), bold: true });
          if (hasVal(prop.tomo)) segs.push({ text: `, ${esT.volume} ` }, { text: prop.tomo.trim(), bold: true });
          if (hasVal(prop.libro)) segs.push({ text: `, ${esT.book} ` }, { text: prop.libro.trim(), bold: true });
          if (hasVal(prop.folio)) segs.push({ text: `, ${esT.folio} ` }, { text: prop.folio.trim(), bold: true });
          segs.push({ text: '.' });
          return segs;
        };
        addPropertyItem(buildExtraSegs());
      }
    });
  }

  // Declaration II
  addBilingual(`II. ${esT.declare_2}`, (trans, lang) => `II. ${trans.declare_2}`, 200);

  // Declaration III
  addBilingual(`III. ${esT.declare_3}`, (trans, lang) => `III. ${trans.declare_3}`, 200);

  // ========== CLÁUSULAS — black, bold, underlined, NOT translated ==========
  addPara(esT.clauses, { bold: true, align: 'center', spacing: 200, color: BRAND.black, fontSize: 24, underline: true });

  // ========== ARRAS-SPECIFIC CONTENT ==========
  if (d.type === 'arras') {
    // PRIMERA
    const sellerFull = d.seller?.hasPartner && d.seller?.partner?.name
      ? `${sellerTitle} ${sellerName} y ${d.seller.partner.title === 'Dona' || d.seller.partner.title === 'Doña' ? 'Dña.' : 'D.'} ${v(d.seller.partner.name)}`
      : `${sellerTitle} ${sellerName}`;
    const buyerFull = d.buyer?.hasPartner && d.buyer?.partner?.name
      ? `${buyerTitle} ${buyerName} y ${d.buyer.partner.title === 'Dona' || d.buyer.partner.title === 'Doña' ? 'Dña.' : 'D.'} ${v(d.buyer.partner.name)}`
      : `${buyerTitle} ${buyerName}`;

    addBilingual(
      [
        { text: `1. ${esT.clause_1}.- ` }, { text: sellerFull, bold: true },
        { text: ` ${esT.first_arras} ` }, { text: buyerFull, bold: true },
        { text: `, ${esT.who_agrees}` },
      ],
      (trans, lang) => [
        { text: `1. ${trans.clause_1}.- ` }, { text: sellerFull, bold: true },
        { text: ` ${trans.first_arras} ` }, { text: buyerFull, bold: true },
        { text: `, ${trans.who_agrees}` },
      ],
      200
    );

    // SEGUNDA - Price
    addBilingual(
      [
        { text: `2. ${esT.clause_2}.- ${esT.second_price} ` }, { text: formatMoneyFull(d.price?.total), bold: true },
        { text: ` ${esT.plus_taxes}` },
      ],
      (trans, lang) => [
        { text: `2. ${trans.clause_2}.- ${trans.second_price} ` }, { text: formatMoneyFull(d.price?.total, lang), bold: true },
        { text: ` ${trans.plus_taxes}` },
      ],
      200
    );

    // Furniture
    const furnitureKeyEs = d.property?.furniture === 'included' ? 'furniture_included' : d.property?.furniture === 'not_included' ? 'furniture_not_included' : 'furniture_partial';
    addBilingual(esT[furnitureKeyEs], (trans, lang) => trans[furnitureKeyEs], 200);

    // Amounts
    addBilingual(esT.amounts_paid, (trans, lang) => trans.amounts_paid, 200);

    // Reservation payment
    addBilingual(
      [
        { text: 'a) La cantidad de ' }, { text: formatMoneyFull(d.price?.reservation), bold: true },
        { text: ` ${esT.reservation_paid} ` }, { text: formatDate(d.price?.reservationDate, 'es'), bold: true },
        { text: ` ${esT.through_transfer}` },
      ],
      (trans, lang) => [
        { text: 'a) ' }, { text: formatMoneyFull(d.price?.reservation, lang), bold: true },
        { text: ` ${trans.reservation_paid} ` }, { text: formatDate(d.price?.reservationDate, lang), bold: true },
        { text: ` ${trans.through_transfer}` },
      ],
      200, 720
    );

    // Arras payment
    addBilingual(
      [
        { text: 'b) La cantidad de ' }, { text: formatMoneyFull(d.price?.arras), bold: true },
        { text: ` ${esT.arras_to_pay}` },
      ],
      (trans, lang) => [
        { text: 'b) ' }, { text: formatMoneyFull(d.price?.arras, lang), bold: true },
        { text: ` ${trans.arras_to_pay}` },
      ],
      200, 720
    );

    // Bank details
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'IBAN: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankIban, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Banco: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankName, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Beneficiario: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankBeneficiary, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    addPara(`${esT.concept_arras}`, { bold: true, spacing: 200, indent: 720 });

    // Arras deadline
    addBilingual(
      [
        { text: `${esT.transfer_effective} ` }, { text: formatDate(d.price?.arrasDeadline, 'es'), bold: true },
        { text: ` ${esT.or_before}` },
      ],
      (trans, lang) => [
        { text: `${trans.transfer_effective} ` }, { text: formatDate(d.price?.arrasDeadline, lang), bold: true },
        { text: ` ${trans.or_before}` },
      ],
      200, 720
    );

    // Arras penitenciales
    addBilingual(esT.arras_penitenciales, (trans, lang) => trans.arras_penitenciales, 200, 720);

    // Remaining payment
    addBilingual(
      [
        { text: 'c) La cantidad de ' }, { text: formatMoneyFull(d.price?.remaining), bold: true },
        { text: ` ${esT.remaining_payment}, ${esT.at_signing} ` }, { text: v(d.notaryLocation), bold: true },
        { text: ' ' }, { text: v(d.notary), bold: true },
        { text: `, ${esT.on_or_before} ` }, { text: formatDate(d.price?.notaryDate, 'es'), bold: true },
        { text: '.' },
      ],
      (trans, lang) => [
        { text: 'c) ' }, { text: formatMoneyFull(d.price?.remaining, lang), bold: true },
        { text: ` ${trans.remaining_payment}, ${trans.at_signing} ` }, { text: v(d.notaryLocation), bold: true },
        { text: ' ' }, { text: v(d.notary), bold: true },
        { text: `, ${trans.on_or_before} ` }, { text: formatDate(d.price?.notaryDate, lang), bold: true },
        { text: '.' },
      ],
      200, 720
    );

    // Bank details for final payment
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'IBAN: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankIban, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Banco: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankName, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Beneficiario: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankBeneficiary, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    addPara(`${esT.concept_purchase}`, { bold: true, spacing: 200, indent: 720 });

    // TERCERA
    addBilingual(`3. ${esT.clause_3}.- ${esT.third_clause}`, (trans, lang) => `3. ${trans.clause_3}.- ${trans.third_clause}`, 200);

    // CUARTA
    addBilingual(`4. ${esT.clause_4}.- ${esT.fourth_clause}`, (trans, lang) => `4. ${trans.clause_4}.- ${trans.fourth_clause}`, 200);

    // QUINTA
    addBilingual(`5. ${esT.clause_5}.- ${esT.fifth_clause_1}`, (trans, lang) => `5. ${trans.clause_5}.- ${trans.fifth_clause_1}`, 200);
    addBilingual(esT.fifth_clause_2, (trans, lang) => trans.fifth_clause_2, 200);
    addBilingual(esT.fifth_clause_3, (trans, lang) => trans.fifth_clause_3, 200);
    addBilingual(esT.fifth_clause_4, (trans, lang) => trans.fifth_clause_4, 200);
    addBilingual(esT.fifth_clause_5, (trans, lang) => trans.fifth_clause_5, 200);

    // SEXTA
    addBilingual(`6. ${esT.clause_6}.- ${esT.sixth_clause}`, (trans, lang) => `6. ${trans.clause_6}.- ${trans.sixth_clause}`, 200);

    // SEPTIMA
    addBilingual(`7. ${esT.clause_7}.- ${esT.seventh_clause}`, (trans, lang) => `7. ${trans.clause_7}.- ${trans.seventh_clause}`, 200);

    // Special conditions
    if (d.conditions && d.conditions !== '___') {
      addPara(`8. ${esT.clause_8}.- CONDICIONES ESPECIALES / SPECIAL CONDITIONS`, { bold: true, spacing: 200 });
      addPara(d.conditions, { spacing: 200 });
      if (isMultiLang && d.translatedConditions) {
        langEntries.forEach((entry) => {
          const tc = d.translatedConditions[entry.lang];
          if (tc) {
            addPara(tc, { italic: true, spacing: 200, color: LANG_COLORS[entry.lang] });
          }
        });
      }
    }

    // Closing
    addBilingual(esT.closing, (trans, lang) => trans.closing, 300);

  } else if (d.type === 'commission') {
    // ========== COMMISSION AGREEMENT CONTENT ==========
    const sellerFull = d.seller?.hasPartner && d.seller?.partner?.name
      ? `${sellerTitle} ${sellerName} y ${d.seller.partner.title === 'Dona' || d.seller.partner.title === 'Doña' ? 'Dña.' : 'D.'} ${v(d.seller.partner.name)}`
      : `${sellerTitle} ${sellerName}`;

    // CBLI identification
    addBilingual(
      [
        { text: 'Y de otra parte la mercantil ' },
        { text: 'COSTA BLANCA LUXURY INVESTMENTS S.L.', bold: true },
        { text: ' con CIF ' },
        { text: 'B56281082', bold: true },
        { text: ', con domicilio en ' },
        { text: 'Puerto Deportivo Campomanes 59, 03590, Altea, Alicante', bold: true },
        { text: ' en representación de ' },
        { text: 'Don BRUNO FELIPE', bold: true },
        { text: '.' },
      ],
      (trans, lang) => `And on the other part the company COSTA BLANCA LUXURY INVESTMENTS S.L. with CIF B56281082, with registered address at Puerto Deportivo Campomanes 59, 03590, Altea, Alicante, represented by Don BRUNO FELIPE.`
    );

    // DICEN Y OTORGAN section
    addPara('DICEN Y OTORGAN', { bold: true, align: 'center', spacing: 200, color: BRAND.black, fontSize: 24, underline: true });

    // Declaration about CBLI visiting property
    addBilingual(
      [
        { text: 'Que la parte ' },
        { text: 'COSTA BLANCA LUXURY INVESTMENTS S.L.', bold: true },
        { text: ' ha realizado la visita de la propiedad con el cliente ' },
        { text: 'Comprador', bold: true },
        { text: ' (como se describe a continuación) identificando la propiedad y confirmando su estado.' },
      ],
      (trans, lang) => `That the party COSTA BLANCA LUXURY INVESTMENTS S.L. has visited the property with the client Buyer (as described below), identifying the property and confirming its condition.`
    );

    // Property description
    addBilingual(
      [
        { text: 'DESCRIPCIÓN DEL INMUEBLE / PROPERTY DESCRIPTION:' },
      ],
      (trans, lang) => `DESCRIPCIÓN DEL INMUEBLE / PROPERTY DESCRIPTION:`
    );

    // Build property segments
    const buildCommissionPropSegs = () => {
      const segs = [
        { text: '- ' }, { text: v(d.property?.type), bold: true },
        { text: `, sito en ` }, { text: v(d.property?.address), bold: true },
      ];
      if (hasVal(d.property?.registry)) segs.push({ text: `, inscrito en el Registro de la Propiedad de ` }, { text: d.property.registry.trim(), bold: true });
      if (hasVal(d.property?.finca)) segs.push({ text: `, con finca nr. ` }, { text: d.property.finca.trim(), bold: true });
      if (hasVal(d.property?.tomo)) segs.push({ text: `, Tomo ` }, { text: d.property.tomo.trim(), bold: true });
      if (hasVal(d.property?.libro)) segs.push({ text: `, Libro ` }, { text: d.property.libro.trim(), bold: true });
      if (hasVal(d.property?.folio)) segs.push({ text: `, folio ` }, { text: d.property.folio.trim(), bold: true });
      if (hasVal(d.property?.catastral)) segs.push({ text: `, con referencia catastral numero ` }, { text: d.property.catastral.trim(), bold: true });
      segs.push({ text: '.' });
      return segs;
    };

    addPropertyItem(buildCommissionPropSegs());

    // Agreement clause
    addBilingual(
      [
        { text: 'Los vendedores desean adquirir la propiedad a través de ' },
        { text: 'COSTA BLANCA LUXURY INVESTMENTS S.L.', bold: true },
        { text: '.' },
      ],
      (trans, lang) => `The sellers wish to acquire the property through COSTA BLANCA LUXURY INVESTMENTS S.L.`
    );

    // Price clause
    addBilingual(
      [
        { text: 'El precio de venta total del inmueble es de ' },
        { text: formatMoneyFull(d.price?.total), bold: true },
        { text: '.' },
      ],
      (trans, lang) => [
        { text: 'The total sale price of the property is ' },
        { text: formatMoneyFull(d.price?.total, lang), bold: true },
        { text: '.' },
      ]
    );

    // Commission breakdown
    addBilingual(
      [
        { text: 'La comisión total que será abonada es de ' },
        { text: formatMoneyFull(d.commission?.totalCommission), bold: true },
        { text: ' más IVA 21% (€' },
        { text: v(d.commission?.firstPaymentIVA), bold: true },
        { text: ').' },
      ],
      (trans, lang) => [
        { text: 'The total commission to be paid is ' },
        { text: formatMoneyFull(d.commission?.totalCommission, lang), bold: true },
        { text: ' plus 21% VAT (€' },
        { text: v(d.commission?.firstPaymentIVA), bold: true },
        { text: ').' },
      ]
    );

    // Payment schedule
    addBilingual(
      [
        { text: 'Primera comisión (50% en arras): ' },
        { text: formatMoneyFull(d.commission?.firstPayment), bold: true },
        { text: ' + IVA €' },
        { text: v(d.commission?.firstPaymentIVA), bold: true },
      ],
      (trans, lang) => [
        { text: 'First commission (50% at arras): ' },
        { text: formatMoneyFull(d.commission?.firstPayment, lang), bold: true },
        { text: ' + VAT €' },
        { text: v(d.commission?.firstPaymentIVA), bold: true },
      ],
      200, 720
    );

    addBilingual(
      [
        { text: 'Segunda comisión (50% en notaría): ' },
        { text: formatMoneyFull(d.commission?.secondPayment), bold: true },
        { text: ' + IVA €' },
        { text: v(d.commission?.firstPaymentIVA), bold: true },
      ],
      (trans, lang) => [
        { text: 'Second commission (50% at notary): ' },
        { text: formatMoneyFull(d.commission?.secondPayment, lang), bold: true },
        { text: ' + VAT €' },
        { text: v(d.commission?.firstPaymentIVA), bold: true },
      ],
      200, 720
    );

    // Bank details
    addPara('Datos Bancarios para el Abono / Bank Details for Payment:', { bold: true, spacing: 200 });
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'IBAN: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankIban, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'SWIFT: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: 'CCRIES2A045', bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Banco: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankName, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Beneficiario: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankBeneficiary, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      indent: { left: 720 },
      spacing: { after: 200, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Concepto: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: 'Comision / Commission', bold: true, font: FONT, size: FONT_SIZE })],
    }));

    // Closing
    addBilingual(
      'Ambas partes leen el presente documento que contiene dos ejemplares idénticos y firman en prueba de conformidad.',
      (trans, lang) => 'Both parties read this document which contains two identical copies and sign in proof of agreement.',
      300
    );

  } else {
    // ========== RESERVATION-SPECIFIC CONTENT ==========
    // 1. PRIMERA — All parties + owners + capacity
    addBilingual(
      `1. ${esT.clause_1}.- ${esT.res_all_parties}`,
      (trans, lang) => `1. ${trans.clause_1}.- ${trans.res_all_parties}`,
      200
    );

    // sellerFull needed for later clauses
    const sellerFull = d.seller?.hasPartner && d.seller?.partner?.name
      ? `${sellerTitle} ${sellerName} y ${d.seller.partner.title === 'Dona' || d.seller.partner.title === 'Doña' ? 'Dña.' : 'D.'} ${v(d.seller.partner.name)}`
      : `${sellerTitle} ${sellerName}`;

    addBilingual(esT.res_capacity, (trans, lang) => trans.res_capacity, 200);

    // 2. SEGUNDA — Price + payments
    addBilingual(
      [
        { text: `2. ${esT.clause_2}.- ${esT.res_price_clause} ` }, { text: formatMoneyFull(d.price?.total), bold: true },
        { text: `, ${esT.res_furniture_not}, ${esT.res_excl_taxes}` },
      ],
      (trans, lang) => [
        { text: `2. ${trans.clause_2}.- ${trans.res_price_clause} ` }, { text: formatMoneyFull(d.price?.total, lang), bold: true },
        { text: `, ${trans.res_furniture_not}, ${trans.res_excl_taxes}` },
      ],
      200
    );

    addBilingual(esT.res_buyers_shall, (trans, lang) => trans.res_buyers_shall, 200);

    // Helper: split res_non_refundable text to bold "RESERVA NO REEMBOLSABLE" equivalents + "COSTA BLANCA LUXURY INVESTMENTS SL"
    const boldCBLI = (fullText) => {
      const cbli = 'COSTA BLANCA LUXURY INVESTMENTS SL';
      const segs = [];
      // Find the uppercase reservation fee phrase (between "como "/"as a "/"als " and the next space before "a la firma"/"upon"/"bij"/etc.)
      // Split on CBLI first
      const parts = fullText.split(cbli);
      if (parts.length === 2) {
        // In the first part, find uppercase phrases (RESERVA NO REEMBOLSABLE, NON-REFUNDABLE RESERVATION FEE, etc.)
        const p1 = parts[0];
        // Match any ALL-CAPS phrase of 2+ words (the reservation fee term)
        const capsMatch = p1.match(/([A-ZÁÉÍÓÚÑÜÖ\-]{2,}(?:\s+[A-ZÁÉÍÓÚÑÜÖ\-]{2,})+)/);
        if (capsMatch) {
          const idx = p1.indexOf(capsMatch[0]);
          segs.push({ text: p1.substring(0, idx) });
          segs.push({ text: capsMatch[0], bold: true });
          segs.push({ text: p1.substring(idx + capsMatch[0].length) });
        } else {
          segs.push({ text: p1 });
        }
        segs.push({ text: cbli, bold: true });
        segs.push({ text: parts[1] });
      } else {
        segs.push({ text: fullText });
      }
      return segs;
    };

    addBilingual(
      [
        { text: 'a) ' }, { text: formatMoneyFull(d.price?.reservation), bold: true },
        ...boldCBLI(` ${esT.res_non_refundable}`),
      ],
      (trans, lang) => [
        { text: 'a) ' }, { text: formatMoneyFull(d.price?.reservation, lang), bold: true },
        ...boldCBLI(` ${trans.res_non_refundable}`),
      ],
      200
    );

    // Bank details with CBLI defaults
    paragraphs.push(new Paragraph({
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'IBAN: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankIban, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Banco: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankName, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    paragraphs.push(new Paragraph({
      spacing: { after: 80, line: 240, lineRule: 'auto' },
      children: [new TextRun({ text: 'Beneficiario: ', font: FONT, size: FONT_SIZE }), new TextRun({ text: bankBeneficiary, bold: true, font: FONT, size: FONT_SIZE })],
    }));
    addPara(`${esT.res_concept} ${v(d.property?.ref)}`, { bold: true, spacing: 200 });

    // 3. TERCERA — Arras commitment
    addBilingual(
      [
        { text: `3. ${esT.clause_3}.- ${esT.res_arras_commit} ` }, { text: v(d.arrasSignDays), bold: true },
        { text: ` ${esT.res_calendar_days} ${esT.res_working_days} ` }, { text: formatMoneyFull(d.price?.arras), bold: true },
        { text: ` ${esT.res_to_seller} ${esT.res_as_arras}` },
      ],
      (trans, lang) => [
        { text: `3. ${trans.clause_3}.- ${trans.res_arras_commit} ` }, { text: v(d.arrasSignDays), bold: true },
        { text: ` ${trans.res_calendar_days} ${trans.res_working_days} ` }, { text: formatMoneyFull(d.price?.arras, lang), bold: true },
        { text: ` ${trans.res_to_seller} ${trans.res_as_arras}` },
      ],
      200
    );

    // 4. CUARTA — Max date
    addBilingual(
      [
        { text: `4. ${esT.clause_4}.- ${esT.res_max_date} ` }, { text: formatDate(d.price?.notaryDate, 'es'), bold: true },
        { text: '.' },
      ],
      (trans, lang) => [
        { text: `4. ${trans.clause_4}.- ${trans.res_max_date} ` }, { text: formatDate(d.price?.notaryDate, lang), bold: true },
        { text: '.' },
      ],
      200
    );

    // 5. QUINTA — Transfer free of charges
    addBilingual(
      `5. ${esT.clause_5}.- ${esT.res_transfer_free}`,
      (trans, lang) => `5. ${trans.clause_5}.- ${trans.res_transfer_free}`,
      200
    );

    // 6. SEXTA — CBLI role
    addBilingual(
      `6. ${esT.clause_6}.- ${esT.res_cbli_role}`,
      (trans, lang) => `6. ${trans.clause_6}.- ${trans.res_cbli_role}`,
      200
    );

    addBilingual(
      `7. ${esT.clause_7}.- ${esT.res_seller_fault}`,
      (trans, lang) => `7. ${trans.clause_7}.- ${trans.res_seller_fault}`,
      200
    );

    addBilingual(esT.res_seller_refund, (trans, lang) => trans.res_seller_refund, 200);

    addBilingual(
      `8. ${esT.clause_8}.- ${esT.res_withdraw_market}`,
      (trans, lang) => `8. ${trans.clause_8}.- ${trans.res_withdraw_market}`,
      200
    );

    addBilingual(esT.res_sole_purpose, (trans, lang) => trans.res_sole_purpose, 200);

    addBilingual(
      `9. ${esT.clause_9}.- ${esT.res_spanish_prevails}`,
      (trans, lang) => `9. ${trans.clause_9}.- ${trans.res_spanish_prevails}`,
      200
    );

    // Special conditions
    if (d.conditions && d.conditions !== '___') {
      addPara(`10. ${esT.clause_10}.- CONDICIONES ESPECIALES / SPECIAL CONDITIONS`, { bold: true, spacing: 200 });
      addPara(d.conditions, { spacing: 200 });
      if (isMultiLang && d.translatedConditions) {
        langEntries.forEach((entry) => {
          const tc = d.translatedConditions[entry.lang];
          if (tc) {
            addPara(tc, { italic: true, spacing: 200, color: LANG_COLORS[entry.lang] });
          }
        });
      }
    }

    addBilingual(esT.res_closing, (trans, lang) => trans.res_closing, 300);
  }

  // ========== SIGNATURE TABLE ==========
  paragraphs.push(new Paragraph({ children: [], spacing: { after: 300 } }));

  const noBorder = { style: BorderStyle.NONE };
  const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
  const bottomLine = { top: noBorder, bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, left: noBorder, right: noBorder };
  const cellMargins = { top: 40, bottom: 40, left: 80, right: 80 };

  // Build signature names
  const sellerSigName = d.seller?.hasPartner && d.seller?.partner?.name
    ? `${sellerName}\n${v(d.seller.partner.name)}`
    : sellerName;
  const buyerSigName = d.buyer?.hasPartner && d.buyer?.partner?.name
    ? `${buyerName}\n${v(d.buyer.partner.name)}`
    : buyerName;

  // Determine signature table headers based on contract type
  let sigCol1Label, sigCol1PartnerName, sigCol2Label, sigCol2PartnerName, sigCol3Label;
  if (d.type === 'commission') {
    sigCol1Label = 'VENDEDOR / SELLER';
    sigCol1PartnerName = d.seller?.hasPartner && d.seller?.partner?.name ? v(d.seller.partner.name) : null;
    sigCol2Label = 'COMPRADOR / BUYER';
    sigCol2PartnerName = d.buyer?.hasPartner && d.buyer?.partner?.name ? v(d.buyer.partner.name) : null;
    sigCol3Label = 'COSTA BLANCA LUXURY INVESTMENTS S.L.';
  } else {
    sigCol1Label = `${esT.seller_label} / ${isMultiLang ? langEntries[0].t.seller_label : 'SELLER'}`;
    sigCol1PartnerName = d.seller?.hasPartner && d.seller?.partner?.name ? v(d.seller.partner.name) : null;
    sigCol2Label = `${esT.buyer_label} / ${isMultiLang ? langEntries[0].t.buyer_label : 'BUYER'}`;
    sigCol2PartnerName = d.buyer?.hasPartner && d.buyer?.partner?.name ? v(d.buyer.partner.name) : null;
    sigCol3Label = 'INTERMEDIARIO';
  }

  const sigTable = new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [3008, 3009, 3009],
    rows: [
      // Header row: labels
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3008, type: WidthType.DXA },
            borders: noBorders,
            margins: cellMargins,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: sigCol1Label, bold: true, size: 20, color: BRAND.gold })],
            })],
          }),
          new TableCell({
            width: { size: 3009, type: WidthType.DXA },
            borders: noBorders,
            margins: cellMargins,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: sigCol2Label, bold: true, size: 20, color: BRAND.gold })],
            })],
          }),
          new TableCell({
            width: { size: 3009, type: WidthType.DXA },
            borders: noBorders,
            margins: cellMargins,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: sigCol3Label, bold: true, size: 20, color: BRAND.gold })],
            })],
          }),
        ],
      }),
      // Names row
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3008, type: WidthType.DXA },
            borders: noBorders,
            margins: cellMargins,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40 },
              children: [new TextRun({ text: sellerName, size: 18 })],
            }),
            ...(sigCol1PartnerName ? [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: sigCol1PartnerName, size: 18 })],
            })] : []),
            ],
          }),
          new TableCell({
            width: { size: 3009, type: WidthType.DXA },
            borders: noBorders,
            margins: cellMargins,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40 },
              children: [new TextRun({ text: buyerName, size: 18 })],
            }),
            ...(sigCol2PartnerName ? [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: sigCol2PartnerName, size: 18 })],
            })] : []),
            ],
          }),
          new TableCell({
            width: { size: 3009, type: WidthType.DXA },
            borders: noBorders,
            margins: cellMargins,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40 },
              children: [new TextRun({ text: 'COSTA BLANCA LUXURY', size: 18 }), new TextRun({ text: '\nINVESTMENTS SL', size: 18 })],
            })],
          }),
        ],
      }),
      // Signature lines row
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3008, type: WidthType.DXA },
            borders: bottomLine,
            margins: cellMargins,
            children: [new Paragraph({ spacing: { before: 600, after: 200 }, children: [] })],
          }),
          new TableCell({
            width: { size: 3009, type: WidthType.DXA },
            borders: bottomLine,
            margins: cellMargins,
            children: [new Paragraph({ spacing: { before: 600, after: 200 }, children: [] })],
          }),
          new TableCell({
            width: { size: 3009, type: WidthType.DXA },
            borders: bottomLine,
            margins: cellMargins,
            children: [new Paragraph({ spacing: { before: 600, after: 200 }, children: [] })],
          }),
        ],
      }),
    ],
  });

  paragraphs.push(sigTable);

  // ========== CREATE DOCUMENT ==========
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906,
            height: 16838,
          },
          margin: {
            top: 1440,
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children: paragraphs,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

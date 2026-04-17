import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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
    arras_title: "CONTRAT D'ARRHES",
    reservation_title: "CONTRAT DE RESERVATION",
    reunidos: "COMPARUTION",
    on_one_part: "D'une part",
    of_legal_age: "majeur(e)",
    of_nationality: "de nationalite",
    with_valid: "muni(e) de",
    number: "numero",
    and_nie: "et NIE numero",
    with_address: "avec domicile aux fins de notification a",
    hereinafter: "ci-apres denomme(e)",
    the_buyer: "L'ACHETEUR",
    the_seller: "LE VENDEUR",
    and_other_part: "Et d'autre part",
    both_parties_intro: "Les deux parties interviennent en leur propre nom et droit, se reconnaissant mutuellement la capacite suffisante pour octroyer le present contrat, et,",
    declare: "DECLARENT",
    declare_1: "Que la partie venderesse est proprietaire et interessee par la vente du bien immobilier suivant :",
    type_of_property: "TYPE DE PROPRIETE",
    located_in: "situe(e) a",
    registered_in: "inscrit(e) au Registre de la Propriete de",
    property_nr: "propriete no",
    volume: "Tome",
    book: "Livre",
    folio: "folio",
    cadastral_ref: "avec reference cadastrale",
    declare_2: "Que la partie acheteuse est interessee par l'acquisition du bien decrit dans la declaration I.",
    declare_3: "Les deux parties, dans leur propre interet, regissent le present accord par les stipulations suivantes,",
    clauses: "STIPULATIONS",
    first_arras: "s'engage a vendre a",
    who_agrees: "qui s'engage a acheter le bien decrit dans la declaration I, deja connu de la partie acheteuse, dans l'etat physique, technique, constructif, urbanistique et juridique qu'elle declare connaitre et accepter, libre d'hypotheques, charges, privileges, locataires ou occupants et avec tous les droits et usages, ainsi que toutes les quittances et impots correspondants payes a jour.",
    second_price: "Le prix du bien objet de la vente convenu par les deux parties est de",
    plus_taxes: "PLUS LES IMPOTS CORRESPONDANTS.",
    furniture_included: "Le bien sera transmis avec les meubles et appareils presents dans la propriete.",
    furniture_not_included: "Le mobilier n'est pas inclus dans la vente.",
    furniture_partial: "Mobilier inclus selon la liste d'inventaire separee.",
    amounts_paid: "Ces montants seront payes selon les modalites, delais et conditions suivants :",
    reservation_paid: "a ete verse en tant qu'acompte de reservation a l'intermediaire COSTA BLANCA LUXURY INVESTMENTS SL le",
    through_transfer: "par virement bancaire.",
    arras_to_pay: "a verser en tant qu'arrhes a la partie VENDERESSE par virement bancaire.",
    account: "Compte",
    bank: "Banque",
    beneficiary: "Beneficiaire",
    concept_arras: "Objet : Depot d'arrhes",
    transfer_effective: "Ce virement devra etre effectue sur le compte mentionne au plus tard le",
    or_before: "ou avant, le present document prenant alors plein effet.",
    arras_penitenciales: "Les montants susmentionnes ont le caractere d'arras penitenciales, conformement a l'article 1.454 du Code civil espagnol. Si l'acheteur manque a l'une des clauses du contrat, ne comparait pas a la signature de l'acte public ou ne paie pas le prix convenu, la vente sera resolue et l'acompte verse sera perdu au profit du vendeur. Si le vendeur manque a l'une des clauses du contrat ou ne comparait pas a l'octroi de l'acte public dans les conditions convenues, l'acheteur pourra choisir de resoudre l'achat, avec l'obligation du vendeur de payer le double du montant de l'acompte.",
    remaining_payment: "par virement bancaire au compte de la partie venderesse",
    concept_purchase: "Objet : Achat",
    at_signing: "a verser lors de la signature de l'acte public de vente devant le Notaire de",
    on_or_before: "au plus tard le",
    third_clause: "Le vendeur s'engage a ne pas ceder, grever ni louer le bien objet du present contrat a un tiers, jusqu'a l'expiration du delai mentionne ci-dessus, pour le paiement du prix et la formalisation et conversion ulterieures en acte public.",
    fourth_clause: "La partie acheteuse prendra en charge le paiement de l'impot sur les transmissions patrimoniales, les actes juridiques documentes et les frais notariaux et d'enregistrement decoulant de l'octroi de cet acte. La partie venderesse acquittera la Plus-value municipale (Plusvalia) si applicable.",
    fifth_clause_1: "La remise de la possession du bien a l'acheteur aura lieu lors de la signature de l'acte devant notaire.",
    fifth_clause_2: "La partie acheteuse assumera, a compter de la date de remise de la possession du bien, toutes les depenses (electricite, eau, etc.) et impots inherents a la propriete.",
    fifth_clause_3: "Toutes les depenses et impots inherents a la propriete anterieurs a la remise de la possession seront a la charge de la partie venderesse.",
    fifth_clause_4: "La partie venderesse declare expressement que tous les services du logement (electricite, eau, gaz, etc.) fonctionnent correctement et s'oblige a les maintenir et a les payer jusqu'a la remise de la possession du bien.",
    fifth_clause_5: "L'IBI et la taxe d'ordures menageres de l'annee en cours seront payes proportionnellement par les deux parties.",
    sixth_clause: "Les parties renoncent expressement a tout autre for juridique et se soumettent a la juridiction et competence des Tribunaux de Benidorm pour resoudre tout litige, divergence, question ou reclamation decoulant de l'execution ou de l'interpretation du present Contrat.",
    seventh_clause: "En cas de desaccord ou de divergence entre les parties sur l'interpretation du present contrat, la version en langue espagnole prevaudra sur la version traduite.",
    closing: "Et en preuve de conformite avec ce qui precede, les deux parties signent le present document ou par e-mail, en un seul exemplaire, au lieu et a la date indiques ci-dessus.",
    seller_label: "VENDEUR",
    buyer_label: "ACHETEUR",
    res_all_parties: "Toutes les parties interviennent en leur propre nom et droit, convenant par le present acte de signer ce contrat de reservation concernant le bien immobilier identifie ci-dessous.",
    res_owners: "sont proprietaires de la totalite du bien detaille ci-dessous :",
    res_capacity: "Les parties se reconnaissent mutuellement la capacite juridique necessaire pour s'engager dans le present contrat.",
    res_price_clause: "Le prix de vente du bien est de",
    res_furniture_not: "mobilier non inclus",
    res_excl_taxes: "(hors taxes).",
    res_buyers_shall: "Les Acheteurs paieront ce montant aux Vendeurs au moment de l'execution de l'acte public de vente, en deduisant les paiements precedemment effectues comme detaille ci-dessous :",
    res_non_refundable: "qui sera verse comme FRAIS DE RESERVATION NON REMBOURSABLE lors de la signature du present Accord, sera verse au nom de COSTA BLANCA LUXURY INVESTMENTS SL sur le compte indique ci-dessous, et cette somme restera en depot de ladite societe jusqu'a la signature du contrat d'arrhes par les deux parties, moment auquel elle sera transferee sur le compte du vendeur :",
    res_concept: "Objet : Reservation Ref.",
    res_arras_commit: "Les deux parties s'engagent a signer un contrat d'arrhes dans un delai de",
    res_calendar_days: "jours calendaires a compter de la date de signature du present document par les deux parties, avec livraison dans un delai de",
    res_working_days: "jours ouvrables apres la signature dudit document, de",
    res_to_seller: "a la partie venderesse",
    res_as_arras: "en tant qu'arras penitenciales, qui seront considerees comme partie integrante du paiement du bien. Le solde du prix sera paye au moment de l'execution de l'acte public et de la remise de la possession.",
    res_max_date: "Dans le contrat d'arrhes susmentionne, la date limite pour la signature de l'acte, la remise de la possession et le paiement integral du prix convenu sera fixee au",
    res_transfer_free: "Le bien sera transfere libre de charges, baux, occupants et servitudes urbanistiques. Le bien sera livre a jour du paiement des impots, taxes et frais associes, les Vendeurs etant les proprietaires inscrits en plein droit, sans limitations ni restrictions pour sa transmission.",
    res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL intervient dans cette transaction uniquement en tant qu'intermediaire immobilier et depositaire du montant de la reservation et ne sera pas responsable du statut juridique, urbanistique ou technique du bien, dont la verification incombe aux parties.",
    res_seller_fault: "Dans le cas ou la vente ne pourrait etre formalisee exclusivement pour des raisons imputables au Vendeur, telles que l'existence d'irregularites juridiques affectant le bien ou l'impossibilite d'obtenir la documentation legalement requise pour l'execution de l'acte public de vente devant Notaire, l'Acheteur aura le droit de se retirer de la transaction sans penalite ni obligation financiere.",
    res_seller_refund: "Dans ce cas, le Vendeur sera tenu de rembourser integralement a l'Acheteur tous les montants verses jusqu'a ce moment au titre du prix d'achat.",
    res_withdraw_market: "Une fois ce contrat signe par les deux parties, le vendeur sera oblige de retirer le bien du marche et de notifier tout autre Agent Immobilier ayant recu mandat de vente, en procedant le cas echeant au retrait de toute affiche publicitaire de vente.",
    res_sole_purpose: "Les parties conviennent que le present Accord a pour unique objet de reserver le bien et de le retirer temporairement du marche et ne constitue pas un contrat prive d'achat ni des arrhes penitentielles, qui seront, le cas echeant, reglees dans le contrat d'arrhes ulterieur.",
    res_spanish_prevails: "En cas de desaccord sur l'interpretation du present contrat, la version espagnole prevaudra.",
    res_closing: "Et en preuve de conformite, les deux parties signent le present document, au lieu et a la date indiques en en-tete.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "PREMIERE", clause_2: "DEUXIEME", clause_3: "TROISIEME", clause_4: "QUATRIEME",
    clause_5: "CINQUIEME", clause_6: "SIXIEME", clause_7: "SEPTIEME", clause_8: "HUITIEME",
    clause_9: "NEUVIEME", clause_10: "DIXIEME",
  },
  de: {
    arras_title: "ANZAHLUNGSVERTRAG (ARRAS)",
    reservation_title: "RESERVIERUNGSVERTRAG",
    reunidos: "VERSAMMELT",
    on_one_part: "Einerseits",
    of_legal_age: "volljaehrig",
    of_nationality: "mit Staatsangehoerigkeit",
    with_valid: "mit gueltigem/gueltiger",
    number: "Nummer",
    and_nie: "und NIE-Nummer",
    with_address: "mit Zustelladresse",
    hereinafter: "im Folgenden",
    the_buyer: "DER KAEUFER",
    the_seller: "DER VERKAEUFER",
    and_other_part: "Und andererseits",
    both_parties_intro: "Beide Parteien handeln in eigenem Namen und Recht und erkennen sich gegenseitig die ausreichende Befugnis zur Erteilung dieses Vertrages an, und",
    declare: "ERKLAEREN",
    declare_1: "Dass die verkaufende Partei Eigentuemer ist und am Verkauf der folgenden Immobilie interessiert ist:",
    type_of_property: "ART DER IMMOBILIE",
    located_in: "gelegen in",
    registered_in: "eingetragen im Eigentumsregister von",
    property_nr: "mit Immobilien-Nr.",
    volume: "Band",
    book: "Buch",
    folio: "Folio",
    cadastral_ref: "mit Katasterreferenz",
    declare_2: "Dass die kaufende Partei am Erwerb der in Erklaerung I beschriebenen Immobilie interessiert ist.",
    declare_3: "Beide Parteien regeln in ihrem eigenen Interesse die vorliegende Vereinbarung durch die folgenden,",
    clauses: "KLAUSELN",
    first_arras: "verpflichtet sich zu verkaufen an",
    who_agrees: "der/die sich zum Kauf der in Erklaerung I beschriebenen Immobilie verpflichtet, die der kaufenden Partei bereits bekannt ist, in dem physischen, technischen, konstruktiven, staedtebaulichen und rechtlichen Zustand, den sie zu kennen erklaert und akzeptiert, frei von Hypotheken, Belastungen, Pfandrechten, Mietern oder Bewohnern und mit allen Rechten und Nutzungen, sowie alle Quittungen und entsprechenden Steuern bis zum heutigen Tag bezahlt.",
    second_price: "Der Preis der Immobilie Gegenstand des Verkaufs, vereinbart von beiden Parteien, betraegt",
    plus_taxes: "PLUS DIE ENTSPRECHENDEN STEUERN.",
    furniture_included: "Die Immobilie wird mit den in der Immobilie vorhandenen Moebeln und Geraeten uebertragen.",
    furniture_not_included: "Moebel sind nicht in dem Verkauf enthalten.",
    furniture_partial: "Moebel enthalten nach separater Inventarliste.",
    amounts_paid: "Diese Betraege werden in folgender Form, Fristen und Bedingungen gezahlt:",
    reservation_paid: "wurde als Reservierungskaution an die Intermediarpartei COSTA BLANCA LUXURY INVESTMENTS SL am gezahlt",
    through_transfer: "durch Bankueberweisung.",
    arras_to_pay: "als Kaution an die VERKAEUFERPARTEI durch Bankueberweisung zu zahlen.",
    account: "Konto",
    bank: "Bank",
    beneficiary: "Beguenstigter",
    concept_arras: "Konzept: Kautionskaution",
    transfer_effective: "Diese Ueberweisung muss auf dem angegebenen Konto am ausgefuehrt werden",
    or_before: "oder davor, wodurch dieses Dokument vollstaendig wirksam wird.",
    arras_penitenciales: "Die oben erwahnten Betraege haben den Charakter von arras penitenciales, gemaess Artikel 1.454 des spanischen BGB. Wenn der Kaeufer eine Klausel des Vertrags verletzt, nicht beim Unterzeichnungsakt der oeffentlichen Urkunde erscheint oder den vereinbarten Preis nicht zahlt, wird der Verkauf aufgeloest und die gezahlte Kaution wird zugunsten des Verkaeufers verloren. Wenn der Verkaeufer eine Klausel des Vertrags verletzt oder nicht bei der Erteilung der oeffentlichen Urkunde unter den vereinbarten Bedingungen erscheint, kann der Kaeufer den Kauf auflosen, mit der Verpflichtung des Verkaeufers, das Doppelte des Kautionsbetrags zu zahlen.",
    remaining_payment: "durch Bankueberweisung auf das Konto des Verkaeufers",
    concept_purchase: "Konzept: Kauf",
    at_signing: "zahlbar bei der Unterzeichnung der oeffentlichen Kaufurkunde vor dem Notar von",
    on_or_before: "am oder vor",
    third_clause: "Der Verkaeufer erklaert sich bereit, die Immobilie Gegenstand dieses Vertrags bis zum Ablauf der oben angegebenen Frist nicht an Dritte abzutreten, zu belasten oder zu vermieten.",
    fourth_clause: "Die kaufende Partei traegt die Kosten der Grunderwerbsteuer, der Grundsteuer, der Notargebueuhren und der Grundbuchamtgebuehren, die sich aus der Erteilung dieser Urkunde ergeben. Die verkaufende Partei zahlt die Grundsteuer (Plusvalia), falls zutreffend.",
    fifth_clause_1: "Die Uebergabe des Besitzes der Immobilie an den Kaeufer findet bei der Unterzeichnung der Urkunde vor einem Notar statt.",
    fifth_clause_2: "Die kaufende Partei zahlt ab dem Datum der Uebergabe des Besitzes der Immobilie alle Kosten (Strom, Wasser usw.) und Steuern, die dem Eigentum innewohnen.",
    fifth_clause_3: "Alle Kosten und Steuern, die sich vor der Uebergabe des Besitzes aus dem Eigentum ergeben, werden von der verkaufenden Partei bezahlt.",
    fifth_clause_4: "Die verkaufende Partei erklaert ausdruecklich, dass alle Wohnleistungen (Elektrizitaet, Wasser, Gas usw.) ordnungsgemaess funktionieren und verpflichtet sich, bis zur Uebergabe des Besitzes der Immobilie Instandhaltung und Zahlung zu leisten.",
    fifth_clause_5: "Die IBI und die Muellgebueuhren fuer das laufende Jahr werden von beiden Parteien anteilig gezahlt.",
    sixth_clause: "Die Parteien verzichten ausdruecklich auf ihre eigenen Gerichtsbarkeiten und erklaeren sich ausdruecklich damit einverstanden, alle aus der Ausfuehrung oder Auslegung dieses Vertrags resultierenden Rechtsstreite, Unstimmigkeiten, Fragen oder Ansprueche den Gerichten von Benidorm zu unterbreiten.",
    seventh_clause: "Im Falle von Nichteinigung oder Unstimmigkeiten zwischen den Parteien ueber die Auslegung dieses Vertrags hat die spanische Sprache oder Version Vorrang vor der uebersetzen Version.",
    closing: "Zum Beweis der Uebereinstimmung mit dem Vorstehenden unterzeichnen beide Parteien dieses Dokument oder per E-Mail zu einem einzigen Zweck am angegebenen Ort und Datum.",
    seller_label: "VERKAEUFER",
    buyer_label: "KAEUFER",
    res_all_parties: "Alle Parteien handeln in ihrem eigenen Namen und Recht und erklaeren sich hiermit bereit, diese Reservierungsvereinbarung in Bezug auf die Immobilie, die nachstehend identifiziert ist, zu unterzeichnen.",
    res_owners: "sind Eigentuemer der vollstaendigen Immobilie im Detail nachstehend aufgefuehrt:",
    res_capacity: "Die Parteien erkennen gegenseitig an, dass sie in ihrer jeweiligen Funktion die erforderliche Rechtsfaehigkeit haben, um sich selbst an diese Vertragsvereinbarung zu binden.",
    res_price_clause: "Der Verkaufspreis der Immobilie betraegt",
    res_furniture_not: "Moebel nicht inbegriffen",
    res_excl_taxes: "(ohne Steuern).",
    res_buyers_shall: "Die Kaeufer zahlen diesen Betrag an die Verkaeufer zum Zeitpunkt der Ausfuehrung der oeffentlichen Kaufurkunde, abzueglich bereits geleisteter Zahlungen wie nachstehend erlaeutert:",
    res_non_refundable: "wird bei der Unterzeichnung dieser Vereinbarung als nicht erstattbare Reservierungsgebuehr gezahlt, wird auf den Namen von COSTA BLANCA LUXURY INVESTMENTS SL auf das unten angegebene Konto eingezahlt, und dieser Betrag bleibt bis zur Unterzeichnung des Kautionsvertrags durch beide Parteien auf dem Depot dieser Gesellschaft, zu welchem Zeitpunkt er auf das Konto des Verkaeufers uebertragen wird:",
    res_concept: "Konzept: Reservierung Ref.",
    res_arras_commit: "Beide Parteien verpflichten sich, innerhalb von",
    res_calendar_days: "Kalendertagen ab dem Datum der Unterzeichnung dieses Dokuments durch beide Parteien einen Kautionsvertrag zu unterzeichnen, mit Lieferung innerhalb von",
    res_working_days: "Werktagen nach der Unterzeichnung des genannten Dokuments von",
    res_to_seller: "an die verkaufende Partei",
    res_as_arras: "als arras penitenciales, das als Teil der Zahlung fuer die Immobilie gilt. Der Rest des Preises wird zum Zeitpunkt der Ausfuehrung der oeffentlichen Urkunde und Uebergabe des Besitzes gezahlt.",
    res_max_date: "In dem oben erwahnten Kautionsvertrag wird das maximale Datum fuer die Unterzeichnung der Urkunde, Uebergabe des Besitzes und vollstaendige Zahlung des vereinbarten Preises festgelegt auf",
    res_transfer_free: "Die Immobilie wird frei von Belastungen, Pachtvertraegen, Bewohnern und staedtebaulichen Belastungen uebertragen. Die Immobilie wird mit der Zahlung von Steuern, Abgaben und Gebuehren auf den neuesten Stand gebracht, wobei die Verkaeufer die eingetragenen Eigentuemer mit voller Rechtsgewaeltigung sind, ohne Einschraenkungen oder Beschraenkungen fuer deren Uebertragung.",
    res_cbli_role: "COSTA BLANCA LUXURY INVESTMENTS SL handelt bei dieser Transaktion ausschliesslich als Immobilienmakler und Inhaber des Reservierungsbetrags und ist nicht verantwortlich fuer den rechtlichen, staedtebaulichen oder technischen Status der Immobilie, deren Pruefung den Parteien obliegt.",
    res_seller_fault: "Falls der Kauf ausschliesslich aus Gruenden, die dem Verkaeufer zuzurechnen sind, nicht formalisiert werden kann, beispielsweise aufgrund von Rechtsunregelmaessigkeiten, die die Immobilie betreffen, oder der Unmoeglichkeit, die fuer die Ausfuehrung der oeffentlichen Kaufurkunde erforderliche Dokumentation zu erhalten, hat der Kaeufer das Recht, sich aus der Transaktion zurueckzuziehen, ohne Geldbuße oder finanzielle Verpflichtung.",
    res_seller_refund: "In diesem Fall ist der Verkaeufer verpflichtet, alle bis zu diesem Zeitpunkt vom Kaeufer gezahlten Betraege, die auf den Kaufpreis anfallen, vollstaendig zurueckzuerstatten.",
    res_withdraw_market: "Sobald dieser Vertrag von beiden Parteien unterzeichnet ist, ist der Verkaeufer verpflichtet, die Immobilie vom Markt zu nehmen und alle anderen Immobilienmakler, die einen Verkaufsauftrag erhalten haben, zu benachrichtigen, wobei gegebenenfalls mit der sofortigen Entfernung aller Verkaufsplakate fortgefahren wird.",
    res_sole_purpose: "Die Parteien sind sich einig, dass diese Vereinbarung ausschliesslich dem Zweck dient, die Immobilie zu reservieren und sie vorlaeufig vom Markt zu nehmen, und keinen privaten Kaufvertrag oder Kautionskaution darstellt, die gegebenenfalls in einem spaeterer Kautionsvertrag geregelt werden.",
    res_spanish_prevails: "Im Falle von Unstimmigkeiten bei der Auslegung dieses Vertrags hat die spanische Fassung Vorrang.",
    res_closing: "Zum Beweis der Uebereinstimmung unterzeichnen beide Parteien dieses Dokument am Ort und Datum, die in der Kopfzeile angegeben sind.",
    res_cbli_label: "COSTA BLANCA LUXURY INVESTMENTS SL",
    clause_1: "ERSTE", clause_2: "ZWEITE", clause_3: "DRITTE", clause_4: "VIERTE",
    clause_5: "FÜNFTE", clause_6: "SECHSTE", clause_7: "SIEBTE", clause_8: "ACHTE",
    clause_9: "NEUNTE", clause_10: "ZEHNTE",
  },
};

// ============ UTILITY FUNCTIONS ============
function v(val) {
  return val || '___';
}

function formatMoney(amount, lang) {
  if (!amount) return '___';
  const num = Number(amount);
  const formatted = parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const words = lang ? numberToWords(Math.floor(num), lang) : numberToSpanishWords(Math.floor(num));
  const currency = lang && lang !== 'es' ? 'EUROS' : 'EUROS';
  return words ? `${words} ${currency} (${formatted}€)` : `${formatted}€`;
}

function formatDate(dateStr, lang) {
  if (!dateStr) return '___';
  lang = lang || 'es';
  const months = {
    es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
    fr: ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'],
    de: ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  };
  let day, month, year;
  // Handle DD/MM/YYYY format (European)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  }
  // Handle YYYY-MM-DD format (ISO)
  else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  }
  // Fallback: try native Date parsing
  else {
    const date = new Date(dateStr);
    day = date.getDate();
    month = date.getMonth();
    year = date.getFullYear();
  }
  if (isNaN(day) || isNaN(month) || isNaN(year)) return dateStr;
  const langMonths = months[lang] || months.es;
  const monthName = langMonths[month];
  if (lang === 'es') return `${day} de ${monthName} de ${year}`;
  if (lang === 'en') return `${day} of ${monthName} of ${year}`;
  if (lang === 'de') return `${day}. ${monthName} ${year}`;
  return `${day} ${monthName} ${year}`;
}

// ============ NATIONALITY TRANSLATIONS ============
const NATIONALITY_TRANSLATIONS = {
  en: { española: "Spanish", inglesa: "British", italiana: "Italian", alemana: "German", francesa: "French", rusa: "Russian", holandesa: "Dutch", noruega: "Norwegian", belga: "Belgian", sueca: "Swedish", estadounidense: "American", canadiense: "Canadian", irlandesa: "Irish", checa: "Czech" },
  nl: { española: "Spaans", inglesa: "Brits", italiana: "Italiaans", alemana: "Duits", francesa: "Frans", rusa: "Russisch", holandesa: "Nederlands", noruega: "Noors", belga: "Belgisch", sueca: "Zweeds", estadounidense: "Amerikaans", canadiense: "Canadees", irlandesa: "Iers", checa: "Tsjechisch" },
  fr: { española: "espagnole", inglesa: "britannique", italiana: "italienne", alemana: "allemande", francesa: "française", rusa: "russe", holandesa: "néerlandaise", noruega: "norvégienne", belga: "belge", sueca: "suédoise", estadounidense: "américaine", canadiense: "canadienne", irlandesa: "irlandaise", checa: "tchèque" },
  de: { española: "spanisch", inglesa: "britisch", italiana: "italienisch", alemana: "deutsch", francesa: "französisch", rusa: "russisch", holandesa: "niederländisch", noruega: "norwegisch", belga: "belgisch", sueca: "schwedisch", estadounidense: "amerikanisch", canadiense: "kanadisch", irlandesa: "irisch", checa: "tschechisch" },
  ru: { española: "ispanskaya", inglesa: "britanskaya", italiana: "italyanskaya", alemana: "nemetskaya", francesa: "frantsuzskaya", rusa: "russkaya", holandesa: "niderlandskaya", noruega: "norvezhskaya", belga: "belgiyskaya", sueca: "shvedskaya", estadounidense: "amerikanskaya", canadiense: "kanadskaya", irlandesa: "irlandskaya", checa: "cheshskaya" },
};

function translateNat(nationality, lang) {
  if (!lang || lang === 'es') return nationality || '___';
  const key = (nationality || '').toLowerCase();
  return NATIONALITY_TRANSLATIONS[lang]?.[key] || nationality || '___';
}

function setFont(doc, bold, italic) {
  if (bold && italic) {
    doc.font('Helvetica-BoldOblique');
  } else if (bold) {
    doc.font('Helvetica-Bold');
  } else if (italic) {
    doc.font('Helvetica-Oblique');
  } else {
    doc.font('Helvetica');
  }
}

function writePara(doc, text, opts = {}) {
  const { bold, italic, underline, align, fontSize, indent, spacingAfter } = opts;
  setFont(doc, bold, italic);
  if (fontSize) doc.fontSize(fontSize);
  const options = { align: align || 'left', underline };
  if (indent) options.indent = indent;
  doc.text(text, options);
  const finalSpacing = spacingAfter !== undefined ? spacingAfter : 10;
  if (finalSpacing) doc.moveDown(finalSpacing / 12); // rough approximation
  setFont(doc, false, false);
  doc.fontSize(11);
}

function writeSegments(doc, segments, opts = {}) {
  const { bold, italic, underline, align, fontSize, indent, spacingAfter } = opts;
  setFont(doc, bold, italic);
  if (fontSize) doc.fontSize(fontSize);
  const options = { align: align || 'left', underline, continued: false };
  if (indent) options.indent = indent;

  segments.forEach((seg, idx) => {
    setFont(doc, seg.bold, seg.italic);
    options.continued = idx < segments.length - 1;
    doc.text(seg.text, options);
  });

  if (spacingAfter) doc.moveDown(spacingAfter / 12);
  setFont(doc, false, false);
  doc.fontSize(11);
}

// CBLI default bank details
const CBLI_BANK = {
  iban: 'ES21 0081 0569 4100 0207 4720',
  bankName: 'Banco Sabadell',
  beneficiary: 'COSTA BLANCA LUXURY INVESTMENTS SL',
};

const LANG_COLORS = {
  en: '#0000CC',  // Blue
  nl: '#006600',  // Green
  fr: '#990099',  // Purple
  de: '#CC6600',  // Orange
  ru: '#CC0000',  // Red
};

// Write multilingual block: Spanish paragraph, then each translation in its color
// transTextOrFn can be:
//   - a string or segments array (single-language legacy)
//   - a function (t, lang) => string|segments (multi-language)
function bilingual(doc, esText, transTextOrFn, esOpts = {}, transOpts = {}) {
  const isMulti = doc._langEntries && doc._langEntries.length > 0;
  // Spanish
  if (typeof esText === 'string') {
    writePara(doc, esText, { spacingAfter: doc._spanishOnly ? 12 : 4, ...esOpts });
  } else {
    writeSegments(doc, esText, { spacingAfter: doc._spanishOnly ? 12 : 4, ...esOpts });
  }
  // Skip translations if Spanish-only
  if (doc._spanishOnly) return;

  if (isMulti && typeof transTextOrFn === 'function') {
    // Multi-language: render each translation in its color
    doc._langEntries.forEach((entry, idx) => {
      const isLast = idx === doc._langEntries.length - 1;
      const color = LANG_COLORS[entry.lang] || '#333333';
      const transText = transTextOrFn(entry.t, entry.lang);
      doc.fillColor(color);
      if (typeof transText === 'string') {
        writePara(doc, transText, { italic: true, spacingAfter: isLast ? 14 : 4, ...transOpts });
      } else {
        const italicSegments = transText.map(s => ({ ...s, italic: true }));
        writeSegments(doc, italicSegments, { spacingAfter: isLast ? 14 : 4, ...transOpts });
      }
      doc.fillColor('#000000');
    });
  } else {
    // Single language fallback
    const transText = typeof transTextOrFn === 'function' ? transTextOrFn(doc._langEntries?.[0]?.t || {}, doc._langEntries?.[0]?.lang || 'en') : transTextOrFn;
    const color = doc._langEntries?.[0] ? (LANG_COLORS[doc._langEntries[0].lang] || '#333333') : '#333333';
    doc.fillColor(color);
    if (typeof transText === 'string') {
      writePara(doc, transText, { italic: true, spacingAfter: 14, ...transOpts });
    } else {
      const italicSegments = transText.map(s => ({ ...s, italic: true }));
      writeSegments(doc, italicSegments, { spacingAfter: 14, ...transOpts });
    }
    doc.fillColor('#000000');
  }
}

// ============ PROPERTY LINE HELPERS ============
const hasVal = (val) => val && val.trim() && val.trim() !== '___';
function buildPropLine(type, address, registry, finca, tomo, libro, folio, catastral, ref) {
  let line = `- ${v(type)}`;
  if (ref && hasVal(ref)) line += `, Ref. ${ref.trim()}`;
  if (hasVal(address)) line += `, sito en ${address.trim()}`;
  if (hasVal(registry)) line += `, inscrito en el Registro de la Propiedad de ${registry.trim()}`;
  if (hasVal(finca)) line += `, con finca nr. ${finca.trim()}`;
  if (hasVal(tomo)) line += `, Tomo ${tomo.trim()}`;
  if (hasVal(libro)) line += `, Libro ${libro.trim()}`;
  if (hasVal(folio)) line += `, folio ${folio.trim()}`;
  if (hasVal(catastral)) line += `, con referencia catastral numero ${catastral.trim()}`;
  line += '.';
  return line;
}

// ============ BUILD ARRAS CONTRACT ============
function buildArrasContract(doc, d, t) {
  const sellerTitle = v(d.seller?.title);
  const sellerName = v(d.seller?.name);
  const buyerTitle = v(d.buyer?.title);
  const buyerName = v(d.buyer?.name);
  const sellerTitleTrans = d.seller?.title === 'Dona' ? 'Mrs.' : 'Mr.';
  const buyerTitleTrans = d.buyer?.title === 'Dona' ? 'Mrs.' : 'Mr.';

  // Header image
  if (doc._headerImage) {
    // Image is 1348x316 (4.27:1). Use proportional sizing
    doc.image(doc._headerImage, 50, 30, { width: 495, height: 116 });
    doc.moveDown(6);
  }

  // Title — Spanish only, not translated
  doc.fillColor('#000000');
  writePara(doc, 'CONTRATO DE ARRAS', { bold: true, fontSize: 14, align: 'center', spacingAfter: 14 });

  // Date & place — Spanish only, not translated
  writePara(doc, `En ${v(d.city)} a ${formatDate(d.date, 'es')}`, { spacingAfter: 10 });

  // REUNIDOS — Spanish only, not translated
  doc.fillColor('#000000');
  writePara(doc, 'REUNIDOS', { bold: true, underline: true, align: 'center', spacingAfter: 10 });

  // Seller (with partner combined if present)
  if (d.seller?.hasPartner && d.seller?.partner?.name) {
    const pt = d.seller.partner;
    const ptTitle = v(pt.title);
    const ptTitleTrans = pt.title === 'Dona' ? 'Mrs.' : 'Mr.';
    bilingual(doc,
      [
        { text: 'De, una parte ' },
        { text: `${sellerTitle} ${sellerName}`, bold: true },
        { text: ' y ' },
        { text: `${ptTitle} ${v(pt.name)}`, bold: true },
        { text: `, mayores de edad, con nacionalidad ${v(d.seller?.nationality)} e ${v(pt.nationality)}, provistos de ${v(d.seller?.idType)} vigente numero ${v(d.seller?.idNumber)} y ${v(pt.idType)} numero ${v(pt.idNumber)}, con direccion en ${v(d.seller?.address)}, en adelante ` },
        { text: 'EL VENDEDOR.', bold: true },
      ],
      (t, lang) => `${t.on_one_part} ${sellerTitleTrans} ${sellerName} and ${ptTitleTrans} ${v(pt.name)}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.seller?.nationality, lang)} and ${translateNat(pt.nationality, lang)}, ${t.with_valid} ${v(d.seller?.idType)} ${t.number} ${v(d.seller?.idNumber)} and ${v(pt.idType)} ${t.number} ${v(pt.idNumber)}, ${t.with_address} ${v(d.seller?.address)}, ${t.hereinafter} ${t.the_seller}.`
    );
  } else {
    bilingual(doc,
      [
        { text: 'De, una parte ' },
        { text: `${sellerTitle} ${sellerName}`, bold: true },
        { text: `, mayor de edad, de nacionalidad ${v(d.seller?.nationality)}, provisto de ${v(d.seller?.idType)} vigente numero ${v(d.seller?.idNumber)}, con direccion en ${v(d.seller?.address)}, en adelante ` },
        { text: 'EL VENDEDOR.', bold: true },
      ],
      (t, lang) => `${t.on_one_part} ${sellerTitleTrans} ${sellerName}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.seller?.nationality, lang)}, ${t.with_valid} ${v(d.seller?.idType)} ${t.number} ${v(d.seller?.idNumber)}, ${t.with_address} ${v(d.seller?.address)}, ${t.hereinafter} ${t.the_seller}.`
    );
  }

  // Buyer (with partner combined if present)
  if (d.buyer?.hasPartner && d.buyer?.partner?.name) {
    const pt = d.buyer.partner;
    const ptTitle = v(pt.title);
    const ptTitleTrans = pt.title === 'Dona' ? 'Mrs.' : 'Mr.';
    bilingual(doc,
      [
        { text: 'Y, de otra parte ' },
        { text: `${buyerTitle} ${buyerName}`, bold: true },
        { text: ' y ' },
        { text: `${ptTitle} ${v(pt.name)}`, bold: true },
        { text: `, mayores de edad, con nacionalidad ${v(d.buyer?.nationality)} e ${v(pt.nationality)}, provistos de ${v(d.buyer?.idType)} numero ${v(d.buyer?.idNumber)} y ${v(pt.idType)} numero ${v(pt.idNumber)}, con domicilio a efectos de notificaciones en ${v(d.buyer?.address)}, en adelante ` },
        { text: 'EL COMPRADOR.', bold: true },
      ],
      (t, lang) => `${t.and_other_part}, ${buyerTitleTrans} ${buyerName} and ${ptTitleTrans} ${v(pt.name)}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.buyer?.nationality, lang)} and ${translateNat(pt.nationality, lang)}, ${t.with_valid} ${v(d.buyer?.idType)} ${t.number} ${v(d.buyer?.idNumber)} and ${v(pt.idType)} ${t.number} ${v(pt.idNumber)}, ${t.with_address} ${v(d.buyer?.address)}, ${t.hereinafter} ${t.the_buyer}.`
    );
  } else {
    bilingual(doc,
      [
        { text: 'Y, de otra parte ' },
        { text: `${buyerTitle} ${buyerName}`, bold: true },
        { text: `, mayor de edad, con nacionalidad ${v(d.buyer?.nationality)}, provisto de ${v(d.buyer?.idType)} numero ${v(d.buyer?.idNumber)}, con domicilio a efectos de notificaciones en ${v(d.buyer?.address)}, en adelante ` },
        { text: 'EL COMPRADOR.', bold: true },
      ],
      (t, lang) => `${t.and_other_part}, ${buyerTitleTrans} ${buyerName}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.buyer?.nationality, lang)}, ${t.with_valid} ${v(d.buyer?.idType)} ${t.number} ${v(d.buyer?.idNumber)}, ${t.with_address} ${v(d.buyer?.address)}, ${t.hereinafter} ${t.the_buyer}.`
    );
  }

  // Both parties clause
  bilingual(doc,
    'Ambas partes intervienen en su propio nombre y derecho, reconociendose mutuamente con capacidad suficiente para otorgar el presente contrato de arras, y,',
    (t, lang) => t.both_parties_intro
  );

  // EXPONEN — Spanish only, not translated
  doc.fillColor('#000000');
  writePara(doc, 'EXPONEN', { bold: true, underline: true, align: 'center', spacingAfter: 10 });

  // Declaration I - Property
  bilingual(doc,
    'I. Que la parte vendedora es propietaria y esta interesada en la venta de la siguiente finca:',
    (t, lang) => `I. ${t.declare_1}`
  );

  // Property as indented list with dash, skip empty fields
  writePara(doc, buildPropLine(d.property?.type, d.property?.address, d.property?.registry, d.property?.finca, d.property?.tomo, d.property?.libro, d.property?.folio, d.property?.catastral, d.property?.ref), { bold: true, indent: 36, spacingAfter: 6 });

  // Extra properties (garage/storage) — Spanish only, indented list
  if (d.extraProperties) {
    d.extraProperties.forEach(ep => {
      if (ep.enabled) {
        writePara(doc, buildPropLine(ep.type, null, null, ep.finca, ep.tomo, ep.libro, ep.folio, ep.catastral, null), { bold: true, indent: 36, spacingAfter: 6 });
      }
    });
  }

  // Declaration II
  bilingual(doc,
    'II. Que la parte compradora, esta interesada en la adquisicion de la finca descrita en el expositivo anterior.',
    (t, lang) => `II. ${t.declare_2}`
  );

  // Declaration III
  bilingual(doc,
    'III. Ambas partes en su propio interes, regulan el presente contrato de arras mediante las siguientes,',
    (t, lang) => `III. ${t.declare_3}`
  );

  // ESTIPULACIONES — Spanish only, not translated
  writePara(doc, 'ESTIPULACIONES', { bold: true, underline: true, align: 'center', spacingAfter: 10 });

  // PRIMERA - Sale commitment
  const sellerFullEs = d.seller?.hasPartner && d.seller?.partner?.name
    ? [
        { text: '1. PRIMERA.- ', bold: true },
        { text: `${sellerTitle} ${sellerName}`, bold: true },
        { text: ' y ' },
        { text: `${v(d.seller.partner.title)} ${v(d.seller.partner.name)}`, bold: true },
        { text: ' se comprometen a vender a ' },
        { text: `${buyerTitle} ${buyerName}`, bold: true },
        { text: (d.buyer?.hasPartner && d.buyer?.partner?.name) ? ' y ' : ', ' },
        ...(d.buyer?.hasPartner && d.buyer?.partner?.name ? [{ text: `${v(d.buyer.partner.title)} ${v(d.buyer.partner.name)}`, bold: true }] : []),
        { text: ', quien se comprometen a comprar, las fincas descritas en el expositivo I, que la parte compradora declara conocer, como cuerpo cierto, en la situacion fisica, tecnica, constructiva, urbanistica y juridica que declara conocer y acepta, libre de hipotecas, cargas, gravamenes, inquilinos u ocupantes y con todos sus derechos y usos, asi como al corriente del pago de todos los recibos y tributos correspondientes.' },
      ]
    : (d.buyer?.hasPartner && d.buyer?.partner?.name
      ? [
          { text: '1. PRIMERA.- ', bold: true },
          { text: `${sellerTitle} ${sellerName}`, bold: true },
          { text: ' se compromete a vender a ' },
          { text: `${buyerTitle} ${buyerName}`, bold: true },
          { text: ' y ' },
          { text: `${v(d.buyer.partner.title)} ${v(d.buyer.partner.name)}`, bold: true },
          { text: ', quienes se comprometen a comprar, las fincas descritas en el expositivo I, que la parte compradora declara conocer, como cuerpo cierto, en la situacion fisica, tecnica, constructiva, urbanistica y juridica que declara conocer y acepta, libre de hipotecas, cargas, gravamenes, inquilinos u ocupantes y con todos sus derechos y usos, asi como al corriente del pago de todos los recibos y tributos correspondientes.' },
        ]
      : [
          { text: '1. PRIMERA.- ', bold: true },
          { text: `${sellerTitle} ${sellerName}`, bold: true },
          { text: ' se compromete a vender a ' },
          { text: `${buyerTitle} ${buyerName}`, bold: true },
          { text: ', quien se compromete a comprar, las fincas descritas en el expositivo I, que la parte compradora declara conocer, como cuerpo cierto, en la situacion fisica, tecnica, constructiva, urbanistica y juridica que declara conocer y acepta, libre de hipotecas, cargas, gravamenes, inquilinos u ocupantes y con todos sus derechos y usos, asi como al corriente del pago de todos los recibos y tributos correspondientes.' },
        ]);

  const sellerFullTrans = d.seller?.hasPartner && d.seller?.partner?.name
    ? `${sellerTitleTrans} ${sellerName} and ${v(d.seller.partner.title === 'Dona' ? 'Mrs.' : 'Mr.')} ${v(d.seller.partner.name)}`
    : `${sellerTitleTrans} ${sellerName}`;
  const buyerFullTrans = d.buyer?.hasPartner && d.buyer?.partner?.name
    ? `${buyerTitleTrans} ${buyerName} and ${v(d.buyer.partner.title === 'Dona' ? 'Mrs.' : 'Mr.')} ${v(d.buyer.partner.name)}`
    : `${buyerTitleTrans} ${buyerName}`;
  const agreesPlural = (d.seller?.hasPartner && d.seller?.partner?.name) || (d.buyer?.hasPartner && d.buyer?.partner?.name);

  bilingual(doc,
    sellerFullEs,
    (t, lang) => `1. ${t.clause_1}.- ${sellerFullTrans} ${t.first_arras} ${buyerFullTrans}, ${agreesPlural ? t.who_agrees.replace('who agrees', 'who agree').replace('purchase', 'purchase') : t.who_agrees}`
  );

  // SEGUNDA - Price
  const furnitureEs = d.property?.furniture === 'included' ? 'La finca se transmitira dotada de los muebles y electrodomesticos presentes en la propiedad.' : d.property?.furniture === 'not_included' ? 'Los muebles no estan incluidos en la venta.' : 'Muebles incluidos segun lista de inventario separada.';
  const furnitureKey = d.property?.furniture === 'included' ? 'furniture_included' : d.property?.furniture === 'not_included' ? 'furniture_not_included' : 'furniture_partial';

  bilingual(doc,
    [
      { text: '2. SEGUNDA.- ', bold: true },
      { text: 'El precio de la finca objeto de la compraventa convenido por ambas partes es de ' },
      { text: `${formatMoney(d.price?.total)} MAS LOS CORRESPONDIENTES IMPUESTOS.`, bold: true },
    ],
    (t, lang) => `2. ${t.clause_2}.- ${t.second_price} ${formatMoney(d.price?.total, lang)} ${t.plus_taxes}`
  );

  bilingual(doc, furnitureEs, (t, lang) => t[furnitureKey]);
  bilingual(doc,
    'Las citadas cantidades se haran efectivas en la forma, plazos y condiciones siguientes:',
    (t, lang) => t.amounts_paid
  );

  // Payment a) Reservation
  bilingual(doc,
    [
      { text: 'a) La cantidad de ' },
      { text: formatMoney(d.price?.reservation), bold: true },
      { text: ' ha sido abonada en concepto de reserva a la parte intermediaria ' },
      { text: 'COSTA BLANCA LUXURY INVESTMENTS SL', bold: true },
      { text: ` en fecha ${formatDate(d.price?.reservationDate, 'es')} mediante transferencia bancaria.` },
    ],
    (t, lang) => `a) The amount of ${formatMoney(d.price?.reservation, lang)} ${t.reservation_paid} ${formatDate(d.price?.reservationDate, lang)} ${t.through_transfer}`,
    { indent: 36 }, { indent: 36 }
  );

  // Payment b) Arras
  bilingual(doc,
    [
      { text: 'b) La cantidad de ' },
      { text: formatMoney(d.price?.arras), bold: true },
      { text: ' a abonar en concepto de arras a la parte VENDEDORA mediante transferencia bancaria.' },
    ],
    (t, lang) => `b) The amount of ${formatMoney(d.price?.arras, lang)} ${t.arras_to_pay}`,
    { indent: 36 }, { indent: 36 }
  );

  // Bank details — Spanish only
  writePara(doc, `IBAN: ${d.bank?.iban?.trim() || CBLI_BANK.iban}`, { bold: true, indent: 36, spacingAfter: 1 });
  writePara(doc, `Banco: ${d.bank?.bankName?.trim() || CBLI_BANK.bankName}`, { indent: 36, spacingAfter: 1 });
  writePara(doc, `Beneficiario: ${d.bank?.beneficiary?.trim() || CBLI_BANK.beneficiary}`, { indent: 36, spacingAfter: 1 });
  writePara(doc, 'Concepto: Arras', { bold: true, indent: 36, spacingAfter: 10 });

  // Arras deadline
  bilingual(doc,
    `Dicha transferencia habra de hacerse efectiva en la referida cuenta dentro del dia ${formatDate(d.price?.arrasDeadline, 'es')} o antes, cobrando plena eficacia el presente documento.`,
    (t, lang) => `${t.transfer_effective} ${formatDate(d.price?.arrasDeadline, lang)} ${t.or_before}`,
    { indent: 36 }, { indent: 36 }
  );

  // Arras penitenciales
  bilingual(doc,
    [
      { text: `Las referidas cantidades — ${formatMoney(d.price?.arras)} — tienen el concepto de `, bold: true },
      { text: 'arras penitenciales', bold: true, underline: true },
      { text: ` segun el articulo 1.454 del vigente codigo civil. Si el comprador incumpliera cualquiera de las clausulas pactadas en el presente documento, no compareciere en el acto de la firma de escritura publica o no pagara el precio pactado, la venta quedara resuelta y la senal perdida en favor del vendedor. Si fuera este ultimo el que incumpliera cualquiera de las clausulas previstas en el presente documento, o no compareciera al otorgamiento de la escritura publica en los terminos pactados, el comprador podra optar por resolver la compra, con obligacion del vendedor de pagar el importe doble de la senal.`, bold: true },
    ],
    (t, lang) => {
      // Insert the translated amount into the arras penitenciales text
      // The translations start with "The aforementioned amounts have..." or equivalent
      // We inject the amount after "amounts" / "bedragen" / "montants" etc.
      const amount = formatMoney(d.price?.arras, lang);
      const text = t.arras_penitenciales;
      // Insert amount at the beginning with an em dash
      if (lang === 'en') return text.replace('The aforementioned amounts have', `The aforementioned amounts — ${amount} — have`);
      if (lang === 'nl') return text.replace('De voornoemde bedragen hebben', `De voornoemde bedragen — ${amount} — hebben`);
      if (lang === 'fr') return text.replace('Les montants susmentionnes ont', `Les montants susmentionnes — ${amount} — ont`);
      if (lang === 'de') return text.replace('Die oben erwahnten Betraege haben', `Die oben erwahnten Betraege — ${amount} — haben`);
      return `${amount} — ${text}`;
    },
    { indent: 36 },
    { indent: 36 }
  );

  // Payment c) Remaining
  bilingual(doc,
    [
      { text: 'c) La cantidad de ' },
      { text: formatMoney(d.price?.remaining), bold: true },
      { text: ` a pagar mediante transferencia bancaria a la cuenta bancaria de la parte vendedora a la firma de la escritura publica de compraventa ante el Notario de ${v(d.notaryLocation)} ${v(d.notary)}, que tendra lugar el mismo dia o antes del ${formatDate(d.price?.notaryDate, 'es')}.` },
    ],
    (t, lang) => `c) The amount of ${formatMoney(d.price?.remaining, lang)} ${t.remaining_payment}, ${t.at_signing} ${v(d.notaryLocation)} ${v(d.notary)}, ${t.on_or_before} ${formatDate(d.price?.notaryDate, lang)}.`,
    { indent: 36 }, { indent: 36 }
  );

  // Seller bank for final payment — Spanish only
  writePara(doc, `IBAN: ${d.bank?.iban?.trim() || CBLI_BANK.iban}`, { bold: true, indent: 36, spacingAfter: 1 });
  writePara(doc, `Banco: ${d.bank?.bankName?.trim() || CBLI_BANK.bankName}`, { indent: 36, spacingAfter: 1 });
  writePara(doc, `Beneficiario: ${d.bank?.beneficiary?.trim() || CBLI_BANK.beneficiary}`, { indent: 36, spacingAfter: 1 });
  writePara(doc, 'Concepto: Compraventa', { bold: true, indent: 36, spacingAfter: 10 });

  // TERCERA
  bilingual(doc,
    [
      { text: '3. TERCERA.- ', bold: true },
      { text: 'El vendedor se compromete a no ceder, gravar o arrendar la finca, objeto del presente contrato a un tercero, hasta el vencimiento del plazo citado anteriormente, para el pago del precio y la consiguiente formalizacion y elevacion a escritura publica.' },
    ],
    (t, lang) => `3. ${t.clause_3}.- ${t.third_clause}`
  );

  // CUARTA
  bilingual(doc,
    [
      { text: '4. CUARTA.- ', bold: true },
      { text: 'La parte compradora hara frente al pago del impuesto de transmisiones patrimoniales, actos juridicos documentados e importes notariales y registrales que se deriven del otorgamiento de la presente escritura. La parte vendedora abonara el Impuesto Municipal sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (Plusvalia) si se devengara.' },
    ],
    (t, lang) => `4. ${t.clause_4}.- ${t.fourth_clause}`
  );

  // QUINTA
  bilingual(doc,
    [{ text: '5. QUINTA.- ', bold: true }, { text: 'La entrega de la posesion de la finca a la compradora, tendra lugar en el acto de la firma de la escritura ante notario.' }],
    (t, lang) => `5. ${t.clause_5}.- ${t.fifth_clause_1}`
  );
  bilingual(doc,
    'Seran a cargo y por cuenta de la compradora desde la entrega de posesion de las fincas, todos los gastos, y tributos que se devenguen inherentes a la propiedad de las fincas, tales como luz, agua, etc.',
    (t, lang) => t.fifth_clause_2
  );
  bilingual(doc,
    'Todos los gastos, y tributos que se hayan devengado inherentes a la propiedad, con anterioridad a la entrega de posesion, seran por cuenta de la vendedora.',
    (t, lang) => t.fifth_clause_3
  );
  bilingual(doc,
    'La parte vendedora expresamente manifiesta que todos los servicios de la vivienda (electricidad, agua, gas etc), funcionan correctamente y se obliga a su mantenimiento y pago hasta la entrega de la posesion de la propiedad.',
    (t, lang) => t.fifth_clause_4
  );
  bilingual(doc,
    'El IBI y la basura correspondiente al ano en curso seran pagados proporcionalmente por ambas partes.',
    (t, lang) => t.fifth_clause_5
  );

  // SEXTA
  bilingual(doc,
    [{ text: '6. SEXTA.- ', bold: true }, { text: 'Las partes, con renuncia a cualquier otro fuero que pudiera corresponderles, se someten expresamente a la jurisdiccion y competencia de los Juzgados y Tribunales de Benidorm, para solventar cualquier litigio, discrepancia, cuestion o reclamacion resultantes de la ejecucion o interpretacion del presente Contrato.' }],
    (t, lang) => `6. ${t.clause_6}.- ${t.sixth_clause}`
  );

  // SEPTIMA
  bilingual(doc,
    [{ text: '7. SEPTIMA.- ', bold: true }, { text: 'En caso de duda o discrepancia entre las partes sobre la interpretacion del contenido del presente Contrato, prevalecera lo establecido en lengua o version espanola sobre la version traducida.' }],
    (t, lang) => `7. ${t.clause_7}.- ${t.seventh_clause}`
  );

  // Special conditions
  if (d.conditions && d.conditions !== '___') {
    writePara(doc, '8. OCTAVA.- CONDICIONES ESPECIALES', { bold: true, spacingAfter: 4 });
    writePara(doc, d.conditions, { spacingAfter: 6 });
    if (!doc._spanishOnly && doc._langEntries && d.translatedConditions) {
      doc._langEntries.forEach((entry) => {
        const tc = d.translatedConditions[entry.lang];
        if (tc) {
          doc.fillColor(LANG_COLORS[entry.lang] || '#333333');
          writePara(doc, tc, { italic: true, spacingAfter: 6 });
          doc.fillColor('#000000');
        }
      });
    }
  }

  // Closing
  bilingual(doc,
    'Y, en prueba de conformidad con cuanto antecede, ambas partes firman el presente documento o por e-mail, a un solo efecto, en el lugar y fecha antes indicados.',
    (t, lang) => t.closing
  );

  // Signatures — 3 columns: VENDEDOR, COMPRADOR, INTERMEDIARIO
  doc.moveDown(3);
  setFont(doc, true, false);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / 3;
  const startX = doc.page.margins.left;
  const sigY = doc.y;
  const lineLen = 120;

  doc.fontSize(10);
  doc.text('VENDEDOR / SELLER', startX, sigY, { width: colWidth, align: 'center', continued: false });
  doc.text('COMPRADOR / BUYER', startX + colWidth, sigY, { width: colWidth, align: 'center', continued: false });
  doc.text('INTERMEDIARIO', startX + colWidth * 2, sigY, { width: colWidth, align: 'center', continued: false });

  // Names
  const nameY = sigY + 16;
  setFont(doc, false, false);
  doc.fontSize(9);
  const sellerFullName = d.seller?.name || '';
  const sellerPartnerName = d.seller?.hasPartner && d.seller?.partner?.name ? d.seller.partner.name : '';
  const buyerFullName = d.buyer?.name || '';
  const buyerPartnerName = d.buyer?.hasPartner && d.buyer?.partner?.name ? d.buyer.partner.name : '';

  doc.text(sellerFullName, startX, nameY, { width: colWidth, align: 'center', continued: false });
  if (sellerPartnerName) doc.text(sellerPartnerName, startX, nameY + 12, { width: colWidth, align: 'center', continued: false });
  doc.text(buyerFullName, startX + colWidth, nameY, { width: colWidth, align: 'center', continued: false });
  if (buyerPartnerName) doc.text(buyerPartnerName, startX + colWidth, nameY + 12, { width: colWidth, align: 'center', continued: false });
  doc.text('COSTA BLANCA LUXURY', startX + colWidth * 2, nameY, { width: colWidth, align: 'center', continued: false });
  doc.text('INVESTMENTS SL', startX + colWidth * 2, nameY + 12, { width: colWidth, align: 'center', continued: false });

  // Signature lines
  const lineY = nameY + 50;
  const sellerLineX = startX + (colWidth - lineLen) / 2;
  const buyerLineX = startX + colWidth + (colWidth - lineLen) / 2;
  const cbliLineX = startX + colWidth * 2 + (colWidth - lineLen) / 2;
  doc.moveTo(sellerLineX, lineY).lineTo(sellerLineX + lineLen, lineY).stroke();
  doc.moveTo(buyerLineX, lineY).lineTo(buyerLineX + lineLen, lineY).stroke();
  doc.moveTo(cbliLineX, lineY).lineTo(cbliLineX + lineLen, lineY).stroke();

  doc.y = lineY + 20;
  doc.moveDown(3);
}

// ============ BUILD RESERVATION CONTRACT ============
function buildReservationContract(doc, d, t) {
  const sellerTitle = v(d.seller?.title);
  const sellerName = v(d.seller?.name);
  const buyerTitle = v(d.buyer?.title);
  const buyerName = v(d.buyer?.name);
  const sellerTitleTrans = d.seller?.title === 'Dona' ? 'Mrs.' : 'Mr.';
  const buyerTitleTrans = d.buyer?.title === 'Dona' ? 'Mrs.' : 'Mr.';

  // Header image
  if (doc._headerImage) {
    // Image is 1348x316 (4.27:1). Use proportional sizing
    doc.image(doc._headerImage, 50, 30, { width: 495, height: 116 });
    doc.moveDown(6);
  }

  // Date & Title
  writePara(doc, `${v(d.city)}, ${formatDate(d.date, 'es')}`, { bold: true, fontSize: 12, spacingAfter: 14 });
  doc.fillColor('#000000');
  writePara(doc, 'CONTRATO DE RESERVA', { bold: true, underline: true, fontSize: 14, align: 'center', spacingAfter: doc._spanishOnly ? 14 : 2 });
  doc.fillColor('#000000');
  if (!doc._spanishOnly && doc._langEntries) {
    doc._langEntries.forEach((entry, idx) => {
      const isLast = idx === doc._langEntries.length - 1;
      doc.fillColor(LANG_COLORS[entry.lang] || '#333333');
      writePara(doc, entry.t.reservation_title, { bold: true, underline: true, italic: true, fontSize: 14, align: 'center', spacingAfter: isLast ? 14 : 2 });
      doc.fillColor('#000000');
    });
  }

  // Buyer (with partner combined if present)
  writePara(doc, 'De una parte el Comprador:', { italic: true, spacingAfter: 3 });
  if (d.buyer?.hasPartner && d.buyer?.partner?.name) {
    const pt = d.buyer.partner;
    const ptTitle = v(pt.title);
    const ptTitleTrans = pt.title === 'Dona' ? 'Mrs.' : 'Mr.';
    bilingual(doc,
      [
        { text: `${buyerTitle} ${buyerName}`, bold: true },
        { text: ' y ' },
        { text: `${ptTitle} ${v(pt.name)}`, bold: true },
        { text: `, mayores de edad, con nacionalidad ${v(d.buyer?.nationality)} e ${v(pt.nationality)}, provistos de ${v(d.buyer?.idType)} vigente numero ${v(d.buyer?.idNumber)} y ${v(pt.idType)} numero ${v(pt.idNumber)}, con domicilio a efectos de notificaciones ${v(d.buyer?.address)}, en adelante ` },
        { text: 'EL COMPRADOR.', bold: true },
      ],
      (t, lang) => `${buyerTitleTrans} ${buyerName} and ${ptTitleTrans} ${v(pt.name)}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.buyer?.nationality, lang)} and ${translateNat(pt.nationality, lang)}, ${t.with_valid} ${v(d.buyer?.idType)} ${t.number} ${v(d.buyer?.idNumber)} and ${v(pt.idType)} ${t.number} ${v(pt.idNumber)}, ${t.with_address} ${v(d.buyer?.address)}, ${t.hereinafter} ${t.the_buyer}.`
    );
  } else {
    bilingual(doc,
      [
        { text: `${buyerTitle} ${buyerName}`, bold: true },
        { text: `, mayor de edad, con nacionalidad ${v(d.buyer?.nationality)}, provisto de ${v(d.buyer?.idType)} vigente numero ${v(d.buyer?.idNumber)}, con domicilio a efectos de notificaciones ${v(d.buyer?.address)}, en adelante ` },
        { text: 'EL COMPRADOR.', bold: true },
      ],
      (t, lang) => `${buyerTitleTrans} ${buyerName}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.buyer?.nationality, lang)}, ${t.with_valid} ${v(d.buyer?.idType)} ${t.number} ${v(d.buyer?.idNumber)}, ${t.with_address} ${v(d.buyer?.address)}, ${t.hereinafter} ${t.the_buyer}.`
    );
  }

  // Seller (with partner combined if present)
  writePara(doc, 'De otra parte el Vendedor:', { italic: true, spacingAfter: 3 });
  if (d.seller?.hasPartner && d.seller?.partner?.name) {
    const pt = d.seller.partner;
    const ptTitle = v(pt.title);
    const ptTitleTrans = pt.title === 'Dona' ? 'Mrs.' : 'Mr.';
    bilingual(doc,
      [
        { text: `${sellerTitle} ${sellerName}`, bold: true },
        { text: ' y ' },
        { text: `${ptTitle} ${v(pt.name)}`, bold: true },
        { text: `, mayores de edad, con nacionalidad ${v(d.seller?.nationality)} e ${v(pt.nationality)}, provistos de ${v(d.seller?.idType)} vigente numero ${v(d.seller?.idNumber)} y ${v(pt.idType)} numero ${v(pt.idNumber)}, con domicilio a efectos de notificaciones ${v(d.seller?.address)}, en adelante ` },
        { text: 'EL VENDEDOR.', bold: true },
      ],
      (t, lang) => `${sellerTitleTrans} ${sellerName} and ${ptTitleTrans} ${v(pt.name)}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.seller?.nationality, lang)} and ${translateNat(pt.nationality, lang)}, ${t.with_valid} ${v(d.seller?.idType)} ${t.number} ${v(d.seller?.idNumber)} and ${v(pt.idType)} ${t.number} ${v(pt.idNumber)}, ${t.with_address} ${v(d.seller?.address)}, ${t.hereinafter} ${t.the_seller}.`
    );
  } else {
    bilingual(doc,
      [
        { text: `${sellerTitle} ${sellerName}`, bold: true },
        { text: `, mayor de edad, con nacionalidad ${v(d.seller?.nationality)}, provisto de ${v(d.seller?.idType)} vigente numero ${v(d.seller?.idNumber)}, con domicilio a efectos de notificaciones ${v(d.seller?.address)}, en adelante ` },
        { text: 'EL VENDEDOR.', bold: true },
      ],
      (t, lang) => `${sellerTitleTrans} ${sellerName}, ${t.of_legal_age}, ${t.of_nationality} ${translateNat(d.seller?.nationality, lang)}, ${t.with_valid} ${v(d.seller?.idType)} ${t.number} ${v(d.seller?.idNumber)}, ${t.with_address} ${v(d.seller?.address)}, ${t.hereinafter} ${t.the_seller}.`
    );
  }

  // All parties intro
  bilingual(doc,
    'Todas las partes intervienen en su propio nombre y derecho, acordando en este acto suscribir el presente acuerdo de reserva respecto a la vivienda que se identifica seguidamente.',
    (t, lang) => t.res_all_parties
  );

  // Property details — indented list with dash, skip empty fields
  writePara(doc, buildPropLine(d.property?.type, d.property?.address, d.property?.registry, d.property?.finca, d.property?.tomo, d.property?.libro, d.property?.folio, d.property?.catastral, d.property?.ref), { bold: true, indent: 36, spacingAfter: 6 });

  // Extra properties (garage/storage) — indented list
  if (d.extraProperties) {
    d.extraProperties.forEach(ep => {
      if (ep.enabled) {
        writePara(doc, buildPropLine(ep.type, null, null, ep.finca, ep.tomo, ep.libro, ep.folio, ep.catastral, null), { bold: true, indent: 36, spacingAfter: 6 });
      }
    });
  }

  // Legal capacity
  bilingual(doc,
    'Las partes, reconociendose todos ellos mutuamente la capacidad necesaria para obligarse y en especial para otorgar el presente contrato, a tal efecto libremente sujetan sus acuerdos a las siguientes:',
    (t, lang) => t.res_capacity
  );

  // CLAUSULAS
  doc.fillColor('#000000');
  writePara(doc, 'CLAUSULAS', { bold: true, underline: true, align: 'center', spacingAfter: doc._spanishOnly ? 10 : 2 });
  doc.fillColor('#000000');
  if (!doc._spanishOnly && doc._langEntries) {
    doc._langEntries.forEach((entry, idx) => {
      const isLast = idx === doc._langEntries.length - 1;
      doc.fillColor(LANG_COLORS[entry.lang] || '#333333');
      writePara(doc, entry.t.clauses, { bold: true, italic: true, underline: true, align: 'center', spacingAfter: isLast ? 10 : 2 });
      doc.fillColor('#000000');
    });
  }

  // Clause 1 - Price
  const furnitureNoteEs = d.property?.furniture === 'included' ? 'muebles incluidos' : d.property?.furniture === 'not_included' ? 'muebles no incluidos' : 'muebles segun inventario';

  bilingual(doc,
    [
      { text: '1. PRIMERA.- El precio de venta del inmueble es de ' },
      { text: `${formatMoney(d.price?.total)} ${furnitureNoteEs}`, bold: true },
      { text: ' (sin impuestos). Precio que los compradores abonaran a los vendedores en el momento del otorgamiento de la escritura publica de compraventa, descontando de dicha cantidad los pagos que se hayan realizado con anterioridad y que se citan a continuacion:' },
    ],
    (t, lang) => `1. ${t.clause_1}.- ${t.res_price_clause} ${formatMoney(d.price?.total, lang)}, ${t.res_furniture_not} ${t.res_excl_taxes} ${t.res_buyers_shall}`
  );

  // Clause 2 - Reservation fee
  bilingual(doc,
    [
      { text: '2. SEGUNDA.- La cantidad de ' },
      { text: formatMoney(d.price?.reservation), bold: true },
      { text: ' que se pagaran como ' },
      { text: 'RESERVA NO REEMBOLSABLE', bold: true },
      { text: ' a la firma del presente contrato, se ingresara a nombre de ' },
      { text: 'COSTA BLANCA LUXURY INVESTMENTS SL', bold: true },
      { text: ' en la cuenta indicada a continuacion, y dicha cantidad quedara ' },
      { text: 'en deposito', bold: true },
      { text: ' de la citada sociedad hasta la firma del contrato de arras por ambas partes, momento en el cual se transferira a la cuenta del vendedor:' },
    ],
    (t, lang) => `2. ${t.clause_2}.- The sum of ${formatMoney(d.price?.reservation, lang)} ${t.res_non_refundable}`
  );

  // CBLI bank details
  writePara(doc, `IBAN: ${d.bank?.iban?.trim() || CBLI_BANK.iban}`, { bold: true, indent: 36, spacingAfter: 1 });
  writePara(doc, `Banco: ${d.bank?.bankName?.trim() || CBLI_BANK.bankName}`, { indent: 36, spacingAfter: 1 });
  writePara(doc, `Beneficiario: ${d.bank?.beneficiary?.trim() || CBLI_BANK.beneficiary}`, { bold: true, indent: 36, spacingAfter: 1 });
  writePara(doc, `Concepto: Reserva Ref. ${v(d.property?.ref)}`, { bold: true, indent: 36, spacingAfter: 10 });

  // Clause 3 - Arras commitment
  const arrasSignDays = d.arrasSignDays || '7';
  const arrasTransferDays = d.arrasTransferDays || '3';

  bilingual(doc,
    [
      { text: '3. TERCERA.- Ambas partes se comprometen a firmar un contrato de arras en un plazo de ' },
      { text: `${arrasSignDays} DIAS`, bold: true },
      { text: ` naturales desde la fecha de firma de este documento por ambas partes, con entrega en un plazo de ${arrasTransferDays} dias habiles tras la firma del referido documento, de ` },
      { text: `${formatMoney(d.price?.arras)} a la parte vendedora`, bold: true },
      { text: ', en concepto de arras penitenciales, que se considerara parte del pago del inmueble. El resto del precio se pagara en el momento del otorgamiento de la escritura publica y entrega de la posesion.' },
    ],
    (t, lang) => `3. ${t.clause_3}.- ${t.res_arras_commit} ${arrasSignDays} ${t.res_calendar_days} ${arrasTransferDays} ${t.res_working_days} ${formatMoney(d.price?.arras, lang)} ${t.res_to_seller}, ${t.res_as_arras}`
  );

  // Clause 4 - Max date
  bilingual(doc,
    [
      { text: '4. CUARTA.- En dicho contrato de arras se fijara como fecha maxima de firma de escritura, entrega de la posesion y pago completo del precio pactado, el ' },
      { text: `${formatDate(d.price?.notaryDate, 'es')}.`, bold: true },
    ],
    (t, lang) => `4. ${t.clause_4}.- ${t.res_max_date} ${formatDate(d.price?.notaryDate, lang)}.`
  );

  // Clause 5 - Taxes
  bilingual(doc,
    '5. QUINTA.- La parte compradora hara frente al pago del impuesto de transmisiones patrimoniales, actos juridicos documentados e importes notariales y registrales que se deriven del otorgamiento de la presente escritura. La parte vendedora abonara el Impuesto Municipal sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (Plusvalia) si se devengara.',
    (t, lang) => `5. ${t.clause_5}.- ${t.fourth_clause}`
  );

  // Clause 6 - Free of charges + CBLI role
  bilingual(doc,
    '6. SEXTA.- La vivienda se transmite libre de cargas, arrendamientos, ocupantes y afecciones urbanisticas. La propiedad se entregara al corriente de pago de impuestos, tasas y gastos asociados, siendo los vendedores titulares registrales de pleno derecho, sin limitaciones ni restricciones para su transmision.',
    (t, lang) => `6. ${t.clause_6}.- ${t.res_transfer_free}`
  );
  bilingual(doc,
    'COSTA BLANCA LUXURY INVESTMENTS SL interviene en la presente operacion unicamente como intermediario inmobiliario y depositario de la cantidad entregada en concepto de reserva, no siendo responsable de la situacion juridica, urbanistica o tecnica del inmueble, cuya comprobacion corresponde a las partes.',
    (t, lang) => t.res_cbli_role
  );

  // Clause 7 - Seller fault
  bilingual(doc,
    '7. SEPTIMA.- En el supuesto de que la compraventa no pudiera formalizarse exclusivamente por causas imputables a la parte vendedora, tales como la existencia de ilegalidades en el inmueble o la imposibilidad de obtener la documentacion legalmente exigida para otorgar la escritura publica de compraventa ante notario, la parte compradora podra optar por desistir de la operacion sin penalizacion ni obligacion economica alguna.',
    (t, lang) => `7. ${t.clause_7}.- ${t.res_seller_fault}`
  );
  bilingual(doc,
    'En dicho caso, la parte vendedora vendra obligada a devolver integramente a la parte compradora todas las cantidades que esta hubiera entregado hasta ese momento a cuenta del precio de la compraventa.',
    (t, lang) => t.res_seller_refund
  );

  // Clause 8 - Withdraw from market
  bilingual(doc,
    '8. OCTAVA.- Una vez firmado este contrato por ambas partes, la vendedora estara obligada a retirar del mercado la vivienda y notificar a cualquier otro Agente inmobiliario que tuviera el encargo de venta de la misma, procediendo en su caso a eliminar, publicitar o intervenir en su mediacion, con la retirada inmediata de cualquier cartel publicitario de venta tanto propio como de otros Agentes.',
    (t, lang) => `8. EIGHTH.- ${t.res_withdraw_market}`
  );
  bilingual(doc,
    'Las partes acuerdan que el presente contrato tiene como unico objeto reservar el inmueble y retirarlo temporalmente del mercado, no constituyendo contrato privado de compraventa ni arras penitenciales, las cuales seran reguladas en su caso en el contrato de arras posterior.',
    (t, lang) => t.res_sole_purpose
  );

  // Clause 9 - Spanish prevails
  bilingual(doc,
    '9. NOVENA.- En caso de duda sobre la interpretacion del contenido del presente, prevalecera lo establecido en lengua espanola.',
    (t, lang) => `9. NINTH.- ${t.res_spanish_prevails}`
  );

  // Special conditions
  if (d.conditions && d.conditions !== '___') {
    writePara(doc, '10. DECIMA.- CONDICIONES ESPECIALES / SPECIAL CONDITIONS', { bold: true, spacingAfter: 4 });
    writePara(doc, d.conditions, { spacingAfter: 6 });
    if (!doc._spanishOnly && doc._langEntries && d.translatedConditions) {
      doc._langEntries.forEach((entry) => {
        const tc = d.translatedConditions[entry.lang];
        if (tc) {
          doc.fillColor(LANG_COLORS[entry.lang] || '#333333');
          writePara(doc, tc, { italic: true, spacingAfter: 6 });
          doc.fillColor('#000000');
        }
      });
    }
  }

  // Closing
  bilingual(doc,
    'Y, en prueba de conformidad, ambas partes firman este documento, en lugar y fecha indicados en el encabezado.',
    (t, lang) => t.res_closing
  );

  // Signatures — 3 columns: VENDEDOR, COMPRADOR, INTERMEDIARIO
  doc.moveDown(3);
  setFont(doc, true, false);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / 3;
  const startX = doc.page.margins.left;
  const sigY = doc.y;
  const lineLen = 120;

  doc.fontSize(10);
  doc.text('VENDEDOR / SELLER', startX, sigY, { width: colWidth, align: 'center', continued: false });
  doc.text('COMPRADOR / BUYER', startX + colWidth, sigY, { width: colWidth, align: 'center', continued: false });
  doc.text('INTERMEDIARIO', startX + colWidth * 2, sigY, { width: colWidth, align: 'center', continued: false });

  // Names
  const nameY = sigY + 16;
  setFont(doc, false, false);
  doc.fontSize(9);
  const sellerFullName = d.seller?.name || '';
  const sellerPartnerName = d.seller?.hasPartner && d.seller?.partner?.name ? d.seller.partner.name : '';
  const buyerFullName = d.buyer?.name || '';
  const buyerPartnerName = d.buyer?.hasPartner && d.buyer?.partner?.name ? d.buyer.partner.name : '';

  doc.text(sellerFullName, startX, nameY, { width: colWidth, align: 'center', continued: false });
  if (sellerPartnerName) doc.text(sellerPartnerName, startX, nameY + 12, { width: colWidth, align: 'center', continued: false });
  doc.text(buyerFullName, startX + colWidth, nameY, { width: colWidth, align: 'center', continued: false });
  if (buyerPartnerName) doc.text(buyerPartnerName, startX + colWidth, nameY + 12, { width: colWidth, align: 'center', continued: false });
  doc.text('COSTA BLANCA LUXURY', startX + colWidth * 2, nameY, { width: colWidth, align: 'center', continued: false });
  doc.text('INVESTMENTS SL', startX + colWidth * 2, nameY + 12, { width: colWidth, align: 'center', continued: false });

  // Signature lines
  const lineY = nameY + 50;
  const sellerLineX = startX + (colWidth - lineLen) / 2;
  const buyerLineX = startX + colWidth + (colWidth - lineLen) / 2;
  const cbliLineX = startX + colWidth * 2 + (colWidth - lineLen) / 2;
  doc.moveTo(sellerLineX, lineY).lineTo(sellerLineX + lineLen, lineY).stroke();
  doc.moveTo(buyerLineX, lineY).lineTo(buyerLineX + lineLen, lineY).stroke();
  doc.moveTo(cbliLineX, lineY).lineTo(cbliLineX + lineLen, lineY).stroke();

  doc.y = lineY + 20;
  doc.moveDown(3);
}

// ============ BUILD COMMISSION CONTRACT ============
function buildCommissionContract(doc, d, t) {
  const sellerTitle = v(d.seller?.title);
  const sellerName = v(d.seller?.name);
  const buyerTitle = v(d.buyer?.title);
  const buyerName = v(d.buyer?.name);

  // Header image
  if (doc._headerImage) {
    doc.image(doc._headerImage, 50, 30, { width: 495, height: 116 });
    doc.moveDown(6);
  }

  // Date
  writePara(doc, `En ${v(d.city)}, a ${formatDate(d.date, 'es')}`, { bold: true, fontSize: 12, spacingAfter: 14 });

  // Title
  doc.fillColor('#000000');
  writePara(doc, 'RECONOCIMIENTO DE HONORARIOS', { bold: true, underline: true, fontSize: 14, align: 'center', spacingAfter: 2 });
  writePara(doc, 'COMMISSION AGREEMENT', { bold: true, underline: true, italic: true, fontSize: 14, align: 'center', spacingAfter: 14 });

  // COMPARECEN
  writePara(doc, 'COMPARECEN', { bold: true, underline: true, align: 'center', spacingAfter: 10 });

  // Seller
  if (d.seller?.hasPartner && d.seller?.partner?.name) {
    const pt = d.seller.partner;
    writePara(doc, `De una parte, ${sellerTitle} ${sellerName} y ${pt.title} ${v(pt.name)}, de nacionalidad ${v(d.seller?.nationality)} e ${v(pt.nationality)}, mayores de edad, casados, con ${v(d.seller?.idType)} número ${v(d.seller?.idNumber)} y ${v(pt.idType)} número ${v(pt.idNumber)}, correspondiente mente con domicilio en ${v(d.seller?.address)}. En adelante el Vendedor.`, { spacingAfter: 6 });
  } else {
    writePara(doc, `De una parte, ${sellerTitle} ${sellerName}, de nacionalidad ${v(d.seller?.nationality)}, mayor de edad, con ${v(d.seller?.idType)} número ${v(d.seller?.idNumber)}, con domicilio en ${v(d.seller?.address)}. En adelante el Vendedor.`, { spacingAfter: 6 });
  }

  // CBLI
  writePara(doc, `Y de otra parte la mercantil COSTA BLANCA LUXURY INVESTMENTS S.L. con CIF B56281082, con domicilio en Puerto Deportivo Campomanes 59, 03590, Altea, Alicante en representación de Don BRUNO FELIPE.`, { spacingAfter: 10 });

  // DICEN Y OTORGAN
  writePara(doc, 'DICEN Y OTORGAN', { bold: true, underline: true, align: 'center', spacingAfter: 10 });

  // Property description
  writePara(doc, [
    { text: 'Que COSTA BLANCA LUXURY INVESTMENTS S.L. ha visitado la propiedad con el cliente (Comprador) como se describe a continuación, identificando la propiedad y confirmando su estado.\n\n' },
    { text: 'DESCRIPCIÓN DEL INMUEBLE / PROPERTY DESCRIPTION:', bold: true },
  ]);

  // Property details
  writePara(doc, buildPropLine(d.property?.type, d.property?.address, d.property?.registry, d.property?.finca, d.property?.tomo, d.property?.libro, d.property?.folio, d.property?.catastral, d.property?.ref), { bold: true, indent: 36, spacingAfter: 10 });

  // Price section
  bilingual(doc,
    [
      { text: 'El precio de venta total del inmueble es de ' },
      { text: `${formatMoney(d.price?.total)}.`, bold: true },
    ],
    (t, lang) => `The total sale price of the property is ${formatMoney(d.price?.total, lang)}.`
  );

  // Commission
  bilingual(doc,
    [
      { text: 'La comisión total que será abonada es de ' },
      { text: `${formatMoney(d.commission?.totalCommission)}`, bold: true },
      { text: ' más IVA 21% (€' },
      { text: `${v(d.commission?.firstPaymentIVA)})`, bold: true },
    ],
    (t, lang) => `The total commission to be paid is ${formatMoney(d.commission?.totalCommission, lang)} plus 21% VAT (€${v(d.commission?.firstPaymentIVA)}).`
  );

  // Payment schedule
  writePara(doc, 'DESGLOSE DE PAGOS / PAYMENT BREAKDOWN:', { bold: true, spacingAfter: 6 });

  bilingual(doc,
    [
      { text: 'Primera comisión (50% en arras): ' },
      { text: `${formatMoney(d.commission?.firstPayment)}`, bold: true },
      { text: ' + IVA €' },
      { text: `${v(d.commission?.firstPaymentIVA)}`, bold: true },
    ],
    (t, lang) => `First commission (50% at arras): ${formatMoney(d.commission?.firstPayment, lang)} + VAT €${v(d.commission?.firstPaymentIVA)}`,
    { indent: 36 }, { indent: 36 }
  );

  bilingual(doc,
    [
      { text: 'Segunda comisión (50% en notaría): ' },
      { text: `${formatMoney(d.commission?.secondPayment)}`, bold: true },
      { text: ' + IVA €' },
      { text: `${v(d.commission?.firstPaymentIVA)}`, bold: true },
    ],
    (t, lang) => `Second commission (50% at notary): ${formatMoney(d.commission?.secondPayment, lang)} + VAT €${v(d.commission?.firstPaymentIVA)}`,
    { indent: 36 }, { indent: 36 }
  );

  // Bank details
  writePara(doc, '\nDatos Bancarios para el Abono / Bank Details for Payment:', { bold: true, spacingAfter: 6 });
  writePara(doc, `IBAN: ${v(d.bank?.iban)}`, { bold: true, indent: 36, spacingAfter: 1 });
  writePara(doc, `SWIFT: CCRIES2A045`, { indent: 36, spacingAfter: 1 });
  writePara(doc, `Banco: ${v(d.bank?.bankName)}`, { indent: 36, spacingAfter: 1 });
  writePara(doc, `Beneficiario: ${v(d.bank?.beneficiary)}`, { indent: 36, spacingAfter: 1 });
  writePara(doc, 'Concepto: Comisión / Commission', { bold: true, indent: 36, spacingAfter: 10 });

  // Closing
  bilingual(doc,
    'Ambas partes leen el presente documento que contiene dos ejemplares idénticos y firman en prueba de conformidad.',
    (t, lang) => 'Both parties read this document which contains two identical copies and sign in proof of agreement.'
  );

  // Signatures
  doc.moveDown(3);
  setFont(doc, true, false);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / 3;
  const startX = doc.page.margins.left;
  const sigY = doc.y;
  const lineLen = 120;

  doc.fontSize(10);
  doc.text('VENDEDOR / SELLER', startX, sigY, { width: colWidth, align: 'center', continued: false });
  doc.text('COMPRADOR / BUYER', startX + colWidth, sigY, { width: colWidth, align: 'center', continued: false });
  doc.text('COSTA BLANCA LUXURY INVESTMENTS S.L.', startX + colWidth * 2, sigY, { width: colWidth, align: 'center', continued: false });

  // Names
  const nameY = sigY + 16;
  setFont(doc, false, false);
  doc.fontSize(9);
  const sellerFullName = d.seller?.name || '';
  const sellerPartnerName = d.seller?.hasPartner && d.seller?.partner?.name ? d.seller.partner.name : '';
  const buyerFullName = d.buyer?.name || '';
  const buyerPartnerName = d.buyer?.hasPartner && d.buyer?.partner?.name ? d.buyer.partner.name : '';

  doc.text(sellerFullName, startX, nameY, { width: colWidth, align: 'center', continued: false });
  if (sellerPartnerName) doc.text(sellerPartnerName, startX, nameY + 12, { width: colWidth, align: 'center', continued: false });
  doc.text(buyerFullName, startX + colWidth, nameY, { width: colWidth, align: 'center', continued: false });
  if (buyerPartnerName) doc.text(buyerPartnerName, startX + colWidth, nameY + 12, { width: colWidth, align: 'center', continued: false });
  doc.text('COSTA BLANCA LUXURY', startX + colWidth * 2, nameY, { width: colWidth, align: 'center', continued: false });
  doc.text('INVESTMENTS SL', startX + colWidth * 2, nameY + 12, { width: colWidth, align: 'center', continued: false });

  // Signature lines
  const lineY = nameY + 50;
  const sellerLineX = startX + (colWidth - lineLen) / 2;
  const buyerLineX = startX + colWidth + (colWidth - lineLen) / 2;
  const cbliLineX = startX + colWidth * 2 + (colWidth - lineLen) / 2;
  doc.moveTo(sellerLineX, lineY).lineTo(sellerLineX + lineLen, lineY).stroke();
  doc.moveTo(buyerLineX, lineY).lineTo(buyerLineX + lineLen, lineY).stroke();
  doc.moveTo(cbliLineX, lineY).lineTo(cbliLineX + lineLen, lineY).stroke();

  doc.y = lineY + 20;
  doc.moveDown(3);
}

// ============ EXPORTED GENERATOR ============
export async function generateContract(formData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 72, bottom: 60, left: 60, right: 60 },
      bufferPages: true,
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Load header image
    const headerPath = path.join(process.cwd(), 'public', 'header.png');
    let headerImage = null;
    try { headerImage = fs.readFileSync(headerPath); } catch (e) { console.log('Header image not found'); }
    doc._headerImage = headerImage;

    const languages = formData.languages && formData.languages.length > 0 ? formData.languages : [];

    if (languages.length === 0) {
      // Spanish-only contract
      doc._spanishOnly = true;
      doc._langEntries = [];
      const t = translations.en;
      const langData = { ...formData, language: 'es', conditions: formData.conditions || '' };
      if (formData.type === 'arras') {
        buildArrasContract(doc, langData, t);
      } else if (formData.type === 'commission') {
        buildCommissionContract(doc, langData, t);
      } else {
        buildReservationContract(doc, langData, t);
      }
    } else {
      // Multi-language contract - single document with all translations
      doc._spanishOnly = false;
      doc._langEntries = languages.map(lang => ({
        lang,
        t: translations[lang] || translations.en,
      }));

      // Build data with translated conditions for all languages
      const langData = {
        ...formData,
        language: languages[0], // primary language for backward compat
        conditions: formData.conditions || '',
        translatedConditions: formData.translatedConditions || {},
      };

      if (formData.type === 'arras') {
        buildArrasContract(doc, langData, doc._langEntries[0].t);
      } else if (formData.type === 'commission') {
        buildCommissionContract(doc, langData, doc._langEntries[0].t);
      } else {
        buildReservationContract(doc, langData, doc._langEntries[0].t);
      }
    }

    doc.end();
  });
}

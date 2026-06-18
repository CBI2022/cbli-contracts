"use client";
import { useState, useCallback } from "react";

// ═══════════════════════════════════════════════
// CBLI CONTRACT GENERATOR v2.0
// Multi-language, partner support, auto price-words
// ═══════════════════════════════════════════════

const LANGS = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "nl", flag: "🇳🇱", name: "Nederlands" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "ru", flag: "🇷🇺", name: "Русский" },
];

const PROP_TYPES = [
  { value: "Villa", label: "Villa" },
  { value: "Apartamento", label: "Apartamento / Apartment" },
  { value: "Adosado", label: "Adosado / Townhouse" },
  { value: "Bungalow", label: "Bungalow" },
  { value: "Finca rústica", label: "Finca rústica / Country Property" },
  { value: "Parcela", label: "Parcela / Plot" },
  { value: "Ático", label: "Ático / Penthouse" },
  { value: "Dúplex", label: "Dúplex / Duplex" },
  { value: "Aparcamiento", label: "Aparcamiento / Garage" },
  { value: "Trastero", label: "Trastero / Storage Room" },
];

const TITLES = [
  { value: "Don", label: "Don (Mr.)" },
  { value: "Doña", label: "Doña (Mrs.)" },
];

const NATIONALITIES = [
  { value: "española", label: "Española" },
  { value: "inglesa", label: "Inglesa" },
  { value: "italiana", label: "Italiana" },
  { value: "alemana", label: "Alemana" },
  { value: "francesa", label: "Francesa" },
  { value: "rusa", label: "Rusa" },
  { value: "holandesa", label: "Holandesa" },
  { value: "noruega", label: "Noruega" },
  { value: "belga", label: "Belga" },
  { value: "sueca", label: "Sueca" },
  { value: "estadounidense", label: "Estadounidense" },
  { value: "canadiense", label: "Canadiense" },
  { value: "otros", label: "Otros (escribir)" },
];

const ID_TYPES = [
  { value: "pasaporte", label: "Pasaporte / Passport" },
  { value: "DNI", label: "DNI" },
  { value: "NIE", label: "NIE" },
];

// ═══ NUMBER TO SPANISH WORDS ═══
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
const fmtWords = (v) => v ? numberToEnglishWords(Math.floor(Number(v))) + " EUROS" : "";

const blank = () => ({
  type: "", languages: [], agentName: "",
  date: new Date().toISOString().split("T")[0], city: "Altea",
  buyer: { title: "Don", name: "", nationality: "", idType: "pasaporte", idNumber: "", nie: "", address: "", hasPartner: false, partner: { title: "Doña", name: "", nationality: "", idType: "pasaporte", idNumber: "", nie: "" } },
  seller: { title: "Don", name: "", nationality: "", idType: "DNI", idNumber: "", nie: "", address: "", hasPartner: false, partner: { title: "Doña", name: "", nationality: "", idType: "DNI", idNumber: "", nie: "" } },
  property: { type: "Villa", address: "", catastral: "", furniture: "included", registry: "", finca: "", tomo: "", libro: "", folio: "", ref: "" },
  price: { total: "", words: "", reservation: "", reservationDate: "", arras: "", arrasDeadline: "", remaining: "", notaryDate: "" },
  commission: { totalCommission: "", discount: "", netAfterDiscount: "", totalIVA: "", totalWithIVA: "", firstPayment: "", firstPaymentIVA: "", secondPayment: "", secondPaymentIVA: "" },
  bank: { iban: "ES29 3045 2650 8810 2101 3669", bankName: "Caixa Rural de Altea", beneficiary: "COSTA BLANCA LUXURY INVESTMENTS SL" },
  conditions: "", notary: "Azpitarte", notaryLocation: "Altea", arrasSignDays: "7", arrasTransferDays: "3",
  extraProperties: [
    { enabled: false, type: "Aparcamiento", catastral: "", finca: "", tomo: "", libro: "", folio: "" },
    { enabled: false, type: "Trastero", catastral: "", finca: "", tomo: "", libro: "", folio: "" },
  ],
  ficha: {
    price: "", agent: "", address: "", city: "", owner: "", phone: "", propertyType: "Villa", date: "", commissionRate: "",
    ibi: "", community: "", garbage: "", water: "", electricity: "",
    plotM2: "", surfaceBuilt: "", builtYear: "", orientation: "", floors: "", timeOnMarket: "",
    bedrooms: "", bathrooms: "", toilets: "", heating: "", parkings: "", refurbishedYear: "",
    uploadWeb: "No", uploadIdealista: "No", underground: "No", views: "None",
    coveredGarage: "No", guestApartment: "No", airConditioning: "No",
    swimmingPool: "No", furnitureIncluded: "No", lift: "No", garden: "No",
    touristLicence: "No", cbiSign: "No", haveKeys: "No",
    nies: false, dniPassports: false, escritura: false, floorPlans: false, cee: false,
    extraComments: "",
  },
  fichaFiles: [],
});

const fmt = (v) => v ? Number(v).toLocaleString("es-ES")+"€" : "___€";
const fmtDate = (v) => { if (!v) return "___"; return new Date(v+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"}); };

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(blank());
  const [toast, setToast] = useState(null);
  const [genState, setGenState] = useState("idle");
  const [translatedCond, setTranslatedCond] = useState("");

  const show = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),4500); };

  const set = useCallback((path, val) => {
    setForm(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const k = path.split("."); let o = n;
      for (let i=0;i<k.length-1;i++) o=o[k[i]];
      o[k[k.length-1]] = val;
      if (["price.total","price.reservation","price.arras"].includes(path)) {
        n.price.remaining = String((parseFloat(n.price.total)||0)-(parseFloat(n.price.reservation)||0)-(parseFloat(n.price.arras)||0));
      }
      if (path==="price.total") n.price.words = numberToSpanishWords(val);
      // Auto-calculate commission IVA fields
      if (["commission.totalCommission","commission.discount","commission.firstPayment","commission.secondPayment"].includes(path)) {
        const tc = parseFloat(n.commission.totalCommission) || 0;
        const disc = parseFloat(n.commission.discount) || 0;
        const net = tc - disc;
        const fp = parseFloat(n.commission.firstPayment) || 0;
        const sp = parseFloat(n.commission.secondPayment) || 0;
        n.commission.netAfterDiscount = net > 0 ? net.toFixed(2) : "0";
        n.commission.totalIVA = (net * 0.21).toFixed(2);
        n.commission.totalWithIVA = (net * 1.21).toFixed(2);
        n.commission.firstPaymentIVA = (fp * 1.21).toFixed(2);
        n.commission.secondPaymentIVA = (sp * 1.21).toFixed(2);
      }
      return n;
    });
  }, []);

  const toggleLang = (code) => setForm(prev => ({ ...prev, languages: prev.languages.includes(code) ? prev.languages.filter(l=>l!==code) : [...prev.languages, code] }));

  const validate = (s) => {
    if (s === 1) {
      if (!form.type) return "Select a contract type";
      if (!form.agentName?.trim()) return "Enter your name";
      if (!form.date) return "Enter the date";
      if (!form.city?.trim()) return "Enter the city";
    }
    if (form.type === "ficha") {
      // Ficha validation (5 steps: Type, Owner, Property, Documents, Review)
      if (s === 2) {
        if (!form.ficha.owner?.trim()) return "Enter owner name";
        if (!form.ficha.address?.trim()) return "Enter property address";
        if (!form.ficha.city?.trim()) return "Enter city";
      }
      if (s === 3) {
        if (!form.ficha.price?.trim()) return "Enter property price";
      }
      if (s === 4) {
        // File validation for required documents
        const requiredDocs = ['ibi', 'garbage', 'dniPassports', 'escritura'];
        const missingRequired = requiredDocs.filter(docType => {
          const hasFile = form.fichaFiles.some(f => f.type === docType);
          return !hasFile;
        });
        if (missingRequired.length > 0) {
          const docNames = { ibi: 'IBI', garbage: 'Garbage', dniPassports: 'ID/Passport', escritura: 'Escritura' };
          return `Missing required documents: ${missingRequired.map(d => docNames[d]).join(', ')}`;
        }
      }
    } else {
      // Regular contracts validation
      if (s === 2) {
        if (!form.buyer.name?.trim()) return "Enter buyer's full name";
        if (!form.buyer.nationality?.trim() || form.buyer.nationality === "otros") return "Select buyer's nationality";
        if (!form.buyer.idNumber?.trim()) return "Enter buyer's ID number";
        if (!form.buyer.address?.trim()) return "Enter buyer's address";
        if (form.buyer.hasPartner) {
          if (!form.buyer.partner.name?.trim()) return "Enter buyer partner's full name";
          if (!form.buyer.partner.nationality?.trim() || form.buyer.partner.nationality === "otros") return "Select buyer partner's nationality";
          if (!form.buyer.partner.idNumber?.trim()) return "Enter buyer partner's ID number";
        }
        if (!form.seller.name?.trim()) return "Enter seller's full name";
        if (!form.seller.nationality?.trim() || form.seller.nationality === "otros") return "Select seller's nationality";
        if (!form.seller.idNumber?.trim()) return "Enter seller's ID number";
        if (!form.seller.address?.trim()) return "Enter seller's address";
        if (form.seller.hasPartner) {
          if (!form.seller.partner.name?.trim()) return "Enter seller partner's full name";
          if (!form.seller.partner.nationality?.trim() || form.seller.partner.nationality === "otros") return "Select seller partner's nationality";
          if (!form.seller.partner.idNumber?.trim()) return "Enter seller partner's ID number";
        }
      }
      if (s === 3) {
        if (!form.property.address?.trim()) return "Enter the property address";
        if (!form.property.catastral?.trim()) return "Enter the referencia catastral";
        if (!form.property.ref?.trim()) return "Enter the property reference number";
        if (!form.property.registry?.trim()) return "Enter the property registry";
        if (!form.property.finca?.trim()) return "Enter the finca number";
        if (!form.property.tomo?.trim()) return "Enter the tomo";
        if (!form.property.libro?.trim()) return "Enter the libro";
        if (!form.property.folio?.trim()) return "Enter the folio";
        for (let i = 0; i < form.extraProperties.length; i++) {
          const ep = form.extraProperties[i];
          if (ep.enabled) {
            const label = i === 0 ? "Aparcamiento" : "Trastero";
            if (!ep.catastral?.trim()) return `Enter ${label} referencia catastral`;
            if (!ep.finca?.trim()) return `Enter ${label} finca number`;
            if (!ep.tomo?.trim()) return `Enter ${label} tomo`;
            if (!ep.libro?.trim()) return `Enter ${label} libro`;
            if (!ep.folio?.trim()) return `Enter ${label} folio`;
          }
        }
      }
      if (s === 4) {
        if (form.type === "commission") {
          if (!form.price.total || parseFloat(form.price.total) <= 0) return "Enter the total sale price";
          if (!form.commission.totalCommission || parseFloat(form.commission.totalCommission) <= 0) return "Enter the total commission amount";
          if (form.commission.firstPayment === '' || form.commission.firstPayment === undefined) return "Enter the first payment amount (can be 0)";
          if (!form.commission.secondPayment || parseFloat(form.commission.secondPayment) <= 0) return "Enter the second payment amount";
          const fp = parseFloat(form.commission.firstPayment) || 0;
          const sp = parseFloat(form.commission.secondPayment) || 0;
          const tc = parseFloat(form.commission.totalCommission) || 0;
          const disc = parseFloat(form.commission.discount) || 0;
          if (Math.abs((fp + sp) - (tc - disc)) > 0.01) return `First + Second payment (${(fp+sp).toFixed(2)}) must equal Total Commission Net (${(tc-disc).toFixed(2)})`;
          if (!form.commission.firstPaymentIVA || parseFloat(form.commission.firstPaymentIVA) < 0) return "Enter the IVA amount";
        } else {
          if (!form.price.total || parseFloat(form.price.total) <= 0) return "Enter the total price";
          if (form.type === "reservation") {
            if (!form.price.reservation || parseFloat(form.price.reservation) <= 0) return "Enter the reservation amount";
            if (!form.price.reservationDate) return "Enter the reservation date";
          }
          if (form.type === "arras") {
            if (!form.price.arras || parseFloat(form.price.arras) <= 0) return "Enter the arras deposit amount";
            if (!form.price.arrasDeadline) return "Enter the arras deadline";
            if (!form.bank.iban?.trim()) return "Enter the bank IBAN";
            if (!form.bank.bankName?.trim()) return "Enter the bank name";
            if (!form.bank.beneficiary?.trim()) return "Enter the bank beneficiary";
          }
          if (form.type === "reservation") {
            if (!form.price.arras || parseFloat(form.price.arras) <= 0) return "Enter the arras amount";
          }
          if (!form.price.notaryDate) return "Enter the completion date";
        }
      }
      // Step 5: conditions are optional, but notary fields required
      if (s === 5) {
        if (!form.notary?.trim()) return "Enter the notary name";
        if (!form.notaryLocation?.trim()) return "Enter the notary city";
      }
    }
    return null;
  };

  const go = (n) => {
    // Only validate when going forward
    if (n > step) {
      const err = validate(step);
      if (err) { show(err, "err"); return; }
    }
    setStep(n);
  };

  const translateConditions = async () => {
    if (!form.conditions?.trim()) { setTranslatedCond(""); return; }
    setGenState("translating");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conditions: form.conditions, languages: form.languages }),
      });
      const data = await res.json();
      setTranslatedCond(data.translation || "[Translation will be included in contract]");
    } catch (e) { setTranslatedCond("[Translation will be included in generated contract]"); }
    setGenState("idle");
  };

  const generate = async () => {
    setGenState("generating");
    try {
      let response;
      if (form.type === "ficha") {
        const fd = new FormData();
        fd.append('formData', JSON.stringify(form));
        form.fichaFiles.forEach(f => {
          fd.append('files', f.file, f.name);
        });
        response = await fetch("/api/generate", {
          method: "POST",
          body: fd,
        });
      } else {
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      const email = form.type === "ficha" ? "info@costablancainvestments.com" : "legal@costablancainvestments.com";
      show(`Ficha sent to ${email}!`, "ok");
    } catch (e) {
      show(e.message || "Error generating ficha. Please try again.", "err");
    }
    setGenState("done");
  };

  const selLangs = form.languages.map(c=>LANGS.find(l=>l.code===c)).filter(Boolean);
  const buyerFull = () => { let n=`${form.buyer.title} ${form.buyer.name}`; if (form.buyer.hasPartner&&form.buyer.partner.name) n+=` y ${form.buyer.partner.title} ${form.buyer.partner.name}`; return n; };
  const sellerFull = () => { let n=`${form.seller.title} ${form.seller.name}`; if (form.seller.hasPartner&&form.seller.partner.name) n+=` y ${form.seller.partner.title} ${form.seller.partner.name}`; return n; };

  return (
    <div style={S.app}>
      <header style={S.header}><div style={S.headerInner}>
        <div/>
        <img src="/logo.png" alt="CBLI" style={{height:110,objectFit:"contain",position:"absolute",left:"50%",transform:"translateX(-50%)"}}/>
        <div style={S.headerRight}>{form.type&&<span style={S.badge}>{form.type==="arras"?"ARRAS":form.type==="commission"?"HONORARIOS":form.type==="ficha"?"FICHA PRODUCTO":"RESERVA"}</span>}{form.type!=="ficha"&&selLangs.map(l=><span key={l.code} style={S.badge}>{l.flag}</span>)}</div>
      </div></header>

      <div style={S.stepsOuter}><div style={S.stepsInner}>
        {(form.type==="ficha"?["Type","Owner","Property","Documents","Review"]:["Contract","Parties","Property","Price","Conditions","Generate"]).map((s,i)=>(
          <div key={i} style={S.step(step===i+1,step>i+1)} onClick={()=>go(i+1)}>
            <span style={S.stepNum(step===i+1,step>i+1)}>{step>i+1?"✓":i+1}</span>
            <span style={S.stepLbl}>{s}</span>
          </div>
        ))}
      </div></div>

      <main style={S.main}>

        {step===1&&<>
          <Card title="Contract Type"><div style={S.typeRow}>
            {[{t:"reservation",icon:"📋",name:"Contrato de Reserva",desc:"Initial reservation — non-refundable deposit held by CBLI"},
              {t:"arras",icon:"📑",name:"Contrato de Arras",desc:"Binding deposit — arras penitenciales (Art. 1.454 CC)"},
              {t:"commission",icon:"💼",name:"Reconocimiento de Honorarios",desc:"Commission agreement between seller and CBLI"},
              {t:"ficha",icon:"🏠",name:"Ficha Producto",desc:"Property listing sheet — send to info@ for upload"}
            ].map(c=>(
              <div key={c.t} style={S.typeCard(form.type===c.t)} onClick={()=>set("type",c.t)}>
                <div style={{fontSize:28,marginBottom:6}}>{c.icon}</div>
                <div style={{fontWeight:700,fontSize:14}}>{c.name}</div>
                <div style={{fontSize:11.5,color:"#8A8A8A",marginTop:4,lineHeight:1.4}}>{c.desc}</div>
              </div>
            ))}
          </div></Card>

          {form.type!=="ficha"&&<Card title="Languages">
            <p style={S.hint}>Spanish is always included. Optionally add more languages for a bilingual contract:</p>
            <div style={S.langRow}>
              <span style={S.langFixed}>🇪🇸 Español (siempre)</span>
              {LANGS.map(l=>(<span key={l.code} style={S.langChip(form.languages.includes(l.code))} onClick={()=>toggleLang(l.code)}>{form.languages.includes(l.code)&&"✓ "}{l.flag} {l.name}</span>))}
            </div>
            {form.languages.length===0&&<div style={{...S.note,marginTop:12}}>📄 Contract will be in Spanish only</div>}
            {form.languages.length===1&&<div style={{...S.note,marginTop:12}}>📄 Bilingual contract: Spanish + {selLangs[0]?.name}</div>}
            {form.languages.length>1&&<div style={{...S.note,marginTop:12}}>📄 Contract will have {form.languages.length+1} language versions</div>}
          </Card>}

          <Card title="Agent"><F label="Your Name" path="agentName" form={form} set={set} ph="e.g. María, Bruno, Ana..."/></Card>
          {form.type!=="ficha"&&<Card title="Date & Location"><Grid><F label="Date" path="date" type="date" form={form} set={set}/><F label="City" path="city" form={form} set={set} ph="Altea"/></Grid></Card>}
          {form.type==="ficha"&&<Card title="Date"><F label="Date" path="date" type="date" form={form} set={set}/></Card>}
          <Nav onNext={()=>go(2)}/>
        </>}

        {step===2&&<>
          {form.type==="ficha"?<>
            <Card title="Property Owner">
              <Grid>
                <F label="Owner Name" path="ficha.owner" form={form} set={set} ph="Full name"/>
                <F label="Phone / Email" path="ficha.phone" form={form} set={set} ph="+34 600 000 000"/>
              </Grid>
              <Grid style={{marginTop:14}}>
                <F label="Address" path="ficha.address" form={form} set={set} full ph="Full property address"/>
              </Grid>
              <Grid style={{marginTop:14}}>
                <F label="City" path="ficha.city" form={form} set={set} ph="Altea"/>
                <F label="Type of Property" path="ficha.propertyType" options={[{value:"Villa",label:"Villa"},{value:"Apartment",label:"Apartment"},{value:"Town House",label:"Town House"},{value:"Plot",label:"Plot"},{value:"Commercial Premises",label:"Commercial Premises"},{value:"Duplex",label:"Duplex"}]} form={form} set={set}/>
              </Grid>
              <Grid style={{marginTop:14}}>
                <F label="Commission Rate (%)" path="ficha.commissionRate" form={form} set={set} ph="5%"/>
              </Grid>
            </Card>
            <Nav onBack={()=>go(1)} onNext={()=>go(3)}/>
          </>:<>
            <PersonCard title="Buyer — Comprador" role="buyer" form={form} set={set}/>
            <PersonCard title="Seller — Vendedor" role="seller" form={form} set={set} idFirst="DNI"/>
            <Nav onBack={()=>go(1)} onNext={()=>go(3)}/>
          </>}
        </>}

        {step===3&&<>
          {form.type!=="ficha"&&<>
            <Card title="Property — Inmueble"><Grid>
              <F label="Property Type" path="property.type" options={PROP_TYPES} form={form} set={set}/>
              <F label="Property Ref. Number" path="property.ref" form={form} set={set} ph="CBLI-12345"/>
              <F label="Referencia Catastral" path="property.catastral" form={form} set={set} ph="20-digit cadastral reference"/>
              <F label="Full Address" path="property.address" form={form} set={set} full ph="Calle Sierra Bernia 15, 03590 Altea, Alicante"/>
            </Grid></Card>
            <Card title="Registro de la Propiedad"><Grid cols={3}>
              <F label="Registry of" path="property.registry" form={form} set={set} ph="Altea"/>
              <F label="Finca Nº" path="property.finca" form={form} set={set} ph="12345"/>
              <F label="Tomo" path="property.tomo" form={form} set={set} ph="1234"/>
              <F label="Libro" path="property.libro" form={form} set={set} ph="567"/>
              <F label="Folio" path="property.folio" form={form} set={set} ph="89"/>
            </Grid></Card>
            {form.type!=="commission"&&<Card title="Furniture"><F label="Furniture included?" path="property.furniture" options={[{value:"included",label:"Yes — furniture & appliances included"},{value:"not_included",label:"No — not included"},{value:"partial",label:"Partial — per inventory list"}]} form={form} set={set}/></Card>}
            {form.type!=="commission"&&<Card title="Additional Properties">
              <Note>Check if the sale includes a parking space or storage room.</Note>
              {form.extraProperties.map((ep, idx) => (
                <div key={idx}>
                  <div style={S.partnerToggle} onClick={()=>set(`extraProperties.${idx}.enabled`, !ep.enabled)}>
                    <div style={S.chk(ep.enabled)}>{ep.enabled&&"✓"}</div>
                    <span>{idx===0 ? "Include Aparcamiento / Garage" : "Include Trastero / Storage Room"}</span>
                  </div>
                  {ep.enabled && (
                    <div style={S.partnerBox}>
                      <Grid cols={3}>
                        <F label="Referencia Catastral" path={`extraProperties.${idx}.catastral`} form={form} set={set} ph="20-digit cadastral reference"/>
                        <F label="Finca Nº" path={`extraProperties.${idx}.finca`} form={form} set={set} ph="12346"/>
                        <F label="Tomo" path={`extraProperties.${idx}.tomo`} form={form} set={set} ph="1234"/>
                        <F label="Libro" path={`extraProperties.${idx}.libro`} form={form} set={set} ph="567"/>
                        <F label="Folio" path={`extraProperties.${idx}.folio`} form={form} set={set} ph="89"/>
                      </Grid>
                    </div>
                  )}
                </div>
              ))}
            </Card>}
            <Nav onBack={()=>go(2)} onNext={()=>go(4)}/>
          </>}
        </>}

        {step===3&&form.type==="ficha"&&<>
          <Card title="Pricing">
            <Grid>
              <F label="Price (€)" path="ficha.price" type="number" form={form} set={set} ph="450000"/>
            </Grid>
            {form.ficha.price&&<div style={{...S.note,marginTop:8}}>📝 {fmtWords(form.ficha.price)}</div>}
          </Card>

          <Card title="Annual / Monthly Costs">
            <Grid>
              <F label="IBI / year (€)" path="ficha.ibi" type="number" form={form} set={set} ph="1200"/>
              <F label="Community / month (€)" path="ficha.community" type="number" form={form} set={set} ph="150"/>
              <F label="Garbage / year (€)" path="ficha.garbage" type="number" form={form} set={set} ph="80"/>
              <F label="Water Bill / month (€)" path="ficha.water" type="number" form={form} set={set} ph="40"/>
              <F label="Electricity Bill / month (€)" path="ficha.electricity" type="number" form={form} set={set} ph="80"/>
            </Grid>
            <div style={{marginTop:8,fontSize:11,color:"#888",lineHeight:1.6}}>
              {form.ficha.ibi&&<div>IBI: {fmtWords(form.ficha.ibi)}</div>}
              {form.ficha.community&&<div>Community: {fmtWords(form.ficha.community)}</div>}
              {form.ficha.garbage&&<div>Garbage: {fmtWords(form.ficha.garbage)}</div>}
              {form.ficha.water&&<div>Water: {fmtWords(form.ficha.water)}</div>}
              {form.ficha.electricity&&<div>Electricity: {fmtWords(form.ficha.electricity)}</div>}
            </div>
          </Card>

          <Card title="Property Details">
            <Grid>
              <F label="Plot Size (m²)" path="ficha.plotM2" type="number" form={form} set={set} ph="800"/>
              <F label="Surface Built (m²)" path="ficha.surfaceBuilt" type="number" form={form} set={set} ph="250"/>
              <F label="Year Built" path="ficha.builtYear" form={form} set={set} ph="2005"/>
              <F label="Orientation" path="ficha.orientation" form={form} set={set} ph="South"/>
              <F label="Floors" path="ficha.floors" type="number" form={form} set={set} ph="2"/>
              <F label="Time on Market" path="ficha.timeOnMarket" form={form} set={set} ph="3 months"/>
              <F label="Bedrooms" path="ficha.bedrooms" type="number" form={form} set={set} ph="3"/>
              <F label="Bathrooms" path="ficha.bathrooms" type="number" form={form} set={set} ph="2"/>
              <F label="Toilets" path="ficha.toilets" type="number" form={form} set={set} ph="1"/>
              <F label="Heating" path="ficha.heating" form={form} set={set} ph="Central"/>
              <F label="Parkings" path="ficha.parkings" type="number" form={form} set={set} ph="2"/>
              <F label="Refurbished Year" path="ficha.refurbishedYear" form={form} set={set} ph="2020"/>
            </Grid>
          </Card>

          <Card title="Features & Amenities">
            <Grid>
              <F label="Upload on WEB" path="ficha.uploadWeb" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Upload on IDEALISTA" path="ficha.uploadIdealista" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Underground Parking" path="ficha.underground" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Views" path="ficha.views" options={[{value:"Sea",label:"Sea"},{value:"Mountain",label:"Mountain"},{value:"None",label:"None"}]} form={form} set={set}/>
              <F label="Covered Garage" path="ficha.coveredGarage" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Guest Apartment" path="ficha.guestApartment" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Air Conditioning" path="ficha.airConditioning" options={[{value:"Nuevos",label:"Nuevos (New)"},{value:"Viejos",label:"Viejos (Old)"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Swimming Pool" path="ficha.swimmingPool" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Furniture Included" path="ficha.furnitureIncluded" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Lift" path="ficha.lift" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Garden" path="ficha.garden" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Tourist Licence" path="ficha.touristLicence" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="CBI Sign outside" path="ficha.cbiSign" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
              <F label="Do we have keys" path="ficha.haveKeys" options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} form={form} set={set}/>
            </Grid>
          </Card>

          <Card title="Requested Documents">
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={form.ficha?.nies||false} onChange={e=>set("ficha.nies",e.target.checked)} style={{width:18,height:18,cursor:"pointer"}}/>
                <label style={{cursor:"pointer"}}>NIEs</label>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={form.ficha?.dniPassports||false} onChange={e=>set("ficha.dniPassports",e.target.checked)} style={{width:18,height:18,cursor:"pointer"}}/>
                <label style={{cursor:"pointer"}}>DNI / Passports</label>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={form.ficha?.escritura||false} onChange={e=>set("ficha.escritura",e.target.checked)} style={{width:18,height:18,cursor:"pointer"}}/>
                <label style={{cursor:"pointer"}}>Escritura (Purchase Deed)</label>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={form.ficha?.floorPlans||false} onChange={e=>set("ficha.floorPlans",e.target.checked)} style={{width:18,height:18,cursor:"pointer"}}/>
                <label style={{cursor:"pointer"}}>Floor Plans</label>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={form.ficha?.cee||false} onChange={e=>set("ficha.cee",e.target.checked)} style={{width:18,height:18,cursor:"pointer"}}/>
                <label style={{cursor:"pointer"}}>CEE (Energy Certificate)</label>
              </div>
            </div>
          </Card>

          <Card title="Extra Comments">
            <F label="Comments" path="ficha.extraComments" type="textarea" form={form} set={set} ph="Any additional information about the property..."/>
          </Card>

          <Nav onBack={()=>go(2)} onNext={()=>go(4)}/>
        </>}

        {step===4&&form.type!=="ficha"&&<>
          <Card title="Sale Price">
            <Grid>
              <F label="Total Price (€)" path="price.total" type="number" form={form} set={set} ph="450000"/>
              <div style={{display:"flex",flexDirection:"column"}}>
                <label style={S.fLabel}>Price in Words (auto-generated)</label>
                <div style={S.autoBox}>{form.price.words ? form.price.words+" EUROS" : "Enter total price..."}</div>
              </div>
            </Grid>
            {form.price.words&&<div style={{...S.note,marginTop:12}}>✅ <strong>{form.price.words} EUROS</strong> ({fmt(form.price.total)})</div>}
          </Card>
          {form.type==="commission"?<>
            <Card title="Commission Details">
              <Note>Comisión neta y desglose de pagos.</Note>
              <Grid><F label="Total Commission Net (€)" path="commission.totalCommission" type="number" form={form} set={set} ph="30000"/><RO label="IVA 21% (auto)" value={form.commission.totalIVA ? fmt(form.commission.totalIVA) : "___€"}/></Grid>
              {form.commission.totalCommission&&<div style={{...S.note,marginTop:12}}>✅ <strong>Total with IVA: {fmt(form.commission.totalWithIVA)}</strong></div>}
            </Card>
            <Card title="Discount">
              <Note>Descuento opcional sobre la comisión total. Dejar en blanco si no aplica.</Note>
              <Grid><F label="Discount Amount (€)" path="commission.discount" type="number" form={form} set={set} ph="0"/><RO label="Commission after Discount (auto)" value={form.commission.netAfterDiscount && parseFloat(form.commission.discount) > 0 ? fmt(form.commission.netAfterDiscount) : fmt(form.commission.totalCommission)}/></Grid>
              {parseFloat(form.commission.discount) > 0 && <div style={{...S.note,marginTop:12}}>💰 <strong>Net after discount: {fmt(form.commission.netAfterDiscount)}</strong> + IVA: <strong>{fmt(form.commission.totalWithIVA)}</strong></div>}
            </Card>
            <Card title="Payment Breakdown">
              <Note>Desglose de pagos de la comisión.</Note>
              <Grid><F label="First Payment Net (€)" path="commission.firstPayment" type="number" form={form} set={set} ph="15000"/><RO label="First Payment + IVA (auto)" value={form.commission.firstPaymentIVA && form.commission.firstPayment ? fmt(form.commission.firstPaymentIVA) : "___€"}/></Grid>
              <Grid style={{marginTop:14}}><F label="Second Payment Net (€)" path="commission.secondPayment" type="number" form={form} set={set} ph="15000"/><RO label="Second Payment + IVA (auto)" value={form.commission.secondPaymentIVA && form.commission.secondPayment ? fmt(form.commission.secondPaymentIVA) : "___€"}/></Grid>
            </Card>
            <Nav onBack={()=>go(3)} onNext={()=>go(6)}/>
          </>:<>
            <Card title="Payment Breakdown">
              <Note>Define the payment schedule for this transaction.</Note>
              <Grid><F label={form.type==="arras"?"Reservation (€) - optional":"Reservation (€)"} path="price.reservation" type="number" form={form} set={set} ph="10000"/><F label={form.type==="arras"?"Reservation Date - optional":"Reservation Date"} path="price.reservationDate" type="date" form={form} set={set}/></Grid>
              {form.type==="arras"&&<Grid style={{marginTop:14}}><F label="Arras Deposit (€)" path="price.arras" type="number" form={form} set={set} ph="35000"/><F label="Arras Deadline" path="price.arrasDeadline" type="date" form={form} set={set}/></Grid>}
              {form.type==="reservation"&&<Grid style={{marginTop:14}}><F label="Arras for future contract (€)" path="price.arras" type="number" form={form} set={set} ph="32000"/><RO label="Remaining (€)" value={fmt(form.price.remaining)}/></Grid>}
              <Grid style={{marginTop:14}}>{form.type==="arras"&&<RO label="Remaining at Notary (€)" value={fmt(form.price.remaining)}/>}<F label="Completion Date" path="price.notaryDate" type="date" form={form} set={set}/></Grid>
            </Card>
            {form.type==="arras"&&<Card title="Seller's Bank"><Note>For arras and final payment transfers.</Note><Grid>
              <F label="IBAN" path="bank.iban" form={form} set={set} ph="ES12 3456 7890..."/>
              <F label="Bank" path="bank.bankName" form={form} set={set} ph="Banco Sabadell"/>
              <F label="Beneficiary" path="bank.beneficiary" form={form} set={set} full ph="Seller name or company"/>
            </Grid></Card>}
            {form.type==="reservation"&&<Card title="Arras Timeline"><Note>Days to sign arras after reservation.</Note><Grid>
              <F label="Days to sign arras" path="arrasSignDays" type="number" form={form} set={set}/>
              <F label="Days to transfer" path="arrasTransferDays" type="number" form={form} set={set}/>
            </Grid></Card>}
            <Nav onBack={()=>go(3)} onNext={()=>go(5)}/>
          </>}
        </>}

        {form.type==="ficha"&&step===4&&<>
          <Card title="Upload Documents">
            <Note>Upload required property documents for the listing.</Note>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={S.fLabel}>IBI (Property Tax) - Required</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const f=e.target.files?.[0];if(f)set("fichaFiles",[...form.fichaFiles.filter(x=>x.type!=="ibi"),{type:"ibi",name:f.name,file:f}])}} style={{...S.input,cursor:"pointer"}}/>
                {form.fichaFiles.find(x=>x.type==="ibi")&&<div style={{fontSize:11,color:"#2D7A4F",marginTop:6}}>✓ {form.fichaFiles.find(x=>x.type==="ibi").name}</div>}
              </div>
              <div>
                <label style={S.fLabel}>Garbage / Basura - Required</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const f=e.target.files?.[0];if(f)set("fichaFiles",[...form.fichaFiles.filter(x=>x.type!=="garbage"),{type:"garbage",name:f.name,file:f}])}} style={{...S.input,cursor:"pointer"}}/>
                {form.fichaFiles.find(x=>x.type==="garbage")&&<div style={{fontSize:11,color:"#2D7A4F",marginTop:6}}>✓ {form.fichaFiles.find(x=>x.type==="garbage").name}</div>}
              </div>
              <div>
                <label style={S.fLabel}>Community / Comunidad - Optional</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const f=e.target.files?.[0];if(f)set("fichaFiles",[...form.fichaFiles.filter(x=>x.type!=="community"),{type:"community",name:f.name,file:f}])}} style={{...S.input,cursor:"pointer"}}/>
                {form.fichaFiles.find(x=>x.type==="community")&&<div style={{fontSize:11,color:"#2D7A4F",marginTop:6}}>✓ {form.fichaFiles.find(x=>x.type==="community").name}</div>}
              </div>
              <div>
                <label style={S.fLabel}>ID/Passport Seller - Required</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const f=e.target.files?.[0];if(f)set("fichaFiles",[...form.fichaFiles.filter(x=>x.type!=="dniPassports"),{type:"dniPassports",name:f.name,file:f}])}} style={{...S.input,cursor:"pointer"}}/>
                {form.fichaFiles.find(x=>x.type==="dniPassports")&&<div style={{fontSize:11,color:"#2D7A4F",marginTop:6}}>✓ {form.fichaFiles.find(x=>x.type==="dniPassports").name}</div>}
              </div>
              <div>
                <label style={S.fLabel}>Contract of Sale - Required</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const f=e.target.files?.[0];if(f)set("fichaFiles",[...form.fichaFiles.filter(x=>x.type!=="contract"),{type:"contract",name:f.name,file:f}])}} style={{...S.input,cursor:"pointer"}}/>
                {form.fichaFiles.find(x=>x.type==="contract")&&<div style={{fontSize:11,color:"#2D7A4F",marginTop:6}}>✓ {form.fichaFiles.find(x=>x.type==="contract").name}</div>}
              </div>
              <div>
                <label style={S.fLabel}>Escritura (Purchase Deed) - Required</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const f=e.target.files?.[0];if(f)set("fichaFiles",[...form.fichaFiles.filter(x=>x.type!=="escritura"),{type:"escritura",name:f.name,file:f}])}} style={{...S.input,cursor:"pointer"}}/>
                {form.fichaFiles.find(x=>x.type==="escritura")&&<div style={{fontSize:11,color:"#2D7A4F",marginTop:6}}>✓ {form.fichaFiles.find(x=>x.type==="escritura").name}</div>}
              </div>
              <div>
                <label style={S.fLabel}>Water/Electricity/Gas Invoice - Optional</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const f=e.target.files?.[0];if(f)set("fichaFiles",[...form.fichaFiles.filter(x=>x.type!=="invoice"),{type:"invoice",name:f.name,file:f}])}} style={{...S.input,cursor:"pointer"}}/>
                {form.fichaFiles.find(x=>x.type==="invoice")&&<div style={{fontSize:11,color:"#2D7A4F",marginTop:6}}>✓ {form.fichaFiles.find(x=>x.type==="invoice").name}</div>}
              </div>
            </div>
          </Card>
          <Nav onBack={()=>go(3)} onNext={()=>go(5)}/>
        </>}

        {form.type!=="commission"&&form.type!=="ficha"&&step===5&&<>
          <Card title="Special Conditions">
            <Note>Write in Spanish. AI translates to {selLangs.map(l=>l.name).join(", ")||"selected languages"} automatically.</Note>
            <F label="Condiciones Especiales" path="conditions" type="textarea" form={form} set={set} ph="e.g. La venta incluye plaza de garaje y trastero..."/>
            <Grid style={{marginTop:16}}><F label="Notary" path="notary" form={form} set={set} ph="Azpitarte"/><F label="Notary City" path="notaryLocation" form={form} set={set} ph="Altea"/></Grid>
          </Card>
          <Nav onBack={()=>go(4)} onNext={()=>{translateConditions();go(6);}} nextLabel="Preview & Generate →"/>
        </>}

        {((form.type==="ficha"&&step===5)||(form.type!=="ficha"&&step===6))&&<>
          <div style={S.banner}>⚡ <strong>Review all details.</strong> Click Generate to create the {form.type==="ficha"?"ficha PDF":"contract"}.</div>

          {form.type==="ficha"?<>
            <Card title="Property Summary"><div style={S.sumGrid}>
              {[["Type","Ficha Producto"],
                ["Price",fmt(form.ficha.price)],
                ["Property",form.ficha.propertyType+" — "+(form.ficha.address||"—")],
                ["City",form.ficha.city||"—"],
                ["Owner",form.ficha.owner||"—"],
                ["Contact",form.ficha.phone||"—"],
                ["Bedrooms",form.ficha.bedrooms||"—"],
                ["Bathrooms",form.ficha.bathrooms||"—"],
                ["Built m²",form.ficha.surfaceBuilt||"—"],
                ["Date",fmtDate(form.date)],
              ].map(([l,v],i)=>(<div key={i} style={S.sumItem}><div style={S.sumL}>{l}</div><div style={S.sumV}>{v}</div></div>))}
            </div></Card>
            <Card title="Uploaded Documents">
              {form.fichaFiles.length===0?<div style={{color:"#8A8A8A",fontSize:13}}>No files uploaded yet</div>:form.fichaFiles.map((f,i)=>(<div key={i} style={{fontSize:12,padding:"6px 0",color:"#2D7A4F"}}>✓ {f.name}</div>))}
            </Card>
          </>:<>
            <Card title="Deal Summary"><div style={S.sumGrid}>
              {(form.type==="commission"?
                [["Type","Reconocimiento de Honorarios"],
                  ["Languages", selLangs.length > 0 ? "🇪🇸 ES + "+selLangs.map(l=>l.flag+" "+l.code.toUpperCase()).join(" + ") : "🇪🇸 Spanish only"],
                  ["Buyer",buyerFull()],["Seller",sellerFull()],
                  ["Property",form.property.type+" — "+(form.property.address||"—")],
                  ["Ref",form.property.ref || "—"],
                  ["Sale Price",fmt(form.price.total)],["Commission Net",fmt(form.commission.totalCommission)],
                  ...(parseFloat(form.commission.discount) > 0 ? [["Discount","-"+fmt(form.commission.discount)],["After Discount",fmt(form.commission.netAfterDiscount)]] : []),
                  ["Commission + IVA",fmt(form.commission.totalWithIVA)],
                  ["First Payment",fmt(form.commission.firstPayment)+" (+ IVA: "+fmt(form.commission.firstPaymentIVA)+")"],
                  ["Second Payment",fmt(form.commission.secondPayment)+" (+ IVA: "+fmt(form.commission.secondPaymentIVA)+")"],
                  ["Date",fmtDate(form.date)+", "+form.city],
                ]
                :[["Type",form.type==="arras"?"Contrato de Arras":"Contrato de Reserva"],
                  ["Languages", selLangs.length > 0 ? "🇪🇸 ES + "+selLangs.map(l=>l.flag+" "+l.code.toUpperCase()).join(" + ") : "🇪🇸 Spanish only"],
                  ["Buyer",buyerFull()],["Seller",sellerFull()],
                  ["Property",form.property.type+" — "+(form.property.address||"—")],
                  ["Ref",form.property.ref || "—"],
                  ["Catastral",form.property.catastral||"—"],
                  ["Price",fmt(form.price.total)],["In Words",(form.price.words||"—")+" EUROS"],
                  ["Reservation",fmt(form.price.reservation)],["Arras",fmt(form.price.arras)],
                  ["Remaining",fmt(form.price.remaining)],["Completion",fmtDate(form.price.notaryDate)],
                  ["Notary",form.notary+" ("+form.notaryLocation+")"],["Date",fmtDate(form.date)+", "+form.city],
                ]
              ).map(([l,v],i)=>(<div key={i} style={S.sumItem}><div style={S.sumL}>{l}</div><div style={S.sumV}>{v}</div></div>))}
            </div></Card>

            <Card title="Buyer Details">
              <DRow l="Name" v={buyerFull()}/><DRow l="Nationality" v={form.buyer.nationality+(form.buyer.hasPartner&&form.buyer.partner.nationality?" / "+form.buyer.partner.nationality:"")}/><DRow l="ID" v={form.buyer.idType+" "+form.buyer.idNumber+(form.buyer.hasPartner&&form.buyer.partner.idNumber?" / "+form.buyer.partner.idType+" "+form.buyer.partner.idNumber:"")}/>{(form.buyer.nie||(form.buyer.hasPartner&&form.buyer.partner.nie))&&<DRow l="NIE" v={form.buyer.nie+(form.buyer.hasPartner&&form.buyer.partner.nie?" / "+form.buyer.partner.nie:"")}/>}<DRow l="Address" v={form.buyer.address}/>
            </Card>
            <Card title="Seller Details">
              <DRow l="Name" v={sellerFull()}/><DRow l="Nationality" v={form.seller.nationality+(form.seller.hasPartner&&form.seller.partner.nationality?" / "+form.seller.partner.nationality:"")}/><DRow l="ID" v={form.seller.idType+" "+form.seller.idNumber+(form.seller.hasPartner&&form.seller.partner.idNumber?" / "+form.seller.partner.idType+" "+form.seller.partner.idNumber:"")}/>{form.type==="arras"&&form.bank.iban&&<DRow l="Bank" v={form.bank.iban+" — "+form.bank.bankName}/>}
            </Card>

            {form.conditions?.trim()&&<Card title="Special Conditions">
              <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:"#8A8A8A",marginBottom:4}}>🇪🇸 SPANISH</div><div style={{fontSize:13,lineHeight:1.6}}>{form.conditions}</div></div>
              {genState==="translating"?<div style={{fontSize:13,color:"#8A8A8A",fontStyle:"italic"}}>⏳ Translating...</div>:translatedCond?<div><div style={{fontSize:11,fontWeight:700,color:"#1A3A5C",marginBottom:4}}>{selLangs.map(l=>l.flag).join(" ")} TRANSLATIONS</div><div style={{fontSize:13,lineHeight:1.6,fontStyle:"italic",color:"#1A3A5C",whiteSpace:"pre-wrap"}}>{translatedCond}</div></div>:<div style={{fontSize:12,color:"#8A8A8A"}}>Translations generated with contract</div>}
            </Card>}
          </>}

          <div style={{display:"flex",gap:12,marginTop:4}}>
            <button style={S.btnSec} onClick={()=>go(5)}>← Edit</button>
            <button style={{...S.btnGen,opacity:genState==="generating"?0.6:1}} onClick={generate} disabled={genState==="generating"}>
              {genState==="generating"?"⏳ Generating & Sending...":genState==="done"?"✅ Sent! — Send Again":form.type==="ficha"?"📧 Generate & Send Ficha":"📧 Generate & Send to Lawyer"}
            </button>
          </div>
          <div style={{textAlign:"center",marginTop:8,fontSize:12,color:"#8A8A8A"}}>{form.type==="ficha"?"PDF will be sent to info@costablancainvestments.com":"PDF + Word will be sent to legal@costablancainvestments.com"}</div>
          <button style={{...S.btnSec,marginTop:12,width:"100%"}} onClick={()=>{setForm(blank());setStep(1);setGenState("idle");setTranslatedCond("");}}>🔄 New {form.type==="ficha"?"Ficha":"Contract"}</button>
        </>}
      </main>
      <footer style={S.footer}>Congrats, new sale coming! Now take your time to fill in all the correct info. No rush, do it perfect.</footer>
      {toast&&<div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );
}

// ═══ PERSON CARD (reusable for buyer & seller) ═══
function PersonCard({ title, role, form, set, idFirst }) {
  const p = form[role];
  const idOpts = idFirst==="DNI" ? [ID_TYPES[1],ID_TYPES[0],ID_TYPES[2]] : ID_TYPES;
  return (
    <Card title={title}>
      {role==="buyer"&&<Note>For couples, check "Add partner" below to enter both people's details separately.</Note>}
      <Grid>
        <F label="Title" path={`${role}.title`} options={TITLES} form={form} set={set}/>
        <F label="Full Name" path={`${role}.name`} form={form} set={set} ph={role==="buyer"?"John Smith":"María García López"}/>
        <NatField role={role} path={`${role}.nationality`} form={form} set={set}/>
        <F label="ID Type (NIE / DNI / Passport)" path={`${role}.idType`} options={idOpts} form={form} set={set}/>
        <F label="ID Number" path={`${role}.idNumber`} form={form} set={set} ph={role==="buyer"?"X-1234567-A":"12345678-A"}/>
        <F label="Address" path={`${role}.address`} form={form} set={set} full ph="Full address with postal code"/>
      </Grid>

      <div style={S.partnerToggle} onClick={()=>set(`${role}.hasPartner`,!p.hasPartner)}>
        <div style={S.chk(p.hasPartner)}>{p.hasPartner&&"✓"}</div>
        <span>Add partner / spouse (second {role==="buyer"?"buyer":"seller"})</span>
      </div>

      {p.hasPartner&&<div style={S.partnerBox}>
        <div style={{fontSize:13,fontWeight:700,color:"#1A3A5C",marginBottom:12}}>👤 Second {role==="buyer"?"Buyer":"Seller"}</div>
        <Grid>
          <F label="Title" path={`${role}.partner.title`} options={TITLES} form={form} set={set}/>
          <F label="Full Name" path={`${role}.partner.name`} form={form} set={set} ph={role==="buyer"?"Jane Smith":"Carlos García"}/>
          <NatField role={role} path={`${role}.partner.nationality`} form={form} set={set}/>
          <F label="ID Type (NIE / DNI / Passport)" path={`${role}.partner.idType`} options={idOpts} form={form} set={set}/>
          <F label="ID Number" path={`${role}.partner.idNumber`} form={form} set={set} ph={role==="buyer"?"CD789012":"87654321-B"}/>
        </Grid>
      </div>}
    </Card>
  );
}

// ═══ NATIONALITY DROPDOWN WITH "OTROS" OPTION ═══
function NatField({ role, path, form, set }) {
  const val = path.split(".").reduce((o, k) => o?.[k], form) ?? "";
  const knownValues = NATIONALITIES.filter(n => n.value !== "otros").map(n => n.value);
  const isKnown = knownValues.includes(val);
  const showCustom = val === "otros" || (!isKnown && val !== "");
  const selectVal = isKnown ? val : (val === "" ? "" : "otros");
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={S.fLabel}>Nationality</label>
      <select style={S.input} value={selectVal} onChange={e => {
        if (e.target.value === "otros") set(path, "otros");
        else set(path, e.target.value);
      }}>
        <option value="">-- Select --</option>
        {NATIONALITIES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
      </select>
      {(selectVal === "otros" || showCustom) && (
        <input style={{ ...S.input, marginTop: 6 }} type="text" value={val === "otros" ? "" : (isKnown ? "" : val)} onChange={e => set(path, e.target.value || "otros")} placeholder="Escribir nacionalidad..." />
      )}
    </div>
  );
}

// ═══ SMALL COMPONENTS ═══
function Card({title,children}){return<div style={S.card}>{title&&<div style={S.cardT}>{title}</div>}{children}</div>}
function Grid({children,cols=2,style:ex}){return<div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:14,...ex}}>{children}</div>}
function Note({children}){return<div style={S.note}>{children}</div>}
function DRow({l,v}){return<div style={{fontSize:13,lineHeight:1.8}}><span style={{fontWeight:700,color:"#1A3A5C",marginRight:4}}>{l}:</span>{v}</div>}
function F({label,path,type="text",options,full,ph,form,set}){
  const val=path.split(".").reduce((o,k)=>o?.[k],form)??"";
  return(<div style={{display:"flex",flexDirection:"column",...(full?{gridColumn:"1/-1"}:{})}}>
    <label style={S.fLabel}>{label}</label>
    {options?<select style={S.input} value={val} onChange={e=>set(path,e.target.value)}>{options.map(o=><option key={typeof o==="string"?o:o.value} value={typeof o==="string"?o:o.value}>{typeof o==="string"?o:o.label}</option>)}</select>
    :type==="textarea"?<textarea style={{...S.input,minHeight:80,resize:"vertical"}} value={val} onChange={e=>set(path,e.target.value)} placeholder={ph}/>
    :<input style={S.input} type={type} value={val} onChange={e=>set(path,e.target.value)} placeholder={ph}/>}
  </div>);
}
function RO({label,value}){return<div style={{display:"flex",flexDirection:"column"}}><label style={S.fLabel}>{label}</label><div style={{...S.input,background:"#F0EDE6",color:"#1A3A5C",fontWeight:600}}>{value}</div></div>}
function Nav({onBack,onNext,nextLabel="Next →"}){return<div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>{onBack?<button style={S.btnSec} onClick={onBack}>← Back</button>:<div/>}{onNext&&<button style={S.btnPri} onClick={onNext}>{nextLabel}</button>}</div>}

// ═══ STYLES ═══
const S = {
  app:{fontFamily:"'Figtree','DM Sans',-apple-system,sans-serif",background:"linear-gradient(180deg,#F5F2EC,#EDE8E0)",minHeight:"100vh",color:"#1E1E1E"},
  footer:{textAlign:"center",padding:"28px 20px",color:"#8A8A8A",fontSize:13,fontStyle:"italic",lineHeight:1.6},
  header:{background:"#000000",borderBottom:"3px solid #C8956C"},
  headerInner:{maxWidth:960,margin:"0 auto",padding:"24px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",minHeight:110},
  logo:{fontFamily:"Georgia,serif",color:"#fff",fontSize:21,fontWeight:700},
  gold:{color:"#C8956C"},
  logoSub:{color:"rgba(255,255,255,0.45)",fontSize:11,fontWeight:600,letterSpacing:2.5,textTransform:"uppercase",marginTop:2},
  headerRight:{display:"flex",gap:6},
  badge:{background:"rgba(200,149,108,0.2)",color:"#C8956C",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:700},
  stepsOuter:{background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",position:"sticky",top:0,zIndex:50},
  stepsInner:{maxWidth:960,margin:"0 auto",display:"flex",padding:"4px 8px",gap:2},
  step:(a,d)=>({flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"10px 4px",borderRadius:8,cursor:"pointer",background:a?"#1A3A5C":d?"#E8DFD3":"transparent",color:a?"#fff":d?"#1A3A5C":"#AAA",transition:"all 0.2s"}),
  stepNum:(a,d)=>({width:20,height:20,lineHeight:"20px",borderRadius:"50%",textAlign:"center",fontSize:10,fontWeight:700,background:a?"rgba(255,255,255,0.2)":d?"#1A3A5C":"#E5E2DC",color:a||d?"#fff":"#AAA",flexShrink:0}),
  stepLbl:{fontSize:11.5,fontWeight:600},
  main:{maxWidth:960,margin:"0 auto",padding:"24px 16px 80px"},
  card:{background:"#fff",borderRadius:12,padding:"22px 26px",marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.04)"},
  cardT:{fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#1A3A5C",marginBottom:16,paddingBottom:10,borderBottom:"2px solid #E8DFD3"},
  fLabel:{fontSize:10.5,fontWeight:700,color:"#8A8A8A",textTransform:"uppercase",letterSpacing:0.8,marginBottom:5},
  input:{padding:"10px 13px",border:"1.5px solid #E0DCD5",borderRadius:8,fontSize:14,color:"#1E1E1E",background:"#FAFAF8",outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"},
  autoBox:{padding:"10px 13px",border:"1.5px solid #C8956C",borderRadius:8,fontSize:13,color:"#1A3A5C",background:"#FFF9F2",fontWeight:600,minHeight:40,display:"flex",alignItems:"center"},
  hint:{fontSize:13,color:"#8A8A8A",marginBottom:12},
  note:{fontSize:12,color:"#7A6F60",padding:"9px 14px",background:"#FBF8F2",borderLeft:"3px solid #C8956C",borderRadius:"0 8px 8px 0",marginBottom:14,lineHeight:1.5},
  typeRow:{display:"flex",gap:14},
  typeCard:(s)=>({flex:1,padding:20,border:`2px solid ${s?"#1A3A5C":"#E5E2DC"}`,borderRadius:12,cursor:"pointer",textAlign:"center",background:s?"rgba(26,58,92,0.03)":"#fff",boxShadow:s?"0 0 0 3px rgba(26,58,92,0.08)":"none",transition:"all 0.2s"}),
  langRow:{display:"flex",flexWrap:"wrap",gap:8},
  langFixed:{padding:"8px 14px",borderRadius:50,fontSize:12.5,fontWeight:600,background:"#E8DFD3",color:"#1A3A5C",border:"2px solid #C8956C"},
  langChip:(s)=>({padding:"8px 14px",borderRadius:50,fontSize:12.5,fontWeight:600,cursor:"pointer",border:`2px solid ${s?"#1A3A5C":"#E0DCD5"}`,background:s?"#1A3A5C":"#fff",color:s?"#fff":"#1E1E1E",userSelect:"none",transition:"all 0.2s"}),
  partnerToggle:{display:"flex",alignItems:"center",gap:10,marginTop:16,padding:"12px 16px",background:"#FAFAF8",borderRadius:8,cursor:"pointer",border:"1px solid #E8E4DD",fontSize:13,fontWeight:600,color:"#1A3A5C",userSelect:"none"},
  chk:(c)=>({width:22,height:22,borderRadius:6,border:`2px solid ${c?"#1A3A5C":"#D0CCC5"}`,background:c?"#1A3A5C":"#fff",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}),
  partnerBox:{marginTop:12,padding:"16px 18px",background:"#F8F6F2",borderRadius:10,border:"1px dashed #C8956C"},
  btnPri:{padding:"11px 24px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",border:"none",background:"#1A3A5C",color:"#fff"},
  btnSec:{padding:"11px 24px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",border:"2px solid #1A3A5C",background:"transparent",color:"#1A3A5C"},
  btnGen:{flex:1,padding:"14px 28px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",background:"linear-gradient(135deg,#C8956C,#A87850)",color:"#fff",boxShadow:"0 4px 12px rgba(200,149,108,0.3)"},
  banner:{background:"linear-gradient(135deg,#1A3A5C,#2a5a8c)",color:"#fff",padding:"16px 22px",borderRadius:12,marginBottom:16,fontSize:13,lineHeight:1.6},
  sumGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  sumItem:{padding:"10px 14px",background:"#FAFAF8",borderRadius:8,border:"1px solid #E8E4DD"},
  sumL:{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,color:"#8A8A8A"},
  sumV:{fontSize:13,fontWeight:600,marginTop:2},
  toast:(t)=>({position:"fixed",top:16,right:16,padding:"12px 20px",borderRadius:10,fontWeight:600,fontSize:13,color:"#fff",zIndex:1000,background:t==="err"?"#B44040":t==="info"?"#1A3A5C":"#2D7A4F",boxShadow:"0 4px 16px rgba(0,0,0,0.18)",maxWidth:380}),
};

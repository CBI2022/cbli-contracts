const { generateFicha } = await import('./lib/ficha-generator.js');

const testData = {
  agentName: "Test",
  date: "2026-06-18",
  ficha: {
    price: "450000",
    address: "Test Address",
    city: "Altea"
  }
};

try {
  const pdf = await generateFicha(testData);
  console.log("PDF generated successfully! Size:", pdf.length);
} catch(err) {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
}

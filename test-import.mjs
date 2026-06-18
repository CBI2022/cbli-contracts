import { generateFicha } from './lib/ficha-generator.js';

const testData = {
  agentName: "Test",
  ficha: {
    price: "450000",
    address: "Test Address",
    city: "Altea"
  }
};

generateFicha(testData)
  .then(() => console.log("PDF generated successfully!"))
  .catch(err => console.error("Error:", err.message));

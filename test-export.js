const XLSX = require('xlsx');
const fs = require('fs');

const arrayBuffer = fs.readFileSync('./public/Default.xlsx');

const wb = XLSX.read(arrayBuffer);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

const [year, month, day] = [2026, 4, 9];
const formattedDate = `${day.toString().padStart(2,'0')}/${month.toString().padStart(2,'0')}/${year}`;

data[0] = [formattedDate, 'TESTE'];

data[2] = [null, 'Acelga', null, null, 5, null, null, 'Abacate', 10];
data[3] = [null, 'Alface', null, null, 3, null, null, 'Abobrinha', 8];

const newWs = XLSX.utils.aoa_to_sheet(data);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newWs, 'CEASA');

XLSX.writeFile(newWb, './public/Teste_09042026.xlsx');
console.log('Arquivo criado: public/Teste_09042026.xlsx');
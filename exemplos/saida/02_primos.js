// Código JavaScript gerado pelo transpilador baianol# (.oxe -> .js)
// Programa 2: números primos com corropio (while), siga_certo (continue) e borimbora (break)
function ehPrimo(n) {
  if (n < 2) { return false; }
  let d = 2;
  while (d * d <= n) {
    if (n % d === 0) { return false; }
    d++;
  }
  return true;
}

let achados = [];
let n = 1;

while (true) {
  n++;
  if (n % 2 === 0 && n !== 2) { continue; }
  if (ehPrimo(n)) { achados.push(n); }
  if (achados.length === 10) { break; }
}

console.log("Os 10 primeiros primos:", achados.join(", "));

for (const p of achados) {
  if (!(p % 2 === 1)) {
    console.log("Único primo par:", p);
  }
}

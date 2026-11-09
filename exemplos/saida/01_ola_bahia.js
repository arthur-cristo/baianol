// Código JavaScript gerado pelo transpilador baianol# (.oxe -> .js)
// Programa 1: saudação, variáveis, função, condicional e laço
const cidade = "Salvador";
let visitantes = 3;

function saudar(nome) {
  return `Colé, ${nome}! Bem-vindo a ` + cidade + ", viu?";
}

console.log(saudar("meu rei"));

for (let i = 1; i <= visitantes; i++) {
  if (i === 2) {
    console.log("Visitante", i, "chegou na paleta");
  } else {
    console.log("Visitante", i, "chegou de buzu");
  }
}

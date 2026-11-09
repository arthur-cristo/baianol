// Código JavaScript gerado pelo transpilador baianol# (.oxe -> .js)
// Programa 3: classes, herança, tratamento de erros e JSON (enrolar / desapartar)
class Conta {
  constructor(titular, saldo) {
    this.titular = titular;
    this.saldo = saldo;
  }

  sacar(valor) {
    if (valor > this.saldo) {
      throw new Error("Saldo insuficiente, painho!");
    }
    this.saldo -= valor;
    return this.saldo;
  }
}

class Poupanca extends Conta {
  render(taxa) {
    this.saldo += this.saldo * taxa;
    return this.saldo;
  }
}

const conta = new Poupanca("Dona Maria", 1000);

try {
  console.log("Saldo após saque:", conta.sacar(300));
  console.log("Rendimento:", conta.render(0.1));
  conta.sacar(5000);
} catch (erro) {
  console.log("Oxente:", erro.message);
} finally {
  console.log("Atendimento encerrado.");
}

const pacote = JSON.stringify({
  titular: conta.titular,
  saldo: conta.saldo,
  ativa: true,
  apelido: null
});
console.log(pacote);
const aberto = JSON.parse(pacote);
console.log(aberto.titular, aberto.ativa);

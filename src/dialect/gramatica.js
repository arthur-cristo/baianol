'use strict';

/** Gramática (EBNF) do baianol#. Sem ";": o comando termina na quebra de linha. */
const GRAMATICA = `
(* ===== Fim de comando ===== *)
(*  O comando termina na QUEBRA DE LINHA (ou antes de "}", ou no fim do arquivo).              *)
(*  Dentro de ( ), [ ] e { } de objeto, a quebra de linha é livre.                              *)
(*  Dois comandos na mesma linha são erro.  O ";" do JavaScript é recusado.                    *)

(* ===== Delimitadores ===== *)
(*  Os mesmos do JavaScript: ( ) { } [ ].  Só o ";" não existe.                               *)
(*  Condições, parâmetros e a variável do oxente aceitam parênteses, mas eles são opcionais.   *)

programa        = "colé" { comando } "tá_ligado" ;

comando         = decl_variavel | decl_funcao | decl_classe | condicional | enquanto
                | repeticao | tratamento_erro | bloco
                | "resultado" [ expressao ]              (* só dentro de armengue *)
                | "borimbora" | "siga_certo"             (* só dentro de laço *)
                | "chiar" expressao
                | expressao ;

bloco           = "{" { comando } "}" ;
decl_variavel   = ( "deixe" | "por_vida" ) declarador { "," declarador } ;
declarador      = nome [ "=" expressao ] ;               (* por_vida EXIGE valor inicial *)
decl_funcao     = "armengue" nome parametros bloco ;
parametros      = [ nome { "," nome } ]                  (* armengue soma a, b { ... } *)
                | "(" [ nome { "," nome } ] ")" ;
decl_classe     = "catiguria" nome [ "primo_carnal" nome ] "{" { metodo } "}" ;
metodo          = ( "construtor" | nome ) parametros bloco ;

condicional     = "possa_ser" expressao comando [ "lá_ele" comando ] ;
enquanto        = "corropio" expressao comando ;
repeticao       = "paletada" [ "deixe" | "por_vida" ] nome "de" expressao comando         (* para cada item *)
                | "paletada" nome "de" expressao "daqui_pra" expressao comando ;          (* de 1 até 10 *)
tratamento_erro = "dar_testa" bloco [ "oxente" [ nome | "(" nome ")" ] bloco ] [ "morreu_aí" bloco ] ;
                  (* precisa de pelo menos um entre oxente e morreu_aí *)

(* ----- expressões ----- *)
expressao       = atribuicao ;
atribuicao      = alvo ( "=" | "+=" | "-=" | ... ) atribuicao | seta | ternario ;
seta            = ( nome | "(" [ nome { "," nome } ] ")" ) "=>" ( bloco | atribuicao ) ;
ternario        = binario [ "?" atribuicao ":" atribuicao ] ;
binario         = unario { operador unario } ;
operador        = "ou" | "mais" | "mermo" | "num_é" | "==" | "!=" | "<" | ">" | "<=" | ">="
                | "+" | "-" | "*" | "/" | "%" | "**" | "??" | "instancia_de" ;
unario          = ( "num" | "tipo_de" | "-" | "+" | "~" | "++" | "--" ) unario | posfixo ;
posfixo         = acesso [ "++" | "--" ] ;
acesso          = primario { "." nome | "[" expressao "]" | "(" [ args ] ")" } ;
primario        = numero | texto | template | "massa" | "aonde" | "vazio" | "na_casa" | nome
                | "(" expressao ")"
                | "[" [ elementos ] "]"
                | "{" [ propriedades ] "}"
                | "criatura" nome { "." nome } [ "(" [ args ] ")" ]
                | "armengue" [ nome ] parametros bloco
                | "trocar_ideias" | "enrolar" | "desapartar" ;

(* ===== Subdialeto JSON (.oxe cujo 1º símbolo é "{" ou "[") ===== *)
json            = valor ;
valor           = objeto_json | lista_json | texto | numero | "massa" | "aonde" | "vazio" ;
objeto_json     = "{" [ par { "," par } ] "}" ;
par             = ( texto | nome ) ":" valor ;           (* chave pode vir sem aspas *)
lista_json      = "[" [ valor { "," valor } ] "]" ;
                  (* texto com aspas simples ou duplas; comentários são ignorados *)
`;

module.exports = { GRAMATICA };

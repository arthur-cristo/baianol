export class ErroBaianol extends Error {
  linha: number | null;
  coluna: number | null;
  formatar(arquivo?: string, fonte?: string): string;
}
export interface Token {
  tipo: "PALAVRA" | "NUMERO" | "TEXTO" | "TEMPLATE" | "COMENTARIO" | "ESPACO" | "PONTUACAO" | "OPERADOR";
  valor: string;
  linha: number;
  coluna: number;
}
export function tokenizar(fonte: string): Token[];
export interface Resultado { tipo: "js" | "json"; extensao: string; codigo: string }
export function compilar(fonte: string, forcarJson?: boolean): Resultado;
export function transpilar(fonte: string): string;
export function executarCapturando(codigoJs: string): string[];
export const LEXEMAS: Record<string, { js: string; categoria: string; origem: string; dicionario: string }>;
export const GRAMATICA: string;
export function tabelaLexemas(markdown?: boolean): string;
#!/usr/bin/env node
'use strict';
const { lerArgumentos } = require('./cli/argumentos');
const { executarComando } = require('./cli/comandos');

executarComando(lerArgumentos(process.argv.slice(2)));

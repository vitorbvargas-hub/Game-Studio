# DIGITAL ODYSSEY — GS-003
## CORREÇÃO URGENTE — ADENDO AO COMANDO 4: LIMITE PIXELLAB

**Usar: Sonnet 5**

### 1. Correção da autorização do fundador

A autorização anterior foi interpretada incorretamente.

**O fundador NÃO autorizou consumir 650 gerações.**

A autorização correta é:

**O saldo de créditos PixelLab não poderá ficar abaixo de 650 gerações.**

Exemplos:

- Saldo inicial de 770 → máximo disponível para consumo: 120 gerações.
- Saldo inicial de 737,95 → máximo disponível para consumo: 87,95 gerações.
- Saldo inicial de 680 → máximo disponível para consumo: 30 gerações.

O limite é definido pelo saldo restante, e não pela quantidade total consumida.

### 2. Regra obrigatória de segurança

Antes de cada geração:

1. Consultar o saldo real com `get_balance`.
2. Verificar o custo estimado da operação.
3. Calcular o saldo previsto após a operação.
4. Executar somente se o saldo previsto permanecer maior ou igual a 650.
5. Consultar novamente o saldo após a operação.
6. Registrar o consumo e o resultado.

**Se uma geração puder reduzir o saldo abaixo de 650, não executá-la.**

### 3. Prioridades dentro do orçamento

Priorizar:

1. Tamer base e animação.
2. Agumon e animação.
3. Testes de qualidade e escala.
4. Tilesets necessários para o protótipo.
5. Correções de maior impacto visual.

Reutilizar assets existentes sempre que possível.

Não gastar créditos apenas para completar um checkpoint.

### 4. Revogação do limite anterior

Este comando **substitui integralmente a autorização de consumo de até 650 gerações** presente no adendo anterior.

O limite anterior de 650 gerações consumidas está revogado.

A única autorização válida é manter o **saldo mínimo de 650 gerações disponíveis**.

### 5. Condições adicionais

- Não consumir créditos desnecessariamente.
- Não ultrapassar o saldo mínimo de 650.
- Não usar eventual renovação de créditos como autorização automática para ampliar o escopo.
- Preservar todas as demais restrições do projeto.
- Caso o saldo atinja 650, interromper novas gerações pagas e apresentar resultados ao fundador.

Confirmar o entendimento desta correção antes de continuar qualquer geração paga.
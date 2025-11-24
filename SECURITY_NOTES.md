# Notas de Segurança - Validação de Data/Hora

## Problema Identificado
Usuários podem burlar validações de tempo (ex: restrição de 7 dias para atualizar peso) mudando a data/hora do dispositivo.

## Solução Implementada

### 1. Validações Críticas no Servidor
**TODAS as validações de tempo devem ser feitas no servidor usando a data/hora do servidor, NUNCA do cliente.**

Exemplos de validações críticas:
- Restrição de 7 dias para atualizar peso
- Limite de check-ins por período
- Restrições de tempo para ações específicas

### 2. Código Cliente
O código cliente:
- **NÃO** envia data/hora nas requisições críticas
- Usa data local apenas para exibição e navegação (UX)
- O servidor sempre usa sua própria data/hora para validar

### 3. APIs Afetadas
- `api/update_weight.php` - Não deve aceitar data do cliente
- `api/save_measurements.php` - Não deve aceitar data do cliente
- `api/log_meal.php` - Deve validar que a data não é no futuro
- Qualquer API com restrições de tempo

### 4. Implementação no Servidor (PHP)
```php
// SEMPRE usar data/hora do servidor para validações
$serverDate = date('Y-m-d');
$serverDateTime = date('Y-m-d H:i:s');

// NÃO confiar em data enviada pelo cliente
// if (isset($_POST['date'])) {
//     $clientDate = $_POST['date']; // PERIGOSO - pode ser burlado
// }

// Validar usando data do servidor
$lastUpdate = getLastWeightUpdate($userId);
$daysSinceUpdate = (strtotime($serverDate) - strtotime($lastUpdate)) / 86400;
if ($daysSinceUpdate < 7) {
    return ['success' => false, 'message' => 'Você só pode atualizar o peso a cada 7 dias'];
}
```

### 5. Função Helper no Cliente
Foi criada a função `getServerDate()` em `assets/js/common.js` para obter a data do servidor quando necessário, mas ela deve ser usada apenas para exibição, não para validações no cliente.

## Checklist de Segurança
- [ ] Servidor valida usando sua própria data/hora
- [ ] Cliente não envia data em requisições críticas
- [ ] Validações de tempo são feitas no servidor
- [ ] Mensagens de erro são claras mas não revelam lógica de validação
- [ ] Logs de tentativas de burla são registrados



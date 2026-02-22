---
name: validador-clinica
description: Valida a estrutura de controllers e modelos PHP para o sistema de clínicas, focando em segurança e regras de negócio.
triggers:
    - "crie um formulário de"
    - "valide este controller de clínica"
    - "verifique as regras de backend"
---

# Objetivo

Garantir que todos os inputs de formulários passem por sanitização rigorosa e sigam o padrão do CodeIgniter 4, prevenindo falhas de segurança em dados sensíveis de pacientes.

# Instruções de Implementação

1. **Regras de Validação:** Sempre sugira o uso do array `$rules` no Controller.
2. **Segurança de Dados:** - Campos de CPF/RG devem ter validação de formato.
    - Nomes de pacientes devem ser convertidos para `ucwords`.
3. **Padrão CI4:** Use `service('validation')` ou o método `$this->validate()` dentro do Controller.
4. **Tratamento de Erros:** Sempre retorne os erros para a View usando `withInput()` e `with('errors', $validation->getErrors())`.

# Exemplo de Estrutura Esperada

Se o usuário pedir um formulário de "Cadastro de Consulta":

- Verifique se existe a regra `required` para 'data_consulta' e 'paciente_id'.
- Aplique `db_decode` ou escape de strings se houver campos de observações médicas.

# Restrições

- NUNCA aceite inputs diretos do `$_POST` ou `$_GET`; use sempre `$this->request->getPost()`.
- Proibido salvar dados de saúde sem log de alteração (verificar se o Model tem o trait de Log).

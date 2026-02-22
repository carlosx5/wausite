| Pa  | Comando/Verificação                  | O que faz?                                                | Quando usar?                        |
| --- | ------------------------------------ | --------------------------------------------------------- | ----------------------------------- |
| 1   | `git status`                         | Mostra os arquivos modificados e não enviados ao GitHub.  | Sempre antes de atualizar.          |
| 2   | `git add .`                          | Adiciona todos os arquivos modificados para o commit.     | Se houver arquivos não adicionados. |
| 3   | `git commit -m "Mensagem do commit"` | Salva as alterações localmente com uma mensagem.          | Depois de adicionar arquivos.       |
| 4   | `git pull`                           | Baixa possíveis atualizações do repositório remoto.       | Antes de enviar (push).             |
| 5   | Resolver conflitos, se aparecerem    | Resolve diferenças entre seu código e o remoto.           | Se o `git pull` mostrar conflitos.  |
| 6   | `git push origin main`               | Envia suas alterações para o GitHub.                      | Para atualizar o repositório.       |
| 7   | Conferir no site do GitHub           | Verifica se os arquivos apareceram no repositório online. | Depois do push.                     |

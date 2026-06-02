# Conferência de Notas Fiscais — Ração Subsidiada

Aplicativo web para conferir notas fiscais (DANFE) contra o relatório do fornecedor.

## Como usar

### 1. Instalar e executar

```bash
bash run.sh
```

Ou manualmente:

```bash
pip install -r requirements.txt
python app/app.py
```

Acesse no navegador: **http://localhost:5000**

### 2. Usar o aplicativo

1. **Notas Fiscais**: selecione todos os PDFs das notas fiscais atestadas (DANFE)
2. **Relatório do Fornecedor**: selecione o PDF com a tabela resumida do fornecedor
3. Clique em **Conferir Notas**
4. Veja o resultado — OK, divergências ou não encontradas
5. Exporte para CSV se necessário

## Campos conferidos

| Campo | Descrição |
|-------|-----------|
| Número NF | Número da nota fiscal |
| Valor Total (R$) | Valor monetário da nota |
| Quantidade | Peso/quantidade de ração |

## Requisitos

- Python 3.8 ou superior
- pip

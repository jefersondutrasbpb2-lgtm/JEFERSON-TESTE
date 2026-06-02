import os
import re
import io
import csv
import json
import logging
from flask import Flask, request, jsonify, render_template, Response

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def parse_br_number(s):
    """Convert Brazilian number format (1.234,56) to float."""
    if not s:
        return None
    s = s.strip()
    # Remove thousand separators, replace comma decimal separator
    s = s.replace('.', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return None


def normalize_nf(nf_str):
    """Normalize NF number: strip leading zeros, remove dots/spaces."""
    if not nf_str:
        return None
    nf_str = re.sub(r'[\s\.]', '', str(nf_str))
    return str(int(nf_str)) if nf_str.isdigit() else nf_str


def extract_text_pdfplumber(file_bytes):
    """Extract full text and tables from PDF using pdfplumber."""
    text_parts = []
    tables = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
                page_tables = page.extract_tables()
                if page_tables:
                    tables.extend(page_tables)
    except Exception as e:
        logger.warning(f"pdfplumber error: {e}")
    return '\n'.join(text_parts), tables


def extract_text_pypdf2(file_bytes):
    """Fallback: extract text using PyPDF2."""
    text_parts = []
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    except Exception as e:
        logger.warning(f"PyPDF2 error: {e}")
    return '\n'.join(text_parts), []


def get_pdf_text_and_tables(file_bytes):
    """Try pdfplumber first, fall back to PyPDF2."""
    if HAS_PDFPLUMBER:
        text, tables = extract_text_pdfplumber(file_bytes)
        if text.strip():
            return text, tables
    if HAS_PYPDF2:
        return extract_text_pypdf2(file_bytes)
    return '', []


# ─────────────────────────────────────────────
# DANFE extraction
# ─────────────────────────────────────────────

NF_PATTERNS = [
    r'N[ºO°]\.?\s*(?:DA\s+NOTA\s+FISCAL)?[\s:]*(\d{3}[\. ]\d{3}[\. ]\d{3})',
    r'N[ºO°]\.?\s*(?:DA\s+NOTA\s+FISCAL)?[\s:]*(\d{6,9})',
    r'NÚMERO[\s:]*(\d{3}[\. ]\d{3}[\. ]\d{3})',
    r'NÚMERO[\s:]*(\d{6,9})',
    r'NOTA\s+FISCAL[\s\S]{0,30}?N[ºO°][\s:]*(\d{3,9})',
    r'NF[\-\s]*E?[\s:]*(\d{6,9})',
    r'CHAVE[\s\S]{0,5}ACESSO[\s\S]{0,100}?(\d{44})',  # fallback: key contains NF
]

VALUE_PATTERNS = [
    r'VALOR\s+TOTAL\s+DA\s+NOTA\s+FISCAL[\s:R$]*(\d{1,3}(?:\.\d{3})*,\d{2})',
    r'VALOR\s+TOTAL\s+DA\s+NF[\s:R$]*(\d{1,3}(?:\.\d{3})*,\d{2})',
    r'TOTAL\s+DA\s+NOTA[\s:R$]*(\d{1,3}(?:\.\d{3})*,\d{2})',
    r'VALOR\s+TOTAL[\s:R$]*(\d{1,3}(?:\.\d{3})*,\d{2})',
    r'VALOR\s+L[IÍ]QUIDO[\s:R$]*(\d{1,3}(?:\.\d{3})*,\d{2})',
    r'TOTAL[\s:R$]+(\d{1,3}(?:\.\d{3})*,\d{2})',
]

QTY_PATTERNS = [
    r'QUANTIDADE\s+(?:TOTAL\s+)?(?:DE\s+)?(?:VOLUMES?|PRODUTO)?[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?)',
    r'QTDE?\.?\s+TOTAL[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?)',
    r'QTD\.?\s+TOTAL[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?)',
    r'PESO\s+L[IÍ]QUIDO[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?)',
    r'PESO\s+BRUTO[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?)',
    r'QUANTIDADE[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?)',
    r'QTD[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?)',
]


def search_patterns(text, patterns):
    """Return first match from a list of regex patterns (case-insensitive)."""
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


def extract_nf_number_from_access_key(text):
    """Extract NF number from 44-digit access key (positions 26-34)."""
    m = re.search(r'\b(\d{44})\b', text)
    if m:
        key = m.group(1)
        nf_num = key[25:34]  # positions 26-34 (0-indexed: 25-33)
        return nf_num.lstrip('0') or '0'
    return None


def extract_danfe_data(file_bytes, filename):
    """Extract NF number, value, and quantity from a DANFE PDF."""
    result = {
        'arquivo': filename,
        'numero_nf': None,
        'valor': None,
        'quantidade': None,
        'erro': None,
    }

    try:
        text, tables = get_pdf_text_and_tables(file_bytes)
        if not text.strip():
            result['erro'] = 'Não foi possível extrair texto do PDF'
            return result

        # Normalize text for matching (collapse whitespace)
        text_norm = re.sub(r'\s+', ' ', text.upper())

        # --- NF Number ---
        nf_raw = search_patterns(text_norm, NF_PATTERNS)
        if nf_raw:
            result['numero_nf'] = normalize_nf(nf_raw)
        else:
            # Try access key fallback
            nf_from_key = extract_nf_number_from_access_key(text_norm)
            if nf_from_key:
                result['numero_nf'] = normalize_nf(nf_from_key)

        # --- Value ---
        val_raw = search_patterns(text_norm, VALUE_PATTERNS)
        if val_raw:
            result['valor'] = parse_br_number(val_raw)

        # --- Quantity ---
        qty_raw = search_patterns(text_norm, QTY_PATTERNS)
        if qty_raw:
            result['quantidade'] = parse_br_number(qty_raw)

        # --- Try tables if fields are still missing ---
        if tables and (result['valor'] is None or result['quantidade'] is None):
            for table in tables:
                for row in table:
                    if not row:
                        continue
                    row_text = ' '.join(str(c) for c in row if c)
                    row_norm = re.sub(r'\s+', ' ', row_text.upper())
                    if result['valor'] is None:
                        v = search_patterns(row_norm, VALUE_PATTERNS)
                        if v:
                            result['valor'] = parse_br_number(v)
                    if result['quantidade'] is None:
                        q = search_patterns(row_norm, QTY_PATTERNS)
                        if q:
                            result['quantidade'] = parse_br_number(q)

    except Exception as e:
        logger.error(f"Error processing {filename}: {e}", exc_info=True)
        result['erro'] = str(e)

    return result


# ─────────────────────────────────────────────
# Supplier report extraction
# ─────────────────────────────────────────────

def extract_relatorio_data(file_bytes):
    """
    Extract NF records from supplier report PDF.
    Returns list of dicts: {numero_nf, valor, quantidade}
    """
    records = []

    try:
        text, tables = get_pdf_text_and_tables(file_bytes)
        text_norm = re.sub(r'\s+', ' ', text.upper())

        # Strategy 1: parse pdfplumber tables
        if tables:
            for table in tables:
                records_from_table = parse_table(table)
                records.extend(records_from_table)

        # Strategy 2: line-by-line regex parsing
        if not records:
            records = parse_text_lines(text_norm)

    except Exception as e:
        logger.error(f"Error processing supplier report: {e}", exc_info=True)

    return records


def parse_table(table):
    """Try to extract NF records from a pdfplumber table."""
    records = []
    if not table or len(table) < 2:
        return records

    # Detect header row
    header = [str(c).upper().strip() if c else '' for c in table[0]]

    nf_col = val_col = qty_col = None
    for i, h in enumerate(header):
        if re.search(r'N[ºO°]|NOTA|NF', h):
            nf_col = i
        elif re.search(r'VALOR|TOTAL|VL\.?', h):
            val_col = i
        elif re.search(r'QTD|QUANT|PESO|KG|SACO|TON', h):
            qty_col = i

    if nf_col is None:
        # Try auto-detect: find a column that looks like NF numbers
        for col_idx in range(len(header)):
            col_values = [str(row[col_idx]) if col_idx < len(row) and row[col_idx] else '' for row in table[1:]]
            nf_candidates = [v for v in col_values if re.match(r'^\s*\d{3,9}\s*$', v)]
            if len(nf_candidates) > len(table) // 3:
                nf_col = col_idx
                break

    if nf_col is None:
        return records

    for row in table[1:]:
        if not row or len(row) <= nf_col:
            continue
        nf_cell = str(row[nf_col]).strip() if row[nf_col] else ''
        nf_clean = re.sub(r'[^\d]', '', nf_cell)
        if not nf_clean or len(nf_clean) < 3:
            continue

        rec = {
            'numero_nf': normalize_nf(nf_clean),
            'valor': None,
            'quantidade': None,
        }

        if val_col is not None and val_col < len(row) and row[val_col]:
            rec['valor'] = parse_br_number(str(row[val_col]))

        if qty_col is not None and qty_col < len(row) and row[qty_col]:
            rec['quantidade'] = parse_br_number(str(row[qty_col]))

        # Try all columns if value/qty still missing
        if rec['valor'] is None or rec['quantidade'] is None:
            for ci, cell in enumerate(row):
                if ci == nf_col or not cell:
                    continue
                cell_str = str(cell).strip()
                num = parse_br_number(cell_str) if re.match(r'^\s*\d', cell_str) else None
                if num is None:
                    continue
                if rec['valor'] is None and num > 10:
                    rec['valor'] = num
                elif rec['quantidade'] is None and num > 0:
                    rec['quantidade'] = num

        records.append(rec)

    return records


def parse_text_lines(text):
    """
    Fallback: scan text lines for patterns like:
      123456  1.234,56  500,00
    or labelled rows.
    """
    records = []
    lines = text.split('\n')

    # Pattern: line with NF number followed by numbers
    line_pattern = re.compile(
        r'\b(\d{3}[\. ]?\d{3}[\. ]?\d{3}|\d{6,9})\b'
        r'[\s\S]{0,60}?'
        r'(\d{1,3}(?:\.\d{3})*,\d{2})'
        r'(?:[\s\S]{0,30}?(\d{1,3}(?:\.\d{3})*(?:,\d{0,4})?))?'
    )

    for line in lines:
        line = line.strip()
        if not line:
            continue
        m = line_pattern.search(line)
        if m:
            nf_raw = re.sub(r'[\s\.]', '', m.group(1))
            if not nf_raw.isdigit():
                continue
            records.append({
                'numero_nf': normalize_nf(nf_raw),
                'valor': parse_br_number(m.group(2)),
                'quantidade': parse_br_number(m.group(3)) if m.group(3) else None,
            })

    return records


# ─────────────────────────────────────────────
# Comparison logic
# ─────────────────────────────────────────────

def fmt_num(v):
    """Format number for display or return 'N/D'."""
    if v is None:
        return 'N/D'
    if isinstance(v, float) and v == int(v):
        return f'{v:,.0f}'.replace(',', '.')
    return f'{v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')


def compare(danfe_list, relatorio_list):
    """Build comparison rows."""
    # Index relatorio by NF number
    rel_index = {}
    for rec in relatorio_list:
        nf = rec.get('numero_nf')
        if nf:
            rel_index[nf] = rec

    rows = []
    for danfe in danfe_list:
        nf = danfe.get('numero_nf')
        rel = rel_index.get(nf) if nf else None

        val_nf = danfe.get('valor')
        qty_nf = danfe.get('quantidade')
        val_rel = rel.get('valor') if rel else None
        qty_rel = rel.get('quantidade') if rel else None

        # Determine status
        if nf is None:
            status = 'erro'
            status_label = '✗ NF não identificada'
        elif rel is None:
            status = 'nao_encontrada'
            status_label = '✗ Não encontrada'
        else:
            val_ok = (val_nf is None or val_rel is None or abs(val_nf - val_rel) <= 0.01)
            qty_ok = (qty_nf is None or qty_rel is None or abs(qty_nf - qty_rel) <= 0.01)
            if val_ok and qty_ok:
                status = 'ok'
                status_label = '✓ OK'
            else:
                status = 'divergencia'
                status_label = '⚠ Divergência'

        rows.append({
            'arquivo': danfe.get('arquivo', ''),
            'numero_nf': nf or 'N/D',
            'valor_nf': fmt_num(val_nf),
            'valor_relatorio': fmt_num(val_rel),
            'qtd_nf': fmt_num(qty_nf),
            'qtd_relatorio': fmt_num(qty_rel),
            'status': status,
            'status_label': status_label,
            'erro': danfe.get('erro'),
        })

    # Notes in relatorio but not in any danfe
    danfe_nfs = {d.get('numero_nf') for d in danfe_list if d.get('numero_nf')}
    for nf, rec in rel_index.items():
        if nf not in danfe_nfs:
            rows.append({
                'arquivo': '—',
                'numero_nf': nf,
                'valor_nf': 'N/D',
                'valor_relatorio': fmt_num(rec.get('valor')),
                'qtd_nf': 'N/D',
                'qtd_relatorio': fmt_num(rec.get('quantidade')),
                'status': 'somente_relatorio',
                'status_label': '⚠ Só no relatório',
                'erro': None,
            })

    return rows


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    notas_files = request.files.getlist('notas[]')
    relatorio_file = request.files.get('relatorio')

    if not notas_files or all(f.filename == '' for f in notas_files):
        return jsonify({'erro': 'Nenhuma nota fiscal enviada.'}), 400
    if not relatorio_file or relatorio_file.filename == '':
        return jsonify({'erro': 'Relatório do fornecedor não enviado.'}), 400

    # Process DANFEs
    danfe_results = []
    for f in notas_files:
        if f.filename == '':
            continue
        data = extract_danfe_data(f.read(), f.filename)
        danfe_results.append(data)

    # Process supplier report
    relatorio_records = extract_relatorio_data(relatorio_file.read())

    # Compare
    comparison = compare(danfe_results, relatorio_records)

    # Summary
    total = len(comparison)
    ok = sum(1 for r in comparison if r['status'] == 'ok')
    div = sum(1 for r in comparison if r['status'] == 'divergencia')
    nao_enc = sum(1 for r in comparison if r['status'] == 'nao_encontrada')
    so_rel = sum(1 for r in comparison if r['status'] == 'somente_relatorio')
    erros = sum(1 for r in comparison if r['status'] == 'erro')

    return jsonify({
        'resultados': comparison,
        'resumo': {
            'total': total,
            'ok': ok,
            'divergencias': div,
            'nao_encontradas': nao_enc,
            'somente_relatorio': so_rel,
            'erros': erros,
        },
        'relatorio_registros': len(relatorio_records),
    })


@app.route('/export-csv', methods=['POST'])
def export_csv():
    """Generate CSV from comparison results sent as JSON."""
    data = request.get_json()
    if not data or 'resultados' not in data:
        return jsonify({'erro': 'Dados inválidos.'}), 400

    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=['arquivo', 'numero_nf', 'valor_nf', 'valor_relatorio',
                    'qtd_nf', 'qtd_relatorio', 'status_label', 'erro'],
        extrasaction='ignore',
    )
    writer.writeheader()
    for row in data['resultados']:
        writer.writerow(row)

    csv_bytes = output.getvalue().encode('utf-8-sig')  # BOM for Excel
    return Response(
        csv_bytes,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=conferencia_nf.csv'},
    )


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

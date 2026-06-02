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
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def parse_br_number(value_str: str):
    """Convert Brazilian number format (1.234,56) to float. Returns None on failure."""
    if not value_str:
        return None
    value_str = value_str.strip()
    try:
        if ',' in value_str:
            # Remove dots used as thousand separators, replace comma with dot
            clean = value_str.replace('.', '').replace(',', '.')
        else:
            # No comma: dots are thousand separators
            clean = value_str.replace('.', '')
        return float(clean)
    except (ValueError, AttributeError):
        return None


def normalize_nf_number(raw: str) -> str:
    """Strip formatting and leading zeros from an NF number."""
    if not raw:
        return ''
    digits_only = re.sub(r'\D', '', raw)
    return digits_only.lstrip('0') or '0'


def extract_text_pdfplumber(file_bytes: bytes):
    """Return (full_text, tables_list) extracted with pdfplumber."""
    text_parts = []
    tables = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ''
                text_parts.append(page_text)
                page_tables = page.extract_tables()
                if page_tables:
                    tables.extend(page_tables)
    except Exception as exc:
        logger.warning("pdfplumber extraction error: %s", exc)
    return '\n'.join(text_parts), tables


def extract_text_pypdf2(file_bytes: bytes) -> str:
    """Fallback text extraction with PyPDF2."""
    text_parts = []
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            text_parts.append(page.extract_text() or '')
    except Exception as exc:
        logger.warning("PyPDF2 extraction error: %s", exc)
    return '\n'.join(text_parts)


def get_pdf_text_and_tables(file_bytes: bytes):
    """Extract text and tables from PDF using best available library."""
    text = ''
    tables = []
    if HAS_PDFPLUMBER:
        text, tables = extract_text_pdfplumber(file_bytes)
    if not text.strip() and HAS_PYPDF2:
        text = extract_text_pypdf2(file_bytes)
    return text, tables


# ---------------------------------------------------------------------------
# DANFE / NF-e extraction
# ---------------------------------------------------------------------------

NF_PATTERNS = [
    r'N[ºO°]\.?\s*(?:DA\s+NOTA\s*FISCAL)?[:\s]*(\d{3}[\.\s]?\d{3}[\.\s]?\d{3})',
    r'N[ºO°]\.?\s*(\d{3}[\.\s]?\d{3}[\.\s]?\d{3})',
    r'NÚMERO[:\s]*(\d{3}[\.\s]?\d{3}[\.\s]?\d{3})',
    r'NOTA\s+FISCAL[^\d]{0,30}(\d{6,9})',
    r'NF[- ]?(\d{6,9})',
    r'(?<!\d)(\d{9})(?!\d)',
]

VALUE_PATTERNS = [
    r'VALOR\s+TOTAL\s+DA\s+NOTA[^\d]*?([\d]{1,3}(?:[\.\s]\d{3})*,\d{2})',
    r'VALOR\s+TOTAL\s+DA\s+NF[^\d]*?([\d]{1,3}(?:[\.\s]\d{3})*,\d{2})',
    r'TOTAL\s+DA\s+NOTA[^\d]*?([\d]{1,3}(?:[\.\s]\d{3})*,\d{2})',
    r'VALOR\s+L[ÍI]QUIDO[^\d]*?([\d]{1,3}(?:[\.\s]\d{3})*,\d{2})',
    r'TOTAL\s+GERAL[^\d]*?([\d]{1,3}(?:[\.\s]\d{3})*,\d{2})',
    r'VALOR\s+TOTAL[^\d]*?([\d]{1,3}(?:[\.\s]\d{3})*,\d{2})',
]

QTY_PATTERNS = [
    r'QUANTIDADE[^\d]{0,10}([\d]{1,3}(?:[\.]\d{3})*(?:,\d{2,3})?)',
    r'QTDE?\.?[^\d]{0,5}([\d]{1,3}(?:[\.]\d{3})*(?:,\d{2,3})?)',
    r'QTD\.?[^\d]{0,5}([\d]{1,3}(?:[\.]\d{3})*(?:,\d{2,3})?)',
    r'PESO\s+L[ÍI]Q(?:UIDO)?[^\d]{0,5}([\d]{1,3}(?:[\.]\d{3})*(?:,\d{2,3})?)',
    r'PESO\s+BRUTO[^\d]{0,5}([\d]{1,3}(?:[\.]\d{3})*(?:,\d{2,3})?)',
]


def first_match(text: str, patterns: list):
    upper = text.upper()
    for pat in patterns:
        m = re.search(pat, upper)
        if m:
            return m.group(1).replace(' ', '')
    return None


def extract_danfe(file_bytes: bytes, filename: str) -> dict:
    """Extract NF number, value, and quantity from a DANFE PDF."""
    result = {
        'arquivo': filename,
        'numero': 'N/D',
        'valor': 'N/D',
        'quantidade': 'N/D',
        'valor_float': None,
        'quantidade_float': None,
        'numero_norm': '',
        'erro': None,
    }
    try:
        text, _ = get_pdf_text_and_tables(file_bytes)
        if not text.strip():
            result['erro'] = 'Não foi possível extrair texto do PDF'
            return result

        nf_raw = first_match(text, NF_PATTERNS)
        if nf_raw:
            result['numero'] = nf_raw
            result['numero_norm'] = normalize_nf_number(nf_raw)

        val_raw = first_match(text, VALUE_PATTERNS)
        if val_raw:
            result['valor'] = val_raw
            result['valor_float'] = parse_br_number(val_raw)

        qty_raw = first_match(text, QTY_PATTERNS)
        if qty_raw:
            result['quantidade'] = qty_raw
            result['quantidade_float'] = parse_br_number(qty_raw)

    except Exception as exc:
        logger.exception("Error extracting DANFE %s", filename)
        result['erro'] = str(exc)
    return result


# ---------------------------------------------------------------------------
# Supplier report extraction
# ---------------------------------------------------------------------------

def _clean_cell(cell) -> str:
    if cell is None:
        return ''
    return str(cell).strip()


def _looks_like_nf(cell: str) -> bool:
    digits = re.sub(r'\D', '', cell)
    return 6 <= len(digits) <= 9


def _looks_like_number(cell: str) -> bool:
    return bool(re.search(r'\d', cell))


def parse_report_tables(tables: list) -> list:
    """Try to parse supplier report from pdfplumber table data."""
    rows = []
    for table in tables:
        if not table:
            continue
        for row in table:
            cells = [_clean_cell(c) for c in row]
            non_empty = [c for c in cells if c]
            if len(non_empty) < 2:
                continue
            if any(_looks_like_nf(c) for c in non_empty):
                rows.append(cells)
    return rows


def infer_report_row(cells: list):
    """Attempt to extract nf, value, quantity from a table row."""
    nf = val = qty = None
    for cell in cells:
        if nf is None and _looks_like_nf(cell):
            nf = cell
        elif _looks_like_number(cell):
            parsed = parse_br_number(cell)
            if parsed is None:
                continue
            if val is None and parsed > 100:
                val = cell
            elif qty is None and parsed <= 100000:
                qty = cell
    if nf:
        return {
            'numero': nf,
            'numero_norm': normalize_nf_number(nf),
            'valor': val or 'N/D',
            'valor_float': parse_br_number(val) if val else None,
            'quantidade': qty or 'N/D',
            'quantidade_float': parse_br_number(qty) if qty else None,
        }
    return None


def parse_report_text(text: str) -> list:
    """Fallback: scan raw text for lines that look like report rows."""
    rows = []
    lines = text.splitlines()
    for line in lines:
        if not line.strip():
            continue
        tokens = re.findall(r'[\d]{1,3}(?:[\.]\d{3})*(?:,\d{2})?|\d+', line)
        nf_token = None
        for tok in tokens:
            digits = re.sub(r'\D', '', tok)
            if 6 <= len(digits) <= 9:
                nf_token = tok
                break
        if not nf_token:
            continue
        other_nums = [t for t in tokens if t != nf_token and _looks_like_number(t)]
        val = qty = None
        for tok in other_nums:
            p = parse_br_number(tok)
            if p is None:
                continue
            if val is None and p > 100:
                val = tok
            elif qty is None:
                qty = tok
        rows.append({
            'numero': nf_token,
            'numero_norm': normalize_nf_number(nf_token),
            'valor': val or 'N/D',
            'valor_float': parse_br_number(val) if val else None,
            'quantidade': qty or 'N/D',
            'quantidade_float': parse_br_number(qty) if qty else None,
        })
    return rows


def extract_relatorio(file_bytes: bytes) -> list:
    """Extract list of {numero, valor, quantidade} from supplier report PDF."""
    text, tables = get_pdf_text_and_tables(file_bytes)
    rows = []

    if tables:
        table_rows = parse_report_tables(tables)
        for cells in table_rows:
            item = infer_report_row(cells)
            if item:
                rows.append(item)

    if not rows and text.strip():
        rows = parse_report_text(text)

    # Deduplicate by normalized NF number
    seen = set()
    unique = []
    for r in rows:
        key = r['numero_norm']
        if key and key not in seen:
            seen.add(key)
            unique.append(r)
    return unique


# ---------------------------------------------------------------------------
# Comparison logic
# ---------------------------------------------------------------------------

TOLERANCE = 0.02  # 2 cents tolerance for rounding


def compare(danfes: list, relatorio_rows: list) -> dict:
    """Compare DANFE list against supplier report rows."""
    report_by_nf = {r['numero_norm']: r for r in relatorio_rows if r['numero_norm']}

    results = []
    summary = {'total': 0, 'ok': 0, 'divergencia': 0, 'nao_encontrada': 0}

    for danfe in danfes:
        summary['total'] += 1
        nf_norm = danfe['numero_norm']
        rel = report_by_nf.get(nf_norm)

        row = {
            'arquivo': danfe['arquivo'],
            'numero_nf': danfe['numero'],
            'valor_nf': danfe['valor'],
            'quantidade_nf': danfe['quantidade'],
            'valor_relatorio': 'N/D',
            'quantidade_relatorio': 'N/D',
            'status': 'nao_encontrada',
            'divergencias': [],
            'erro': danfe.get('erro'),
        }

        if rel is None:
            summary['nao_encontrada'] += 1
            results.append(row)
            continue

        row['valor_relatorio'] = rel['valor']
        row['quantidade_relatorio'] = rel['quantidade']

        divs = []
        vf = danfe['valor_float']
        vr = rel['valor_float']
        if vf is not None and vr is not None:
            if abs(vf - vr) > TOLERANCE:
                divs.append(f'Valor: NF={danfe["valor"]} / Rel={rel["valor"]}')
        elif not (vf is None and vr is None):
            divs.append('Valor não comparável (dado ausente em um dos lados)')

        qf = danfe['quantidade_float']
        qr = rel['quantidade_float']
        if qf is not None and qr is not None:
            if abs(qf - qr) > TOLERANCE:
                divs.append(f'Qtd: NF={danfe["quantidade"]} / Rel={rel["quantidade"]}')

        if divs:
            row['status'] = 'divergencia'
            row['divergencias'] = divs
            summary['divergencia'] += 1
        else:
            row['status'] = 'ok'
            summary['ok'] += 1

        results.append(row)

    # Report entries not found in any DANFE
    danfe_norms = {d['numero_norm'] for d in danfes}
    for nf_norm, rel in report_by_nf.items():
        if nf_norm not in danfe_norms:
            results.append({
                'arquivo': '—',
                'numero_nf': rel['numero'],
                'valor_nf': 'N/D',
                'quantidade_nf': 'N/D',
                'valor_relatorio': rel['valor'],
                'quantidade_relatorio': rel['quantidade'],
                'status': 'somente_relatorio',
                'divergencias': ['NF presente no relatório mas sem DANFE correspondente'],
                'erro': None,
            })
            summary['nao_encontrada'] += 1

    return {'resultados': results, 'resumo': summary}


# ---------------------------------------------------------------------------
# Flask routes
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    notas_files = request.files.getlist('notas[]')
    relatorio_file = request.files.get('relatorio')

    errors = []
    if not notas_files or all(f.filename == '' for f in notas_files):
        errors.append('Nenhuma nota fiscal enviada.')
    if relatorio_file is None or relatorio_file.filename == '':
        errors.append('Nenhum relatório do fornecedor enviado.')
    if errors:
        return jsonify({'erro': ' '.join(errors)}), 400

    danfes = []
    for f in notas_files:
        if f.filename == '':
            continue
        try:
            file_bytes = f.read()
            danfe = extract_danfe(file_bytes, f.filename)
            danfes.append(danfe)
        except Exception as exc:
            logger.exception("Failed reading DANFE file %s", f.filename)
            danfes.append({
                'arquivo': f.filename,
                'numero': 'N/D',
                'valor': 'N/D',
                'quantidade': 'N/D',
                'valor_float': None,
                'quantidade_float': None,
                'numero_norm': '',
                'erro': str(exc),
            })

    relatorio_rows = []
    try:
        rel_bytes = relatorio_file.read()
        relatorio_rows = extract_relatorio(rel_bytes)
    except Exception as exc:
        logger.exception("Failed reading report file")
        return jsonify({'erro': f'Erro ao processar relatório: {exc}'}), 500

    result = compare(danfes, relatorio_rows)
    result['relatorio_linhas'] = len(relatorio_rows)
    return jsonify(result)


@app.route('/export-csv', methods=['POST'])
def export_csv():
    data = request.get_json(force=True)
    resultados = data.get('resultados', [])

    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow([
        'Arquivo', 'Número NF', 'Valor NF', 'Valor Relatório',
        'Qtd NF', 'Qtd Relatório', 'Status', 'Divergências'
    ])
    status_labels = {
        'ok': 'OK',
        'divergencia': 'Divergência',
        'nao_encontrada': 'Não encontrada',
        'somente_relatorio': 'Somente no relatório',
    }
    for r in resultados:
        writer.writerow([
            r.get('arquivo', ''),
            r.get('numero_nf', ''),
            r.get('valor_nf', ''),
            r.get('valor_relatorio', ''),
            r.get('quantidade_nf', ''),
            r.get('quantidade_relatorio', ''),
            status_labels.get(r.get('status', ''), r.get('status', '')),
            ' | '.join(r.get('divergencias', [])),
        ])

    csv_bytes = output.getvalue().encode('utf-8-sig')  # BOM for Excel compatibility
    return Response(
        csv_bytes,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=conferencia_nf.csv'}
    )


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

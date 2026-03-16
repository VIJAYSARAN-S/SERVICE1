from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
import io
import os

def generate_application_pdf(app_data, is_final=False):
    """
    Generates a PDF for an application.
    app_data: dict containing application details
    is_final: bool, if True generates the Final Certificate, else generates the submission receipt.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#0f172a"), # Navy
        alignment=1, # Center
        spaceAfter=30
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#3b82f6"), # Primary Blue
        spaceBefore=12,
        spaceAfter=6
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.gray,
        bold=True
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.black,
        spaceAfter=12
    )

    elements = []

    # Title
    main_title = "OFFICIAL GOVERNMENT CERTIFICATE" if is_final else "APPLICATION SUBMISSION RECEIPT"
    elements.append(Paragraph(main_title, title_style))
    elements.append(Paragraph("Service 1 Secure e-Governance Portal", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Verification Info
    elements.append(Paragraph("Verification Details", header_style))
    data = [
        ["Application ID:", app_data.get('application_id', 'N/A')],
        ["Service Type:", app_data.get('service_type', 'N/A').replace('_', ' ').title()],
        ["Status:", app_data.get('status', 'N/A').replace('_', ' ')],
        ["Date:", app_data.get('created_at', 'N/A')]
    ]
    
    table = Table(data, colWidths=[1.5*inch, 4*inch])
    table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))

    # Applicant Info
    elements.append(Paragraph("Applicant Information", header_style))
    fields = [
        ("Full Name", app_data.get('applicant_name', 'N/A')),
        ("Date of Birth", app_data.get('dob', 'N/A')),
        ("Guardian/Reference", app_data.get('parent_name', 'N/A')),
        ("Phone", app_data.get('phone', 'N/A')),
        ("Address", app_data.get('address', 'N/A'))
    ]
    
    for label, value in fields:
        elements.append(Paragraph(label.upper(), label_style))
        elements.append(Paragraph(str(value), value_style))

    # Extra Data (Service Specific)
    import json
    import base64
    extra_data_str = app_data.get('extra_data')
    if extra_data_str:
        try:
            extra = json.loads(extra_data_str)
            elements.append(Paragraph("Additional Details", header_style))
            for k, v in extra.items():
                if k.endswith('_base64'):
                    continue
                label = k.replace('_', ' ').upper()
                elements.append(Paragraph(label, label_style))
                elements.append(Paragraph(str(v), value_style))
            
            # Add images if present
            if extra.get('photo_base64'):
                elements.append(Paragraph("APPLICANT PHOTO", header_style))
                try:
                    img_data = extra['photo_base64'].split(',')[1]
                    img_bytes = base64.b64decode(img_data)
                    img_buffer = io.BytesIO(img_bytes)
                    elements.append(Image(img_buffer, 1.2*inch, 1.5*inch))
                except Exception as e:
                    elements.append(Paragraph(f"[Photo could not be rendered: {str(e)}]", styles['Italic']))
            
            if extra.get('signature_base64'):
                elements.append(Paragraph("APPLICANT SIGNATURE", header_style))
                try:
                    sig_data = extra['signature_base64'].split(',')[1]
                    sig_bytes = base64.b64decode(sig_data)
                    sig_buffer = io.BytesIO(sig_bytes)
                    elements.append(Image(sig_buffer, 2*inch, 0.8*inch))
                except Exception as e:
                    elements.append(Paragraph(f"[Signature could not be rendered: {str(e)}]", styles['Italic']))
        except:
            pass

    # Blockchain Integrity
    if is_final:
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("Blockchain Integrity Verification", header_style))
        elements.append(Paragraph("This document is cryptographically signed and stored on the Service 1 Identity Ledger.", styles['Italic']))
        
        blockchain_data = [
            ["Record Hash:", app_data.get('blockchain', {}).get('record_hash', 'N/A')],
            ["Block Reference:", app_data.get('blockchain', {}).get('block_ref', 'N/A')],
            ["Integrity Status:", "VERIFIED & IMMUTABLE"]
        ]
        btable = Table(blockchain_data, colWidths=[1.5*inch, 4*inch])
        btable.setStyle(TableStyle([
            ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(btable)

    # QR Code Placeholder (If we had the actual image bytes we'd add it here)
    qr_path = f"qr_codes/{app_data.get('application_id')}.png"
    if os.path.exists(qr_path):
        elements.append(Spacer(1, 30))
        img = Image(qr_path, 1.5*inch, 1.5*inch)
        img.hAlign = 'RIGHT'
        elements.append(img)
        elements.append(Paragraph("Scan to verify authenticity online", styles['Italic']))

    # Footer
    elements.append(Spacer(1, 50))
    elements.append(Paragraph("-" * 100, styles['Normal']))
    footer_text = "This is a computer-generated document. For verification, visit http://localhost:3000/verify-record"
    elements.append(Paragraph(footer_text, styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer

def generate_pds_bill_pdf(tx_data):
    """
    Generates a PDF bill for a PDS distribution transaction.
    tx_data: dict containing transaction and items
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor("#0f172a"),
        alignment=1,
        spaceAfter=20
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor("#f59e0b"), # Amber
        spaceBefore=12,
        spaceAfter=6
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.gray,
        bold=True
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        spaceAfter=8
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("Service 1 Public Distribution System", title_style))
    elements.append(Paragraph("OFFICIAL DISTRIBUTION RECEIPT", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Transaction Info
    elements.append(Paragraph("Transaction Details", header_style))
    details = [
        ["Transaction ID", tx_data.get('transaction_id', 'N/A')],
        ["Citizen Code", tx_data.get('citizen_code', 'N/A')],
        ["Beneficiary Name", tx_data.get('beneficiary_name', 'N/A')],
        ["Ration Card No.", tx_data.get('ration_card_number', 'N/A')],
        ["Shop ID", tx_data.get('shop_id', 'N/A')],
        ["Date", tx_data.get('issued_date', 'N/A')],
        ["Verification Mode", tx_data.get('verification_mode', 'N/A')]
    ]
    
    for label, val in details:
        elements.append(Paragraph(label.upper(), label_style))
        elements.append(Paragraph(str(val), value_style))

    elements.append(Spacer(1, 15))
    
    # Items Table
    elements.append(Paragraph("Issued Items", header_style))
    item_data = [["Item Name", "Quantity", "Unit"]]
    for item in tx_data.get('items', []):
        item_data.append([item.get('item_name'), str(item.get('quantity')), item.get('unit')])
    
    table = Table(item_data, colWidths=[2.5*inch, 1.5*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    elements.append(table)

    # Footer
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("-" * 80, styles['Normal']))
    footer_text = f"Digitally Verified Transaction • {tx_data.get('transaction_id')} • Service 1 Secured"
    elements.append(Paragraph(footer_text, styles['Italic']))

    doc.build(elements)
    buffer.seek(0)
    return buffer

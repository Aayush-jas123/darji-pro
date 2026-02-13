"""PDF generation service for measurements and reports."""

from datetime import datetime
from io import BytesIO
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


class PDFService:
    """Service for generating PDF documents."""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom paragraph styles."""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#6366f1'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#4b5563'),
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))
        
        # Info style
        self.styles.add(ParagraphStyle(
            name='InfoText',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=6
        ))
    
    def generate_measurement_pdf(
        self,
        customer_name: str,
        profile_name: str,
        measurements: dict,
        fit_preference: str,
        measured_by: Optional[str] = None,
        measurement_date: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> BytesIO:
        """
        Generate a professional measurement report PDF.
        
        Args:
            customer_name: Customer's full name
            profile_name: Measurement profile name
            measurements: Dictionary of measurement values
            fit_preference: Fit preference (tight, slim, regular, etc.)
            measured_by: Name of person who took measurements
            measurement_date: Date measurements were taken
            notes: Additional notes or special requirements
            
        Returns:
            BytesIO: PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Container for PDF elements
        elements = []
        
        # Header
        elements.append(Paragraph("Darji Pro", self.styles['CustomTitle']))
        elements.append(Paragraph("Professional Measurement Report", self.styles['Heading2']))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Customer Information
        elements.append(Paragraph("Customer Information", self.styles['CustomSubtitle']))
        
        customer_data = [
            ['Customer Name:', str(customer_name)],
            ['Profile Name:', str(profile_name)],
            ['Fit Preference:', str(fit_preference).replace('_', ' ').title()],
        ]
        
        if measured_by:
            customer_data.append(['Measured By:', str(measured_by)])
        
        if measurement_date:
            customer_data.append(['Date:', measurement_date.strftime('%B %d, %Y')])
        
        customer_table = Table(customer_data, colWidths=[2*inch, 4*inch])
        customer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb'))
        ]))
        
        elements.append(customer_table)
        elements.append(Spacer(1, 0.4 * inch))
        
        # Measurements Section
        elements.append(Paragraph("Body Measurements (cm)", self.styles['CustomSubtitle']))
        
        # Organize measurements by category
        measurement_categories = {
            'Upper Body': ['neck', 'shoulder', 'chest', 'waist', 'hip'],
            'Arms': ['arm_length', 'sleeve_length', 'bicep', 'wrist'],
            'Legs': ['inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'],
            'Torso': ['back_length', 'front_length']
        }
        
        for category, fields in measurement_categories.items():
            category_measurements = []
            
            for field in fields:
                if field in measurements and measurements[field] is not None:
                    try:
                        val_float = float(measurements[field])
                        label = field.replace('_', ' ').title()
                        value = f"{val_float:.1f} cm"
                        category_measurements.append([label, value])
                    except (ValueError, TypeError):
                        continue
            
            if category_measurements:
                elements.append(Paragraph(category, self.styles['Heading3']))
                
                measurement_table = Table(category_measurements, colWidths=[3*inch, 2*inch])
                measurement_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef2ff')),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb'))
                ]))
                
                elements.append(measurement_table)
                elements.append(Spacer(1, 0.2 * inch))
        
        # Notes Section
        if notes:
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(Paragraph("Special Requirements & Notes", self.styles['CustomSubtitle']))
            elements.append(Paragraph(notes, self.styles['InfoText']))
        
        # Footer
        elements.append(Spacer(1, 0.5 * inch))
        footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        elements.append(Paragraph(footer_text, self.styles['InfoText']))
        elements.append(Paragraph(
            "This is a computer-generated document. Please verify all measurements before cutting fabric.",
            self.styles['InfoText']
        ))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return buffer
    
    def generate_invoice_pdf(
        self,
        invoice_number: str,
        customer_name: str,
        items: list,
        subtotal: float,
        tax: float,
        total: float,
        due_date: Optional[datetime] = None,
        payment_status: str = "pending"
    ) -> BytesIO:
        """
        Generate an invoice PDF.
        
        Args:
            invoice_number: Unique invoice number
            customer_name: Customer's name
            items: List of invoice items (dicts with description, quantity, price)
            subtotal: Subtotal amount
            tax: Tax amount
            total: Total amount
            due_date: Payment due date
            payment_status: Payment status
            
        Returns:
            BytesIO: PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Header
        elements.append(Paragraph("INVOICE", self.styles['CustomTitle']))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Invoice details
        invoice_data = [
            ['Invoice Number:', invoice_number],
            ['Customer:', customer_name],
            ['Date:', datetime.now().strftime('%B %d, %Y')],
            ['Status:', payment_status.upper()]
        ]
        
        if due_date:
            invoice_data.append(['Due Date:', due_date.strftime('%B %d, %Y')])
        
        invoice_table = Table(invoice_data, colWidths=[2*inch, 4*inch])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        
        elements.append(invoice_table)
        elements.append(Spacer(1, 0.4 * inch))
        
        # Items table
        elements.append(Paragraph("Items", self.styles['CustomSubtitle']))
        
        item_data = [['Description', 'Quantity', 'Price', 'Total']]
        for item in items:
            item_data.append([
                item['description'],
                str(item['quantity']),
                f"₹{item['price']:.2f}",
                f"₹{item['quantity'] * item['price']:.2f}"
            ])
        
        items_table = Table(item_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        
        elements.append(items_table)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Totals
        totals_data = [
            ['Subtotal:', f"₹{subtotal:.2f}"],
            ['Tax:', f"₹{tax:.2f}"],
            ['Total:', f"₹{total:.2f}"]
        ]
        
        totals_table = Table(totals_data, colWidths=[4.5*inch, 2*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#6366f1')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8)
        ]))
        
        elements.append(totals_table)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return buffer


# Global instance
pdf_service = PDFService()

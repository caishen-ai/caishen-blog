#!/usr/bin/env python3
"""
Markdown to PDF converter with Chinese font support.
Uses reportlab for PDF generation with proper Chinese typography.
"""

import sys
import re
import os
from pathlib import Path
from markdown import markdown
from html.parser import HTMLParser

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.tableofcontents import TableOfContents


# Register Chinese fonts
FONT_BOLD = 'C:\Windows\Fonts\simhei.ttf'
FONT_REGULAR = 'C:\Windows\Fonts\simkai.ttf'

try:
    pdfmetrics.registerFont(TTFont('ChineseBold', FONT_BOLD))
    pdfmetrics.registerFont(TTFont('Chinese', FONT_REGULAR))
    print("Chinese fonts registered successfully.")
except Exception as e:
    print(f"Font registration error: {e}")
    sys.exit(1)


class MDToPDF:
    def __init__(self, output_path):
        self.output_path = output_path
        self.width, self.height = A4
        self.story = []
        self.page_num = 0
        
        # Define styles
        self.styles = {
            'cover_title': ParagraphStyle(
                'CoverTitle', fontName='ChineseBold', fontSize=28,
                leading=40, alignment=TA_CENTER, textColor=HexColor('#1a1a2e'),
                spaceAfter=20
            ),
            'cover_subtitle': ParagraphStyle(
                'CoverSubtitle', fontName='Chinese', fontSize=16,
                leading=24, alignment=TA_CENTER, textColor=HexColor('#555555'),
                spaceAfter=10
            ),
            'cover_author': ParagraphStyle(
                'CoverAuthor', fontName='Chinese', fontSize=13,
                leading=20, alignment=TA_CENTER, textColor=HexColor('#888888'),
                spaceAfter=6
            ),
            'h1': ParagraphStyle(
                'H1', fontName='ChineseBold', fontSize=22,
                leading=32, alignment=TA_LEFT, textColor=HexColor('#1a1a2e'),
                spaceBefore=24, spaceAfter=12
            ),
            'h2': ParagraphStyle(
                'H2', fontName='ChineseBold', fontSize=17,
                leading=26, alignment=TA_LEFT, textColor=HexColor('#2d3436'),
                spaceBefore=18, spaceAfter=8
            ),
            'h3': ParagraphStyle(
                'H3', fontName='ChineseBold', fontSize=14,
                leading=22, alignment=TA_LEFT, textColor=HexColor('#333333'),
                spaceBefore=14, spaceAfter=6
            ),
            'h4': ParagraphStyle(
                'H4', fontName='ChineseBold', fontSize=12,
                leading=18, alignment=TA_LEFT, textColor=HexColor('#444444'),
                spaceBefore=10, spaceAfter=4
            ),
            'body': ParagraphStyle(
                'Body', fontName='Chinese', fontSize=11,
                leading=20, alignment=TA_LEFT, textColor=HexColor('#333333'),
                spaceBefore=2, spaceAfter=6,
                wordSpace=0.5, letterSpace=0
            ),
            'body_bold': ParagraphStyle(
                'BodyBold', fontName='ChineseBold', fontSize=11,
                leading=20, alignment=TA_LEFT, textColor=HexColor('#333333'),
                spaceBefore=2, spaceAfter=6,
                wordSpace=0.5, letterSpace=0
            ),
            'code': ParagraphStyle(
                'Code', fontName='Chinese', fontSize=9,
                leading=14, alignment=TA_LEFT, textColor=HexColor('#2d3436'),
                backColor=HexColor('#f5f6fa'),
                spaceBefore=4, spaceAfter=4,
                leftIndent=10, rightIndent=10,
                borderPadding=8,
                wordSpace=0, letterSpace=0
            ),
            'bullet': ParagraphStyle(
                'Bullet', fontName='Chinese', fontSize=11,
                leading=20, alignment=TA_LEFT, textColor=HexColor('#333333'),
                spaceBefore=1, spaceAfter=3,
                leftIndent=20, bulletIndent=10,
                wordSpace=0.5, letterSpace=0
            ),
            'quote': ParagraphStyle(
                'Quote', fontName='Chinese', fontSize=10,
                leading=18, alignment=TA_LEFT, textColor=HexColor('#555555'),
                leftIndent=25, rightIndent=25,
                spaceBefore=6, spaceAfter=6,
                borderPadding=6,
                backColor=HexColor('#f9f9f9'),
                wordSpace=0.5, letterSpace=0
            ),
            'footer': ParagraphStyle(
                'Footer', fontName='Chinese', fontSize=8,
                leading=12, alignment=TA_CENTER, textColor=HexColor('#999999'),
            ),
        }
        
        # Patterns
        self.h1_pat = re.compile(r'^#\s+(.+)$')
        self.h2_pat = re.compile(r'^##\s+(.+)$')
        self.h3_pat = re.compile(r'^###\s+(.+)$')
        self.h4_pat = re.compile(r'^####\s+(.+)$')
        self.bullet_pat = re.compile(r'^[-*+]\s+(.+)$')
        self.numbered_pat = re.compile(r'^\d+[.)]\s+(.+)$')
        self.hr_pat = re.compile(r'^---+\s*$')
        self.code_start = re.compile(r'^```')
        self.checkbox_pat = re.compile(r'^-\s+\[([ x])\]\s+(.+)$')
        self.table_sep = re.compile(r'^\|[-:| ]+\|')
        self.bold_inline = re.compile(r'\*\*(.+?)\*\*')
        self.emoji_line = re.compile(r'^[🚀📖🎯🛠️⛏️🚛💡📅📊💰📌🎁💬📚✅❌🔥📈📝💻🖥️🔧📱🛍️⭐❤️👁️🔴🟡🟢]')
        
    def clean_text(self, text):
        """Clean text and handle inline formatting"""
        # Handle inline code FIRST (before any XML processing)
        # We use a placeholder approach to avoid XML issues
        code_spans = []
        def replace_code(m):
            code_spans.append(m.group(1))
            return f'\x00CODE{len(code_spans)-1}\x00'
        text = re.sub(r'`([^`]+)`', replace_code, text)
        
        # Handle bold
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
        # Handle italic (but not inside **)
        text = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<i>\1</i>', text)
        
        # Escape XML special chars (but not our tags)
        text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        # Restore our tags
        text = text.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>')
        text = text.replace('&lt;i&gt;', '<i>').replace('&lt;/i&gt;', '</i>')
        text = text.replace('&lt;br/&gt;', '<br/>')
        
        # Restore code spans with proper formatting
        for idx, code in enumerate(code_spans):
            escaped_code = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            text = text.replace(
                f'\x00CODE{idx}\x00',
                f'<font color="#e74c3c" backColor="#f8f8f8">{escaped_code}</font>'
            )
        
        return text
        
    def parse_markdown(self, md_text, is_cover=False):
        """Parse markdown text and convert to reportlab flowables"""
        lines = md_text.strip().split('\n')
        i = 0
        in_code_block = False
        code_lines = []
        in_table = False
        table_rows = []
        
        while i < len(lines):
            line = lines[i]
            
            # Skip empty lines
            if not line.strip():
                if in_code_block:
                    code_lines.append('')
                elif in_table:
                    if table_rows:
                        self._add_table(table_rows)
                        table_rows = []
                    in_table = False
                i += 1
                continue
            
            # Code block toggle
            if self.code_start.match(line.strip()):
                if in_code_block:
                    # End code block
                    if code_lines:
                        self._add_code_block(code_lines)
                        code_lines = []
                    in_code_block = False
                else:
                    in_code_block = True
                i += 1
                continue
            
            if in_code_block:
                code_lines.append(line)
                i += 1
                continue
            
            # Horizontal rule
            if self.hr_pat.match(line.strip()):
                self.story.append(Spacer(1, 6))
                self.story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#dddddd')))
                self.story.append(Spacer(1, 6))
                i += 1
                continue
            
            # Table handling
            stripped = line.strip()
            if stripped.startswith('|') and stripped.endswith('|'):
                # Check if it's a separator row
                if self.table_sep.match(stripped):
                    i += 1
                    continue
                
                # It's a data row - collect cells
                cells = [c.strip() for c in stripped.split('|')[1:-1]]
                table_rows.append(cells)
                
                # Peek next line to see if table continues
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if not (next_line.startswith('|') and next_line.endswith('|')):
                        # End of table
                        if table_rows:
                            self._add_table(table_rows)
                            table_rows = []
                else:
                    if table_rows:
                        self._add_table(table_rows)
                        table_rows = []
                i += 1
                continue
            
            # Headers
            m = self.h1_pat.match(line.strip())
            if m:
                if is_cover:
                    self.story.append(Paragraph(self.clean_text(m.group(1)), self.styles['cover_title']))
                else:
                    self.story.append(Paragraph(self.clean_text(m.group(1)), self.styles['h1']))
                i += 1
                continue
            
            m = self.h2_pat.match(line.strip())
            if m:
                self.story.append(Paragraph(self.clean_text(m.group(1)), self.styles['h2']))
                i += 1
                continue
            
            m = self.h3_pat.match(line.strip())
            if m:
                self.story.append(Paragraph(self.clean_text(m.group(1)), self.styles['h3']))
                i += 1
                continue
            
            m = self.h4_pat.match(line.strip())
            if m:
                self.story.append(Paragraph(self.clean_text(m.group(1)), self.styles['h4']))
                i += 1
                continue
            
            # Checkbox
            m = self.checkbox_pat.match(line.strip())
            if m:
                checked = '☑' if m.group(1) == 'x' else '☐'
                text = f'{checked} {self.clean_text(m.group(2))}'
                self.story.append(Paragraph(text, self.styles['body']))
                i += 1
                continue
            
            # Bullet points
            m = self.bullet_pat.match(line.strip())
            if m:
                text = f'• {self.clean_text(m.group(1))}'
                self.story.append(Paragraph(text, self.styles['bullet']))
                i += 1
                continue
            
            # Numbered list
            m = self.numbered_pat.match(line.strip())
            if m:
                text = f'{self.clean_text(line.strip())}'
                self.story.append(Paragraph(text, self.styles['body']))
                i += 1
                continue
            
            # Quote (>)
            if line.strip().startswith('>'):
                text = self.clean_text(line.strip()[1:].strip())
                self.story.append(Paragraph(text, self.styles['quote']))
                i += 1
                continue
            
            # Regular paragraph
            text = self.clean_text(line.strip())
            # Handle emoji at start - make it bolder
            if text and len(text) > 0:
                style = self.styles['body']
                # Check for bold markers
                if text.startswith('**') or self.emoji_line.match(text):
                    style = self.styles['body']
                self.story.append(Paragraph(text, style))
            i += 1
        
        # Flush remaining code block
        if in_code_block and code_lines:
            self._add_code_block(code_lines)
        
        # Flush remaining table
        if table_rows:
            self._add_table(table_rows)
    
    def _add_code_block(self, code_lines):
        """Add a code block as a formatted paragraph"""
        if not code_lines:
            return
        self.story.append(Spacer(1, 3))
        for line in code_lines:
            # Escape for XML
            escaped = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            self.story.append(Paragraph(escaped, self.styles['code']))
        self.story.append(Spacer(1, 3))
    
    def _add_table(self, rows):
        """Add a formatted table"""
        if not rows:
            return
        
        # Process cell text
        processed_rows = []
        for row in rows:
            processed_rows.append([Paragraph(self.clean_text(cell), self.styles['body']) for cell in row])
        
        # Calculate column widths
        num_cols = max(len(r) for r in rows)
        usable_width = self.width - 4*cm
        col_width = usable_width / num_cols
        
        # Normalize rows to same column count
        for row in processed_rows:
            while len(row) < num_cols:
                row.append(Paragraph('', self.styles['body']))
        
        tbl = Table(processed_rows, colWidths=[col_width]*num_cols, repeatRows=1)
        
        style_cmds = [
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1a1a2e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'ChineseBold'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]
        
        # Alternate row colors
        for i in range(1, len(processed_rows)):
            if i % 2 == 0:
                style_cmds.append(('BACKGROUND', (0, i), (-1, i), HexColor('#f8f9fa')))
        
        tbl.setStyle(TableStyle(style_cmds))
        
        self.story.append(Spacer(1, 4))
        self.story.append(tbl)
        self.story.append(Spacer(1, 6))
    
    def add_cover(self, title, subtitle=None, author=None, extra=None):
        """Add a cover page"""
        # Top spacer
        for _ in range(8):
            self.story.append(Spacer(1, 15))
        
        # Decorative line
        self.story.append(HRFlowable(width="40%", thickness=3, color=HexColor('#1a1a2e'), spaceAfter=20))
        
        # Title
        self.story.append(Paragraph(title, self.styles['cover_title']))
        
        if subtitle:
            self.story.append(Spacer(1, 10))
            self.story.append(Paragraph(subtitle, self.styles['cover_subtitle']))
        
        self.story.append(Spacer(1, 20))
        self.story.append(HRFlowable(width="30%", thickness=1.5, color=HexColor('#999999'), spaceAfter=20))
        
        if author:
            self.story.append(Paragraph(author, self.styles['cover_author']))
        
        if extra:
            for ext in extra:
                self.story.append(Paragraph(ext, self.styles['cover_author']))
        
        # Bottom spacer
        self.story.append(Spacer(1, 60))
        self.story.append(Paragraph('© 2026 财神出品 | AI数字产品', self.styles['footer']))
        
        # Page break after cover
        self.story.append(PageBreak())
    
    def add_page_number(self, canvas, doc):
        """Add page number and footer"""
        canvas.saveState()
        canvas.setFont('Chinese', 8)
        canvas.setFillColor(HexColor('#999999'))
        page_num = canvas.getPageNumber()
        if page_num > 1:  # Don't number cover
            text = f"- {page_num - 1} -"
            canvas.drawCentredString(self.width / 2, 1.5*cm, text)
        canvas.restoreState()
    
    def generate(self, md_content, title, subtitle=None, author=None):
        """Generate PDF from markdown content"""
        doc = SimpleDocTemplate(
            self.output_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2.5*cm,
            title=title,
            author=author or '财神'
        )
        
        # Reset story
        self.story = []
        
        # Add cover
        self.add_cover(title, subtitle, author)
        
        # Parse main content
        self.parse_markdown(md_content)
        
        # Build PDF
        doc.build(self.story, onFirstPage=self.add_page_number, onLaterPages=self.add_page_number)
        print(f"PDF generated: {self.output_path}")


def main():
    if len(sys.argv) < 3:
        print("Usage: python md2pdf.py <input.md> <output.pdf>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    # Read markdown
    with open(input_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Extract title from first H1
    lines = md_content.strip().split('\n')
    title = "Untitled"
    subtitle = None
    author = "财神"
    
    for i, line in enumerate(lines):
        if line.startswith('# ') and not title:
            title = line[2:].strip()
            # Check next line for subtitle
            if i + 1 < len(lines) and lines[i + 1].startswith('## '):
                subtitle = lines[i + 1][3:].strip()
            break
    
    # Also look for explicit author/version lines
    for line in lines[:30]:
        if line.startswith('**作者：') or line.startswith('**Author:'):
            author = line.replace('**', '').replace('作者：', '').replace('Author:', '').strip()
        if line.startswith('**版本：') or line.startswith('**Version:'):
            if subtitle is None:
                subtitle = line.replace('**', '').strip()
    
    converter = MDToPDF(output_path)
    converter.generate(md_content, title, subtitle, author)


if __name__ == '__main__':
    main()

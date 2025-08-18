import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportPNG(): void {
    // TODO: implement with html2canvas
    console.log('Export PNG: not implemented yet');
  }

  exportSVG(): void {
    // TODO: serialize SVG content
    console.log('Export SVG: not implemented yet');
  }

  exportPDF(): void {
    // TODO: jsPDF integration
    console.log('Export PDF: not implemented yet');
  }
}


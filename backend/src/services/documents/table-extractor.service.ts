export interface ExtractedTableCell {
  rowIndex: number;
  colIndex: number;
  content: string;
}

export interface ExtractedTable {
  id: string;
  rowCount: number;
  colCount: number;
  headers: string[];
  rows: string[][];
  rawText: string;
  isUncertain: boolean;
}

export class TableExtractorService {
  /**
   * Identifies tabular data blocks within page text and parses structure
   */
  extractTables(pageText: string): { tables: ExtractedTable[]; nonTableText: string } {
    const lines = pageText.split('\n');
    const tableBlocks: string[][] = [];
    const nonTableLines: string[] = [];

    let currentTableLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Detect table indicators: pipe separated, tab separated, or repeated aligned delimiters
      const isPipeTable = (trimmed.startsWith('|') || trimmed.includes(' | ')) && trimmed.split('|').length >= 3;
      const isTabTable = trimmed.split('\t').length >= 3;
      const isMultiSpaceColumn = trimmed.split(/\s{3,}/).length >= 3 && !trimmed.startsWith('//');

      if (isPipeTable || isTabTable || isMultiSpaceColumn) {
        currentTableLines.push(trimmed);
      } else {
        if (currentTableLines.length >= 2) {
          // At least 2 rows to constitute a table
          tableBlocks.push([...currentTableLines]);
        } else if (currentTableLines.length === 1) {
          nonTableLines.push(currentTableLines[0]!);
        }
        currentTableLines = [];
        // Preserve line (including empty lines for paragraph separation)
        nonTableLines.push(trimmed);
      }
    }

    if (currentTableLines.length >= 2) {
      tableBlocks.push(currentTableLines);
    } else if (currentTableLines.length === 1) {
      nonTableLines.push(currentTableLines[0]!);
    }

    const tables: ExtractedTable[] = tableBlocks.map((block, idx) => {
      const parsedRows: string[][] = [];

      for (const line of block) {
        // Ignore markdown/ascii table divider lines like |---|---|
        if (/^[|\-\s:+]+$/.test(line) && line.includes('-')) {
          continue;
        }

        let cells: string[];
        if (line.includes('|')) {
          cells = line
            .split('|')
            .map((c) => c.trim())
            .filter((_, i, arr) => (i === 0 && arr[i] === '' ? false : i === arr.length - 1 && arr[i] === '' ? false : true));
        } else if (line.includes('\t')) {
          cells = line.split('\t').map((c) => c.trim());
        } else {
          cells = line.split(/\s{3,}/).map((c) => c.trim());
        }

        if (cells.length > 0) {
          parsedRows.push(cells);
        }
      }

      const headers = parsedRows.length > 0 ? (parsedRows[0] ?? []) : [];
      const dataRows = parsedRows.length > 1 ? parsedRows.slice(1) : [];
      const colCount = Math.max(...parsedRows.map((r) => r.length), 0);

      return {
        id: `tbl_${idx + 1}`,
        rowCount: parsedRows.length,
        colCount,
        headers,
        rows: dataRows,
        rawText: block.join('\n'),
        isUncertain: false,
      };
    });

    return {
      tables,
      nonTableText: nonTableLines.join('\n'),
    };
  }
}

export const tableExtractorService = new TableExtractorService();

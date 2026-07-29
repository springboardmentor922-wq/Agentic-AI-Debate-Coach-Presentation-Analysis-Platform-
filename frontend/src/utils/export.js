// Dependency-free export helpers.
// - exportToCSV produces a .csv file that opens natively in Excel/Sheets.
// - exportToPDF opens a clean, print-styled window and triggers the native
//   "Save as PDF" print destination — no client-side PDF library required.

export function exportToCSV(filename, rows) {
  if (!rows || rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (val) => {
    const str = String(val ?? '')
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportToPDF(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=900,height=1100')
  if (!win) return
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; color: #0F1420; padding: 32px; }
          h1 { font-family: 'Sora', sans-serif; font-size: 22px; margin-bottom: 4px; }
          .subtitle { color: #667; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { text-align: left; padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
          th { text-transform: uppercase; letter-spacing: 0.03em; color: #667; font-size: 10px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; background: #EAF5FF; color: #175E96; }
          .section { margin-top: 28px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="subtitle">Generated ${new Date().toLocaleString()} · AI Debate Coach Platform</p>
        ${bodyHtml}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}

// Builds the resume PDF with jsPDF (lazy-loaded so it only downloads when used).
// Standard PDF fonts only cover Latin-1, so text is sanitised (₹ → Rs., no Devanagari).

const pdfSafe = (s = '') =>
  String(s)
    .replace(/₹/g, 'Rs. ')
    .replace(/[★✓✅🙏]/gu, '')
    .replace(/[^\x20-\xFF–—‘’“”•]/g, '')

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

export async function downloadResumePdf(resume, qrDataUrl) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const accent = hexToRgb(resume.accent)
  const ink = [15, 26, 42]
  const muted = [102, 112, 133]
  const light = accent.map((c) => Math.round(c + (255 - c) * 0.88))

  const text = (value, x, y, opts = {}) => {
    const { size = 10, bold = false, color = ink, align, maxWidth } = opts
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = maxWidth ? doc.splitTextToSize(pdfSafe(value), maxWidth) : pdfSafe(value)
    doc.text(lines, x, y, align ? { align } : undefined)
    return Array.isArray(lines) ? lines.length : 1
  }

  const sidebar = resume.template === 'compact'
  const leftX = 40
  const leftW = 160
  const rightX = 228
  const rightW = W - rightX - 40

  // Header
  if (resume.template === 'classic') {
    text(resume.name, W / 2, 64, { size: 26, bold: true, align: 'center' })
    text(resume.headline, W / 2, 86, { size: 12, color: accent, align: 'center' })
    text(resume.contact, W / 2, 104, { size: 9, color: muted, align: 'center' })
    doc.setDrawColor(...accent)
    doc.setLineWidth(1.5)
    doc.line(40, 120, W - 40, 120)
  } else {
    if (sidebar) {
      doc.setFillColor(...light)
      doc.rect(0, 0, rightX - 20, H, 'F')
    }
    doc.setFillColor(...accent)
    doc.rect(0, 0, W, 124, 'F')
    text(resume.name, 40, 60, { size: 26, bold: true, color: [255, 255, 255] })
    text(resume.headline, 40, 82, { size: 12, color: [255, 255, 255] })
    text(resume.contact, 40, 102, { size: 9, color: [235, 245, 248] })
  }

  const heading = (label, x, y, width) => {
    text(label.toUpperCase(), x, y, { size: 9, bold: true, color: accent })
    doc.setDrawColor(...accent)
    doc.setLineWidth(0.8)
    doc.line(x, y + 5, x + width, y + 5)
    return y + 22
  }

  // Left column: skills, certificates, languages
  let ly = 156
  ly = heading('Skills', leftX, ly, leftW)
  resume.skills.forEach((s) => {
    text(s.name, leftX, ly, { size: 9.5, bold: true })
    text(`${s.level}/100`, leftX + leftW, ly, { size: 8, color: muted, align: 'right' })
    doc.setFillColor(...light)
    doc.roundedRect(leftX, ly + 5, leftW, 4, 2, 2, 'F')
    doc.setFillColor(...accent)
    doc.roundedRect(leftX, ly + 5, (leftW * s.level) / 100, 4, 2, 2, 'F')
    ly += 24
  })

  if (resume.certificates.length) {
    ly = heading('Certificates', leftX, ly + 8, leftW)
    resume.certificates.forEach((c) => {
      const n = text(c.name, leftX, ly, { size: 9.5, bold: true, maxWidth: leftW })
      ly += n * 12
      const m = text(c.issuer, leftX, ly, { size: 8.5, color: muted, maxWidth: leftW })
      ly += m * 11
      text(c.number, leftX, ly, { size: 8, color: muted })
      ly += 18
    })
  }

  ly = heading('Languages', leftX, ly + 8, leftW)
  text(resume.languages, leftX, ly, { size: 9.5, maxWidth: leftW })

  // Right column: summary + experience
  let ry = 156
  ry = heading('Profile', rightX, ry, rightW)
  ry += text(resume.summary, rightX, ry, { size: 10, maxWidth: rightW }) * 14 + 14

  ry = heading('Work experience', rightX, ry, rightW)
  resume.history.forEach((h) => {
    text(h.role, rightX, ry, { size: 11, bold: true })
    text(`${h.from} - ${h.to}`, rightX + rightW, ry, { size: 8.5, color: muted, align: 'right' })
    ry += 14
    text(`${h.employer} · ${h.place}`, rightX, ry, { size: 9.5, color: accent })
    ry += 14
    ry += text(h.description, rightX, ry, { size: 9.5, color: [71, 84, 103], maxWidth: rightW }) * 13 + 12
  })

  // Footer with verification QR
  if (qrDataUrl) doc.addImage(qrDataUrl, 'PNG', W - 96, H - 100, 56, 56)
  text(`Verified on Karya Setu · Worker ID ${resume.workerId}`, 40, H - 62, { size: 8.5, bold: true, color: muted })
  text(`Scan the QR or visit ${resume.verifyUrl} to check identity, skills and ratings.`, 40, H - 48, {
    size: 8,
    color: muted,
    maxWidth: W - 160,
  })

  doc.save(`${resume.name.replace(/\s+/g, '_')}_Resume.pdf`)
}

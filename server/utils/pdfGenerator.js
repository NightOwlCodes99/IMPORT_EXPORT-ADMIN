/**
 * PDF Report Generator
 * Uses PDFKit to generate professional reports - Optimized for minimal pages
 */

const PDFDocument = require('pdfkit');

// Color palette
const COLORS = {
  primary: '#1e3a5f',
  secondary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f97316',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc'
};

// Format currency
const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

// Format number
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(parseFloat(num) || 0);
};

// Format percentage
const formatPercentage = (value) => {
  const num = parseFloat(value) || 0;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Generate PDF Report
 * @param {Object} reportData - All report data
 * @param {string} period - Report period (weekly/monthly/quarterly/yearly)
 * @returns {PDFDocument} - PDF document stream
 */
const generateReportPDF = (reportData, period = 'weekly') => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    autoFirstPage: true
  });
``
  const {
    overview,
    periodReport,
    revenueTrend,
    salesByCategory,  
    salesByRegion,
    topProducts,
    kpiMetrics
  } = reportData;

  const periodLabels = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  };

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  // Track current Y position
  let currentY = 0;

  // Get report period string
  const getReportPeriodString = () => {
    if (overview?.reportPeriod) {
      const start = formatDate(overview.reportPeriod.startDate);
      const end = formatDate(overview.reportPeriod.endDate);
      return `${start} - ${end}`;
    }
    return `${periodLabels[period]} Report`;
  };

  // Check if we need a new page and return new Y position
  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }
    return currentY;
  };

  // Draw section title
  const drawSectionTitle = (title) => {
    doc.fontSize(12)
       .fillColor(COLORS.primary)
       .font('Helvetica-Bold')
       .text(title, margin, currentY);
    
    currentY += 15;
    
    doc.moveTo(margin, currentY)
       .lineTo(pageWidth - margin, currentY)
       .strokeColor(COLORS.border)
       .lineWidth(0.5)
       .stroke();
    
    currentY += 8;
  };

  // ===== HEADER =====
  doc.rect(0, 0, pageWidth, 85).fill(COLORS.primary);
  
  doc.fontSize(20)
     .fillColor('white')
     .font('Helvetica-Bold')
     .text('NEXARION', margin, 22);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(`${periodLabels[period]} Performance Report`, margin, 46);
  
  doc.fontSize(9)
     .text(`Report Period: ${getReportPeriodString()}`, margin, 64);
  
  doc.fontSize(9)
     .text(`Generated: ${formatDate(new Date())}`, pageWidth - 150, 22, { width: 110, align: 'right' });

  currentY = 100;

  // ===== KEY METRICS =====
  drawSectionTitle('Key Performance Metrics');
  
  const cardWidth = (contentWidth - 18) / 4;
  const cardHeight = 52;
  
  const metrics = [
    { label: `${periodLabels[period]} Revenue`, value: formatCurrency(overview?.revenue?.current), change: formatPercentage(overview?.revenue?.growth), positive: (overview?.revenue?.growth || 0) >= 0 },
    { label: 'Total Orders', value: formatNumber(overview?.orders?.current), change: formatPercentage(overview?.orders?.growth), positive: (overview?.orders?.growth || 0) >= 0 },
    { label: 'New Users', value: formatNumber(overview?.newUsers?.current), change: formatPercentage(overview?.newUsers?.growth), positive: (overview?.newUsers?.growth || 0) >= 0 },
    { label: 'Conversion Rate', value: `${(parseFloat(overview?.conversionRate?.current) || 0).toFixed(1)}%`, change: formatPercentage(overview?.conversionRate?.growth), positive: (overview?.conversionRate?.growth || 0) >= 0 }
  ];

  metrics.forEach((metric, index) => {
    const x = margin + (index * (cardWidth + 6));
    
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 3)
       .fillAndStroke(COLORS.background, COLORS.border);
    
    doc.fontSize(7).fillColor(COLORS.textLight).font('Helvetica')
       .text(metric.label, x + 5, currentY + 5, { width: cardWidth - 10 });
    
    doc.fontSize(13).fillColor(COLORS.text).font('Helvetica-Bold')
       .text(metric.value, x + 5, currentY + 16, { width: cardWidth - 10 });
    
    doc.fontSize(8).fillColor(metric.positive ? COLORS.success : COLORS.danger).font('Helvetica-Bold')
       .text(metric.change, x + 5, currentY + 35, { width: cardWidth - 10 });
  });

  currentY += cardHeight + 15;

  // ===== REVENUE TREND =====
  if (revenueTrend?.trend?.length) {
    checkPageBreak(130);
    drawSectionTitle('Revenue Trend');
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const colWidth = contentWidth / 3;
    
    // Headers
    doc.fontSize(8).fillColor(COLORS.textLight).font('Helvetica-Bold')
       .text('Period', margin, currentY)
       .text('Revenue', margin + colWidth, currentY)
       .text('Orders', margin + colWidth * 2, currentY);
    
    currentY += 12;
    
    revenueTrend.trend.slice(0, 7).forEach((item, index) => {
      const name = period === 'weekly' ? dayNames[item._id - 1] || `Day ${item._id}` : `Day ${item._id}`;
      
      if (index % 2 === 0) {
        doc.rect(margin - 2, currentY - 2, contentWidth + 4, 12).fill('#f1f5f9');
      }
      
      doc.fontSize(8).fillColor(COLORS.text).font('Helvetica')
         .text(name, margin, currentY)
         .text(formatCurrency(item.revenue), margin + colWidth, currentY)
         .text(formatNumber(item.orders), margin + colWidth * 2, currentY);
      
      currentY += 12;
    });

    // Summary
    if (periodReport?.summary) {
      currentY += 3;
      doc.fontSize(7).fillColor(COLORS.textLight)
         .text(`Highest Day: ${periodReport.summary.highestDay?.day || 'N/A'} (${formatCurrency(periodReport.summary.highestDay?.amount)})`, margin, currentY);
      currentY += 10;
      doc.text(`Average Daily: ${formatCurrency(periodReport.summary.averageDaily)}`, margin, currentY);
      currentY += 10;
      doc.text(`Growth Rate: ${formatPercentage(periodReport.summary.growthRate)}`, margin, currentY);
      currentY += 10;
    }
    
    currentY += 8;
  }

  // ===== SALES BY CATEGORY =====
  if (salesByCategory?.length) {
    checkPageBreak(100);
    drawSectionTitle('Sales by Category');
    
    const categoryColors = [COLORS.secondary, COLORS.warning, COLORS.success, '#8b5cf6', '#ec4899'];
    
    salesByCategory.slice(0, 4).forEach((category, index) => {
      const barWidth = Math.min((category.percentage || 0) * 2.2, 220);
      
      doc.fontSize(8).fillColor(COLORS.text).font('Helvetica')
         .text(category.category || category.name || 'Unknown', margin, currentY, { width: 100 });
      
      doc.rect(145, currentY + 1, 220, 8).fill('#e2e8f0');
      doc.rect(145, currentY + 1, barWidth, 8).fill(categoryColors[index % categoryColors.length]);
      
      doc.fontSize(8).fillColor(COLORS.text)
         .text(`${formatCurrency(category.revenue)} (${(category.percentage || 0).toFixed(1)}%)`, 375, currentY);
      
      currentY += 16;
    });
    
    currentY += 8;
  }

  // ===== TOP PRODUCTS =====
  if (topProducts?.length) {
    checkPageBreak(110);
    drawSectionTitle('Top Selling Products');
    
    // Headers
    doc.fontSize(7).fillColor(COLORS.textLight).font('Helvetica-Bold')
       .text('#', margin, currentY)
       .text('Product', margin + 18, currentY)
       .text('Category', margin + 165, currentY)
       .text('Sold', margin + 285, currentY)
       .text('Revenue', margin + 340, currentY);
    
    currentY += 12;
    
    topProducts.slice(0, 5).forEach((product, index) => {
      if (index % 2 === 0) {
        doc.rect(margin - 2, currentY - 2, contentWidth + 4, 12).fill('#f1f5f9');
      }
      
      doc.fontSize(8).fillColor(COLORS.text).font('Helvetica')
         .text(`${index + 1}`, margin, currentY)
         .text((product.name || 'Unknown').substring(0, 25), margin + 18, currentY)
         .text((product.category || 'N/A').substring(0, 18), margin + 165, currentY)
         .text(formatNumber(product.totalSold), margin + 285, currentY)
         .text(formatCurrency(product.revenue), margin + 340, currentY);
      
      currentY += 12;
    });
    
    currentY += 8;
  }

  // ===== GEOGRAPHIC PERFORMANCE =====
  if (salesByRegion?.length) {
    checkPageBreak(100);
    drawSectionTitle('Geographic Performance');
    
    // Headers
    doc.fontSize(7).fillColor(COLORS.textLight).font('Helvetica-Bold')
       .text('Country', margin, currentY)
       .text('Orders', margin + 180, currentY)
       .text('Revenue', margin + 260, currentY)
       .text('Share', margin + 360, currentY);
    
    currentY += 12;
    
    salesByRegion.slice(0, 5).forEach((region, index) => {
      if (index % 2 === 0) {
        doc.rect(margin - 2, currentY - 2, contentWidth + 4, 12).fill('#f1f5f9');
      }
      
      doc.fontSize(8).fillColor(COLORS.text).font('Helvetica')
         .text(region.country || 'Unknown', margin, currentY)
         .text(formatNumber(region.orders), margin + 180, currentY)
         .text(formatCurrency(region.revenue), margin + 260, currentY)
         .text(`${(region.percentage || 0).toFixed(1)}%`, margin + 360, currentY);
      
      currentY += 12;
    });
    
    currentY += 8;
  }

  // ===== KPI METRICS =====
  if (kpiMetrics) {
    checkPageBreak(70);
    drawSectionTitle('KPI Metrics');
    
    const kpis = [
      { label: 'Order Success Rate', value: `${parseFloat(kpiMetrics.orderSuccessRate?.value || 0).toFixed(1)}%`, desc: kpiMetrics.orderSuccessRate?.label },
      { label: 'Average Order Value', value: formatCurrency(kpiMetrics.avgOrderValue?.value), desc: kpiMetrics.avgOrderValue?.label },
      { label: 'Customer Return Rate', value: `${parseFloat(kpiMetrics.customerReturnRate?.value || 0).toFixed(1)}%`, desc: kpiMetrics.customerReturnRate?.label },
      { label: 'Customer Satisfaction', value: `${parseFloat(kpiMetrics.customerSatisfaction?.value || 0).toFixed(1)}/5`, desc: kpiMetrics.customerSatisfaction?.label }
    ];

    const kpiStartY = currentY;
    const colW = contentWidth / 2;
    
    kpis.forEach((kpi, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + (col * colW);
      const y = kpiStartY + (row * 28);
      
      doc.fontSize(7).fillColor(COLORS.textLight).font('Helvetica')
         .text(kpi.label, x, y);
      
      doc.fontSize(11).fillColor(COLORS.text).font('Helvetica-Bold')
         .text(kpi.value, x, y + 9);
      
      if (kpi.desc) {
        doc.fontSize(7).fillColor(COLORS.textLight).font('Helvetica')
           .text(kpi.desc, x + 65, y + 10);
      }
    });

    currentY = kpiStartY + 60;
  }

  // ===== FOOTER =====
  doc.fontSize(7)
     .fillColor(COLORS.textLight)
     .text(
       'Nexarion Import/Export Platform - Confidential Report',
       margin,
       pageHeight - 25,
       { width: contentWidth, align: 'center' }
     );

  return doc;
};

module.exports = { generateReportPDF };

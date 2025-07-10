// CREATED: 2025-07-10 - Financial terms tooltips and explanations system

export interface FinancialTooltip {
  term: string;
  title: string;
  definition: string;
  explanation: string;
  example?: string;
  calculation?: string;
  goodRange?: string;
  warnings?: string[];
  relatedTerms?: string[];
}

// ===== FINANCIAL TOOLTIPS DATABASE =====
export const FINANCIAL_TOOLTIPS: Record<string, FinancialTooltip> = {
  // Basic Investment Metrics
  roi: {
    term: "ROI",
    title: "Return on Investment (ROI)",
    definition: "Tỷ suất lợi nhuận đầu tư - đo lường hiệu quả của khoản đầu tư",
    explanation: "ROI cho biết bạn kiếm được bao nhiều % lợi nhuận so với số tiền đầu tư ban đầu. Đây là chỉ số quan trọng nhất để đánh giá hiệu quả đầu tư.",
    example: "ROI 15% nghĩa là cứ đầu tư 100 triệu, bạn có thể kiếm thêm 15 triệu mỗi năm.",
    calculation: "ROI = (Lợi nhuận hàng năm / Vốn đầu tư) × 100%",
    goodRange: "Tốt: >12%, Rất tốt: >15%, Xuất sắc: >20%",
    warnings: ["ROI quá cao (>25%) có thể không bền vững", "Cần xem xét rủi ro kèm theo"],
    relatedTerms: ["cashFlow", "rentalYield", "capRate"]
  },

  cashFlow: {
    term: "cashFlow",
    title: "Dòng Tiền Ròng (Cash Flow)",
    definition: "Số tiền thực tế nhận được hàng tháng sau khi trừ tất cả chi phí",
    explanation: "Dòng tiền ròng là số tiền 'sạch' bạn nhận được mỗi tháng. Dương (+) nghĩa là bạn có thêm thu nhập, âm (-) nghĩa là bạn phải bù thêm tiền.",
    example: "Dòng tiền +2 triệu/tháng nghĩa là bạn thu về 2 triệu sau khi trả hết các khoản.",
    calculation: "Dòng tiền = Thu nhập cho thuê - (Trả nợ NH + Phí quản lý + Bảo trì + Thuế)",
    goodRange: "Dương: Tốt, >1 triệu: Rất tốt, >3 triệu: Xuất sắc",
    warnings: ["Dòng tiền âm có thể gây áp lực tài chính", "Cần tính đến lạm phát và tăng chi phí"],
    relatedTerms: ["roi", "rentalYield"]
  },

  rentalYield: {
    term: "rentalYield",
    title: "Rental Yield (Tỷ suất cho thuê)",
    definition: "Tỷ lệ % thu nhập cho thuê hàng năm so với giá trị bất động sản",
    explanation: "Rental Yield cho biết BĐS của bạn sinh lời bao nhiều % mỗi năm thông qua việc cho thuê, không tính đến khoản vay.",
    example: "Rental Yield 6% nghĩa là BĐS 10 tỷ sẽ thu về 600 triệu/năm từ tiền thuê.",
    calculation: "Rental Yield = (Tiền thuê năm × Tỷ lệ lấp đầy / Giá trị BĐS) × 100%",
    goodRange: "Tốt: >5%, Rất tốt: >6%, Xuất sắc: >8%",
    warnings: ["Chỉ tính thu nhập, chưa trừ chi phí", "Cần xem xét tỷ lệ trống phòng"],
    relatedTerms: ["capRate", "cashFlow"]
  },

  capRate: {
    term: "capRate",
    title: "Capitalization Rate (Cap Rate)",
    definition: "Tỷ lệ vốn hóa - thu nhập ròng hàng năm chia cho giá trị BĐS",
    explanation: "Cap Rate đo lường khả năng sinh lời thực tế của BĐS sau khi trừ chi phí vận hành, nhưng chưa tính đến khoản vay.",
    example: "Cap Rate 5% nghĩa là BĐS 10 tỷ sinh ra 500 triệu thu nhập ròng/năm.",
    calculation: "Cap Rate = (NOI - Thu nhập ròng hàng năm) / Giá trị BĐS × 100%",
    goodRange: "TPHCM: 4-7%, Hà Nội: 4-6%, Tỉnh: 6-9%",
    warnings: ["Không tính đến đòn bẩy tài chính", "Phụ thuộc vào vị trí địa lý"],
    relatedTerms: ["rentalYield", "noi"]
  },

  cashOnCash: {
    term: "cashOnCash",
    title: "Cash-on-Cash Return",
    definition: "Tỷ suất lợi nhuận trên tiền mặt thực tế đầu tư",
    explanation: "Đo lường hiệu quả của số tiền mặt bạn bỏ ra ban đầu, có tính đến lợi ích của việc vay ngân hàng (đòn bẩy).",
    example: "Đầu tư 3 tỷ tiền mặt, nhận về 300 triệu/năm = Cash-on-Cash 10%",
    calculation: "Cash-on-Cash = (Dòng tiền hàng năm / Vốn tự có ban đầu) × 100%",
    goodRange: "Tốt: >8%, Rất tốt: >12%, Xuất sắc: >15%",
    warnings: ["Cao hơn ROI nhờ đòn bẩy", "Rủi ro tăng theo tỷ lệ vay"],
    relatedTerms: ["roi", "loanToValue"]
  },

  paybackPeriod: {
    term: "paybackPeriod",
    title: "Thời Gian Hoàn Vốn (Payback Period)",
    definition: "Thời gian cần thiết để thu hồi toàn bộ vốn đầu tư ban đầu",
    explanation: "Cho biết sau bao lâu bạn sẽ 'hòa vốn' và bắt đầu có lợi nhuận thực sự từ khoản đầu tư này.",
    example: "Hoàn vốn 8 năm nghĩa là sau 8 năm, bạn đã thu hồi đủ tiền đầu tư ban đầu.",
    calculation: "Tính tích lũy dòng tiền hàng tháng cho đến khi = vốn ban đầu",
    goodRange: "Tốt: <10 năm, Rất tốt: <7 năm, Xuất sắc: <5 năm",
    warnings: ["Không tính giá trị thời gian của tiền", "Chỉ là tham chiếu, không thay thế ROI"],
    relatedTerms: ["roi", "cashFlow"]
  },

  // Risk Metrics
  loanToValue: {
    term: "loanToValue",
    title: "Loan-to-Value (LTV)",
    definition: "Tỷ lệ vay so với giá trị bất động sản",
    explanation: "LTV cho biết bạn vay bao nhiều % so với giá trị BĐS. Càng cao thì đòn bẩy càng lớn nhưng rủi ro cũng tăng.",
    example: "LTV 70% nghĩa là BĐS 10 tỷ, bạn vay 7 tỷ và góp vốn tự có 3 tỷ.",
    calculation: "LTV = (Số tiền vay / Giá trị BĐS) × 100%",
    goodRange: "An toàn: <70%, Chấp nhận được: 70-80%, Rủi ro: >80%",
    warnings: ["LTV cao tăng rủi ro thanh khoản", "Lãi suất có thể cao hơn với LTV >80%"],
    relatedTerms: ["dscr", "cashOnCash"]
  },

  dscr: {
    term: "dscr",
    title: "Debt Service Coverage Ratio (DSCR)",
    definition: "Tỷ lệ khả năng trả nợ - thu nhập ròng chia cho khoản trả nợ",
    explanation: "DSCR đo lường khả năng BĐS tự trả được khoản nợ ngân hàng từ thu nhập cho thuê.",
    example: "DSCR 1.3 nghĩa là thu nhập cao hơn 30% so với khoản phải trả ngân hàng.",
    calculation: "DSCR = Thu nhập ròng hàng năm / (Trả nợ gốc + lãi hàng năm)",
    goodRange: "An toàn: >1.25, Tốt: >1.4, Rất tốt: >1.6",
    warnings: ["DSCR <1.0 nghĩa là không đủ tiền trả nợ", "Ngân hàng thường yêu cầu DSCR >1.2"],
    relatedTerms: ["loanToValue", "cashFlow"]
  },

  // Sale Analysis Metrics
  totalReturn: {
    term: "totalReturn",
    title: "Tổng Lợi Nhuận (Total Return)",
    definition: "Tổng lợi nhuận từ cho thuê cộng với lợi nhuận khi bán BĐS",
    explanation: "Bao gồm tất cả dòng tiền nhận được trong quá trình nắm giữ và lợi nhuận (hoặc lỗ) khi bán.",
    example: "Nắm giữ 5 năm, thu 200 triệu/năm + bán lời 500 triệu = Total Return 1.5 tỷ",
    calculation: "Total Return = Σ(Dòng tiền các năm) + (Giá bán - Giá mua - Chi phí bán)",
    goodRange: "Phụ thuộc thời gian nắm giữ và lạm phát",
    warnings: ["Cần tính đến thuế thu nhập cá nhân", "Giá bán chỉ là ước tính"],
    relatedTerms: ["totalROIOnSale", "holdingPeriod"]
  },

  totalROIOnSale: {
    term: "totalROIOnSale",
    title: "ROI Khi Bán (Total ROI on Sale)",
    definition: "Tỷ suất lợi nhuận tổng thể bao gồm cả việc bán BĐS",
    explanation: "ROI tính toán đầy đủ, bao gồm thu nhập từ cho thuê và lợi nhuận khi bán, chia cho tổng vốn đầu tư.",
    example: "ROI khi bán 18% nghĩa là trung bình mỗi năm bạn có 18% lợi nhuận.",
    calculation: "Total ROI = (Total Return / Tổng vốn đầu tư) / Số năm nắm giữ × 100%",
    goodRange: "Tốt: >10%, Rất tốt: >15%, Xuất sắc: >20%",
    warnings: ["Giả định về giá bán có thể không chính xác", "Chưa tính thuế"],
    relatedTerms: ["totalReturn", "roi"]
  },

  holdingPeriod: {
    term: "holdingPeriod",
    title: "Thời Gian Nắm Giữ (Holding Period)",
    definition: "Khoảng thời gian dự kiến nắm giữ BĐS trước khi bán",
    explanation: "Thời gian nắm giữ ảnh hướng lớn đến ROI tổng thể do tác động của tăng giá BĐS và chi phí giao dịch.",
    example: "Nắm giữ 7 năm thường tối ưu cho hầu hết BĐS ở Việt Nam.",
    calculation: "Được tối ưu hóa dựa trên ROI cao nhất",
    goodRange: "Ngắn hạn: 3-5 năm, Dài hạn: 7-15 năm",
    warnings: ["Nắm giữ quá ngắn có chi phí giao dịch cao", "Quá dài có rủi ro thị trường"],
    relatedTerms: ["totalROIOnSale", "propertyAppreciation"]
  },

  // Economic Factors
  propertyAppreciation: {
    term: "propertyAppreciation",
    title: "Tỷ Lệ Tăng Giá BĐS",
    definition: "Tốc độ tăng giá trị bất động sản hàng năm",
    explanation: "Phản ánh xu hướng tăng giá của BĐS trong khu vực. Là yếu tố quan trọng quyết định lợi nhuận khi bán.",
    example: "Tăng giá 5%/năm nghĩa là BĐS 10 tỷ sẽ có giá 10.5 tỷ sau 1 năm.",
    calculation: "Dự phóng dựa trên lịch sử và xu hướng thị trường",
    goodRange: "TPHCM/HN: 4-8%/năm, Tỉnh: 3-6%/năm",
    warnings: ["Không đảm bảo tăng giá liên tục", "Chu kỳ thị trường có thể biến động"],
    relatedTerms: ["totalROIOnSale", "holdingPeriod"]
  },

  // Input Fields
  giaTriBDS: {
    term: "giaTriBDS",
    title: "Giá Trị Bất Động Sản",
    definition: "Tổng giá trị của bất động sản cần mua",
    explanation: "Đây là giá niêm yết hoặc giá thỏa thuận với chủ bán, bao gồm cả giá đất và công trình (nếu có).",
    example: "Căn hộ 2PN tại Q7 có giá 5.5 tỷ đồng",
    goodRange: "Phụ thuộc vào vị trí và loại hình BĐS",
    warnings: ["Cần định giá chính xác", "So sánh với thị trường xung quanh"],
    relatedTerms: ["loanToValue", "rentalYield"]
  },

  tyLeVay: {
    term: "tyLeVay",
    title: "Tỷ Lệ Vay Ngân Hàng",
    definition: "Phần trăm giá trị BĐS được ngân hàng cho vay",
    explanation: "Tỷ lệ tối đa mà ngân hàng chấp nhận cho vay. Phần còn lại bạn phải có vốn tự có.",
    example: "Vay 70% nghĩa là BĐS 10 tỷ, ngân hàng cho vay 7 tỷ, bạn góp 3 tỷ.",
    goodRange: "Thường 70-85% tùy ngân hàng và thu nhập",
    warnings: ["Tỷ lệ vay cao = rủi ro cao", "Ảnh hưởng đến lãi suất"],
    relatedTerms: ["loanToValue", "dscr"]
  }
};

// ===== UTILITY FUNCTIONS =====
export function getTooltipByTerm(term: string): FinancialTooltip | null {
  return FINANCIAL_TOOLTIPS[term] || null;
}

export function searchTooltips(query: string): FinancialTooltip[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(FINANCIAL_TOOLTIPS).filter(
    tooltip =>
      tooltip.title.toLowerCase().includes(lowercaseQuery) ||
      tooltip.definition.toLowerCase().includes(lowercaseQuery) ||
      tooltip.term.toLowerCase().includes(lowercaseQuery)
  );
}

export function getRelatedTooltips(term: string): FinancialTooltip[] {
  const tooltip = getTooltipByTerm(term);
  if (!tooltip || !tooltip.relatedTerms) return [];
  
  return tooltip.relatedTerms
    .map(relatedTerm => getTooltipByTerm(relatedTerm))
    .filter(Boolean) as FinancialTooltip[];
}

export function getTooltipsByCategory(category: 'basic' | 'risk' | 'sale' | 'input'): FinancialTooltip[] {
  const categoryTerms = {
    basic: ['roi', 'cashFlow', 'rentalYield', 'capRate', 'paybackPeriod'],
    risk: ['loanToValue', 'dscr'],
    sale: ['totalReturn', 'totalROIOnSale', 'holdingPeriod', 'propertyAppreciation'],
    input: ['giaTriBDS', 'tyLeVay']
  };
  
  return categoryTerms[category]
    .map(term => getTooltipByTerm(term))
    .filter(Boolean) as FinancialTooltip[];
}
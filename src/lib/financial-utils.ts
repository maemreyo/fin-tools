/**
 * Tính toán khoản thanh toán hàng tháng cho khoản vay (PMT function)
 * Dựa trên công thức Excel PMT
 * 
 * @param rate - Lãi suất hàng tháng (% năm / 12)
 * @param nper - Số kỳ thanh toán (số tháng)
 * @param pv - Giá trị hiện tại của khoản vay (Principal Value)
 * @param fv - Giá trị tương lai (thường là 0 cho khoản vay)
 * @param type - Loại thanh toán (0: cuối kỳ, 1: đầu kỳ) - mặc định 0
 * @returns Khoản thanh toán hàng tháng
 */
export function calculatePMT(
  rate: number,
  nper: number,
  pv: number,
  fv: number = 0,
  type: number = 0
): number {
  // Chuyển lãi suất năm sang tháng
  const monthlyRate = rate / 100 / 12;
  
  // Nếu lãi suất = 0, tính toán đơn giản
  if (monthlyRate === 0) {
    return -(pv + fv) / nper;
  }
  
  // Công thức PMT chuẩn
  const factor = Math.pow(1 + monthlyRate, nper);
  const pmt = -(pv * factor + fv) * monthlyRate / ((factor - 1) * (1 + monthlyRate * type));
  
  return pmt;
}

/**
 * Tính toán chi tiết khoản thanh toán cho các giai đoạn lãi suất khác nhau
 * Dùng cho trường hợp có lãi suất ưu đãi và lãi suất thả nổi
 */
export function calculateDetailedPayments(
  soTienVay: number,
  laiSuatUuDai: number,
  thoiGianUuDai: number,
  laiSuatThaNoi: number,
  tongThoiGianVay: number
): {
  tienTraUuDai: number;
  tienTraThaNoi: number;
  soDuSauUuDai: number;
  tongLaiPhaiTra: number;
} {
  const tongThangVay = tongThoiGianVay * 12;
  
  // Tính khoản thanh toán giai đoạn ưu đãi
  const tienTraUuDai = calculatePMT(laiSuatUuDai, tongThangVay, soTienVay);
  
  // Tính số dư còn lại sau giai đoạn ưu đãi
  const soDuSauUuDai = calculateRemainingBalance(
    soTienVay,
    laiSuatUuDai,
    tongThangVay,
    thoiGianUuDai
  );
  
  // Tính khoản thanh toán giai đoạn thả nổi với số dư còn lại
  const soThangConLai = tongThangVay - thoiGianUuDai;
  const tienTraThaNoi = calculatePMT(laiSuatThaNoi, soThangConLai, soDuSauUuDai);
  
  // Tính tổng lãi phải trả
  const tongLaiUuDai = (tienTraUuDai * thoiGianUuDai) - (soTienVay - soDuSauUuDai);
  const tongLaiThaNoi = (tienTraThaNoi * soThangConLai) - soDuSauUuDai;
  const tongLaiPhaiTra = tongLaiUuDai + tongLaiThaNoi;
  
  return {
    tienTraUuDai,
    tienTraThaNoi,
    soDuSauUuDai,
    tongLaiPhaiTra
  };
}

/**
 * Tính số dư còn lại của khoản vay sau một số kỳ thanh toán
 */
export function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  totalPeriods: number,
  periodsPaid: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal * (1 - periodsPaid / totalPeriods);
  }
  
  const factor = Math.pow(1 + monthlyRate, totalPeriods);
  const paidFactor = Math.pow(1 + monthlyRate, periodsPaid);
  
  const remainingBalance = principal * (factor - paidFactor) / (factor - 1);
  
  return Math.max(0, remainingBalance);
}

/**
 * Tính NPV (Net Present Value) của một dự án đầu tư BĐS
 */
export function calculateNPV(
  initialInvestment: number,
  monthlyCashFlows: number[],
  discountRate: number
): number {
  const monthlyDiscountRate = discountRate / 100 / 12;
  
  let npv = -initialInvestment; // Đầu tư ban đầu là âm
  
  monthlyCashFlows.forEach((cashFlow, index) => {
    const period = index + 1;
    const presentValue = cashFlow / Math.pow(1 + monthlyDiscountRate, period);
    npv += presentValue;
  });
  
  return npv;
}

/**
 * Tính IRR (Internal Rate of Return) bằng phương pháp Newton-Raphson
 */
export function calculateIRR(
  initialInvestment: number,
  monthlyCashFlows: number[],
  maxIterations: number = 100,
  tolerance: number = 0.0001
): number {
  let rate = 0.1; // Bắt đầu với 10%
  
  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(initialInvestment, monthlyCashFlows, rate * 100);
    
    if (Math.abs(npv) < tolerance) {
      return rate * 100; // Trả về phần trăm
    }
    
    // Tính đạo hàm để áp dụng Newton-Raphson
    const derivative = calculateNPVDerivative(initialInvestment, monthlyCashFlows, rate);
    
    if (Math.abs(derivative) < tolerance) {
      break; // Tránh chia cho 0
    }
    
    rate = rate - npv / derivative;
    
    // Đảm bảo rate không âm
    if (rate < 0) {
      rate = 0.01;
    }
  }
  
  return rate * 100;
}

/**
 * Tính đạo hàm của NPV để sử dụng trong Newton-Raphson
 */
function calculateNPVDerivative(
  initialInvestment: number,
  monthlyCashFlows: number[],
  rate: number
): number {
  const monthlyRate = rate / 12;
  let derivative = 0;
  
  monthlyCashFlows.forEach((cashFlow, index) => {
    const period = index + 1;
    const factor = Math.pow(1 + monthlyRate, period);
    derivative -= (cashFlow * period) / (12 * factor * (1 + monthlyRate));
  });
  
  return derivative;
}

/**
 * Tính thời gian hoàn vốn (Payback Period)
 */
export function calculatePaybackPeriod(
  initialInvestment: number,
  monthlyCashFlows: number[]
): number {
  let cumulativeCashFlow = -initialInvestment;
  
  for (let i = 0; i < monthlyCashFlows.length; i++) {
    cumulativeCashFlow += monthlyCashFlows[i];
    
    if (cumulativeCashFlow >= 0) {
      // Nội suy để tìm thời điểm chính xác
      const previousCumulative = cumulativeCashFlow - monthlyCashFlows[i];
      const fraction = -previousCumulative / monthlyCashFlows[i];
      
      return (i + fraction) / 12; // Trả về số năm
    }
  }
  
  return -1; // Không hoàn vốn được trong khoảng thời gian tính toán
}

/**
 * Tính rental yield (tỷ suất lợi nhuận cho thuê)
 */
export function calculateRentalYield(
  propertyValue: number,
  monthlyRent: number,
  occupancyRate: number = 100
): number {
  const annualRent = monthlyRent * 12 * (occupancyRate / 100);
  return (annualRent / propertyValue) * 100;
}

/**
 * Tính Cash-on-Cash Return
 */
export function calculateCashOnCashReturn(
  initialCashInvestment: number,
  annualCashFlow: number
): number {
  return (annualCashFlow / initialCashInvestment) * 100;
}

/**
 * Format số tiền theo định dạng Việt Nam
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format phần trăm
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse chuỗi số tiền VND về number
 */
export function parseVND(vndString: string): number {
  // Loại bỏ ký tự không phải số và dấu chấm/phẩy
  const cleanString = vndString.replace(/[^\d.,]/g, '');
  
  // Xử lý dấu phẩy và chấm (Việt Nam thường dùng chấm làm phân cách hàng nghìn)
  const normalizedString = cleanString.replace(/\./g, '').replace(/,/g, '.');
  
  return parseFloat(normalizedString) || 0;
}

/**
 * Kiểm tra tính hợp lệ của các thông số tài chính
 */
export function validateFinancialInputs(inputs: {
  laiSuatUuDai: number;
  laiSuatThaNoi: number;
  tyLeVay: number;
  thoiGianVay: number;
}): string[] {
  const errors: string[] = [];
  
  if (inputs.laiSuatUuDai < 0 || inputs.laiSuatUuDai > 50) {
    errors.push('Lãi suất ưu đãi phải từ 0% đến 50%');
  }
  
  if (inputs.laiSuatThaNoi < 0 || inputs.laiSuatThaNoi > 50) {
    errors.push('Lãi suất thả nổi phải từ 0% đến 50%');
  }
  
  if (inputs.laiSuatThaNoi < inputs.laiSuatUuDai) {
    errors.push('Lãi suất thả nổi thường cao hơn lãi suất ưu đãi');
  }
  
  if (inputs.tyLeVay < 0 || inputs.tyLeVay > 100) {
    errors.push('Tỷ lệ vay phải từ 0% đến 100%');
  }
  
  if (inputs.thoiGianVay < 1 || inputs.thoiGianVay > 30) {
    errors.push('Thời gian vay phải từ 1 năm đến 30 năm');
  }
  
  return errors;
}
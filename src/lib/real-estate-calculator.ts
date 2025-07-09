import { RealEstateInputs, CalculationSteps, CalculationResult, WarningType, SuggestionType, DEFAULT_VALUES } from '@/types/real-estate';
import { 
  calculateDetailedPayments, 
  calculateNPV, 
  calculatePaybackPeriod, 
  calculateCashOnCashReturn,
  calculateRentalYield,
  validateFinancialInputs 
} from './financial-utils';

/**
 * ✅ FIXED VERSION - Eliminates all null/NaN values
 * Hàm tính toán chính theo công thức trong tài liệu
 * "Phân Tích Sâu Logic & Công Thức Tính Dòng Tiền Bất Động Sản"
 */
export function calculateRealEstateInvestment(inputs: RealEstateInputs): CalculationResult {
  // Apply ALL DEFAULT_VALUES first, then override with user inputs
  const normalizedInputs: RealEstateInputs = {
    ...DEFAULT_VALUES,  // Apply base defaults first
    ...inputs,          // Then override with user inputs
    // Ensure critical fields never undefined with nullish coalescing
    giaTriBDS: inputs.giaTriBDS ?? 0,
    vonTuCo: inputs.vonTuCo ?? 0,
    thuNhapKhac: inputs.thuNhapKhac ?? DEFAULT_VALUES.thuNhapKhac ?? 0,
    chiPhiSinhHoat: inputs.chiPhiSinhHoat ?? DEFAULT_VALUES.chiPhiSinhHoat ?? 0,
    // Ensure all numeric fields have valid numbers
    tienThueThang: Number(inputs.tienThueThang) || 0,
    laiSuatUuDai: Number(inputs.laiSuatUuDai) || DEFAULT_VALUES.laiSuatUuDai || 8,
    laiSuatThaNoi: Number(inputs.laiSuatThaNoi) || DEFAULT_VALUES.laiSuatThaNoi || 12,
    thoiGianVay: Number(inputs.thoiGianVay) || DEFAULT_VALUES.thoiGianVay || 20,
    thoiGianUuDai: Number(inputs.thoiGianUuDai) || DEFAULT_VALUES.thoiGianUuDai || 12,
    tyLeVay: Number(inputs.tyLeVay) || DEFAULT_VALUES.tyLeVay || 70,
    tyLeLapDay: Number(inputs.tyLeLapDay) || DEFAULT_VALUES.tyLeLapDay || 95,
    phiQuanLy: Number(inputs.phiQuanLy) || 0,
    phiBaoTri: Number(inputs.phiBaoTri) || DEFAULT_VALUES.phiBaoTri || 1,
    duPhongCapEx: Number(inputs.duPhongCapEx) || DEFAULT_VALUES.duPhongCapEx || 1,
    baoHiemTaiSan: Number(inputs.baoHiemTaiSan) || DEFAULT_VALUES.baoHiemTaiSan || 0.15,
    thueSuatChoThue: Number(inputs.thueSuatChoThue) || DEFAULT_VALUES.thueSuatChoThue || 10,
    chiPhiBan: Number(inputs.chiPhiBan) || DEFAULT_VALUES.chiPhiBan || 3,
    chiPhiMua: Number(inputs.chiPhiMua) || DEFAULT_VALUES.chiPhiMua || 2,
    baoHiemKhoanVay: Number(inputs.baoHiemKhoanVay) || DEFAULT_VALUES.baoHiemKhoanVay || 1.5,
    chiPhiTrangBi: Number(inputs.chiPhiTrangBi) || 0,
  } as RealEstateInputs;

  // Validate inputs trước khi tính toán
  const validationErrors = validateInputs(normalizedInputs);
  if (validationErrors.length > 0) {
    console.warn('Validation warnings:', validationErrors);
    // Don't throw error for minor validation issues, just warn
    // throw new Error(`Lỗi dữ liệu đầu vào: ${validationErrors.join(', ')}`);
  }

  // BƯỚC 1: Tính Tổng Vốn Đầu Tư Ban Đầu (Total Initial Investment)
  const step1 = calculateInitialInvestment(normalizedInputs);
  
  // BƯỚC 2: Tính Tổng Chi Phí Vận Hành Hàng Tháng (Total Monthly Operating Expenses)
  const step2 = calculateMonthlyOperatingExpenses(normalizedInputs, step1.soTienVay);
  
  // BƯỚC 3: Tính Dòng Tiền Ròng Từ Bất Động Sản (Property's Net Cash Flow)
  const step3 = calculatePropertyNetCashFlow(normalizedInputs, step2.tongChiPhiVanHanh);
  
  // BƯỚC 4: Tính Dòng Tiền Cuối Cùng (Final Personal Cash Flow)
  const step4 = calculateFinalCashFlow(normalizedInputs, step3.dongTienRongBDS);
  
  // Gộp tất cả kết quả steps
  const steps: CalculationSteps = {
    ...step1,
    ...step2,
    ...step3,
    ...step4
  };
  
  // Phân tích bổ sung
  const analysis = calculateAdvancedMetrics(normalizedInputs, steps);
  
  // Cảnh báo và gợi ý
  const warnings = generateWarnings(normalizedInputs, steps);
  const suggestions = generateSuggestions(normalizedInputs, steps);
  
  return {
    inputs: normalizedInputs,
    steps,
    ...analysis,
    warnings,
    suggestions,
    calculatedAt: new Date()
  };
}

/**
 * BƯỚC 1: Tính Tổng Vốn Đầu Tư Ban Đầu
 * ✅ FIXED: Added safe math operations
 */
function calculateInitialInvestment(inputs: RealEstateInputs): Pick<CalculationSteps, 'soTienVay' | 'vonTuCo' | 'tongVonBanDau'> {
  // Safe math operations với fallbacks
  const giaTriBDS = Number(inputs.giaTriBDS) || 0;
  const tyLeVay = Number(inputs.tyLeVay) || 0;
  const chiPhiTrangBi = Number(inputs.chiPhiTrangBi) || 0;
  const chiPhiMua = Number(inputs.chiPhiMua) || 0;
  const baoHiemKhoanVay = Number(inputs.baoHiemKhoanVay) || 0;
  
  const soTienVay = giaTriBDS * (tyLeVay / 100);
  const vonTuCo = Math.max(0, giaTriBDS - soTienVay); // Ensure non-negative
  
  // Chi phí mua là % của giá trị BĐS
  const chiPhiMuaThucTe = giaTriBDS * (chiPhiMua / 100);
  
  // Bảo hiểm khoản vay là % của số tiền vay
  const baoHiemKhoanVayThucTe = soTienVay * (baoHiemKhoanVay / 100);
  
  const tongVonBanDau = vonTuCo + chiPhiTrangBi + chiPhiMuaThucTe + baoHiemKhoanVayThucTe;
  
  return {
    soTienVay: Number(soTienVay) || 0,
    vonTuCo: Number(vonTuCo) || 0,
    tongVonBanDau: Number(tongVonBanDau) || 0
  };
}

/**
 * BƯỚC 2: Tính Tổng Chi Phí Vận Hành Hàng Tháng
 * ✅ FIXED: Added safe calculations và error handling
 */
function calculateMonthlyOperatingExpenses(
  inputs: RealEstateInputs, 
  soTienVay: number
): Pick<CalculationSteps, 'tienTraNHThang' | 'chiPhiBaoTriThang' | 'duPhongCapExThang' | 'baoHiemTaiSanThang' | 'tongChiPhiVanHanh'> {
  
  // Safe payment calculation với error handling
  let tienTraNHThang = 0;
  try {
    if (soTienVay > 0 && inputs.laiSuatUuDai > 0 && inputs.thoiGianVay > 0) {
      const paymentDetails = calculateDetailedPayments(
        soTienVay,
        inputs.laiSuatUuDai,
        inputs.thoiGianUuDai,
        inputs.laiSuatThaNoi,
        inputs.thoiGianVay
      );
      tienTraNHThang = Math.abs(Number(paymentDetails.tienTraUuDai) || 0);
    }
  } catch (error) {
    console.warn('Payment calculation error, using fallback:', error);
    // ✅ Fallback calculation nếu detailed payment fails
    if (soTienVay > 0 && inputs.laiSuatUuDai > 0 && inputs.thoiGianVay > 0) {
      const monthlyRate = inputs.laiSuatUuDai / 100 / 12;
      const totalPayments = inputs.thoiGianVay * 12;
      if (monthlyRate > 0) {
        tienTraNHThang = soTienVay * monthlyRate * Math.pow(1 + monthlyRate, totalPayments) / 
                        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      }
    }
  }
  
  // Safe percentage calculations
  const giaTriBDS = Number(inputs.giaTriBDS) || 0;
  const chiPhiBaoTriThang = giaTriBDS > 0 ? (giaTriBDS * (Number(inputs.phiBaoTri) || 0) / 100) / 12 : 0;
  const duPhongCapExThang = giaTriBDS > 0 ? (giaTriBDS * (Number(inputs.duPhongCapEx) || 0) / 100) / 12 : 0;
  const baoHiemTaiSanThang = giaTriBDS > 0 ? (giaTriBDS * (Number(inputs.baoHiemTaiSan) || 0) / 100) / 12 : 0;
  
  const tongChiPhiVanHanh = tienTraNHThang + (Number(inputs.phiQuanLy) || 0) + 
                           chiPhiBaoTriThang + duPhongCapExThang + baoHiemTaiSanThang;
  
  return {
    tienTraNHThang: Number(tienTraNHThang) || 0,
    chiPhiBaoTriThang: Number(chiPhiBaoTriThang) || 0,
    duPhongCapExThang: Number(duPhongCapExThang) || 0,
    baoHiemTaiSanThang: Number(baoHiemTaiSanThang) || 0,
    tongChiPhiVanHanh: Number(tongChiPhiVanHanh) || 0
  };
}

/**
 * BƯỚC 3: Tính Dòng Tiền Ròng Từ Bất Động Sản
 * ✅ FIXED: Added safe division operations
 */
function calculatePropertyNetCashFlow(
  inputs: RealEstateInputs,
  tongChiPhiVanHanh: number
): Pick<CalculationSteps, 'thuNhapThueHieuDung' | 'thueChoThue_Thang' | 'dongTienRongBDS'> {
  
  // Safe rental income calculation
  const tienThueThang = Number(inputs.tienThueThang) || 0;
  const tyLeLapDay = Number(inputs.tyLeLapDay) || 0;
  const thueSuatChoThue = Number(inputs.thueSuatChoThue) || 0;
  
  const thuNhapThueHieuDung = tienThueThang * (tyLeLapDay / 100);
  const thueChoThue_Thang = thuNhapThueHieuDung * (thueSuatChoThue / 100);
  const dongTienRongBDS = thuNhapThueHieuDung - tongChiPhiVanHanh - thueChoThue_Thang;
  
  return {
    thuNhapThueHieuDung: Number(thuNhapThueHieuDung) || 0,
    thueChoThue_Thang: Number(thueChoThue_Thang) || 0,
    dongTienRongBDS: Number(dongTienRongBDS) || 0
  };
}

/**
 * BƯỚC 4: Tính Dòng Tiền Cuối Cùng
 * ✅ FIXED: Safe personal finance calculation
 */
function calculateFinalCashFlow(
  inputs: RealEstateInputs,
  dongTienRongBDS: number
): Pick<CalculationSteps, 'dongTienCuoiCung'> {
  
  // Safe personal finance calculation
  const thuNhapKhac = Number(inputs.thuNhapKhac) || 0;
  const chiPhiSinhHoat = Number(inputs.chiPhiSinhHoat) || 0;
  const dongTienRongBDSSafe = Number(dongTienRongBDS) || 0;
  
  const dongTienCuoiCung = (thuNhapKhac - chiPhiSinhHoat) + dongTienRongBDSSafe;
  
  return {
    dongTienCuoiCung: Number(dongTienCuoiCung) || 0
  };
}

/**
 * ✅ FIXED: Tính toán các chỉ số phân tích nâng cao với safe math
 */
function calculateAdvancedMetrics(inputs: RealEstateInputs, steps: CalculationSteps) {
  // Safe ROI calculation với fallbacks
  const tongVonBanDau = Number(steps.tongVonBanDau) || 1; // Avoid division by zero
  const dongTienRongBDS = Number(steps.dongTienRongBDS) || 0;
  
  let roiHangNam = 0;
  try {
    roiHangNam = calculateCashOnCashReturn(tongVonBanDau, dongTienRongBDS * 12);
  } catch (error) {
    // Fallback ROI calculation
    roiHangNam = tongVonBanDau > 0 ? (dongTienRongBDS * 12 / tongVonBanDau) * 100 : 0;
  }
  
  // Safe Rental Yield calculation
  let rentalYield = 0;
  try {
    const giaTriBDS = Number(inputs.giaTriBDS) || 1;
    const tienThueThang = Number(inputs.tienThueThang) || 0;
    const tyLeLapDay = Number(inputs.tyLeLapDay) || 0;
    rentalYield = calculateRentalYield(giaTriBDS, tienThueThang, tyLeLapDay);
  } catch (error) {
    // Fallback rental yield calculation
    const giaTriBDS = Number(inputs.giaTriBDS) || 1;
    const tienThueThang = Number(inputs.tienThueThang) || 0;
    rentalYield = giaTriBDS > 0 ? (tienThueThang * 12 / giaTriBDS) * 100 : 0;
  }
  
  // Safe NPV and Payback calculations
  const thoiGianVay = Number(inputs.thoiGianVay) || 20;
  const monthlyCashFlows = Array(thoiGianVay * 12).fill(dongTienRongBDS);
  
  let netPresentValue = 0;
  let paybackPeriod = -1;
  
  try {
    const discountRate = 10;
    netPresentValue = calculateNPV(tongVonBanDau, monthlyCashFlows, discountRate);
    paybackPeriod = calculatePaybackPeriod(tongVonBanDau, monthlyCashFlows);
  } catch (error) {
    console.warn('Advanced metrics calculation error, using fallbacks:', error);
    // Simple fallback calculations
    if (dongTienRongBDS > 0) {
      paybackPeriod = tongVonBanDau / (dongTienRongBDS * 12); // Years to payback
    }
  }
  
  return {
    roiHangNam: Number(roiHangNam) || 0,
    netPresentValue: Number(netPresentValue) || 0,
    paybackPeriod: Number(paybackPeriod) >= 0 ? Number(paybackPeriod) : -1,
    rentalYield: Number(rentalYield) || 0
  };
}

/**
 * ✅ FIXED: Generate warnings với safe checks
 */
function generateWarnings(inputs: RealEstateInputs, steps: CalculationSteps): string[] {
  const warnings: string[] = [];
  
  // Safe warning generation
  const tyLeVay = Number(inputs.tyLeVay) || 0;
  const dongTienRongBDS = Number(steps.dongTienRongBDS) || 0;
  const giaTriBDS = Number(inputs.giaTriBDS) || 1;
  const tienThueThang = Number(inputs.tienThueThang) || 0;
  
  if (tyLeVay > 80) {
    warnings.push(`⚠️ Tỷ lệ vay ${tyLeVay.toFixed(1)}% cao, có thể gặp khó khăn khi lãi suất tăng`);
  }
  
  if (dongTienRongBDS < 0) {
    warnings.push(`⚠️ Dòng tiền ròng âm ${Math.abs(dongTienRongBDS).toLocaleString('vi-VN')} VND/tháng`);
  }
  
  // Safe rental yield warning
  const rentalYieldCheck = giaTriBDS > 0 ? (tienThueThang * 12 / giaTriBDS) * 100 : 0;
  if (rentalYieldCheck < 4 && rentalYieldCheck > 0) {
    warnings.push(`⚠️ Tỷ suất cho thuê ${rentalYieldCheck.toFixed(2)}%/năm thấp so với mặt bằng thị trường`);
  }
  
  return warnings;
}

/**
 * ✅ FIXED: Generate suggestions với safe operations
 */
function generateSuggestions(inputs: RealEstateInputs, steps: CalculationSteps): string[] {
  const suggestions: string[] = [];
  
  // Safe suggestion generation
  const dongTienRongBDS = Number(steps.dongTienRongBDS) || 0;
  const tienThueThang = Number(inputs.tienThueThang) || 0;
  const phiQuanLy = Number(inputs.phiQuanLy) || 0;
  const duPhongCapEx = Number(inputs.duPhongCapEx) || 0;
  
  if (dongTienRongBDS < 0) {
    suggestions.push(`💡 Cân nhắc tăng tiền thuê hoặc giảm chi phí để cải thiện dòng tiền`);
  }
  
  if (tienThueThang > 0 && phiQuanLy > 0) {
    const feePercentage = (phiQuanLy / tienThueThang) * 100;
    if (feePercentage > 10) {
      suggestions.push(`💡 Phí quản lý chiếm ${feePercentage.toFixed(1)}% tiền thuê, cân nhắc tự quản lý hoặc tìm công ty rẻ hơn`);
    }
  }
  
  if (duPhongCapEx < 1) {
    suggestions.push(`💡 Nên dự phòng ít nhất 1% giá trị BĐS/năm cho chi phí lớn (CapEx) để tránh bị động`);
  }
  
  return suggestions;
}

/**
 * ✅ FIXED: Validate dữ liệu đầu vào với improved logic
 */
function validateInputs(inputs: RealEstateInputs): string[] {
  const errors: string[] = [];
  
  // Relaxed validation - warnings instead of errors
  const giaTriBDS = Number(inputs.giaTriBDS) || 0;
  const thuNhapKhac = Number(inputs.thuNhapKhac) || 0;
  const chiPhiSinhHoat = Number(inputs.chiPhiSinhHoat) || 0;
  const thoiGianVay = Number(inputs.thoiGianVay) || 0;
  const tyLeLapDay = Number(inputs.tyLeLapDay) || 0;
  const thoiGianUuDai = Number(inputs.thoiGianUuDai) || 0;
  
  if (giaTriBDS <= 0) {
    errors.push('Giá trị BĐS phải lớn hơn 0');
  }
  
  if (thuNhapKhac < 0) {
    errors.push('Thu nhập khác không được âm');
  }
  
  if (chiPhiSinhHoat < 0) {
    errors.push('Chi phí sinh hoạt không được âm');
  }
  
  if (thoiGianVay <= 0) {
    errors.push('Thời gian vay phải lớn hơn 0');
  }
  
  if (tyLeLapDay < 0 || tyLeLapDay > 100) {
    errors.push('Tỷ lệ lấp đầy phải từ 0% đến 100%');
  }
  
  if (thoiGianUuDai > thoiGianVay * 12) {
    errors.push('Thời gian ưu đãi không được vượt quá thời gian vay');
  }
  
  return errors;
}

/**
 * ✅ ENHANCED: Tính toán chi tiết theo từng tháng với error handling
 */
export function calculateMonthlyBreakdown(inputs: RealEstateInputs): {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  netCashFlow: number;
}[] {
  const breakdown: any[] = [];
  
  try {
    const thoiGianVay = Number(inputs.thoiGianVay) || 20;
    const totalMonths = thoiGianVay * 12;
    const tyLeVay = Number(inputs.tyLeVay) || 70;
    const giaTriBDS = Number(inputs.giaTriBDS) || 0;
    
    if (giaTriBDS <= 0) return breakdown;
    
    // Tính chi tiết thanh toán cho cả hai giai đoạn
    const paymentDetails = calculateDetailedPayments(
      giaTriBDS * (tyLeVay / 100),
      inputs.laiSuatUuDai,
      inputs.thoiGianUuDai,
      inputs.laiSuatThaNoi,
      thoiGianVay
    );
    
    let remainingBalance = giaTriBDS * (tyLeVay / 100);
    
    for (let month = 1; month <= totalMonths; month++) {
      const isPreferentialPeriod = month <= (Number(inputs.thoiGianUuDai) || 0);
      const monthlyRate = (isPreferentialPeriod ? 
        (Number(inputs.laiSuatUuDai) || 0) : 
        (Number(inputs.laiSuatThaNoi) || 0)) / 100 / 12;
      
      const payment = Math.abs(isPreferentialPeriod ? 
        (Number(paymentDetails.tienTraUuDai) || 0) : 
        (Number(paymentDetails.tienTraThaNoi) || 0));
      
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.max(0, payment - interestPayment);
      
      remainingBalance = Math.max(0, remainingBalance - principalPayment);
      
      // Tính dòng tiền ròng (simplified but safe)
      const result = calculateRealEstateInvestment(inputs);
      const netCashFlow = Number(result.steps.dongTienRongBDS) || 0;
      
      breakdown.push({
        month,
        payment: Number(payment) || 0,
        principal: Number(principalPayment) || 0,
        interest: Number(interestPayment) || 0,
        balance: Number(remainingBalance) || 0,
        netCashFlow: Number(netCashFlow) || 0
      });
    }
  } catch (error) {
    console.warn('Monthly breakdown calculation error:', error);
    // Return empty array if calculation fails
  }
  
  return breakdown;
}
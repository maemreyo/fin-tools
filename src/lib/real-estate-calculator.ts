import { RealEstateInputs, CalculationSteps, CalculationResult, WarningType, SuggestionType } from '@/types/real-estate';
import { 
  calculateDetailedPayments, 
  calculateNPV, 
  calculatePaybackPeriod, 
  calculateCashOnCashReturn,
  calculateRentalYield,
  validateFinancialInputs 
} from './financial-utils';

/**
 * Hàm tính toán chính theo công thức trong tài liệu
 * "Phân Tích Sâu Logic & Công Thức Tính Dòng Tiền Bất Động Sản"
 */
export function calculateRealEstateInvestment(inputs: RealEstateInputs): CalculationResult {
  // Validate inputs trước khi tính toán
  const validationErrors = validateInputs(inputs);
  if (validationErrors.length > 0) {
    throw new Error(`Lỗi dữ liệu đầu vào: ${validationErrors.join(', ')}`);
  }

  // BƯỚC 1: Tính Tổng Vốn Đầu Tư Ban Đầu (Total Initial Investment)
  const step1 = calculateInitialInvestment(inputs);
  
  // BƯỚC 2: Tính Tổng Chi Phí Vận Hành Hàng Tháng (Total Monthly Operating Expenses)
  const step2 = calculateMonthlyOperatingExpenses(inputs, step1.soTienVay);
  
  // BƯỚC 3: Tính Dòng Tiền Ròng Từ Bất Động Sản (Property's Net Cash Flow)
  const step3 = calculatePropertyNetCashFlow(inputs, step2.tongChiPhiVanHanh);
  
  // BƯỚC 4: Tính Dòng Tiền Cuối Cùng (Final Personal Cash Flow)
  const step4 = calculateFinalCashFlow(inputs, step3.dongTienRongBDS);
  
  // Gộp tất cả kết quả steps
  const steps: CalculationSteps = {
    ...step1,
    ...step2,
    ...step3,
    ...step4
  };
  
  // Phân tích bổ sung
  const analysis = calculateAdvancedMetrics(inputs, steps);
  
  // Cảnh báo và gợi ý
  const warnings = generateWarnings(inputs, steps);
  const suggestions = generateSuggestions(inputs, steps);
  
  return {
    inputs,
    steps,
    ...analysis,
    warnings,
    suggestions,
    calculatedAt: new Date()
  };
}

/**
 * BƯỚC 1: Tính Tổng Vốn Đầu Tư Ban Đầu
 * Theo công thức:
 * - SoTienVay = GiaTriBDS * TyLeVay
 * - VonTuCo = GiaTriBDS - SoTienVay  
 * - TongVonBanDau = VonTuCo + ChiPhiTrangBi + ChiPhiMua + BaoHiemKhoanVay
 */
function calculateInitialInvestment(inputs: RealEstateInputs): Pick<CalculationSteps, 'soTienVay' | 'vonTuCo' | 'tongVonBanDau'> {
  const soTienVay = inputs.giaTriBDS * (inputs.tyLeVay / 100);
  const vonTuCo = inputs.giaTriBDS - soTienVay;
  
  // Chi phí mua là % của giá trị BĐS
  const chiPhiMuaThucTe = inputs.giaTriBDS * (inputs.chiPhiMua / 100);
  
  // Bảo hiểm khoản vay là % của số tiền vay
  const baoHiemKhoanVayThucTe = soTienVay * (inputs.baoHiemKhoanVay / 100);
  
  const tongVonBanDau = vonTuCo + inputs.chiPhiTrangBi + chiPhiMuaThucTe + baoHiemKhoanVayThucTe;
  
  return {
    soTienVay,
    vonTuCo,
    tongVonBanDau
  };
}

/**
 * BƯỚC 2: Tính Tổng Chi Phí Vận Hành Hàng Tháng
 * Theo công thức:
 * - TienTraNHThang = PMT(...) (Tính động theo giai đoạn ưu đãi và thả nổi)
 * - ChiPhiBaoTriThang = (GiaTriBDS * PhiBaoTri) / 12
 * - DuPhongCapExThang = (GiaTriBDS * DuPhongCapEx) / 12  
 * - BaoHiemTaiSanThang = (GiaTriBDS * BaoHiemTaiSan) / 12
 * - TongChiPhiVanHanh = TienTraNHThang + PhiQuanLy + ChiPhiBaoTriThang + DuPhongCapExThang + BaoHiemTaiSanThang
 */
function calculateMonthlyOperatingExpenses(
  inputs: RealEstateInputs, 
  soTienVay: number
): Pick<CalculationSteps, 'tienTraNHThang' | 'chiPhiBaoTriThang' | 'duPhongCapExThang' | 'baoHiemTaiSanThang' | 'tongChiPhiVanHanh'> {
  
  // Tính tiền trả ngân hàng theo giai đoạn (ưu đãi vs thả nổi)
  const paymentDetails = calculateDetailedPayments(
    soTienVay,
    inputs.laiSuatUuDai,
    inputs.thoiGianUuDai,
    inputs.laiSuatThaNoi,
    inputs.thoiGianVay
  );
  
  // Sử dụng tiền trả ưu đãi cho tháng hiện tại (có thể mở rộng để tính theo thời gian)
  const tienTraNHThang = Math.abs(paymentDetails.tienTraUuDai);
  
  // Các chi phí khác tính theo công thức % năm chia 12
  const chiPhiBaoTriThang = (inputs.giaTriBDS * inputs.phiBaoTri / 100) / 12;
  const duPhongCapExThang = (inputs.giaTriBDS * inputs.duPhongCapEx / 100) / 12;
  const baoHiemTaiSanThang = (inputs.giaTriBDS * inputs.baoHiemTaiSan / 100) / 12;
  
  const tongChiPhiVanHanh = tienTraNHThang + inputs.phiQuanLy + chiPhiBaoTriThang + duPhongCapExThang + baoHiemTaiSanThang;
  
  return {
    tienTraNHThang,
    chiPhiBaoTriThang,
    duPhongCapExThang,
    baoHiemTaiSanThang,
    tongChiPhiVanHanh
  };
}

/**
 * BƯỚC 3: Tính Dòng Tiền Ròng Từ Bất Động Sản
 * Theo công thức:
 * - ThuNhapThueHieuDung = TienThueThang * TyLeLapDay
 * - ThueChoThue_Thang = ThuNhapThueHieuDung * ThueSuatChoThue
 * - DongTienRongBDS = ThuNhapThueHieuDung - TongChiPhiVanHanh - ThueChoThue_Thang
 */
function calculatePropertyNetCashFlow(
  inputs: RealEstateInputs,
  tongChiPhiVanHanh: number
): Pick<CalculationSteps, 'thuNhapThueHieuDung' | 'thueChoThue_Thang' | 'dongTienRongBDS'> {
  
  const thuNhapThueHieuDung = inputs.tienThueThang * (inputs.tyLeLapDay / 100);
  const thueChoThue_Thang = thuNhapThueHieuDung * (inputs.thueSuatChoThue / 100);
  const dongTienRongBDS = thuNhapThueHieuDung - tongChiPhiVanHanh - thueChoThue_Thang;
  
  return {
    thuNhapThueHieuDung,
    thueChoThue_Thang,
    dongTienRongBDS
  };
}

/**
 * BƯỚC 4: Tính Dòng Tiền Cuối Cùng
 * Theo công thức:
 * - DongTienCuoiCung = (ThuNhapKhac - ChiPhiSinhHoat) + DongTienRongBDS
 */
function calculateFinalCashFlow(
  inputs: RealEstateInputs,
  dongTienRongBDS: number
): Pick<CalculationSteps, 'dongTienCuoiCung'> {
  
  const dongTienCuoiCung = (inputs.thuNhapKhac - inputs.chiPhiSinhHoat) + dongTienRongBDS;
  
  return {
    dongTienCuoiCung
  };
}

/**
 * Tính toán các chỉ số phân tích nâng cao
 */
function calculateAdvancedMetrics(inputs: RealEstateInputs, steps: CalculationSteps) {
  // ROI hàng năm dựa trên dòng tiền ròng từ BĐS
  const roiHangNam = calculateCashOnCashReturn(steps.tongVonBanDau, steps.dongTienRongBDS * 12);
  
  // Rental Yield
  const rentalYield = calculateRentalYield(inputs.giaTriBDS, inputs.tienThueThang, inputs.tyLeLapDay);
  
  // Tạo mảng dòng tiền hàng tháng để tính NPV và Payback Period
  const monthlyCashFlows = Array(inputs.thoiGianVay * 12).fill(steps.dongTienRongBDS);
  
  // NPV với discount rate 10% (có thể điều chỉnh)
  const discountRate = 10;
  const netPresentValue = calculateNPV(steps.tongVonBanDau, monthlyCashFlows, discountRate);
  
  // Payback Period
  const paybackPeriod = calculatePaybackPeriod(steps.tongVonBanDau, monthlyCashFlows);
  
  return {
    roiHangNam,
    netPresentValue,
    paybackPeriod: paybackPeriod > 0 ? paybackPeriod : -1,
    rentalYield
  };
}

/**
 * Tạo cảnh báo dựa trên kết quả tính toán
 */
function generateWarnings(inputs: RealEstateInputs, steps: CalculationSteps): string[] {
  const warnings: string[] = [];
  
  // Cảnh báo tỷ lệ vay cao
  if (inputs.tyLeVay > 80) {
    warnings.push(`⚠️ Tỷ lệ vay ${inputs.tyLeVay}% quá cao, rủi ro tài chính lớn`);
  }
  
  // Cảnh báo dòng tiền âm
  if (steps.dongTienRongBDS < 0) {
    warnings.push(`⚠️ Dòng tiền ròng từ BĐS âm ${Math.abs(steps.dongTienRongBDS).toLocaleString('vi-VN')} VNĐ/tháng`);
  }
  
  if (steps.dongTienCuoiCung < 0) {
    warnings.push(`⚠️ Dòng tiền cá nhân cuối cùng âm ${Math.abs(steps.dongTienCuoiCung).toLocaleString('vi-VN')} VNĐ/tháng`);
  }
  
  // Cảnh báo tỷ lệ lấp đây thấp
  if (inputs.tyLeLapDay < 90) {
    warnings.push(`⚠️ Tỷ lệ lấp đầy ${inputs.tyLeLapDay}% thấp, có thể ảnh hưởng dòng tiền`);
  }
  
  // Cảnh báo thu nhập không đủ
  const incomeRatio = (inputs.thuNhapKhac - inputs.chiPhiSinhHoat) / inputs.thuNhapKhac;
  if (incomeRatio < 0.2) {
    warnings.push(`⚠️ Thu nhập khả dụng chỉ ${(incomeRatio * 100).toFixed(1)}%, rủi ro tài chính cao`);
  }
  
  // Cảnh báo rental yield thấp
  const rentalYield = calculateRentalYield(inputs.giaTriBDS, inputs.tienThueThang, inputs.tyLeLapDay);
  if (rentalYield < 5) {
    warnings.push(`⚠️ Tỷ suất cho thuê ${rentalYield.toFixed(2)}%/năm thấp so với mặt bằng thị trường`);
  }
  
  return warnings;
}

/**
 * Tạo gợi ý cải thiện
 */
function generateSuggestions(inputs: RealEstateInputs, steps: CalculationSteps): string[] {
  const suggestions: string[] = [];
  
  // Gợi ý giảm tỷ lệ vay
  if (inputs.tyLeVay > 70) {
    const betterRatio = 70;
    const newLoanAmount = inputs.giaTriBDS * (betterRatio / 100);
    const additionalCash = steps.soTienVay - newLoanAmount;
    suggestions.push(`💡 Giảm tỷ lệ vay xuống ${betterRatio}% (tăng vốn tự có ${additionalCash.toLocaleString('vi-VN')} VNĐ) để giảm rủi ro`);
  }
  
  // Gợi ý tăng tiền thuê
  if (steps.dongTienRongBDS < 0) {
    const neededRent = steps.tongChiPhiVanHanh + steps.thueChoThue_Thang;
    const increaseNeeded = neededRent - inputs.tienThueThang * (inputs.tyLeLapDay / 100);
    suggestions.push(`💡 Cần tăng tiền thuê thêm ${increaseNeeded.toLocaleString('vi-VN')} VNĐ/tháng để đạt hòa vốn`);
  }
  
  // Gợi ý cải thiện tỷ lệ lấp đầy
  if (inputs.tyLeLapDay < 95) {
    suggestions.push(`💡 Cải thiện tỷ lệ lấp đầy lên 95% thông qua marketing và dịch vụ tốt hơn`);
  }
  
  // Gợi ý tối ưu chi phí
  if (inputs.phiQuanLy > inputs.tienThueThang * 0.1) {
    suggestions.push(`💡 Phí quản lý chiếm ${((inputs.phiQuanLy / inputs.tienThueThang) * 100).toFixed(1)}% tiền thuê, cân nhắc tự quản lý hoặc tìm công ty rẻ hơn`);
  }
  
  // Gợi ý about CapEx reserve
  if (inputs.duPhongCapEx < 1) {
    suggestions.push(`💡 Nên dự phòng ít nhất 1% giá trị BĐS/năm cho chi phí lớn (CapEx) để tránh bị động`);
  }
  
  return suggestions;
}

/**
 * Validate dữ liệu đầu vào
 */
function validateInputs(inputs: RealEstateInputs): string[] {
  const errors: string[] = [];
  
  // Validate required fields
  if (!inputs.giaTriBDS || inputs.giaTriBDS <= 0) {
    errors.push('Giá trị BĐS phải lớn hơn 0');
  }
  
  if (!inputs.thuNhapKhac || inputs.thuNhapKhac < 0) {
    errors.push('Thu nhập khác phải được nhập và không âm');
  }
  
  if (!inputs.chiPhiSinhHoat || inputs.chiPhiSinhHoat < 0) {
    errors.push('Chi phí sinh hoạt phải được nhập và không âm');
  }
  
  if (!inputs.thoiGianVay || inputs.thoiGianVay <= 0) {
    errors.push('Thời gian vay phải lớn hơn 0');
  }
  
  // Validate financial parameters
  const financialErrors = validateFinancialInputs({
    laiSuatUuDai: inputs.laiSuatUuDai,
    laiSuatThaNoi: inputs.laiSuatThaNoi,
    tyLeVay: inputs.tyLeVay,
    thoiGianVay: inputs.thoiGianVay
  });
  
  errors.push(...financialErrors);
  
  // Validate percentages
  if (inputs.tyLeLapDay < 0 || inputs.tyLeLapDay > 100) {
    errors.push('Tỷ lệ lấp đầy phải từ 0% đến 100%');
  }
  
  if (inputs.thoiGianUuDai > inputs.thoiGianVay * 12) {
    errors.push('Thời gian ưu đãi không được vượt quá thời gian vay');
  }
  
  return errors;
}

/**
 * Tính toán chi tiết theo từng tháng trong suốt thời gian vay
 * Hữu ích cho việc tạo biểu đồ dòng tiền theo thời gian
 */
export function calculateMonthlyBreakdown(inputs: RealEstateInputs): {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  netCashFlow: number;
}[] {
  const totalMonths = inputs.thoiGianVay * 12;
  const breakdown: any[] = [];
  
  // Tính chi tiết thanh toán cho cả hai giai đoạn
  const paymentDetails = calculateDetailedPayments(
    inputs.giaTriBDS * (inputs.tyLeVay / 100),
    inputs.laiSuatUuDai,
    inputs.thoiGianUuDai,
    inputs.laiSuatThaNoi,
    inputs.thoiGianVay
  );
  
  let remainingBalance = inputs.giaTriBDS * (inputs.tyLeVay / 100);
  
  for (let month = 1; month <= totalMonths; month++) {
    const isPreferentialPeriod = month <= inputs.thoiGianUuDai;
    const monthlyRate = (isPreferentialPeriod ? inputs.laiSuatUuDai : inputs.laiSuatThaNoi) / 100 / 12;
    const payment = Math.abs(isPreferentialPeriod ? paymentDetails.tienTraUuDai : paymentDetails.tienTraThaNoi);
    
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = payment - interestPayment;
    
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    
    // Tính dòng tiền ròng (simplified)
    const result = calculateRealEstateInvestment(inputs);
    const netCashFlow = result.steps.dongTienRongBDS;
    
    breakdown.push({
      month,
      payment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance,
      netCashFlow
    });
  }
  
  return breakdown;
}
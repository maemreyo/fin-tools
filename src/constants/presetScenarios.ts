
import { PresetScenario } from '@/types/real-estate';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "studio-gialam-cautious",
    name: "Studio Gia Lâm (Kịch bản Thận trọng)",
    description:
      "Kịch bản thận trọng cho căn Studio tại Masterise Lakeside, dựa trên các giả định lãi suất cao và tiền thuê thấp mà chúng ta đã thảo luận.",
    category: "chung-cu",
    location: "hanoi",
    inputs: {
      giaTriBDS: 2397000000,
      chiPhiTrangBi: 100000000,
      vonTuCo: 750000000,
      tyLeVay: 70,
      thoiGianVay: 35,
      laiSuatUuDai: 8.0,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 10.0,
      tienThueThang: 6000000,
      phiQuanLy: 480000,
      tyLeLapDay: 95,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "1br-gialam-official",
    name: "1PN Gia Lâm (Theo CĐT)",
    description:
      "Phân tích dựa trên phiếu tính giá chính thức từ Chủ đầu tư cho căn 1PN diện tích 44.8m2.",
    category: "chung-cu",
    location: "hanoi",
    inputs: {
      giaTriBDS: 3512264492,
      chiPhiTrangBi: 150000000,
      vonTuCo: 750000000,
      tyLeVay: 70,
      thoiGianVay: 35,
      laiSuatUuDai: 8.0,
      thoiGianUuDai: 24, // Dựa trên chính sách ân hạn thực tế
      laiSuatThaNoi: 10.0,
      tienThueThang: 14000000,
      phiQuanLy: 716800,
      tyLeLapDay: 95,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "2br-namtuliem-standard",
    name: "2PN Nam Từ Liêm (Kịch bản Tiêu chuẩn)",
    description:
      "Một phương án tham khảo cho căn hộ 2PN điển hình tại khu vực Mỹ Đình, Nam Từ Liêm, phù hợp cho gia đình ở hoặc đầu tư cho thuê.",
    category: "chung-cu",
    location: "hanoi",
    inputs: {
      giaTriBDS: 4000000000,
      chiPhiTrangBi: 200000000,
      vonTuCo: 750000000,
      tyLeVay: 60,
      thoiGianVay: 25,
      laiSuatUuDai: 7.8,
      thoiGianUuDai: 18,
      laiSuatThaNoi: 9.8,
      tienThueThang: 16000000,
      phiQuanLy: 1200000,
      tyLeLapDay: 95,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "starter-apartment",
    name: "🏠 Chung cư starter - Người mới",
    description: "Căn hộ 2PN phù hợp đầu tư lần đầu, vốn ít, dòng tiền ổn định",
    category: "chung-cu",
    location: "hcm",
    inputs: {
      giaTriBDS: 2800000000, // 2.8 tỷ
      vonTuCo: 1000000000, // 1 tỷ (user có)
      chiPhiTrangBi: 40000000, // 40 triệu
      tienThueThang: 18000000, // 18 triệu
      laiSuatUuDai: 7.5,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 9.5,
      thoiGianVay: 25,
      phiQuanLy: 400000,
      tyLeLapDay: 95,
      phiBaoTri: 1,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "premium-investment",
    name: "💎 Căn hộ cao cấp - Nhà đầu tư",
    description:
      "Căn hộ 3PN cao cấp, ROI cao, thích hợp investor có kinh nghiệm",
    category: "chung-cu",
    location: "hcm",
    inputs: {
      giaTriBDS: 5200000000,
      vonTuCo: 1800000000,
      chiPhiTrangBi: 80000000,
      tienThueThang: 35000000,
      laiSuatUuDai: 6.8,
      thoiGianUuDai: 18,
      laiSuatThaNoi: 8.8,
      thoiGianVay: 20,
      phiQuanLy: 800000,
      tyLeLapDay: 98,
      phiBaoTri: 0.8,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "townhouse-family",
    name: "🏘️ Nhà phố - Gia đình trẻ",
    description:
      "Nhà phố 4x15m, vừa ở vừa cho thuê, phù hợp gia đình có con nhỏ",
    category: "nha-pho",
    location: "hcm",
    inputs: {
      giaTriBDS: 7800000000,
      vonTuCo: 2500000000,
      chiPhiTrangBi: 150000000,
      tienThueThang: 25000000,
      laiSuatUuDai: 7.2,
      thoiGianUuDai: 24,
      laiSuatThaNoi: 9.2,
      thoiGianVay: 25,
      phiQuanLy: 200000,
      tyLeLapDay: 90,
      phiBaoTri: 1.2,
      thueSuatChoThue: 10,
    },
  },
];

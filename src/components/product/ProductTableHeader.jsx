import { Input, Button, Upload, Tooltip, DatePicker } from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    UploadOutlined,
    DownloadOutlined,
    BarcodeOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { notification } from "antd";
import dayjs from "dayjs";

const ProductTableHeader = ({
    searchText,
    setSearchText,
    searchBarcode,
    setSearchBarcode,
    setCurrent,
    loadProduct,
    handleExportExcel,
    handleImportExcel,
    setIsCreateOpen,
    setIsScanBarcodeOpen,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px",
            }}
        >
            <h3 style={{ margin: 0, fontSize: "20px", color: "#1d39c4" }}>
                Danh Sách Sản Phẩm
            </h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <Input
                    placeholder="Tìm theo tên..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 200, borderRadius: "6px" }}
                    prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                    allowClear
                />
                <Input
                    placeholder="Tìm theo mã barcode..."
                    value={searchBarcode}
                    onChange={(e) => setSearchBarcode(e.target.value)}
                    style={{ width: 200, borderRadius: "6px" }}
                    prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                    allowClear
                />
                <DatePicker
                    placeholder="Ngày bắt đầu"
                    value={startDate ? dayjs(startDate) : null}
                    onChange={(date, dateString) => setStartDate(dateString)}
                    style={{ width: 200, borderRadius: "6px" }}
                />
                <DatePicker
                    placeholder="Ngày kết thúc"
                    value={endDate ? dayjs(endDate) : null}
                    onChange={(date, dateString) => setEndDate(dateString)}
                    style={{ width: 200, borderRadius: "6px" }}
                />
                <Tooltip title="Làm mới dữ liệu">
                    <Button
                        onClick={() => {
                            setSearchText("");
                            setSearchBarcode("");
                            setStartDate("");
                            setEndDate("");
                            setCurrent(1);
                            loadProduct();
                        }}
                        icon={<ReloadOutlined />}
                        style={{ borderRadius: "6px", borderColor: "#1890ff" }}
                    >
                        Làm mới
                    </Button>
                </Tooltip>
                <Tooltip title="Xuất dữ liệu ra Excel">
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportExcel}
                        style={{ borderRadius: "6px", borderColor: "#52c41a", color: "#52c41a" }}
                    >
                        Export Excel
                    </Button>
                </Tooltip>
                <Upload
                    beforeUpload={(file) => {
                        const isExcelOrCsv =
                            file.type === "application/vnd.ms-excel" ||
                            file.type === "text/csv" ||
                            file.type ===
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        if (!isExcelOrCsv) {
                            notification.error({
                                message: "File không hợp lệ",
                                description:
                                    "Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)!",
                            });
                            return Upload.LIST_IGNORE;
                        }
                        handleImportExcel(file);
                        return false;
                    }}
                    showUploadList={false}
                >
                    <Tooltip title="Nhập dữ liệu từ Excel/CSV">
                        <Button
                            icon={<UploadOutlined />}
                            style={{ borderRadius: "6px", borderColor: "#fa8c16", color: "#fa8c16" }}
                        >
                            Import Excel/CSV
                        </Button>
                    </Tooltip>
                </Upload>
                <Tooltip title="Thêm sản phẩm mới">
                    <Button
                        type="primary"
                        onClick={() => setIsCreateOpen(true)}
                        icon={<PlusOutlined />}
                        style={{ borderRadius: "6px", background: "#1d39c4", borderColor: "#1d39c4" }}
                    >
                        Thêm Sản Phẩm
                    </Button>
                </Tooltip>
                <Tooltip title="Thêm sản phẩm bằng quét barcode">
                    <Button
                        type="primary"
                        icon={<BarcodeOutlined />}
                        onClick={() => setIsScanBarcodeOpen(true)}
                        style={{ borderRadius: "6px", background: "#13c2c2", borderColor: "#13c2c2" }}
                    >
                        Thêm bằng Barcode
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};

export default ProductTableHeader;
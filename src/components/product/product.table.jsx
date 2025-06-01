import { useEffect, useState, useCallback } from "react";
import { notification } from "antd";
import {
    fetchAllProductAPI,
    deleteProductApi,
    excelImportProductsAPI,
} from "../../services/api.product";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ProductTableHeader from "./ProductTableHeader";
import ProductTableContent from "./ProductTableContent";
import ProductTableActions from "./ProductTableActions";
import ProductTableModals from "./ProductTableModals";
import "./product.table.css";
import dayjs from "dayjs";

const removeDiacritics = (str) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const ProductTable = () => {
    const [dataProduct, setDataProduct] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [searchBarcode, setSearchBarcode] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [expirationFilter, setExpirationFilter] = useState("all");
    const [loadingTable, setLoadingTable] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [isScanBarcodeOpen, setIsScanBarcodeOpen] = useState(false);
    const [dataDetail, setDataDetail] = useState(null);
    const [dataUpdate, setDataUpdate] = useState(null);

    const loadAllProducts = useCallback(async () => {
        setLoadingTable(true);
        let allProducts = [];
        let currentPage = 1;

        try {
            while (true) {
                const res = await fetchAllProductAPI(currentPage, pageSize);
                if (res.data && res.data.result) {
                    allProducts = [...allProducts, ...res.data.result];
                    setTotal(res.data.meta.total);
                    if (currentPage * pageSize >= res.data.meta.total) break;
                    currentPage++;
                } else {
                    throw new Error("Không thể tải dữ liệu sản phẩm từ server.");
                }
            }
            const sortedData = [...allProducts].sort((a, b) => {
                const dateA = new Date(a.expirationDate).getTime();
                const dateB = new Date(b.expirationDate).getTime();
                return dateA - dateB;
            });
            setDataProduct(sortedData);
            handleSearch(sortedData);
        } catch (error) {
            notification.error({
                message: "Lỗi tải dữ liệu",
                description: error.message || "Đã có lỗi xảy ra khi tải dữ liệu sản phẩm.",
            });
            setDataProduct([]);
            setFilteredData([]);
            setTotal(0);
        } finally {
            setLoadingTable(false);
        }
    }, [pageSize]);

    const handleSearch = useCallback((data = dataProduct) => {
        let filtered = [...data];

        if (searchText || searchBarcode || startDate || endDate || expirationFilter !== "all") {
            if (searchText) {
                const normalizedSearchText = removeDiacritics(searchText);
                filtered = filtered.filter((item) => {
                    if (!item.name) {
                        console.warn(`Sản phẩm với ID ${item._id} không có tên`);
                        return false;
                    }
                    const normalizedName = removeDiacritics(item.name);
                    return normalizedName.includes(normalizedSearchText);
                });
            }

            if (searchBarcode) {
                const normalizedSearchBarcode = removeDiacritics(searchBarcode);
                filtered = filtered.filter((item) => {
                    if (!item.barCode) {
                        return false;
                    }
                    const normalizedBarcode = removeDiacritics(item.barCode);
                    return normalizedBarcode.includes(normalizedSearchBarcode);
                });
            }

            if (startDate || endDate) {
                filtered = filtered.filter((item) => {
                    const itemDate = new Date(item.manufacturingDate).getTime();
                    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : -Infinity;
                    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
                    return itemDate >= start && itemDate <= end;
                });
            }

            if (expirationFilter !== "all") {
                const today = new Date();
                const fifteenDaysFromNow = new Date(today);
                fifteenDaysFromNow.setDate(today.getDate() + 15);

                filtered = filtered.filter((item) => {
                    const expirationDate = new Date(item.expirationDate);
                    if (expirationFilter === "expired") {
                        return expirationDate < today;
                    } else if (expirationFilter === "soon") {
                        return expirationDate >= today && expirationDate <= fifteenDaysFromNow;
                    }
                    return true;
                });
            }
        }

        setFilteredData(filtered);
        setCurrent(1);
    }, [searchText, searchBarcode, startDate, endDate, expirationFilter, dataProduct]);

    useEffect(() => {
        loadAllProducts();
    }, [loadAllProducts]);

    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    const handleImportExcel = async (file) => {
        try {
            const res = await excelImportProductsAPI(file);
            if (res.data) {
                notification.success({
                    message: "Import Products Success",
                    description: "Nhập sản phẩm từ file Excel/CSV thành công!",
                });
                await loadAllProducts();
            } else {
                throw new Error(JSON.stringify(res.message));
            }
        } catch (error) {
            notification.error({
                message: "Error Importing Products",
                description: error.message || "Đã có lỗi xảy ra khi nhập file.",
            });
        }
    };

    const handleExportExcel = () => {
        if (filteredData.length === 0) {
            notification.warning({
                message: "Không có dữ liệu",
                description: "Không có dữ liệu để xuất ra file Excel.",
            });
            return;
        }

        const exportData = filteredData.map((item, index) => ({
            STT: index + 1,
            ID: item._id,
            "Mã Sản Phẩm": item.barCode,
            "Tên Sản Phẩm": item.name,
            "Link Ảnh": item.image,
            "Giá Tiền": item.price,
            "Số Lượng": item.quantity,
            "Ngày Sản Xuất": formatDate(item.manufacturingDate),
            "Ngày Hết Hạn": formatDate(item.expirationDate),
            "Đã Bán": item.sold || 0,
            "Mô Tả": item.description || "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workProduct = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workProduct, worksheet, "Products");

        const excelBuffer = XLSX.write(workProduct, {
            bookType: "xlsx",
            type: "array",
        });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `products_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const handleDeleteProduct = async (id) => {
        try {
            const res = await deleteProductApi(id);
            if (res.data) {
                notification.success({
                    message: "Delete Product",
                    description: "Xóa sản phẩm thành công!",
                });
                await loadAllProducts();
            } else {
                throw new Error(JSON.stringify(res.message));
            }
        } catch (error) {
            notification.error({
                message: "Error Deleting Product",
                description: error.message || "Đã có lỗi xảy ra khi xóa sản phẩm.",
            });
        }
    };

    const onChangeTable = (pagination) => {
        if (pagination.current !== current) {
            setCurrent(pagination.current);
        }
        if (pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    };

    return (
        <div style={{ padding: "24px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
            <ProductTableHeader
                searchText={searchText}
                setSearchText={setSearchText}
                searchBarcode={searchBarcode}
                setSearchBarcode={setSearchBarcode}
                setCurrent={setCurrent}
                loadProduct={loadAllProducts}
                handleExportExcel={handleExportExcel}
                handleImportExcel={handleImportExcel}
                setIsCreateOpen={setIsCreateOpen}
                setIsScanBarcodeOpen={setIsScanBarcodeOpen}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                expirationFilter={expirationFilter}
                setExpirationFilter={setExpirationFilter}
            />
            <ProductTableContent
                filteredData={filteredData}
                current={current}
                pageSize={pageSize}
                total={filteredData.length}
                loadingTable={loadingTable}
                setDataDetail={setDataDetail}
                setIsDetailOpen={setIsDetailOpen}
                onChangeTable={onChangeTable}
                ProductTableActions={ProductTableActions}
                setDataUpdate={setDataUpdate}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                handleDeleteProduct={handleDeleteProduct}
            />
            <ProductTableModals
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isDetailOpen={isDetailOpen}
                setIsDetailOpen={setIsDetailOpen}
                isCreateOpen={isCreateOpen}
                setIsCreateOpen={setIsCreateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                isScanBarcodeOpen={isScanBarcodeOpen}
                setIsScanBarcodeOpen={setIsScanBarcodeOpen}
                loadProduct={loadAllProducts}
            />
        </div>
    );
};

export default ProductTable;
// src/components/banking/BankingPage.jsx
import React, { useState, useEffect } from "react";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { notification, Modal, Button } from "antd";
import {
    fetchTransactionListAPI,
    fetchTotalTransactionsAPI,
    fetchTransactionDetailAPI,
} from "../../services/api.banking";
import BankingHeader from "./BankingHeader";
import BankingTable from "./BankingTable";
import TransactionDetailModal from "./TransactionDetailModal";
import "./BankingPage.css";

const BankingPage = () => {
    const [rawTransactions, setRawTransactions] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [accountFilter, setAccountFilter] = useState("Tất cả");
    const [transactionType, setTransactionType] = useState("Tất cả");
    const [timeRange, setTimeRange] = useState("Tất cả");
    const [customDateRange, setCustomDateRange] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [revenueDate, setRevenueDate] = useState(null);
    const [revenueModalVisible, setRevenueModalVisible] = useState(false);
    const [revenueResult, setRevenueResult] = useState(null);
    const [revenueGranularity, setRevenueGranularity] = useState("Ngày");

    const fetchTotalTransactions = async () => {
        try {
            const response = await fetchTotalTransactionsAPI();
            setTotalTransactions(response.data || 0);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lấy tổng số giao dịch.",
            });
        }
    };

    const fetchTransactions = async (page = 1, size = pageSize) => {
        setLoading(true);
        try {
            const response = await fetchTransactionListAPI(page, size);
            setRawTransactions(response.data || []);
            setTransactions(response.data || []);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lấy danh sách giao dịch.",
            });
            setRawTransactions([]);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionDetail = async (transactionId) => {
        setLoading(true);
        try {
            const response = await fetchTransactionDetailAPI(transactionId);
            setSelectedTransaction(response.data);
            setDetailVisible(true);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lấy chi tiết giao dịch.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTotalTransactions();
        fetchTransactions(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const applyFilters = () => {
        let filtered = [...rawTransactions];

        if (accountFilter !== "Tất cả") {
            filtered = filtered.filter((item) => {
                const netAmount = (item.amountIn || 0) - (item.amountOut || 0);
                if (accountFilter === "Dưới 1 triệu") {
                    return netAmount < 1000000;
                } else if (accountFilter === "1 triệu - 5 triệu") {
                    return netAmount >= 1000000 && netAmount <= 5000000;
                }
                return true;
            });
        }

        if (transactionType !== "Tất cả") {
            filtered = filtered.filter((item) => {
                if (transactionType === "Tiền vào") {
                    return (item.amountIn || 0) > 0;
                } else if (transactionType === "Tiền ra") {
                    return (item.amountOut || 0) > 0;
                }
                return true;
            });
        }

        if (timeRange !== "Tất cả") {
            let startDate, endDate;
            const now = new Date();

            if (timeRange === "Tùy chỉnh" && customDateRange) {
                startDate = customDateRange[0].toDate();
                endDate = customDateRange[1].toDate();
                endDate.setHours(23, 59, 59, 999);
            } else if (timeRange === "Hôm nay") {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            } else if (timeRange === "Hôm qua") {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (timeRange === "Tháng này") {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            } else if (timeRange === "Tháng trước") {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (timeRange === "7 ngày qua") {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            } else if (timeRange === "30 ngày qua") {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            }

            if (startDate && endDate) {
                filtered = filtered.filter((item) => {
                    const transactionDate = new Date(item.transactionDate);
                    return transactionDate >= startDate && transactionDate < endDate;
                });
            }
        }

        if (searchText) {
            filtered = filtered.filter(
                (item) =>
                    (item.id || "").toLowerCase().includes(searchText.toLowerCase()) ||
                    (item.content || "").toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setTransactions(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [rawTransactions, accountFilter, transactionType, timeRange, customDateRange, searchText]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (current, size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleViewDetail = (transactionId) => {
        fetchTransactionDetail(transactionId);
    };

    const handleExportExcel = () => {
        if (transactions.length === 0) {
            notification.warning({
                message: "Không có dữ liệu",
                description: "Không có dữ liệu để xuất ra file Excel.",
            });
            return;
        }

        const exportData = transactions.map((item, index) => ({
            STT: (currentPage - 1) * pageSize + index + 1,
            "ID Giao Dịch": item.id,
            "Ngày Giao Dịch": item.transactionDate
                ? new Date(item.transactionDate).toLocaleString("vi-VN")
                : "N/A",
            "Số Tiền": formatAmount(item.amountIn, item.amountOut).text,
            "Loại Tiền": item.amountIn > 0 ? "Chuyển vào" : "Chuyển ra",
            "Nội Dung": item.content || "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `transactions_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const handleRefresh = () => {
        setAccountFilter("Tất cả");
        setTransactionType("Tất cả");
        setTimeRange("Tất cả");
        setCustomDateRange(null);
        setSearchText("");
        setCurrentPage(1);
        setPageSize(10);
        setRevenueDate(null);
        setRevenueGranularity("Ngày");
        fetchTransactions(1, 10);
    };

    const calculateRevenue = () => {
        if (!revenueDate) {
            notification.warning({
                message: "Chưa chọn thời gian",
                description: "Vui lòng chọn ngày, tháng, năm hoặc tuần để tính doanh thu.",
            });
            return;
        }

        let startDate, endDate;
        let displayDate;
        const selectedDate = revenueDate.toDate();

        if (revenueGranularity === "Ngày") {
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
            displayDate = selectedDate.toLocaleDateString("vi-VN");
        } else if (revenueGranularity === "Tuần") {
            // Tính ngày thứ Hai của tuần chứa selectedDate
            const dayOfWeek = selectedDate.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Di chuyển về thứ Hai
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + mondayOffset);
            endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 7); // Thứ Hai + 7 ngày
            displayDate = `Tuần từ ${startDate.toLocaleDateString("vi-VN")} - ${new Date(endDate.getTime() - 1).toLocaleDateString("vi-VN")}`;
        } else if (revenueGranularity === "Tháng") {
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
            displayDate = `Tháng ${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
        } else if (revenueGranularity === "Năm") {
            startDate = new Date(selectedDate.getFullYear(), 0, 1);
            endDate = new Date(selectedDate.getFullYear() + 1, 0, 1);
            displayDate = `Năm ${selectedDate.getFullYear()}`;
        }

        const filteredTransactions = rawTransactions.filter((item) => {
            const transactionDate = new Date(item.transactionDate);
            return transactionDate >= startDate && transactionDate < endDate;
        });

        const totalRevenue = filteredTransactions.reduce((sum, item) => {
            return sum + (item.amountIn || 0) - (item.amountOut || 0);
        }, 0);

        setRevenueResult({
            date: displayDate,
            total: totalRevenue,
            transactionCount: filteredTransactions.length,
        });
        setRevenueModalVisible(true);
    };

    const formatAmount = (amountIn, amountOut) => {
        if (amountIn > 0) {
            return {
                text: `+${amountIn.toLocaleString("vi-VN")} VNĐ`,
                className: "amount-positive",
            };
        }
        if (amountOut > 0) {
            return {
                text: `-${amountOut.toLocaleString("vi-VN")} VNĐ`,
                className: "amount-negative",
            };
        }
        return {
            text: "0 VNĐ",
            className: "amount-neutral",
        };
    };

    return (
        <div className="banking-page-container">
            <h2>Danh Sách Giao Dịch Ngân Hàng</h2>
            <BankingHeader
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                transactionType={transactionType}
                setTransactionType={setTransactionType}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                customDateRange={customDateRange}
                setCustomDateRange={setCustomDateRange}
                searchText={searchText}
                setSearchText={setSearchText}
                handleRefresh={handleRefresh}
                handleExportExcel={handleExportExcel}
                revenueDate={revenueDate}
                setRevenueDate={setRevenueDate}
                revenueGranularity={revenueGranularity}
                setRevenueGranularity={setRevenueGranularity}
                calculateRevenue={calculateRevenue}
            />
            <BankingTable
                transactions={transactions}
                currentPage={currentPage}
                pageSize={pageSize}
                totalTransactions={totalTransactions}
                handlePageChange={handlePageChange}
                handlePageSizeChange={handlePageSizeChange}
                handleViewDetail={handleViewDetail}
                formatAmount={formatAmount}
                loading={loading}
            />
            <TransactionDetailModal
                detailVisible={detailVisible}
                setDetailVisible={setDetailVisible}
                selectedTransaction={selectedTransaction}
                formatAmount={formatAmount}
            />
            <Modal
                title="Kết Quả Doanh Thu"
                open={revenueModalVisible}
                onCancel={() => setRevenueModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setRevenueModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
            >
                {revenueResult ? (
                    <div>
                        <p>
                            <strong>Thời gian:</strong> {revenueResult.date}
                        </p>
                        <p>
                            <strong>Tổng doanh thu:</strong>{" "}
                            <span className={revenueResult.total >= 0 ? "amount-positive" : "amount-negative"}>
                                {revenueResult.total.toLocaleString("vi-VN")} VNĐ
                            </span>
                        </p>
                        <p>
                            <strong>Số giao dịch:</strong> {revenueResult.transactionCount}
                        </p>
                    </div>
                ) : (
                    <p>Đang tải...</p>
                )}
            </Modal>
        </div>
    );
};

export default BankingPage;
// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, notification, Spin, Select, Input, Space, DatePicker } from "antd";
// import { SearchOutlined, ReloadOutlined, BankOutlined } from "@ant-design/icons";
// import {
//     fetchTransactionListAPI,
//     fetchTotalTransactionsAPI,
//     fetchTransactionDetailAPI,
// } from "../../services/api.banking";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import "./BankingPage.css";
// import moment from "moment"; // For handling dates with DatePicker

// const { Option } = Select;
// const { RangePicker } = DatePicker;

// const BankingPage = () => {
//     const [rawTransactions, setRawTransactions] = useState([]);
//     const [transactions, setTransactions] = useState([]);
//     const [totalTransactions, setTotalTransactions] = useState(0);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize] = useState(10);
//     const [loading, setLoading] = useState(false);
//     const [detailVisible, setDetailVisible] = useState(false);
//     const [selectedTransaction, setSelectedTransaction] = useState(null);
//     const [accountFilter, setAccountFilter] = useState("Tất cả");
//     const [transactionType, setTransactionType] = useState("Tất cả");
//     const [timeRange, setTimeRange] = useState("Tất cả"); // New state for time range
//     const [customDateRange, setCustomDateRange] = useState(null); // For custom date range
//     const [searchText, setSearchText] = useState("");

//     const fetchTotalTransactions = async () => {
//         try {
//             const response = await fetchTotalTransactionsAPI();
//             setTotalTransactions(response.data || 0);
//         } catch (error) {
//             notification.error({
//                 message: "Lỗi",
//                 description: error.response?.data?.message || "Không thể lấy tổng số giao dịch.",
//             });
//         }
//     };

//     const fetchTransactions = async (page = 1) => {
//         setLoading(true);
//         try {
//             const response = await fetchTransactionListAPI(page, pageSize);
//             setTransactions(response.data || []);
//             setRawTransactions(response.data || []);
//             applyFilters(response.data || [], accountFilter, transactionType, timeRange, customDateRange, searchText);
//         } catch (error) {
//             notification.error({
//                 message: "Lỗi",
//                 description: error.response?.data?.message || "Không thể lấy danh sách giao dịch.",
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchTransactionDetail = async (transactionId) => {
//         setLoading(true);
//         try {
//             const response = await fetchTransactionDetailAPI(transactionId);
//             setSelectedTransaction(response.data);
//             setDetailVisible(true);
//         } catch (error) {
//             notification.error({
//                 message: "Lỗi",
//                 description: error.response?.data?.message || "Không thể lấy chi tiết giao dịch.",
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchTotalTransactions();
//         fetchTransactions(currentPage);
//     }, [currentPage]);

//     const applyFilters = (data, amountFilter, typeFilter, timeFilter, customRange, search) => {
//         let filtered = [...data];

//         // Apply Amount Filter
//         if (amountFilter !== "Tất cả") {
//             filtered = filtered.filter((item) => {
//                 const netAmount = (item.amountIn || 0) - (item.amountOut || 0);
//                 if (amountFilter === "Dưới 1 triệu") {
//                     return netAmount < 1000000;
//                 } else if (amountFilter === "1 triệu - 5 triệu") {
//                     return netAmount >= 1000000 && netAmount <= 5000000;
//                 }
//                 return true;
//             });
//         }

//         // Apply Transaction Type Filter
//         if (typeFilter !== "Tất cả") {
//             filtered = filtered.filter((item) => {
//                 if (typeFilter === "Tiền vào") {
//                     return (item.amountIn || 0) > 0;
//                 } else if (typeFilter === "Tiền ra") {
//                     return (item.amountOut || 0) > 0;
//                 }
//                 return true;
//             });
//         }

//         // Apply Time Range Filter
//         if (timeFilter !== "Tất cả") {
//             let startDate, endDate;
//             const now = new Date();

//             if (timeFilter === "Tùy chỉnh" && customRange) {
//                 startDate = customRange[0].toDate();
//                 endDate = customRange[1].toDate();
//                 endDate.setHours(23, 59, 59, 999); // Include the whole end day
//             } else if (timeFilter === "Hôm nay") {
//                 startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//                 endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
//             } else if (timeFilter === "Hôm qua") {
//                 startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
//                 endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//             } else if (timeFilter === "Tháng này") {
//                 startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//                 endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//             } else if (timeFilter === "Tháng trước") {
//                 startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//                 endDate = new Date(now.getFullYear(), now.getMonth(), 1);
//             } else if (timeFilter === "7 ngày qua") {
//                 startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
//                 endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
//             } else if (timeFilter === "30 ngày qua") {
//                 startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
//                 endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
//             }

//             if (startDate && endDate) {
//                 filtered = filtered.filter((item) => {
//                     const transactionDate = new Date(item.transactionDate);
//                     return transactionDate >= startDate && transactionDate < endDate;
//                 });
//             }
//         }

//         // Apply Search Filter
//         if (search) {
//             filtered = filtered.filter(
//                 (item) =>
//                     (item.id || "").toLowerCase().includes(search.toLowerCase()) ||
//                     (item.content || "").toLowerCase().includes(search.toLowerCase())
//             );
//         }

//         setTransactions(filtered);
//     };

//     const handlePageChange = (page) => {
//         setCurrentPage(page);
//     };

//     const handleViewDetail = (transactionId) => {
//         fetchTransactionDetail(transactionId);
//     };

//     const handleExportExcel = () => {
//         if (transactions.length === 0) {
//             notification.warning({
//                 message: "Không có dữ liệu",
//                 description: "Không có dữ liệu để xuất ra file Excel.",
//             });
//             return;
//         }

//         const exportData = transactions.map((item, index) => ({
//             STT: (currentPage - 1) * pageSize + index + 1,
//             "ID Giao Dịch": item.id,
//             "Ngày Giao Dịch": item.transactionDate
//                 ? new Date(item.transactionDate).toLocaleString("vi-VN")
//                 : "N/A",
//             "Số Tiền": formatAmount(item.amountIn, item.amountOut).text,
//             "Loại Tiền": item.amountIn > 0 ? "Chuyển vào" : "Chuyển ra", // Added for new column
//             "Nội Dung": item.content || "N/A",
//         }));

//         const worksheet = XLSX.utils.json_to_sheet(exportData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

//         const excelBuffer = XLSX.write(workbook, {
//             bookType: "xlsx",
//             type: "array",
//         });
//         const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//         saveAs(data, `transactions_${new Date().toISOString().split("T")[0]}.xlsx`);
//     };

//     const handleRefresh = () => {
//         setAccountFilter("Tất cả");
//         setTransactionType("Tất cả");
//         setTimeRange("Tất cả");
//         setCustomDateRange(null);
//         setSearchText("");
//         setCurrentPage(1);
//         fetchTransactions(1);
//     };

//     const handleAmountFilterChange = (value) => {
//         setAccountFilter(value);
//         applyFilters(rawTransactions, value, transactionType, timeRange, customDateRange, searchText);
//     };

//     const handleTransactionTypeChange = (value) => {
//         setTransactionType(value);
//         applyFilters(rawTransactions, accountFilter, value, timeRange, customDateRange, searchText);
//     };

//     const handleTimeRangeChange = (value) => {
//         setTimeRange(value);
//         if (value !== "Tùy chỉnh") {
//             setCustomDateRange(null);
//         }
//         applyFilters(rawTransactions, accountFilter, transactionType, value, customDateRange, searchText);
//     };

//     const handleCustomDateRangeChange = (dates) => {
//         setCustomDateRange(dates);
//         applyFilters(rawTransactions, accountFilter, transactionType, timeRange, dates, searchText);
//     };

//     const handleSearchTextChange = (e) => {
//         const value = e.target.value;
//         setSearchText(value);
//         applyFilters(rawTransactions, accountFilter, transactionType, timeRange, customDateRange, value);
//     };

//     const formatAmount = (amountIn, amountOut) => {
//         if (amountIn > 0) {
//             return {
//                 text: `+${amountIn.toLocaleString("vi-VN")} VNĐ`,
//                 className: "amount-positive",
//             };
//         }
//         if (amountOut > 0) {
//             return {
//                 text: `-${amountOut.toLocaleString("vi-VN")} VNĐ`,
//                 className: "amount-negative",
//             };
//         }
//         return {
//             text: "0 VNĐ",
//             className: "amount-neutral",
//         };
//     };

//     const columns = [
//         {
//             title: "STT",
//             key: "stt",
//             render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
//             sorter: (a, b, sortOrder) => {
//                 const indexA = (currentPage - 1) * pageSize + transactions.indexOf(a) + 1;
//                 const indexB = (currentPage - 1) * pageSize + transactions.indexOf(b) + 1;
//                 return sortOrder === "ascend" ? indexA - indexB : indexB - indexA;
//             },
//             sortDirections: ["ascend", "descend"],
//         },
//         {
//             title: "ID Giao Dịch",
//             dataIndex: "id",
//             key: "id",
//             sorter: (a, b) => a.id.localeCompare(b.id),
//             sortDirections: ["ascend", "descend"],
//         },
//         {
//             title: "Ngày Giao Dịch",
//             dataIndex: "transactionDate",
//             key: "transactionDate",
//             sorter: (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime(),
//             sortDirections: ["ascend", "descend"],
//             render: (text) => (text ? new Date(text).toLocaleString("vi-VN") : "N/A"),
//         },
//         {
//             title: "Số Tiền",
//             key: "amount",
//             sorter: (a, b) => (a.amountIn || 0) - (a.amountOut || 0) - ((b.amountIn || 0) - (b.amountOut || 0)),
//             sortDirections: ["ascend", "descend"],
//             render: (_, record) => {
//                 const { text, className } = formatAmount(record.amountIn, record.amountOut);
//                 return <span className={className}>{text}</span>;
//             },
//         },
//         {
//             title: "Loại Tiền", // New column
//             key: "moneyType",
//             sorter: (a, b) => {
//                 const typeA = a.amountIn > 0 ? "Chuyển vào" : "Chuyển ra";
//                 const typeB = b.amountIn > 0 ? "Chuyển vào" : "Chuyển ra";
//                 return typeA.localeCompare(typeB);
//             },
//             sortDirections: ["ascend", "descend"],
//             render: (_, record) => (record.amountIn > 0 ? "Chuyển vào" : "Chuyển ra"),
//         },
//         {
//             title: "Nội Dung",
//             dataIndex: "content",
//             key: "content",
//             sorter: (a, b) => (a.content || "").localeCompare(b.content || ""),
//             sortDirections: ["ascend", "descend"],
//             render: (text) => text || "N/A",
//         },
//         {
//             title: "Hành Động",
//             key: "action",
//             render: (_, record) => (
//                 <Button onClick={() => handleViewDetail(record.id)}>Xem Chi Tiết</Button>
//             ),
//         },
//     ];

//     return (
//         <div className="banking-page-container">
//             <h2>Danh Sách Giao Dịch Ngân Hàng</h2>
//             <div className="banking-header">
//                 <Select
//                     defaultValue="Tất cả ngân hàng"
//                     style={{ width: 200 }}
//                     onChange={(value) => setAccountFilter(value)}
//                 >
//                     <Option value="Tất cả ngân hàng">Tất cả ngân hàng</Option>
//                 </Select>
//                 <Select
//                     value={accountFilter}
//                     style={{ width: 200 }}
//                     onChange={handleAmountFilterChange}
//                 >
//                     <Option value="Tất cả">Số tiền: Tất cả</Option>
//                     <Option value="Dưới 1 triệu">Dưới 1 triệu</Option>
//                     <Option value="1 triệu - 5 triệu">1 triệu - 5 triệu</Option>
//                 </Select>
//                 <Select
//                     value={transactionType}
//                     style={{ width: 200 }}
//                     onChange={handleTransactionTypeChange}
//                 >
//                     <Option value="Tất cả">Loại: Tất cả</Option>
//                     <Option value="Tiền vào">Tiền vào</Option>
//                     <Option value="Tiền ra">Tiền ra</Option>
//                 </Select>
//                 <Select
//                     value={timeRange}
//                     style={{ width: 200 }}
//                     onChange={handleTimeRangeChange}
//                 >
//                     <Option value="Tất cả">Thời gian: Tất cả</Option>
//                     <Option value="Hôm nay">Hôm nay</Option>
//                     <Option value="Hôm qua">Hôm qua</Option>
//                     <Option value="Tháng này">Tháng này</Option>
//                     <Option value="Tháng trước">Tháng trước</Option>
//                     <Option value="7 ngày qua">7 ngày qua</Option>
//                     <Option value="30 ngày qua">30 ngày qua</Option>
//                     <Option value="Tùy chỉnh">Tùy chỉnh</Option>
//                 </Select>
//                 {timeRange === "Tùy chỉnh" && (
//                     <RangePicker
//                         style={{ width: 200 }}
//                         onChange={handleCustomDateRangeChange}
//                         value={customDateRange}
//                         format="DD/MM/YYYY"
//                     />
//                 )}
//                 <Input
//                     placeholder="Tìm:"
//                     value={searchText}
//                     onChange={handleSearchTextChange}
//                     style={{ width: 200 }}
//                     prefix={<SearchOutlined />}
//                     allowClear
//                 />
//                 <Space>
//                     <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
//                         Làm mới
//                     </Button>
//                     <Button icon={<BankOutlined />} onClick={handleExportExcel}>
//                         Xuất
//                     </Button>
//                 </Space>
//             </div>

//             <Spin spinning={loading}>
//                 <Table
//                     columns={columns}
//                     dataSource={transactions}
//                     pagination={{
//                         current: currentPage,
//                         pageSize: pageSize,
//                         total: totalTransactions,
//                         onChange: handlePageChange,
//                         showSizeChanger: false,
//                         pageSizeOptions: ["10"],
//                         showTotal: (total) => `Xem ${transactions.length} mục`,
//                     }}
//                     rowKey="id"
//                     scroll={{ x: 1000 }}
//                 />
//             </Spin>

//             <Modal
//                 title="Chi Tiết Giao Dịch"
//                 open={detailVisible}
//                 onCancel={() => setDetailVisible(false)}
//                 footer={[
//                     <Button key="close" onClick={() => setDetailVisible(false)}>
//                         Đóng
//                     </Button>,
//                 ]}
//             >
//                 {selectedTransaction ? (
//                     <div>
//                         <p>
//                             <strong>ID Giao Dịch:</strong> {selectedTransaction.id || "N/A"}
//                         </p>
//                         <p>
//                             <strong>Ngày Giao Dịch:</strong>{" "}
//                             {selectedTransaction.transactionDate
//                                 ? new Date(selectedTransaction.transactionDate).toLocaleString("vi-VN")
//                                 : "N/A"}
//                         </p>
//                         <p>
//                             <strong>Số Tiền:</strong>{" "}
//                             {(() => {
//                                 const { text, className } = formatAmount(
//                                     selectedTransaction.amountIn,
//                                     selectedTransaction.amountOut
//                                 );
//                                 return <span className={className}>{text}</span>;
//                             })()}
//                         </p>
//                         <p>
//                             <strong>Loại Tiền:</strong>{" "}
//                             {selectedTransaction.amountIn > 0 ? "Chuyển vào" : "Chuyển ra"}
//                         </p>
//                         <p>
//                             <strong>Nội Dung:</strong> {selectedTransaction.content || "N/A"}
//                         </p>
//                     </div>
//                 ) : (
//                     <p>Đang tải...</p>
//                 )}
//             </Modal>
//         </div>
//     );
// };

// export default BankingPage;
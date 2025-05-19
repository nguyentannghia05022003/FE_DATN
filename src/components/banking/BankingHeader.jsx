// src/components/banking/BankingHeader.jsx
import React from "react";
import { Select, Input, Button, Space, DatePicker, Tooltip } from "antd";
import { SearchOutlined, ReloadOutlined, BankOutlined, CalculatorOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

const BankingHeader = ({
    accountFilter,
    setAccountFilter,
    transactionType,
    setTransactionType,
    timeRange,
    setTimeRange,
    customDateRange,
    setCustomDateRange,
    searchText,
    setSearchText,
    handleRefresh,
    handleExportExcel,
    revenueDate,
    setRevenueDate,
    revenueGranularity,
    setRevenueGranularity,
    calculateRevenue,
}) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
            }}
        >
            <Select
                defaultValue="Tất cả ngân hàng"
                style={{ width: 180 }}
                onChange={(value) => setAccountFilter(value)}
            >
                <Option value="Tất cả ngân hàng">Tất cả ngân hàng</Option>
            </Select>
            <Select
                value={accountFilter}
                style={{ width: 180 }}
                onChange={(value) => setAccountFilter(value)}
            >
                <Option value="Tất cả">Số tiền: Tất cả</Option>
                <Option value="Dưới 1 triệu">Dưới 1 triệu</Option>
                <Option value="1 triệu - 5 triệu">1 triệu - 5 triệu</Option>
            </Select>
            <Select
                value={transactionType}
                style={{ width: 150 }}
                onChange={(value) => setTransactionType(value)}
            >
                <Option value="Tất cả">Loại: Tất cả</Option>
                <Option value="Tiền vào">Tiền vào</Option>
                <Option value="Tiền ra">Tiền ra</Option>
            </Select>
            <Select
                value={timeRange}
                style={{ width: 150 }}
                onChange={(value) => {
                    setTimeRange(value);
                    if (value !== "Tùy chỉnh") {
                        setCustomDateRange(null);
                    }
                }}
            >
                <Option value="Tất cả">Thời gian: Tất cả</Option>
                <Option value="Hôm nay">Hôm nay</Option>
                <Option value="Hôm qua">Hôm qua</Option>
                <Option value="Tháng này">Tháng này</Option>
                <Option value="Tháng trước">Tháng trước</Option>
                <Option value="7 ngày qua">7 ngày qua</Option>
                <Option value="30 ngày qua">30 ngày qua</Option>
                <Option value="Tùy chỉnh">Tùy chỉnh</Option>
            </Select>
            {timeRange === "Tùy chỉnh" && (
                <RangePicker
                    style={{ width: 220 }}
                    onChange={(dates) => setCustomDateRange(dates)}
                    value={customDateRange}
                    format="DD/MM/YYYY"
                />
            )}
            <Input
                placeholder="Tìm kiếm giao dịch (ID, nội dung)..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 220 }}
                prefix={<SearchOutlined />}
                allowClear
            />
            <Select
                value={revenueGranularity}
                style={{ width: 120 }}
                onChange={(value) => setRevenueGranularity(value)}
            >
                <Option value="Ngày">Ngày</Option>
                <Option value="Tuần">Tuần</Option>
                <Option value="Tháng">Tháng</Option>
                <Option value="Năm">Năm</Option>
            </Select>
            <DatePicker
                style={{ width: 150 }}
                onChange={(date) => setRevenueDate(date)}
                value={revenueDate}
                format="DD/MM/YYYY"
                placeholder="Chọn thời gian"
            />
            <Space>
                <Tooltip title="Làm mới dữ liệu">
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                        Làm mới
                    </Button>
                </Tooltip>
                <Tooltip title="Xuất dữ liệu ra Excel">
                    <Button icon={<BankOutlined />} onClick={handleExportExcel}>
                        Xuất
                    </Button>
                </Tooltip>
                <Tooltip title="Tính doanh thu">
                    <Button icon={<CalculatorOutlined />} onClick={calculateRevenue}>
                        Tính Doanh Thu
                    </Button>
                </Tooltip>
            </Space>
        </div>
    );
};

export default BankingHeader;
import React from "react";
import { Table, Button, Spin, Empty } from "antd";

const BankingTable = ({
    transactions,
    currentPage,
    pageSize,
    totalTransactions,
    handlePageChange,
    handlePageSizeChange,
    handleViewDetail,
    formatAmount,
    loading,
}) => {
    const columns = [
        {
            title: "STT",
            key: "stt",
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
            sorter: (a, b, sortOrder) => {
                const indexA = (currentPage - 1) * pageSize + transactions.indexOf(a) + 1;
                const indexB = (currentPage - 1) * pageSize + transactions.indexOf(b) + 1;
                return sortOrder === "ascend" ? indexA - indexB : indexB - indexA;
            },
            sortDirections: ["ascend", "descend"],
            width: 60,
            align: "center",
        },
        {
            title: "ID Giao Dịch",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id.localeCompare(b.id),
            sortDirections: ["ascend", "descend"],
            width: 150,
        },
        {
            title: "Ngày Giao Dịch",
            dataIndex: "transactionDate",
            key: "transactionDate",
            sorter: (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime(),
            sortDirections: ["ascend", "descend"],
            render: (text) => (text ? new Date(text).toLocaleString("vi-VN") : "N/A"),
            width: 200,
        },
        {
            title: "Số Tiền",
            key: "amount",
            sorter: (a, b) => (a.amountIn || 0) - (a.amountOut || 0) - ((b.amountIn || 0) - (b.amountOut || 0)),
            sortDirections: ["ascend", "descend"],
            render: (_, record) => {
                const { text, className } = formatAmount(record.amountIn, record.amountOut);
                return <span className={className}>{text}</span>;
            },
            width: 120,
            align: "right",
        },
        {
            title: "Loại Tiền",
            key: "moneyType",
            sorter: (a, b) => {
                const typeA = a.amountIn > 0 ? "Chuyển vào" : "Chuyển ra";
                const typeB = b.amountIn > 0 ? "Chuyển vào" : "Chuyển ra";
                return typeA.localeCompare(typeB);
            },
            sortDirections: ["ascend", "descend"],
            render: (_, record) => (record.amountIn > 0 ? "Chuyển vào" : "Chuyển ra"),
            width: 120,
            align: "center",
        },
        {
            title: "Nội Dung",
            dataIndex: "content",
            key: "content",
            sorter: (a, b) => (a.content || "").localeCompare(b.content || ""),
            sortDirections: ["ascend", "descend"],
            render: (text) => text || "N/A",
            width: 200,
        },
        {
            title: "Hành Động",
            key: "action",
            render: (_, record) => (
                <Button onClick={() => handleViewDetail(record.id)}>Xem Chi Tiết</Button>
            ),
            width: 120,
            align: "center",
        },
    ];

    return (
        <Spin spinning={loading}>
            <Table
                columns={columns}
                dataSource={transactions}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalTransactions,
                    onChange: handlePageChange,
                    onShowSizeChange: handlePageSizeChange,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    showTotal: (total) => `Xem ${transactions.length} trên ${total} giao dịch`,
                }}
                rowKey="id"
                scroll={{ x: "max-content" }}
                locale={{
                    emptyText: (
                        <Empty
                            description="Không có dữ liệu giao dịch"
                            style={{ padding: "40px 0" }}
                        />
                    ),
                }}
                bordered
                rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
            />
        </Spin>
    );
};

export default BankingTable;
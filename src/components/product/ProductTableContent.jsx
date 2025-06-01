import { Table, Empty, Tooltip } from "antd";

const ProductTableContent = ({
    filteredData,
    current,
    pageSize,
    total,
    loadingTable,
    setDataDetail,
    setIsDetailOpen,
    onChangeTable,
    ProductTableActions,
    setDataUpdate,
    setIsModalUpdateOpen,
    handleDeleteProduct,
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (value) => {
        if (!value) return "-";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const columns = [
        {
            title: "STT",
            render: (_, __, index) => (current - 1) * pageSize + index + 1,
            width: 60,
            align: "center",
        },
        {
            title: "ID",
            dataIndex: "_id",
            render: (text, record) => (
                <a
                    href="#"
                    onClick={() => {
                        setDataDetail(record);
                        setIsDetailOpen(true);
                    }}
                    style={{ color: "#1890ff" }}
                >
                    {text.slice(0, 8)}...
                </a>
            ),
            width: 150,
            align: "center",
        },
        {
            title: "Mã Sản Phẩm",
            dataIndex: "barCode",
            sorter: (a, b) => (a.barCode || "").localeCompare(b.barCode || ""),
            sortDirections: ["ascend", "descend"],
            width: 120,
            align: "center",
        },
        {
            title: "Tên Sản Phẩm",
            dataIndex: "name",
            sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
            sortDirections: ["ascend", "descend"],
            width: 150,
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text.length > 15 ? `${text.slice(0, 15)}...` : text}</span>
                </Tooltip>
            ),
        },
        {
            title: "Ảnh Sản Phẩm",
            dataIndex: "image",
            render: (text) => (
                <img
                    src={text}
                    alt="Product"
                    style={{ width: "50px", height: "50px", objectFit: "contain" }}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/50")} // Fallback image
                />
            ),
            width: 100,
            align: "center",
        },
        {
            title: "Giá Tiền",
            dataIndex: "price",
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            sortDirections: ["ascend", "descend"],
            render: formatCurrency,
            width: 120,
            align: "right",
        },
        {
            title: "Số Lượng",
            dataIndex: "quantity",
            sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
            sortDirections: ["ascend", "descend"],
            width: 100,
            align: "center",
        },
        {
            title: "Ngày Sản Xuất",
            dataIndex: "manufacturingDate",
            sorter: (a, b) =>
                new Date(a.manufacturingDate).getTime() -
                new Date(b.manufacturingDate).getTime(),
            sortDirections: ["ascend", "descend"],
            render: formatDate,
            width: 120,
            align: "center",
        },
        {
            title: "Ngày Hết Hạn",
            dataIndex: "expirationDate",
            sorter: (a, b) =>
                new Date(a.expirationDate).getTime() -
                new Date(b.expirationDate).getTime(),
            sortDirections: ["ascend", "descend"],
            render: (text) => {
                const today = new Date();
                const expirationDate = new Date(text);
                const isExpired = expirationDate < today;
                return (
                    <span style={{ color: isExpired ? "red" : "inherit" }}>
                        {formatDate(text)}
                    </span>
                );
            },
            width: 120,
            align: "center",
        },
        {
            title: "Hành Động",
            key: "action",
            render: (_, record) => (
                <ProductTableActions
                    record={record}
                    setDataUpdate={setDataUpdate}
                    setIsModalUpdateOpen={setIsModalUpdateOpen}
                    handleDeleteProduct={handleDeleteProduct}
                />
            ),
            width: 100,
            align: "center",
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={{
                current,
                pageSize,
                total,
                showSizeChanger: true,
                showTotal: (total, range) =>
                    `${range[0]}-${range[1]} trên ${total} sản phẩm`,
                pageSizeOptions: ["10", "20", "50"],
                style: { marginTop: "16px" },
            }}
            onChange={onChangeTable}
            loading={loadingTable}
            locale={{
                emptyText: (
                    <Empty
                        description="Không có dữ liệu sản phẩm"
                        style={{ padding: "40px 0" }}
                    />
                ),
            }}
            scroll={{ x: "max-content" }}
            bordered
            rowClassName={(record, index) =>
                index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
            style={{ borderRadius: "8px", overflow: "hidden" }}
        />
    );
};

export default ProductTableContent;
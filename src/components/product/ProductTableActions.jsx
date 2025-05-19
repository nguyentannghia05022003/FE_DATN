import { Tooltip, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ProductTableActions = ({
    record,
    setDataUpdate,
    setIsModalUpdateOpen,
    handleDeleteProduct,
}) => {
    return (
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
            <Tooltip title="Chỉnh sửa">
                <EditOutlined
                    onClick={() => {
                        setDataUpdate(record);
                        setIsModalUpdateOpen(true);
                    }}
                    style={{ cursor: "pointer", color: "#1890ff", fontSize: "16px" }}
                />
            </Tooltip>
            <Popconfirm
                title="Xóa sản phẩm"
                description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                onConfirm={() => handleDeleteProduct(record._id)}
                okText="Có"
                cancelText="Không"
                placement="left"
            >
                <Tooltip title="Xóa">
                    <DeleteOutlined
                        style={{ cursor: "pointer", color: "red", fontSize: "16px" }}
                    />
                </Tooltip>
            </Popconfirm>
        </div>
    );
};

export default ProductTableActions;
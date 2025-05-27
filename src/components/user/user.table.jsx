import { notification, Popconfirm, Table, Button, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import UpdateUserModal from "./update.user.modal";
import ViewUserDetail from "./view.user.detail";
import { deleteUserApi } from "../../services/api.service";
import "./user.table.css";

const UserTable = (props) => {
    const {
        dataUsers,
        loadUser,
        current,
        pageSize,
        total,
        setCurrent,
        setPageSize,
        loadingTable,
    } = props;

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);
    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleDeleteUser = async (id) => {
        const res = await deleteUserApi(id);
        if (res.data) {
            notification.success({
                message: "Delete A User",
                description: "Delete A User thành công !!",
            });
            await loadUser();
        } else {
            notification.error({
                message: "Error Delete A User",
                description: JSON.stringify(res.message),
            });
        }
    };

    const onChange = (pagination) => {
        if (pagination && pagination.current) {
            if (pagination.current !== current) {
                setCurrent(+pagination.current);
            }
        }
        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== pageSize) {
                setPageSize(+pagination.pageSize);
                setCurrent(1);
            }
        }
    };

    const handleCreateUser = () => {
        notification.info({
            message: "Tính năng chưa được triển khai",
            description: "Modal tạo người dùng chưa được triển khai.",
        });
    };

    const columns = [
        {
            title: "STT",
            render: (_, __, index) => (current - 1) * pageSize + index + 1,
            width: 60,
            align: "center",
        },
        {
            title: "Id",
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
            title: "Full Name",
            dataIndex: "fullName",
            sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text.length > 15 ? `${text.slice(0, 15)}...` : text}</span>
                </Tooltip>
            ),
            width: 200,
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
            sortDirections: ["ascend", "descend"],
            width: 200,
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
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
                        title="Xóa người dùng"
                        description="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => handleDeleteUser(record._id)}
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
            ),
            width: 100,
            align: "center",
        },
    ];

    return (
        <div
            style={{
                padding: "24px",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
        >
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
                    Table Users
                </h3>
                {/* <Tooltip title="Tạo người dùng mới">
                    <Button
                        type="primary"
                        onClick={handleCreateUser}
                        icon={<PlusOutlined />}
                        style={{ borderRadius: "6px", background: "#1d39c4", borderColor: "#1d39c4" }}
                    >
                        Create User
                    </Button>
                </Tooltip> */}
            </div>

            <Table
                columns={columns}
                dataSource={dataUsers}
                rowKey={"_id"}
                pagination={{
                    current,
                    pageSize,
                    showSizeChanger: true,
                    total,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} trên ${total} rows`,
                    pageSizeOptions: ["5", "10", "20"],
                    style: { marginTop: "16px" },
                }}
                onChange={onChange}
                loading={loadingTable}
                bordered
                rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
                style={{ borderRadius: "8px", overflow: "hidden" }}
            />

            <UpdateUserModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadUser={loadUser}
            />
            <ViewUserDetail
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isDetailOpen={isDetailOpen}
                setIsDetailOpen={setIsDetailOpen}
                loadUser={loadUser}
            />
        </div>
    );
};

export default UserTable;
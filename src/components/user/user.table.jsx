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
                message: "Xóa Người Dùng",
                description: "Xóa người dùng thành công!",
            });
            await loadUser();
        } else {
            notification.error({
                message: "Lỗi Xóa Người Dùng",
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
            message: "Tính năng chưa triển khai",
            description: "Chức năng tạo người dùng chưa được triển khai.",
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
                    style={{ color: "#0052cc" }}
                >
                    {text.slice(0, 8)}...
                </a>
            ),
            width: 150,
            align: "center",
        },
        {
            title: "Họ Tên",
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
            title: "Hành Động",
            key: "action",
            render: (_, record) => (
                <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                    <Tooltip title="Chỉnh sửa">
                        <EditOutlined
                            onClick={() => {
                                setDataUpdate(record);
                                setIsModalUpdateOpen(true);
                            }}
                            style={{ cursor: "pointer", color: "#0052cc", fontSize: "16px" }}
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
                                style={{ cursor: "pointer", color: "#d4380d", fontSize: "16px" }}
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
                padding: "20px",
                background: "#fff",
                borderRadius: "6px",
                border: "1px solid #e8ecef",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                {/* <Tooltip title="Tạo người dùng mới">
                    <Button
                        type="primary"
                        onClick={handleCreateUser}
                        icon={<PlusOutlined />}
                        style={{ borderRadius: "4px", background: "#0052cc", borderColor: "#0052cc" }}
                    >
                        Tạo Người Dùng
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
                        `${range[0]}-${range[1]} trên ${total} hàng`,
                    pageSizeOptions: ["5", "10", "20"],
                    style: { marginTop: "16px" },
                }}
                onChange={onChange}
                loading={loadingTable}
                bordered
                rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
                style={{ borderRadius: "6px", overflow: "hidden" }}
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
import React, { useState, useEffect } from "react";
import { notification } from "antd";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Space,
    Pagination,
    Collapse,
} from "antd";
import {
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import "./AppUser.css";
import { fetchUserResumesAPI } from "../../services/api.appUser";

const { TextArea } = Input;
const { Panel } = Collapse;

const AppUser = ({
    appUsers,
    fullAppUsers,
    loading,
    currentPage,
    pageSize,
    totalAppUsers,
    onPageChange,
    onPageSizeChange,
    onCreateAppUser,
    onUpdateAppUser,
    onDeleteAppUser,
    onRefresh,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isResumeModalVisible, setIsResumeModalVisible] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        if (isModalVisible && isEditMode && selectedUser) {
            form.setFieldsValue({
                fullName: selectedUser.fullName,
                phone: selectedUser.phone,
                email: selectedUser.email,
                address: selectedUser.address,
                points: selectedUser.points || 0, // Điền sẵn points khi chỉnh sửa
            });
        } else if (isModalVisible && !isEditMode) {
            form.resetFields();
        }
    }, [isModalVisible, isEditMode, selectedUser, form]);

    const handleCreateOrUpdate = async () => {
        if (!isModalVisible) return;

        try {
            const values = await form.validateFields();
            if (isEditMode && selectedUser) {
                await onUpdateAppUser(selectedUser._id, values);
                notification.success({
                    message: "Thành công",
                    description: "Cập nhật người dùng thành công!",
                });
            } else {
                await onCreateAppUser(values);
                notification.success({
                    message: "Thành công",
                    description: "Tạo người dùng thành công!",
                });
            }
            setIsModalVisible(false);
            form.resetFields();
            setIsEditMode(false);
            setSelectedUser(null);
            onRefresh(); // Làm mới danh sách sau khi tạo hoặc cập nhật
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lưu người dùng.",
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await onDeleteAppUser(id);
            notification.success({
                message: "Thành công",
                description: "Xóa người dùng thành công!",
            });
            onRefresh(); // Làm mới danh sách sau khi xóa
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể xóa người dùng.",
            });
        }
    };

    const handleViewResumes = async (phone) => {
        try {
            const response = await fetchUserResumesAPI(phone);
            console.log("Full API Response:", response);
            const resumes = response?.data?.resumes || [];
            console.log("Selected Resumes before set:", resumes);
            if (resumes.length === 0) {
                notification.warning({
                    message: "Cảnh báo",
                    description: `Không tìm thấy giao dịch cho số điện thoại ${phone}. Vui lòng kiểm tra backend.`,
                });
            }
            setSelectedResumes(resumes);
            setIsResumeModalVisible(true);
        } catch (error) {
            console.error("Error fetching resumes:", error);
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lấy lịch sử giao dịch.",
            });
        }
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        },
        { title: "ID", dataIndex: "_id", key: "_id" },
        { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Địa chỉ", dataIndex: "address", key: "address" },
        {
            title: "Điểm thưởng",
            dataIndex: "points",
            key: "points",
            render: (points) => points || 0,
        },
        {
            title: "Hành động",
            key: "action",
            render: (record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setIsEditMode(true);
                            setSelectedUser(record);
                            setIsModalVisible(true);
                        }}
                        className="app-user-edit-btn"
                    >
                        Sửa
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record._id)}
                        className="app-user-delete-btn"
                    >
                        Xóa
                    </Button>
                    <Button
                        icon={<InfoCircleOutlined />}
                        onClick={() => handleViewResumes(record.phone)}
                        className="app-user-resume-btn"
                    >
                        Xem chi tiết giao dịch
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="app-user-container">
            <Space className="app-user-action-space">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setIsEditMode(false);
                        setSelectedUser(null);
                        setIsModalVisible(true);
                    }}
                    className="app-user-add-btn"
                >
                    Thêm người dùng
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    className="app-user-refresh-btn"
                >
                    Làm mới
                </Button>
            </Space>
            <Table
                columns={columns}
                dataSource={appUsers}
                rowKey="_id"
                pagination={false}
                loading={loading}
                className="app-user-table"
                rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
            />
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalAppUsers}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
                showSizeChanger
                pageSizeOptions={["10", "20", "50"]}
                className="app-user-pagination"
            />
            {isModalVisible && (
                <Modal
                    title={isEditMode ? "Cập nhật người dùng" : "Thêm người dùng mới"}
                    open={isModalVisible}
                    onOk={handleCreateOrUpdate}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                        setIsEditMode(false);
                        setSelectedUser(null);
                    }}
                    okText={isEditMode ? "Cập nhật" : "Tạo"}
                    cancelText="Hủy"
                    className="app-user-modal"
                >
                    <Form form={form} layout="vertical" className="app-user-form">
                        <Form.Item
                            name="fullName"
                            label="Họ và tên"
                            rules={[{ required: true, message: "Nhập họ và tên" }]}
                        >
                            <Input placeholder="Họ và tên" className="app-user-input" />
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[{ required: true, message: "Nhập số điện thoại" }]}
                        >
                            <Input
                                placeholder="Số điện thoại"
                                className="app-user-input"
                                disabled={isEditMode}
                            />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
                        >
                            <Input placeholder="Email" className="app-user-input" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: !isEditMode, message: "Nhập mật khẩu" }, { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }]}
                        >
                            <Input.Password
                                placeholder="Mật khẩu"
                                className="app-user-input"
                                disabled={isEditMode}
                            />
                        </Form.Item>
                        <Form.Item
                            name="points"
                            label="Điểm thưởng"
                            rules={[
                                { required: true, message: "Nhập điểm thưởng" },
                                { type: "number", min: 0, message: "Điểm thưởng phải lớn hơn hoặc bằng 0" },
                            ]}
                            getValueFromEvent={(e) => (e ? Number(e) : null)}
                        >
                            <InputNumber
                                placeholder="Điểm thưởng"
                                className="app-user-input"
                                min={0}
                                style={{ width: "100%" }}
                                parser={(value) => value.replace(/[^0-9]/g, "")}
                            />
                        </Form.Item>
                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                            rules={[{ required: true, message: "Nhập địa chỉ" }]}
                        >
                            <TextArea placeholder="Địa chỉ" className="app-user-input" />
                        </Form.Item>
                    </Form>
                </Modal>
            )}
            <Modal
                title="Chi tiết giao dịch"
                open={isResumeModalVisible}
                onCancel={() => setIsResumeModalVisible(false)}
                footer={null}
                width={800}
                className="app-user-modal"
            >
                {console.log("Rendering with selectedResumes:", selectedResumes)}
                {selectedResumes.length === 0 ? (
                    <p>Không có giao dịch nào để hiển thị.</p>
                ) : (
                    <Collapse accordion>
                        {selectedResumes.map((resume, index) => (
                            <Panel header={`Giao dịch #${index + 1} - Mã: ${resume.orderCode || 'Không có mã'}`} key={index}>
                                <p><strong>Khách hàng:</strong> {resume.customerName || 'Không xác định'}</p>
                                <p><strong>Tổng giá:</strong> {resume.totalPrice || 0} VNĐ</p>
                                <p><strong>Điểm sử dụng:</strong> {resume.usedPoints || 0}</p>
                                <p><strong>Tổng cuối:</strong> {resume.finalTotal || 0} VNĐ</p>
                                <p><strong>Thời gian:</strong> {new Date(resume.createdAt).toLocaleString()}</p>
                                <p><strong>Sản phẩm:</strong></p>
                                <ul>
                                    {resume.products && resume.products.length > 0 ? (
                                        resume.products.map((product, prodIndex) => (
                                            <li key={prodIndex}>
                                                {product.name || 'Không tên'} (Mã: {product.barCode || 'Không có'}) - Số lượng: {product.quantityPurchased || 0}, Giá: {product.productTotalPrice || 0} VNĐ
                                            </li>
                                        ))
                                    ) : (
                                        <li>Không có sản phẩm nào.</li>
                                    )}
                                </ul>
                            </Panel>
                        ))}
                    </Collapse>
                )}
            </Modal>
        </div>
    );
};

export default AppUser;
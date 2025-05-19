import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, notification, Space, Pagination, DatePicker } from "antd";
import { DeleteOutlined, PlusOutlined, EyeOutlined, SortAscendingOutlined, SortDescendingOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import "./Resume.css";

const Resume = ({
    resumes,
    loading,
    currentPage,
    pageSize,
    totalResumes,
    onPageChange,
    onPageSizeChange,
    onCreateResume,
    onDeleteResume,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [sortOrder, setSortOrder] = useState({ field: null, order: null });
    const [sortedResumes, setSortedResumes] = useState([...resumes]);
    const [originalResumes, setOriginalResumes] = useState([...resumes]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [totalIncome, setTotalIncome] = useState(0); // State để lưu tổng thu nhập
    const [form] = Form.useForm();

    // Cập nhật sortedResumes, originalResumes và tổng thu nhập khi resumes thay đổi
    useEffect(() => {
        setSortedResumes([...resumes]);
        setOriginalResumes([...resumes]);
        calculateTotalIncome([...resumes]); // Tính tổng thu nhập ban đầu
    }, [resumes]);

    // Tính tổng thu nhập mỗi khi sortedResumes thay đổi
    useEffect(() => {
        calculateTotalIncome(sortedResumes);
    }, [sortedResumes]);

    // Hàm tính tổng thu nhập
    const calculateTotalIncome = (resumesList) => {
        const total = resumesList.reduce((sum, resume) => sum + (resume.totalPrice || 0), 0);
        setTotalIncome(total);
    };

    // Lọc resume theo ngày được chọn
    useEffect(() => {
        if (selectedDate) {
            const selected = moment(selectedDate).startOf("day");
            console.log("Selected Date:", selected.format("DD/MM/YYYY HH:mm:ss"));
            console.log("Selected Date Raw:", selectedDate);

            const filtered = originalResumes.filter((resume) => {
                const resumeDate = moment(resume.createdAt).startOf("day");
                console.log("Resume Date:", resumeDate.format("DD/MM/YYYY HH:mm:ss"), "Resume ID:", resume._id);
                console.log("Resume CreatedAt Raw:", resume.createdAt);
                return resumeDate.isSame(selected, "day");
            });

            if (filtered.length === 0) {
                notification.warning({
                    message: "Không tìm thấy",
                    description: `Không có resume nào được tạo vào ngày ${moment(selectedDate).format("DD/MM/YYYY")}.`,
                });
            }
            setSortedResumes(filtered);
        } else {
            setSortedResumes([...originalResumes]);
        }
    }, [selectedDate, originalResumes]);

    const itemColumns = [
        {
            title: "Mã sản phẩm",
            dataIndex: "barCode",
            key: "barCode",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Số lượng",
            dataIndex: "quantityPurchased",
            key: "quantityPurchased",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (price) => `${price.toLocaleString("vi-VN")} VNĐ`,
        },
        {
            title: "Tổng giá sản phẩm",
            dataIndex: "productTotalPrice",
            key: "productTotalPrice",
            render: (productTotalPrice) => `${productTotalPrice.toLocaleString("vi-VN")} VNĐ`,
        },
    ];

    const toggleRow = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Hàm sắp xếp
    const handleSort = (field) => {
        const newOrder = sortOrder.field === field && sortOrder.order === "asc" ? "desc" : "asc";
        setSortOrder({ field, order: newOrder });

        const sorted = [...sortedResumes].sort((a, b) => {
            if (field === "createdAt") {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return newOrder === "asc" ? dateA - dateB : dateB - dateA;
            } else if (field === "totalPrice") {
                return newOrder === "asc" ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
            }
            return 0;
        });

        setSortedResumes(sorted);
    };

    // Hàm làm mới
    const handleRefresh = () => {
        setSortedResumes([...originalResumes]);
        setSortOrder({ field: null, order: null });
        setExpandedRows({});
        setSelectedDate(null);
    };

    // Hàm xử lý chọn ngày
    const handleDateChange = (date, dateString) => {
        if (date) {
            const localDate = moment(dateString, "DD/MM/YYYY").startOf("day");
            console.log("Date from DatePicker:", dateString);
            console.log("Local Date Set:", localDate.format("DD/MM/YYYY HH:mm:ss"));
            setSelectedDate(localDate);
        } else {
            setSelectedDate(null);
        }
    };

    const columns = [
        {
            title: "STT",
            key: "stt",
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: "ID",
            dataIndex: "_id",
            key: "_id",
        },
        {
            title: "Chi tiết sản phẩm",
            key: "items",
            render: (record) => (
                <div>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => toggleRow(record._id)}
                        className="resume-toggle-btn"
                    >
                        {expandedRows[record._id] ? "Ẩn chi tiết" : "Nhấn để xem chi tiết"}
                    </Button>
                    {expandedRows[record._id] && (
                        <Table
                            columns={itemColumns}
                            dataSource={record.items}
                            rowKey="_id"
                            pagination={false}
                            className="resume-sub-table"
                        />
                    )}
                </div>
            ),
        },
        {
            title: "Tổng giá",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (totalPrice) => `${totalPrice.toLocaleString("vi-VN")} VNĐ`,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A"),
        },
        {
            title: "Hành động",
            key: "action",
            render: (record) => (
                <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDelete(record._id)}
                    className="resume-delete-btn"
                >
                    Xóa
                </Button>
            ),
        },
    ];

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            await onCreateResume(values);
            form.resetFields();
            setIsModalVisible(false);
            notification.success({
                message: "Thành công",
                description: "Tạo resume thành công!",
            });
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể tạo resume.",
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await onDeleteResume(id);
            notification.success({
                message: "Thành công",
                description: "Xóa resume thành công!",
            });
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể xóa resume.",
            });
        }
    };

    return (
        <div className="resume-container">
            <div className="total-income-container">
                <div className="total-income-box">
                    Tổng thu nhập: {totalIncome.toLocaleString("vi-VN")} VNĐ
                </div>
            </div>
            <Space className="resume-action-space">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    className="resume-add-btn"
                >
                    Thêm Resume
                </Button>
                <Button
                    icon={
                        sortOrder.field === "createdAt" && sortOrder.order === "asc" ? (
                            <SortAscendingOutlined />
                        ) : (
                            <SortDescendingOutlined />
                        )
                    }
                    onClick={() => handleSort("createdAt")}
                    className="resume-sort-btn"
                >
                    Sắp xếp theo ngày
                </Button>
                <Button
                    icon={
                        sortOrder.field === "totalPrice" && sortOrder.order === "asc" ? (
                            <SortAscendingOutlined />
                        ) : (
                            <SortDescendingOutlined />
                        )
                    }
                    onClick={() => handleSort("totalPrice")}
                    className="resume-sort-btn"
                >
                    Sắp xếp theo tổng tiền
                </Button>
                <DatePicker
                    onChange={handleDateChange}
                    value={selectedDate}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                    className="resume-date-picker"
                />
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    className="resume-refresh-btn"
                >
                    Làm mới
                </Button>
            </Space>
            <Table
                columns={columns}
                dataSource={sortedResumes}
                rowKey="_id"
                pagination={false}
                loading={loading}
                className="resume-table"
                rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
            />
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalResumes}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
                showSizeChanger
                pageSizeOptions={["10", "20", "50"]}
                className="resume-pagination"
            />
            <Modal
                title="Thêm Resume Mới"
                open={isModalVisible}
                onOk={handleCreate}
                onCancel={() => {
                    form.resetFields();
                    setIsModalVisible(false);
                }}
                okText="Tạo"
                cancelText="Hủy"
                className="resume-modal"
            >
                <Form form={form} layout="vertical" className="resume-form">
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} className="resume-form-space" align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, "barCode"]}
                                            rules={[{ required: true, message: "Nhập mã sản phẩm" }]}
                                        >
                                            <Input placeholder="Mã sản phẩm" className="resume-input" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "name"]}
                                            rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
                                        >
                                            <Input placeholder="Tên sản phẩm" className="resume-input" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "quantityPurchased"]}
                                            rules={[{ required: true, message: "Nhập số lượng" }]}
                                        >
                                            <InputNumber min={1} placeholder="Số lượng" className="resume-input-number" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "price"]}
                                            rules={[{ required: true, message: "Nhập giá" }]}
                                        >
                                            <InputNumber min={0} placeholder="Giá" className="resume-input-number" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "productTotalPrice"]}
                                            rules={[{ required: true, message: "Nhập tổng giá sản phẩm" }]}
                                        >
                                            <InputNumber min={0} placeholder="Tổng giá sản phẩm" className="resume-input-number" />
                                        </Form.Item>
                                        <Button
                                            danger
                                            onClick={() => remove(name)}
                                            className="resume-delete-item-btn"
                                        >
                                            Xóa
                                        </Button>
                                    </Space>
                                ))}
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    className="resume-add-item-btn"
                                >
                                    Thêm sản phẩm
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Form.Item
                        name="totalPrice"
                        label="Tổng giá"
                        rules={[{ required: true, message: "Nhập tổng giá" }]}
                    >
                        <InputNumber
                            min={0}
                            className="resume-total-price"
                            placeholder="Tổng giá"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Resume;
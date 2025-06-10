import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    notification,
    Space,
    Pagination,
    DatePicker,
    Select,
} from "antd";
import {
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import "./Resume.css";

dayjs.extend(weekOfYear);

const { Search } = Input;

const Resume = ({
    resumes,
    fullResumes,
    loading,
    currentPage,
    pageSize,
    totalResumes,
    onPageChange,
    onPageSizeChange,
    onCreateResume,
    onDeleteResume,
    onRefresh,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [sortOrder, setSortOrder] = useState({ field: "createdAt", order: "desc" });
    const [sortedResumes, setSortedResumes] = useState([]);
    const [filteredResumes, setFilteredResumes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [totalIncome, setTotalIncome] = useState(0);
    const [pickerMode, setPickerMode] = useState("date");
    const [searchOrderCode, setSearchOrderCode] = useState("");
    const [form] = Form.useForm();

    useEffect(() => {
        let resumeList = Array.isArray(fullResumes) ? [...fullResumes] : [];

        // Apply date filter
        if (selectedDate) {
            resumeList = resumeList.filter((resume) => {
                const resumeDate = dayjs(resume.createdAt);
                let isMatch = false;
                if (pickerMode === "date") {
                    isMatch = resumeDate.startOf("day").isSame(selectedDate.startOf("day"), "day");
                } else if (pickerMode === "week") {
                    isMatch = resumeDate.isBetween(
                        selectedDate.startOf("week"),
                        selectedDate.endOf("week"),
                        null,
                        "[]"
                    );
                } else if (pickerMode === "month") {
                    isMatch = resumeDate.startOf("month").isSame(selectedDate.startOf("month"), "month");
                } else if (pickerMode === "year") {
                    isMatch = resumeDate.startOf("year").isSame(selectedDate.startOf("year"), "year");
                }
                return isMatch;
            });
        }

        // Apply search filter
        if (searchOrderCode) {
            resumeList = resumeList.filter((resume) =>
                resume.orderCode
                    ? resume.orderCode.toLowerCase().includes(searchOrderCode.toLowerCase())
                    : false
            );
        }

        // Apply sorting
        if (sortOrder.field) {
            resumeList = resumeList.sort((a, b) => {
                if (sortOrder.field === "createdAt") {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return sortOrder.order === "asc" ? dateA - dateB : dateB - dateA;
                } else if (sortOrder.field === "totalPrice") {
                    return sortOrder.order === "asc" ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
                }
                return 0;
            });
        } else {
            resumeList = resumeList.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });
        }

        // Update filteredResumes
        setFilteredResumes(resumeList);
        calculateTotalIncome(resumeList);

        // Apply pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedList = resumeList.slice(startIndex, endIndex);
        setSortedResumes(paginatedList);
    }, [selectedDate, fullResumes, sortOrder, currentPage, pageSize, pickerMode, searchOrderCode]);

    const calculateTotalIncome = (resumesList) => {
        const total = resumesList.reduce((sum, resume) => sum + (resume.totalPrice || 0), 0);
        setTotalIncome(total);
    };

    const itemColumns = [
        {
            title: "Mã sản phẩm",
            dataIndex: "barCode",
            key: "barCode",
            className: "no-wrap",
            render: (_, item) => item.barCode || item.product?.barCode,
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            render: (_, item) => item.name || item.product?.name,
        },
        {
            title: "Số lượng",
            dataIndex: "quantityPurchased",
            key: "quantityPurchased",
            className: "no-wrap",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            className: "no-wrap",
            render: (_, item) => (item.price || item.product?.price)?.toLocaleString("vi-VN") + " VNĐ",
        },
        {
            title: "Tổng giá sản phẩm",
            dataIndex: "productTotalPrice",
            key: "productTotalPrice",
            className: "no-wrap",
            render: (productTotalPrice) => `${productTotalPrice.toLocaleString("vi-VN")} VNĐ`,
        },
    ];

    const toggleDetailModal = (record) => {
        setSelectedResume(record);
        setDetailModalVisible(true);
    };

    const handleSort = (field) => {
        const newOrder = sortOrder.field === field && sortOrder.order === "asc" ? "desc" : "asc";
        setSortOrder({ field, order: newOrder });
    };

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        }
        setSortOrder({ field: "createdAt", order: "desc" });
        setSelectedDate(null);
        setPickerMode("date");
        setSearchOrderCode("");
        setFilteredResumes([...fullResumes]); // Reset filteredResumes on refresh
        calculateTotalIncome(fullResumes);
    };

    const handlePickerModeChange = (value) => {
        setPickerMode(value);
        setSelectedDate(null);
    };

    const handleDateChange = (date, dateString) => {
        if (date) {
            let localDate;
            if (pickerMode === "date") {
                localDate = dayjs(dateString, "DD/MM/YYYY");
            } else if (pickerMode === "week") {
                localDate = dayjs(dateString, "YYYY-ww").startOf("week");
            } else if (pickerMode === "month") {
                localDate = dayjs(dateString, "MM/YYYY").startOf("month");
            } else if (pickerMode === "year") {
                localDate = dayjs(dateString, "YYYY").startOf("year");
            }
            setSelectedDate(localDate);
        } else {
            setSelectedDate(null);
        }
    };

    const handleSearchOrderCode = (value) => {
        const trimmedValue = value.trim();
        setSearchOrderCode(trimmedValue);
        if (!trimmedValue) {
            // Reset filteredResumes when search is cleared
            setFilteredResumes([...fullResumes]);
            calculateTotalIncome(fullResumes);
        } else {
            // Show notification only when search yields no results
            const filtered = fullResumes.filter((resume) =>
                resume.orderCode
                    ? resume.orderCode.toLowerCase().includes(trimmedValue.toLowerCase())
                    : false
            );
            if (filtered.length === 0) {
                notification.warning({
                    message: "Không tìm thấy",
                    description: `Không có đơn hàng nào khớp với mã đơn hàng "${trimmedValue}".`,
                });
            }
        }
    };

    const handleDeleteAll = async () => {
        if (!selectedDate) {
            notification.warning({
                message: "Chưa chọn thời gian",
                description: "Vui lòng chọn ngày, tuần, tháng hoặc năm để xóa tất cả đơn hàng.",
            });
            return;
        }

        Modal.confirm({
            title: "Xác nhận xóa tất cả",
            content: `Bạn có chắc chắn muốn xóa tất cả đơn hàng trong ${pickerMode === "date"
                ? "ngày"
                : pickerMode === "week"
                    ? "tuần"
                    : pickerMode === "month"
                        ? "tháng"
                        : "năm"
                } đã chọn?`,
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const resumesToDelete = filteredResumes.filter((resume) => {
                        const resumeDate = dayjs(resume.createdAt);
                        let isMatch = false;
                        if (pickerMode === "date") {
                            isMatch = resumeDate.startOf("day").isSame(selectedDate.startOf("day"), "day");
                        } else if (pickerMode === "week") {
                            isMatch = resumeDate.isBetween(
                                selectedDate.startOf("week"),
                                selectedDate.endOf("week"),
                                null,
                                "[]"
                            );
                        } else if (pickerMode === "month") {
                            isMatch = resumeDate.startOf("month").isSame(selectedDate.startOf("month"), "month");
                        } else if (pickerMode === "year") {
                            isMatch = resumeDate.startOf("year").isSame(selectedDate.startOf("year"), "year");
                        }
                        return isMatch;
                    });

                    if (resumesToDelete.length === 0) {
                        notification.info({
                            message: "Không có đơn hàng",
                            description: "Không có đơn hàng nào để xóa trong khoảng thời gian đã chọn.",
                        });
                        return;
                    }

                    await Promise.all(resumesToDelete.map((resume) => onDeleteResume(resume._id)));
                    notification.success({
                        message: "Thành công",
                        description: `Đã xóa ${resumesToDelete.length} đơn hàng thành công!`,
                    });
                    handleRefresh();
                } catch (error) {
                    notification.error({
                        message: "Lỗi",
                        description: error.response?.data?.message || "Không thể xóa các đơn hàng.",
                    });
                }
            },
        });
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        },
        { title: "ID", dataIndex: "_id", key: "_id" },
        { title: "Mã đơn hàng", dataIndex: "orderCode", key: "orderCode" },
        {
            title: "Tên khách hàng",
            dataIndex: "customerName",
            key: "customerName",
            render: (customerName) => customerName || "Không có",
        },
        {
            title: "Điểm sử dụng",
            dataIndex: "usedPoints",
            key: "usedPoints",
            render: (usedPoints) => usedPoints || 0,
        },
        {
            title: "Giảm giá từ điểm",
            key: "discount",
            render: (record) => {
                const discount = (record.usedPoints || 0) * 1000;
                return `${discount.toLocaleString("vi-VN")} VNĐ`;
            },
        },
        {
            title: "Tổng giá ban đầu",
            key: "originalPrice",
            render: (record) => {
                const discount = (record.usedPoints || 0) * 1000;
                const originalPrice = (record.totalPrice || 0) + discount;
                return `${originalPrice.toLocaleString("vi-VN")} VNĐ`;
            },
        },
        {
            title: "Tổng giá sau giảm",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (totalPrice) => `${totalPrice?.toLocaleString("vi-VN") || 0} VNĐ`,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A"),
        },
        {
            title: "Chi tiết sản phẩm",
            key: "item",
            render: (record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => toggleDetailModal(record)}
                    className="resume-toggle-btn"
                >
                    Xem chi tiết
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
                description: "Tạo đơn hàng thành công!",
            });
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể tạo đơn hàng.",
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await onDeleteResume(id);
            notification.success({
                message: "Thành công",
                description: "Xóa đơn hàng thành công!",
            });
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể xóa đơn hàng.",
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
                    Thêm đơn hàng
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
                <Select
                    value={pickerMode}
                    onChange={handlePickerModeChange}
                    style={{ width: 120 }}
                    options={[
                        { value: "date", label: "Ngày" },
                        { value: "week", label: "Tuần" },
                        { value: "month", label: "Tháng" },
                        { value: "year", label: "Năm" },
                    ]}
                    className="resume-picker-mode"
                />
                <DatePicker
                    onChange={handleDateChange}
                    value={selectedDate}
                    picker={pickerMode}
                    format={
                        pickerMode === "date"
                            ? "DD/MM/YYYY"
                            : pickerMode === "week"
                                ? "YYYY-ww"
                                : pickerMode === "month"
                                    ? "MM/YYYY"
                                    : "YYYY"
                    }
                    placeholder={`Chọn ${pickerMode === "date"
                        ? "ngày"
                        : pickerMode === "week"
                            ? "tuần"
                            : pickerMode === "month"
                                ? "tháng"
                                : "năm"
                        }`}
                    className="resume-date-picker"
                />
                <Search
                    placeholder="Tìm kiếm mã đơn hàng"
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearchOrderCode}
                    onChange={(e) => {
                        if (!e.target.value.trim()) {
                            handleSearchOrderCode(""); // Clear search when input is empty
                        }
                    }}
                    style={{ width: 200 }}
                    className="resume-search-order"
                />
                <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={handleDeleteAll}
                    className="resume-delete-all-btn"
                >
                    Xóa tất cả
                </Button>
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
                total={selectedDate || searchOrderCode ? filteredResumes.length : totalResumes}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
                showSizeChanger
                pageSizeOptions={["10", "20", "50"]}
                className="resume-pagination"
            />
            <Modal
                title="Thêm đơn hàng mới"
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
                    <Form.Item
                        name="orderCode"
                        label="Mã đơn hàng"
                        rules={[{ required: true, message: "Nhập mã đơn hàng" }]}
                    >
                        <Input placeholder="Mã đơn hàng" className="resume-input" />
                    </Form.Item>
                    <Form.Item name="customerName" label="Tên khách hàng">
                        <Input placeholder="Tên khách hàng (không bắt buộc)" className="resume-input" />
                    </Form.Item>
                    <Form.Item name="usedPoints" label="Điểm sử dụng">
                        <InputNumber
                            min={0}
                            placeholder="Điểm sử dụng (không bắt buộc)"
                            className="resume-input-number"
                        />
                    </Form.Item>
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
                                            <InputNumber
                                                min={1}
                                                placeholder="Số lượng"
                                                className="resume-input-number"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "price"]}
                                            rules={[{ required: true, message: "Nhập giá" }]}
                                        >
                                            <InputNumber
                                                min={0}
                                                placeholder="Giá"
                                                className="resume-input-number"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "productTotalPrice"]}
                                            rules={[{ required: true, message: "Nhập tổng giá sản phẩm" }]}
                                        >
                                            <InputNumber
                                                min={0}
                                                placeholder="Tổng giá sản phẩm"
                                                className="resume-input-number"
                                            />
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
            <Modal
                title="Chi tiết sản phẩm"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
                className="resume-modal"
            >
                {selectedResume && (
                    <Table
                        columns={itemColumns}
                        dataSource={selectedResume.items || selectedResume.products || []}
                        rowKey={(item) => item._id || item.product?._id}
                        pagination={false}
                        className="resume-sub-table"
                    />
                )}
            </Modal>
        </div>
    );
};

export default Resume;
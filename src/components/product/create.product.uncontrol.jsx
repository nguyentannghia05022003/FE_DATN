import { Form, Input, InputNumber, Modal, notification } from "antd";
import { createProductAPI } from "../../services/api.product";
import { useState } from "react";
import dayjs from "dayjs";

const CreateProductUncontrolled = (props) => {
    const [formCreateProduct] = Form.useForm();
    const { isCreateOpen, setIsCreateOpen, loadProduct } = props;

    const resetAndCloseModal = () => {
        formCreateProduct.resetFields();
        setIsCreateOpen(false);
    };

    const handleSubmitBtn = async (values) => {
        if (!values.image) {
            notification.error({
                message: "Error Create Product",
                description: "Vui lòng nhập link ảnh sản phẩm!"
            });
            return;
        }

        const ProductData = {
            image: values.image,
            barCode: values.barCode || "",
            name: values.name || "",
            price: Number(values.price),
            quantity: Number(values.quantity),
            manufacturingDate: values.manufacturingDate
                ? dayjs(values.manufacturingDate).format("YYYY-MM-DD")
                : null,
            expirationDate: values.expirationDate
                ? dayjs(values.expirationDate).format("YYYY-MM-DD")
                : null,
        };

        if (ProductData.barCode.length < 5) {
            notification.error({
                message: "Error Create Product",
                description: "Mã BarCode phải có ít nhất 5 ký tự!"
            });
            return;
        }

        if (ProductData.name.length < 2) {
            notification.error({
                message: "Error Create Product",
                description: "Tên sản phẩm phải có ít nhất 2 ký tự!"
            });
            return;
        }

        if (dayjs(ProductData.manufacturingDate) >= dayjs(ProductData.expirationDate)) {
            notification.error({
                message: "Error Create Product",
                description: "Ngày sản xuất phải nhỏ hơn ngày hết hạn!"
            });
            return;
        }

        const resProduct = await createProductAPI(ProductData);

        if (resProduct.data) {
            resetAndCloseModal();
            await loadProduct();
            notification.success({
                message: "Create Product!",
                description: "Create Product success!"
            });
        } else {
            notification.error({
                message: "Error Create Product!",
                description: JSON.stringify(resProduct.message)
            });
        }
    };

    return (
        <Modal
            title="Tạo Sản Phẩm Mới"
            open={isCreateOpen}
            onOk={() => formCreateProduct.submit()}
            onCancel={() => resetAndCloseModal()}
            maskClosable={false}
            okText={"TẠO"}
        >
            <Form form={formCreateProduct} onFinish={handleSubmitBtn} layout="vertical">
                <Form.Item
                    label="Mã BarCode"
                    name="barCode"
                    rules={[
                        { required: true, message: "Vui lòng nhập mã barCode!" },
                        { min: 5, message: "Mã BarCode phải có ít nhất 5 ký tự!" }
                    ]}
                >
                    <Input placeholder="Nhập mã barCode" />
                </Form.Item>
                <Form.Item
                    label="Tên Sản Phẩm"
                    name="name"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                        { min: 2, message: "Tên sản phẩm phải có ít nhất 2 ký tự!" }
                    ]}
                >
                    <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>
                <Form.Item
                    label="Mô Tả"
                    name="description"
                >
                    <Input.TextArea placeholder="Nhập mô tả sản phẩm" />
                </Form.Item>
                <Form.Item
                    label="Giá"
                    name="price"
                    rules={[
                        { required: true, message: "Vui lòng nhập giá sản phẩm!" },
                        { type: "number", min: 0, message: "Giá phải lớn hơn hoặc bằng 0!" }
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập giá sản phẩm"
                        style={{ width: "100%" }}
                        min={0}
                        addonAfter={"đ"}
                    />
                </Form.Item>
                <Form.Item
                    label="Số Lượng Đã Bán"
                    name="sold"
                    rules={[
                        { type: "number", min: 0, message: "Số lượng đã bán phải lớn hơn hoặc bằng 0!" }
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập số lượng đã bán"
                        style={{ width: "100%" }}
                        min={0}
                    />
                </Form.Item>
                <Form.Item
                    label="Số Lượng"
                    name="quantity"
                    rules={[
                        { required: true, message: "Vui lòng nhập số lượng tồn kho!" },
                        { type: "number", min: 0, message: "Số lượng phải lớn hơn hoặc bằng 0!" }
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập số lượng"
                        style={{ width: "100%" }}
                        min={0}
                    />
                </Form.Item>
                <Form.Item
                    label="Ngày Sản Xuất"
                    name="manufacturingDate"
                    rules={[{ required: true, message: "Vui lòng chọn ngày sản xuất!" }]}
                >
                    <Input
                        type="date"
                        placeholder="Chọn ngày sản xuất"
                        style={{ width: "100%" }}
                    />
                </Form.Item>
                <Form.Item
                    label="Ngày Hết Hạn"
                    name="expirationDate"
                    rules={[
                        { required: true, message: "Vui lòng chọn ngày hết hạn!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || !getFieldValue("manufacturingDate")) {
                                    return Promise.resolve();
                                }
                                if (dayjs(value).isAfter(dayjs(getFieldValue("manufacturingDate")))) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Ngày hết hạn phải sau ngày sản xuất!"));
                            },
                        }),
                    ]}
                >
                    <Input
                        type="date"
                        placeholder="Chọn ngày hết hạn"
                        style={{ width: "100%" }}
                    />
                </Form.Item>
                <Form.Item
                    label="Link Ảnh Sản Phẩm"
                    name="image"
                    rules={[{ required: true, message: "Vui lòng nhập link ảnh sản phẩm!" }]}
                >
                    <Input placeholder="Nhập link ảnh sản phẩm" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateProductUncontrolled;